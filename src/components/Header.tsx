import { Link, useLocation } from "wouter";
import { useEffect, useState, useRef, useMemo } from "react";

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/about", label: "Acerca de" },
  { href: "/level", label: "Level" },
  { href: "/dpi", label: "DPI" },
];

const otrosItems = [
  { href: "/Politics", label: "Política" },
  { href: "/pkmn", label: "PKMN" },
  { href: "/donations", label: "Donaciones" },
  { href: "/laliga", label: "LA MiGA" },
  { href: "/tvp", label: "TVP" },
  { href: "/gobierno", label: "Gobierno" },
  //{ href: "/lpb", label: "LPB" },
];

interface DiscordUser {
  id: string;
  username: string;
  avatar: string;
  inGuild: boolean;
  verificado: boolean;
  dpi: { nombre: string; apellidos: string; dpi_number: string } | null;
  roles: { id: string; nombre: string; emoji: string }[];
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

  const allNavItems = useMemo(() => {
    return [
      ...navItems,
      ...(user ? [{ href: "/carpeta", label: "Mi Carpeta" }] : []),
    ];
  }, [user]);

  const isOtrosActive = useMemo(() => {
    return otrosItems.some(item => location.toLowerCase().startsWith(item.href.toLowerCase()));
  }, [location]);

