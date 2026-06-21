import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion } from "framer-motion";

export default function Donations() {
  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" as const, delay },
  });

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1">
        <section className="section-spacious">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6">

            {/* Nueva Alerta Institucional: Laboral Panian Bank */}
            <motion.div
              {...fadeUp(0)}
              className="mb-10 relative overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-r from-accent/5 via-accent/[0.02] to-transparent p-5 flex flex-col sm:flex-row items-center gap-4 shadow-sm"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-background/80 border border-border/60 p-2.5 flex items-center justify-center shadow-inner">
                <img
                  src="/LK.png"
                  alt="Laboral Panian Bank"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center sm:text-left">
                <span className="inline-block text-[10px] font-mono tracking-[0.2em] text-accent uppercase font-semibold bg-accent/10 px-2 py-0.5 rounded mb-1">
                  Anuncio Oficial
                </span>
                <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                  El Estado Paniense utiliza <span className="text-accent font-semibold">Laboral Panian Bank</span> para la gestión financiera automatizada de las donaciones.
                </p>
              </div>
            </motion.div>

            {/* Hero Header */}
            <motion.div {...fadeUp(0.1)}>
              <p className="text-xs uppercase tracking-[0.35em] text-accent/80 font-mono font-medium">
                Soberanía Económica
              </p>

              <h1 className="display-font text-4xl sm:text-5xl font-bold leading-tight mt-3">
                Dona <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent/70">Panedas</span>
              </h1>

              <div className="mt-4 w-12 h-0.5 bg-accent/60 rounded-full" />

              <p className="mt-5 max-w-2xl text-[15px] sm:text-base leading-relaxed text-foreground/70">
                Apoya al desarrollo y sostenimiento del Reino del Pan donando Panedas directamente
                al <strong className="text-foreground font-semibold">Gobierno</strong>, a través del
                comando oficial en Discord o mediante transferencia bancaria con Laboral Panian Bank (LPB).
              </p>
            </motion.div>

            {/* Método 1: Comando de Discord */}
            <motion.div
              {...fadeUp(0.22)}
              className="mt-12 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm shadow-md overflow-hidden"
            >
              <div className="p-6 sm:p-8 grid gap-6 sm:grid-cols-3 items-start">

                {/* Columna Izquierda: Identificador principal */}
                <div className="sm:col-span-2 space-y-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-accent/80 font-mono font-semibold">
                      Donación vía Discord
                    </p>
                    <p className="mt-1 text-3xl sm:text-4xl font-bold display-font tracking-tight text-foreground">
                      Destinatario: Gobierno
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1 text-xs text-foreground/60 font-mono">
                    <div>
                      <span className="text-foreground/40 mr-1.5">Comando:</span>
                      <code className="bg-background px-1.5 py-0.5 rounded border border-border/40 text-accent font-sans">!dar gobierno (cantidad)</code>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Canal Oficial Verificado</span>
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Información de rol */}
                <div className="sm:border-l border-border/60 sm:pl-6 h-full flex flex-col justify-center">
                  <p className="text-xs text-foreground/50 leading-relaxed">
                    Escribe el comando en el canal de economía sustituyendo (cantidad) por el número
                    de Panedas que deseas donar al Gobierno del Reino del Pan.
                  </p>
                </div>
              </div>

              {/* Sección Inferior de Acción */}
              <div className="px-6 py-5 bg-background/40 border-t border-border/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <p className="text-xs text-foreground/60 max-w-md leading-relaxed">
                  Las transferencias se validan de forma automática procesando el comando correspondiente en el entorno de Discord.
                </p>

                <a
                  href="https://discord.com/channels/1381359904731693056/1431607164077871175"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-accent text-accent-foreground text-xs font-semibold tracking-wider uppercase transition-all duration-200 hover:opacity-90 hover:shadow-lg active:scale-[0.98]"
                >
                  Ir al canal de economía
                </a>
              </div>
            </motion.div>

            {/* Método 2: Laboral Panian Bank */}
            <motion.div
              {...fadeUp(0.28)}
              className="mt-6 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm shadow-md overflow-hidden"
            >
              <div className="p-6 sm:p-8 grid gap-6 sm:grid-cols-3 items-start">

                <div className="sm:col-span-2 space-y-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-accent/80 font-mono font-semibold">
                      Donación vía LPB
                    </p>
                    <p className="mt-1 text-3xl sm:text-4xl font-bold display-font tracking-tight text-foreground">
                      Laboral Panian Bank
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1 text-xs text-foreground/60 font-mono">
                    <div>
                      <span className="text-foreground/40 mr-1.5">DPI:</span>
                      <code className="bg-background px-1.5 py-0.5 rounded border border-border/40 text-accent font-sans">DPI - 000000A</code>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Cuenta Oficial Verificada</span>
                    </div>
                  </div>
                </div>

                <div className="sm:border-l border-border/60 sm:pl-6 h-full flex flex-col justify-center">
                  <p className="text-xs text-foreground/50 leading-relaxed">
                    Realiza tu transferencia desde el portal de LPB indicando el DPI del Gobierno
                    como destinatario de la donación.
                  </p>
                </div>
              </div>

              <div className="px-6 py-5 bg-background/40 border-t border-border/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <p className="text-xs text-foreground/60 max-w-md leading-relaxed">
                  Las transferencias mediante LPB se procesan a través del portal oficial de transferencias.
                </p>

                <a
                  href="https://mineco.duckdns.org/lpb/transferencia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-accent text-accent-foreground text-xs font-semibold tracking-wider uppercase transition-all duration-200 hover:opacity-90 hover:shadow-lg active:scale-[0.98]"
                >
                  Ir a transferencia LPB
                </a>
              </div>
            </motion.div>

            {/* Aviso Importante Regulado */}
            <motion.div
              {...fadeUp(0.36)}
              className="mt-6 rounded-2xl border border-border/40 bg-background/30 p-5 flex gap-4 items-start"
            >
              <div className="text-accent text-lg mt-0.5 select-none font-mono">⚠️</div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.25em] text-foreground/50 font-mono font-bold">
                  Cláusula de Transparencia
                </p>
                <p className="text-xs text-foreground/60 leading-relaxed">
                  Solo se consideran válidas las donaciones en Panedas enviadas mediante el comando oficial
                  de Discord o a través del portal de Laboral Panian Bank con el DPI indicado. Toda aportación
                  es voluntaria, con fines de desarrollo comunitario y no confiere derechos políticos ni es
                  sujeta a reembolso.
                </p>
              </div>
            </motion.div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}