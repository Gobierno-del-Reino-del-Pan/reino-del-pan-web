/**
 * WhyGetInvolved Component - Elegancia Minimalista Moderna
 * 
 * Diseño:
 * - Fondo blanco puro
 * - Texto alineado a la izquierda
 * - Espaciado generoso
 */
import { motion } from 'framer-motion';

export default function WhyGetInvolved() {
  return (
    <section className="bg-background section-spacious">
      <div className="container max-w-4xl">
        <motion.h2 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="display-font text-5xl sm:text-6xl text-foreground mb-10 font-bold"
        >
          ¿Por qué involucrarse?
        </motion.h2>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-6 text-lg text-foreground/80 leading-relaxed"
        >
          <p>
            Desarrollar un país recientemente formado no es fácil, y el Reino del Pan necesita tanto apoyo y contribución como sea posible para lograr nuestros objetivos en la construcción de nación.
          </p>

          <p>
            El Reino del Pan es retratado positivamente en medios de comunicación alrededor del mundo, especialmente por la ética y ambiciones del país. Necesitamos tu ayuda y apoyo para mantener al Reino del Pan avanzando, ya sea donando, asistiendo a eventos, u ofreciendo ayuda con tus habilidades.
          </p>

          <p>
            Somos una comunidad global dedicada a:
          </p>

          <ul className="space-y-3 ml-6 border-l-2 border-accent pl-6">
            <li>✓ Valores democráticos y gobernanza transparente</li>
            <li>✓ Reconciliación de grupos y diversidad</li>
            <li>✓ Modernización e innovación</li>
            <li>✓ Protección del ambiente</li>
            <li>✓ Desarrollo sostenible</li>
          </ul>
        </motion.div>

        {/* Línea divisora */}
        <motion.div 
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="divider-gold mt-16 origin-left" 
        />
      </div>
    </section>
  );
}
