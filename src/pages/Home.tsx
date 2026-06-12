import { useMemo } from "react";
import { Link } from "wouter";
import Header from "../components/Header";
import Footer from "../components/Footer";

const NEWS_ITEMS = [
  "Muy pronto los ciudadanos en proceso de regularización podrán solicitar su TPIE",
  "Corelia realizará una declaración institucional para informar sobre la situación de LaLiga Paniense",
  "Laboral Panian Bank entrará muy pronto en funcionamiento"
];

const STATS_ITEMS = [
  { stat: "Casi 1 Año", title: "Desde su fundación", desc: "Iniciado como una visión en 2025, ahora es un estado consolidado." },
  { stat: "5400+", title: "Solicitudes de DPI", desc: "Ciudadanos digitales registrados y activos en nuestra plataforma global." },
  { stat: "100%", title: "Por la Libertad", desc: "Compromiso total con la libertad y la resiliencia de nuestro pueblo." },
  { stat: "50+", title: "Países conectados", desc: "Una comunidad diplomática que cruza borders internacionales." },
];

export default function Home() {
  const news = useMemo(() => NEWS_ITEMS, []);
  const stats = useMemo(() => STATS_ITEMS, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-x-hidden antialiased">
      <Header />

      {/* ── BANNER DE NOTICIAS ────────────────── */}
      <div
        className="w-full bg-accent text-accent-foreground border-y border-accent/20 py-2.5 overflow-hidden select-none z-20 shadow-sm"
        role="region"
        aria-label="Banner de noticias en tiempo real"
      >
        <div className="w-max flex whitespace-nowrap gap-12 animate-[marquee_35s_linear_infinite] hover:[animation-play-state:paused] cursor-pointer will-change-transform [transform:translateZ(0)]">
          <div className="flex shrink-0 items-center gap-12">
            {news.map((item, index) => (
              <div key={`news-1-${index}`} className="flex items-center gap-4 text-xs font-mono uppercase tracking-[0.2em]">
                <span className="text-[9px] bg-accent-foreground/20 px-2 py-0.5 rounded-full" aria-hidden="true">★</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-12" aria-hidden="true">
            {news.map((item, index) => (
              <div key={`news-2-${index}`} className="flex items-center gap-4 text-xs font-mono uppercase tracking-[0.2em]">
                <span className="text-[9px] bg-accent-foreground/20 px-2 py-0.5 rounded-full">★</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HERO CON VÍDEO DE FONDO ───────────────────────────────────────── */}
      <main className="flex-1 relative flex items-center justify-center min-h-[calc(100vh-120px)] lg:min-h-0 py-12 sm:py-16 lg:py-24 px-4 sm:px-6">
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-center scale-[1.01] brightness-[0.85] contrast-[1.05]"
          >
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>
          {/* Se eliminó el gradiente que usaba "background" (que causaba la capa blanca) y se cambió por un degradado negro limpio */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80 lg:bg-gradient-to-r lg:from-black/90 lg:via-black/50 lg:to-transparent" />
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[0.5px]" />
        </div>

        <div className="container mx-auto grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center z-10 relative">
          <div className="p-6 sm:p-8 lg:p-0 rounded-3xl bg-black/20 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none border border-white/5 lg:border-none shadow-2xl lg:shadow-none">
            <span className="text-xs uppercase tracking-[0.35em] text-accent font-bold bg-black/40 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full inline-block shadow-sm">
              Gobierno Oficial
            </span>

            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-[3.5rem] font-black leading-[1.1] tracking-tight text-white drop-shadow-md">
              Nuestra tierra.<br />
              Nuestra gente.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-blue-600 to-blue-950 filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                Reino del Pan
              </span>
            </h1>

            <div className="mt-5 w-16 h-0.5 bg-accent rounded-full" />

            <p className="mt-5 max-w-lg text-[15px] sm:text-base leading-7 text-white/90 font-medium drop-shadow-sm">
              Un estado digital y territorial dedicado a la paz, la reconciliación social, la ecología activa y la
              gobernanza del siglo XXI. Sé parte de la construcción de una nueva nación soberana.
            </p>

            <div className="mt-8 flex gap-4 flex-wrap">
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-neutral-900 transition-all duration-300 hover:bg-neutral-200 hover:shadow-lg hover:shadow-black/20 active:scale-95"
              >
                Conocer más
              </Link>
              <Link
                href="/dpi"
                className="inline-flex items-center justify-center rounded-full border-2 border-accent bg-accent px-6 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-accent-foreground transition-all duration-300 hover:bg-accent/90 hover:border-accent/90 hover:shadow-lg hover:shadow-accent/20 active:scale-95"
              >
                Obtener DPI
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats.map(({ stat, title, desc }) => (
              <section
                key={stat}
                className="rounded-[30px] border border-white/10 bg-black/50 backdrop-blur-md p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:bg-black/60 shadow-lg group"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-accent font-bold group-hover:translate-x-1 transition-transform duration-300 inline-block">
                  {stat}
                </p>
                <h2 className="mt-2 text-[25px] font-bold leading-snug text-white">
                  {title}
                </h2>
                <p className="mt-2 text-[13px] text-white/70 leading-relaxed font-normal">
                  {desc}
                </p>
              </section>
            ))}
          </div>
        </div>
      </main>

      {/* ── SECCIÓN: ANUNCIO INSTITUCIONAL COMPLETO (A SANGRE) ── */}
      <section className="w-full">
        <img
          src="/anunciosgov/seguimosavanzando.jpg"
          alt="Anuncio Institucional: Seguimos Avanzando"
          className="w-full h-auto block"
        />
      </section>

      {/* ── SECCIÓN: CONTENEDOR INTEGRADO CON FONDO BLANCO AZULADO (#CDCCD4) ── */}
      <section className="w-full px-4 sm:px-6 py-16 lg:py-24 bg-[#CDCCD4]">
        <div className="container mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Tarjeta Laboral Panian Bank (Blanca para contrastar sutilmente sobre el fondo azulado) */}
          <div className="rounded-[32px] bg-white p-8 sm:p-10 flex flex-col justify-between shadow-xl min-h-[380px] group transition-all duration-300 border border-black/5">
            <div>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <span className="text-xs uppercase tracking-[0.25em] text-neutral-600 font-bold bg-neutral-100 px-4 py-1.5 rounded-full">
                  Alianza Financiera
                </span>
                <img
                  src="/LK.png"
                  alt="Laboral Kutxa"
                  className="h-6 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity mix-blend-multiply"
                />
              </div>
              <h3 className="mt-6 text-2xl sm:text-3xl font-black tracking-tight text-neutral-950">
                Laboral Panian Bank
              </h3>
              <p className="mt-4 text-[14px] sm:text-base text-neutral-700 leading-relaxed font-normal">
                El Gobierno del Reino del Pan y Laboral Kutxa han alcanzado un acuerdo para la creación de Laboral Panian Bank.
                Una nueva entidad financiera que impulsará el ahorro, la inversión y el crecimiento económico del país.
                El futuro de la banca paniense comienza hoy.
              </p>
            </div>
            <div className="mt-8 flex items-center">
              <span className="text-xs uppercase tracking-[0.15em] font-mono font-bold text-emerald-800/90">Se une a nosotros para crear la primera entidad financiera de panama</span>
            </div>
          </div>

          {/* Tarjeta PKMN (Blanca para contrastar sutilmente sobre el fondo azulado) */}
          <div className="rounded-[32px] bg-white p-8 sm:p-10 grid grid-cols-1 sm:grid-cols-[1.2fr_0.8fr] gap-6 items-center shadow-xl min-h-[380px] group transition-all duration-300 border border-black/5">
            <div className="flex flex-col justify-between h-full">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-amber-800 font-bold bg-amber-50 px-4 py-1.5 rounded-full inline-block">
                  Descubrimiento PKMN
                </span>
                <h3 className="mt-6 text-2xl sm:text-3xl font-black tracking-tight text-neutral-950">
                  Tercer Inicial Revelado
                </h3>
                <p className="mt-4 text-[14px] sm:text-base text-neutral-700 leading-relaxed font-normal">
                  Cyndaquil es oficialmente el tercer inicial anunciado para el ecosistema del Reino. Su naturaleza y capacidades marcarán el inicio de una nueva era de exploración.
                </p>
              </div>
              <div className="mt-8 sm:mt-0">
                <span className="text-xs uppercase tracking-[0.15em] font-mono font-bold text-amber-800/90">Especie registrada ★</span>
              </div>
            </div>
            <div className="flex justify-center items-center h-full max-h-[220px] sm:max-h-full">
              <img
                src="/pkmn/cyndaquil.png"
                alt="cyndaquil inicial"
                className="max-h-[180px] sm:max-h-[220px] w-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.06)] group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

        </div>
      </section>

      <Footer />

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
      `}} />
    </div>
  );
}