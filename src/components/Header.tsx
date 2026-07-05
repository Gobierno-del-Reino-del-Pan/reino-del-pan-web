import { Link, useLocation } from "wouter";
import { useEffect, useState, useRef, useMemo } from "react";

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/about", label: "Acerca de" },
  { href: "/level", label: "Niveles" },
  { href: "/dpi", label: "DPI" },
  { href: "/borp", label: "BORP" },
];

const otrosItems = [
  { href: "/Politics", label: "Política" },
  { href: "/gobierno", label: "Gobierno" },
  { href: "/pkmn", label: "PKMN" },
  { href: "/donations", label: "Donaciones" },
  { href: "/laliga", label: "LA MiGA" },
  { href: "/tvp", label: "TVP" },
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

export default function Header() {
  const [location] = useLocation();
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [otrosOpen, setOtrosOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const otrosRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        if (isMounted) setUser(d.user ?? null);
      })
      .catch(() => {
        if (isMounted) setUser(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (otrosRef.current && !otrosRef.current.contains(e.target as Node)) {
        setOtrosOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOtrosOpen(false);
  }, [location]);

  const esReportero = useMemo(() => {
    if (!user || !Array.isArray(user.roles)) return false;
    return user.roles.some((rol) => {
      if (!rol) return false;
      const idRol = rol.id || rol.discord_role_id || String(rol);
      const nombreRol = typeof rol === "string" ? rol : (rol.nombre || rol.name || "");

      return (
        idRol === "1507784487084363858" ||
        nombreRol.toLowerCase().includes("reportero")
      );
    });
  }, [user]);

  const allNavItems = useMemo(() => {
    const items = [...navItems];
    if (user) {
      items.push({ href: "/carpeta", label: "Mi Carpeta" });
    }
    return items;
  }, [user]);

  const isOtrosActive = useMemo(() => {
    return otrosItems.some(item => location.toLowerCase().startsWith(item.href.toLowerCase()));
  }, [location]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-gradient-to-b from-white/10 via-background/60 to-background/70 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_8px_30px_-10px_rgba(0,0,0,0.4)] transition-all duration-300">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        <div className="container mx-auto flex items-center justify-between gap-4 py-3.5 px-4 sm:px-6">

          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative">
              <img
                src="/logo.png"
                alt="Reino del Pan"
                className="h-10 w-10 rounded-full border border-white/15 shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset]"
              />
              <div className="absolute inset-0 rounded-full bg-accent/25 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="hidden sm:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-accent/80 leading-tight">Artis Panis</p>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-accent leading-tight mt-0.5">Reino del Pan</p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {allNavItems.map((item) => {
              const isActive = item.href === "/"
                ? location === "/"
                : location.toLowerCase().startsWith(item.href.toLowerCase());

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3 py-1.5 uppercase tracking-[0.18em] text-[11px] font-bold transition-all duration-300 whitespace-nowrap rounded-full ${isActive
                    ? "text-accent bg-white/10 backdrop-blur-md font-extrabold shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset]"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-accent rounded-full shadow-[0_0_8px_#d4af37]" />
                  )}
                </Link>
              );
            })}

            <div className="relative" ref={otrosRef}>
              <button
                onClick={() => setOtrosOpen(v => !v)}
                className={`px-3 py-1.5 uppercase tracking-[0.18em] text-[11px] font-bold transition-all duration-300 whitespace-nowrap rounded-full flex items-center gap-1 cursor-pointer backdrop-blur-md ${isOtrosActive
                  ? "text-background bg-accent/90 font-extrabold shadow-[0_0_20px_rgba(212,175,55,0.35),0_0_0_1px_rgba(255,255,255,0.2)_inset]"
                  : "text-accent bg-accent/10 hover:bg-accent/20 shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]"
                  }`}
              >
                Otros
                <svg className={`w-3 h-3 transition-transform duration-200 ${otrosOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {otrosOpen && (
                <div className="absolute left-0 mt-2 w-44 rounded-2xl border border-white/20 bg-white/70 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_12px_40px_-8px_rgba(0,0,0,0.25)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {otrosItems.map((subItem) => {
                    const isSubActive = location.toLowerCase().startsWith(subItem.href.toLowerCase());
                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`w-full block px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] transition duration-200 ${isSubActive
                          ? "text-black bg-white/60 font-black"
                          : "text-neutral-800 hover:text-neutral-950 hover:bg-white/40"
                          }`}
                      >
                        {subItem.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full border border-white/15 bg-white/10 backdrop-blur-md animate-pulse" />
            ) : user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => { setMenuOpen(v => !v); }}
                  className="flex items-center focus:outline-none group cursor-pointer relative"
                >
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-300 shadow-md ${menuOpen
                      ? "border-accent scale-105 shadow-accent/30"
                      : esReportero
                        ? "border-amber-400 ring-2 ring-amber-500/25 shadow-[0_0_10px_rgba(245,158,11,0.35)]"
                        : "border-white/25 group-hover:border-accent/70"
                      }`}
                  />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-3 w-48 rounded-2xl border border-white/20 bg-white/70 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_12px_40px_-8px_rgba(0,0,0,0.25)] overflow-hidden z-50">
                    <div className="px-4 py-2.5 border-b border-black/5 bg-white/30">
                      <p className="text-[10px] text-black/40 uppercase tracking-wider font-semibold">
                        {esReportero ? "🎥 Reportero TVP" : "Ciudadano"}
                      </p>
                      <p className="text-xs font-bold text-black truncate mt-0.5">{user.username}</p>
                    </div>

                    <Link
                      href="/carpeta"
                      className="w-full flex items-center gap-2 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-black/70 hover:text-accent hover:bg-white/40 transition duration-200"
                    >
                      📁 Mi Carpeta
                    </Link>

                    <a
                      href={`/api/dpi/verify-discord/${user.id}`}
                      className="w-full flex items-center gap-2 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-black/70 hover:text-accent hover:bg-white/40 transition duration-200 border-t border-black/5"
                    >
                      🆔 Tarjeta DPI
                    </a>

                    <a
                      href={"/consorcio"}
                      className="w-full flex items-center gap-2 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-black/70 hover:text-accent hover:bg-white/40 transition duration-200 border-t border-black/5"
                    >
                      <img
                        src="/CONSORCIO/consorcio.png"
                        className="w-[1em] h-[1em] object-contain inline-block align-text-bottom"
                        alt="logo consorcio"
                      />
                      <span>Tarjeta Transporte</span>
                    </a>

                    {esReportero && (
                      <Link
                        href="/TVP/PanelDeControl"
                        className="w-full flex items-center gap-2 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-accent bg-accent/10 hover:bg-accent/20 transition duration-200 border-t border-black/5"
                      >
                        🎥 Panel TVP
                      </Link>
                    )}

                    <button
                      onClick={() => { window.location.href = "/auth/logout"; }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-red-500 hover:bg-red-500/10 transition duration-200 border-t border-black/5 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => { window.location.href = "/auth/discord"; }}
                className="inline-flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer px-4 py-2 sm:px-5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] border border-accent/60 text-accent bg-accent/10 backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset] transition-all duration-300 hover:bg-accent hover:text-background hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] active:scale-[0.98]"
              >
                <img src="/clave.png" alt="" className="w-3.5 h-3.5 object-contain opacity-90" />
                <span className="block sm:hidden">Inicia Aquí</span>
                <span className="hidden sm:block">Mi Carpeta</span>
              </button>
            )}

            <button
              onClick={() => { setMobileOpen(v => !v); }}
              className="lg:hidden flex flex-col justify-center items-center w-10 h-10 rounded-full border border-neutral-300 bg-white/20 backdrop-blur-md hover:bg-white/30 transition relative z-50 cursor-pointer shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset]"
              aria-label="Menú"
            >
              <div className="w-5 h-3.5 flex flex-col justify-between relative">
                {/* CAMBIO: Barras del menú hamburguesa en negro/oscuro */}
                <span className={`block w-5 h-0.5 rounded-full transition-all duration-300 ${mobileOpen ? "bg-foreground rotate-45 translate-y-1.5" : "bg-foreground"}`} />
                <span className={`block w-5 h-0.5 rounded-full transition-all duration-300 ${mobileOpen ? "opacity-0 scale-0" : "bg-foreground"}`} />
                <span className={`block w-5 h-0.5 rounded-full transition-all duration-300 ${mobileOpen ? "bg-foreground -rotate-45 -translate-y-1.5" : "bg-foreground"}`} />
              </div>
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 pt-[69px]">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => { setMobileOpen(false); }} />
          <div className="relative mx-3 mt-3 rounded-3xl border border-white/20 bg-white/60 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_20px_50px_-10px_rgba(0,0,0,0.35)] overflow-y-auto max-h-[calc(100vh-90px)] animate-in slide-in-from-top duration-200">
            <nav className="container mx-auto px-5 py-6 flex flex-col gap-2">
              {allNavItems.map((item) => {
                const isActive = item.href === "/"
                  ? location === "/"
                  : location.toLowerCase().startsWith(item.href.toLowerCase());

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-[0.18em] transition-all duration-200 ${isActive
                      ? "text-accent bg-accent/10 font-black shadow-[0_0_0_1px_rgba(var(--accent-rgb),0.2)_inset]"
                      : "text-neutral-700 hover:text-neutral-950 hover:bg-white/40"
                      }`}
                  >
                    <span className="flex-1">{item.label}</span>
                    {isActive && (
                      <span className="absolute left-0 top-3 bottom-3 w-1 bg-accent rounded-full" />
                    )}
                  </Link>
                );
              })}

              <div className="h-px bg-white/40 my-2" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 px-4 mb-1">Otros apartados</p>

              {otrosItems.map((subItem) => {
                const isSubActive = location.toLowerCase().startsWith(subItem.href.toLowerCase());
                return (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    className={`relative flex items-center pl-8 pr-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-[0.18em] transition-all duration-200 ${isSubActive
                      ? "text-accent bg-accent/10 font-black shadow-[0_0_0_1px_rgba(var(--accent-rgb),0.2)_inset]"
                      : "text-neutral-900 bg-white/40 hover:bg-white/55 border border-white/30 shadow-sm mb-1"
                      }`}
                  >
                    <span className="flex-1">🔹 {subItem.label}</span>
                    {isSubActive && (
                      <span className="absolute left-4 top-2.5 bottom-2.5 w-1 bg-accent rounded-full" />
                    )}
                  </Link>
                );
              })}

              {user && (
                <button
                  onClick={() => { window.location.href = "/auth/logout"; }}
                  className="mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] border border-red-300/50 bg-red-50/60 backdrop-blur-md text-red-600 hover:bg-red-100/70 transition-all duration-200 cursor-pointer shadow-sm"
                >
                  Cerrar Sesión
                </button>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}