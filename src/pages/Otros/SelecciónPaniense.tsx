import { useState, useMemo, useEffect, useCallback } from "react";

/**
 * RUTA OBLIGATORIA MANDADA POR EL USUARIO
 */
const PAN_CREST_PATH = "public/Otros/EscudoSelección.png";

// Token de football-data.org.
const API_TOKEN = "9426f43277cb4a23b10c660dd7e9bf9b";

// Competiciones internacionales activas para traer partidos reales y recientes
const COMPETICIONES_SELECCIONES = ["WC", "EC"];

const PAISES_UEFA = ["spain", "france", "germany", "england", "italy", "portugal", "netherlands", "belgium", "croatia", "switzerland", "poland", "denmark", "serbia", "scotland", "austria", "wales", "ukraine", "turkey", "norway", "sweden"];
const PAISES_CONMEBOL = ["argentina", "brazil", "uruguay", "colombia", "ecuador", "chile", "paraguay", "peru", "venezuela", "bolivia"];

interface APIEquipo {
  name: string;
  crest: string;
}

interface APIPartidoReal {
  id: number;
  homeTeam: APIEquipo;
  awayTeam: APIEquipo;
  score: { fullTime: { home: number | null; away: number | null } };
  utcDate: string;
  status: string;
  competition: { name: string; code: string };
}

interface PartidoProcesado {
  id: string | number;
  local: string;
  visitante: string;
  golesL: number | null;
  golesV: number | null;
  fecha: string;
  conf: "UEFA" | "CONMEBOL" | "INTER";
  logoL: string | null;
  logoV: string | null;
  ficticio: boolean;
}

function inferConfederacion(nombrePais: string): "UEFA" | "CONMEBOL" | "INTER" {
  const n = nombrePais.toLowerCase();
  if (PAISES_UEFA.some((p) => n.includes(p))) return "UEFA";
  if (PAISES_CONMEBOL.some((p) => n.includes(p))) return "CONMEBOL";
  return "INTER";
}

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

