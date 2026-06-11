import { motion } from "framer-motion";

const reasons = [
  {
    label: "Valores Democráticos",
    description: "Gobernanza transparente del siglo XXI construida sobre participación real.",
  },
  {
    label: "Reconciliación y Diversidad",
    description: "Un espacio neutral y acogedor para personas de todos los orígenes.",
  },
  {
    label: "Modernización Digital",
    description: "Burocracia cero, servicios en la nube y votación electrónica segura.",
  },
  {
    label: "Protección Ambiental",
    description: "Conservación activa de la flora, fauna y ecosistema del Danubio.",
  },
];

export default function WhyGetInvolved() {
  return (
    <section className="section-spacious bg-secondary">
      <div className="container mx-auto">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55 }}>
            <p className="text-sm uppercase tracking-[0.35em] text-accent">¿Por qué involucrarse?</p>
            <h2 className="display-font mt-4 text-4xl font-semibold">El Reino del Pan crece gracias a su comunidad global.</h2>
            <p className="mt-6 max-w-xl text-foreground/70 leading-8">
              Explora los diferentes canales a través de los cuales puedes dejar tu huella y apoyar nuestra soberanía.
            </p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2">
            {reasons.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.45 }}
                className="card-surface"
              >
                <h3 className="display-font text-2xl mb-3">{item.label}</h3>
                <p className="text-foreground/75 leading-7">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
