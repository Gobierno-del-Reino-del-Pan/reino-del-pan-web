import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion } from "framer-motion";

export default function Donations() {
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
                Donaciones
              </p>

              <h1 className="display-font text-4xl font-bold leading-tight mt-4">
                Dona <span className="text-accent">Panedas</span>
              </h1>

              <div className="mt-5 w-12 h-0.5 bg-accent rounded-full" />

              <p className="mt-5 max-w-2xl text-[15px] leading-7 text-foreground/60">
                Apoya al Reino del Pan enviando Panedas directamente a{" "}
                <strong className="text-foreground/80">rexy#0505</strong> a
                través del canal oficial de economía en Discord.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-14 rounded-[20px] border border-accent/30 bg-card p-8"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-accent font-medium">
                Destinatario
              </p>

              <p className="mt-3 text-3xl font-bold display-font">
                rexy#0505
              </p>

              <p className="mt-1 text-[13px] text-foreground/50">
                ID: 832339047464173619
              </p>

              <p className="mt-2 text-[13px] text-foreground/50">
                Usuario oficial receptor de donaciones en Panedas
              </p>

              <div className="mt-8 h-px bg-border" />

              <div className="mt-6">
                <p className="text-[13px] text-foreground/60 leading-relaxed mb-4">
                  Las donaciones se realizan exclusivamente a través del canal
                  de economía oficial del Discord del Reino del Pan. Solo se
                  aceptan{" "}
                  <strong className="text-foreground/80">Panedas</strong> como
                  moneda de donación.
                </p>

                <a
                  href="https://discord.com/channels/1381359904731693056/1431607164077871175"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-minimal"
                >
                  Ir al canal de economía
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 rounded-[20px] border border-accent/20 bg-accent/5 p-6"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-accent font-medium mb-2">
                Importante
              </p>

              <p className="text-[14px] text-foreground/65 leading-relaxed">
                Solo se aceptan donaciones en Panedas enviadas al canal oficial
                de economía en Discord. Las donaciones son voluntarias y no
                reembolsables.
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}