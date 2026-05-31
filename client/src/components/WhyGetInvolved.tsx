import { motion } from 'framer-motion';
import { Scale, Users, Cpu, Trees, ShieldAlert } from 'lucide-react';

/**
 * WhyGetInvolved Component - Elegancia Minimalista Premium
 * 
 * Estructura asimétrica de dos columnas:
 * - Izquierda: Explicación de la importancia y visión del Reino.
 * - Derecha: Grid de valores fundacionales con iconos dorados y bordes mínimos.
 */
export default function WhyGetInvolved() {
  const values = [
    {
      icon: <Scale className="w-5 h-5 text-accent" />,
      title: 'Valores Democráticos',
      desc: 'Gobernanza transparente del siglo XXI construida sobre participación real.',
    },
    {
      icon: <Users className="w-5 h-5 text-accent" />,
      title: 'Reconciliación y Diversidad',
      desc: 'Un espacio neutral y acogedor para personas de todos los orígenes.',
    },
    {
      icon: <Cpu className="w-5 h-5 text-accent" />,
      title: 'Modernización Digital',
      desc: 'Burocracia cero, servicios en la nube y votación electrónica segura.',
    },
    {
      icon: <Trees className="w-5 h-5 text-accent" />,
      title: 'Protección Ambiental',
      desc: 'Conservación activa de la flora, fauna y ecosistema del Danubio.',
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

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  } as const;

  return (
    <section className="bg-background py-16 lg:py-28 border-b border-border/50">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Text narrative */}
          <div className="lg:col-span-5 text-left">
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs font-semibold text-accent tracking-widest uppercase mb-3"
            >
              Nuestra Misión
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="display-font text-4xl sm:text-5xl text-foreground font-extrabold tracking-tight mb-8"
            >
              ¿Por qué involucrarse?
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-6 text-foreground/80 leading-relaxed font-light text-base sm:text-lg"
            >
              <p>
                Desarrollar una nueva nación no es una tarea fácil. El Reino del Pan necesita el intelecto, los recursos y el apoyo de su comunidad para construir un futuro modelo.
              </p>
              <p>
                Nuestras iniciativas de e-gobernanza, ecología activa y cohesión social han sido destacadas positivamente en medios globales. Al unirte a nosotros, no solo apoyas a un país, sino a una idea de progreso y concordia en Europa.
              </p>
            </motion.div>
          </div>

          {/* Right Column: Values grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {values.map((val, idx) => (
              <motion.div
                variants={itemVariants}
                key={idx}
                className="p-6 bg-secondary/50 border border-border/20 rounded-xl hover:border-accent/30 hover:bg-secondary transition-all duration-300 flex gap-4"
              >
                <div className="p-2.5 bg-background border border-border/30 rounded-lg shadow-sm h-fit">
                  {val.icon}
                </div>
                <div>
                  <h3 className="display-font text-lg font-bold text-foreground mb-2">
                    {val.title}
                  </h3>
                  <p className="text-sm text-foreground/75 leading-relaxed font-light">
                    {val.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
