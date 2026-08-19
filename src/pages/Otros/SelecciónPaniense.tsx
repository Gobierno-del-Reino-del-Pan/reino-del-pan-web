import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronDown, ChevronUp, ExternalLink, Menu, RefreshCw, Search, Shield, Trophy, X } from "lucide-react";

type Confederation = "UEFA" | "CONMEBOL" | "INTER";
type MatchStatus = "finished" | "live" | "scheduled";

interface Match {
    id: string | number;
    home: string;
    away: string;
    homeGoals: number | null;
    awayGoals: number | null;
    date: string;
    competition: string;
    confederation: Confederation;
    homeCrest?: string | null;
    awayCrest?: string | null;
    status: MatchStatus;
    local?: boolean;
}

const CREST = "/Otros/EscudoSelección.png";
const PORTUGAL_CREST = "https://crests.football-data.org/765.svg";
const FALLBACK_MATCHES: Match[] = [
    { id: "pan-match", home: "Reino del Pan", away: "Portugal", homeGoals: 3, awayGoals: 2, date: "2026-06-20T19:45:00.000Z", competition: "Amistoso internacional", confederation: "INTER", homeCrest: CREST, awayCrest: PORTUGAL_CREST, status: "finished", local: true },
    { id: "pan-arg-2026", home: "Reino del Pan", away: "Argentina", homeGoals: null, awayGoals: null, date: "2026-09-12T20:00:00.000Z", competition: "Ventana internacional", confederation: "CONMEBOL", homeCrest: CREST, status: "scheduled", local: true },
    { id: "pan-esp-2026", home: "España", away: "Reino del Pan", homeGoals: null, awayGoals: null, date: "2026-10-08T18:30:00.000Z", competition: "Ventana internacional", confederation: "UEFA", awayCrest: CREST, status: "scheduled", local: true },
];

const confederations: Array<{ id: "TODOS" | Confederation; label: string }> = [
    { id: "TODOS", label: "Todos" },
    { id: "UEFA", label: "UEFA" },
    { id: "CONMEBOL", label: "CONMEBOL" },
    { id: "INTER", label: "Intercontinental" },
];

