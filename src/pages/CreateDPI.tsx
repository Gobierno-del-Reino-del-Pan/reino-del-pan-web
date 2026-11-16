import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";

// Como toqueis estas posiciones os rajo, atentamente: Rexy
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

const LIMITS = { nombre: 20, apellidos: 30 };
const ONLY_LETTERS = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
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

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const ratio = Math.max(w / img.width, h / img.height);
  const sw = w / ratio, sh = h / ratio;
  const sx = (img.width - sw) / 2, sy = (img.height - sh) / 2;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  ctx.restore();
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
  canvas.width = qrSize;
  canvas.height = qrSize;
  const ctx = canvas.getContext("2d")!;
  const qrImg = await loadImg(qrDataUrl);
  ctx.drawImage(qrImg, 0, 0, qrSize, qrSize);
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

function renderFront(data: {
  nombre: string; apellidos: string; genero: string;
  fecha: string; dpiNumber: string;
}, template: HTMLImageElement, photo: HTMLImageElement): string {
  const W = 1920, H = 1279;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const f = CFG.front;
  ctx.drawImage(template, 0, 0, W, H);
  drawCover(ctx, photo, f.photo.cx - f.photo.w / 2, f.photo.cy - f.photo.h / 2, f.photo.w, f.photo.h);
  ctx.fillStyle = CFG.color;
  ctx.textBaseline = "middle";
  applyFont(ctx, f.apellidos);
  ctx.fillText(data.apellidos.toUpperCase(), f.apellidos.x, f.apellidos.y);
  applyFont(ctx, f.nombre);
  ctx.fillText(data.nombre.toUpperCase(), f.nombre.x, f.nombre.y);
  applyFont(ctx, f.genero);
  ctx.fillText(data.genero === "Hombre" ? "M" : "F", f.genero.x, f.genero.y);
  applyFont(ctx, f.fecha);
  ctx.fillText(formatDate(data.fecha), f.fecha.x, f.fecha.y);
  applyFont(ctx, f.dpiNum);
  ctx.fillText(data.dpiNumber, f.dpiNum.x, f.dpiNum.y);
  return canvas.toDataURL("image/jpeg", 0.95);
}

async function renderBack(data: {
  region: string; signatureDataUrl: string;
  issuedAt: string; validUntil: string; qrUrl: string;
}, template: HTMLImageElement): Promise<string> {
  const W = 1920, H = 1279;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const b = CFG.back;
  ctx.drawImage(template, 0, 0, W, H);
  ctx.fillStyle = CFG.color;
  ctx.textBaseline = "middle";
  applyFont(ctx, b.expFecha);
  ctx.fillText(data.issuedAt, b.expFecha.x, b.expFecha.y);
  applyFont(ctx, b.valFecha);
  ctx.fillText(data.validUntil, b.valFecha.x, b.valFecha.y);
  applyFont(ctx, b.region);
  ctx.fillText(data.region.toUpperCase(), b.region.x, b.region.y);
  const qrWithLogo = await makeQRWithLogo(data.qrUrl, b.qr.size);
  const qrImg = await loadImg(qrWithLogo);
  const qs = b.qr.size;
  ctx.drawImage(qrImg, b.qr.cx - qs / 2, b.qr.cy - qs / 2, qs, qs);
  if (data.signatureDataUrl) {
    const sigImg = await loadImg(data.signatureDataUrl);
    ctx.drawImage(sigImg, b.sig.x, b.sig.y, b.sig.w, b.sig.h);
  }
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
  doc.save(`dpi-${dpiNumber.replace("DPI - ", "")}.pdf`);
}

function textError(value: string, field: "nombre" | "apellidos"): string {
  if (!value) return "";
  const t = value.trim();
  if (t.length !== value.length) return "Sin espacios al inicio o al final";
  if (!ONLY_LETTERS.test(t)) return "Solo se permiten letras";
  if ((t.match(/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/g) || []).length < 2) return "Mínimo 2 letras";
  const spaces = (t.match(/ /g) || []).length;
  if (field === "nombre" && spaces > 1) return "Máximo 2 palabras";
  if (field === "apellidos" && spaces > 3) return "Máximo 4 palabras";
  if (t.length > LIMITS[field]) return `Máximo ${LIMITS[field]} caracteres`;
  return "";
}

