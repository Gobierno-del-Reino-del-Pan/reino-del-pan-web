import { Link, useLocation } from "wouter";
import { useEffect, useMemo, useRef, useState } from "react";

// Se mantienen las rutas y los servicios del componente original.
const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/gobierno", label: "Gobierno" },
  { href: "/borp", label: "Boletín" },
  { href: "/level", label: "Niveles" },
  { href: "/policia", label: "DPI - CPNP" },
];

const comunidadItems = [
  { href: "/Politics", label: "Grupos Políticos" },
  { href: "https://www.mafiadepan.com/", label: "La Mafia", isExternal: true },
  { href: "/pkmn", label: "PKMN" },
  { href: "/Pandora", label: "Conf. Episcopal de Pandora" },
  { href: "/turismo", label: "Turismo" },
];

const infoItems = [
  { href: "/donations", label: "Donaciones" },
  { href: "/laliga", label: "LA MiGA" },
  { href: "/tvp", label: "TVP" },
  { href: "/FTech", label: "Fuerza Tech" },
  { href: "/Igualdad", label: "Igualdad" },
  { href: "/about", label: "Acerca de" },
];

interface DiscordUser {
  id: string;
  username: string;
  avatar: string;
  inGuild: boolean;
  verificado: boolean;
  dpi: { nombre: string; apellidos: string; dpi_number: string } | null;
  roles: any[];
}

type DropName = "comunidad" | "info" | "usuario" | null;
type SubItem = { href: string; label: string; isExternal?: boolean };

