import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "wouter";

const features = [
  {
    title: "Identidad Digital Global",
    description:
      "Acceso a servicios digitales exclusivos del Reino del Pan desde cualquier parte del mundo.",
  },
  {
    title: "Seguridad y Privacidad",
    description:
      "Sistemas de identificación basados en tecnología de vanguardia que protegen tus datos.",
  },
  {
    title: "Proceso Simplificado",
    description:
      "Obtén tu Documento Personal de Identidad de forma rápida y totalmente en línea.",
  },
  {
    title: "Reconocimiento Oficial",
    description:
      "Forma parte de una nación soberana con reconocimiento en nuestra comunidad global.",
  },
];

export default function DPI() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 py-12 md:py-20 px-4 md:px-0">
        <div className="container mx-auto max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <p className="text-xs md:text-sm uppercase tracking-[0.35em] text-accent font-semibold">
              Documento de Identidad
            </p>

            <h1 className="text-3xl md:text-5xl font-bold text-foreground mt-4 leading-tight">
              Obtener DPI
            </h1>

            <p className="mt-6 text-base md:text-lg text-foreground/75 leading-relaxed max-w-2xl mx-auto">
              Únete a la era digital del Reino del Pan. El Documento Personal de
              Identidad (DPI) es tu puerta de entrada a nuestra nación.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-card border border-border rounded-lg p-6 md:p-8 hover:border-accent/50 transition-colors"
              >
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-foreground/70 leading-relaxed text-sm md:text-base">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-accent/10 to-accent/5 border-2 border-accent/30 rounded-lg p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              ¿Listo para comenzar?
            </h2>

            <p className="text-foreground/70 mb-8 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
              El proceso de solicitud toma menos de 10 minutos. Necesitarás una
              identificación válida y una fotografía reciente.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/dpi/create"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full border-2 border-accent bg-accent text-background font-semibold uppercase tracking-wider text-sm hover:bg-transparent hover:text-accent transition-all duration-300 w-full sm:w-auto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Crear mi DPI
              </Link>

              <Link
                href="/dpi/restore"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full border-2 border-accent/60 bg-transparent text-accent font-semibold uppercase tracking-wider text-sm hover:border-accent hover:bg-accent/10 transition-all duration-300 w-full sm:w-auto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
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