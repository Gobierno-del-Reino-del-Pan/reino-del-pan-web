import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion } from "framer-motion";

export default function About() {
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
              <h1 className="display-font text-5xl sm:text-6xl font-semibold leading-tight">
                Acerca del Reino del Pan
              </h1>
              <p className="mt-8 max-w-3xl text-lg leading-8 text-foreground/80">
                El Reino del Pan es una nación soberana e independiente que nace con la visión de crear una sociedad
                basada en la paz, la sostenibilidad y la excelencia. Nuestra identidad está profundamente ligada a la
                tierra, el trabajo artesanal y la búsqueda constante de la armonía.
              </p>
            </motion.div>

            <div className="mt-16 grid gap-10 md:grid-cols-2">
              <div className="card-surface border-accent/20 border-l-4">
                <h2 className="display-font text-2xl mb-4">Nuestra Misión</h2>
                <p className="text-foreground/75 leading-7">
                  Promover un modelo de gobernanza transparente y democrático que priorice el bienestar de sus ciudadanos y la preservación del medio ambiente.
                </p>
              </div>
              <div className="card-surface border-accent/20 border-l-4">
                <h2 className="display-font text-2xl mb-4">Nuestra Visión</h2>
                <p className="text-foreground/75 leading-7">
                  Convertirnos en un referente global de innovación social y sostenibilidad, demostrando que un país pequeño puede tener un gran impacto.
                </p>
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-16 max-w-3xl text-lg leading-8 text-foreground/80"
            >
              Ubicado en el corazón de Europa, el Reino del Pan no es solo un territorio físico, sino una comunidad
              global de individuos que comparten los mismos valores de respeto, diversidad y progreso.
            </motion.p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}