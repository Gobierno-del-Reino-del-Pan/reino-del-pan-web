import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "wouter";

export default function Home() {
  const news = [
    "Muy pronto los ciudadanos en proceso de regularización podrán solicitar su TPIE",
    "Corelia realizará una declaración institucional para informar sobre la situación de LaLiga Paniense",
    "Laboral Panian Bank entrará muy pronto en funcionamiento"
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-x-hidden">

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <Header />

      {/* ── BANNER DE NOTICIAS ────────────────── */}
      <div className="w-full bg-accent text-accent-foreground border-y border-accent/20 py-2.5 overflow-hidden select-none z-20 shadow-sm">
        <div className="flex whitespace-nowrap gap-12 animate-[marquee_15s_linear_infinite] hover:[animation-play-state:paused] cursor-pointer">
          {[...news, ...news].map((item, index) => (
            <div key={index} className="flex items-center gap-4 text-xs font-mono uppercase tracking-[0.2em]">
              <span className="text-[9px] bg-accent-foreground/20 px-2 py-0.5 rounded-full">★</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── HERO CON VÍDEO DE FONDO ───────────────────────────────────────── */}
      <main className="flex-1 relative flex items-center justify-center py-16 lg:py-24 px-4 sm:px-6">

        {/* Contenedor del Vídeo en segundo plano */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover scale-[1.02]" // Evita pequeños desfases de bordes
          >
            {/* Ubicación física del archivo en tu carpeta: public/videos/hero.mp4 */}
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>
          {/* Capa de contraste superpuesta (Overlay) */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/50 lg:from-background/95 lg:via-background/80 lg:to-background/25" />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
        </div>

        {/* CONTENIDO PRINCIPAL (Por encima del vídeo) */}
        <div className="container mx-auto grid gap-16 lg:grid-cols-[1.1fr_0.9fr] items-center z-10 relative">

          {/* Bloque Izquierdo: Textos institucionales */}
          <div className="p-6 lg:p-0 rounded-3xl bg-background/20 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none border border-white/5 lg:border-none shadow-xl lg:shadow-none">
            <p className="text-xs uppercase tracking-[0.35em] text-accent font-semibold bg-accent/10 lg:bg-transparent px-3 py-1 lg:p-0 rounded-full inline-block">
              Gobierno Oficial
            </p>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-[3.5rem] font-black leading-[1.1] display-font tracking-tight text-white drop-shadow-md">
              Nuestra tierra.
              <br />
              Nuestra gente.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-amber-400">Reino del Pan</span>
            </h1>
            <div className="mt-5 w-16 h-0.5 bg-accent rounded-full" />
            <p className="mt-5 max-w-lg text-[15px] sm:text-base leading-7 text-white/80 font-medium drop-shadow-sm">
              Un estado digital y territorial dedicado a la paz, la reconciliación social, la ecología activa y la
              gobernanza del siglo XXI. Sé parte de la construcción de una nueva nación soberana.
            </p>
            <div className="mt-8 flex gap-3 flex-wrap">
              {/* CAMBIO AQUI: Botón Conocer Más estilizado con fondo blanco, texto oscuro y tipografía institucional */}
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-neutral-900 transition-all duration-300 hover:bg-neutral-200 hover:shadow-lg hover:shadow-white/10 active:scale-95"
              >
                Conocer más
              </Link>
              <Link
                href="/dpi"
                className="inline-flex items-center justify-center rounded-full border-2 border-accent bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground transition hover:opacity-90 hover:shadow-lg hover:shadow-accent/20 active:scale-95"
              >
                Obtener DPI
              </Link>
            </div>
          </div>

          {/* Bloque Derecho: Tarjetas de Datos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { stat: "Casi 1 Año", title: "Desde su fundación", desc: "Iniciado como una visión en 2025, ahora es un estado consolidado." },
              { stat: "5400+", title: "Solicitudes de DPI", desc: "Ciudadanos digitales registrados y activos en nuestra plataforma global." },
              { stat: "100%", title: "Por la Libertad", desc: "Compromiso total con la libertad y la resiliencia de nuestro pueblo." },
              { stat: "50+", title: "Países conectados", desc: "Una comunidad diplomática que cruza fronteras internacionales." },
            ].map(({ stat, title, desc }) => (
              <div
                key={stat}
                className="rounded-[24px] border border-white/10 bg-black/40 backdrop-blur-md p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:bg-black/50 shadow-lg group"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-accent font-bold group-hover:scale-105 transition-transform duration-200 inline-block">{stat}</p>
                <p className="mt-2 text-[16px] font-bold leading-snug text-white">{title}</p>
                <p className="mt-2 text-[13px] text-white/60 leading-relaxed font-normal">{desc}</p>
              </div>
            ))}
          </div>

        </div>
      </main>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <Footer />

      {/* Estilos CSS Inline para la animación del Marquee */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}