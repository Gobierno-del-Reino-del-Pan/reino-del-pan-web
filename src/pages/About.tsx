import { useState } from "react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Solución al error de Framer Motion usando "as const" para congelar el tipo del string
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: "easeOut" as const, delay },
});

const PILLARS = [
  {
    icon: "⚖️",
    title: "Gobernanza democrática",
    body: "Cada ciudadano tiene voz. Las decisiones se toman en asambleas abiertas con total transparencia.",
  },
  {
    icon: "🌿",
    title: "Sostenibilidad",
    body: "El territorio y sus recursos se gestionan con visión a largo plazo, sin sacrificar el presente.",
  },
  {
    icon: "🤝",
    title: "Diversidad",
    body: "Personas de todo origen comparten los mismos derechos y responsabilidades sin excepción.",
  },
  {
    icon: "🏺",
    title: "Artesanía e identidad",
    body: "El trabajo manual y el saber tradicional son parte del patrimonio vivo del Reino.",
  },
];

const MISSION_VISION = [
  {
    id: "mision",
    title: "Nuestra Misión",
    label: "MISIÓN",
    body: "Promover un modelo de gobernanza transparente y democrático que priorice el bienestar de sus ciudadanos y la preservación del medio ambiente.",
  },
  {
    id: "vision",
    title: "Nuestra Visión",
    label: "VISIÓN",
    body: "Convertirnos en un referente global de innovación social y sostenibilidad, demostrando que un país pequeño puede tener un gran impacto.",
  },
];

export default function About() {
  // Nota: Dejo el estado por si otras partes de la página lo requieren a futuro,
  // pero ya no controla los paneles de misión/visión al ser estáticos.
  const [, setActivePanel] = useState<string | null>(null);

  // Solución al error: Parameter 'id' implicitly has an 'any' type.
  const handleToggle = (id: string) => {
    setActivePanel((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1">
        <section className="section-spacious">
          <div className="container mx-auto max-w-4xl">

            {/* Hero */}
            <motion.div {...fadeUp(0)}>
              <span className="text-xs font-mono tracking-[0.3em] uppercase text-accent/70 mb-4 block">
                Reino del Pan · Fundación
              </span>
              <h1 className="display-font text-5xl sm:text-6xl font-semibold leading-tight">
                Acerca del<br />Reino del Pan
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-foreground/75">
                Una nación soberana e independiente nacida con la visión de crear una sociedad
                basada en la paz, la sostenibilidad y la excelencia. Nuestra identidad está
                profundamente ligada a la tierra, el trabajo artesanal y la búsqueda constante
                de la armonía.
              </p>
            </motion.div>

            {/* Divisor */}
            <motion.div
              {...fadeUp(0.15)}
              className="mt-12 flex items-center gap-4"
            >
              <div className="h-px flex-1 bg-border/50" />
              <span className="text-accent/40 text-xs font-mono tracking-widest uppercase">
                valores fundacionales
              </span>
              <div className="h-px flex-1 bg-border/50" />
            </motion.div>

            {/* Misión & Visión — Cards Transparentes con Logo de fondo */}
            <motion.div {...fadeUp(0.2)} className="mt-10">
              <div className="grid gap-6 sm:grid-cols-2">
                {MISSION_VISION.map(({ id, title, label, body }) => (
                  <div
                    key={id}
                    className="relative overflow-hidden rounded-xl border border-border/40 bg-transparent px-6 py-8 flex flex-col justify-between min-h-[220px]"
                  >
                    {/* Contenedor del Logo en marca de agua de fondo */}
                    <div
                      className="absolute inset-0 pointer-events-none bg-center bg-no-repeat bg-contain opacity-[0.06] mix-blend-luminosity scale-75"
                      style={{ backgroundImage: "url('/logo.png')" }}
                    />

                    {/* Contenido de la Card */}
                    <div className="relative z-10">
                      <span className="text-xs font-mono tracking-[0.25em] uppercase text-accent/60 block mb-2">
                        {label}
                      </span>
                      <h2 className="display-font text-2xl font-semibold text-foreground mb-3">
                        {title}
                      </h2>
                      <p className="text-foreground/80 leading-relaxed text-sm">
                        {body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Pilares */}
            <motion.div {...fadeUp(0.35)} className="mt-16">
              <h2 className="display-font text-3xl font-semibold mb-8">
                Los cuatro pilares
              </h2>
              <div className="grid gap-5 sm:grid-cols-2">
                {PILLARS.map(({ icon, title, body }, idx) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.4 + idx * 0.08 }}
                    className="flex gap-4 p-4 rounded-xl border border-border/50 bg-background/40 hover:border-accent/30 hover:bg-accent/5 transition-all duration-200"
                  >
                    <span className="text-2xl mt-0.5 flex-shrink-0" aria-hidden="true">
                      {icon}
                    </span>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                      <p className="text-sm text-foreground/60 leading-6">{body}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Cita de cierre */}
            <motion.blockquote
              {...fadeUp(0.6)}
              className="mt-16 border-l-2 border-accent/50 pl-6 py-2"
            >
              <p className="text-xl leading-8 text-foreground/80 italic display-font">
                "Ubicado en el corazón de Europa, el Reino del Pan no es solo un territorio físico,
                sino una comunidad global de individuos que comparten los mismos valores de respeto,
                diversidad y progreso."
              </p>
            </motion.blockquote>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}