function initials(name: string) {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function formatDate(value: string) {
    if (/^\d{1,2}\s/.test(value)) return value;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

function Crest({ src, team }: { src?: string | null; team: string }) {
    const [broken, setBroken] = useState(!src);
    return broken ? <span className="team-crest team-crest-fallback" aria-hidden="true">{initials(team)}</span> : <img className="team-crest" src={src!} alt={`Escudo de ${team}`} onError={() => setBroken(true)} />;
}

function ScoreControl({ value, onChange, label }: { value: number; onChange: (value: number) => void; label: string }) {
    return <div className="score-control" aria-label={label}>
        <button type="button" className="score-button" aria-label={`Reducir ${label}`} onClick={() => onChange(Math.max(0, value - 1))}>−</button>
        <strong aria-live="polite">{value}</strong>
        <button type="button" className="score-button" aria-label={`Aumentar ${label}`} onClick={() => onChange(Math.min(99, value + 1))}>+</button>
    </div>;
}

function MatchCard({ match, onHomeScore, onAwayScore }: { match: Match; onHomeScore?: (value: number) => void; onAwayScore?: (value: number) => void }) {
    const editable = match.id === "pan-match" && onHomeScore && onAwayScore;
    const result = match.homeGoals !== null && match.awayGoals !== null ? match.homeGoals === match.awayGoals ? "Empate" : match.homeGoals > match.awayGoals ? "Victoria local" : "Victoria visitante" : "Pendiente";
    return <article className={`match-card ${match.local ? "match-card-featured" : ""}`}>
        <div className="match-card-top"><span className={`status-chip status-${match.status}`}>{match.status === "finished" ? "Finalizado" : match.status === "live" ? "En directo" : "Próximo"}</span><span>{match.competition}</span></div>
        <div className="teams">
            <div className="team"><Crest src={match.homeCrest} team={match.home} /><span title={match.home}>{match.home}</span></div>
            {editable ? <ScoreControl value={match.homeGoals ?? 0} onChange={onHomeScore} label="goles del Reino del Pan" /> : <strong className="match-score">{match.homeGoals ?? "—"}</strong>}
        </div>
        <div className="teams">
            <div className="team"><Crest src={match.awayCrest} team={match.away} /><span title={match.away}>{match.away}</span></div>
            {editable ? <ScoreControl value={match.awayGoals ?? 0} onChange={onAwayScore} label="goles del rival" /> : <strong className="match-score">{match.awayGoals ?? "—"}</strong>}
        </div>
        <div className="match-card-bottom"><span>{formatDate(match.date)}</span><span className="conf-badge">{match.confederation}</span></div>
        <span className="sr-only">Resultado: {result}</span>
    </article>;
}

export default function SeleccionPanienseWeb() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [selectedConfederation, setSelectedConfederation] = useState<"TODOS" | Confederation>("TODOS");
    const [query, setQuery] = useState("");
    const [matches, setMatches] = useState<Match[]>(FALLBACK_MATCHES);
    const [loading, setLoading] = useState(true);
    const [usingFallback, setUsingFallback] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [panGoals, setPanGoals] = useState(3);
    const [rivalGoals, setRivalGoals] = useState(2);

    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem("paniense-score") || "null");
            if (Number.isInteger(saved?.home) && saved.home >= 0 && saved.home <= 99) setPanGoals(saved.home);
            if (Number.isInteger(saved?.away) && saved.away >= 0 && saved.away <= 99) setRivalGoals(saved.away);
        } catch { /* El marcador por defecto sigue siendo válido. */ }
    }, []);

    useEffect(() => {
        localStorage.setItem("paniense-score", JSON.stringify({ home: panGoals, away: rivalGoals }));
    }, [panGoals, rivalGoals]);

    const loadMatches = useCallback(async (signal?: AbortSignal) => {
        setLoading(true); setApiError(null);
        try {
            const response = await fetch("/api/seleccion/partidos", { signal, headers: { Accept: "application/json" } });
            if (!response.ok) throw new Error(`Servidor respondió ${response.status}`);
            const data = await response.json();
            if (!Array.isArray(data.matches) || data.matches.length === 0) throw new Error("No hay partidos disponibles");
            setMatches(data.matches); setUsingFallback(false);
        } catch (error) {
            if ((error as Error).name === "AbortError") return;
            setMatches(FALLBACK_MATCHES); setUsingFallback(true); setApiError("No se pudo actualizar la agenda en este momento.");
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { const controller = new AbortController(); void loadMatches(controller.signal); return () => controller.abort(); }, [loadMatches]);

    const filteredMatches = useMemo(() => {
        const localMatch = { ...FALLBACK_MATCHES[0], homeGoals: panGoals, awayGoals: rivalGoals };
        const source = [localMatch, ...matches.filter((match) => match.id !== "pan-match")];
        const normalized = query.trim().toLocaleLowerCase("es");
        return source.filter((match) => {
            const matchesConf = selectedConfederation === "TODOS" || match.confederation === selectedConfederation;
            const matchesQuery = !normalized || `${match.home} ${match.away} ${match.competition}`.toLocaleLowerCase("es").includes(normalized);
            return matchesConf && matchesQuery;
        });
    }, [matches, panGoals, rivalGoals, query, selectedConfederation]);

    const wins = filteredMatches.filter((match) => match.homeGoals !== null && match.awayGoals !== null && match.homeGoals > match.awayGoals).length;
    return <div className="selection-page">
        <style>{styles}</style>
        <a className="skip-link" href="#partidos">Ir al contenido principal</a>
        <div className="construction-banner"><span className="live-dot" /> Federación Paniense de Fútbol <span>·</span> Portal de la selección</div>
        <header className="site-header"><div className="header-inner">
            <a href="/" className="brand" aria-label="Volver al Reino del Pan"><img src={CREST} alt="" /><span><b>SELECCIÓN<br />PANIENSE</b><small>Orgullo · Disciplina · Nación</small></span></a>
            <nav id="main-nav" className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="Navegación principal"><a href="#inicio" onClick={() => setMenuOpen(false)}>Inicio</a><a href="#partidos" onClick={() => setMenuOpen(false)}>Partidos</a><a href="#federacion" onClick={() => setMenuOpen(false)}>Federación</a><a href="/" className="back-link">Reino del Pan <ExternalLink size={14} /></a></nav>
            <button type="button" className="menu-toggle" aria-expanded={menuOpen} aria-controls="main-nav" aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X /> : <Menu />}</button>
        </div></header>
        <main id="inicio">
            <section className="hero"><div className="hero-inner"><div className="hero-copy"><span className="eyebrow"><Trophy size={16} /> La selección nacional</span><h1>Una camiseta.<br /><em>Una nación.</em></h1><p>La casa oficial de la Selección Paniense. Sigue nuestros resultados, rivales y el camino hacia la próxima gran cita internacional.</p><a className="primary-cta" href="#partidos">Ver resultados <ArrowRight size={17} /></a></div><div className="hero-card"><div className="hero-card-glow" /><img src={CREST} alt="Escudo de la Selección Paniense" /><div><span>PRÓXIMO CAPÍTULO</span><strong>El fútbol nos une</strong><small>Desde 2026 · Federación Paniense</small></div></div></div></section>
            <section className="content-section" id="partidos" aria-labelledby="matches-title"><div className="section-heading"><div><span className="eyebrow">Calendario y resultados</span><h2 id="matches-title">La ruta de la selección</h2></div><button className="refresh-button" type="button" onClick={() => void loadMatches()} disabled={loading}><RefreshCw size={16} className={loading ? "spin" : ""} /> {loading ? "Actualizando" : "Actualizar"}</button></div>
                <div className="stat-strip"><div><Shield size={20} /><span><b>{filteredMatches.length}</b> partidos visibles</span></div><div><Trophy size={20} /><span><b>{wins}</b> victorias registradas</span></div><div className="data-note"><span className={usingFallback ? "warning-dot" : "success-dot"} />{usingFallback ? "Modo de respaldo" : "Datos sincronizados"}</div></div>
                <div className="filters"><label className="search-box"><Search size={18} /><span className="sr-only">Buscar partido</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar selección o competición" /></label><div className="pills" role="group" aria-label="Filtrar por confederación">{confederations.map((conf) => <button key={conf.id} type="button" className={selectedConfederation === conf.id ? "pill active" : "pill"} aria-pressed={selectedConfederation === conf.id} onClick={() => setSelectedConfederation(conf.id)}>{conf.label}</button>)}</div></div>
                {apiError && <div className="inline-alert" role="status">{apiError} Los datos locales de demostración siguen disponibles.</div>}
                {loading && <div className="loading-state" role="status"><span className="loader" />Consultando el archivo internacional…</div>}
                {!loading && filteredMatches.length === 0 && <div className="empty-state"><Search size={30} /><h3>No encontramos ese partido</h3><p>Prueba con otro equipo, competición o elimina los filtros.</p></div>}
                {!loading && filteredMatches.length > 0 && <div className="matches-grid">{filteredMatches.map((match) => <MatchCard key={match.id} match={match} onHomeScore={match.id === "pan-match" ? setPanGoals : undefined} onAwayScore={match.id === "pan-match" ? setRivalGoals : undefined} />)}</div>}
            </section>
            <section className="federation-callout" id="federacion"><div><span className="eyebrow">La voz de la afición</span><h2>El próximo partido<br /><em>lo jugamos juntos.</em></h2><p>Información oficial, resultados contrastados y todo el pulso de la Federación Paniense de Fútbol.</p></div><div className="crest-seal"><img src={CREST} alt="" /><span>F.P.F.<br /><small>2026</small></span></div></section>
        </main>
        <footer className="site-footer"><img src={CREST} alt="Escudo de la Selección Paniense" /><div><b>SELECCIÓN PANIENSE</b><p>© 2026 Federación Paniense de Fútbol. Todos los derechos reservados.</p></div><a href="/">Volver al Reino del Pan <ChevronUp size={16} /></a></footer>
    </div>;
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
:root{--wine:#79131d;--wine-dark:#3f0b11;--gold:#c88b35;--gold-light:#f1c976;--cream:#fcf8f1;--paper:#fffdf9;--ink:#211a16;--muted:#756b61;--line:#e9ddca;--shadow:0 20px 55px rgba(74,34,17,.09)}*{box-sizing:border-box}.selection-page{min-height:100vh;background:var(--cream);color:var(--ink);font-family:'Plus Jakarta Sans',sans-serif}.selection-page a{color:inherit}.skip-link{position:absolute;left:-999px}.skip-link:focus{left:1rem;top:1rem;z-index:20;background:#fff;padding:.8rem;border-radius:8px}.construction-banner{display:flex;justify-content:center;gap:.65rem;align-items:center;background:var(--wine-dark);color:#fff;padding:.65rem 1rem;font-size:.72rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase}.live-dot,.success-dot,.warning-dot{width:7px;height:7px;border-radius:50%;display:inline-block;background:#67d391}.warning-dot{background:#e5a33c}.site-header{position:sticky;top:0;z-index:10;background:rgba(252,248,241,.88);backdrop-filter:blur(18px);border-bottom:1px solid var(--line)}.header-inner{max-width:1180px;margin:auto;padding:1rem 1.5rem;display:flex;align-items:center;justify-content:space-between}.brand{display:flex;align-items:center;gap:.75rem;text-decoration:none}.brand img{width:46px;height:46px;object-fit:contain}.brand b,.site-footer b{font:900 .86rem/1.1 Cinzel,serif;letter-spacing:.12em;color:var(--wine)}.brand small{display:block;color:var(--gold);font-size:.55rem;font-weight:800;letter-spacing:.13em;margin-top:.35rem}.main-nav{display:flex;align-items:center;gap:2rem;font-size:.76rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.main-nav a{text-decoration:none}.main-nav a:hover{color:var(--wine)}.back-link{display:inline-flex;align-items:center;gap:.4rem;border:1px solid var(--wine);border-radius:999px;padding:.65rem 1rem;color:var(--wine)!important}.menu-toggle{display:none;border:1px solid var(--line);background:transparent;color:var(--wine);border-radius:9px;padding:.55rem}.hero{overflow:hidden;border-bottom:1px solid var(--line);background:radial-gradient(circle at 84% 32%,rgba(200,139,53,.16),transparent 25%),linear-gradient(120deg,#f5ecdf,var(--cream) 62%)}.hero-inner{max-width:1180px;margin:auto;padding:6rem 1.5rem;display:grid;grid-template-columns:1.1fr .9fr;gap:5rem;align-items:center}.eyebrow{display:inline-flex;align-items:center;gap:.5rem;color:var(--gold);font-size:.7rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase}.hero h1,.section-heading h2,.federation-callout h2{font:900 clamp(2.7rem,6vw,5.4rem)/1.05 Cinzel,serif;letter-spacing:-.04em;margin:1.2rem 0}.hero h1 em,.federation-callout em{font-style:normal;color:var(--wine)}.hero p{max-width:52ch;color:var(--muted);font-size:1.05rem;line-height:1.8}.primary-cta{display:inline-flex;align-items:center;gap:.65rem;margin-top:2rem;padding:.9rem 1.2rem;background:var(--wine);color:#fff!important;border-radius:8px;text-decoration:none;font-weight:800;font-size:.82rem;transition:transform .18s ease,background .18s ease}.primary-cta:hover{transform:translateY(-2px);background:var(--wine-dark)}.hero-card{position:relative;display:flex;align-items:center;gap:1.25rem;padding:2rem;border:1px solid rgba(200,139,53,.55);border-radius:18px;background:rgba(255,253,249,.75);box-shadow:var(--shadow);overflow:hidden}.hero-card-glow{position:absolute;width:190px;height:190px;background:var(--gold-light);opacity:.15;filter:blur(50px);right:-50px;top:-30px}.hero-card img{width:105px;height:105px;object-fit:contain;z-index:1}.hero-card div:not(.hero-card-glow){z-index:1}.hero-card span{display:block;color:var(--gold);font-size:.64rem;font-weight:800;letter-spacing:.16em}.hero-card strong{display:block;font:700 1.25rem Cinzel,serif;margin:.55rem 0}.hero-card small{color:var(--muted);font-size:.75rem}.content-section{max-width:1180px;margin:auto;padding:5rem 1.5rem}.section-heading{display:flex;align-items:end;justify-content:space-between;gap:1rem}.section-heading h2{font-size:clamp(2rem,4vw,3.4rem);margin:.7rem 0 0}.refresh-button{display:inline-flex;align-items:center;gap:.5rem;border:1px solid var(--line);background:var(--paper);color:var(--wine);padding:.7rem 1rem;border-radius:8px;font:700 .75rem 'Plus Jakarta Sans';cursor:pointer}.refresh-button:disabled{opacity:.55}.spin{animation:spin 1s linear infinite}.stat-strip{margin:2rem 0 2.2rem;padding:1rem 1.2rem;border-block:1px solid var(--line);display:flex;gap:2rem;align-items:center;flex-wrap:wrap;color:var(--muted);font-size:.78rem}.stat-strip>div{display:flex;align-items:center;gap:.6rem}.stat-strip svg{color:var(--gold)}.stat-strip b{color:var(--ink)}.data-note{margin-left:auto;font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.07em}.filters{display:flex;justify-content:space-between;gap:1rem;align-items:center;flex-wrap:wrap}.search-box{display:flex;align-items:center;gap:.55rem;border:1px solid var(--line);background:var(--paper);border-radius:8px;padding:0 .8rem;min-width:min(100%,340px);color:var(--muted)}.search-box input{width:100%;border:0;outline:0;background:transparent;padding:.8rem 0;font:500 .8rem 'Plus Jakarta Sans'}.pills{display:flex;gap:.5rem;flex-wrap:wrap}.pill{border:1px solid var(--line);background:transparent;border-radius:999px;padding:.55rem .9rem;color:var(--muted);font:700 .7rem 'Plus Jakarta Sans';cursor:pointer}.pill.active,.pill:hover{background:var(--wine);color:#fff;border-color:var(--wine)}.inline-alert{margin-top:1.5rem;background:#fff7e7;color:#765120;border:1px solid #ead19d;border-radius:8px;padding:.8rem 1rem;font-size:.78rem}.matches-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem;margin-top:2.3rem}.match-card{background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:1.2rem;box-shadow:0 5px 20px rgba(73,38,18,.04);transition:transform .2s ease,box-shadow .2s ease}.match-card:hover{transform:translateY(-3px);box-shadow:var(--shadow)}.match-card-featured{border:2px solid var(--gold);background:linear-gradient(160deg,#fffdf9,#f8eedf)}.match-card-top,.match-card-bottom{display:flex;justify-content:space-between;align-items:center;gap:.5rem;color:var(--muted);font-size:.65rem}.status-chip{border-radius:999px;padding:.3rem .55rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em}.status-finished{background:#edf7ef;color:#277541}.status-live{background:#fff0ed;color:var(--wine)}.status-scheduled{background:#eef2fa;color:#385277}.teams{display:flex;align-items:center;justify-content:space-between;gap:.8rem;margin-top:1.25rem}.team{display:flex;align-items:center;gap:.7rem;min-width:0;font:700 .88rem Cinzel,serif}.team span:last-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.team-crest{width:34px;height:34px;object-fit:contain;flex:none}.team-crest-fallback{display:grid;place-items:center;border-radius:50%;background:var(--wine);color:white;font:800 .65rem 'Plus Jakarta Sans'}.match-score{min-width:31px;text-align:center;padding:.42rem .55rem;border-radius:6px;background:var(--ink);color:white;font-size:1rem}.match-card-featured .match-score,.match-card-featured .score-control strong{background:var(--wine)}.score-control{display:flex;align-items:center;gap:.3rem}.score-control strong{min-width:28px;text-align:center;padding:.35rem;border-radius:5px;background:var(--ink);color:#fff}.score-button{width:24px;height:24px;border-radius:50%;border:1px solid var(--line);background:#fff;color:var(--wine);font-weight:800;cursor:pointer}.score-button:hover{background:var(--wine);color:#fff}.match-card-bottom{margin-top:1.35rem;padding-top:1rem;border-top:1px solid var(--line)}.conf-badge{color:var(--gold);font-weight:800;letter-spacing:.08em}.loading-state,.empty-state{text-align:center;padding:5rem 1rem;color:var(--muted);font-size:.85rem}.loader{display:block;width:34px;height:34px;border:3px solid var(--line);border-top-color:var(--wine);border-radius:50%;margin:0 auto 1rem;animation:spin 1s linear infinite}.empty-state h3{font:700 1.2rem Cinzel,serif;color:var(--ink);margin:.8rem}.federation-callout{max-width:1180px;margin:0 auto 5rem;padding:3rem;border-radius:18px;background:var(--wine-dark);color:#fff;display:flex;justify-content:space-between;align-items:center;gap:2rem}.federation-callout .eyebrow{color:var(--gold-light)}.federation-callout h2{font-size:clamp(2rem,4vw,3.2rem);margin:.7rem 0}.federation-callout p{max-width:50ch;color:#d6c8bb;line-height:1.7;font-size:.9rem}.crest-seal{display:flex;align-items:center;gap:1rem;color:var(--gold-light);font:700 1rem Cinzel,serif}.crest-seal img{width:120px;height:120px;object-fit:contain}.crest-seal small{font-size:.7rem}.site-footer{padding:2rem max(1.5rem,calc((100% - 1180px)/2));background:#201914;color:#cbbfb2;display:flex;align-items:center;gap:1rem}.site-footer img{width:46px;height:46px;object-fit:contain}.site-footer b{color:var(--gold-light);font-size:.7rem}.site-footer p{font-size:.68rem;margin-top:.3rem}.site-footer a{margin-left:auto;display:flex;align-items:center;gap:.4rem;text-decoration:none;font-size:.7rem;font-weight:800;color:#fff}@keyframes spin{to{transform:rotate(360deg)}}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media(max-width:800px){.main-nav{display:none}.main-nav.is-open{display:flex;position:absolute;left:0;right:0;top:100%;background:var(--cream);border-bottom:1px solid var(--line);padding:1.2rem 1.5rem;align-items:stretch;flex-direction:column;gap:1rem}.menu-toggle{display:block}.hero-inner{grid-template-columns:1fr;gap:3rem;padding-block:4rem}.matches-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.federation-callout{margin-inline:1.5rem;padding:2rem}.crest-seal{display:none}}@media(max-width:560px){.construction-banner{font-size:.58rem;text-align:center}.hero h1{font-size:2.8rem}.matches-grid{grid-template-columns:1fr}.section-heading{align-items:start;flex-direction:column}.refresh-button{width:100%;justify-content:center}.stat-strip{gap:1rem}.data-note{margin-left:0}.federation-callout{margin-inline:0;border-radius:0}.site-footer{flex-wrap:wrap}.site-footer a{width:100%;margin-left:0;margin-top:.5rem}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
`;
