import { motion } from 'framer-motion';
import { Calendar, ArrowUpRight } from 'lucide-react';

/**
 * News Component - Elegancia Minimalista Premium
 * 
 * Grid de noticias/comunicados de prensa oficiales del Gobierno.
 * Cada noticia cuenta con detalles refinados, fechas, resúmenes y hovers interactivos.
 */
export default function News() {
  const newsItems = [
    {
      title: 'Declaración del Presidente en el 7º Aniversario de Fundación',
      date: '30 de mayo, 2026',
      category: 'Declaración Oficial',
      excerpt: 'El Presidente del Reino del Pan celebra 7 años desde el inicio como idea, hasta convertirse en una nación soberana en expansión.',
    },
    {
      title: '¡Competencia Build Verdis anunciada!',
      date: '22 de mayo, 2026',
      category: 'Eventos',
      excerpt: 'El Reino del Pan busca determinar la forma visual y urbanística del país, incluyendo amenidades, vías fluviales, puntos de control y ecotareas.',
    },
    {
      title: 'Reuniones de Aniversario de Fundación anunciadas',
      date: '16 de mayo, 2026',
      category: 'Agenda',
      excerpt: 'El Presidente y otros oficiales organizarán dos reuniones diplomáticas bilaterales en Londres y Belgrado para celebrar con la comunidad internacional.',
    },
    {
      title: 'Presidente visita Sede de la ONU y Consulado de Haití',
      date: '9 de mayo, 2026',
      category: 'Diplomacia',
      excerpt: 'El Presidente del Reino del Pan, acompañado por el Ministro de Asuntos Internos, visitó delegaciones de las Naciones Unidas y entes diplomáticos.',
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  } as const;

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  } as const;

  return (
    <section className="bg-background py-16 lg:py-28 border-b border-border/50" id="news">
      <div className="container">
        {/* Title / Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
          <div className="text-left">
            <p className="text-xs font-semibold text-accent tracking-widest uppercase mb-3">
              Actualidad Nacional
            </p>
            <h2 className="display-font text-4xl sm:text-5xl text-foreground font-extrabold tracking-tight">
              Últimas Noticias
            </h2>
          </div>
          <a
            href="#more-news"
            className="text-accent font-semibold hover:text-accent/80 transition-colors duration-200 inline-flex items-center gap-1 text-sm self-start sm:self-auto group"
          >
            Ver todas las noticias
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        {/* Grid de noticias */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {newsItems.map((item, index) => (
            <motion.article
              variants={cardVariants}
              key={item.title}
              className="bg-secondary/40 p-8 border-t border-accent/40 hover:border-accent hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold tracking-widest text-accent uppercase bg-background border border-accent/20 px-2.5 py-0.5 rounded-full">
                    {item.category}
                  </span>
                  <span className="text-xs text-foreground/50 flex items-center gap-1.5 font-light">
                    <Calendar className="w-3.5 h-3.5" />
                    {item.date}
                  </span>
                </div>
                <h3 className="display-font text-xl xl:text-2xl font-bold text-foreground mb-4 group-hover:text-accent transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-foreground/70 text-sm leading-relaxed mb-6 font-light">
                  {item.excerpt}
                </p>
              </div>

              <a
                href="#read-more"
                className="text-accent font-semibold hover:text-accent/80 transition-colors duration-200 inline-flex items-center gap-1.5 text-xs tracking-wider uppercase group/read mt-auto"
              >
                Leer artículo completo
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/read:translate-x-0.5 group-hover/read:-translate-y-0.5" />
              </a>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
