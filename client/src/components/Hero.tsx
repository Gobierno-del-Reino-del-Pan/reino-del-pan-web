/**
 * Hero Component - Elegancia Minimalista Moderna
 * 
 * Diseño:
 * - Fondo blanco puro
 * - Tipografía GaleySemiBold para máximo impacto
 * - Espaciado generoso (80px arriba y abajo)
 * - Botones con borde oro
 */
export default function Hero() {
  return (
    <section className="bg-background section-spacious">
      <div className="container max-w-4xl">
        {/* Subtítulo */}
        <p className="text-xs font-semibold text-accent mb-8 tracking-widest uppercase letter-spacing">
          Bienvenido al Reino del Pan
        </p>

        {/* Título Principal */}
        <h1 className="display-font text-6xl sm:text-7xl lg:text-8xl text-foreground mb-10 leading-tight font-bold">
          Gobierno Oficial del<br />
          <span className="text-accent">Reino del Pan</span>
        </h1>

        {/* Descripción */}
        <p className="text-xl text-foreground/75 mb-14 leading-relaxed max-w-2xl font-light">
          Un reino dedicado a los valores democráticos, la modernización, el ambiente y la excelencia en la gobernanza. Descubre cómo puedes ser parte de nuestra misión.
        </p>

        {/* Botones CTA */}
        <div className="flex flex-col sm:flex-row gap-6">
          <button className="btn-minimal">
            Conocer más
          </button>
          <button className="btn-minimal-dark">
            Convertirse en e-Residente
          </button>
        </div>

        {/* Línea divisora */}
        <div className="divider-gold mt-16" />
      </div>
    </section>
  );
}
