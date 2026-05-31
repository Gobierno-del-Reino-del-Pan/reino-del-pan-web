/**
 * Hero Component - Elegancia Minimalista Moderna
 * 
 * Diseño:
 * - Fondo blanco puro
 * - Tipografía GaleySemiBold para máximo impacto
 * - Espaciado generoso (80px arriba y abajo)
 * - Botones con borde oro
 */
import { motion } from 'framer-motion';
import { Link } from 'wouter';

export default function Hero() {
  return (
    <section className="bg-background section-spacious overflow-hidden">
      <div className="container max-w-4xl">
        {/* Subtítulo */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xs font-semibold text-accent mb-8 tracking-widest uppercase letter-spacing"
        >
          Bienvenido al Reino del Pan
        </motion.p>

        {/* Título Principal */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="display-font text-6xl sm:text-7xl lg:text-8xl text-foreground mb-10 leading-tight font-bold"
        >
          Gobierno Oficial del<br />
          <span className="text-accent">Reino del Pan</span>
        </motion.h1>

        {/* Descripción */}
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl text-foreground/75 mb-14 leading-relaxed max-w-2xl font-light"
        >
          Un reino dedicado a los valores democráticos, la modernización, el ambiente y la excelencia en la gobernanza. Descubre cómo puedes ser parte de nuestra misión.
        </motion.p>

        {/* Botones CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6"
        >
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-minimal"
          >
            Conocer más
          </motion.button>
          <Link href="/dpi">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-minimal-dark"
            >
              Obtener DPI
            </motion.button>
          </Link>
        </motion.div>

        {/* Línea divisora */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1, delay: 1 }}
          className="divider-gold mt-16" 
        />
      </div>
    </section>
  );
}
