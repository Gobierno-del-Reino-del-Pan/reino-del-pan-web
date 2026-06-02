import { Link, useLocation } from "wouter";

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/about", label: "Acerca de" },
  { href: "/gobierno", label: "Gobierno" },
  { href: "/Politics", label: "Política" },
  { href: "/dpi", label: "DPI" },
  { href: "/donations", label: "Donaciones" },
];

export default function Header() {
  const [location] = useLocation();
  return (
    <header className="border-b border-border bg-background/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between gap-4 py-4 px-4 md:px-0">

        <Link href="/" className="flex items-center gap-2 md:gap-3 shrink-0">
          <img src="/logo.png" alt="Reino del Pan" className="h-10 md:h-12 w-10 md:w-12 rounded-full logo-glow" />
          <div className="hidden sm:block">
            <p className="text-xs uppercase tracking-[0.28em] text-foreground/60">Artis Panis</p>
            <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-foreground/70">Reino del Pan</p>
          </div>
        </Link>

        <nav className="flex items-center gap-3 md:gap-6 text-xs md:text-sm overflow-x-auto flex-nowrap">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link uppercase tracking-[0.16em] text-xs md:text-sm transition-all pb-1 border-b-2 whitespace-nowrap ${
                  isActive ? 'text-accent border-accent font-semibold' : 'text-foreground/70 border-transparent hover:text-accent'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          className="shrink-0 group relative overflow-hidden whitespace-nowrap cursor-pointer
            px-5 py-2 rounded-md text-xs font-semibold uppercase tracking-[0.18em]
            border border-accent/60 text-accent/90
            transition-all duration-300 hover:text-background hover:border-accent hover:shadow-[0_2px_20px_#d4af3730]"
          style={{ background: "transparent" }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--color-accent)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          Iniciar sesión
        </button>

      </div>
    </header>
  );
}