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

// Si tu frontend corre en un dominio distinto, pon aquí la URL de tu API (ej: "http://localhost:3000")
// Si sirves el frontend desde el mismo servidor Express, déjalo vacío ""
const API_BASE_URL = "";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Consorcio() {
  const [tarjeta, setTarjeta] = useState<TarjetaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [emitiendo, setEmitiendo] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [filtroOrigen, setFiltroOrigen] = useState<string>("TODOS");
  const [tick, setTick] = useState(0);
  const [vistaEscaneada, setVistaEscaneada] = useState<boolean>(false);

  // Llamar a la API al montar el componente (El backend identifica al usuario vía sesión/cookie)
  useEffect(() => {
    fetchTarjeta();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  // 1. GET /api/transporte/tarjeta
  async function fetchTarjeta() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/transporte/tarjeta`);
      const data = await response.json();

      if (response.ok) {
        // Tu backend devuelve { tarjeta: ... } o { tarjeta: null }
        setTarjeta(data.tarjeta || null);
      } else {
        setError(data.error || "Error al consultar los datos de transporte.");
      }
    } catch (e) {
      setError("No se pudo establecer conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  // 2. POST /api/transporte/tarjeta/solicitar
  async function emitirTarjeta() {
    setEmitiendo(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/transporte/tarjeta/solicitar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo emitir la tarjeta.");
      }

      // Tu backend devuelve { success: true, tarjeta: nuevaTarjeta }
      setTarjeta(data.tarjeta);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setEmitiendo(false);
    }
  }

  // 3. POST /api/transporte/tarjeta/renovar
  async function renovarTarjeta() {
    setEmitiendo(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/transporte/tarjeta/renovar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo procesar la renovación.");
      }

      // Tu backend devuelve { success: true, tarjeta: tarjetaRenovada }
      setTarjeta(data.tarjeta);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setEmitiendo(false);
    }
  }

  // Generar código QR basado en el número de tarjeta real devuelto por la DB
  useEffect(() => {
    if (!tarjeta || !tarjeta.numero_tarjeta) return;
    const urlSimulada = `https://consorciopan.gob/validar/${tarjeta.numero_tarjeta}`;

    QRCode.toDataURL(
      urlSimulada,
      { width: 250, margin: 1, color: { dark: "#1a0d10", light: "#ffffff" } }
    ).then(setQrUrl).catch(() => { });
  }, [tarjeta]);

  const rutasFiltradas = filtroOrigen === "TODOS"
    ? RUTAS
    : RUTAS.filter(r => r.origen === filtroOrigen || r.destino === filtroOrigen);

  // ── Vista de Escaneo Alternativa ───────────────────────────────────────────
  if (vistaEscaneada && tarjeta) {
    return (
      <div className="scanner-view">
        <style>{`
          .scanner-view {
            background: #120a0c;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            font-family: 'Barlow', sans-serif;
            color: white;
          }
          .virtual-ticket {
            background: #1a0d10;
            border: 2px solid #C4697A;
            border-radius: 24px;
            width: 100%;
            max-width: 450px;
            overflow: hidden;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          }
          .ticket-header {
            background: linear-gradient(135deg, #C4697A, #9e4455);
            padding: 24px;
            text-align: center;
            border-bottom: 2px dashed #1a0d10;
            position: relative;
          }
          .ticket-header::before, .ticket-header::after {
            content: '';
            position: absolute;
            bottom: -10px;
            width: 20px;
            height: 20px;
            background: #120a0c;
            border-radius: 50%;
          }
          .ticket-header::before { left: -10px; }
          .ticket-header::after { right: -10px; }
          
          .ticket-status {
            background: #4ade80;
            color: #102a19;
            font-family: 'Barlow Condensed', sans-serif;
            font-weight: 900;
            font-size: 1rem;
            padding: 6px 16px;
            border-radius: 50px;
            display: inline-block;
            margin-top: 10px;
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }
          .ticket-status.invalid {
            background: #f87171;
            color: #7f1d1d;
          }
          .ticket-body {
            padding: 30px 24px;
          }
          .ticket-field {
            margin-bottom: 20px;
          }
          .ticket-label {
            font-family: 'Barlow Condensed', sans-serif;
            font-size: 0.75rem;
            color: #d9909e;
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }
          .ticket-value {
            font-size: 1.2rem;
            font-weight: 600;
            color: #fdf8f6;
            margin-top: 2px;
          }
          .ticket-footer {
            background: rgba(255,255,255,0.02);
            padding: 20px 24px;
            text-align: center;
            border-top: 1px dashed rgba(255,255,255,0.1);
          }
          .btn-back {
            background: transparent;
            border: 1px solid #8a6068;
            color: #d9909e;
            padding: 10px 20px;
            border-radius: 10px;
            cursor: pointer;
            font-family: 'Barlow Condensed', sans-serif;
            font-weight: 700;
            text-transform: uppercase;
            transition: all 0.2s;
          }
          .btn-back:hover {
            background: rgba(196, 105, 122, 0.1);
            color: white;
            border-color: #C4697A;
          }
        `}</style>
        <div className="virtual-ticket">
          <div className="ticket-header">
            <h2 style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Consorcio de Transportes
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#f5e8eb' }}>Verificación Digital de Identidad</p>
            <div className={`ticket-status ${!tarjeta.activa || tarjeta.caducada ? 'invalid' : ''}`}>
              {!tarjeta.activa || tarjeta.caducada ? "❌ Tarjeta Inactiva / Vencida" : "✓ Tarjeta Válida / Activa"}
            </div>
          </div>

          <div className="ticket-body">
            <div className="ticket-field">
              <div className="ticket-label">ID de Tarjeta Virtual</div>
              <div className="ticket-value" style={{ fontFamily: 'monospace', color: '#C4697A' }}>{tarjeta.numero_tarjeta}</div>
            </div>
            <div className="ticket-field">
              <div className="ticket-label">Titular de la tarjeta</div>
              <div className="ticket-value">{tarjeta.nombre} {tarjeta.apellidos}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="ticket-field">
                <div className="ticket-label">Documento (DPI)</div>
                <div className="ticket-value">{tarjeta.dpi}</div>
              </div>
              <div className="ticket-field">
                <div className="ticket-label">Región Origen</div>
                <div className="ticket-value">{REGION_EMOJI[tarjeta.region] || "🥖"} {tarjeta.region}</div>
              </div>
            </div>
            <div className="ticket-field" style={{ marginBottom: 0 }}>
              <div className="ticket-label">Periodo de Vigencia</div>
              <div className="ticket-value" style={{ fontSize: '0.95rem' }}>
                Hasta el {fmt(tarjeta.caduca_at)}
              </div>
            </div>
          </div>

          <div className="ticket-footer">
            <button className="btn-back" onClick={() => setVistaEscaneada(false)}>
              Volver a la Sede Electrónica
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          text-transform: uppercase;
        }

        .main {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px 80px;
        }

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

        .card-front {
          background: #c4697a;
        }
        .card-front img.card-bg {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
        }

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
        .badge-fail {
          display: inline-block;
          background: #fde8e8;
          color: #9b1c1c;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-top: 4px;
        }

        .qr-section {
          background: white;
          border-radius: 14px;
          padding: 24px;
          border: 2px solid var(--rosa-light);
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 40px;
          position: relative;
        }
        .qr-section-clickable {
          cursor: pointer;
          transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
        }
        .qr-section-clickable:hover {
          transform: translateY(-2px);
          border-color: var(--rosa);
          box-shadow: 0 8px 24px rgba(196,105,122,0.15);
        }
        .qr-section img {
          width: 100px; height: 100px;
          border-radius: 6px;
          flex-shrink: 0;
          background: #fdf8f6;
          border: 1px solid #f0dde0;
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
          margin-bottom: 8px;
        }
        .qr-hint-badge {
          background: var(--dark);
          color: #fafafa;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          font-size: 0.65rem;
          padding: 3px 8px;
          border-radius: 4px;
          display: inline-block;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

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

        .panel-filter {
          padding: 12px 24px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          border-bottom: 1px solid rgba(255,255,255,0.05);
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
        }
        .filter-btn:hover { border-color: var(--rosa-light); color: var(--rosa-light); }
        .filter-btn.active { background: var(--rosa); border-color: var(--rosa); color: white; }

        .panel-row {
          display: grid;
          grid-template-columns: 1fr 24px 1fr 80px 120px;
          align-items: center;
          gap: 8px;
          padding: 14px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
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
        .panel-estacion-emoji { margin-right: 4px; }
        .panel-arrow { color: var(--rosa-light); font-size: 0.9rem; text-align: center; }
        .panel-duracion {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 0.8rem;
          color: #4ade80;
          text-align: right;
        }
        .panel-tipo {
          font-size: 0.68rem; padding: 3px 8px; border-radius: 4px; text-align: center; font-weight: 600;
          text-transform: uppercase;
        }
        .tipo-inter { background: rgba(196,105,122,0.2); color: var(--rosa-light); }
        .tipo-largo { background: rgba(250,200,60,0.15); color: #f5c842; }

        @media (max-width: 600px) {
          .panel-row { grid-template-columns: 1fr 18px 1fr 60px; font-size: 0.78rem; }
          .panel-tipo { display: none; }
        }

        .loading-wrap { display: flex; flex-direction: column; align-items: center; padding: 80px 0; gap: 16px; }
        .spinner { width: 40px; height: 40px; border: 3px solid var(--rosa-pale); border-top-color: var(--rosa); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-text { font-family: 'Barlow Condensed', sans-serif; font-size: 0.85rem; color: var(--muted); text-transform: uppercase; }
        .error-box { background: #fff5f5; border: 1px solid #fecaca; border-radius: 10px; padding: 14px 18px; color: #991b1b; margin-bottom: 20px; font-weight: 500; font-size: 0.95rem; }
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
      </header>

      {/* ── Main ── */}
      <main className="main">
        <p className="section-eyebrow">Sede Electrónica · Transportes</p>
        <h1 className="section-title">Tu Tarjeta de Transporte</h1>

        {error && <div className="error-box">⚠️ {error}</div>}

        {loading ? (
          <div className="loading-wrap">
            <div className="spinner" />
            <p className="loading-text">Consultando tu tarjeta en el Consorcio…</p>
          </div>
        ) : !tarjeta ? (
          <div className="empty-state">
            <div className="empty-icon">🪪</div>
            <div className="empty-title">No dispones de ninguna tarjeta registrada</div>
            <p className="empty-sub">
              El sistema vinculará automáticamente tu firma oficial y tus datos del DPI verificado del Reino del Pan.
            </p>
            <button className="btn-primary" onClick={emitirTarjeta} disabled={emitiendo}>
              {emitiendo ? "⏳ Procesando Alta…" : "🪪 Solicitar alta del abono"}
            </button>
          </div>
        ) : (
          <>
            {/* ── Tarjeta Interactiva ── */}
            <div className="card-scene">
              <div
                className={`card-flip${flipped ? " is-flipped" : ""}`}
                onClick={() => setFlipped(f => !f)}
                title="Haz clic para voltear"
              >
                {/* Cara Delantera */}
                <div className="card-face card-front">
                  <img
                    className="card-bg"
                    src="/CONSORCIO/tarjeta.jpg"
                    alt="Tarjeta de Transporte Frente"
                  />
                </div>

                {/* Cara Trasera */}
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
                        <strong>REGIÓN</strong> {REGION_EMOJI[tarjeta.region] || "🥖"} {tarjeta.region}<br />
                        <strong>VÁLIDA HASTA</strong> {fmt(tarjeta.caduca_at)}
                      </div>
                    </div>
                    {qrUrl && (
                      <div className="card-back-qr" onClick={(e) => { e.stopPropagation(); setVistaEscaneada(true); }}>
                        <img src={qrUrl} alt="QR Inspection" />
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

            {/* ── QR Sección Interactiva (Simulador de Escaneo) ── */}
            {qrUrl && (
              <div
                className="qr-section qr-section-clickable"
                onClick={() => setVistaEscaneada(true)}
              >
                <img src={qrUrl} alt="QR interactivo" />
                <div>
                  <div className="qr-info-title">Código QR de Inspección</div>
                  <div className="qr-info-sub">Haz clic aquí para ver de forma independiente el resguardo digital oficial que leerán los tornos del metro y revisores.</div>
                  <span className="qr-hint-badge">Inspeccionar pase</span>
                </div>
              </div>
            )}

            {/* ── Información de Estado y Renovaciones ── */}
            <div className="info-grid">
              <div className="info-card">
                <div className="info-card-label">Estado de la tarjeta</div>
                <div className="info-card-value">
                  {tarjeta.activa && !tarjeta.caducada ? "Abierta / Operativa" : "Suspendida / Caducada"}
                </div>
                <span className={tarjeta.activa && !tarjeta.caducada ? "badge-ok" : "badge-fail"}>
                  {tarjeta.activa && !tarjeta.caducada ? "✓ Al día" : "❌ Requiere Acción"}
                </span>
              </div>

              <div className="info-card">
                <div className="info-card-label">Vigencia del Abono</div>
                <div className="info-card-value">{tarjeta.renovaciones} {tarjeta.renovaciones === 1 ? "Renovación" : "Renovaciones"}</div>
                <button
                  className="btn-secondary"
                  style={{ marginTop: "8px", padding: "6px 12px", fontSize: "0.75rem" }}
                  onClick={renovarTarjeta}
                  disabled={emitiendo}
                >
                  {emitiendo ? "Ampliando plazo..." : "🔄 Ampliar vigencia (+1 Año)"}
                </button>
              </div>
            </div>

            {/* ── Panel de rutas en tiempo real ── */}
            <div className="panel-rutas">
              <div className="panel-header">
                <div className="panel-header-left">
                  <div className="panel-dot" />
                  <div className="panel-title">Líneas y conexiones del Consorcio</div>
                </div>
                <div className="panel-time">Sincronizado · tick {tick}</div>
              </div>

              <div className="panel-filter">
                <button
                  className={`filter-btn ${filtroOrigen === "TODOS" ? "active" : ""}`}
                  onClick={() => setFiltroOrigen("TODOS")}
                >
                  Ver Todo
                </button>
                {REGIONES.map(r => (
                  <button
                    key={r}
                    className={`filter-btn ${filtroOrigen === r ? "active" : ""}`}
                    onClick={() => setFiltroOrigen(r)}
                  >
                    {REGION_EMOJI[r] || "🥖"} {r}
                  </button>
                ))}
              </div>

              {rutasFiltradas.map((r, idx) => (
                <div className="panel-row" key={idx}>
                  <div className="panel-estacion">
                    <span className="panel-estacion-emoji">{REGION_EMOJI[r.origen]}</span> {r.origen}
                  </div>
                  <div className="panel-arrow">➔</div>
                  <div className="panel-estacion">
                    <span className="panel-estacion-emoji">{REGION_EMOJI[r.destino]}</span> {r.destino}
                  </div>
                  <div className="panel-duracion">{r.duracion}</div>
                  <div className={`panel-tipo ${r.tipo === "Interregional" ? "tipo-inter" : "tipo-largo"}`}>
                    {r.tipo}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}