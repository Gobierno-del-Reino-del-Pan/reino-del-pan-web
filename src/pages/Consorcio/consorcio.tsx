import { useState, useEffect } from "react";
import QRCode from "qrcode";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface TarjetaData {
  numero_tarjeta: string;
  nombre: string;
  apellidos: string;
  region: string;
  dpi: string;
  discord_id: string;
  emitida_at: string;
  caduca_at: string;
  activa: boolean;
  caducada: boolean;
  renovaciones: number;
  ultima_renovacion: string | null;
}

interface DiscordUser {
  id: string;
  username: string;
  avatar: string | null;
  global_name: string | null;
}

// ─── Constantes ───────────────────────────────────────────────────────────────
const REGION_EMOJI: Record<string, string> = {
  BAGUETTE: "🥖",
  PIMBO: "🍞",
  PRETZEL: "🥨",
  CROISSANT: "🥐",
  "SIN GLUTEN": "🌾",
  "PAN PLANO": "🫓",
};

const REGIONES = ["BAGUETTE", "PIMBO", "PRETZEL", "CROISSANT", "SIN GLUTEN", "PAN PLANO"];

// Rutas entre regiones (panel estilo Renfe)
const RUTAS = [
  { origen: "BAGUETTE", destino: "PIMBO", duracion: "32 min", tipo: "Interregional" },
  { origen: "BAGUETTE", destino: "PRETZEL", duracion: "48 min", tipo: "Interregional" },
  { origen: "PIMBO", destino: "CROISSANT", duracion: "25 min", tipo: "Interregional" },
  { origen: "PIMBO", destino: "SIN GLUTEN", duracion: "41 min", tipo: "Interregional" },
  { origen: "PRETZEL", destino: "PAN PLANO", duracion: "55 min", tipo: "Interregional" },
  { origen: "CROISSANT", destino: "SIN GLUTEN", duracion: "19 min", tipo: "Interregional" },
  { origen: "SIN GLUTEN", destino: "PAN PLANO", duracion: "37 min", tipo: "Interregional" },
  { origen: "BAGUETTE", destino: "CROISSANT", duracion: "1h 10m", tipo: "Largo recorrido" },
  { origen: "PRETZEL", destino: "PIMBO", duracion: "1h 02m", tipo: "Largo recorrido" },
  { origen: "PAN PLANO", destino: "BAGUETTE", duracion: "1h 28m", tipo: "Largo recorrido" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

function avatarUrl(user: DiscordUser) {
  if (!user.avatar) return `https://cdn.discordapp.com/embed/avatars/0.png`;
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Consorcio() {
  const [tarjeta, setTarjeta] = useState<TarjetaData | null>(null);
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [emitiendo, setEmitiendo] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [filtroOrigen, setFiltroOrigen] = useState<string>("TODOS");
  const [tick, setTick] = useState(0); // para animar el panel

  // Simular sesión Discord (en producción vendrá de tu auth)
  useEffect(() => {
    const mockUser: DiscordUser = {
      id: "123456789012345678",
      username: "ciudadano_pan",
      global_name: "Ciudadano del Pan",
      avatar: null,
    };
    setUser(mockUser);
    fetchTarjeta(mockUser.id);
  }, []);

  // Animación del ticker del panel
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  async function fetchTarjeta(discordId: string) {
    setLoading(true);
    setError(null);
    try {
      // En producción: supabase.rpc('consultar_tarjeta', { p_discord_id: discordId })
      // Mock para desarrollo:
      await new Promise(r => setTimeout(r, 800));
      setTarjeta(null); // sin tarjeta aún → mostrar botón de emisión
    } catch (e) {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  async function emitirTarjeta() {
    if (!user) return;
    setEmitiendo(true);
    setError(null);
    try {
      // En producción: supabase.rpc('emitir_o_renovar_tarjeta', { p_discord_id: user.id })
      await new Promise(r => setTimeout(r, 1200));
      const mockTarjeta: TarjetaData = {
        numero_tarjeta: "CTPAN-10000001",
        nombre: "Ana",
        apellidos: "García Molina",
        region: "BAGUETTE",
        dpi: "DPI - 000001A",
        discord_id: user.id,
        emitida_at: new Date().toISOString(),
        caduca_at: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
        activa: true,
        caducada: false,
        renovaciones: 0,
        ultima_renovacion: null,
      };
      setTarjeta(mockTarjeta);
      const qr = await QRCode.toDataURL(
        `CTPAN:${mockTarjeta.numero_tarjeta}:${mockTarjeta.dpi}`,
        { width: 200, margin: 1, color: { dark: "#2a1a1a", light: "#ffffff" } }
      );
      setQrUrl(qr);
    } catch (e) {
      setError("Error al emitir la tarjeta. Inténtalo de nuevo.");
    } finally {
      setEmitiendo(false);
    }
  }

  async function renovarTarjeta() {
    if (!user || !tarjeta) return;
    setEmitiendo(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      const renovada = {
        ...tarjeta,
        emitida_at: new Date().toISOString(),
        caduca_at: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
        caducada: false,
        renovaciones: tarjeta.renovaciones + 1,
        ultima_renovacion: new Date().toISOString(),
      };
      setTarjeta(renovada);
    } finally {
      setEmitiendo(false);
    }
  }

  // Generar QR cuando llega la tarjeta
  useEffect(() => {
    if (!tarjeta) return;
    QRCode.toDataURL(
      `CTPAN:${tarjeta.numero_tarjeta}:${tarjeta.dpi}`,
      { width: 200, margin: 1, color: { dark: "#2a1a1a", light: "#ffffff" } }
    ).then(setQrUrl).catch(() => { });
  }, [tarjeta]);

  const rutasFiltradas = filtroOrigen === "TODOS"
    ? RUTAS
    : RUTAS.filter(r => r.origen === filtroOrigen || r.destino === filtroOrigen);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=Barlow:wght@400;500;600&display=swap');

        :root {
          --rosa:       #C4697A;
          --rosa-deep:  #9e4455;
          --rosa-light: #d9909e;
          --rosa-pale:  #f5e8eb;
          --cream:      #fdf8f6;
          --dark:       #1a0d10;
          --mid:        #4a2830;
          --text:       #2d1218;
          --muted:      #8a6068;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body, #root {
          background: var(--cream);
          font-family: 'Barlow', sans-serif;
          color: var(--text);
          min-height: 100vh;
        }

        /* ── Header ── */
        .header {
          background: var(--dark);
          padding: 16px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .header-logo {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .header-logo img {
          height: 52px;
          width: auto;
        }
        .header-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 900;
          font-size: 1.1rem;
          color: white;
          line-height: 1.2;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }
        .header-title span {
          display: block;
          font-weight: 400;
          font-size: 0.75rem;
          color: var(--rosa-light);
          letter-spacing: 0.15em;
        }
        .header-user {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .header-user img {
          width: 36px; height: 36px;
          border-radius: 50%;
          border: 2px solid var(--rosa);
        }
        .header-user-name {
          font-size: 0.85rem;
          color: #ccc;
          font-weight: 500;
        }

        /* ── Main layout ── */
        .main {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px 80px;
        }

        /* ── Sección título ── */
        .section-eyebrow {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--rosa);
          margin-bottom: 6px;
        }
        .section-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 2.2rem;
          font-weight: 900;
          color: var(--dark);
          text-transform: uppercase;
          line-height: 1;
          margin-bottom: 32px;
        }

        /* ── Estado vacío ── */
        .empty-state {
          background: white;
          border: 2px dashed var(--rosa-light);
          border-radius: 20px;
          padding: 60px 40px;
          text-align: center;
          margin-bottom: 40px;
        }
        .empty-icon {
          font-size: 3.5rem;
          margin-bottom: 16px;
        }
        .empty-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 800;
          font-size: 1.5rem;
          text-transform: uppercase;
          color: var(--dark);
          margin-bottom: 8px;
        }
        .empty-sub {
          color: var(--muted);
          font-size: 0.95rem;
          margin-bottom: 28px;
          max-width: 380px;
          margin-left: auto;
          margin-right: auto;
        }

        /* ── Botón principal ── */
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--rosa);
          color: white;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 800;
          font-size: 1rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 14px 32px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
        }
        .btn-primary:hover { background: var(--rosa-deep); transform: translateY(-1px); }
        .btn-primary:active { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          color: var(--rosa);
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          font-size: 0.9rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 10px 20px;
          border-radius: 8px;
          border: 2px solid var(--rosa);
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-secondary:hover { background: var(--rosa); color: white; }
        .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── Tarjeta 3D flip ── */
        .card-scene {
          perspective: 1200px;
          margin-bottom: 12px;
        }
        .card-flip {
          width: 100%;
          max-width: 520px;
          aspect-ratio: 85.6 / 54;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.65s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          margin: 0 auto;
        }
        .card-flip.is-flipped {
          transform: rotateY(180deg);
        }
        .card-face {
          position: absolute;
          inset: 0;
          border-radius: 16px;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(196, 105, 122, 0.3), 0 4px 16px rgba(0,0,0,0.15);
        }

        /* Delantera */
        .card-front {
          background: #c4697a;
        }
        .card-front img.card-bg {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Trasera */
        .card-back {
          transform: rotateY(180deg);
          background: linear-gradient(135deg, #1a0d10 0%, #2d1218 60%, #3d1a22 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 18px 22px 16px;
        }
        .card-back-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .card-back-logo {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 900;
          font-size: 0.75rem;
          color: var(--rosa-light);
          text-transform: uppercase;
          line-height: 1.2;
          letter-spacing: 0.05em;
        }
        .card-back-numero {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.12em;
          text-align: right;
        }
        .card-back-body {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .card-back-datos {
          flex: 1;
        }
        .card-back-nombre {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 900;
          font-size: 1.15rem;
          color: white;
          text-transform: uppercase;
          line-height: 1.1;
          letter-spacing: 0.03em;
        }
        .card-back-detalle {
          font-size: 0.65rem;
          color: rgba(255,255,255,0.55);
          margin-top: 4px;
          line-height: 1.6;
          letter-spacing: 0.04em;
        }
        .card-back-detalle strong {
          color: var(--rosa-light);
          font-weight: 600;
        }
        .card-back-qr {
          width: 64px; height: 64px;
          background: white;
          border-radius: 6px;
          padding: 3px;
          flex-shrink: 0;
          margin-left: 14px;
        }
        .card-back-qr img {
          width: 100%; height: 100%;
          display: block;
        }
        .card-back-strip {
          height: 28px;
          background: rgba(255,255,255,0.07);
          border-radius: 4px;
          display: flex;
          align-items: center;
          padding: 0 10px;
        }
        .card-back-strip-text {
          font-size: 0.58rem;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        /* ── Flip hint ── */
        .flip-hint {
          text-align: center;
          font-size: 0.75rem;
          color: var(--muted);
          margin-bottom: 32px;
          letter-spacing: 0.05em;
        }
        .flip-hint button {
          background: none;
          border: none;
          color: var(--rosa);
          font-size: 0.75rem;
          cursor: pointer;
          font-weight: 600;
          text-decoration: underline;
          padding: 0 4px;
        }

        /* ── Info cards debajo de la tarjeta ── */
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 40px;
        }
        @media (max-width: 600px) {
          .info-grid { grid-template-columns: 1fr; }
        }
        .info-card {
          background: white;
          border-radius: 14px;
          padding: 20px 22px;
          border: 1px solid #f0dde0;
        }
        .info-card-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--rosa);
          margin-bottom: 4px;
        }
        .info-card-value {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 800;
          font-size: 1.2rem;
          color: var(--dark);
          text-transform: uppercase;
        }
        .info-card-sub {
          font-size: 0.78rem;
          color: var(--muted);
          margin-top: 2px;
        }

        /* Badge caducada */
        .badge-ok {
          display: inline-block;
          background: #d4edda;
          color: #1a6630;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-top: 4px;
        }
        .badge-warn {
          display: inline-block;
          background: #fff3cd;
          color: #856404;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-top: 4px;
        }

        /* QR grande debajo */
        .qr-section {
          background: white;
          border-radius: 14px;
          padding: 24px;
          border: 1px solid #f0dde0;
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 40px;
        }
        .qr-section img {
          width: 100px; height: 100px;
          border-radius: 6px;
          flex-shrink: 0;
        }
        .qr-info-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 800;
          font-size: 1rem;
          text-transform: uppercase;
          color: var(--dark);
          margin-bottom: 4px;
        }
        .qr-info-sub {
          font-size: 0.82rem;
          color: var(--muted);
          line-height: 1.5;
        }

        /* ── Panel de rutas ── */
        .panel-rutas {
          background: var(--dark);
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 40px;
        }
        .panel-header {
          background: rgba(255,255,255,0.05);
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .panel-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .panel-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 6px #4ade80;
          animation: blink 2s infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .panel-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 800;
          font-size: 0.85rem;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }
        .panel-time {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.78rem;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.08em;
        }

        /* Filtro */
        .panel-filter {
          padding: 12px 24px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          overflow-x: auto;
        }
        .filter-btn {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.15);
          background: transparent;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .filter-btn:hover { border-color: var(--rosa-light); color: var(--rosa-light); }
        .filter-btn.active { background: var(--rosa); border-color: var(--rosa); color: white; }

        /* Filas del panel */
        .panel-row {
          display: grid;
          grid-template-columns: 1fr 24px 1fr 80px 120px;
          align-items: center;
          gap: 8px;
          padding: 14px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s;
        }
        .panel-row:hover { background: rgba(255,255,255,0.03); }
        .panel-row:last-child { border-bottom: none; }
        .panel-estacion {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          font-size: 0.88rem;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .panel-estacion-emoji {
          font-size: 0.9rem;
          margin-right: 4px;
        }
        .panel-arrow {
          color: var(--rosa-light);
          font-size: 0.9rem;
          text-align: center;
        }
        .panel-duracion {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 0.8rem;
          color: #4ade80;
          text-align: right;
          letter-spacing: 0.04em;
        }
        .panel-tipo {
          font-size: 0.68rem;
          padding: 3px 8px;
          border-radius: 4px;
          text-align: center;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .tipo-inter { background: rgba(196,105,122,0.2); color: var(--rosa-light); }
        .tipo-largo { background: rgba(250,200,60,0.15); color: #f5c842; }

        @media (max-width: 600px) {
          .panel-row {
            grid-template-columns: 1fr 18px 1fr 60px;
            font-size: 0.78rem;
          }
          .panel-tipo { display: none; }
        }

        /* ── Banner ── */
        .banner {
          background: linear-gradient(135deg, var(--rosa-deep) 0%, var(--rosa) 50%, var(--rosa-light) 100%);
          border-radius: 16px;
          padding: 28px 32px;
          display: flex;
          align-items: center;
          gap: 20px;
          overflow: hidden;
          position: relative;
        }
        .banner::before {
          content: '';
          position: absolute;
          right: -40px; top: -40px;
          width: 200px; height: 200px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          pointer-events: none;
        }
        .banner::after {
          content: '';
          position: absolute;
          right: 60px; bottom: -60px;
          width: 140px; height: 140px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
          pointer-events: none;
        }
        .banner-icon {
          font-size: 2.4rem;
          flex-shrink: 0;
        }
        .banner-text {}
        .banner-eyebrow {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.7);
          margin-bottom: 4px;
        }
        .banner-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 900;
          font-size: 1.4rem;
          color: white;
          text-transform: uppercase;
          line-height: 1.1;
          letter-spacing: 0.02em;
        }
        .banner-sub {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.75);
          margin-top: 6px;
        }

        /* Loading */
        .loading-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 0;
          gap: 16px;
        }
        .spinner {
          width: 40px; height: 40px;
          border: 3px solid var(--rosa-pale);
          border-top-color: var(--rosa);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-text {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.85rem;
          color: var(--muted);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        /* Error */
        .error-box {
          background: #fff5f5;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 14px 18px;
          color: #991b1b;
          font-size: 0.88rem;
          margin-bottom: 20px;
        }
      `}</style>

      {/* ── Header ── */}
      <header className="header">
        <div className="header-logo">
          <img src="/CONSORCIO/consorcio.png" alt="Consorcio Transportes" />
          <div className="header-title">
            Consorcio de Transportes
            <span>Reino del Pan · Sede Electrónica</span>
          </div>
        </div>
        {user && (
          <div className="header-user">
            <img src={avatarUrl(user)} alt={user.username} />
            <span className="header-user-name">{user.global_name || user.username}</span>
          </div>
        )}
      </header>

      {/* ── Main ── */}
      <main className="main">
        <p className="section-eyebrow">Sede Electrónica · Transportes</p>
        <h1 className="section-title">Tu Tarjeta de Transporte</h1>

        {error && <div className="error-box">⚠️ {error}</div>}

        {loading ? (
          <div className="loading-wrap">
            <div className="spinner" />
            <p className="loading-text">Consultando tu tarjeta…</p>
          </div>
        ) : !tarjeta ? (
          /* ── Sin tarjeta ── */
          <div className="empty-state">
            <div className="empty-icon">🪪</div>
            <div className="empty-title">Aún no tienes tarjeta</div>
            <p className="empty-sub">
              Solicita tu Tarjeta de Transporte gratuita del Consorcio. Válida 1 año en todas las regiones del Reino del Pan.
            </p>
            <button className="btn-primary" onClick={emitirTarjeta} disabled={emitiendo}>
              {emitiendo ? "⏳ Emitiendo…" : "🪪 Solicitar mi tarjeta"}
            </button>
          </div>
        ) : (
          <>
            {/* ── Tarjeta flip ── */}
            <div className="card-scene">
              <div
                className={`card-flip${flipped ? " is-flipped" : ""}`}
                onClick={() => setFlipped(f => !f)}
                title="Haz clic para girar la tarjeta"
              >
                {/* Delantera */}
                <div className="card-face card-front">
                  <img
                    className="card-bg"
                    src="/CONSORCIO/tarjeta.jpg"
                    alt="Tarjeta Transporte"
                  />
                </div>

                {/* Trasera */}
                <div className="card-face card-back">
                  <div className="card-back-header">
                    <div className="card-back-logo">
                      Consorcio<br />Transportes
                    </div>
                    <div className="card-back-numero">
                      {tarjeta.numero_tarjeta}
                    </div>
                  </div>

                  <div className="card-back-strip">
                    <span className="card-back-strip-text">
                      ███████████████████████████████████████████
                    </span>
                  </div>

                  <div className="card-back-body">
                    <div className="card-back-datos">
                      <div className="card-back-nombre">
                        {tarjeta.nombre} {tarjeta.apellidos}
                      </div>
                      <div className="card-back-detalle">
                        <strong>DPI</strong> {tarjeta.dpi}<br />
                        <strong>REGIÓN</strong> {REGION_EMOJI[tarjeta.region]} {tarjeta.region}<br />
                        <strong>VÁLIDA HASTA</strong> {fmt(tarjeta.caduca_at)}
                      </div>
                    </div>
                    {qrUrl && (
                      <div className="card-back-qr">
                        <img src={qrUrl} alt="QR de tarjeta" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <p className="flip-hint">
              Haz clic en la tarjeta para girarla ·
              <button onClick={() => setFlipped(f => !f)}>
                ver {flipped ? "delantera" : "trasera"}
              </button>
            </p>

            {/* ── Info grid ── */}
            <div className="info-grid">
              <div className="info-card">
                <div className="info-card-label">Titular</div>
                <div className="info-card-value">{tarjeta.nombre} {tarjeta.apellidos}</div>
                <div className="info-card-sub">DPI: {tarjeta.dpi}</div>
              </div>
              <div className="info-card">
                <div className="info-card-label">Región</div>
                <div className="info-card-value">
                  {REGION_EMOJI[tarjeta.region]} {tarjeta.region}
                </div>
                <div className="info-card-sub">Zona de origen</div>
              </div>
              <div className="info-card">
                <div className="info-card-label">Emisión</div>
                <div className="info-card-value" style={{ fontSize: "1rem" }}>{fmt(tarjeta.emitida_at)}</div>
                {tarjeta.renovaciones > 0 && (
                  <div className="info-card-sub">{tarjeta.renovaciones} renovación(es)</div>
                )}
              </div>
              <div className="info-card">
                <div className="info-card-label">Caducidad</div>
                <div className="info-card-value" style={{ fontSize: "1rem" }}>{fmt(tarjeta.caduca_at)}</div>
                {tarjeta.caducada
                  ? <span className="badge-warn">⚠️ Caducada</span>
                  : <span className="badge-ok">✓ Vigente</span>
                }
              </div>
            </div>

            {/* ── QR + acción renovar ── */}
            {qrUrl && (
              <div className="qr-section">
                <img src={qrUrl} alt="QR Tarjeta" />
                <div>
                  <div className="qr-info-title">Código QR de verificación</div>
                  <div className="qr-info-sub">
                    Presenta este código en los tornos de acceso.<br />
                    Número: <strong>{tarjeta.numero_tarjeta}</strong>
                  </div>
                  {(tarjeta.caducada) && (
                    <button
                      className="btn-primary"
                      style={{ marginTop: 14 }}
                      onClick={renovarTarjeta}
                      disabled={emitiendo}
                    >
                      {emitiendo ? "⏳ Renovando…" : "🔄 Renovar tarjeta"}
                    </button>
                  )}
                  {!tarjeta.caducada && (
                    <button
                      className="btn-secondary"
                      style={{ marginTop: 14 }}
                      onClick={renovarTarjeta}
                      disabled={emitiendo}
                    >
                      {emitiendo ? "⏳ Renovando…" : "🔄 Renovar anticipadamente"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Panel de rutas (siempre visible) ── */}
        <div className="panel-rutas">
          <div className="panel-header">
            <div className="panel-header-left">
              <div className="panel-dot" />
              <span className="panel-title">Rutas Interregionales — En Servicio</span>
            </div>
            <span className="panel-time">
              {new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          <div className="panel-filter">
            <button
              className={`filter-btn${filtroOrigen === "TODOS" ? " active" : ""}`}
              onClick={() => setFiltroOrigen("TODOS")}
            >
              Todas
            </button>
            {REGIONES.map(r => (
              <button
                key={r}
                className={`filter-btn${filtroOrigen === r ? " active" : ""}`}
                onClick={() => setFiltroOrigen(r)}
              >
                {REGION_EMOJI[r]} {r}
              </button>
            ))}
          </div>

          {rutasFiltradas.map((ruta, i) => (
            <div className="panel-row" key={i}>
              <div className="panel-estacion">
                <span className="panel-estacion-emoji">{REGION_EMOJI[ruta.origen]}</span>
                {ruta.origen}
              </div>
              <div className="panel-arrow">→</div>
              <div className="panel-estacion">
                <span className="panel-estacion-emoji">{REGION_EMOJI[ruta.destino]}</span>
                {ruta.destino}
              </div>
              <div className="panel-duracion">{ruta.duracion}</div>
              <div className={`panel-tipo ${ruta.tipo === "Interregional" ? "tipo-inter" : "tipo-largo"}`}>
                {ruta.tipo}
              </div>
            </div>
          ))}
        </div>

        {/* ── Banner próximamente ── */}
        <div className="banner">
          <div className="banner-icon">🌍</div>
          <div className="banner-text">
            <div className="banner-eyebrow">Próximamente</div>
            <div className="banner-title">
              Muy pronto el abono cubrirá<br />viajes fuera del Reino del Pan
            </div>
            <div className="banner-sub">
              Estamos trabajando en acuerdos con territorios vecinos para ampliar la red de transporte.
            </div>
          </div>
        </div>
      </main>
    </>
  );
}