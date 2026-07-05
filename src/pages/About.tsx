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
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-accent/20">
      <Header />

      <main className="flex-1 py-16 md:py-24 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Hero */}
          <motion.div {...fadeUp(0)} className="text-center md:text-left">
            <span className="text-xs font-mono tracking-[0.4em] uppercase text-accent font-semibold mb-5 block">
              Reino del Pan · Fundación
            </span>
            <h1 className="display-font text-5xl sm:text-6xl md:text-7xl font-semibold leading-tight tracking-tight text-foreground">
              Acerca del<br />Reino del Pan
            </h1>
            <p className="mt-8 max-w-3xl text-lg md:text-xl leading-relaxed text-foreground/80 font-medium mx-auto md:mx-0">
              Una nación soberana e independiente nacida con la visión de crear una sociedad
              basada en la paz, la sostenibilidad y la excelencia. Nuestra identidad está
              profundamente ligada a la tierra, el trabajo artesanal y la búsqueda constante
              de la armonía.
            </p>
          </motion.div>

          {/* Divisor */}
          <motion.div
            {...fadeUp(0.15)}
            className="mt-16 mb-20 flex items-center gap-4"
          >
            <div className="h-px flex-1 bg-border/40" />
            <span className="text-accent/50 text-xs font-mono tracking-widest uppercase font-semibold">
              valores fundacionales
            </span>
            <div className="h-px flex-1 bg-border/40" />
          </motion.div>

          {/* Misión & Visión — Cards con Efecto Iluminado Suave */}
          <motion.div {...fadeUp(0.2)}>
            <div className="grid gap-6 md:gap-8 sm:grid-cols-2">
              {MISSION_VISION.map(({ id, title, label, body }) => (
                <div
                  key={id}
                  className="relative group overflow-hidden rounded-3xl border border-border/40 bg-card/10 backdrop-blur-sm p-8 flex flex-col justify-between min-h-[260px] shadow-sm hover:shadow-lg hover:shadow-accent/5 hover:border-accent/30 transition-all duration-300"
                >
                  {/* Marca de agua de fondo mejorada */}
                  <div
                    className="absolute inset-0 pointer-events-none bg-center bg-no-repeat bg-contain opacity-[0.05] group-hover:opacity-[0.08] mix-blend-luminosity scale-90 group-hover:scale-100 transition-all duration-500"
                    style={{ backgroundImage: "url('/logo.png')" }}
                  />

                  {/* Efecto de 'Glow' suave en el borde inferior */}
                  <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Contenido de la Card */}
                  <div className="relative z-10 flex flex-col h-full">
                    <span className="text-xs font-mono tracking-[0.3em] uppercase text-accent font-semibold block mb-3">
                      {label}
                    </span>
                    <h2 className="display-font text-3xl md:text-4xl font-semibold text-foreground mb-4 leading-snug">
                      {title}
                    </h2>
                    <p className="text-foreground/80 leading-relaxed text-base mt-auto">
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Pilares — Modernizados con Efecto de Resplandor al Hover */}
          <motion.div {...fadeUp(0.35)} className="mt-20 md:mt-24">
            <h2 className="display-font text-4xl font-semibold mb-12 tracking-tight text-foreground text-center">
              Los cuatro pilares
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {PILLARS.map(({ icon, title, body }, idx) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.4 + idx * 0.08 }}
                  className="relative flex group gap-5 p-6 md:p-7 rounded-2xl border border-border/50 bg-background/40 hover:border-accent/40 hover:bg-accent/[0.03] transition-all duration-300 backdrop-blur-sm"
                >
                  {/* Efecto Glow Difuminado de fondo en Hover */}
                  <div className="absolute inset-0 rounded-2xl bg-accent/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 pointer-events-none" aria-hidden="true" />

                  <span className="text-3xl mt-1 flex-shrink-0 relative z-10" aria-hidden="true">
                    {icon}
                  </span>
                  <div className="relative z-10">
                    <h3 className="font-semibold text-lg text-foreground mb-1.5 group-hover:text-accent transition-colors duration-200">{title}</h3>
                    <p className="text-sm md:text-base text-foreground/70 leading-relaxed">{body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Cita de cierre */}
          <motion.blockquote
            {...fadeUp(0.6)}
            className="mt-20 md:mt-24 border-l-2 md:border-l-4 border-accent/50 pl-8 py-3 max-w-4xl mx-auto"
          >
            <p className="text-2xl md:text-3xl leading-relaxed text-foreground/80 italic display-font font-medium tracking-wide">
              "Ubicado en el corazón de Europa, el Reino del Pan no es solo un territorio físico,
              sino una comunidad global de individuos que comparten los mismos valores de respeto,
              diversidad y progreso."
            </p>
          </motion.blockquote>

        </div>
      </main>

      <Footer />
    </div>
  );
}