import { motion } from "framer-motion";

const stats = [
  { value: "Casi 1 Año", label: "Desde su fundación" },
  { value: "5400+", label: "Solicitudes de DPI" },
  { value: "100%", label: "Comprometidos por la libertad" },
  { value: "50+", label: "Países conectados" },
];

export default function Stats() {
  return (
    <section className="section-spacious bg-secondary">
      <div className="container mx-auto">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.45 }}
              className="card-surface text-center"
            >
              <p className="text-4xl font-semibold text-foreground">{item.value}</p>
              <p className="mt-3 text-base text-foreground/70">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
