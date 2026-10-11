import { Link, useLocation } from "wouter";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Artis Panis · Header responsive (Liquid Glass)
 * No necesita librerías adicionales: React + Wouter.
 * Estilos encapsulados en ap-* para evitar choques con Tailwind o .container global.
 */

const MAIN_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/gobierno", label: "Gobierno" },
  { href: "/borp", label: "Boletín" },
  { href: "/level", label: "Niveles" },
  { href: "/policia", label: "DPI · CPNP" },
];

const COMMUNITY_LINKS = [
  { href: "/Politics", label: "Grupos Políticos" },
  { href: "https://www.mafiadepan.com/", label: "La Mafia", external: true },
  { href: "/pkmn", label: "PKMN" },
  { href: "/Pandora", label: "Conf. Episcopal de Pandora" },
  { href: "/turismo", label: "Turismo" },
];

const INFO_LINKS = [
  { href: "/donations", label: "Donaciones" },
  { href: "/laliga", label: "LA MiGA" },
  { href: "/tvp", label: "TVP" },
  { href: "/FTech", label: "Fuerza Tech" },
  { href: "/Igualdad", label: "Igualdad" },
  { href: "/about", label: "Acerca de" },
];

type NavLink = { href: string; label: string; external?: boolean };
type Dropdown = "community" | "info" | "account" | null;

interface DiscordUser {
  id: string;
  username: string;
  avatar: string;
  inGuild: boolean;
  verificado: boolean;
  dpi: { nombre: string; apellidos: string; dpi_number: string } | null;
  roles: Array<string | { id?: string; discord_role_id?: string; nombre?: string; name?: string }>;
}

const Icon = ({ name, size = 18 }: { name: "chevron" | "menu" | "close" | "login" | "arrow" | "folder"; size?: number }) => {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  const shapes = {
    chevron: <path d="m6 9 6 6 6-6" />,
    menu: <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>,
    close: <><path d="M5 5l14 14" /><path d="M19 5 5 19" /></>,
    login: <><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M12 3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6" /></>,
    arrow: <><path d="M7 17 17 7" /><path d="M8 7h9v9" /></>,
    folder: <><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10H3Z" /></>,
  };
  return <svg {...common}>{shapes[name]}</svg>;
};

function Brand() {
  return (
    <Link href="/" className="ap-brand" aria-label="Artis Panis: ir al inicio">
      <span className="ap-mark"><img src="/logo.png" alt="" width={40} height={40} /></span>
      <span className="ap-brand-wordmark">
        <span className="ap-brand-eyebrow">ARTIS PANIS</span>
        <span className="ap-brand-name"><span className="ap-strike">REINO DEL</span><strong>PAN</strong></span>
      </span>
    </Link>
  );
}

