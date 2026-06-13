import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { Link } from "wouter";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import { supabase } from "../lib/supabaseClient";

//ESTO NO SE TOCA

const CFG = {
  color: "#5a1a1a",
  front: {
    apellidos: { x: 1000, y: 520, size: 54, weight: "bold", family: "'Times New Roman', serif" },
    nombre: { x: 1000, y: 728, size: 54, weight: "bold", family: "'Times New Roman', serif" },
    genero: { x: 1000, y: 940, size: 60, weight: "bold", family: "'Times New Roman', serif" },
    fecha: { x: 1000, y: 1200, size: 54, weight: "bold", family: "'Times New Roman', serif" },
    dpiNum: { x: 80, y: 1100, size: 70, weight: "bold", family: "'Courier New', monospace" },
    photo: { cx: 310, cy: 670, w: 500, h: 520 },
  },
  back: {
    expFecha: { x: 280, y: 390, size: 60, weight: "bold", family: "'Times New Roman', serif" },
    valFecha: { x: 1300, y: 410, size: 60, weight: "bold", family: "'Times New Roman', serif" },
    region: { x: 360, y: 570, size: 60, weight: "bold", family: "'Times New Roman', serif" },
    qr: { cx: 1490, cy: 870, size: 370 },
    sig: { x: 270, y: 910, w: 590, h: 238 },
  },
};



function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  if (dateStr.includes("/")) return dateStr;
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith("blob:") && !src.startsWith("data:")) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

type FontCfg = { size: number; weight: string; family: string };
function applyFont(ctx: CanvasRenderingContext2D, cfg: FontCfg) {
  ctx.font = `${cfg.weight} ${cfg.size}px ${cfg.family}`;
}

async function makeQRWithLogo(text: string, qrSize: number): Promise<string> {
  const qrDataUrl = await QRCode.toDataURL(text, {
    width: qrSize,
    margin: 1,
    color: { dark: "#5a1a1a", light: "#fffbf0" },
    errorCorrectionLevel: "H",
  });
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = qrSize;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(await loadImg(qrDataUrl), 0, 0, qrSize, qrSize);
  try {
    const logo = await loadImg("/logo.png");
    const logoSize = Math.round(qrSize * 0.22);
    const lx = Math.round((qrSize - logoSize) / 2);
    const ly = Math.round((qrSize - logoSize) / 2);
    const pad = Math.round(logoSize * 0.12);
    ctx.fillStyle = "#fffbf0";
    ctx.beginPath();
    ctx.roundRect(lx - pad, ly - pad, logoSize + pad * 2, logoSize + pad * 2, pad);
    ctx.fill();
    ctx.drawImage(logo, lx, ly, logoSize, logoSize);
  } catch { /* sin logo */ }
  return canvas.toDataURL("image/png");
}


async function renderFront(d: {
  nombre: string; apellidos: string; genero: string;
  fecha: string; dpiNumber: string; issuedAt: string; validUntil: string;
}): Promise<string> {
  const W = 1920, H = 1279;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const f = CFG.front;

  ctx.drawImage(await loadImg("/templates/delante.jpg"), 0, 0, W, H);

  const px = f.photo.cx - f.photo.w / 2;
  const py = f.photo.cy - f.photo.h / 2;
  ctx.fillStyle = "#d4c5b0";
  ctx.fillRect(px, py, f.photo.w, f.photo.h);
  ctx.fillStyle = "#9e8878";
  ctx.font = "bold 36px 'Times New Roman', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Sin foto", f.photo.cx, f.photo.cy);
  ctx.textAlign = "left";

  ctx.fillStyle = CFG.color;
  ctx.textBaseline = "middle";

  applyFont(ctx, f.apellidos);
  ctx.fillText(d.apellidos.toUpperCase(), f.apellidos.x, f.apellidos.y);

  applyFont(ctx, f.nombre);
  ctx.fillText(d.nombre.toUpperCase(), f.nombre.x, f.nombre.y);

  applyFont(ctx, f.genero);
  ctx.fillText(d.genero === "Hombre" ? "M" : "F", f.genero.x, f.genero.y);

  applyFont(ctx, f.fecha);
  ctx.fillText(formatDate(d.fecha), f.fecha.x, f.fecha.y);

  applyFont(ctx, f.dpiNum);
  ctx.fillText(d.dpiNumber, f.dpiNum.x, f.dpiNum.y);

  return canvas.toDataURL("image/jpeg", 0.95);
}


