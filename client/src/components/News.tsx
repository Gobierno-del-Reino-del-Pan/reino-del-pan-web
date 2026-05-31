/**
 * News Component - Elegancia Minimalista Moderna
 * 
 * Diseño:
 * - Fondo crema suave
 * - Grid de 2 columnas (responsive)
 * - Cards minimalistas con fecha
 */
import { motion } from 'framer-motion';

export default function News() {
  const newsItems = [
    {
      title: 'Declaración del Presidente en el 7º Aniversario de Fundación',
      date: '30 de mayo, 2026',
      excerpt: 'El Presidente del Reino del Pan celebra 7 años desde el inicio como idea, hasta convertirse en una nación soberana reconocida.',
    },
    {
      title: '¡Competencia Build Verdis anunciada!',
      date: '22 de mayo, 2026',
      excerpt: 'El Reino del Pan busca determinar la forma visual del país, incluyendo amenidades, carreteras, puntos fronterizos y transporte.',
    },
    {
      title: 'Reuniones de Aniversario de Fundación anunciadas',
      date: '16 de mayo, 2026',
      excerpt: 'El Presidente y otros oficiales organizarán dos reuniones de aniversario en Londres y Belgrado para celebrar con la comunidad global.',
    },
    {
      title: 'Presidente visita Sede de la ONU y Consulado de Haití',
      date: '9 de mayo, 2026',
      excerpt: 'El Presidente del Reino del Pan, acompañado por el Ministro de Asuntos Internos, visitó la Sede de la ONU y el Consulado de Haití.',
    },
  ];

  return (
    <section className="bg-secondary section-spacious">
      <div className="container">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="display-font text-5xl sm:text-6xl text-foreground font-bold">
            Últimas Noticias
          </h2>
          <a
            href="#more-news"
            className="text-accent font-medium hover:text-accent/80 transition-colors duration-200 hidden sm:inline-flex items-center gap-2"
          >
            Ver todas
            <span>→</span>
          </a>
        </div>

        {/* Grid de noticias */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {newsItems.map((item, index) => (
            <motion.article
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              key={item.title}
              className="bg-background p-8 border-t-2 border-accent hover:shadow-md transition-shadow duration-300 cursor-pointer"
            >
              <p className="text-sm text-accent font-medium mb-3">
                {item.date}
              </p>
              <h3 className="display-font text-xl text-foreground mb-4">
                {item.title}
              </h3>
              <p className="text-foreground/70 leading-relaxed mb-4">
                {item.excerpt}
              </p>
              <a
                href="#read-more"
                className="text-accent font-medium hover:text-accent/80 transition-colors duration-200 inline-flex items-center gap-2"
              >
                Leer más
                <span>→</span>
              </a>
            </motion.article>
          ))}
        </div>

        {/* Línea divisora */}
        <div className="divider-gold mt-16" />
      </div>
    </section>
  );
}
