import Footer from "../../components/Footer";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpenText,
  ChevronRight,
  ExternalLink,
  FilePlus2,
  Fingerprint,
  LockKeyhole,
  Newspaper,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Scale,
} from "lucide-react";

/**
 * Página institucional del CPNP.
 * La identidad policial #011E64 convive con el morado corporativo #630B57.
 * Los datos del registro están fijados en código: NO son una API en tiempo real.
 */
const NOTICIAS = [
  {
    categoria: "Operaciones",
    titulo: "Desarticulada una red clandestina de contrabando de levadura integral.",
    descripcion:
      "Agentes del CPNP incautaron más de tres toneladas de materia prima no registrada en los límites del distrito norte de Baguette. Cuatro sospechosos han sido puestos a disposición judicial.",
  },
  {
    categoria: "Seguridad vial",
    titulo: "Nuevos controles de velocidad en las rutas de distribución.",
    descripcion:
      "Con el fin de garantizar la integridad de las cargas críticas, se desplegarán patrullas estáticas automatizadas durante los horarios de alta congestión logística.",
  },
  {
    categoria: "Institucional",
    titulo: "Convocatoria abierta para la escala básica de Inspectores de Policía.",
    descripcion:
      "Se habilitan los plazos de inscripción oficiales para el ingreso en la academia nacional. Los aspirantes deberán superar los exámenes físicos y de control de calidad.",
  },
] as const;

const REGISTRO = [
  { nombre: "Baneados", cantidad: 14 },
  { nombre: "Robos", cantidad: 412 },
  { nombre: "Suplantación de identidad", cantidad: 389 },
  { nombre: "Fraude de cripto", cantidad: 294 },
  { nombre: "Asesinatos", cantidad: 34 },
] as const;

const TOTAL = REGISTRO.reduce((suma, item) => suma + item.cantidad, 0);
const MAXIMO = Math.max(...REGISTRO.map((item) => item.cantidad));

