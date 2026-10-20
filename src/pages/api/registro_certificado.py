"""API de certificados del Registro Civil ficticio para Vercel.

GET /api/registro_certificado?numero=RC-...
Validación por cookie session JWT de Discord y consulta de titularidad al mismo
registro_civil_actas que utiliza el bot. No acepta datos arbitrarios del cliente.
"""
from __future__ import annotations

from http.server import BaseHTTPRequestHandler
from http.cookies import SimpleCookie, CookieError
from pathlib import Path
from urllib.parse import parse_qs, urlencode, urlparse
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
import json
import os
import re
import sys

import jwt

# Importar EL MISMO crear_pdf del módulo original que aportó el usuario.
sys.path.insert(0, str(Path(__file__).resolve().parent))
import registro_civil

NUMBER_RE = re.compile(r"^[A-Za-z0-9._-]{1,128}$")
DISCORD_RE = re.compile(r"^\d{15,22}$")
VALID_TYPES = {"nacimiento", "adopcion", "matrimonio", "divorcio"}

# El módulo original del bot busca logos dentro de `src` junto a su código.
# Se recomienda copiar los logos a api/src para garantizar que viajen en el bundle.
# Como respaldo, si Vercel incluye `public`, también podemos cargarlos desde allí.
_assets = Path(__file__).resolve().parent / "src"
_public_assets = Path(__file__).resolve().parent.parent / "public"
if not (_assets / "reg.png").is_file() and (_public_assets / "reg.png").is_file():
    registro_civil.ASSETS = _public_assets


class ApiError(Exception):
    def __init__(self, status: int, message: str):
        super().__init__(message)
        self.status = status


def session_user_id(cookie_header: str) -> str:
    secret = os.environ.get("JWT_SECRET")
    if not secret:
        raise ApiError(503, "Servicio no configurado.")
    cookie = SimpleCookie()
    try:
        cookie.load(cookie_header or "")
    except CookieError:
        raise ApiError(401, "Inicia sesión con Discord.")
    session = cookie.get("session")
    if not session:
        raise ApiError(401, "Inicia sesión con Discord.")
    try:
        payload = jwt.decode(
            session.value, secret, algorithms=["HS256"],
            options={"require": ["exp"]},
        )
    except jwt.PyJWTError:
        raise ApiError(401, "Sesión no válida o caducada.")
    user_id = str(payload.get("id") or "")
    if not DISCORD_RE.fullmatch(user_id):
        raise ApiError(401, "Sesión no válida.")
    return user_id


def query_rows(table: str, filters: dict[str, str], *, select: str = "*") -> list[dict]:
    url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    service_key = os.environ.get("SUPABASE_SERVICE_KEY", "")
    if not url or not service_key or urlparse(url).scheme != "https":
        raise ApiError(503, "Base de datos no configurada.")
    # table y nombres de filtros nunca proceden del usuario (solo llamadas internas).
    qs = urlencode({"select": select, "limit": "1", **filters})
    request = Request(
        f"{url}/rest/v1/{table}?{qs}",
        headers={
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Accept": "application/json",
        },
        method="GET",
    )
    try:
        with urlopen(request, timeout=12) as response:
            raw = response.read(128 * 1024)
    except (HTTPError, URLError, TimeoutError):
        raise ApiError(502, "No se pudo consultar el Registro Civil.")
    try:
        rows = json.loads(raw)
    except (ValueError, UnicodeDecodeError):
        raise ApiError(502, "Respuesta inválida del Registro Civil.")
    if not isinstance(rows, list):
        raise ApiError(502, "Respuesta inválida del Registro Civil.")
    return rows


def authorized_acta(number: str, user_id: str) -> dict:
    linked = query_rows("verificados", {"discord_id": f"eq.{user_id}"}, select="dpi")
    if not linked or not linked[0].get("dpi"):
        raise ApiError(403, "Necesitas un DPI verificado.")
    dni = query_rows("dpis", {"dpi_number": f"eq.{linked[0]['dpi']}"}, select="dpi_number")
    if not dni:
        raise ApiError(403, "Tu DPI ya no figura en el registro.")
    conditions = {
        "numero": f"eq.{number}",
        "or": f"(discord_id_1.eq.{user_id},discord_id_2.eq.{user_id})",
    }
    guild = os.environ.get("GUILD_ID")
    if guild:
        conditions["guild_id"] = f"eq.{guild}"
    rows = query_rows("registro_civil_actas", conditions, select="numero,tipo,datos,discord_id_1,discord_id_2")
    if not rows:
        raise ApiError(404, "No se encontró un acta autorizada para tu cuenta.")
    acta = rows[0]
    if user_id not in (str(acta.get("discord_id_1")), str(acta.get("discord_id_2"))):
        raise ApiError(404, "No se encontró un acta autorizada para tu cuenta.")
    if acta.get("numero") != number or acta.get("tipo") not in VALID_TYPES:
        raise ApiError(400, "Certificado no válido.")
    if not isinstance(acta.get("datos"), dict):
        raise ApiError(502, "El asiento no contiene los datos necesarios.")
    return acta


class handler(BaseHTTPRequestHandler):
    def _json_error(self, code: int, message: str) -> None:
        body = json.dumps({"error": message}, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "private, no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        try:
            number = parse_qs(urlparse(self.path).query).get("numero", [""])[0]
            if not NUMBER_RE.fullmatch(number):
                raise ApiError(400, "Número de acta no válido.")
            viewer = session_user_id(self.headers.get("Cookie", ""))
            acta = authorized_acta(number, viewer)
            pdf = registro_civil.crear_pdf(acta["tipo"], acta["datos"], muestra=False)
            if not isinstance(pdf, bytes) or not pdf.startswith(b"%PDF-"):
                raise ApiError(502, "El generador no devolvió un PDF válido.")
            self.send_response(200)
            self.send_header("Content-Type", "application/pdf")
            self.send_header("Content-Disposition", f'attachment; filename="RegistroCivil_{acta["tipo"]}_{number}.pdf"')
            self.send_header("Content-Length", str(len(pdf)))
            self.send_header("Cache-Control", "private, no-store")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.end_headers()
            self.wfile.write(pdf)
        except ApiError as exc:
            self._json_error(exc.status, str(exc))
        except Exception:
            # No exponer los datos de registro, tokens ni trazas Python al cliente.
            self._json_error(500, "No se ha podido generar el certificado.")

    def do_POST(self) -> None:
        self._json_error(405, "Método no permitido.")
