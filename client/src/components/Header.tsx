import { useState } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';

/**
 * Header Component - Elegancia Minimalista Moderna
 * 
 * Diseño: Blanco puro, navegación en negro, acentos en oro
 * - Logo oficial Artis Panis
 * - Navegación limpia y clara
 * - Responsive con menú hamburguesa en mobile
 * - Toggle de modo oscuro con animaciones
 */
export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Acerca de', href: '/about' },
    { label: 'Gobierno', href: '#government' },
    { label: 'Noticias', href: '#news' },
    { label: 'Servicios', href: '#services' },
    { label: 'Donaciones', href: '#donate' },
  ];

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container flex items-center justify-between h-24">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center"
        >
          <div className="logo-glow">
            <img src="/src/assets/logo.png" alt="Artis Panis Logo" className="w-14 h-14 object-contain" />
          </div>
          <span className="ml-3 display-font text-xl text-foreground hidden sm:inline">
            Reino del Pan
          </span>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item, index) => (
            <motion.a
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={item.label}
              href={item.href}
              className="text-foreground hover:text-accent transition-colors duration-200 text-sm font-medium"
            >
              {item.label}
            </motion.a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-secondary transition-colors duration-200 text-foreground"
            aria-label="Cambiar tema"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* CTA Button - Desktop */}
          <Link href="/dpi">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-minimal text-sm"
            >
              Obtener DPI
            </motion.button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-secondary transition-colors duration-200 text-foreground"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            className="p-2 hover:bg-secondary transition-colors duration-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <motion.nav 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden bg-secondary border-t border-border overflow-hidden"
        >
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
            <Link href="/dpi">
              <button className="btn-minimal text-sm w-full" onClick={() => setMobileMenuOpen(false)}>
                Obtener DPI
              </button>
            </Link>
          </div>
        </motion.nav>
      )}
    </header>
  );
}
