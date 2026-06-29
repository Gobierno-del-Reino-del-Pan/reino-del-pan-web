import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion } from "framer-motion";

export default function Gobierno() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1">
        <section className="section-spacious">
          <div className="container mx-auto max-w-4xl">

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-xs uppercase tracking-[0.35em] text-accent font-medium">
                Gobierno Oficial
              </p>

              <h1 className="display-font text-4xl font-bold leading-tight mt-4">
                Estructura del <span className="text-accent">Gobierno</span>
              </h1>

              <div className="mt-5 w-12 h-0.5 bg-accent rounded-full" />

              <p className="mt-5 max-w-2xl text-[15px] leading-7 text-foreground/60">
                El Reino del Pan organiza su estructura institucional a través de documentos y referencias oficiales que definen su funcionamiento interno.
              </p>
            </motion.div>

            {/* AVISO FORMAL */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-10 rounded-[20px] border border-accent/20 bg-accent/5 p-6"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-accent font-medium mb-2">
                Estado institucional
              </p>

              <p className="text-[14px] text-foreground/65 leading-relaxed">
                Estado institucional

                Actualmente no existe un gobierno formalmente estructurado ni un gabinete en funciones dentro del Reino del Pan. Sin embargo, se mantiene un gobierno provisional encargado de la administración y supervisión del orden general, formado por los Moderadores y Vigilantes, quienes velan por el cumplimiento de las leyes y el funcionamiento básico del sistema.

                Todas estas funciones operan bajo la autoridad de Martini, quien ejerce la coordinación general del sistema institucional de manera provisional.
              </p>
            </motion.div>

            {/* MINISTERIO DE ECONOMÍA, COMERCIO Y TRANSPORTE */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-10 rounded-[20px] border border-accent/20 bg-accent/5 p-6 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.3em] text-accent font-medium mb-2">
                  Recurso Oficial
                </p>
                <p className="text-[15px] font-semibold">
                  Ministerio de Economía, Comercio y Empresa
                </p>
                <p className="mt-1 text-[13px] text-foreground/60 leading-relaxed">
                  Portal oficial del Ministerio de Economía, Comercio y Empresa del Reino del Pan.
                </p>
              </div>

              <a
                href="https://mineco.duckdns.org"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-minimal shrink-0"
              >
                Visitar
              </a>
            </motion.div>

            {/* MINISTERIO DE TRANSFORMACIÓN DIGITAL */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-10 rounded-[20px] border border-accent/20 bg-accent/5 p-6 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.3em] text-accent font-medium mb-2">
                  Recurso Oficial
                </p>
                <p className="text-[15px] font-semibold">
                  Ministerio de Transformación Digital
                </p>
                <p className="mt-1 text-[13px] text-foreground/60 leading-relaxed">
                  Portal oficial del Ministerio de Transformación Digital del Reino del Pan. Impulsamos la digitalización, la modernización de la administración pública y el desarrollo de servicios digitales para todos los ciudadanos.
                </p>
              </div>

              <a
                href="https://mitd.duckdns.org"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-minimal shrink-0"
              >
                Visitar
              </a>
            </motion.div>

            {/* ENCICLOPAN */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mt-10 rounded-[20px] border border-accent/20 bg-accent/5 p-6 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.3em] text-accent font-medium mb-2">
                  Recurso Oficial
                </p>
                <p className="text-[15px] font-semibold">Enciclopan</p>
                <p className="mt-1 text-[13px] text-foreground/60 leading-relaxed">
                  La enciclopedia libre y oficial del Reino del Pan. Consulta historia, leyes, cultura y más.
                </p>
              </div>

              <a
                href="https://enciclopan.duckdns.org"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-minimal shrink-0"
              >
                Visitar
              </a>
            </motion.div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}