import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import GetInvolved from '@/components/GetInvolved';
import WhyGetInvolved from '@/components/WhyGetInvolved';
import News from '@/components/News';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';

/**
 * Home Page - Elegancia Minimalista Premium
 * 
 * Estructura de la web del Gobierno del Reino del Pan.
 * Replicando el estilo de verdisgov.org con un diseño minimalista premium.
 * 
 * Paleta: Blanco, Negro, Oro
 * Tipografía: GaleySemiBold para displays
 * Espaciado: Generoso (py-16 a py-28 entre secciones)
 */
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <Stats />
        <GetInvolved />
        <WhyGetInvolved />
        <News />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
