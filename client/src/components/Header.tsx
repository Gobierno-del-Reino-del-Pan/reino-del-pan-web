import { useState } from 'react';
import { Menu, X } from 'lucide-react';

/**
 * Header Component - Elegancia Minimalista Moderna
 * 
 * Diseño: Blanco puro, navegación en negro, acentos en oro
 * - Logo blanco con halo de oro en hover
 * - Navegación limpia y clara
 * - Responsive con menú hamburguesa en mobile
 */
export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Inicio', href: '#' },
    { label: 'Acerca de', href: '#about' },
    { label: 'Gobierno', href: '#government' },
    { label: 'Noticias', href: '#news' },
    { label: 'Servicios', href: '#services' },
    { label: 'Donaciones', href: '#donate' },
  ];

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container flex items-center justify-between h-24">
        {/* Logo */}
        <div className="flex items-center">
          <div className="logo-glow">
            <div className="w-12 h-12 bg-foreground rounded-sm flex items-center justify-center">
              <span className="display-font text-xl text-background">🍞</span>
            </div>
          </div>
          <span className="ml-3 display-font text-xl text-foreground hidden sm:inline">
            Reino del Pan
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-foreground hover:text-accent transition-colors duration-200 text-sm font-medium"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* CTA Button - Desktop */}
        <button className="hidden lg:block btn-minimal text-sm">
          e-Residencia
        </button>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 hover:bg-secondary transition-colors duration-200"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-foreground" />
          ) : (
            <Menu className="w-6 h-6 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="lg:hidden bg-secondary border-t border-border">
          <div className="container py-4 flex flex-col gap-4">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-foreground hover:text-accent transition-colors duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <button className="btn-minimal text-sm w-full">
              e-Residencia
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