const styles = `
  .ap-header { --ap-purple:#630B57; --ap-dark:#381032; --ap-soft:#A6659D; position:sticky; top:0; z-index:100; width:100%; padding:10px clamp(8px,2vw,24px) 8px; box-sizing:border-box; isolation:isolate; }
  .ap-header *, .ap-header *::before, .ap-header *::after {box-sizing:border-box}
  .ap-shell {position:relative; display:grid; grid-template-columns:minmax(0,1fr) auto minmax(0,1fr); align-items:center; gap:16px; width:min(100%,1480px); min-height:66px; margin:0 auto; padding:9px 15px 9px 13px; border-radius:22px; border:1px solid rgba(255,255,255,.84); background:linear-gradient(120deg,rgba(255,255,255,.88),rgba(255,249,254,.77) 45%,rgba(251,241,249,.87)); -webkit-backdrop-filter:blur(28px) saturate(170%); backdrop-filter:blur(28px) saturate(170%); box-shadow:inset 0 1.5px 0 rgba(255,255,255,.99),inset 0 -1px 0 rgba(99,11,87,.08),0 5px 25px rgba(49,14,43,.11),0 1px 3px rgba(44,14,38,.06); }
  .ap-shell::before {content:""; position:absolute; inset:1px 8% auto; height:18px; border-radius:100%; pointer-events:none; background:rgba(255,255,255,.65); filter:blur(14px); opacity:.7;}
  .ap-brand {display:inline-flex; align-items:center; justify-self:start; gap:10px; min-width:0; width:max-content; max-width:100%; border-radius:14px; color:var(--ap-purple); text-decoration:none;}
  .ap-mark {display:grid; place-items:center; flex:none; width:44px; height:44px; padding:4px; border-radius:16px; background:linear-gradient(145deg,#fff,#f4e6f1); border:1px solid rgba(255,255,255,.95); box-shadow:inset 0 1px 0 #fff,0 3px 11px rgba(99,11,87,.12); transition:transform .25s,box-shadow .25s}
  .ap-mark img {display:block; width:100%; height:100%; object-fit:contain}
  .ap-brand:hover .ap-mark {transform:translateY(-2px); box-shadow:0 7px 18px rgba(99,11,87,.18)}
  .ap-brand-wordmark {display:flex; flex-direction:column; gap:4px; white-space:nowrap; line-height:1.1; min-width:0}
  .ap-brand-eyebrow {color:#98618e; font-size:10px; font-weight:700; letter-spacing:.2em}
  .ap-brand-name {display:flex; gap:5px; align-items:center; font-size:13px; font-weight:800; letter-spacing:.03em}
  .ap-brand-name strong {font-weight:850}
  .ap-strike {text-decoration:line-through; text-decoration-color:#A6659D; text-decoration-thickness:2px; text-decoration-skip-ink:none; opacity:.72}
  .ap-nav {display:none; align-items:center; justify-self:center; justify-content:center; gap:2px; min-width:0; padding:4px; border:1px solid rgba(99,11,87,.065); background:rgba(246,231,242,.52); border-radius:999px;}
  .ap-nav-link,.ap-trigger {display:inline-flex; align-items:center; justify-content:center; gap:5px; min-height:38px; padding:0 13px; border:0; border-radius:999px; font:650 13px/1.1 var(--body-font,system-ui,sans-serif); color:#624259; text-decoration:none; white-space:nowrap; cursor:pointer; background:transparent; transition:color .2s,background .2s,box-shadow .2s;}
  .ap-nav-link:hover,.ap-trigger:hover,.ap-trigger[aria-expanded="true"] {color:var(--ap-purple); background:rgba(99,11,87,.09)}
  .ap-nav-link[data-active="true"], .ap-trigger[data-active="true"] {color:#fff; background:linear-gradient(155deg,#802573,#630B57); box-shadow:inset 0 1px 0 rgba(255,255,255,.2),0 3px 9px rgba(99,11,87,.19)}
  .ap-actions {display:flex; align-items:center; justify-self:end; gap:8px; min-width:0}
  .ap-cta {display:inline-flex; align-items:center; justify-content:center; gap:9px; height:40px; padding:0 14px; color:#fff!important; background:linear-gradient(140deg,#852579,#630B57 76%); border:1px solid rgba(255,255,255,.2); border-radius:14px; box-shadow:0 4px 13px rgba(99,11,87,.21),inset 0 1px 0 rgba(255,255,255,.2); font:750 12px/1 var(--body-font,system-ui,sans-serif); text-decoration:none; white-space:nowrap; transition:transform .2s,box-shadow .2s}
  .ap-cta:hover {transform:translateY(-1px); box-shadow:0 7px 18px rgba(99,11,87,.29)}
  .ap-icon-button {display:grid; place-items:center; width:42px; height:42px; padding:0; border:1px solid rgba(99,11,87,.075); border-radius:14px; color:var(--ap-purple); background:rgba(255,255,255,.65); box-shadow:inset 0 1px 0 #fff,0 2px 6px rgba(70,17,62,.07); cursor:pointer; transition:background .18s,transform .18s}
  .ap-icon-button:hover {background:#f4e8f2; transform:translateY(-1px)}
  .ap-avatar {display:block; width:32px; height:32px; border-radius:11px; object-fit:cover}
  .ap-avatar-reporter {outline:2px solid #eeb955; outline-offset:1px}
  .ap-menu-button {display:grid}
  .ap-quick-nav {display:none; align-items:center; justify-self:center; gap:3px}
  .ap-anchor {position:relative}
  .ap-popover {position:absolute; top:calc(100% + 13px); right:0; width:max-content; min-width:230px; max-width:min(320px,calc(100vw - 30px)); padding:7px; border-radius:20px; z-index:120; animation:ap-rise .2s cubic-bezier(.2,.8,.2,1) both}
  .ap-popover-left {left:0;right:auto}
  .ap-glass {background:linear-gradient(145deg,rgba(255,255,255,.94),rgba(250,239,248,.87)); border:1px solid rgba(255,255,255,.91); box-shadow:inset 0 1px 0 #fff,0 14px 40px rgba(45,9,41,.18); -webkit-backdrop-filter:blur(32px) saturate(160%); backdrop-filter:blur(32px) saturate(160%)}
  .ap-pop-item,.ap-drawer-link {display:flex; width:100%; gap:9px; align-items:center; text-align:left; border-radius:12px; padding:11px 12px; color:#4d3448; text-decoration:none; font-size:13px; font-weight:600; line-height:1.35; transition:background .18s,color .18s}
  .ap-pop-item:hover,.ap-pop-item[data-active="true"],.ap-drawer-link:hover,.ap-drawer-link[data-active="true"] {color:var(--ap-purple);background:rgba(99,11,87,.095)}
  .ap-pop-item.is-mafia:hover,.ap-drawer-link.is-mafia:hover {color:#d12641; background:rgba(209,38,65,.08); animation:ap-glitch .25s linear infinite}
  .ap-pop-title {padding:10px 12px 12px; border-bottom:1px solid rgba(99,11,87,.1); margin-bottom:5px}
  .ap-pop-meta {display:block; font-size:10px; font-weight:800; color:#8f6389; text-transform:uppercase; letter-spacing:.13em}
  .ap-pop-name {display:block; max-width:245px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-top:5px; font-weight:800; color:var(--ap-dark); font-size:14px}
  .ap-pop-sep {height:1px;margin:6px 8px;background:rgba(99,11,87,.1)}
  .ap-danger {color:#b91c1c!important}
  .ap-drawer {position:absolute; top:calc(100% + 7px); left:clamp(8px,2vw,24px); right:clamp(8px,2vw,24px); max-width:740px; margin:0 auto; padding:14px; border-radius:23px; z-index:110; overflow-y:auto; overscroll-behavior:contain; max-height:calc(100dvh - 104px); animation:ap-rise .22s cubic-bezier(.2,.8,.2,1) both}
  .ap-drawer-section + .ap-drawer-section {margin-top:15px; padding-top:14px; border-top:1px solid rgba(99,11,87,.1)}
  .ap-drawer-heading {display:block; padding:3px 12px 8px; font-size:10px; letter-spacing:.16em; font-weight:800; color:#8e6d88; text-transform:uppercase}
  .ap-drawer-grid {display:grid; grid-template-columns:1fr; gap:3px}
  .ap-drawer-link {min-height:43px}
  .ap-drawer-quick {display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:9px; border-radius:16px; padding:12px 13px; background:rgba(99,11,87,.07); color:var(--ap-purple); font-size:13px; font-weight:800; text-decoration:none}
  .ap-screen {position:fixed; inset:0; z:90; background:rgba(31,10,28,.25); -webkit-backdrop-filter:blur(3px); backdrop-filter:blur(3px)}
  .ap-loading {height:40px;width:40px;border-radius:14px;background:rgba(99,11,87,.12);animation:ap-pulse 1.25s ease-in-out infinite}
  .ap-header a:focus-visible,.ap-header button:focus-visible {outline:3px solid #BD7DB2;outline-offset:3px}
  @keyframes ap-rise {from{opacity:0;transform:translateY(-9px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
  @keyframes ap-pulse {50%{opacity:.38}}
  @keyframes ap-glitch {0%,100%{text-shadow:1px 0 #ef4444,-1px 0 #06b6d4}50%{text-shadow:-1px 0 #ef4444,1px 0 #eab308}}
  /* Teléfono muy estrecho: marca reducida, sin choques con las acciones. */
  @media (max-width:375px) {.ap-brand-wordmark {display:none}.ap-shell {padding:8px 10px;min-height:62px}.ap-mark {height:40px;width:40px}.ap-cta {padding:0 11px}.ap-actions{gap:6px}}
  /* Móvil y tablet: panel desplegable completo, sin navegación desbordada. */
  @media (max-width:899px) {.ap-shell {display:flex;justify-content:space-between;gap:8px;min-height:64px}.ap-actions{margin-left:auto}.ap-header{padding-top:8px}}
  @media (min-width:640px) {.ap-drawer-grid {grid-template-columns:1fr 1fr}}
  /* Tablet y portátil: 3 accesos rápidos + menú para el resto. */
  @media (min-width:900px) and (max-width:1399px) {.ap-quick-nav{display:flex}.ap-shell{grid-template-columns:minmax(175px,1fr) auto minmax(150px,1fr)}}
  /* Escritorio grande: navegación completa; la hamburguesa desaparece POR CSS. */
  @media (min-width:1400px) {.ap-nav{display:flex}.ap-menu-button{display:none!important}.ap-drawer{display:none!important}}
  @media (min-width:1400px) and (max-width:1499px) {.ap-nav-link,.ap-trigger {padding:0 9px;font-size:11.5px}.ap-shell{gap:10px}}
  @media (prefers-reduced-motion:reduce) {.ap-header *, .ap-header *::before,.ap-header *::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
  @supports not (backdrop-filter:blur(1px)) {.ap-shell{background:#fbf4f9}.ap-glass{background:#fff}}
`;

