/**
 * Newsletter Component - Elegancia Minimalista Moderna
 * 
 * Diseño:
 * - Fondo blanco puro
 * - Formulario minimalista
 * - Enlaces a redes sociales
 */
import { motion } from 'framer-motion';

export default function Newsletter() {
  return (
    <section className="bg-background section-spacious">
      <div className="container max-w-2xl">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="display-font text-5xl sm:text-6xl text-foreground mb-8 font-bold"
        >
          Únete a nuestro boletín
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-foreground/70 text-lg mb-8"
        >
          Suscríbete a nuestro boletín y únete a nuestro Telegram para recibir las últimas actualizaciones del Gobierno del Reino del Pan.
        </motion.p>

        {/* Formulario */}
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <input
            type="email"
            placeholder="Tu correo electrónico"
            className="flex-1 px-6 py-3 border-2 border-foreground bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:border-accent transition-colors duration-200"
          />
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-minimal whitespace-nowrap"
          >
            Suscribirse
          </motion.button>
        </motion.form>

        {/* Enlaces sociales */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.6 }}
          className="flex flex-wrap gap-6"
        >
          {[
            { id: 'telegram', icon: '✈️', label: 'Telegram' },
            { id: 'facebook', icon: 'f', label: 'Facebook' },
            { id: 'youtube', icon: '▶️', label: 'YouTube' },
            { id: 'instagram', icon: '📷', label: 'Instagram' },
            { id: 'linkedin', icon: 'in', label: 'LinkedIn' },
          ].map((social) => (
            <a
              key={social.id}
              href={`#${social.id}`}
              className="text-accent font-medium hover:text-accent/80 transition-colors duration-200 inline-flex items-center gap-2"
            >
              <span>{social.icon}</span> {social.label}
            </a>
          ))}
        </motion.div>

        {/* Línea divisora */}
        <motion.div 
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.8 }}
          className="divider-gold mt-16 origin-left" 
        />
      </div>
    </section>
  );
}
