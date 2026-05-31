import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { UserCheck, HeartHandshake, CalendarDays, ArrowRight } from 'lucide-react';

/**
 * GetInvolved Component - Elegancia Minimalista Premium
 * 
 * Grid de 3 columnas para invitar a la participación ciudadana.
 * Con tarjetas refinadas, bordes sutiles y micro-interacciones.
 */
export default function GetInvolved() {
  const options = [
    {
      icon: <UserCheck className="w-6 h-6 text-accent" />,
      title: 'Ciudadanía y DPI',
      description: 'Obtén tu Documento Personal de Identidad (DPI) del Reino del Pan. Únete como ciudadano digital y participa en las decisiones democráticas.',
      cta: 'Solicitar Ciudadanía',
      link: '/dpi',
    },
    {
      icon: <HeartHandshake className="w-6 h-6 text-accent" />,
      title: 'Donaciones Oficiales',
      description: 'Como estado en desarrollo, dependemos de donaciones voluntarias para financiar servicios, infraestructura digital y proyectos ecológicos.',
      cta: 'Donar al Reino',
      link: '#donate',
    },
    {
      icon: <CalendarDays className="w-6 h-6 text-accent" />,
      title: 'Eventos y Apoyo',
      description: 'Asiste a las reuniones diplomáticas y apoya las iniciativas globales. Conéctate con otros partidarios del Reino del Pan en tu región.',
      cta: 'Ver Calendario',
      link: '#events',
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  } as const;

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  } as const;

  return (
    <section className="bg-secondary/40 py-16 lg:py-28 border-b border-border/50">
      <div className="container">
        {/* Header */}
        <div className="max-w-3xl mb-16 md:mb-20">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-semibold text-accent tracking-widest uppercase mb-3"
          >
            Participación Activa
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="display-font text-4xl sm:text-5xl text-foreground font-extrabold tracking-tight mb-6"
          >
            ¿Cómo puedes involucrarte?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-foreground/70 leading-relaxed font-light"
          >
            El Reino del Pan crece gracias a su comunidad global. Explora los diferentes canales a través de los cuales puedes dejar tu huella y apoyar nuestra soberanía.
          </motion.p>
        </div>

        {/* Grid de opciones */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {options.map((option, index) => (
            <motion.div
              variants={cardVariants}
              key={option.title}
              className="bg-background border border-border/40 p-8 flex flex-col justify-between hover:shadow-xl hover:border-accent/30 transition-all duration-300 relative group"
            >
              {/* Golden line accent at the top */}
              <div className="absolute top-0 left-0 w-0 h-1 bg-accent group-hover:w-full transition-all duration-300" />
              
              <div>
                <div className="mb-6 p-3 bg-secondary/80 border border-border/20 w-fit rounded-lg">
                  {option.icon}
                </div>
                <h3 className="display-font text-2xl text-foreground font-bold tracking-tight mb-4">
                  {option.title}
                </h3>
                <p className="text-foreground/70 text-sm leading-relaxed mb-8 font-light">
                  {option.description}
                </p>
              </div>

              <Link href={option.link}>
                <a className="text-accent font-semibold hover:text-accent/80 transition-all duration-200 inline-flex items-center gap-2 text-sm group/btn mt-auto">
                  {option.cta}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </a>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