async function renderBack(d: {
  region: string; dpiNumber: string;
  issuedAt: string; validUntil: string; qrUrl: string;
}): Promise<string> {
  const W = 1920, H = 1279;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const b = CFG.back;

  ctx.drawImage(await loadImg("/templates/detras.jpg"), 0, 0, W, H);

  ctx.fillStyle = CFG.color;
  ctx.textBaseline = "middle";

  applyFont(ctx, b.expFecha);
  ctx.fillText(d.issuedAt, b.expFecha.x, b.expFecha.y);

  applyFont(ctx, b.valFecha);
  ctx.fillText(d.validUntil, b.valFecha.x, b.valFecha.y);

  applyFont(ctx, b.region);
  ctx.fillText(d.region.toUpperCase(), b.region.x, b.region.y);

  const qrWithLogo = await makeQRWithLogo(d.qrUrl, b.qr.size);
  const qs = b.qr.size;
  ctx.drawImage(await loadImg(qrWithLogo), b.qr.cx - qs / 2, b.qr.cy - qs / 2, qs, qs);

  return canvas.toDataURL("image/jpeg", 0.95);
}


function generatePDF(frontDataUrl: string, backDataUrl: string, dpiNumber: string): void {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  doc.addImage(frontDataUrl, "JPEG", 0, 0, 297, 198);
  doc.setFontSize(8);
  doc.setTextColor(120, 60, 60);
  doc.text(dpiNumber, 8, 207);
  doc.addPage();
  doc.addImage(backDataUrl, "JPEG", 0, 0, 297, 198);
  doc.text(dpiNumber, 8, 207);
  doc.save(`dpi-restaurado-${dpiNumber.replace("DPI - ", "")}.pdf`);
}

