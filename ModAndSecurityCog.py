import asyncio
import io
import logging
from collections import defaultdict, deque
import datetime
import itertools
import re
import discord
from discord import app_commands
from discord.ext import commands, tasks

log = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURACIÓN DE CONSTANTES E IDENTIFICADORES
# ─────────────────────────────────────────────────────────────────────────────
GUILD_ID = 1381359904731693056
BOT_INNERBLOOM_ID = 1533044684879040622
BOT_NEKOTINA_ID = 429457053791158281

CHANNEL_LOGS_AVISOS_ID = 1538939775233294386
CHANNEL_ANUNCIOS_ID = 1536869362621743154
CHANNEL_AUDITORIA_ID = 1538939775233294386

ROLE_ADMIN_ID = 1538934973548208239
ROLE_MOD_ID = 1525567103317573913

EMOJI_INICIO_ID = 1528349020098134076
EMOJI_FIN_ID = 1506309082322305075

_MY_GUILD = discord.Object(id=GUILD_ID)

PALABRAS_PROHIBIDAS_SEMILLA = set()

PATRONES_NSFW = re.compile(
    r"\b(hentai|nsfw|explicit|porn|porno|rule34|xxx|xvideo|nude|desnuda|desnudo)\b",
    re.IGNORECASE,
)

PATRON_INVITACION = re.compile(
    r"(discord\.gg/|discord(?:app)?\.com/invite/)\S+",
    re.IGNORECASE,
)

PATRON_ACLAMACION_INNERBLOOM = re.compile(
    r"\b(innerbloom|1533044684879040622)\b", re.IGNORECASE
)

# ─────────────────────────────────────────────────────────────────────────────
# ESTADO / PRESENCIA ROTATIVA DEL BOT
# ─────────────────────────────────────────────────────────────────────────────
INTERVALO_ROTACION_ESTADO_MINUTOS = 5

# Antispam / antirraid
VENTANA_SPAM_SEGUNDOS = 15
LIMITE_MENSAJES_SPAM = 7
LIMITE_MENCIONES_POR_MENSAJE = 6
VENTANA_RAID_SEGUNDOS = 10
UMBRAL_ENTRADAS_RAID = 8
EDAD_CUENTA_SOSPECHOSA_DIAS = 3

# Límites de Supabase
NUMERO_INICIAL_CASOS = 0


def _generar_actividades() -> list[discord.BaseActivity]:
    return [
        discord.CustomActivity(
            name="Trabajando junto a Garchomp escuchando Mírame de Al Safir"
        ),
        discord.Game(name="Pokémon Leyendas Z-A"),
        discord.CustomActivity(name="Vigilando el pan del servidor 🍞"),
    ]


