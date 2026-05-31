import { useState } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import logo from '@/assets/logo.png';

/**
 * Header Component - Elegancia Minimalista Moderna
 * 
 * Diseño: Blanco puro / Oscuro, navegación en negro / blanco, acentos en oro
 * - Logo oficial Artis Panis
 * - Navegación limpia y clara
 * - Glassmorphism y sticky con backdrop blur
 * - Responsive con menú hamburguesa en mobile
 * - Toggle de modo oscuro con animaciones
 */
export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Acerca de', href: '/about' },
    { label: 'Gobierno', href: '/#government' },
    { label: 'Noticias', href: '/#news' },
    { label: 'Servicios', href: '/#services' },
    { label: 'Donaciones', href: '/#donate' },
  ];

  return (
    <header className="bg-background/80 backdrop-blur-md border-b border-border/80 sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="container flex items-center justify-between h-20">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center"
        >
          <Link href="/">
            <a className="flex items-center gap-3">
              <div className="logo-glow">
                <img src={logo} alt="Artis Panis Logo" className="w-12 h-12 object-contain" />
              </div>
              <span className="display-font text-xl text-foreground font-bold tracking-tight hover:text-accent transition-colors">
                Reino del Pan
              </span>
            </a>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item, index) => (
            <motion.a
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              key={item.label}
              href={item.href}
              className="group relative text-foreground/80 hover:text-foreground text-sm font-medium py-1.5 transition-colors duration-300"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
            </motion.a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full hover:bg-secondary transition-all duration-200 text-foreground/80 hover:text-foreground"
            aria-label="Cambiar tema"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* CTA Button - Desktop */}
          <Link href="/dpi">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-minimal text-xs py-2 px-5 tracking-wider uppercase font-semibold"
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