export default function Header() {
  const [location] = useLocation();
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [drop, setDrop] = useState<Dropdown>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/me", { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error("No se ha podido recuperar la sesión");
        return response.json();
      })
      .then(data => { if (!controller.signal.aborted) setUser(data.user ?? null); })
      .catch(error => { if (error.name !== "AbortError") setUser(null); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    setDrop(null);
    setDrawerOpen(false);
  }, [location]);

  useEffect(() => {
    const onOutside = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setDrop(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setDrop(null); setDrawerOpen(false); }
    };
    const onResize = () => {
      if (window.innerWidth >= 1400) setDrawerOpen(false);
      setDrop(null);
    };
    document.addEventListener("pointerdown", onOutside);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("pointerdown", onOutside);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [drawerOpen]);

  const isReporter = useMemo(() => (Array.isArray(user?.roles) ? user.roles : []).some(role => {
    if (!role) return false;
    const id = typeof role === "string" ? role : (role.id || role.discord_role_id || "");
    const name = typeof role === "string" ? role : (role.nombre || role.name || "");
    return id === "1507784487084363858" || name.toLowerCase().includes("reportero");
  }), [user]);

  const active = (href: string) => href === "/"
    ? location === "/"
    : location.toLowerCase().startsWith(href.toLowerCase());
  const communityActive = COMMUNITY_LINKS.some(item => !item.external && active(item.href));
  const infoActive = INFO_LINKS.some(item => active(item.href));
  const toggleDrop = (which: Exclude<Dropdown, null>) => {
    setDrawerOpen(false);
    setDrop(prev => prev === which ? null : which);
  };

  const renderLink = (item: NavLink, cls: "ap-pop-item" | "ap-drawer-link") => {
    const isActive = !item.external && active(item.href);
    const className = `${cls}${item.external ? " is-mafia" : ""}`;
    return item.external
      ? <a key={item.href} href={item.href} className={className} target="_blank" rel="noopener noreferrer"><span aria-hidden="true">♠</span>{item.label}<Icon name="arrow" size={14} /></a>
      : <Link key={item.href} href={item.href} className={className} data-active={isActive} aria-current={isActive ? "page" : undefined} onClick={() => { setDrawerOpen(false); setDrop(null); }}>{item.label}</Link>;
  };

  const accountLinks = (
    <>
      <Link href="/carpeta" className="ap-pop-item" onClick={() => setDrop(null)}><Icon name="folder" size={16} />Mi Carpeta</Link>
      <a href="/consorcio" className="ap-pop-item"><img src="/CONSORCIO/consorcio.png" alt="" width="16" height="16" />Tarjeta Transporte</a>
      <a href="/electa" className="ap-pop-item"><img src="/electa/electa.png" alt="" width="16" height="16" />Electa · Elecciones</a>
      <a href="https://mineco.duckdns.org/lpb/cuenta" className="ap-pop-item"><img src="/LaboralBank/LPB.png" alt="" width="16" height="16" />Cuenta Bancaria LPB</a>
      {isReporter && <Link href="/TVP/PanelDeControl" className="ap-pop-item" onClick={() => setDrop(null)}>🎥 Panel TVP</Link>}
      <div className="ap-pop-sep" />
      <a href="/auth/logout" className="ap-pop-item ap-danger">Cerrar sesión</a>
    </>
  );

  return (
    <>
      <style>{styles}</style>
      {drawerOpen && <button type="button" className="ap-screen" aria-label="Cerrar navegación" onClick={() => setDrawerOpen(false)} />}
      <header className="ap-header" ref={rootRef}>
        <div className="ap-shell">
          <Brand />

          <nav className="ap-nav" aria-label="Navegación principal">
            {MAIN_LINKS.map(item => <Link key={item.href} href={item.href} className="ap-nav-link" data-active={active(item.href)} aria-current={active(item.href) ? "page" : undefined}>{item.label}</Link>)}
            <div className="ap-anchor">
              <button type="button" className="ap-trigger" data-active={communityActive} aria-expanded={drop === "community"} aria-controls="ap-community-menu" onClick={() => toggleDrop("community")}>Comunidad <Icon name="chevron" size={14} /></button>
              {drop === "community" && <div id="ap-community-menu" className="ap-glass ap-popover ap-popover-left">{COMMUNITY_LINKS.map(item => renderLink(item, "ap-pop-item"))}</div>}
            </div>
            <div className="ap-anchor">
              <button type="button" className="ap-trigger" data-active={infoActive} aria-expanded={drop === "info"} aria-controls="ap-info-menu" onClick={() => toggleDrop("info")}>Info <Icon name="chevron" size={14} /></button>
              {drop === "info" && <div id="ap-info-menu" className="ap-glass ap-popover">{INFO_LINKS.map(item => renderLink(item, "ap-pop-item"))}</div>}
            </div>
          </nav>

          <nav className="ap-quick-nav" aria-label="Accesos rápidos">
            {MAIN_LINKS.slice(0,3).map(item => <Link key={item.href} href={item.href} className="ap-nav-link" data-active={active(item.href)} aria-current={active(item.href) ? "page" : undefined}>{item.label}</Link>)}
          </nav>

          <div className="ap-actions">
            {loading ? <span className="ap-loading" role="status" aria-label="Cargando sesión" /> : user ? (
              <div className="ap-anchor">
                <button type="button" className="ap-icon-button" aria-label={`Cuenta de ${user.username}`} aria-expanded={drop === "account"} aria-controls="ap-account-menu" onClick={() => toggleDrop("account")}>
                  <img className={`ap-avatar${isReporter ? " ap-avatar-reporter" : ""}`} src={user.avatar} alt="" />
                </button>
                {drop === "account" && <div id="ap-account-menu" className="ap-glass ap-popover"><div className="ap-pop-title"><span className="ap-pop-meta">{isReporter ? "🎥 Reportero TVP" : "Ciudadano"}</span><span className="ap-pop-name">{user.username}</span></div>{accountLinks}</div>}
              </div>
            ) : (
              <a href="/auth/discord" className="ap-cta" aria-label="Iniciar sesión con Discord para acceder a Mi Carpeta"><Icon name="login" size={16}/><span className="ap-cta-label">Mi Carpeta</span></a>
            )}
            <button className="ap-icon-button ap-menu-button" type="button" aria-label={drawerOpen ? "Cerrar menú" : "Abrir menú"} aria-controls="ap-mobile-drawer" aria-expanded={drawerOpen} onClick={() => {setDrawerOpen(v => !v);setDrop(null);}}><Icon name={drawerOpen ? "close" : "menu"} size={21}/></button>
          </div>
        </div>

        {drawerOpen && <div id="ap-mobile-drawer" className="ap-glass ap-drawer">
          {user && <Link href="/carpeta" className="ap-drawer-quick" onClick={() => setDrawerOpen(false)}><span>Mi Carpeta · {user.username}</span><Icon name="arrow" size={16}/></Link>}
          <nav aria-label="Navegación adaptada">
            <section className="ap-drawer-section"><span className="ap-drawer-heading">Navegación</span><div className="ap-drawer-grid">{MAIN_LINKS.map(item => renderLink(item,"ap-drawer-link"))}</div></section>
            <section className="ap-drawer-section"><span className="ap-drawer-heading">Comunidad</span><div className="ap-drawer-grid">{COMMUNITY_LINKS.map(item => renderLink(item,"ap-drawer-link"))}</div></section>
            <section className="ap-drawer-section"><span className="ap-drawer-heading">Información y servicios</span><div className="ap-drawer-grid">{INFO_LINKS.map(item => renderLink(item,"ap-drawer-link"))}</div></section>
          </nav>
        </div>}
      </header>
    </>
  );
}
