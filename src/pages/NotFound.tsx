import { Link } from "wouter";
import { AlertCircle, ArrowLeft, Terminal } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-background px-6 overflow-hidden antialiased">

      {/* MALLA DE PÍXELES TECNOLÓGICA (Grid Overlay de fondo) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(var(--foreground-rgb),0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(var(--foreground-rgb),0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* AURAS DINÁMICAS (Glow cuántico flotante animado con Framer Motion) */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          x: [0, 15, 0],
          y: [0, -20, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[500px] h-[400px] bg-accent/10 rounded-full blur-[130px] top-1/4 left-1/4 pointer-events-none select-none z-0"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -20, 0],
          y: [0, 15, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute w-[450px] h-[450px] bg-foreground/[0.03] rounded-full blur-[100px] bottom-10 right-10 pointer-events-none select-none z-0"
      />

      {/* 404 CINÉTICO DE ALTO IMPACTO (Separado en capas de gradiente profundo) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <motion.h1
          initial={{ letterSpacing: "-0.05em", opacity: 0, scale: 0.9 }}
          animate={{ letterSpacing: "-0.02em", opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-[36vw] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground/[0.12] via-foreground/[0.04] to-transparent font-sans leading-none mix-blend-plus-lighter"
        >
          404
        </motion.h1>
      </div>

      {/* CONTENEDOR CENTRAL: ARQUITECTURA DE CRISTAL AVANZADA */}
      <div className="container mx-auto max-w-xl text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex flex-col items-center backdrop-blur-md py-12 px-6 sm:px-14 rounded-[32px] border border-foreground/[0.05] bg-gradient-to-b from-background/40 to-background/10 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden"
        >
          {/* Línea decorativa superior tipo "Cápsula de Servidor" */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[2px] bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

          {/* BADGE INSTITUCIONAL CON PULSO DE RADAR */}
          <div className="mb-8 relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/[0.08] border border-accent/20 text-accent overflow-hidden">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <Terminal className="h-3.5 w-3.5 shrink-0 text-accent/80" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent/90">
              System Error // Root_Null
            </span>
          </div>

          <h2 className="display-font text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Enlace Interrumpido
          </h2>

          <p className="mt-4 text-[14px] leading-relaxed text-foreground/50 max-w-sm font-medium">
            El módulo de red no ha podido indexar la ruta solicitada. La dirección no figura en los registros centrales del <span className="text-foreground font-semibold">Reino del Pan</span>.
          </p>

          {/* BOTÓN DEFINITIVO: DESTELLO REFLECTANTE (SHIMMER EFFECT) */}
          <div className="mt-10 w-full sm:w-auto">
            <Link href="/">
              <motion.a
                whileHover={{
                  y: -3,
                  scale: 1.02,
                  boxShadow: "0 20px 35px -12px rgba(var(--accent-rgb, 245, 158, 11), 0.5)"
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-accent text-accent-foreground px-9 py-4.5 text-xs font-black uppercase tracking-[0.25em] shadow-xl shadow-accent/20 cursor-pointer border border-white/10 overflow-hidden"
              >
                {/* Capa de destello de luz que cruza el botón al hacer hover */}
                <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:animate-[shimmer_0.8s_ease-in-out]" />

                <ArrowLeft className="h-4 w-4 transition-transform duration-300 ease-out group-hover:-translate-x-2" />
                <span>Restaurar Conexión</span>
              </motion.a>
            </Link>
          </div>

        </motion.div>
      </div>

      {/* Animación CSS inyectada para el destello reflectante del botón */}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
}