  return (
    <>
      <header className="border-b border-white/5 bg-background/70 backdrop-blur-md sticky top-0 z-50 transition-all duration-300 shadow-sm">
        <div className="container mx-auto flex items-center justify-between gap-4 py-3.5 px-4 sm:px-6">

          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative">
              <img
                src="/logo.png"
                alt="Reino del Pan"
                className="h-10 w-10 rounded-full border border-white/10"
              />
              <div className="absolute inset-0 rounded-full bg-accent/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                  className={`relative px-3 py-1.5 uppercase tracking-[0.18em] text-[11px] font-bold transition-all duration-300 whitespace-nowrap rounded-md ${isActive
                    ? "text-accent bg-accent/5 font-extrabold"
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
                className={`px-3 py-1.5 uppercase tracking-[0.18em] text-[11px] font-bold transition-all duration-300 whitespace-nowrap rounded-md flex items-center gap-1 cursor-pointer ${isOtrosActive
                  ? "text-background bg-accent font-extrabold shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                  : "text-accent bg-accent/10 hover:bg-accent/20"
                  }`}
              >
                Otros
                <svg className={`w-3 h-3 transition-transform duration-200 ${otrosOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {otrosOpen && (
                <div className="absolute left-0 mt-2 w-44 rounded-xl border border-accent/20 bg-white shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {otrosItems.map((subItem) => {
                    const isSubActive = location.toLowerCase().startsWith(subItem.href.toLowerCase());
                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`w-full block px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] transition duration-200 ${isSubActive
                          ? "text-black bg-neutral-100 font-black"
                          : "text-neutral-800 hover:text-neutral-950 hover:bg-neutral-100"
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
              <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 animate-pulse" />
            ) : user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => { setMenuOpen(v => !v); }}
                  className="flex items-center focus:outline-none group cursor-pointer"
                >
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-300 shadow-md ${menuOpen ? "border-accent scale-105 shadow-accent/20" : "border-white/20 group-hover:border-accent/70"
                      }`}
                  />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-3 w-48 rounded-xl border border-black/10 bg-white/95 backdrop-blur-lg shadow-xl overflow-hidden z-50">

                    {/* Encabezado */}
                    <div className="px-4 py-2.5 border-b border-black/5 bg-black/[0.02]">
                      <p className="text-[10px] text-black/40 uppercase tracking-wider font-semibold">Ciudadano</p>
                      <p className="text-xs font-bold text-black truncate mt-0.5">{user.username}</p>
                    </div>

                    {/* Enlace: Mi Carpeta */}
                    <Link
                      href="/carpeta"
                      className="w-full flex items-center gap-2 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-black/70 hover:text-accent hover:bg-accent/5 transition duration-200"
                    >
                      📁 Mi Carpeta
                    </Link>

                    <a
                      href={`/api/dpi/verify-discord/${user.id}`} // Pasamos el ID de Discord directo
                      className="w-full flex items-center gap-2 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-black/70 hover:text-accent hover:bg-accent/5 transition duration-200 border-t border-black/5"
                    >
                      🆔 Tarjeta DPI
                    </a>

                    {/* Botón: Cerrar Sesión */}
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
                className="hidden sm:inline-flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.18em]
                  border border-accent text-accent bg-accent/5
                  transition-all duration-300 hover:bg-accent hover:text-background hover:shadow-[0_0_25px_rgba(212,175,55,0.35)] active:scale-[0.98]"
              >
                <img src="/clave.png" alt="" className="w-3.5 h-3.5 object-contain opacity-90 group-hover:brightness-0" />
                Mi Carpeta
              </button>
            )}

            <button
              onClick={() => { setMobileOpen(v => !v); }}
              className="lg:hidden flex flex-col justify-center items-center w-10 h-10 rounded-full border border-black/10 bg-white hover:bg-neutral-200 transition relative z-50 cursor-pointer shadow-sm"
              aria-label="Menú"
            >
              <div className="w-5 h-3.5 flex flex-col justify-between relative">
                <span className={`block w-5 h-0.5 rounded-full transition-all duration-300 ${mobileOpen ? "bg-black rotate-45 translate-y-1.5" : "bg-black"}`} />
                <span className={`block w-5 h-0.5 rounded-full transition-all duration-300 ${mobileOpen ? "opacity-0 scale-0" : "bg-black"}`} />
                <span className={`block w-5 h-0.5 rounded-full transition-all duration-300 ${mobileOpen ? "bg-black -rotate-45 -translate-y-1.5" : "bg-black"}`} />
              </div>
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 pt-[69px]">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => { setMobileOpen(false); }}
          />
          <div className="relative bg-neutral-100 border-b border-neutral-300 shadow-2xl overflow-y-auto max-h-[calc(100vh-69px)] animate-in slide-in-from-top duration-200">
            <nav className="container mx-auto px-5 py-6 flex flex-col gap-2">
              {allNavItems.map((item) => {
                const isActive = item.href === "/"
                  ? location === "/"
                  : location.toLowerCase().startsWith(item.href.toLowerCase());

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center px-4 py-3 rounded-md text-[11px] font-bold uppercase tracking-[0.18em] transition-all duration-200 ${isActive
                      ? "text-neutral-900 bg-accent/20 font-black"
                      : "text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200"
                      }`}
                  >
                    <span className="flex-1">{item.label}</span>
                    {isActive && (
                      <span className="absolute left-0 top-3 bottom-3 w-1 bg-accent rounded-full" />
                    )}
                  </Link>
                );
              })}

              <div className="h-px bg-neutral-300 my-2" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 px-4 mb-1">Otros apartados</p>

              {otrosItems.map((subItem) => {
                const isSubActive = location.toLowerCase().startsWith(subItem.href.toLowerCase());
                return (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    className={`relative flex items-center pl-8 pr-4 py-2.5 rounded-md text-[11px] font-bold uppercase tracking-[0.18em] transition-all duration-200 ${isSubActive
                      ? "text-neutral-900 bg-accent/20 font-black"
                      : "text-neutral-900 bg-white hover:bg-neutral-50 border border-neutral-200 shadow-sm mb-1"
                      }`}
                  >
                    <span className="flex-1">🔹 {subItem.label}</span>
                    {isSubActive && (
                      <span className="absolute left-4 top-2.5 bottom-2.5 w-1 bg-accent rounded-full" />
                    )}
                  </Link>
                );
              })}

              {!user && !loading && (
                <button
                  onClick={() => { window.location.href = "/auth/discord"; }}
                  className="mt-4 flex items-center justify-center gap-2 px-4 py-3.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] border border-neutral-400 bg-neutral-950 text-white hover:bg-neutral-800 transition-all duration-300 cursor-pointer shadow-md"
                >
                  <img src="/clave.png" alt="" className="w-3.5 h-3.5 object-contain brightness-0 invert" />
                  Mi Carpeta
                </button>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}