export default function PoliciaNacional() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased">
      <style>{`
        @font-face {
          font-family: 'POLNAC';
          src: url('/Policía/POLNAC.ttf') format('truetype');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        .cpnp-page {
          --cpnp-blue: #011E64;
          --cpnp-violet: #630B57;
          --cpnp-ink: #17213B;
          --cpnp-subtle: #526078;
          --cpnp-line: rgba(52, 62, 103, .13);
          position: relative;
          isolation: isolate;
          color: var(--cpnp-ink);
          background:
            radial-gradient(ellipse 68% 39% at 5% 12%, rgba(99,11,87,.105), transparent 80%),
            radial-gradient(ellipse 55% 45% at 94% 30%, rgba(1,30,100,.09), transparent 82%),
            linear-gradient(150deg, #FAF8FC 0%, #F5F7FC 48%, #FBF8FC 100%);
        }
        .cpnp-page *, .cpnp-page *::before, .cpnp-page *::after { box-sizing: border-box; }
        .cpnp-page .cpnp-type { font-family: 'POLNAC', 'RMNeue', Inter, system-ui, sans-serif; }
        .cpnp-page .cpnp-glass {
          background: linear-gradient(135deg, rgba(255,255,255,.84), rgba(255,255,255,.59) 57%, rgba(247,243,253,.70));
          border: 1px solid rgba(255,255,255,.92);
          -webkit-backdrop-filter: blur(24px) saturate(155%);
          backdrop-filter: blur(24px) saturate(155%);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.95), inset 0 -1px 0 rgba(30,36,90,.035),
            0 14px 46px -24px rgba(19,30,76,.22), 0 2px 9px rgba(19,30,76,.04);
        }
        .cpnp-page .cpnp-surface { border-radius: 26px; }
        .cpnp-page .cpnp-focus:focus-visible { outline: 3px solid #9E73AA; outline-offset: 4px; }
        .cpnp-page .cpnp-back {
          display: inline-flex; align-items: center; gap: 9px; flex-shrink: 0;
          color: var(--cpnp-blue); font-size: 12px; font-weight: 750;
          border: 1px solid rgba(1,30,100,.16); background: rgba(255,255,255,.68);
          border-radius: 999px; padding: 11px 15px; transition: transform .2s, background .2s;
        }
        .cpnp-page .cpnp-back:hover { background: white; transform: translateX(-2px); }
        .cpnp-page .cpnp-navlink {
          display: inline-flex; align-items: center; min-height: 38px;
          border-radius: 999px; padding: 8px 14px; font-size: 12px; font-weight: 700;
          color: #3C4965; white-space: nowrap; transition: background .2s, color .2s;
        }
        .cpnp-page .cpnp-navlink:hover { background: rgba(1,30,100,.075); color: var(--cpnp-blue); }
        .cpnp-page .cpnp-hero {
          position: relative; overflow: hidden; border-radius: 34px;
          background: radial-gradient(circle at 88% 15%, rgba(159,124,202,.31), transparent 35%),
            linear-gradient(120deg, #011642, #011E64 52%, #32104F 100%);
          color: white;
          box-shadow: 0 26px 55px -27px rgba(1,30,100,.43);
        }
        .cpnp-page .cpnp-hero::before {
          content: ''; position: absolute; pointer-events: none; inset: 1px;
          border: 1px solid rgba(255,255,255,.17); border-radius: inherit;
          background: linear-gradient(to bottom, rgba(255,255,255,.085), transparent 34%);
        }
        .cpnp-page .cpnp-action {
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          min-height: 49px; border-radius: 15px; padding: 12px 19px;
          font-size: 12px; line-height: 1.35; font-weight: 800; text-align: center;
          transition: transform .2s, background .2s, box-shadow .2s;
        }
        .cpnp-page .cpnp-action:hover { transform: translateY(-2px); }
        .cpnp-page .cpnp-action-primary { background: white; color: var(--cpnp-blue); box-shadow: 0 9px 25px rgba(0,0,0,.14); }
        .cpnp-page .cpnp-action-primary:hover { background: #F0E7F7; }
        .cpnp-page .cpnp-action-secondary { color: white; border: 1px solid rgba(255,255,255,.36); background: rgba(255,255,255,.12); backdrop-filter: blur(12px); }
        .cpnp-page .cpnp-action-secondary:hover { background: rgba(255,255,255,.2); }
        .cpnp-page .cpnp-tag { display: inline-flex; align-items: center; gap: 7px; color: #630B57; background: rgba(99,11,87,.065); border: 1px solid rgba(99,11,87,.11); border-radius: 99px; padding: 7px 11px; font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
        .cpnp-page .cpnp-news { transition: transform .25s, border-color .25s, box-shadow .25s; border: 1px solid var(--cpnp-line); }
        .cpnp-page .cpnp-news:hover { transform: translateY(-3px); border-color: rgba(99,11,87,.25); box-shadow: 0 15px 25px -18px rgba(29,22,65,.18); }
        .cpnp-page .cpnp-track { width: 100%; height: 7px; overflow: hidden; border-radius: 99px; background: rgba(1,30,100,.075); }
        .cpnp-page .cpnp-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, #011E64, #630B57); }
        .cpnp-page .cpnp-strike { text-decoration: line-through; text-decoration-thickness: 1.5px; text-decoration-color: #B17AA8; text-decoration-skip-ink: none; }
        .cpnp-page a { text-decoration: none; }
        .cpnp-page .cpnp-body { width: 100%; max-width: 1216px; margin-inline: auto; padding-inline: clamp(16px, 3vw, 32px); }
        @media (max-width: 639px) {
          .cpnp-page .cpnp-surface { border-radius: 21px; }
          .cpnp-page .cpnp-hero { border-radius: 25px; }
          .cpnp-page .cpnp-action { width: 100%; }
          .cpnp-page .cpnp-back { padding: 10px 12px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cpnp-page *, .cpnp-page *::before, .cpnp-page *::after { transition-duration: .01ms !important; animation-duration: .01ms !important; }
        }
      `}</style>

      <div className="cpnp-page flex-1 flex flex-col min-w-0">
        {/* Identificación oficial: independiente de la barra de navegación de Artis Panis. */}
        <div className="border-b border-[#011E64]/10 bg-white/55 px-4 py-2.5">
          <div className="cpnp-body flex items-center justify-center gap-2 text-center text-[10px] sm:text-xs font-semibold tracking-[.06em] text-[#465171]">
            <img src="/flag.png" alt="" className="h-3.5 w-[21px] shrink-0 rounded-[2px] object-cover" />
            <span>Web oficial del Gobierno del <span className="cpnp-strike">Reino del</span> Pan · Ministerio del Interior y Defensa</span>
          </div>
        </div>

        {/* Cabecera: evita doble menú global en el micrositio policial. */}
        <header className="relative z-20 px-3 pt-3 sm:px-5 sm:pt-5">
          <div className="cpnp-glass cpnp-surface cpnp-body flex min-h-[72px] items-center justify-between gap-3 py-3 sm:min-h-[86px]">
            <a href="/policia" aria-label="Inicio de la Policía Nacional del Pan" className="cpnp-focus flex min-w-0 items-center gap-3 sm:gap-4 rounded-xl">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[#011E64]/10 bg-[#011E64]/5 sm:h-14 sm:w-14">
                <img src="/Policía/POLNAC.png" alt="" className="h-10 w-10 object-contain sm:h-12 sm:w-12" />
              </span>
              <span className="min-w-0">
                <span className="cpnp-type block text-[22px] leading-[1.05] font-bold tracking-tight text-[#011E64] sm:text-[29px]">CPNP</span>
                <span className="mt-1 block text-[9px] font-bold uppercase tracking-[.12em] text-[#630B57] sm:text-[11px]">
                  <span className="cpnp-strike">Reino del</span> Pan
                </span>
              </span>
            </a>
            <nav aria-label="Navegación policial" className="hidden items-center gap-1 rounded-full border border-[#011E64]/10 bg-white/55 p-1 lg:flex">
              <a className="cpnp-navlink cpnp-focus" href="#tramites">Trámites</a>
              <a className="cpnp-navlink cpnp-focus" href="#actualidad">Actualidad</a>
              <a className="cpnp-navlink cpnp-focus" href="#registro">Registro judicial</a>
            </nav>
            <a href="/" className="cpnp-back cpnp-focus" aria-label="Volver al portal principal">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="hidden min-[360px]:inline">Volver</span>
            </a>
          </div>
        </header>

        <main className="cpnp-body flex-1 pb-16 pt-5 sm:pb-20 sm:pt-7">
          {/* Aviso de emergencia: el 112 es el canal de emergencias reales en España. */}
          <section aria-label="Aviso de emergencias" className="mb-6 flex flex-col gap-3 rounded-[20px] border border-[#C85C67]/20 bg-[#FFF7F8]/85 p-4 shadow-[0_8px_24px_-17px_rgba(145,42,54,.16)] sm:flex-row sm:items-center sm:gap-4 sm:p-5">
            <div className="flex shrink-0 items-center gap-2 text-[#A42135]">
              <ShieldAlert className="h-5 w-5" aria-hidden="true" />
              <strong className="text-[11px] uppercase tracking-[.13em]">Emergencias</strong>
            </div>
            <p className="text-[12px] leading-6 text-[#713642] sm:text-[13px]">
              Ante una emergencia real en España, llama al <a href="tel:112" className="cpnp-focus rounded font-extrabold underline decoration-[#A42135]/35 underline-offset-2">112</a>. En el entorno del Reino, el <strong>99</strong> figura como número interno, si está habilitado.
            </p>
          </section>

          {/* HERO / TRÁMITES */}
          <section id="tramites" aria-labelledby="tramites-heading" className="cpnp-hero scroll-mt-24 px-5 py-9 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
            <div className="pointer-events-none absolute -right-10 -top-16 hidden h-80 w-80 rounded-full border border-white/10 sm:block" aria-hidden="true" />
            <div className="pointer-events-none absolute bottom-0 right-0 hidden h-full w-[45%] items-center justify-center opacity-[.085] lg:flex" aria-hidden="true">
              <img src="/Policía/POLNAC.png" alt="" className="h-72 max-h-full w-72 object-contain" />
            </div>
            <div className="relative z-10 max-w-[680px]">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[.15em] text-white/90 backdrop-blur-xl">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Servicio de identificación
              </span>
              <h1 id="tramites-heading" className="cpnp-type mt-5 text-[clamp(2.5rem,6vw,5.2rem)] font-bold leading-[1.03] tracking-[-.03em]">DPI</h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/85 sm:text-base">
                Es obligatorio para todos los ciudadanos del Reino portar su acreditación vigente. Realiza tu solicitud de manera segura o recupera un documento existente.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a href="/dpi/create" className="cpnp-action cpnp-action-primary cpnp-focus">
                  <FilePlus2 className="h-5 w-5" aria-hidden="true" /> Solicitar DPI <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <a href="/dpi/restore" className="cpnp-action cpnp-action-secondary cpnp-focus">
                  <RotateCcw className="h-5 w-5" aria-hidden="true" /> Recuperar DPI
                </a>
              </div>
              <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-white/65"><LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" /> Trámites disponibles desde móvil, tablet y ordenador.</p>
            </div>
          </section>

          {/* Accesos rápidos */}
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { href: "#tramites", icon: Fingerprint, title: "Identificación", subtitle: "Solicitud y recuperación" },
              { href: "#actualidad", icon: Newspaper, title: "Comunicados", subtitle: "Información institucional" },
              { href: "#registro", icon: Scale, title: "Registro judicial", subtitle: "Cifras publicadas" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <a key={item.href} href={item.href} className="cpnp-glass cpnp-surface cpnp-focus group flex min-w-0 items-center gap-3 px-4 py-4 transition-transform hover:-translate-y-0.5 sm:gap-3 sm:px-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-[#011E64]/[.07] text-[#011E64]"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1"><strong className="block text-[13px] leading-5 text-[#18274E]">{item.title}</strong><span className="block text-[11px] leading-5 text-[#6A7185]">{item.subtitle}</span></span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#630B57]/55 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </a>
              );
            })}
          </div>

          {/* Noticias y registro: el grid solo se divide cuando existe espacio suficiente. */}
          <div className="mt-12 grid min-w-0 items-start gap-8 lg:mt-16 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)] lg:gap-7 xl:gap-9">
            <section id="actualidad" aria-labelledby="actualidad-heading" className="min-w-0 scroll-mt-24">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <span className="cpnp-tag"><BookOpenText className="h-3.5 w-3.5" aria-hidden="true" /> Comunicación oficial</span>
                  <h2 id="actualidad-heading" className="cpnp-type mt-3 text-2xl font-bold leading-tight text-[#011E64] sm:text-3xl">Actualidad y notas de prensa</h2>
                </div>
                <span className="text-xs font-semibold text-[#69748A]">{NOTICIAS.length} comunicados</span>
              </div>
              <div className="grid gap-4">
                {NOTICIAS.map((noticia, index) => (
                  <article key={noticia.titulo} className="cpnp-glass cpnp-surface cpnp-news p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <span className="cpnp-tag">{noticia.categoria}</span>
                      <span className="text-[11px] font-bold text-[#A1A2B6]">{String(index + 1).padStart(2, '0')}</span>
                    </div>
                    <h3 className="mt-4 text-base font-bold leading-snug text-[#17264B] sm:text-lg">{noticia.titulo}</h3>
                    <p className="mt-2.5 text-[13px] leading-7 text-[#546078] sm:text-sm">{noticia.descripcion}</p>
                  </article>
                ))}
              </div>
            </section>

            <section id="registro" aria-labelledby="registro-heading" className="min-w-0 scroll-mt-24">
              <div className="mb-5">
                <span className="cpnp-tag"><BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> Estadísticas del portal</span>
                <h2 id="registro-heading" className="cpnp-type mt-3 text-2xl font-bold leading-tight text-[#011E64] sm:text-3xl">Registro judicial</h2>
              </div>
              <div className="cpnp-glass cpnp-surface min-w-0 p-5 sm:p-6">
                <div className="rounded-[19px] bg-gradient-to-br from-[#011E64] to-[#4B1256] px-5 py-6 text-white">
                  <p className="text-[11px] font-bold uppercase tracking-[.13em] text-white/65">Detenidos totales · registro publicado</p>
                  <p className="mt-2 text-4xl font-extrabold tracking-[-.035em] tabular-nums sm:text-5xl">{TOTAL.toLocaleString('es-ES')}</p>
                  <p className="mt-2 text-[11px] text-white/65">Cifra fija del contenido original; no corresponde a una consulta en tiempo real.</p>
                </div>
                <div className="mt-7 space-y-5">
                  {REGISTRO.map((dato) => (
                    <div key={dato.nombre}>
                      <div className="mb-2 flex items-start justify-between gap-3 text-[12px] sm:text-[13px]">
                        <span className="min-w-0 font-semibold text-[#43516B]">{dato.nombre}</span>
                        <strong className="shrink-0 font-bold tabular-nums text-[#011E64]">{dato.cantidad.toLocaleString('es-ES')}</strong>
                      </div>
                      <div className="cpnp-track" role="meter" aria-label={dato.nombre} aria-valuemin={0} aria-valuemax={MAXIMO} aria-valuenow={dato.cantidad}>
                        <div className="cpnp-fill" style={{ width: `${(dato.cantidad / MAXIMO) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-7 flex items-start gap-2.5 border-t border-[#011E64]/10 pt-5 text-[11px] leading-5 text-[#68728A]">
                  <Scale className="mt-0.5 h-4 w-4 shrink-0 text-[#630B57]" aria-hidden="true" />
                  <span>Datos atribuidos al <strong className="text-[#011E64]">Ministerio de Desregulación y Pokémon</strong>. Las barras representan cada cifra respecto a la categoría con mayor valor.</span>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-10 flex flex-col gap-3 rounded-[20px] border border-[#011E64]/10 bg-white/50 px-5 py-4 text-xs leading-6 text-[#697187] sm:flex-row sm:items-center sm:justify-between">
            <span>CPNP · Policía Nacional del Pan · Servicio institucional</span>
            <a href="/" className="cpnp-focus inline-flex items-center gap-1.5 self-start rounded-md font-bold text-[#630B57] hover:underline sm:self-auto">Portal principal <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