const Chevron = ({ up = false }: { up?: boolean }) => (
  <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
    className={`shrink-0 transition-transform duration-200 ${up ? "rotate-180" : ""}`}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const MenuIcon = ({ open }: { open: boolean }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
    className="transition-transform duration-300">
    <path className="origin-center transition-all duration-300"
      d={open ? "M5 5 19 19" : "M4 7h16"} />
    <path className={`transition-opacity duration-150 ${open ? "opacity-0" : "opacity-100"}`} d="M4 12h16" />
    <path d={open ? "M19 5 5 19" : "M4 17h16"} />
  </svg>
);

// Tanto el isotipo como el nombre mantienen su ruta al inicio.
function Brand() {
  return (
    <Link href="/" aria-label="Ir al inicio de Pan" className="pan-brand group flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-3">
      <span className="pan-brand-icon relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-[15px] sm:h-11 sm:w-11">
        <img src="/logo.png" alt="" className="relative z-10 h-full w-full object-contain p-1" />
      </span>
      <span className="min-w-0 leading-none">
        <span className="block text-[9px] font-semibold uppercase tracking-[0.26em] text-[#8C6488]">ARTIS PANIS</span>
        <span className="mt-1 flex items-baseline gap-[5px] whitespace-nowrap text-[12px] font-black uppercase tracking-[0.045em] text-[#630B57] sm:text-[13px]">
          <span className="pan-strike" aria-label="Reino del, tachado">REINO DEL</span>
          <span>PAN</span>
        </span>
      </span>
    </Link>
  );
}

export default function Header() {
  const [location] = useLocation();
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [drop, setDrop] = useState<DropName>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/me", { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error("No se pudo cargar la sesión"); return r.json(); })
      .then(d => setUser(d.user ?? null))
      .catch(err => { if (err.name !== "AbortError") setUser(null); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const onOutside = (event: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setDrop(null);
        setMobileOpen(false);
      }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setDrop(null); setMobileOpen(false); }
    };
    document.addEventListener("pointerdown", onOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", onOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  useEffect(() => { setMobileOpen(false); setDrop(null); }, [location]);

  const esReportero = useMemo(() => {
    if (!user || !Array.isArray(user.roles)) return false;
    return user.roles.some(rol => {
      if (!rol) return false;
      const id = rol.id || rol.discord_role_id || String(rol);
      const nombre = typeof rol === "string" ? rol : (rol.nombre || rol.name || "");
      return id === "1507784487084363858" || nombre.toLowerCase().includes("reportero");
    });
  }, [user]);

  const allNavItems = useMemo(() => user
    ? [...navItems, { href: "/carpeta", label: "Mi Carpeta" }]
    : navItems, [user]);

  const active = (href: string) => href === "/"
    ? location === "/"
    : location.toLowerCase().startsWith(href.toLowerCase());
  const comunidadActive = comunidadItems.some(x => !x.isExternal && active(x.href));
  const infoActive = infoItems.some(x => active(x.href));
  const toggleDrop = (which: Exclude<DropName, null>) => setDrop(d => d === which ? null : which);

  const renderItems = (items: SubItem[]) => items.map(item => {
    const isMafia = item.isExternal;
    const klass = `pan-menu-item ${active(item.href) && !isMafia ? "pan-menu-selected" : ""} ${isMafia ? "mafia-hacker-link" : ""}`;
    if (isMafia) return (
      <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className={klass}>
        <span className="w-5 text-center">♠</span>{item.label}
        <span aria-hidden="true" className="ml-auto opacity-50">↗</span>
      </a>
    );
    return <Link key={item.href} href={item.href} className={klass}>{item.label}</Link>;
  });

  return (
    <header ref={headerRef} className="pan-header sticky top-0 z-50 w-full px-3 pt-3 sm:px-5 sm:pt-4 lg:px-6">
      <style>{`
        .pan-glass {
          position: relative;
          isolation: isolate;
          background: linear-gradient(122deg, rgba(255,255,255,.82), rgba(253,245,252,.65) 42%, rgba(255,255,255,.74));
          border: 1px solid rgba(255,255,255,.86);
          box-shadow: 0 2px 2px rgba(255,255,255,.85) inset, 0 -1px 1px rgba(99,11,87,.08) inset,
            0 10px 35px rgba(46,12,42,.13), 0 2px 9px rgba(46,12,42,.05);
          -webkit-backdrop-filter: blur(28px) saturate(175%);
          backdrop-filter: blur(28px) saturate(175%);
        }
        .pan-glass::before {
          content: ""; position: absolute; inset: 1px; z-index: -1; pointer-events: none;
          border-radius: inherit;
          background: linear-gradient(175deg, rgba(255,255,255,.35), transparent 37%, rgba(99,11,87,.025) 90%);
        }
        .pan-header-main { border-radius: 24px; }
        .pan-brand-icon {
          background: linear-gradient(145deg, rgba(255,255,255,.86), rgba(245,214,239,.68));
          box-shadow: inset 0 1px 1px white, 0 3px 9px rgba(99,11,87,.11);
          border: 1px solid rgba(255,255,255,.9);
          transition: transform .3s cubic-bezier(.2,.85,.25,1),box-shadow .3s;
        }
        .pan-brand:hover .pan-brand-icon { transform: translateY(-2px) rotate(-3deg); box-shadow: 0 7px 20px rgba(99,11,87,.2); }
        .pan-strike { position: relative; text-decoration: line-through; text-decoration-color: #9D4E92; text-decoration-thickness: 1.8px; text-decoration-skip-ink: none; opacity: .8; }
        .pan-nav {
          display: flex; align-items: center; gap: 2px; padding: 5px;
          border: 1px solid rgba(255,255,255,.72); border-radius: 999px;
          background: rgba(255,255,255,.34); box-shadow: 0 1px 2px rgba(70,10,60,.035) inset;
        }
        .pan-nav-link {
          display: inline-flex; justify-content: center; align-items: center; gap: 5px;
          padding: 10px 11px; border-radius: 999px; white-space: nowrap;
          font-size: 10px; font-weight: 750; letter-spacing: .06em; text-transform: uppercase;
          color: #61465B; transition: background .2s, color .2s, box-shadow .2s, transform .2s;
        }
        .pan-nav-link:hover { background: rgba(99,11,87,.09); color: #630B57; }
        .pan-nav-link[data-active="true"] {
          color: #fff; background: linear-gradient(160deg, #8A287D, #630B57);
          box-shadow: 0 2px 6px rgba(99,11,87,.19), inset 0 1px 1px rgba(255,255,255,.23);
        }
        .pan-nav-link[data-expanded="true"] { background: rgba(99,11,87,.12); color: #630B57; }
        .pan-nav-link:focus-visible, .pan-icon-button:focus-visible, .pan-menu-item:focus-visible,
        .pan-cta:focus-visible, .pan-brand:focus-visible { outline: 3px solid #B879AD; outline-offset: 3px; }
        .pan-popover {
          position: absolute; top: calc(100% + 13px); min-width: 220px; padding: 7px;
          border-radius: 21px; animation: panGlassAppear .18s ease-out both;
        }
        .pan-menu-item {
          display: flex; align-items: center; gap: 9px; width: 100%;
          border-radius: 13px; padding: 12px 13px; color: #4E384A;
          font-size: 12px; font-weight: 650; text-align: left;
          transition: background .18s, color .18s;
        }
        .pan-menu-item:hover, .pan-menu-selected { background: rgba(99,11,87,.09); color: #630B57; }
        .pan-icon-button {
          width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;
          border: 1px solid rgba(255,255,255,.88); border-radius: 15px;
          background: rgba(255,255,255,.48); color: #630B57;
          box-shadow: inset 0 1px 1px #fff, 0 3px 9px rgba(51,15,46,.07);
          transition: background .2s, transform .2s;
        }
        .pan-icon-button:hover { background: rgba(247,229,244,.95); transform: translateY(-1px); }
        .pan-cta {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          min-height: 41px; padding: 0 15px; border-radius: 15px;
          background: linear-gradient(155deg,#812375,#630B57 75%); color: white;
          font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .07em;
          border: 1px solid rgba(255,255,255,.2);
          box-shadow: inset 0 1px 1px rgba(255,255,255,.2), 0 5px 15px rgba(99,11,87,.18);
          transition: transform .2s, box-shadow .2s;
        }
        .pan-cta:hover { transform: translateY(-1px); box-shadow: 0 8px 18px rgba(99,11,87,.28); }
        .pan-mobile-panel { border-radius: 25px; animation: panGlassAppear .22s ease-out both; }
        .pan-mobile-link {
          display: flex; align-items: center; padding: 12px 14px; border-radius: 13px;
          font-size: 12px; font-weight: 700; color: #483445;
        }
        .pan-mobile-link:hover, .pan-mobile-link[data-active="true"] { background: rgba(99,11,87,.09); color: #630B57; }
        @keyframes panGlassAppear { from { opacity: 0; transform: translateY(-8px) scale(.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes mafiaGlitch {
          0%, 100% { text-shadow: 1.5px 0 #ef4444, -1.5px 0 #06b6d4; transform:translate(0); }
          35% { text-shadow: -1.5px 0 #ef4444, 1.5px 0 #06b6d4; transform:translate(-1px,.5px); }
          70% { text-shadow: 1.5px 0 #eab308, -1.5px 0 #ef4444; transform:translate(1px,-.5px); }
        }
        .mafia-hacker-link:hover { animation: mafiaGlitch .25s linear infinite; background:rgba(239,68,68,.08)!important; color:#dc2626!important; }
        @media (prefers-reduced-motion: reduce) {
          .pan-header *, .pan-header *::before, .pan-header *::after { animation-duration: .01ms!important; transition-duration: .01ms!important; }
        }
        @media (max-width: 639px) { .pan-header-main { border-radius: 21px; } }
      `}</style>

      <div className="pan-glass pan-header-main mx-auto flex min-h-[72px] max-w-[1500px] items-center justify-between gap-3 px-3 py-2 sm:px-4 lg:px-5">
        <Brand />

        <nav aria-label="Navegación principal" className="pan-nav hidden xl:flex">
          {allNavItems.map(item => (
            <Link key={item.href} href={item.href} className="pan-nav-link" data-active={active(item.href)}
              aria-current={active(item.href) ? "page" : undefined}>{item.label}</Link>
          ))}

          <div className="relative">
            <button type="button" className="pan-nav-link" data-active={comunidadActive}
              data-expanded={drop === "comunidad"} aria-haspopup="menu" aria-expanded={drop === "comunidad"}
              onClick={() => toggleDrop("comunidad")}>
              Comunidad <Chevron up={drop === "comunidad"} />
            </button>
            {drop === "comunidad" && (
              <div role="menu" className="pan-glass pan-popover left-0">{renderItems(comunidadItems)}</div>
            )}
          </div>

          <div className="relative">
            <button type="button" className="pan-nav-link" data-active={infoActive}
              data-expanded={drop === "info"} aria-haspopup="menu" aria-expanded={drop === "info"}
              onClick={() => toggleDrop("info")}>
              Info <Chevron up={drop === "info"} />
            </button>
            {drop === "info" && (
              <div role="menu" className="pan-glass pan-popover right-0">{renderItems(infoItems)}</div>
            )}
          </div>
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {loading ? (
            <span className="h-10 w-10 animate-pulse rounded-[15px] bg-[#630B57]/10" aria-label="Cargando sesión" />
          ) : user ? (
            <div className="relative">
              <button type="button" onClick={() => toggleDrop("usuario")}
                className="pan-icon-button relative" aria-label={`Abrir menú de ${user.username}`}
                aria-haspopup="menu" aria-expanded={drop === "usuario"}>
                <img src={user.avatar} alt="" className={`h-8 w-8 rounded-[11px] object-cover ${esReportero ? "ring-2 ring-amber-400" : ""}`} />
                <span className="absolute bottom-[5px] right-[5px] h-2 w-2 rounded-full border border-white bg-emerald-500" />
              </button>
              {drop === "usuario" && (
                <div role="menu" className="pan-glass pan-popover right-0 w-[250px]">
                  <div className="mb-1 border-b border-[#630B57]/10 px-3 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[.1em] text-[#876880]">{esReportero ? "🎥 Reportero TVP" : "Ciudadano"}</p>
                    <p className="mt-1 truncate text-sm font-bold text-[#43113C]">{user.username}</p>
                  </div>
                  <Link href="/carpeta" className="pan-menu-item">📁 Mi Carpeta</Link>
                  <a href="/consorcio" className="pan-menu-item"><img src="/CONSORCIO/consorcio.png" alt="" className="h-4 w-4 object-contain" /> Tarjeta Transporte</a>
                  <a href="/electa" className="pan-menu-item"><img src="/electa/electa.png" alt="" className="h-4 w-4 object-contain" /> Electa. Elecciones</a>
                  <a href="https://mineco.duckdns.org/lpb/cuenta" className="pan-menu-item"><img src="/LaboralBank/LPB.png" alt="" className="h-4 w-4 object-contain" /> Cuenta Bancaria LPB</a>
                  {esReportero && <Link href="/TVP/PanelDeControl" className="pan-menu-item">🎥 Panel TVP</Link>}
                  <div className="my-1 h-px bg-[#630B57]/10" />
                  <a href="/auth/logout" className="pan-menu-item !text-red-600 hover:!bg-red-50">↪ Cerrar sesión</a>
                </div>
              )}
            </div>
          ) : (
            <a href="/auth/discord" className="pan-cta">
              <img src="/clave.png" alt="" className="h-4 w-4 object-contain brightness-0 invert" />
              <span className="hidden sm:inline">Mi Carpeta</span><span className="sm:hidden">Entrar</span>
            </a>
          )}

          <button type="button" aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileOpen} aria-controls="pan-mobile-navigation"
            className="pan-icon-button xl:hidden" onClick={() => { setMobileOpen(v => !v); setDrop(null); }}>
            <MenuIcon open={mobileOpen} />
          </button>
        </div>
      </div>

      {/* Menú móvil anclado al header: mismo acabado cristal, sin oscurecer toda la página. */}
      {mobileOpen && (
        <div id="pan-mobile-navigation" className="pan-glass pan-mobile-panel mx-auto mt-2 max-h-[calc(100dvh-110px)] max-w-[1500px] overflow-y-auto p-3 shadow-2xl xl:hidden">
          <nav aria-label="Navegación móvil">
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {allNavItems.map(item => (
                <Link key={item.href} href={item.href} className="pan-mobile-link" data-active={active(item.href)}
                  aria-current={active(item.href) ? "page" : undefined}>{item.label}</Link>
              ))}
            </div>
            <div className="my-3 h-px bg-[#630B57]/10" />
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[.15em] text-[#90688B]">Comunidad</p>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">{renderItems(comunidadItems)}</div>
            <div className="my-3 h-px bg-[#630B57]/10" />
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[.15em] text-[#90688B]">Información</p>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">{renderItems(infoItems)}</div>
          </nav>
        </div>
      )}
    </header>
  );
}
