import { Link, useLocation } from "wouter";
import { useEffect, useState, useRef } from "react";

const navItems = [
  { href: "/",          label: "Inicio" },
  { href: "/about",     label: "Acerca de" },
  { href: "/gobierno",  label: "Gobierno" },
  { href: "/Politics",  label: "Política" },
  { href: "/dpi",       label: "DPI" },
  { href: "/donations", label: "Donaciones" },
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/me")
      .then(r => r.json())
      .then(d => setUser(d.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Cerrar menú avatar al click fuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const allNavItems = [
    ...navItems,
    ...(user ? [{ href: "/carpeta", label: "Mi Carpeta" }] : []),
  ];

  return (
    <>
      <header className="border-b border-border bg-background/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between gap-4 py-3 px-4 md:px-0">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo.png" alt="Reino del Pan" className="h-10 w-10 rounded-full logo-glow" />
            <div className="hidden sm:block">
              <p className="text-xs uppercase tracking-[0.28em] text-foreground/60 leading-tight">Artis Panis</p>
              <p className="text-xs uppercase tracking-[0.3em] text-foreground/70 leading-tight">Reino del Pan</p>
            </div>
          </Link>

          {/* Nav DESKTOP */}
          <nav className="hidden lg:flex items-center gap-5 text-xs">
            {allNavItems.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link uppercase tracking-[0.16em] text-xs transition-all pb-1 border-b-2 whitespace-nowrap ${
                    isActive ? "text-accent border-accent font-semibold" : "text-foreground/70 border-transparent hover:text-accent"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Derecha */}
          <div className="flex items-center gap-3">
            {/* Avatar / Login */}
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-border/30 animate-pulse" />
            ) : user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(v => !v)}
                  className="flex items-center focus:outline-none"
                >
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className={`w-8 h-8 rounded-full border-2 transition ${menuOpen ? "border-accent" : "border-accent/40 hover:border-accent"}`}
                  />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-44 rounded-xl border border-border bg-background shadow-lg overflow-hidden z-50">
                    <Link
                      href="/carpeta"
                      className="w-full flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-[0.18em] text-foreground/60 hover:text-accent hover:bg-accent/5 transition"
                    >
                      Mi Carpeta
                    </Link>
                    <button
                      onClick={() => { window.location.href = "/auth/logout"; }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-[0.18em] text-foreground/50 hover:text-red-400 hover:bg-red-500/5 transition border-t border-border"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => { window.location.href = "/auth/discord"; }}
                className="hidden sm:inline-flex shrink-0 whitespace-nowrap cursor-pointer px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-[0.18em]
                  border border-accent/60 text-accent/90
                  transition-all duration-300 hover:bg-accent hover:text-background hover:border-accent hover:shadow-[0_2px_20px_#d4af3730]"
              >
                Mi Carpeta
              </button>
            )}

            {/* Hamburguesa MOBILE */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="lg:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-lg border border-border/60 bg-background/80 hover:border-accent/40 transition"
              aria-label="Menú"
            >
              <span className={`block w-5 h-0.5 bg-foreground/70 transition-all duration-200 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-5 h-0.5 bg-foreground/70 transition-all duration-200 ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-0.5 bg-foreground/70 transition-all duration-200 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Menú móvil desplegable */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 pt-[65px]">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Panel */}
          <div className="relative bg-background border-b border-border shadow-xl">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {allNavItems.map((item) => {
                const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium uppercase tracking-[0.16em] transition ${
                      isActive
                        ? "bg-accent/10 text-accent"
                        : "text-foreground/70 hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {!user && !loading && (
                <button
                  onClick={() => { window.location.href = "/auth/discord"; }}
                  className="mt-2 flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold uppercase tracking-[0.16em] border-2 border-accent bg-accent/10 text-accent hover:bg-accent hover:text-background transition"
                >
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