class ModAndSecurityCog(commands.Cog):

    def __init__(
        self,
        bot: commands.Bot,
        config=None,
        supabase=None,
        guild_id=None,
        *args,
        **kwargs,
    ):
        self.bot = bot
        self.config = config
        self.supabase = supabase
        self.guild_id = guild_id or GUILD_ID
        self.user_messages = defaultdict(deque)
        self.user_spam_offenses = defaultdict(int)
        self.explicit_content_offenses = defaultdict(int)

        # Conjunto de IDs de cuentas hackeadas / comprometidas
        self.usuarios_hackeados: set[int] = {609430705218387979}

        self.palabras_prohibidas: set[str] = set(PALABRAS_PROHIBIDAS_SEMILLA)

        self.entradas_recientes: deque = deque()
        self._alerta_raid_activa = False

        self._ciclo_actividades = itertools.cycle(_generar_actividades())

        # ── Sistema de auditoría / casos numerados ──────────────────────────
        self._contador_casos: int = NUMERO_INICIAL_CASOS
        self._bloqueo_casos = asyncio.Lock()

        # Tareas de fondo (p. ej. borrado diferido de respuestas de Nekotina)
        # rastreadas para poder cancelarlas limpiamente al descargar el cog.
        self._tareas_fondo: set[asyncio.Task] = set()

        # Metadatos de mensajes recientes para que la auditoría sobreviva a
        # borrados muy rápidos y conserve autor, contenido y adjuntos.
        self._mensajes_recientes: dict[int, dict] = {}
        self._limite_cache_mensajes = 5000
        self._ventana_cache_mensajes = datetime.timedelta(minutes=30)

    async def cog_load(self):
        """Arranca las tareas en segundo plano y carga config persistida."""
        await self._cargar_palabras_prohibidas()
        await self._cargar_infracciones()
        await self._cargar_usuarios_hackeados()
        await self._cargar_contador_casos()
        self.rotar_estado.start()
        self.limpiar_historial_spam.start()

    async def cog_unload(self):
        self.rotar_estado.cancel()
        self.limpiar_historial_spam.cancel()
        for tarea in list(self._tareas_fondo):
            tarea.cancel()

    def _crear_tarea_fondo(self, coro):
        """Crea una tarea de fondo rastreada para poder cancelarla en cog_unload."""
        tarea = self.bot.loop.create_task(coro)
        self._tareas_fondo.add(tarea)
        tarea.add_done_callback(self._tareas_fondo.discard)
        return tarea

    # ─────────────────────────────────────────────────────────────────────────
    # PERSISTENCIA (SUPABASE)
    # ─────────────────────────────────────────────────────────────────────────
    async def _cargar_palabras_prohibidas(self):
        if not self.supabase:
            return
        try:
            respuesta = await asyncio.to_thread(
                lambda: self.supabase.table("palabras_prohibidas").select("palabra").execute()
            )
            filas = getattr(respuesta, "data", None) or []
            cargadas = {fila["palabra"].strip().lower() for fila in filas if fila.get("palabra")}
            if cargadas:
                self.palabras_prohibidas = cargadas
                log.info("Cargadas %d palabras prohibidas desde Supabase.", len(cargadas))
        except Exception as e:
            log.warning("No se pudieron cargar palabras prohibidas desde Supabase: %s", e)

    async def _guardar_palabra_prohibida(self, palabra: str):
        if not self.supabase:
            return
        try:
            await asyncio.to_thread(
                lambda: self.supabase.table("palabras_prohibidas")
                .upsert({"palabra": palabra})
                .execute()
            )
        except Exception as e:
            log.warning("No se pudo persistir la palabra prohibida '%s': %s", palabra, e)

    async def _eliminar_palabra_prohibida(self, palabra: str):
        if not self.supabase:
            return
        try:
            await asyncio.to_thread(
                lambda: self.supabase.table("palabras_prohibidas")
                .delete()
                .eq("palabra", palabra)
                .execute()
            )
        except Exception as e:
            log.warning("No se pudo eliminar la palabra prohibida '%s': %s", palabra, e)

    async def _cargar_infracciones(self):
        if not self.supabase:
            return
        try:
            respuesta = await asyncio.to_thread(
                lambda: self.supabase.table("infracciones_usuarios").select("*").execute()
            )
            filas = getattr(respuesta, "data", None) or []
            for fila in filas:
                usuario_id = int(fila["usuario_id"])
                tipo = fila.get("tipo")
                cantidad = int(fila.get("cantidad", 0))
                if tipo == "spam":
                    self.user_spam_offenses[usuario_id] = cantidad
                elif tipo == "nsfw":
                    self.explicit_content_offenses[usuario_id] = cantidad
            if filas:
                log.info("Cargadas %d infracciones desde Supabase.", len(filas))
        except Exception as e:
            log.warning("No se pudieron cargar las infracciones desde Supabase: %s", e)

    async def _guardar_infraccion(self, usuario_id: int, tipo: str, cantidad: int):
        if not self.supabase:
            return
        try:
            await asyncio.to_thread(
                lambda: self.supabase.table("infracciones_usuarios")
                .upsert(
                    {"usuario_id": usuario_id, "tipo": tipo, "cantidad": cantidad},
                    on_conflict="usuario_id,tipo",
                )
                .execute()
            )
        except Exception as e:
            log.warning(
                "No se pudo persistir la infracción (usuario=%s, tipo=%s): %s",
                usuario_id, tipo, e,
            )

    async def _eliminar_infracciones_usuario(self, usuario_id: int):
        if not self.supabase:
            return
        try:
            await asyncio.to_thread(
                lambda: self.supabase.table("infracciones_usuarios")
                .delete()
                .eq("usuario_id", usuario_id)
                .execute()
            )
        except Exception as e:
            log.warning("No se pudieron eliminar las infracciones de %s: %s", usuario_id, e)

    async def _cargar_usuarios_hackeados(self):
        if not self.supabase:
            return
        try:
            respuesta = await asyncio.to_thread(
                lambda: self.supabase.table("cuentas_hackeadas").select("usuario_id").execute()
            )
            filas = getattr(respuesta, "data", None) or []
            cargados = {int(fila["usuario_id"]) for fila in filas if fila.get("usuario_id")}
            if cargados:
                self.usuarios_hackeados.update(cargados)
                log.info("Cargadas %d cuentas hackeadas desde Supabase.", len(cargados))
        except Exception as e:
            log.warning("No se pudieron cargar cuentas hackeadas desde Supabase: %s", e)

    async def _guardar_usuario_hackeado(self, usuario_id: int):
        if not self.supabase:
            return
        try:
            await asyncio.to_thread(
                lambda: self.supabase.table("cuentas_hackeadas")
                .upsert({"usuario_id": usuario_id})
                .execute()
            )
        except Exception as e:
            log.warning("No se pudo guardar usuario hackeado %s en Supabase: %s", usuario_id, e)

    # ─────────────────────────────────────────────────────────────────────────
    # SISTEMA DE CASOS DE AUDITORÍA
    # ─────────────────────────────────────────────────────────────────────────
    # Requiere (opcionalmente) una tabla en Supabase:
    #
    #   create table casos_auditoria (
    #       numero_caso integer primary key,
    #       tipo text not null,
    #       usuario_id bigint,
    #       moderador_id bigint,
    #       motivo text,
    #       detalles text,
    #       creado_en timestamptz not null default now()
    #   );
    #
    # Si no existe Supabase o la tabla, el bot sigue funcionando con una
    # numeración de casos únicamente en memoria (se reinicia al reiniciar el
    # proceso), por lo que esto nunca bloquea la moderación.
    async def _cargar_contador_casos(self):
        if not self.supabase:
            return
        try:
            respuesta = await asyncio.to_thread(
                lambda: self.supabase.table("casos_auditoria")
                .select("numero_caso")
                .order("numero_caso", desc=True)
                .limit(1)
                .execute()
            )
            filas = getattr(respuesta, "data", None) or []
            if filas:
                self._contador_casos = int(filas[0]["numero_caso"])
                log.info("Contador de casos de auditoría restaurado en #%d.", self._contador_casos)
        except Exception as e:
            log.warning("No se pudo cargar el contador de casos de auditoría: %s", e)

    async def _registrar_caso(
        self,
        tipo: str,
        motivo: str = None,
        usuario_id: int = None,
        moderador_id: int = None,
        detalles: str = None,
    ) -> int:
        """Genera un número de caso único y lo persiste (si hay Supabase).

        Devuelve siempre un número de caso, incluso si la persistencia falla,
        para que el resto del sistema de auditoría nunca se bloquee por un
        fallo de base de datos.
        """
        async with self._bloqueo_casos:
            self._contador_casos += 1
            numero = self._contador_casos

        if self.supabase:
            try:
                await asyncio.to_thread(
                    lambda: self.supabase.table("casos_auditoria")
                    .insert(
                        {
                            "numero_caso": numero,
                            "tipo": tipo,
                            "usuario_id": usuario_id,
                            "moderador_id": moderador_id,
                            "motivo": motivo,
                            "detalles": detalles,
                        }
                    )
                    .execute()
                )
            except Exception as e:
                log.warning("No se pudo persistir el caso #%d ('%s') en Supabase: %s", numero, tipo, e)

        return numero

    # ─────────────────────────────────────────────────────────────────────────
    # TAREAS EN SEGUNDO PLANO
    # ─────────────────────────────────────────────────────────────────────────
    @tasks.loop(minutes=INTERVALO_ROTACION_ESTADO_MINUTOS)
    async def rotar_estado(self):
        try:
            actividad = next(self._ciclo_actividades)
            await self.bot.change_presence(activity=actividad)
        except Exception as e:
            log.warning("No se pudo actualizar la presencia del bot: %s", e)

    @rotar_estado.before_loop
    async def before_rotar_estado(self):
        await self.bot.wait_until_ready()

    @tasks.loop(minutes=30)
    async def limpiar_historial_spam(self):
        ahora = datetime.datetime.now(datetime.timezone.utc)
        vacios = []
        for user_id, historial in self.user_messages.items():
            while historial and (ahora - historial[0]).total_seconds() > VENTANA_SPAM_SEGUNDOS:
                historial.popleft()
            if not historial:
                vacios.append(user_id)
        for user_id in vacios:
            del self.user_messages[user_id]

        caducados = [
            message_id
            for message_id, snapshot in self._mensajes_recientes.items()
            if ahora - snapshot["creado_en"] > self._ventana_cache_mensajes
        ]
        for message_id in caducados:
            self._mensajes_recientes.pop(message_id, None)

        while self.entradas_recientes and (
            ahora - self.entradas_recientes[0]
        ).total_seconds() > VENTANA_RAID_SEGUNDOS:
            self.entradas_recientes.popleft()

    @limpiar_historial_spam.before_loop
    async def before_limpiar_historial_spam(self):
        await self.bot.wait_until_ready()

    # ─────────────────────────────────────────────────────────────────────────
    # UTILIDADES
    # ─────────────────────────────────────────────────────────────────────────
    def _es_staff(self, member: discord.Member) -> bool:
        if not isinstance(member, discord.Member):
            return False
        if member.guild_permissions.administrator:
            return True
        return any(r.id in (ROLE_ADMIN_ID, ROLE_MOD_ID) for r in member.roles)

    @staticmethod
    def _truncar(texto, limite: int = 1024) -> str:
        """Recorta un texto de forma segura para respetar los límites de Discord."""
        if texto is None:
            return "*[vacío]*"
        texto = str(texto)
        if not texto:
            return "*[vacío]*"
        if len(texto) <= limite:
            return texto
        return texto[: max(limite - 1, 0)].rstrip() + "…"

    def _guardar_snapshot_mensaje(self, message: discord.Message):
        """Guarda una copia ligera antes de que el mensaje pueda desaparecer."""
        if not message.guild or message.guild.id != self.guild_id:
            return
        self._mensajes_recientes[message.id] = {
            "creado_en": discord.utils.utcnow(),
            "autor": message.author,
            "autor_id": getattr(message.author, "id", None),
            "autor_nombre": str(message.author) if message.author else "Desconocido",
            "canal_id": getattr(message.channel, "id", None),
            "canal_nombre": getattr(message.channel, "name", "desconocido"),
            "contenido": message.content or "",
            "url": getattr(message, "jump_url", ""),
            "adjuntos": [
                {"filename": a.filename, "url": a.url, "content_type": a.content_type}
                for a in message.attachments
            ],
        }
        if len(self._mensajes_recientes) > self._limite_cache_mensajes:
            mas_antiguo = min(self._mensajes_recientes, key=lambda key: self._mensajes_recientes[key]["creado_en"])
            self._mensajes_recientes.pop(mas_antiguo, None)

    async def _obtener_autor_borrado(self, guild: discord.Guild, message: discord.Message):
        """Intenta identificar al responsable mediante los logs de auditoría de Discord."""
        try:
            ahora = discord.utils.utcnow()
            async for entrada in guild.audit_logs(limit=8, action=discord.AuditLogAction.message_delete):
                if ahora - entrada.created_at > datetime.timedelta(seconds=12):
                    break
                objetivo = getattr(entrada, "target", None)
                extra = getattr(entrada, "extra", None)
                canal_id = getattr(getattr(extra, "channel", None), "id", None)
                if getattr(objetivo, "id", None) == getattr(message.author, "id", None) and (
                    canal_id is None or canal_id == getattr(message.channel, "id", None)
                ):
                    return entrada.user
        except (discord.Forbidden, discord.HTTPException, discord.NotFound):
            pass
        except Exception as exc:
            log.debug("No se pudo identificar quién borró el mensaje %s: %s", message.id, exc)
        return None

    async def _auditar_mensaje_eliminado(self, message: discord.Message, responsable=None, tipo="mensaje_eliminado"):
        """Registra un mensaje eliminado con autor, responsable, canal y contenido."""
        snapshot = self._mensajes_recientes.pop(message.id, None) or {}
        contenido = message.content or snapshot.get("contenido", "") or "*[Sin contenido de texto / solo archivo o embed]*"
        autor = message.author or snapshot.get("autor")
        autor_id = getattr(autor, "id", None) or snapshot.get("autor_id")
        autor_nombre = str(autor) if autor else snapshot.get("autor_nombre", "Desconocido")
        canal = message.channel
        canal_id = getattr(canal, "id", None) or snapshot.get("canal_id")
        canal_nombre = getattr(canal, "name", None) or snapshot.get("canal_nombre", "desconocido")
        responsable_texto = f"{responsable} (`{responsable.id}`)" if responsable else "Sistema automático / responsable no identificable"
        campos = [
            ("Autor del mensaje", f"{autor_nombre} (`{autor_id or 'desconocido'}`)"),
            ("Quién lo ha borrado", responsable_texto),
            ("Canal", f"#{canal_nombre} (`{canal_id or 'desconocido'}`)"),
            ("ID del mensaje", str(message.id)),
            ("Contenido", contenido),
        ]
        adjuntos = message.attachments or []
        if not adjuntos and snapshot.get("adjuntos"):
            campos.append(("Adjuntos", "\n".join(f"[{a['filename']}]({a['url']})" for a in snapshot["adjuntos"])))
        elif adjuntos:
            campos.append(("Adjuntos", "\n".join(f"[{a.filename}]({a.url})" for a in adjuntos)))
        caso = await self._registrar_caso(
            tipo=tipo, motivo="Eliminación de mensaje", usuario_id=autor_id,
            moderador_id=getattr(responsable, "id", None),
            detalles=f"mensaje_id={message.id}; canal_id={canal_id}; contenido={contenido[:500]}",
        )
        enlace = snapshot.get("url") or getattr(message, "jump_url", "")
        descripcion = f"Se eliminó un mensaje en <#{canal_id}>."
        if enlace:
            descripcion += f" [Abrir mensaje original]({enlace})"
        await self.auditar_accion(
            guild=message.guild, titulo="🗑️ Mensaje Eliminado", descripcion=descripcion,
            color=discord.Color.orange(), campos=campos,
            mensaje_texto=f"Mensaje de {autor.mention if autor else autor_nombre}; eliminado por {responsable.mention if responsable else 'el sistema o un moderador no identificable'}. Caso #{caso}",
            usuario_afectado=autor, moderador=responsable, caso_numero=caso,
        )

    # ─────────────────────────────────────────────────────────────────────────
    # SISTEMA DE AUDITORÍA Y NOTIFICACIONES
    # ─────────────────────────────────────────────────────────────────────────
    async def auditar_accion(
        self,
        guild: discord.Guild,
        titulo: str,
        descripcion: str,
        color: discord.Color = discord.Color.blue(),
        mencionar_admins: bool = False,
        campos: list = None,
        mensaje_texto: str = None,
        image_url: str = None,
        archivos: list[discord.File] = None,
        usuario_afectado: discord.User | discord.Member = None,
        moderador: discord.User | discord.Member = None,
        caso_numero: int = None,
    ) -> discord.Message | None:
        """Envía un embed de auditoría enriquecido al canal de auditoría.

        Mejoras frente a la versión original:
        - Resiliente a fallos de caché: si `get_channel` falla, intenta
          `fetch_channel` antes de rendirse, y registra el error si el canal
          sigue sin encontrarse (antes fallaba en silencio).
        - Trunca de forma segura título, descripción y campos para nunca
          superar los límites de la API de Discord (evita `HTTPException`).
        - Añade miniatura con el avatar del usuario afectado, autor del
          embed (moderador o "Sistema Automático") y pie con el número de
          caso, para tener trazabilidad clara de quién hizo qué y cuándo.
        - Soporta adjuntar archivos reales (p. ej. imágenes de mensajes
          borrados) en vez de depender únicamente de URLs de Discord que
          pueden caducar.
        - Devuelve el mensaje enviado por si el llamante quiere enlazarlo
          (p. ej. guardar el jump_url en el caso).
        """
        canal_audit = guild.get_channel(CHANNEL_AUDITORIA_ID)
        if canal_audit is None:
            try:
                canal_audit = await guild.fetch_channel(CHANNEL_AUDITORIA_ID)
            except (discord.NotFound, discord.Forbidden, discord.HTTPException) as e:
                log.error(
                    "No se pudo obtener el canal de auditoría (%s): %s",
                    CHANNEL_AUDITORIA_ID, e,
                )
                return None

        if not isinstance(canal_audit, discord.TextChannel):
            log.error("El canal de auditoría configurado (%s) no es un canal de texto válido.", CHANNEL_AUDITORIA_ID)
            return None

        embed = discord.Embed(
            title=self._truncar(titulo, 256),
            description=self._truncar(descripcion, 4000),
            color=color,
            timestamp=datetime.datetime.now(datetime.timezone.utc),
        )

        if campos:
            for nombre, valor in campos[:25]:
                embed.add_field(
                    name=self._truncar(nombre, 256),
                    value=self._truncar(valor, 1024),
                    inline=False,
                )

        if usuario_afectado is not None:
            try:
                embed.set_thumbnail(url=usuario_afectado.display_avatar.url)
            except Exception:
                pass

        if moderador is not None:
            try:
                embed.set_author(
                    name=f"Ejecutado por {moderador.display_name}",
                    icon_url=moderador.display_avatar.url,
                )
            except Exception:
                embed.set_author(name=f"Ejecutado por {moderador}")
        else:
            embed.set_author(name="🤖 Sistema Automático de Moderación")

        embed.set_footer(
            text=f"Caso #{caso_numero}" if caso_numero is not None else "Sin número de caso asignado"
        )

        if image_url:
            embed.set_image(url=image_url)

        partes_texto = []
        if mencionar_admins:
            partes_texto.append(f"<@&{ROLE_ADMIN_ID}>")
        if mensaje_texto:
            partes_texto.append(mensaje_texto)

        contenido = "\n".join(partes_texto) if partes_texto else None

        kwargs = {
            "content": contenido,
            "embed": embed,
            "allowed_mentions": discord.AllowedMentions(roles=mencionar_admins, users=False, everyone=False),
        }
        if archivos:
            kwargs["files"] = archivos

        try:
            return await canal_audit.send(**kwargs)
        except discord.HTTPException as e:
            log.error("No se pudo enviar el log de auditoría (caso #%s): %s", caso_numero, e)
            return None

    async def notificar_policia(
        self,
        guild: discord.Guild,
        accion: str,
        usuario: discord.User | discord.Member,
        motivo: str,
        caso_numero: int = None,
    ):
        canal_anuncios = guild.get_channel(CHANNEL_ANUNCIOS_ID)
        if canal_anuncios and isinstance(canal_anuncios, discord.TextChannel):
            emoji_inicio = self.bot.get_emoji(EMOJI_INICIO_ID) or "🚨"
            emoji_fin = self.bot.get_emoji(EMOJI_FIN_ID) or "🚔"

            nombre_usuario = f"**{usuario.display_name}** (`{usuario.name}`)"
            mensaje = (
                f"{emoji_inicio} LA POLICÍA NACIONAL DEL PAN Y LA GUARDIA PANADERA "
                f"HAN TOMADO LA DECISIÓN DE {accion.upper()} A {nombre_usuario} por {motivo}. "
                f"Se tomarán las medidas cautelares previstas {emoji_fin}"
            )
            if caso_numero is not None:
                mensaje += f"\n-# Caso #{caso_numero}"
            try:
                await canal_anuncios.send(
                    mensaje, allowed_mentions=discord.AllowedMentions.none()
                )
            except discord.HTTPException as e:
                log.error("No se pudo publicar el anuncio: %s", e)

    async def enviar_alerta_seguridad(
        self, guild: discord.Guild, detalle_alerta: str, caso_numero: int = None
    ):
        canal_logs = guild.get_channel(CHANNEL_LOGS_AVISOS_ID)
        if canal_logs and isinstance(canal_logs, discord.TextChannel):
            alerta_msg = (
                f"⚠️ <@&{ROLE_ADMIN_ID}> <@&{ROLE_MOD_ID}> **ALERTA DE SEGURIDAD DETECTADA**\n"
                f"**Detalle:** {detalle_alerta}"
            )
            if caso_numero is not None:
                alerta_msg += f"\n-# Caso #{caso_numero}"
            try:
                await canal_logs.send(alerta_msg)
            except discord.HTTPException as e:
                log.error("No se pudo enviar la alerta de seguridad: %s", e)

    async def banear_con_notificacion_dm(
        self,
        guild: discord.Guild,
        usuario: discord.Member | discord.User,
        motivo: str,
        moderador: discord.Member | discord.User = None,
    ) -> int:
        asunto_email = f"BANEO USER: {usuario.name} ({usuario.id})"
        mensaje_dm = (
            f"🚫 **Has sido baneado del servidor {guild.name}.**\n\n"
            f"**Motivo:** {motivo}\n\n"
            f"Si consideras que esto ha sido un error o deseas reclamar el baneo, envía un correo electrónico a:\n"
            f"📧 **gobiernopaniese@protonmail.com**\n"
            f"**ASUNTO:** `{asunto_email}`"
        )

        dm_enviado = True
        try:
            await usuario.send(mensaje_dm)
        except (discord.Forbidden, discord.HTTPException):
            dm_enviado = False

        await guild.ban(usuario, reason=motivo)

        caso = await self._registrar_caso(
            tipo="baneo",
            motivo=motivo,
            usuario_id=usuario.id,
            moderador_id=moderador.id if moderador else None,
        )

        await self.notificar_policia(guild, "Banear", usuario, motivo, caso_numero=caso)

        if moderador:
            msg_superior = f"MODERADOR HA BANEADO A {usuario.mention} POR {motivo.upper()}"
        else:
            msg_superior = f"USUARIO {usuario.mention} ha sido baneado"

        await self.auditar_accion(
            guild=guild,
            titulo="🔨 Usuario Baneado",
            descripcion=f"El usuario **{usuario.name}** (`{usuario.id}`) ha sido baneado.",
            color=discord.Color.red(),
            campos=[
                ("Motivo", motivo),
                ("Notificación por DM", "✅ Enviada" if dm_enviado else "⚠️ No se pudo enviar (DMs cerrados)"),
            ],
            mensaje_texto=msg_superior,
            usuario_afectado=usuario,
            moderador=moderador,
            caso_numero=caso,
        )
        return caso

    # ─────────────────────────────────────────────────────────────────────────
    # AUDITORÍA DE EVENTOS DEL SERVIDOR
    # ─────────────────────────────────────────────────────────────────────────
    @commands.Cog.listener()
    async def on_message_delete(self, message: discord.Message):
        if not message.guild or message.guild.id != self.guild_id:
            return
        responsable = await self._obtener_autor_borrado(message.guild, message)
        await self._auditar_mensaje_eliminado(message, responsable)

    @commands.Cog.listener()
    async def on_bulk_message_delete(self, messages: list[discord.Message]):
        """Audita purgas con un transcript adjunto para no perder ningún contenido."""
        if not messages:
            return
        guild = next((m.guild for m in messages if m.guild and m.guild.id == self.guild_id), None)
        if guild is None:
            return
        responsable = await self._obtener_autor_borrado(guild, messages[0])
        lineas, autores, canales = [], set(), set()
        for message in messages:
            snapshot = self._mensajes_recientes.pop(message.id, None) or {}
            contenido = message.content or snapshot.get("contenido", "") or "*[sin texto]*"
            autor = message.author or snapshot.get("autor")
            autor_id = getattr(autor, "id", None) or snapshot.get("autor_id", "desconocido")
            canal_id = getattr(message.channel, "id", None) or snapshot.get("canal_id", "desconocido")
            autores.add(str(autor_id)); canales.add(str(canal_id))
            lineas.append(f"Mensaje {message.id} | autor={autor_id} | canal={canal_id}\n{contenido}\n")
        caso = await self._registrar_caso(
            tipo="mensajes_purgados", motivo="Eliminación masiva de mensajes",
            moderador_id=getattr(responsable, "id", None),
            detalles=f"cantidad={len(messages)}; autores={','.join(sorted(autores))}; canales={','.join(sorted(canales))}",
        )
        await self.auditar_accion(
            guild=guild, titulo=f"🗑️ Purga de {len(messages)} mensajes",
            descripcion="Se han eliminado varios mensajes. El contenido completo se conserva en el transcript adjunto.",
            color=discord.Color.orange(),
            campos=[
                ("Cantidad", str(len(messages))),
                ("Quién lo ha borrado", f"{responsable} (`{responsable.id}`)" if responsable else "Sistema automático / no identificable"),
                ("Autores afectados", str(len(autores))), ("Canales afectados", str(len(canales))),
            ],
            archivos=[discord.File(io.BytesIO("\n".join(lineas).encode("utf-8", errors="replace")), filename=f"purga-caso-{caso}.txt")],
            moderador=responsable, caso_numero=caso,
        )

    @commands.Cog.listener()
    async def on_message_edit(self, before: discord.Message, after: discord.Message):
        if not after.guild or after.guild.id != self.guild_id:
            return
        if after.author.bot:
            return
        if before.content == after.content:
            return

        caso = await self._registrar_caso(
            tipo="mensaje_editado",
            motivo="Edición de mensaje",
            usuario_id=after.author.id,
        )

        await self.auditar_accion(
            guild=after.guild,
            titulo="✏️ Mensaje Editado",
            descripcion=(
                f"{after.author.mention} editó un mensaje en {after.channel.mention}.\n"
                f"[Ir al mensaje]({after.jump_url})"
            ),
            color=discord.Color.blurple(),
            campos=[
                ("Antes", before.content or "*[vacío]*"),
                ("Después", after.content or "*[vacío]*"),
            ],
            usuario_afectado=after.author,
            caso_numero=caso,
        )

    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member):
        if member.guild.id != self.guild_id:
            return

        if member.id in self.usuarios_hackeados:
            motivo = "Cuenta hackeada detectada al unirse al servidor."
            caso = await self.banear_con_notificacion_dm(
                guild=member.guild,
                usuario=member,
                motivo=motivo,
            )
            await self.enviar_alerta_seguridad(
                member.guild,
                f"Se detectó la entrada del usuario con cuenta comprometida **{member.name}** (`{member.id}`). Baneado automáticamente.",
                caso_numero=caso,
            )
            return

        ahora = datetime.datetime.now(datetime.timezone.utc)
        edad_cuenta = ahora - member.created_at
        cuenta_sospechosa = edad_cuenta < datetime.timedelta(days=EDAD_CUENTA_SOSPECHOSA_DIAS)

        await self.auditar_accion(
            guild=member.guild,
            titulo="📥 Nuevo Miembro" + (" ⚠️" if cuenta_sospechosa else ""),
            descripcion=f"{member.mention} (`{member.id}`) se ha unido al servidor.",
            color=discord.Color.green() if not cuenta_sospechosa else discord.Color.gold(),
            campos=[
                ("Cuenta creada", discord.utils.format_dt(member.created_at, style="R")),
            ],
            usuario_afectado=member,
        )

        if cuenta_sospechosa:
            await self.enviar_alerta_seguridad(
                member.guild,
                f"{member.mention} se unió con una cuenta creada hace menos de "
                f"{EDAD_CUENTA_SOSPECHOSA_DIAS} días ({discord.utils.format_dt(member.created_at, style='R')}).",
            )

        self.entradas_recientes.append(ahora)
        while self.entradas_recientes and (
            ahora - self.entradas_recientes[0]
        ).total_seconds() > VENTANA_RAID_SEGUNDOS:
            self.entradas_recientes.popleft()

        if len(self.entradas_recientes) >= UMBRAL_ENTRADAS_RAID:
            if not self._alerta_raid_activa:
                self._alerta_raid_activa = True
                await self.enviar_alerta_seguridad(
                    member.guild,
                    f"🚨 Posible RAID detectado: {len(self.entradas_recientes)} entradas en "
                    f"menos de {VENTANA_RAID_SEGUNDOS} segundos. Se recomienda revisar "
                    f"activar el modo de verificación alto temporalmente.",
                )
        else:
            self._alerta_raid_activa = False

    @commands.Cog.listener()
    async def on_member_remove(self, member: discord.Member):
        if member.guild.id != self.guild_id:
            return

        tiempo_en_server = "Desconocido"
        if member.joined_at:
            delta = datetime.datetime.now(datetime.timezone.utc) - member.joined_at
            tiempo_en_server = f"{delta.days} día(s)"

        await self.auditar_accion(
            guild=member.guild,
            titulo="📤 Miembro Salió / Expulsado",
            descripcion=f"**{member.name}** (`{member.id}`) ha abandonado el servidor.",
            color=discord.Color.dark_grey(),
            campos=[("Tiempo en el servidor", tiempo_en_server)],
            usuario_afectado=member,
        )

    @commands.Cog.listener()
    async def on_member_ban(self, guild: discord.Guild, user: discord.User | discord.Member):
        if guild.id != self.guild_id:
            return

        msg_superior = f"USUARIO {user.mention} ha sido baneado"

        await self.auditar_accion(
            guild=guild,
            titulo="🚫 Usuario Baneado",
            descripcion=f"El usuario **{user.name}** (`{user.id}`) fue baneado del servidor.",
            color=discord.Color.dark_red(),
            mensaje_texto=msg_superior,
            usuario_afectado=user,
        )

    @commands.Cog.listener()
    async def on_member_unban(self, guild: discord.Guild, user: discord.User):
        if guild.id != self.guild_id:
            return
        await self.auditar_accion(
            guild=guild,
            titulo="🔓 Usuario Desbaneado",
            descripcion=f"El usuario **{user.name}** (`{user.id}`) fue desbaneado del servidor.",
            color=discord.Color.green(),
            usuario_afectado=user,
        )

    @commands.Cog.listener()
    async def on_member_update(self, before: discord.Member, after: discord.Member):
        if before.guild.id != self.guild_id:
            return

        if before.timed_out_until != after.timed_out_until:
            if after.timed_out_until and after.timed_out_until > datetime.datetime.now(datetime.timezone.utc):
                hasta = after.timed_out_until.strftime("%Y-%m-%d %H:%M:%S UTC")
                await self.auditar_accion(
                    guild=after.guild,
                    titulo="🔇 Usuario Silenciado (Timeout)",
                    descripcion=f"**{after.name}** (`{after.id}`) ha sido silenciado hasta `{hasta}`.",
                    color=discord.Color.gold(),
                    usuario_afectado=after,
                )
            elif before.timed_out_until and not after.timed_out_until:
                await self.auditar_accion(
                    guild=after.guild,
                    titulo="🔊 Silencio Retirado",
                    descripcion=f"Se le ha retirado el aislamiento a **{after.name}** (`{after.id}`).",
                    color=discord.Color.blue(),
                    usuario_afectado=after,
                )

    # ─────────────────────────────────────────────────────────────────────────
    # LISTENERS Y MODERACIÓN AUTOMÁTICA
    # ─────────────────────────────────────────────────────────────────────────
    @commands.Cog.listener()
    async def on_message(self, message: discord.Message):
        if not message.guild or message.guild.id != self.guild_id:
            return

        self._guardar_snapshot_mensaje(message)
        guild = message.guild
        author = message.author

        if self.bot.user and author.id == self.bot.user.id:
            return

        # ── 0. Usuario Hackeado ──────────────────────────────────────────────
        if author.id in self.usuarios_hackeados:
            try:
                await message.delete()
            except discord.HTTPException:
                pass

            motivo = "Cuenta hackeada detectada."
            caso = await self.banear_con_notificacion_dm(
                guild=guild,
                usuario=author,
                motivo=motivo,
            )
            await self.enviar_alerta_seguridad(
                guild,
                f"Se detectó actividad del usuario con cuenta comprometida **{author.name}** (`{author.id}`). Baneado y mensaje eliminado.",
                caso_numero=caso,
            )
            return

        # ── 1. Innerbloom ────────────────────────────────────────────────────
        if author.id == BOT_INNERBLOOM_ID:
            try:
                await message.delete()
                if isinstance(message.channel, discord.TextChannel):
                    def check_bot(m):
                        return m.author.id == BOT_INNERBLOOM_ID
                    await message.channel.purge(limit=100, check=check_bot)

                await self.banear_con_notificacion_dm(
                    guild=guild,
                    usuario=author,
                    motivo="Bot malicioso detectado (Innerbloom). Ban e higienización automática.",
                )
                await self.enviar_alerta_seguridad(
                    guild,
                    f"Se detectó actividad del bot **Innerbloom** (`{BOT_INNERBLOOM_ID}`). Baneado y purgado.",
                )
            except discord.Forbidden:
                await self.enviar_alerta_seguridad(
                    guild,
                    "⚠️ **FALLO DE PERMISOS**: Se detectó al bot Innerbloom pero faltan permisos para eliminar mensajes o banear.",
                )
            except Exception as e:
                log.error("Error procesando Innerbloom: %s", e)
            return

        # ── 2. Detección NSFW en BOTS ──────────────────────────────────────────
        if author.bot:
            contenido_evaluar = message.content.lower()
            for embed in message.embeds:
                if embed.title:
                    contenido_evaluar += f" {embed.title.lower()}"
                if embed.description:
                    contenido_evaluar += f" {embed.description.lower()}"

            if PATRONES_NSFW.search(contenido_evaluar):
                try:
                    await message.delete()
                except discord.HTTPException:
                    pass

                self.explicit_content_offenses[author.id] += 1
                reincidencia = self.explicit_content_offenses[author.id]
                await self._guardar_infraccion(author.id, "nsfw", reincidencia)

                if reincidencia == 1:
                    motivo = "Envío de contenido explícito / NSFW prohibido"
                    caso = await self._registrar_caso(
                        tipo="nsfw_bot", motivo=motivo, usuario_id=author.id
                    )
                    try:
                        if isinstance(author, discord.Member):
                            await author.timeout(
                                datetime.timedelta(hours=5), reason=motivo
                            )
                        await self.notificar_policia(
                            guild, "Silenciar (5 horas)", author, motivo, caso_numero=caso
                        )
                        await self.auditar_accion(
                            guild=guild,
                            titulo="🔞 Contenido NSFW Detectado (Bot)",
                            descripcion=f"**{author.name}** (`{author.id}`) envió contenido explícito y fue silenciado 5 horas.",
                            color=discord.Color.red(),
                            usuario_afectado=author,
                            caso_numero=caso,
                        )
                    except discord.Forbidden:
                        pass
                else:
                    motivo = "Reincidencia en envío de contenido explícito / NSFW"
                    await self.banear_con_notificacion_dm(guild=guild, usuario=author, motivo=motivo)
            return

        es_staff = self._es_staff(author) if isinstance(author, discord.Member) else False

        # ── 3. Control de Palabras Prohibidas y Comandos Nekotina ──────────────
        contenido_limpio = message.content.strip().lower()

        contiene_palabra_prohibida = not es_staff and any(
            re.search(rf"\b{re.escape(palabra)}\b", contenido_limpio)
            for palabra in self.palabras_prohibidas
            if palabra
        )

        if contiene_palabra_prohibida:
            tiene_neko = "neko" in contenido_limpio or contenido_limpio.startswith("nk") or contenido_limpio.startswith("!")

            horas = 5 if tiene_neko else 1
            motivo = (
                "Uso prohibido de comandos de Nekotina"
                if tiene_neko
                else "Uso de palabras prohibidas/NSFW en el chat"
            )

            try:
                await message.delete()
            except discord.HTTPException:
                pass

            caso = await self._registrar_caso(
                tipo="nekotina" if tiene_neko else "palabra_prohibida",
                motivo=motivo,
                usuario_id=author.id,
                detalles=message.content[:500],
            )

            try:
                if isinstance(author, discord.Member):
                    await author.timeout(
                        datetime.timedelta(hours=horas), reason=motivo
                    )
                    await self.notificar_policia(
                        guild, f"Silenciar ({horas} horas)", author, motivo, caso_numero=caso
                    )
                    await self.auditar_accion(
                        guild=guild,
                        titulo="⚠️ Palabra Prohibida / Nekotina Detectada",
                        descripcion=f"El usuario **{author.name}** (`{author.id}`) usó contenido prohibido y fue silenciado por **{horas} hora(s)**.",
                        color=discord.Color.red(),
                        campos=[("Mensaje", message.content), ("Motivo", motivo)],
                        usuario_afectado=author,
                        caso_numero=caso,
                    )
            except discord.Forbidden:
                await self.enviar_alerta_seguridad(
                    guild,
                    f"Permisos insuficientes para silenciar a {author.mention}.",
                    caso_numero=caso,
                )

            if tiene_neko:
                async def borrar_respuesta_nekotina():
                    await asyncio.sleep(1.5)
                    async for msg in message.channel.history(limit=5):
                        if msg.author.id == BOT_NEKOTINA_ID:
                            try:
                                await msg.delete()
                                break
                            except discord.HTTPException:
                                pass

                self._crear_tarea_fondo(borrar_respuesta_nekotina())
            return

        # ── 4. Aclamar a Innerbloom ───────────────────────────────────────────
        if PATRON_ACLAMACION_INNERBLOOM.search(message.content):
            try:
                await message.delete()
            except discord.HTTPException:
                pass

            motivo = "Aclamar o mencionar al bot prohibido Innerbloom."
            duracion = datetime.timedelta(days=28)
            caso = await self._registrar_caso(
                tipo="aclamacion_innerbloom", motivo=motivo, usuario_id=author.id
            )
            try:
                if isinstance(author, discord.Member):
                    await author.timeout(duracion, reason=motivo)
                    await self.notificar_policia(
                        guild,
                        "Silenciar",
                        author,
                        "aclamar e invocar al bot prohibido Innerbloom",
                        caso_numero=caso,
                    )
                    await self.auditar_accion(
                        guild=guild,
                        titulo="🚨 Aclamación de Innerbloom Detectada",
                        descripcion=f"**{author.name}** (`{author.id}`) mencionó o aclamó al bot prohibido y fue silenciado 28 días.",
                        color=discord.Color.dark_red(),
                        campos=[("Mensaje", message.content)],
                        usuario_afectado=author,
                        caso_numero=caso,
                    )
            except discord.Forbidden:
                await self.enviar_alerta_seguridad(
                    guild,
                    f"Permisos insuficientes para silenciar a {author.mention} por aclamar a Innerbloom.",
                    caso_numero=caso,
                )
            return

        # ── 5. Enlaces de invitación no autorizados ────────────────────────────
        if not es_staff and PATRON_INVITACION.search(message.content):
            try:
                await message.delete()
            except discord.HTTPException:
                pass

            motivo = "Publicación de enlace de invitación de Discord no autorizado"
            caso = await self._registrar_caso(
                tipo="enlace_invitacion", motivo=motivo, usuario_id=author.id,
                detalles=message.content[:500],
            )
            try:
                if isinstance(author, discord.Member):
                    await author.timeout(datetime.timedelta(hours=1), reason=motivo)
                    await self.notificar_policia(
                        guild, "Silenciar (1 hora)", author, motivo, caso_numero=caso
                    )
                    await self.auditar_accion(
                        guild=guild,
                        titulo="🔗 Enlace de Invitación Detectado",
                        descripcion=f"**{author.name}** (`{author.id}`) publicó un enlace de invitación y fue silenciado.",
                        color=discord.Color.red(),
                        campos=[("Mensaje", message.content)],
                        usuario_afectado=author,
                        caso_numero=caso,
                    )
            except discord.Forbidden:
                await self.enviar_alerta_seguridad(
                    guild, f"Permisos insuficientes para silenciar a {author.mention} por publicidad.",
                    caso_numero=caso,
                )
            return

        # ── 6. Menciones masivas ──────────────────────────────────────────────
        total_menciones = len(message.mentions) + len(message.role_mentions)
        if not es_staff and total_menciones >= LIMITE_MENCIONES_POR_MENSAJE:
            try:
                await message.delete()
            except discord.HTTPException:
                pass

            motivo = f"Mención masiva ({total_menciones} menciones en un solo mensaje)"
            caso = await self._registrar_caso(
                tipo="mencion_masiva", motivo=motivo, usuario_id=author.id
            )
            try:
                if isinstance(author, discord.Member):
                    await author.timeout(datetime.timedelta(hours=2), reason=motivo)
                    await self.notificar_policia(
                        guild, "Silenciar (2 horas)", author, motivo, caso_numero=caso
                    )
                    await self.auditar_accion(
                        guild=guild,
                        titulo="📢 Mención Masiva Detectada",
                        descripcion=f"**{author.name}** (`{author.id}`) envió un mensaje con {total_menciones} menciones.",
                        color=discord.Color.red(),
                        usuario_afectado=author,
                        caso_numero=caso,
                    )
            except discord.Forbidden:
                await self.enviar_alerta_seguridad(
                    guild, f"Permisos insuficientes para silenciar a {author.mention} por menciones masivas.",
                    caso_numero=caso,
                )
            return

        # ── 7. Anti-Spam por Volumen ──────────────────────────────────────────
        if es_staff:
            return

        ahora = datetime.datetime.now(datetime.timezone.utc)

        historial = self.user_messages[author.id]
        historial.append(ahora)

        while historial and (ahora - historial[0]).total_seconds() > VENTANA_SPAM_SEGUNDOS:
            historial.popleft()

        if len(historial) > LIMITE_MENSAJES_SPAM and isinstance(author, discord.Member):
            historial.clear()
            self.user_spam_offenses[author.id] += 1
            reincidencia = self.user_spam_offenses[author.id]
            await self._guardar_infraccion(author.id, "spam", reincidencia)

            if reincidencia == 1:
                duracion = datetime.timedelta(hours=1)
                motivo = f"Spam masivo (más de {LIMITE_MENSAJES_SPAM} mensajes en {VENTANA_SPAM_SEGUNDOS} segundos)"
                accion_texto = "Silenciar (1 hora)"
                tiempo_texto = "1:00:00"
            else:
                duracion = datetime.timedelta(days=28)
                motivo = "Reincidencia grave de spam (múltiples infracciones de flood)"
                accion_texto = "Silenciar (28 días)"
                tiempo_texto = "28 días"

            tiempo_timeout = discord.utils.utcnow() + duracion
            caso = await self._registrar_caso(
                tipo="spam", motivo=motivo, usuario_id=author.id,
                detalles=f"Reincidencia #{reincidencia}",
            )

            try:
                await author.timeout(tiempo_timeout, reason=motivo)

                await self.notificar_policia(
                    guild, accion_texto, author, motivo, caso_numero=caso
                )

                await self.auditar_accion(
                    guild=guild,
                    titulo="🚫 Spam Masivo Detectado",
                    descripcion=f"El usuario **{author.name}** (`{author.id}`) fue silenciado por enviar más de {LIMITE_MENSAJES_SPAM} mensajes en {VENTANA_SPAM_SEGUNDOS} segundos.",
                    color=discord.Color.red(),
                    usuario_afectado=author,
                    caso_numero=caso,
                )

                detalle = (
                    f"Ataque o comportamiento anormal de spam detectado por "
                    f"{author.mention} (`{author.id}`). Se le aplicó un aislamiento de {tiempo_texto}."
                )
                await self.enviar_alerta_seguridad(guild, detalle, caso_numero=caso)

            except discord.Forbidden:
                await self.enviar_alerta_seguridad(
                    guild,
                    f"Se detectó spam masivo de {author.mention} (`{author.id}`), pero el bot no tiene permisos suficientes para aplicarle aislamiento.",
                    caso_numero=caso,
                )

    # ─────────────────────────────────────────────────────────────────────────
    # COMANDOS SLASH DE MODERACIÓN Y RECOMENDACIÓN
    # ─────────────────────────────────────────────────────────────────────────
    def es_admin_o_mod():
        async def predicate(interaction: discord.Interaction) -> bool:
            if not interaction.guild or not isinstance(
                interaction.user, discord.Member
            ):
                return False
            es_admin_perm = interaction.user.guild_permissions.administrator
            tiene_rol = any(
                r.id in (ROLE_ADMIN_ID, ROLE_MOD_ID)
                for r in interaction.user.roles
            )
            if es_admin_perm or tiene_rol:
                return True
            raise app_commands.MissingPermissions(["Administrador o Moderador"])

        return app_commands.check(predicate)

    async def cog_app_command_error(
        self, interaction: discord.Interaction, error: app_commands.AppCommandError
    ):
        if isinstance(error, app_commands.MissingPermissions):
            mensaje = "❌ No tienes permisos para usar este comando (se requiere ser Admin o Moderador)."
        else:
            log.error("Error en comando de aplicación: %s", error)
            mensaje = f"❌ Ha ocurrido un error al ejecutar el comando: {error}"

        if interaction.response.is_done():
            await interaction.followup.send(mensaje, ephemeral=True)
        else:
            await interaction.response.send_message(mensaje, ephemeral=True)

    @app_commands.command(
        name="hack",
        description="Marca una o más IDs de usuario como cuentas hackeadas y las banea si están en el server.",
    )
    @app_commands.guilds(_MY_GUILD)
    @es_admin_o_mod()
    @app_commands.describe(usuario_ids="IDs de los usuarios marcados como hackeados, separadas por espacios o comas.")
    async def hack(
        self,
        interaction: discord.Interaction,
        usuario_ids: str,
    ):
        await interaction.response.defer(ephemeral=True)
        guild = interaction.guild

        if not guild:
            await interaction.followup.send("⚠️ Error de servidor.", ephemeral=True)
            return

        ids_extraidas = [int(i) for i in re.findall(r"\d+", usuario_ids)]
        if not ids_extraidas:
            await interaction.followup.send("❌ No se reconoció ninguna ID válida.", ephemeral=True)
            return

        procesados = []
        for u_id in ids_extraidas:
            self.usuarios_hackeados.add(u_id)
            await self._guardar_usuario_hackeado(u_id)

            miembro = guild.get_member(u_id)
            if miembro:
                motivo = f"Cuenta hackeada / comprometida marcada por {interaction.user.name}."
                caso = await self.banear_con_notificacion_dm(
                    guild=guild,
                    usuario=miembro,
                    motivo=motivo,
                    moderador=interaction.user,
                )
                procesados.append(
                    f"🔴 `{u_id}` ({miembro.mention}): Encontrado en el servidor y **baneado** (Caso #{caso})."
                )
            else:
                caso = await self._registrar_caso(
                    tipo="marcado_hackeado",
                    motivo=f"Marcado como hackeado por {interaction.user.name}",
                    usuario_id=u_id,
                    moderador_id=interaction.user.id,
                )
                procesados.append(f"🟡 `{u_id}`: No está en el servidor. Guardado en lista negra (Caso #{caso}).")

        resumen = "\n".join(procesados)
        await interaction.followup.send(
            f"✅ **Procesamiento de cuentas hackeadas:**\n{resumen}",
            ephemeral=True,
        )

    @app_commands.command(
        name="recomiendo-ban",
        description="Solicita formalmente a los administradores el baneo de un usuario.",
    )
    @app_commands.guilds(_MY_GUILD)
    @es_admin_o_mod()
    async def recomiendo_ban(
        self,
        interaction: discord.Interaction,
        usuario: discord.Member,
        motivo: str,
    ):
        await interaction.response.defer(ephemeral=True)

        caso = await self._registrar_caso(
            tipo="recomendacion_baneo",
            motivo=motivo,
            usuario_id=usuario.id,
            moderador_id=interaction.user.id,
        )

        await self.auditar_accion(
            guild=interaction.guild,
            titulo="📌 Solicitud de Baneo Recomendado",
            descripcion=f"El moderador {interaction.user.mention} ha solicitado banear a {usuario.mention} (`{usuario.id}`).",
            color=discord.Color.purple(),
            mencionar_admins=True,
            campos=[
                ("Usuario Afectado", f"{usuario.display_name} (`{usuario.id}`)"),
                ("Solicitado Por", f"{interaction.user.display_name}"),
                ("Motivo de la recomendación", motivo),
            ],
            usuario_afectado=usuario,
            moderador=interaction.user,
            caso_numero=caso,
        )

        await interaction.followup.send(
            f"✅ Se ha enviado la solicitud de baneo para {usuario.mention} al canal de auditoría mencionando a los administradores (Caso #{caso}).",
            ephemeral=True,
        )

    @app_commands.command(
        name="purgar_innerbloom",
        description="Fuerza el baneo de Innerbloom y la purga masiva de sus mensajes.",
    )
    @app_commands.guilds(_MY_GUILD)
    @es_admin_o_mod()
    async def purgar_innerbloom(self, interaction: discord.Interaction):
        await interaction.response.defer(ephemeral=True)
        guild = interaction.guild

        if not guild:
            await interaction.followup.send("⚠️ Error de servidor.", ephemeral=True)
            return

        try:
            await guild.ban(
                discord.Object(id=BOT_INNERBLOOM_ID),
                reason="Expulsión y baneo forzado por comando administrativo.",
            )
        except Exception as e:
            await interaction.followup.send(f"⚠️ Error al banear: {e}", ephemeral=True)
            return

        borrados = 0
        if isinstance(interaction.channel, discord.TextChannel):
            def check_bot(m):
                return m.author.id == BOT_INNERBLOOM_ID

            try:
                deleted = await interaction.channel.purge(limit=100, check=check_bot)
                borrados = len(deleted)
            except Exception:
                pass

        caso = await self._registrar_caso(
            tipo="purga_innerbloom",
            motivo="Baneo y purga forzados manualmente",
            usuario_id=BOT_INNERBLOOM_ID,
            moderador_id=interaction.user.id,
            detalles=f"{borrados} mensajes purgados en #{interaction.channel}",
        )

        await self.auditar_accion(
            guild=guild,
            titulo="🔨 Innerbloom Purgado Manualmente",
            descripcion=f"{interaction.user.mention} forzó el baneo de Innerbloom y purgó {borrados} mensaje(s) en {interaction.channel.mention}.",
            color=discord.Color.red(),
            moderador=interaction.user,
            caso_numero=caso,
        )

        await interaction.followup.send(
            f"✅ Bot Innerbloom baneado correctamente. Se eliminaron {borrados} mensajes recientes en este canal (Caso #{caso}).",
            ephemeral=True,
        )

    @app_commands.command(
        name="multar", description="Impone una multa (aviso) a un usuario."
    )
    @app_commands.guilds(_MY_GUILD)
    @es_admin_o_mod()
    async def multar(
        self,
        interaction: discord.Interaction,
        usuario: discord.Member,
        motivo: str,
    ):
        await interaction.response.defer(ephemeral=True)

        if not interaction.guild:
            await interaction.followup.send("⚠️ Error de servidor.", ephemeral=True)
            return

        caso = await self._registrar_caso(
            tipo="multa",
            motivo=motivo,
            usuario_id=usuario.id,
            moderador_id=interaction.user.id,
        )

        await self.notificar_policia(
            interaction.guild, "Multar (Aviso)", usuario, motivo, caso_numero=caso
        )
        await self.auditar_accion(
            guild=interaction.guild,
            titulo="⚠️ Aviso / Multa Emitida",
            descripcion=f"**{usuario.name}** (`{usuario.id}`) recibió una multa/aviso por parte de {interaction.user.mention}.",
            color=discord.Color.yellow(),
            campos=[("Motivo", motivo)],
            usuario_afectado=usuario,
            moderador=interaction.user,
            caso_numero=caso,
        )

        await interaction.followup.send(
            f"✅ Multa registrada para {usuario.mention} (Caso #{caso}).", ephemeral=True
        )

    @app_commands.command(
        name="silenciar",
        description="Aísla/Silencia temporalmente a un usuario.",
    )
    @app_commands.guilds(_MY_GUILD)
    @es_admin_o_mod()
    async def silenciar(
        self,
        interaction: discord.Interaction,
        usuario: discord.Member,
        minutos: int,
        motivo: str,
    ):
        await interaction.response.defer(ephemeral=True)

        if minutos <= 0:
            await interaction.followup.send(
                "❌ La duración debe ser mayor a 0 minutos.", ephemeral=True
            )
            return

        if minutos > 28 * 24 * 60:
            await interaction.followup.send(
                "❌ La duración máxima permitida por Discord es de 28 días (40320 minutos).",
                ephemeral=True,
            )
            return

        duracion = datetime.timedelta(minutes=minutos)
        try:
            await usuario.timeout(duracion, reason=motivo)

            caso = await self._registrar_caso(
                tipo="silencio_manual",
                motivo=motivo,
                usuario_id=usuario.id,
                moderador_id=interaction.user.id,
                detalles=f"{minutos} minutos",
            )

            await self.notificar_policia(
                interaction.guild,
                f"Silenciar ({minutos}m)",
                usuario,
                motivo,
                caso_numero=caso,
            )
            await self.auditar_accion(
                guild=interaction.guild,
                titulo="🔇 Usuario Silenciado Manualmente",
                descripcion=f"**{usuario.name}** (`{usuario.id}`) fue silenciado por {interaction.user.mention}.",
                color=discord.Color.orange(),
                campos=[("Duración", f"{minutos} minutos"), ("Motivo", motivo)],
                usuario_afectado=usuario,
                moderador=interaction.user,
                caso_numero=caso,
            )
            await interaction.followup.send(
                f"✅ {usuario.mention} ha sido silenciado por {minutos} minutos (Caso #{caso}).",
                ephemeral=True,
            )
        except discord.Forbidden:
            await interaction.followup.send(
                "❌ No tengo permisos suficientes para silenciar a este usuario.",
                ephemeral=True,
            )

    @app_commands.command(
        name="liberar",
        description="Quita el silencio (timeout) activo de un usuario.",
    )
    @app_commands.guilds(_MY_GUILD)
    @es_admin_o_mod()
    async def liberar(
        self,
        interaction: discord.Interaction,
        usuario: discord.Member,
    ):
        await interaction.response.defer(ephemeral=True)

        if not usuario.timed_out_until:
            await interaction.followup.send(
                f"ℹ️ {usuario.mention} no tiene ningún silencio activo.",
                ephemeral=True,
            )
            return

        try:
            await usuario.timeout(None, reason=f"Liberado por {interaction.user}")

            caso = await self._registrar_caso(
                tipo="liberacion_manual",
                motivo=f"Liberado por {interaction.user.name}",
                usuario_id=usuario.id,
                moderador_id=interaction.user.id,
            )

            await self.auditar_accion(
                guild=interaction.guild,
                titulo="🔊 Silencio Retirado Manualmente",
                descripcion=f"{interaction.user.mention} ha retirado el silencio a {usuario.mention} (`{usuario.id}`).",
                color=discord.Color.blue(),
                usuario_afectado=usuario,
                moderador=interaction.user,
                caso_numero=caso,
            )
            await interaction.followup.send(
                f"✅ Se ha retirado el silencio de {usuario.mention} (Caso #{caso}).",
                ephemeral=True,
            )
        except discord.Forbidden:
            await interaction.followup.send(
                "❌ No tengo permisos suficientes para modificar el aislamiento de este usuario.",
                ephemeral=True,
            )

    @app_commands.command(
        name="reincidencias",
        description="Consulta o resetea el contador de infracciones (spam/NSFW) de un usuario.",
    )
    @app_commands.guilds(_MY_GUILD)
    @es_admin_o_mod()
    @app_commands.describe(resetear="Si se activa, pone a cero los contadores de este usuario.")
    async def reincidencias(
        self,
        interaction: discord.Interaction,
        usuario: discord.Member,
        resetear: bool = False,
    ):
        await interaction.response.defer(ephemeral=True)

        spam = self.user_spam_offenses.get(usuario.id, 0)
        nsfw = self.explicit_content_offenses.get(usuario.id, 0)

        if resetear:
            self.user_spam_offenses.pop(usuario.id, None)
            self.explicit_content_offenses.pop(usuario.id, None)
            self.user_messages.pop(usuario.id, None)
            await self._eliminar_infracciones_usuario(usuario.id)

            caso = await self._registrar_caso(
                tipo="reset_infracciones",
                motivo=f"Reseteo manual por {interaction.user.name}",
                usuario_id=usuario.id,
                moderador_id=interaction.user.id,
                detalles=f"Antes: {spam} spam, {nsfw} NSFW",
            )
            await self.auditar_accion(
                guild=interaction.guild,
                titulo="♻️ Infracciones Reseteadas",
                descripcion=f"{interaction.user.mention} reseteó los contadores de infracciones de {usuario.mention}.",
                color=discord.Color.teal(),
                campos=[("Antes del reseteo", f"{spam} de spam, {nsfw} de NSFW")],
                usuario_afectado=usuario,
                moderador=interaction.user,
                caso_numero=caso,
            )
            await interaction.followup.send(
                f"✅ Contadores de {usuario.mention} reseteados (antes: {spam} de spam, {nsfw} de NSFW). Caso #{caso}.",
                ephemeral=True,
            )
            return

        await interaction.followup.send(
            f"📊 {usuario.mention} tiene **{spam}** infracción(es) de spam y **{nsfw}** de NSFW registradas.",
            ephemeral=True,
        )

    @app_commands.command(
        name="banear", description="Banea permanentemente a un usuario."
    )
    @app_commands.guilds(_MY_GUILD)
    @es_admin_o_mod()
    async def banear(
        self,
        interaction: discord.Interaction,
        usuario: discord.Member,
        motivo: str,
    ):
        await interaction.response.defer(ephemeral=True)

        try:
            caso = await self.banear_con_notificacion_dm(
                guild=interaction.guild,
                usuario=usuario,
                motivo=motivo,
                moderador=interaction.user,
            )
            await interaction.followup.send(
                f"✅ {usuario.mention} ha sido baneado y notificado por DM sobre la vía de correo de reclamo (Caso #{caso}).",
                ephemeral=True,
            )
        except discord.Forbidden:
            await interaction.followup.send(
                "❌ No se pudo banear al usuario debido a falta de permisos.",
                ephemeral=True,
            )

    # ─────────────────────────────────────────────────────────────────────────
    # GESTIÓN EN CALIENTE DE LA LISTA DE PALABRAS PROHIBIDAS
    # ─────────────────────────────────────────────────────────────────────────
    palabra_prohibida_group = app_commands.Group(
        name="palabra-prohibida",
        description="Gestiona la lista de palabras prohibidas del servidor.",
        guild_ids=[GUILD_ID],
    )

    @palabra_prohibida_group.command(name="añadir", description="Añade una palabra a la lista de prohibidas.")
    @es_admin_o_mod()
    async def palabra_prohibida_añadir(self, interaction: discord.Interaction, palabra: str):
        await interaction.response.defer(ephemeral=True)
        palabra_normalizada = palabra.strip().lower()
        if not palabra_normalizada:
            await interaction.followup.send("❌ La palabra no puede estar vacía.", ephemeral=True)
            return

        self.palabras_prohibidas.add(palabra_normalizada)
        await self._guardar_palabra_prohibida(palabra_normalizada)
        await self.auditar_accion(
            guild=interaction.guild,
            titulo="🧾 Palabra Prohibida Añadida",
            descripcion=f"{interaction.user.mention} añadió `{palabra_normalizada}` a la lista negra.",
            color=discord.Color.dark_gold(),
            moderador=interaction.user,
        )
        await interaction.followup.send(f"✅ `{palabra_normalizada}` añadida a la lista de palabras prohibidas.", ephemeral=True)

    @palabra_prohibida_group.command(name="quitar", description="Quita una palabra de la lista de prohibidas.")
    @es_admin_o_mod()
    async def palabra_prohibida_quitar(self, interaction: discord.Interaction, palabra: str):
        await interaction.response.defer(ephemeral=True)
        palabra_normalizada = palabra.strip().lower()

        if palabra_normalizada not in self.palabras_prohibidas:
            await interaction.followup.send(f"ℹ️ `{palabra_normalizada}` no estaba en la lista.", ephemeral=True)
            return

        self.palabras_prohibidas.discard(palabra_normalizada)
        await self._eliminar_palabra_prohibida(palabra_normalizada)
        await self.auditar_accion(
            guild=interaction.guild,
            titulo="🧾 Palabra Prohibida Eliminada",
            descripcion=f"{interaction.user.mention} quitó `{palabra_normalizada}` de la lista negra.",
            color=discord.Color.dark_gold(),
            moderador=interaction.user,
        )
        await interaction.followup.send(f"✅ `{palabra_normalizada}` eliminada de la lista de palabras prohibidas.", ephemeral=True)

    @palabra_prohibida_group.command(name="listar", description="Muestra la lista actual de palabras prohibidas.")
    @es_admin_o_mod()
    async def palabra_prohibida_listar(self, interaction: discord.Interaction):
        await interaction.response.defer(ephemeral=True)
        if not self.palabras_prohibidas:
            await interaction.followup.send("📋 La lista de palabras prohibidas está vacía.", ephemeral=True)
            return
        listado = ", ".join(f"`{p}`" for p in sorted(self.palabras_prohibidas))
        await interaction.followup.send(f"📋 Palabras prohibidas actuales:\n{listado}"[:2000], ephemeral=True)

    # ─────────────────────────────────────────────────────────────────────────
    # CONSULTA DEL HISTORIAL DE CASOS DE AUDITORÍA
    # ─────────────────────────────────────────────────────────────────────────
    caso_group = app_commands.Group(
        name="caso",
        description="Consulta el historial de casos del sistema de auditoría.",
        guild_ids=[GUILD_ID],
    )

    @caso_group.command(name="ver", description="Muestra los detalles de un caso de auditoría por su número.")
    @es_admin_o_mod()
    async def caso_ver(self, interaction: discord.Interaction, numero: int):
        await interaction.response.defer(ephemeral=True)

        if not self.supabase:
            await interaction.followup.send(
                "⚠️ La persistencia de casos no está configurada (Supabase no disponible). "
                "Solo se pueden consultar los mensajes ya enviados al canal de auditoría.",
                ephemeral=True,
            )
            return

        try:
            respuesta = await asyncio.to_thread(
                lambda: self.supabase.table("casos_auditoria")
                .select("*")
                .eq("numero_caso", numero)
                .limit(1)
                .execute()
            )
            filas = getattr(respuesta, "data", None) or []
        except Exception as e:
            await interaction.followup.send(f"❌ Error al consultar el caso: {e}", ephemeral=True)
            return

        if not filas:
            await interaction.followup.send(f"ℹ️ No se encontró ningún caso con el número #{numero}.", ephemeral=True)
            return

        caso = filas[0]
        embed = discord.Embed(
            title=f"📁 Caso #{caso.get('numero_caso')}",
            color=discord.Color.dark_teal(),
            timestamp=datetime.datetime.now(datetime.timezone.utc),
        )
        embed.add_field(name="Tipo", value=str(caso.get("tipo", "Desconocido")), inline=True)
        if caso.get("usuario_id"):
            embed.add_field(name="Usuario afectado", value=f"<@{caso['usuario_id']}> (`{caso['usuario_id']}`)", inline=True)
        if caso.get("moderador_id"):
            embed.add_field(name="Moderador", value=f"<@{caso['moderador_id']}>", inline=True)
        embed.add_field(name="Motivo", value=self._truncar(caso.get("motivo") or "N/D"), inline=False)
        if caso.get("detalles"):
            embed.add_field(name="Detalles", value=self._truncar(caso.get("detalles")), inline=False)
        if caso.get("creado_en"):
            embed.add_field(name="Fecha de registro", value=str(caso.get("creado_en")), inline=False)

        await interaction.followup.send(embed=embed, ephemeral=True)

    @caso_group.command(name="historial", description="Muestra los últimos casos registrados de un usuario.")
    @es_admin_o_mod()
    async def caso_historial(self, interaction: discord.Interaction, usuario: discord.User):
        await interaction.response.defer(ephemeral=True)

        if not self.supabase:
            await interaction.followup.send(
                "⚠️ La persistencia de casos no está configurada (Supabase no disponible).",
                ephemeral=True,
            )
            return

        try:
            respuesta = await asyncio.to_thread(
                lambda: self.supabase.table("casos_auditoria")
                .select("*")
                .eq("usuario_id", usuario.id)
                .order("numero_caso", desc=True)
                .limit(10)
                .execute()
            )
            filas = getattr(respuesta, "data", None) or []
        except Exception as e:
            await interaction.followup.send(f"❌ Error al consultar el historial: {e}", ephemeral=True)
            return

        if not filas:
            await interaction.followup.send(f"ℹ️ {usuario.mention} no tiene casos registrados.", ephemeral=True)
            return

        embed = discord.Embed(
            title=f"📁 Historial de casos — {usuario.name}",
            color=discord.Color.dark_teal(),
            timestamp=datetime.datetime.now(datetime.timezone.utc),
        )
        embed.set_thumbnail(url=usuario.display_avatar.url)
        for caso in filas:
            embed.add_field(
                name=f"Caso #{caso.get('numero_caso')} — {caso.get('tipo')}",
                value=self._truncar(caso.get("motivo") or "N/D", 200),
                inline=False,
            )

        await interaction.followup.send(embed=embed, ephemeral=True)

    # ─────────────────────────────────────────────────────────────────────────
    # ESTADO / SALUD DEL BOT
    # ─────────────────────────────────────────────────────────────────────────
    @app_commands.command(name="estado-bot", description="Muestra estadísticas internas del sistema de moderación.")
    @app_commands.guilds(_MY_GUILD)
    @es_admin_o_mod()
    async def estado_bot(self, interaction: discord.Interaction):
        await interaction.response.defer(ephemeral=True)

        embed = discord.Embed(
            title="🩺 Estado del sistema de moderación",
            color=discord.Color.blurple(),
            timestamp=datetime.datetime.now(datetime.timezone.utc),
        )
        embed.add_field(name="Usuarios con historial de spam activo", value=str(len(self.user_messages)), inline=True)
        embed.add_field(name="Usuarios con infracciones de spam", value=str(len(self.user_spam_offenses)), inline=True)
        embed.add_field(name="Usuarios con infracciones NSFW", value=str(len(self.explicit_content_offenses)), inline=True)
        embed.add_field(name="Cuentas hackeadas registradas", value=str(len(self.usuarios_hackeados)), inline=True)
        embed.add_field(name="Palabras prohibidas cargadas", value=str(len(self.palabras_prohibidas)), inline=True)
        embed.add_field(name="Casos de auditoría registrados", value=str(self._contador_casos), inline=True)
        embed.add_field(name="Tareas de fondo activas", value=str(len(self._tareas_fondo)), inline=True)
        embed.add_field(
            name="Persistencia (Supabase)",
            value="✅ Conectada" if self.supabase else "⚠️ No configurada",
            inline=True,
        )
        embed.add_field(name="Latencia", value=f"{round(self.bot.latency * 1000)} ms", inline=True)

        await interaction.followup.send(embed=embed, ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(ModAndSecurityCog(bot))