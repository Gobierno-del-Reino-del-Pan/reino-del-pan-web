import { motion } from 'framer-motion';
import { Calendar, Users, Leaf, Globe2 } from 'lucide-react';

/**
 * Stats Component - Elegancia Minimalista Premium
 * 
 * Grid de estadísticas gubernamentales oficiales.
 * Utiliza números dorados de gran tamaño, iconos limpios y descripciones detalladas.
 */
export default function Stats() {
  const statsItems = [
    {
      icon: <Calendar className="w-6 h-6 text-accent" />,
      number: 'Casi 1 Año',
      label: 'Desde su fundación',
      desc: 'Iniciado como una visión en 2025, ahora es un estado consolidado.',
    },
    {
      icon: <Users className="w-6 h-6 text-accent" />,
      number: '5400+',
      label: 'Solicitudes de DPI',
      desc: 'Ciudadanos digitales registrados y activos en nuestra plataforma global.',
    },
    {
      icon: <Leaf className="w-6 h-6 text-accent" />,
      number: '100%',
      label: 'Comprometidos por la Libertad',
      desc: 'Compromiso total con la libertad y la resiliencia de nuestro pueblo.',
    },
    {
      icon: <Globe2 className="w-6 h-6 text-accent" />,
      number: '50+',
      label: 'Países conectados',
      desc: 'Una comunidad diplomática que cruza fronteras internacionales.',
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
  } as const;

  return (
    <section className="bg-background py-16 lg:py-24 border-b border-border/50">
      <div className="container">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {statsItems.map((stat, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              className="group relative bg-secondary border border-border/40 p-8 hover:border-accent/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              {/* Corner accent details */}
              <div className="absolute top-0 left-0 w-1.5 h-1.5 bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div>
                <div className="mb-6 p-3 bg-background border border-border/40 w-fit rounded-lg shadow-sm">
                  {stat.icon}
                </div>
                <h3 className="display-font text-4xl sm:text-5xl font-extrabold text-foreground mb-2 tracking-tight">
                  {stat.number}
                </h3>
                <p className="text-sm font-semibold text-accent tracking-wide uppercase mb-3">
                  {stat.label}
                </p>
              </div>

              <p className="text-sm text-foreground/60 leading-relaxed font-light mt-2 border-t border-border/40 pt-4">
                {stat.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