// Esto pa q a neplod no le de una embolia
const DPI_REGEX = /^DPI - \d{1,6}[A-Z]$/;
const SAFE_DISCORD = /^[a-zA-Z0-9_.#\-]{2,32}$|^\d{17,20}$/;

function sanitizeInput(v: string): string {
  return v.replace(/[\x00-\x1F\x7F<>"'`;]/g, "").trim().slice(0, 100);
}


export default function RestoreDPI() {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({ dpi: "", discord: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [genError, setGenError] = useState("");
  const [preview, setPreview] = useState<{
    front: string; back: string; dpiNumber: string;
  } | null>(null);

  const validate = (): boolean => {
    const err: Record<string, string> = {};
    const dpi = sanitizeInput(form.dpi).toUpperCase().replace(/\s*-\s*/g, " - ");
    const discord = sanitizeInput(form.discord);

    if (!dpi) err.dpi = "Introduce tu número de DPI.";
    else if (!DPI_REGEX.test(dpi)) err.dpi = "Formato inválido. Ejemplo: DPI - 000001A";

    if (!discord) err.discord = "Introduce tu usuario o ID de Discord.";
    else if (!SAFE_DISCORD.test(discord)) err.discord = "Usuario o ID de Discord no válido.";

    setFieldErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setGenError("");
    setPreview(null);

    const dpi = sanitizeInput(form.dpi).toUpperCase().replace(/\s*-\s*/g, " - ");
    const discord = sanitizeInput(form.discord);

    try {
      const res = await fetch("/api/dpi/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dpi, discord }),
      });

      if (res.status === 404) {
        setGenError("No hemos encontrado ningún DPI asociado a esa persona o ese DPI no te pertenece.");
        return;
      }
      if (res.status === 429) {
        setGenError("Demasiados intentos. Espera un momento antes de volver a intentarlo.");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setGenError(body.error ?? "Error al recuperar el DPI. Inténtalo de nuevo.");
        return;
      }

      const { nombre, apellidos, genero, fecha_nac, region,
        dpi_number, issued_at, valid_until, qr_url } = await res.json();

      const [frontImg, backImg] = await Promise.all([
        renderFront({
          nombre, apellidos, genero,
          fecha: fecha_nac,
          dpiNumber: dpi_number,
          issuedAt: issued_at,
          validUntil: valid_until,
        }),
        renderBack({
          region,
          dpiNumber: dpi_number,
          issuedAt: issued_at,
          validUntil: valid_until,
          qrUrl: qr_url,
        }),
      ]);

      setPreview({ front: frontImg, back: backImg, dpiNumber: dpi_number });
      setTimeout(() => previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);

    } catch (err) {
      console.error(err);
      setGenError("Error al generar las imágenes. Asegúrate de que las plantillas están en /templates/");
    } finally {
      setLoading(false);
    }
  };

  const dlImg = (dataUrl: string, side: "delante" | "detras") => {
    if (!preview) return;
    const code = preview.dpiNumber.replace("DPI - ", "");
    const a = document.createElement("a");
    a.href = dataUrl; a.download = `${side}-dpi-${code}.jpg`; a.click();
  };

  const dlBothImgs = () => {
    if (!preview) return;
    dlImg(preview.front, "delante");
    setTimeout(() => dlImg(preview.back, "detras"), 400);
  };

  const inputCls = (key: string) =>
    `w-full rounded-xl border px-4 py-3 bg-background outline-none transition ${fieldErrors[key]
      ? "border-red-500 focus:border-red-500"
      : "border-border focus:border-accent"
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto max-w-2xl space-y-4">

          <h1 className="text-3xl font-bold">
            Recuperar <span className="text-accent">DPI</span>
          </h1>
          <p className="text-sm text-foreground/50">
            Introduce tu número de DPI y tu usuario o ID de Discord para regenerar las imágenes.
          </p>

          {/* DPI */}
          <div>
            <span className="text-xs text-foreground/50 block mb-1">Número de DPI</span>
            <input
              className={inputCls("dpi")}
              placeholder="DPI - 000000A"
              value={form.dpi}
              maxLength={20}
              onChange={e => setForm({ ...form, dpi: e.target.value })}
            />
            {fieldErrors.dpi && <p className="text-red-500 text-xs mt-1">{fieldErrors.dpi}</p>}
          </div>

          {/* ¿La peña q no sabe como conseguir un id como sigue respirandio? */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-foreground/50">Usuario o ID de Discord</span>
              <a
                href="https://support.discord.com/hc/es/articles/206346498-D%C3%B3nde-puedo-encontrar-mi-ID-de-usuario-servidor-mensaje-"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent hover:text-accent/80 transition"
                style={{ textDecoration: "underline" }}
              >
                ¿Cómo obtener tu ID?
              </a>
            </div>
            <input
              className={inputCls("discord")}
              placeholder="usuario o 123456789012345678"
              value={form.discord}
              maxLength={32}
              onChange={e => setForm({ ...form, discord: e.target.value })}
            />
            {fieldErrors.discord && <p className="text-red-500 text-xs mt-1">{fieldErrors.discord}</p>}
          </div>

          {/* Texto que abre modal */}
          <div className="text-center">
            <button
              onClick={() => setShowModal(true)}
              className="text-sm text-accent hover:underline cursor-pointer"
            >
              Tienes problemas para recuperar tu DPI?
            </button>
          </div>

          {/* Botón de recuperación */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-accent text-black font-bold cursor-pointer disabled:opacity-60 transition"
          >
            {loading ? "Buscando…" : "Recuperar DPI"}
          </button>

          {genError && <p className="text-red-500 text-sm text-center">{genError}</p>}

          {/* Preview */}
          {preview && (
            <motion.div
              ref={previewRef}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-5 pt-6 border-t border-border"
            >
              <div>
                <h2 className="text-xl font-bold">DPI recuperado ✓</h2>
                <p className="text-sm font-mono text-accent mt-1">{preview.dpiNumber}</p>
                <p className="text-xs text-foreground/40 mt-1">
                  Nota: la foto y la firma originales no se almacenan, por lo que no aparecen en la recuperación.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground/70">Delantera</p>
                <img src={preview.front} alt="DPI Delantera"
                  className="w-full rounded-xl border border-border shadow-md" />
                <p className="text-sm font-semibold text-foreground/70 pt-1">Trasera</p>
                <img src={preview.back} alt="DPI Trasera"
                  className="w-full rounded-xl border border-border shadow-md" />
              </div>

              <div className="space-y-3">
                <button onClick={dlBothImgs}
                  className="w-full py-4 rounded-xl bg-accent text-black font-bold cursor-pointer hover:opacity-90 transition">
                  Descargar DPI en foto
                </button>
                <button onClick={() => generatePDF(preview.front, preview.back, preview.dpiNumber)}
                  className="w-full py-4 rounded-xl border-2 border-accent text-accent font-bold cursor-pointer hover:bg-accent/10 transition">
                  Descargar DPI en PDF
                </button>
              </div>
            </motion.div>
          )}


        </div>
      </main>

      <Footer />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-background border border-border rounded-2xl max-w-md w-full mx-4 p-6 shadow-2xl"
          >
            <h3 className="text-xl font-bold mb-3">Abrir ticket en Discord</h3>
            <p className="text-foreground/80 mb-4">
              ¿Necesitas ayuda para recuperar tu DPI? Abre un ticket en nuestro servidor de Discord y el equipo de soporte te ayudará.
            </p>
            <a
              href="https://discord.gg/reino-del-pan-1381359904731693056"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#5865F2] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#4752c4] transition mb-3 w-full justify-center"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              Abrir Discord
            </a>
            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2 rounded-xl border border-border text-foreground/70 hover:bg-accent/10 transition"
            >
              Cerrar
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}