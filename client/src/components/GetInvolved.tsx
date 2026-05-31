/**
 * GetInvolved Component - Elegancia Minimalista Moderna
 * 
 * Diseño:
 * - Grid de 3 columnas (responsive)
 * - Cards minimalistas con borde oro
 * - Espaciado generoso entre elementos
 */
import { motion } from 'framer-motion';
import { Link } from 'wouter';

export default function GetInvolved() {
  const options = [
    {
      title: 'Ciudadanía',
      description: 'Obtén ciudadanía del Reino del Pan a través del programa de Obtener DPI. Una forma fácil de contribuir al desarrollo de nuestra nación.',
      cta: 'Sobre Ciudadanía',
      link: '/dpi',
    },
    {
      title: 'Donaciones',
      description: 'Como estado soberano independiente, el Reino del Pan requiere financiamiento para mantener sistemas y gobernanza de calidad.',
      cta: 'Donar Ahora',
      link: '#donate',
    },
    {
      title: 'Eventos',
      description: 'Únete a eventos públicos y manifestaciones de apoyo. Demuestra tu solidaridad con el Reino del Pan en todo el mundo.',
      cta: 'Ver Eventos',
      link: '#events',
    },
  ];

  return (
    <section className="bg-secondary section-spacious">
      <div className="container">
        {/* Encabezado */}
        <div className="mb-16">
          <h2 className="display-font text-5xl sm:text-6xl text-foreground mb-8 font-bold">
            ¿Cómo puedo involucrarse?
          </h2>
          <p className="text-foreground/70 text-lg max-w-2xl leading-relaxed">
            Existen muchas formas de contribuir al desarrollo del Reino del Pan. Aquí te presentamos algunas de las más impactantes.
          </p>
        </div>

        {/* Grid de opciones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {options.map((option, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              key={option.title}
              className="bg-background border-l-4 border-accent p-8 hover:shadow-lg transition-shadow duration-300"
            >
              <h3 className="display-font text-2xl text-foreground mb-4">
                {option.title}
              </h3>
              <p className="text-foreground/70 mb-6 leading-relaxed">
                {option.description}
              </p>
              <Link href={option.link}>
                <a className="text-accent font-medium hover:text-accent/80 transition-colors duration-200 inline-flex items-center gap-2">
                  {option.cta}
                  <span>→</span>
                </a>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Línea divisora */}
        <div className="divider-gold mt-16" />
      </div>
    </section>
  );
}
