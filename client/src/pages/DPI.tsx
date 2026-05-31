import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { CheckCircle2, Shield, Globe, Award } from 'lucide-react';

export default function DPI() {
  const benefits = [
    { icon: <Globe className="w-6 h-6" />, title: 'Identidad Digital Global', desc: 'Acceso a servicios digitales exclusivos del Reino del Pan desde cualquier parte del mundo.' },
    { icon: <Shield className="w-6 h-6" />, title: 'Seguridad y Privacidad', desc: 'Sistemas de identificación basados en tecnología de vanguardia que protegen tus datos.' },
    { icon: <CheckCircle2 className="w-6 h-6" />, title: 'Proceso Simplificado', desc: 'Obtén tu Documento Personal de Identidad de forma rápida y totalmente en línea.' },
    { icon: <Award className="w-6 h-6" />, title: 'Reconocimiento Oficial', desc: 'Forma parte de una nación soberana con reconocimiento en nuestra comunidad global.' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="section-spacious">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center mb-20">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="display-font text-5xl sm:text-6xl text-foreground mb-8 font-bold"
              >
                Obtener DPI
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-foreground/70"
              >
                Únete a la era digital del Reino del Pan. El Documento Personal de Identidad (DPI) es tu puerta de entrada a nuestra nación.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-secondary p-8 border-b-4 border-accent"
                >
                  <div className="text-accent mb-6">{benefit.icon}</div>
                  <h3 className="display-font text-xl text-foreground mb-4">{benefit.title}</h3>
                  <p className="text-foreground/70 text-sm leading-relaxed">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto bg-foreground text-background p-12 text-center"
            >
              <h2 className="display-font text-3xl mb-6">¿Listo para comenzar?</h2>
              <p className="mb-10 text-background/80">El proceso de solicitud toma menos de 10 minutos. Necesitarás una identificación válida y una fotografía reciente.</p>
              <button className="btn-minimal bg-accent text-accent-foreground border-accent hover:bg-transparent hover:text-accent">
                Iniciar Solicitud
              </button>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