function ageError(dateStr: string): string {
  if (!dateStr) return "";
  const birth = new Date(dateStr + "T00:00:00.000Z");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr) || dateStr.startsWith("0000") ||
      !Number.isFinite(birth.getTime()) || birth.toISOString().slice(0, 10) !== dateStr)
    return "Fecha inválida";
  const today = new Date();
  const [year, month, day] = dateStr.split("-").map(Number);
  const beforeBirthday = today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day);
  const age = today.getFullYear() - year - Number(beforeBirthday);
  if (age < 0) return "No puedes haber nacido en el futuro";
  if (age > 100) return "Edad máxima: 100 años";
  return "";
}

function CharCounter({ value, max }: { value: string; max: number }) {
  const len = value.trim().length;
  const over = len > max;
  const near = len >= max * 0.85;
  return (
    <span className={`text-xs tabular-nums transition-colors ${over ? "text-red-500 font-semibold" : near ? "text-yellow-400" : "text-foreground/30"
      }`}>
      {len}/{max}
    </span>
  );
}

type IssuedDPI = {
  dpiNumber: string; issuedAt: string; validUntil: string; qrUrl: string;
};

function isIssuedDPI(body: unknown): body is IssuedDPI {
  if (!body || typeof body !== "object") return false;
  const fields = body as Record<string, unknown>;
  return ["dpiNumber", "issuedAt", "validUntil", "qrUrl"].every(
    key => typeof fields[key] === "string" && fields[key].length > 0
  );
}

