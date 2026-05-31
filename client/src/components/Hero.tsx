import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import emblem from '/hero_emblem.png';

/**
 * Hero Component - Elegancia Minimalista Premium
 * 
 * Diseño:
 * - Asimétrico (2 columnas en desktop)
 * - Ilustración heráldica flotante con iluminación dorada
 * - Tipografía GaleySemiBold de gran escala
 * - Efectos de micro-animación en cascada
 */
export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  } as const;

  return (
    <section className="relative bg-background overflow-hidden py-16 lg:py-28 flex items-center border-b border-border/50">
      {/* Decorative background grid/elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.05),transparent_50%)] pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-accent/2 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Text Content */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 flex flex-col items-start text-left"
          >
            {/* Subheading / Flag */}
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3 py-1 bg-secondary text-accent border border-accent/20 rounded-full mb-6"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold tracking-widest uppercase">
                Gobierno Oficial Soberano
              </span>
            </motion.div>

            {/* Display Title */}
            <motion.h1 
              variants={itemVariants}
              className="display-font text-5xl sm:text-6xl xl:text-7.5xl text-foreground mb-6 leading-[1.08] tracking-tight font-extrabold"
            >
              Nuestra tierra.<br />
              Nuestra gente.<br />
              <span className="text-accent relative inline-block">
                Reino del Pan
                <span className="absolute bottom-1 left-0 w-full h-1 bg-accent/20 -z-10" />
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p 
              variants={itemVariants}
              className="text-lg xl:text-xl text-foreground/75 mb-10 leading-relaxed max-w-2xl font-light"
            >
              Un estado digital y territorial dedicado a la paz, la reconciliación social, la ecología activa y la gobernanza del siglo XXI. Sé parte de la construcción de una nueva nación soberana.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-wrap gap-4 w-full sm:w-auto"
            >
              <Link href="/about">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-minimal flex items-center justify-center gap-2 group min-w-[170px]"
                >
                  Conocer más
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </motion.button>
              </Link>
              <Link href="/dpi">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-minimal-dark min-w-[170px]"
                >
                  Obtener DPI
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Column: Premium Heraldic Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="relative group w-full max-w-[420px]">
              {/* Decorative backglow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-accent to-amber-500 rounded-2xl blur-lg opacity-25 group-hover:opacity-35 transition duration-1000 group-hover:duration-200" />
              
              {/* Emblem Container with Floating animation */}
              <motion.div 
                animate={{ y: [0, -12, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 6,
                  ease: "easeInOut",
                }}
                className="relative bg-black border border-accent/30 rounded-2xl overflow-hidden shadow-2xl p-6 flex items-center justify-center aspect-square"
              >
                <img 
                  src={emblem} 
                  alt="Escudo Oficial del Reino del Pan" 
                  className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(212,175,55,0.3)] select-none pointer-events-none"
                />
                
                {/* Overlay border details */}
                <div className="absolute inset-4 border border-accent/10 rounded-lg pointer-events-none" />
                <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-accent/40" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-accent/40" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-accent/40" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-accent/40" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
