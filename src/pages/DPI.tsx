import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "wouter";
import { icon } from "leaflet";

const features = [
  {
    title: "Identidad Digital Global",
    description:
      "Acceso a servicios digitales exclusivos del Reino del Pan desde cualquier parte del mundo.",
    icon: (
      <svg className="w-5 h-5 transition-colors duration-300 text-accent group-hover:text-background" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8" />
      </svg>
    ),
  },
  {
    title: "Seguridad y Privacidad",
    description:
      "Sistemas de identificación basados en tecnología de vanguardia que protegen tus datos.",
    icon: (
      <svg className="w-5 h-5 transition-colors duration-300 text-accent group-hover:text-background" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "Proceso Simplificado",
    description:
      "Obtén tu Documento Personal de Identidad de forma rápida y totalmente en línea.",
    icon: (
      <svg className="w-5 h-5 transition-colors duration-300 text-accent group-hover:text-background" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Reconocimiento Oficial",
    description:
      "Forma parte de una nación soberana con reconocimiento en nuestra comunidad global.",
    icon: (
      <svg className="w-5 h-5 transition-colors duration-300 text-accent group-hover:text-background" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
];

export default function DPI() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-accent/20 relative overflow-x-hidden">
      {/* Luces de fondo decorativas (Glow effect) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

      <Header />

      <main className="flex-1 py-16 md:py-28 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">

          {/* Hero Section */}
          <div className="text-center mb-24">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-5">
              👑 Ciudadanía Digital
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-foreground mt-2 tracking-tight uppercase leading-none">
              Obtener <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent/70">DPI</span>
            </h1>
            &nbsp;
            <p className="mt-6 text-base md:text-xl text-foreground/80 leading-relaxed max-w-2xl mx-auto font-medium">
              Únete a la era digital del Reino del Pan. El Documento Personal de
              Identidad (DPI) es tu llave maestra de entrada a nuestra nación.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group bg-card/30 border border-border/60 hover:border-accent/40 rounded-2xl p-6 md:p-8 hover:bg-card/70 hover:shadow-xl hover:shadow-accent/[0.02] transition-all duration-300 backdrop-blur-md flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6 group-hover:bg-accent transition-all duration-300 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-accent/20">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-3 tracking-tight group-hover:text-accent transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-foreground/70 leading-relaxed text-sm md:text-base">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-card via-card to-background border border-accent/20 rounded-3xl p-8 md:p-16 text-center shadow-2xl shadow-accent/[0.03]">
            {/* Círculos decorativos abstractos integrados */}
            <div className="absolute -right-16 -top-16 w-40 h-40 bg-accent/5 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-40 h-40 bg-accent/5 rounded-full blur-xl pointer-events-none" />

            <h2 className="text-2xl md:text-4xl font-black text-foreground mb-4 tracking-tight uppercase">
              ¿Listo para comenzar tu viaje?
            </h2>

            <p className="text-foreground/70 mb-10 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
              El proceso de solicitud toma menos de **10 minutos**. Solo necesitarás una
              identificación válida y una fotografía reciente en formato digital.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto sm:max-w-none">
              <Link
                href="/dpi/create"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-accent bg-accent text-background font-bold uppercase tracking-wider text-xs hover:bg-transparent hover:text-accent hover:shadow-lg hover:shadow-accent/20 active:scale-98 transition-all duration-300 w-full sm:w-auto cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Crear mi DPI
              </Link>

              <Link
                href="/dpi/restore"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-border hover:border-accent/50 bg-background/40 hover:bg-accent/5 text-foreground/90 font-bold uppercase tracking-wider text-xs active:scale-98 transition-all duration-300 w-full sm:w-auto cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Recuperar mi DPI
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}