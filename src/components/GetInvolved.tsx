import { motion } from "framer-motion";

const items = [
  {
    title: "Ciudadanía y DPI",
    description:
      "Obtén tu Documento Personal de Identidad (DPI) del Reino del Pan. Únete como ciudadano digital y participa en las decisiones democráticas.",
  },
  {
    title: "Donaciones Oficiales",
    description:
      "Como estado en desarrollo, dependemos de donaciones voluntarias para financiar servicios, infraestructura digital y proyectos ecológicos.",
  },
  {
    title: "Eventos y Apoyo",
    description:
      "Asiste a las reuniones diplomáticas y apoya las iniciativas globales. Conéctate con otros partidarios del Reino del Pan en tu región.",
  },
];

export default function GetInvolved() {
  return (
    <section className="section-spacious">
      <div className="container mx-auto">
        <div className="mb-12 max-w-3xl">
          <p className="text-sm uppercase tracking-[0.35em] text-accent">¿Cómo puedes involucrarte?</p>
          <h2 className="display-font mt-4 text-4xl font-semibold">El Reino del Pan crece gracias a su comunidad global.</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12, duration: 0.45 }}
              className="card-surface"
            >
              <h3 className="display-font text-2xl mb-4">{item.title}</h3>
              <p className="text-foreground/75 leading-7">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