export default function CreateDPI() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const busyRef = useRef(false);
  const completedRef = useRef(false);
  const requestRef = useRef<{ key: string; payload: string } | null>(null);
  const issuedRef = useRef<IssuedDPI | null>(null);

  const [drawing, setDrawing] = useState(false);
  const [photo, setPhoto] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [issued, setIssued] = useState<IssuedDPI | null>(null);
  const [duplicate, setDuplicate] = useState(false);
  const [preview, setPreview] = useState<{
    front: string; back: string; dpiNumber: string;
  } | null>(null);

  const [form, setForm] = useState({
    nombre: "", apellidos: "", genero: "", fecha: "", region: "",
  });

  const [submitErrors, setSubmitErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    return () => {
      if (photo) URL.revokeObjectURL(photo);
    };
  }, [photo]);

  useEffect(() => {
    if (preview) previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [preview]);

  // ─── Helpers de posición ────────────────────────────────────────────────────
  const mousePos = (e: React.MouseEvent, c: HTMLCanvasElement) => {
    const r = c.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (c.width / r.width),
      y: (e.clientY - r.top) * (c.height / r.height),
    };
  };

  const touchPos = (e: React.TouchEvent, c: HTMLCanvasElement) => {
    const r = c.getBoundingClientRect();
    const t = e.touches[0];
    return {
      x: (t.clientX - r.left) * (c.width / r.width),
      y: (t.clientY - r.top) * (c.height / r.height),
    };
  };

  // ─── Mouse events ────────────────────────────────────────────────────────────
  const startDraw = (e: React.MouseEvent) => {
    if (busyRef.current || completedRef.current || !canvasRef.current) return;
    setDrawing(true);
    const { x, y } = mousePos(e, canvasRef.current);
    const ctx = canvasRef.current.getContext("2d")!;
    ctx.beginPath(); ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent) => {
    if (busyRef.current || completedRef.current || !drawing || !canvasRef.current) return;
    const { x, y } = mousePos(e, canvasRef.current);
    const ctx = canvasRef.current.getContext("2d")!;
    ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.strokeStyle = "#111";
    ctx.lineTo(x, y); ctx.stroke();
    setSubmitErrors(errors => errors.signature ? { ...errors, signature: "" } : errors);
  };

  const stopDraw = () => {
    setDrawing(false);
    canvasRef.current?.getContext("2d")?.beginPath();
  };

  // ─── Touch events ────────────────────────────────────────────────────────────
  // Registramos con addEventListener para poder usar { passive: false }
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isDrawing = false;

    const onTouchStart = (e: TouchEvent) => {
      if (busyRef.current || completedRef.current) return;
      e.preventDefault();
      isDrawing = true;
      const r = canvas.getBoundingClientRect();
      const t = e.touches[0];
      const x = (t.clientX - r.left) * (canvas.width / r.width);
      const y = (t.clientY - r.top) * (canvas.height / r.height);
      const ctx = canvas.getContext("2d")!;
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (busyRef.current || completedRef.current || !isDrawing) return;
      const r = canvas.getBoundingClientRect();
      const t = e.touches[0];
      const x = (t.clientX - r.left) * (canvas.width / r.width);
      const y = (t.clientY - r.top) * (canvas.height / r.height);
      const ctx = canvas.getContext("2d")!;
      ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.strokeStyle = "#111";
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      isDrawing = false;
      canvas.getContext("2d")?.beginPath();
    };

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: false });
    canvas.addEventListener("touchcancel", onTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    stopDraw();
    canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && !busyRef.current && !completedRef.current) {
      setPhoto(URL.createObjectURL(file));
      setSubmitErrors(errors => ({ ...errors, photo: "" }));
    }
  };

  const hasSignature = () => {
    const c = canvasRef.current;
    if (!c) return false;
    return c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data.some(v => v !== 0);
  };

  const validate = () => {
    const err: Record<string, string> = {};
    const ne = textError(form.nombre, "nombre");
    if (ne || !form.nombre) err.nombre = ne || "Nombre requerido";
    const ae = textError(form.apellidos, "apellidos");
    if (ae || !form.apellidos) err.apellidos = ae || "Apellidos requeridos";
    if (!form.genero) err.genero = "Selecciona género";
    if (!form.fecha) err.fecha = "Fecha requerida";
    else { const fe = ageError(form.fecha); if (fe) err.fecha = fe; }
    if (!form.region) err.region = "Selecciona región";
    if (!photo) err.photo = "Sube una foto";
    if (!hasSignature()) err.signature = "Falta firma";
    setSubmitErrors(err);
    return Object.keys(err).length === 0;
  };

  const submit = async () => {
    if (busyRef.current || completedRef.current || duplicate || !validate()) return;
    busyRef.current = true;
    stopDraw();
    setGenerating(true);
    setGenError("");

    let loadingResources = true;
    try {
      const signatureDataUrl = canvasRef.current!.toDataURL("image/png");
      const [frontTemplate, backTemplate, photoImage] = await Promise.all([
        loadImg("/templates/delante.jpg"),
        loadImg("/templates/detras.jpg"),
        loadImg(photo).catch(() => { throw new Error("photo"); }),
      ]);
      loadingResources = false;

      let dpi = issuedRef.current;
      if (!dpi) {
        const payload = JSON.stringify(form);
        if (requestRef.current?.payload !== payload) {
          requestRef.current = { key: crypto.randomUUID(), payload };
        }

        const apiRes = await fetch("/api/dpi/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": requestRef.current.key,
          },
          body: payload,
          signal: AbortSignal.timeout(30_000),
        });

        const body = await apiRes.json().catch(() => null);
        if (!apiRes.ok) {
          if (apiRes.status === 429 && typeof body?.retryAfterHours === "number") {
            const h = body.retryAfterHours;
            const wait = h >= 24 ? `${Math.ceil(h / 24)} día(s)` : `${h} hora(s)`;
            setGenError(`Has alcanzado el límite de emisiones. Espera ${wait} para continuar.`);
            return;
          }
          if (apiRes.status === 409 && body?.code === "DPI_DUPLICATE") setDuplicate(true);
          setGenError(typeof body?.error === "string" ? body.error : "No hemos podido confirmar la emisión. Vuelve a intentarlo.");
          return;
        }

        if (!isIssuedDPI(body)) throw new Error("Respuesta de emisión incompleta");
        dpi = body;
        issuedRef.current = dpi;
        setIssued(dpi);
      }

      const frontImg = renderFront({ ...form, dpiNumber: dpi.dpiNumber }, frontTemplate, photoImage);
      const backImg = await renderBack({ ...dpi, region: form.region, signatureDataUrl }, backTemplate);

      completedRef.current = true;
      setPreview({ front: frontImg, back: backImg, dpiNumber: dpi.dpiNumber });
    } catch (error) {
      if (loadingResources) {
        setGenError(error instanceof Error && error.message === "photo"
          ? "No hemos podido abrir la foto. Selecciona otra imagen."
          : "No hemos podido cargar los recursos del DPI. Vuelve a intentarlo.");
      } else {
        setGenError(issuedRef.current
          ? "Tu DPI ya está emitido. Puedes volver a generar la vista previa."
          : "No hemos podido confirmar la emisión. Vuelve a intentarlo.");
      }
    } finally {
      busyRef.current = false;
      setGenerating(false);
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

  const inputCls = (key: string, inlineErr?: string) => {
    const hasErr = inlineErr || submitErrors[key];
    return `w-full rounded-xl border px-4 py-3 bg-background outline-none transition text-sm ${hasErr ? "border-red-500 focus:border-red-500" : "border-border focus:border-accent"
      }`;
  };

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm(current => ({ ...current, [field]: value }));
    setSubmitErrors(errors => ({ ...errors, [field]: "" }));
    if (duplicate) {
      setDuplicate(false);
      setGenError("");
    }
  };

  const nombreErr = form.nombre ? textError(form.nombre, "nombre") : "";
  const apellidosErr = form.apellidos ? textError(form.apellidos, "apellidos") : "";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 py-10 px-4 md:px-0">
        <div className="container mx-auto max-w-2xl space-y-4">

          <h1 className="text-2xl sm:text-3xl font-bold">
            Crear <span className="text-accent">DPI</span>
          </h1>

          <fieldset disabled={generating || !!preview} className="min-w-0 space-y-4">
            <fieldset disabled={!!issued} className="min-w-0 space-y-4">
              {/* Nombre */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-foreground/50">Nombre</span>
                  <CharCounter value={form.nombre} max={LIMITS.nombre} />
                </div>
                <input
                  className={inputCls("nombre", nombreErr)}
                  placeholder="Nombre"
                  value={form.nombre}
                  maxLength={LIMITS.nombre + 5}
                  onChange={e => updateForm("nombre", e.target.value)}
                />
                {(nombreErr || submitErrors.nombre) && (
                  <p className="text-red-500 text-xs mt-1">{nombreErr || submitErrors.nombre}</p>
                )}
              </div>

              {/* Apellidos */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-foreground/50">Apellidos</span>
                  <CharCounter value={form.apellidos} max={LIMITS.apellidos} />
                </div>
                <input
                  className={inputCls("apellidos", apellidosErr)}
                  placeholder="Apellidos"
                  value={form.apellidos}
                  maxLength={LIMITS.apellidos + 5}
                  onChange={e => updateForm("apellidos", e.target.value)}
                />
                {(apellidosErr || submitErrors.apellidos) && (
                  <p className="text-red-500 text-xs mt-1">{apellidosErr || submitErrors.apellidos}</p>
                )}
              </div>

              {/* Género */}
              <div>
                <select className={inputCls("genero")} value={form.genero}
                  onChange={e => updateForm("genero", e.target.value)}>
                  <option value="">Género</option>
                  <option>Hombre</option>
                  <option>Mujer</option>
                </select>
                {submitErrors.genero && <p className="text-red-500 text-xs mt-1">{submitErrors.genero}</p>}
              </div>

              {/* Fecha nacimiento */}
              <div>
                <span className="text-xs text-foreground/50 block mb-1">Fecha de nacimiento</span>
                <input type="date" className={inputCls("fecha")} value={form.fecha}
                  onChange={e => updateForm("fecha", e.target.value)} />
                {submitErrors.fecha && <p className="text-red-500 text-xs mt-1">{submitErrors.fecha}</p>}
              </div>

              {/* Región */}
              <div>
                <select className={inputCls("region")} value={form.region}
                  onChange={e => updateForm("region", e.target.value)}>
                  <option value="">Región</option>
                  <option>Baguette</option>
                  <option>Pan Plano</option>
                  <option>Croissant</option>
                  <option>Pretzel</option>
                  <option>Pimbo</option>
                  <option>Sin Gluten</option>
                </select>
                {submitErrors.region && <p className="text-red-500 text-xs mt-1">{submitErrors.region}</p>}
              </div>
            </fieldset>

            {/* Foto */}
            <div>
              <span className="text-xs text-foreground/50 block mb-1">Foto de perfil</span>
              <div
                className={`border-2 border-dashed rounded-xl p-4 cursor-pointer flex items-center gap-4 transition ${submitErrors.photo ? "border-red-500" : "border-border hover:border-accent/50"
                  }`}
                onClick={() => {
                  if (!busyRef.current && !completedRef.current) fileRef.current?.click();
                }}
              >
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhoto} />
                {!photo
                  ? <p className="text-sm text-foreground/60">Toca para subir tu foto</p>
                  : <>
                    <img src={photo} className="w-16 h-20 object-cover rounded-lg flex-shrink-0" alt="foto" />
                    <span className="text-sm text-foreground/60">Cambiar foto</span>
                  </>
                }
              </div>
              {submitErrors.photo && <p className="text-red-500 text-xs mt-1">{submitErrors.photo}</p>}
            </div>

            {/* Firma — con soporte touch */}
            <div>
              <span className="text-xs text-foreground/50 block mb-1">Firma</span>
              <div className={`border rounded-xl overflow-hidden transition ${submitErrors.signature ? "border-red-500" : "border-border"
                }`}>
                <div className="flex items-center justify-between px-3 pt-2 pb-1">
                  <p className="text-xs text-foreground/50">Firma aquí con el dedo o el ratón</p>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-xs text-foreground/40 hover:text-foreground/70 transition px-2 py-1"
                  >
                    Borrar
                  </button>
                </div>
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={160}
                  className="w-full touch-none"
                  style={{ height: "160px", cursor: "crosshair", display: "block" }}
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                />
              </div>
              {submitErrors.signature && <p className="text-red-500 text-xs mt-1">{submitErrors.signature}</p>}
            </div>
          </fieldset>

          {/* Botón */}
          <button
            type="button"
            onClick={submit}
            disabled={generating || !!preview || duplicate}
            aria-busy={generating}
            className="w-full py-4 rounded-xl bg-accent text-black font-bold cursor-pointer disabled:opacity-60 transition text-sm sm:text-base"
          >
            {generating ? "Generando DPI…" : preview || duplicate ? "DPI emitido" : issued ? "Reintentar vista previa" : "Crear DPI"}
          </button>

          {genError && <p role="alert" className="text-red-500 text-sm text-center">{genError}</p>}

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
                <h2 className="text-xl font-bold">Tu DPI está listo ✓</h2>
                <p className="text-sm font-mono text-accent mt-1">{preview.dpiNumber}</p>
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
                  Descarga tu DPI en foto
                </button>
                <button onClick={() => generatePDF(preview.front, preview.back, preview.dpiNumber)}
                  className="w-full py-4 rounded-xl border-2 border-accent text-accent font-bold cursor-pointer hover:bg-accent/10 transition">
                  Descargar DPI en PDF
                </button>
              </div>
            </motion.div>
          )}

          <p className="text-center text-xs text-foreground/60 pb-4">
            Al crear tu DPI aceptas nuestros{" "}
            <a href="/terms" style={{
              color: "#f5a623",
              textDecoration: "underline",
              textUnderlineOffset: "4px",
              textDecorationThickness: "1px",
            }}>
              Términos y Condiciones
            </a>
          </p>

        </div>
      </main>
      <Footer />
    </div>
  );
}