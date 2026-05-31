import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="section-spacious">
          <div className="container max-w-4xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="display-font text-5xl sm:text-6xl text-foreground mb-10 font-bold"
            >
              Acerca del Reino del Pan
            </motion.h1>
            
            <div className="space-y-8 text-lg text-foreground/80 leading-relaxed">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                El Reino del Pan es una nación soberana e independiente que nace con la visión de crear una sociedad basada en la paz, la sostenibilidad y la excelencia. Nuestra identidad está profundamente ligada a la tierra, el trabajo artesanal y la búsqueda constante de la armonía.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-12 py-8"
              >
                <div className="border-l-4 border-accent pl-6">
                  <h3 className="display-font text-2xl text-foreground mb-4">Nuestra Misión</h3>
                  <p>Promover un modelo de gobernanza transparente y democrático que priorice el bienestar de sus ciudadanos y la preservación del medio ambiente.</p>
                </div>
                <div className="border-l-4 border-accent pl-6">
                  <h3 className="display-font text-2xl text-foreground mb-4">Nuestra Visión</h3>
                  <p>Convertirnos en un referente global de innovación social y sostenibilidad, demostrando que un país pequeño puede tener un gran impacto.</p>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                Ubicado en el corazón de Europa, el Reino del Pan no es solo un territorio físico, sino una comunidad global de individuos que comparten los mismos valores de respeto, diversidad y progreso.
              </motion.p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