export default function SeleccionPanienseWeb() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedConfederation, setSelectedConfederation] = useState("TODOS");
  const [searchQuery, setSearchQuery] = useState("");

  const [partidosAPI, setPartidosAPI] = useState<PartidoProcesado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorAPI, setErrorAPI] = useState<string | null>(null);

  // Marcador editable del amistoso de la Selección Paniense
  const [golesPan, setGolesPan] = useState(3);
  const [golesRival, setGolesRival] = useState(2);

  const obtenerPartidosRecientes = useCallback(async () => {
    setCargando(true);
    setErrorAPI(null);
    try {
      const respuestas = await Promise.all(
        COMPETICIONES_SELECCIONES.map((codigo) => {
          const urlOriginal = `https://api.football-data.org/v4/competitions/${codigo}/matches?status=FINISHED`;
          const urlConProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(urlOriginal)}`;

          return fetch(urlConProxy)
            .then((res) => {
              if (res.ok) return res.json();
              throw new Error(`${codigo}: HTTP ${res.status}`);
            })
            .then((wrapper) => {
              const datosReales = JSON.parse(wrapper.contents);
              return datosReales;
            });
        })
      );

      const todos: APIPartidoReal[] = respuestas.flatMap((d) => (Array.isArray(d?.matches) ? d.matches : []));

      if (todos.length === 0) {
        throw new Error("La API no devolvió partidos activos actuales.");
      }

      const vistos = new Set<number>();
      const procesados: PartidoProcesado[] = todos
        .filter((m) => {
          if (vistos.has(m.id)) return false;
          vistos.add(m.id);
          return true;
        })
        .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())
        .slice(0, 15)
        .map((m) => ({
          id: m.id,
          local: m.homeTeam?.name ?? "Equipo local",
          visitante: m.awayTeam?.name ?? "Equipo visitante",
          golesL: m.score?.fullTime?.home ?? 0,
          golesV: m.score?.fullTime?.away ?? 0,
          fecha: formatearFecha(m.utcDate),
          conf: inferConfederacion(`${m.homeTeam?.name ?? ""} ${m.awayTeam?.name ?? ""}`),
          logoL: m.homeTeam?.crest || null,
          logoV: m.awayTeam?.crest || null,
          ficticio: false,
        }));

      setPartidosAPI(procesados);
    } catch (e) {
      setPartidosAPI([]);
      setErrorAPI(e instanceof Error ? e.message : "Error de CORS o conexión con el servidor");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    obtenerPartidosRecientes();
  }, [obtenerPartidosRecientes]);

  const resultadosFiltrados = useMemo(() => {
    const partidoPan: PartidoProcesado = {
      id: "pan-match",
      local: "Reino del Pan",
      visitante: "Portugal",
      golesL: golesPan,
      golesV: golesRival,
      fecha: "Amistoso Real",
      conf: "INTER",
      logoL: PAN_CREST_PATH,
      logoV: "https://crests.football-data.org/765.svg",
      ficticio: true,
    };

    return [partidoPan, ...partidosAPI].filter((p) => {
      const cumpleConf = selectedConfederation === "TODOS" || p.conf === selectedConfederation;
      const q = searchQuery.toLowerCase();
      const cumpleBusqueda = p.local.toLowerCase().includes(q) || p.visitante.toLowerCase().includes(q);
      return cumpleConf && cumpleBusqueda;
    });
  }, [partidosAPI, selectedConfederation, searchQuery, golesPan, golesRival]);

  const navLinks = [""];

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = "none";
    const fallback = target.nextElementSibling as HTMLDivElement;
    if (fallback) {
      fallback.style.display = "flex";
    }
  };

  return (
    <div className="pan-app-container">
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

                :root {
                    --pan-cream: #FBF7F0;
                    --pan-cream-soft: #F5EEE2;
                    --pan-ink: #1C1612;
                    --pan-ink-muted: #665E53;
                    --pan-wine: #7A0F17;
                    --pan-wine-dark: #4A050A;
                    --pan-gold: #C98A2B;
                    --pan-gold-light: #E9B458;
                    --pan-line: #E6DBC8;
                    --pan-radius: 12px;
                    --pan-shadow: 0 8px 30px rgba(36, 28, 22, 0.05);
                    --pan-shadow-hover: 0 16px 35px rgba(122, 15, 23, 0.12);
                }

                * { 
                    box-sizing: border-box; 
                    margin: 0; 
                    padding: 0;
                }

                body {
                    background-color: var(--pan-cream);
                }

                .pan-app-container {
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    background-color: var(--pan-cream);
                    color: var(--pan-ink);
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                }

                /* BANNER EN CONSTRUCCIÓN */
                .pan-construction-banner {
                    background-color: var(--pan-wine);
                    color: #ffffff;
                    text-align: center;
                    padding: 0.6rem 1rem;
                    font-family: 'Cinzel', serif;
                    font-size: 0.85rem;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    border-bottom: 2px solid var(--pan-gold);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .pan-page { 
                    display: flex; 
                    flex-direction: column; 
                    width: 100%; 
                    min-height: 100vh; 
                }

                /* HEADER & RESPONSIVE NAVIGATION */
                .pan-header {
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    background: rgba(251, 247, 240, 0.95);
                    backdrop-filter: blur(12px);
                    border-bottom: 2px solid var(--pan-line);
                    padding: 1.2rem 2rem;
                }
                
                .pan-header-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .pan-brand { 
                    display: flex; 
                    align-items: center; 
                    gap: 1.2rem; 
                }
                
                .pan-logo-main { 
                    height: 52px; 
                    width: 52px; 
                    object-fit: contain; 
                }
                
                .pan-title-container h1 {
                    font-family: 'Cinzel', serif;
                    font-size: 1.25rem;
                    font-weight: 900;
                    color: var(--pan-wine);
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    line-height: 1.4;
                }
                
                .pan-title-container p {
                    font-family: 'Cinzel', serif;
                    font-size: 0.7rem;
                    color: var(--pan-gold);
                    font-weight: 700;
                    letter-spacing: 0.25em;
                    text-transform: uppercase;
                    margin-top: 5px;
                    line-height: 1.3;
                }

                .pan-right-nav {
                    display: flex;
                    align-items: center;
                    gap: 2.5rem;
                }

                .pan-nav { 
                    display: flex; 
                    gap: 2.2rem; 
                }
                
                .pan-nav a {
                    font-size: 0.88rem;
                    font-weight: 700;
                    color: var(--pan-ink);
                    text-decoration: none;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    transition: color 0.2s ease;
                }
                
                .pan-nav a:hover { 
                    color: var(--pan-wine); 
                }

                /* BOTÓN VOLVER WEB PRINCIPAL */
                .pan-btn-back {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.6rem 1.2rem;
                    border: 2px solid var(--pan-wine);
                    border-radius: 8px;
                    background: transparent;
                    color: var(--pan-wine);
                    font-size: 0.82rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-decoration: none;
                }

                .pan-btn-back:hover {
                    background: var(--pan-wine);
                    color: #ffffff;
                }

                .pan-menu-toggle {
                    display: none !important;
                    align-items: center;
                    justify-content: center;
                    width: 42px;
                    height: 42px;
                    border-radius: 8px;
                    border: 2px solid var(--pan-line);
                    background: transparent;
                    color: var(--pan-wine);
                    font-size: 1.3rem;
                    cursor: pointer;
                }

                .pan-mobile-nav {
                    display: none !important;
                }

                @media (max-width: 980px) {
                    .pan-nav { 
                        display: none !important; 
                    }
                    .pan-btn-back {
                        display: none !important;
                    }
                    .pan-menu-toggle { 
                        display: flex !important; 
                    }
                    .pan-mobile-nav {
                        display: flex !important;
                        flex-direction: column;
                        gap: 1.4rem;
                        padding: 1.5rem 0 1rem 0;
                        border-top: 1px solid var(--pan-line);
                        margin-top: 1rem;
                    }
                    .pan-mobile-nav a { 
                        color: var(--pan-ink); 
                        text-decoration: none; 
                        font-weight: 700; 
                        font-size: 1rem;
                        text-transform: uppercase;
                        padding: 0.2rem 0;
                    }
                    .pan-mobile-nav .pan-btn-back-mobile {
                        display: inline-flex;
                        justify-content: center;
                        align-items: center;
                        margin-top: 0.5rem;
                        padding: 0.8rem;
                        border: 2px solid var(--pan-wine);
                        border-radius: 8px;
                        color: var(--pan-wine);
                        text-decoration: none;
                        font-weight: 700;
                        text-transform: uppercase;
                        font-size: 0.9rem;
                        text-align: center;
                    }
                }

                /* HERO SECTION */
                .pan-hero {
                    background: linear-gradient(180deg, var(--pan-cream-soft) 0%, var(--pan-cream) 100%);
                    border-bottom: 1px solid var(--pan-line);
                    padding: 5rem 2rem;
                }
                
                .pan-hero-grid {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: 1.3fr 1fr;
                    gap: 4rem;
                    align-items: center;
                }
                
                @media (max-width: 768px) { 
                    .pan-hero-grid { 
                        grid-template-columns: 1fr; 
                        gap: 3rem; 
                    } 
                }

                .pan-eyebrow {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.6rem;
                    font-family: 'Cinzel', serif;
                    font-size: 0.75rem;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    color: var(--pan-gold);
                    margin-bottom: 1.8rem;
                    font-weight: 700;
                }
                
                .pan-eyebrow::before { 
                    content: ""; 
                    width: 30px; 
                    height: 2px; 
                    background: var(--pan-gold); 
                }

                .pan-hero-text h2 {
                    font-family: 'Cinzel', serif;
                    font-size: clamp(2rem, 4.5vw, 3rem);
                    color: var(--pan-ink);
                    line-height: 1.45;
                    margin-bottom: 1.8rem;
                    font-weight: 900;
                }
                
                .pan-hero-text h2 em { 
                    color: var(--pan-wine); 
                    font-style: normal; 
                }
                
                .pan-hero-text p { 
                    color: var(--pan-ink-muted); 
                    font-size: 1.05rem; 
                    line-height: 1.85;
                    max-width: 50ch; 
                }

                .pan-next-match {
                    background: #ffffff;
                    border: 2px solid var(--pan-gold);
                    padding: 2rem;
                    border-radius: var(--pan-radius);
                    box-shadow: var(--pan-shadow);
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    position: relative;
                }
                
                .pan-next-match::after {
                    content: 'EN VIVO';
                    position: absolute;
                    top: -12px;
                    right: 20px;
                    background: var(--pan-wine);
                    color: white;
                    font-size: 0.65rem;
                    font-weight: 700;
                    padding: 0.2rem 0.6rem;
                    border-radius: 4px;
                    letter-spacing: 0.1em;
                }

                .pan-next-match img { 
                    width: 60px; 
                    height: 60px; 
                    object-fit: contain; 
                }
                
                .pan-next-match .pan-tag {
                    font-size: 0.7rem;
                    color: var(--pan-gold);
                    font-weight: 800;
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                    margin-bottom: 0.5rem;
                    display: inline-block;
                    line-height: 1.3;
                }
                
                .pan-next-match h4 { 
                    font-family: 'Cinzel', serif; 
                    margin-bottom: 0.5rem; 
                    font-size: 1.2rem; 
                    color: var(--pan-ink);
                    line-height: 1.4;
                }
                
                .pan-next-match p { 
                    font-size: 0.85rem; 
                    color: var(--pan-ink-muted); 
                    line-height: 1.5;
                }

                /* FILTROS */
                .pan-filters {
                    max-width: 1200px;
                    margin: 4rem auto 0;
                    padding: 0 2rem;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1.5rem;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .pan-input-search {
                    padding: 0.8rem 1.2rem;
                    border: 2px solid var(--pan-line);
                    border-radius: 8px;
                    background: #ffffff;
                    font-size: 0.9rem;
                    width: 100%;
                    max-width: 320px;
                    font-family: inherit;
                    color: var(--pan-ink);
                    font-weight: 500;
                }
                
                .pan-input-search:focus {
                    outline: none;
                    border-color: var(--pan-wine);
                }
                
                .pan-pill-group { 
                    display: flex; 
                    gap: 0.6rem; 
                    flex-wrap: wrap; 
                }
                
                .pan-btn-pill {
                    padding: 0.5rem 1.2rem;
                    border-radius: 30px;
                    border: 2px solid var(--pan-line);
                    background: #ffffff;
                    font-family: 'Cinzel', serif;
                    font-size: 0.75rem;
                    font-weight: 900;
                    letter-spacing: 0.05em;
                    color: var(--pan-ink);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .pan-btn-pill:hover { 
                    border-color: var(--pan-wine); 
                    color: var(--pan-wine);
                }
                
                .pan-btn-pill.active { 
                    background: var(--pan-wine); 
                    color: #ffffff; 
                    border-color: var(--pan-wine); 
                }

                /* PARTIDOS Y MARCADORES */
                .pan-grid-partidos {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 2rem;
                    max-width: 1200px;
                    margin: 3rem auto 5rem;
                    padding: 0 2rem;
                }
                
                .pan-card {
                    background: #ffffff;
                    border: 2px solid var(--pan-line);
                    border-radius: var(--pan-radius);
                    padding: 1.8rem;
                    box-shadow: var(--pan-shadow);
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    transition: all 0.25s ease;
                }
                
                .pan-card:hover { 
                    transform: translateY(-4px); 
                    border-color: var(--pan-wine); 
                    box-shadow: var(--pan-shadow-hover); 
                }
                
                .pan-card.pan-card-featured { 
                    border-color: var(--pan-gold); 
                    background: linear-gradient(180deg, #ffffff 0%, var(--pan-cream-soft) 100%); 
                }

                .pan-team-row { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center; 
                    gap: 1fr; 
                    padding: 0.8rem 0;
                }
                
                .pan-team-info { 
                    display: flex; 
                    align-items: center; 
                    gap: 1rem; 
                    min-width: 0; 
                }
                
                .pan-escudo-api {
                    width: 38px; 
                    height: 38px; 
                    object-fit: contain; 
                    flex-shrink: 0;
                }
                
                .pan-escudo-fallback {
                    width: 38px;
                    height: 38px;
                    background: var(--pan-wine);
                    color: white;
                    border-radius: 50%;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.8rem;
                    font-weight: 700;
                    font-family: 'Cinzel', serif;
                    flex-shrink: 0;
                }
                
                .pan-team-name { 
                    font-family: 'Cinzel', serif; 
                    font-size: 0.95rem; 
                    font-weight: 900; 
                    overflow: hidden; 
                    text-overflow: ellipsis; 
                    white-space: nowrap; 
                    color: var(--pan-ink);
                    line-height: 1.4;
                }
                
                .pan-marcador {
                    background: var(--pan-ink);
                    color: white;
                    padding: 0.4rem 0.85rem;
                    border-radius: 6px;
                    font-weight: 700;
                    font-size: 1.05rem;
                    min-width: 40px;
                    text-align: center;
                    flex-shrink: 0;
                    font-family: monospace;
                }
                
                .pan-card-featured .pan-marcador {
                    background: var(--pan-wine);
                }
                
                .pan-score-controls { 
                    display: flex; 
                    align-items: center; 
                    gap: 0.5rem; 
                    flex-shrink: 0; 
                }
                
                .pan-btn-inc {
                    background: #ffffff;
                    border: 1px solid var(--pan-line);
                    width: 28px; 
                    height: 28px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-weight: bold;
                    color: var(--pan-wine);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .pan-btn-inc:hover { 
                    background: var(--pan-wine); 
                    color: #fff; 
                    border-color: var(--pan-wine); 
                }

                .pan-card-meta {
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center;
                    padding-top: 1.2rem; 
                    margin-top: 1.2rem;
                    border-top: 2px solid var(--pan-cream-soft);
                    font-size: 0.78rem; 
                    color: var(--pan-ink-muted);
                    font-weight: 600;
                    line-height: 1.5;
                }
                
                .pan-conf-seal {
                    font-weight: 800; 
                    color: var(--pan-gold);
                    letter-spacing: 0.05em;
                    border: 1px solid var(--pan-gold);
                    border-radius: 4px;
                    padding: 0.15rem 0.45rem;
                    font-size: 0.65rem;
                }

                .pan-state-box {
                    grid-column: 1 / -1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1.2rem;
                    text-align: center;
                    padding: 6rem 2rem;
                    color: var(--pan-ink-muted);
                    font-weight: 600;
                    line-height: 1.7;
                }
                
                .pan-spinner {
                    width: 36px; 
                    height: 36px;
                    border-radius: 50%;
                    border: 4px solid var(--pan-line);
                    border-top-color: var(--pan-wine);
                    animation: pan-spin 1s linear infinite;
                }
                
                @keyframes pan-spin { 
                    to { transform: rotate(360deg); } 
                }

                /* FOOTER CON PATROCINADORES */
                .pan-footer {
                    background: var(--pan-ink);
                    color: #B5AEA5;
                    padding: 4rem 2rem;
                    margin-top: auto;
                    border-top: 4px solid var(--pan-gold);
                    text-align: center;
                }
                
                .pan-footer-logo { 
                    height: 55px; 
                    margin-bottom: 2rem; 
                    object-fit: contain;
                }
                
                .pan-sponsors-container {
                    max-width: 650px;
                    margin: 0 auto 2.5rem auto;
                    padding-bottom: 2rem;
                    border-bottom: 1px solid #332A22;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 3rem;
                    flex-wrap: wrap;
                }
                
                .pan-sponsor-img {
                    height: 32px;
                    object-fit: contain;
                    opacity: 0.5;
                    filter: grayscale(100%) brightness(140%);
                    transition: all 0.2s ease;
                }
                
                .pan-sponsor-img:hover {
                    opacity: 0.95;
                    filter: grayscale(0%) brightness(100%);
                }
                
                .pan-footer p { 
                    margin: 0; 
                }
            `}</style>

      {/* AVISO DE SITIO EN CONSTRUCCIÓN */}
      <div className="pan-construction-banner">
        🚧 SITIO WEB EN CONSTRUCCIÓN — PRÓXIMAMENTE 🚧
      </div>



      <div>
        {/* FOOTER */}
        <footer className="pan-footer">
          <div className="pan-sponsors-container">
            <img src="public/Otros/patrocinadores/Amena.svg" alt="Sponsor 1" className="pan-sponsor-img" onError={(e) => { (e.target as HTMLElement).style.opacity = "0.2" }} />

          </div>

          <center><img src={PAN_CREST_PATH} alt="Reino del Pan" className="pan-footer-logo" />
            <p>© 2026 Federación Paniense de Fútbol. Todos los derechos reservados.</p></center>
        </footer>
      </div>
    </div>
  );
}