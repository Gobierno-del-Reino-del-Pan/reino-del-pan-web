import Header from '@/components/Header';
import Hero from '@/components/Hero';
import GetInvolved from '@/components/GetInvolved';
import WhyGetInvolved from '@/components/WhyGetInvolved';
import News from '@/components/News';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';

/**
 * Home Page - Elegancia Minimalista Moderna
 * 
 * Estructura de la web del Gobierno del Reino del Pan
 * Replicando el estilo de verdisgov.org con diseño minimalista
 * 
 * Paleta: Blanco, Negro, Oro
 * Tipografía: GaleySemiBold para displays
 * Espaciado: Generoso (80px entre secciones)
 */
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <GetInvolved />
        <WhyGetInvolved />
        <News />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
