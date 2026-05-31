/**
 * Newsletter Component - Elegancia Minimalista Moderna
 * 
 * Diseño:
 * - Fondo blanco puro
 * - Formulario minimalista
 * - Enlaces a redes sociales
 */
export default function Newsletter() {
  return (
    <section className="bg-background section-spacious">
      <div className="container max-w-2xl">
        <h2 className="display-font text-5xl sm:text-6xl text-foreground mb-8 font-bold">
          Únete a nuestro boletín
        </h2>

        <p className="text-foreground/70 text-lg mb-8">
          Suscríbete a nuestro boletín y únete a nuestro Telegram para recibir las últimas actualizaciones del Gobierno del Reino del Pan.
        </p>

        {/* Formulario */}
        <form className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="email"
            placeholder="Tu correo electrónico"
            className="flex-1 px-6 py-3 border-2 border-foreground bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:border-accent transition-colors duration-200"
          />
          <button className="btn-minimal whitespace-nowrap">
            Suscribirse
          </button>
        </form>

        {/* Enlaces sociales */}
        <div className="flex flex-wrap gap-6">
          <a
            href="#telegram"
            className="text-accent font-medium hover:text-accent/80 transition-colors duration-200 inline-flex items-center gap-2"
          >
            <span>✈️</span> Telegram
          </a>
          <a
            href="#facebook"
            className="text-accent font-medium hover:text-accent/80 transition-colors duration-200 inline-flex items-center gap-2"
          >
            <span>f</span> Facebook
          </a>
          <a
            href="#youtube"
            className="text-accent font-medium hover:text-accent/80 transition-colors duration-200 inline-flex items-center gap-2"
          >
            <span>▶️</span> YouTube
          </a>
          <a
            href="#instagram"
            className="text-accent font-medium hover:text-accent/80 transition-colors duration-200 inline-flex items-center gap-2"
          >
            <span>📷</span> Instagram
          </a>
          <a
            href="#linkedin"
            className="text-accent font-medium hover:text-accent/80 transition-colors duration-200 inline-flex items-center gap-2"
          >
            <span>in</span> LinkedIn
          </a>
        </div>

        {/* Línea divisora */}
        <div className="divider-gold mt-16" />
      </div>
    </section>
  );
}
