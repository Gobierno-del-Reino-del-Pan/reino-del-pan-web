import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, ExternalLink, Megaphone, Menu, X } from "lucide-react";

// Comunicado original de TVP. Se atribuye a la corporación televisiva,
// no al Consejo Superior de Deportes.
const COMUNICADO_TVP =
  'El CSD está en contra de los actos y corruptelas del denominado "monarca". Apoyamos y apoyaremos al gobierno hasta la última gota de sudor, esfuerzo y lágrimas. No lo permitamos. Avanzamos hacia un verdadero cambio. Nos temerán';

const navLinks = [
  { name: "El Consejo", id: "consejo" },
  { name: "Ayudas y Subvenciones", id: "ayudas" },
  { name: "Federaciones", id: "federaciones" },
  { name: "Salud en el Deporte", id: "salud" },
  { name: "Normativa", id: "normativa" },
];

export default function CSD() {
  const [comunicadoOpen, setComunicadoOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // El modal se abre al entrar, bloquea el desplazamiento mientras esté activo,
  // permite cerrarlo con Escape y devuelve el foco al elemento anterior.
  useEffect(() => {
    if (!comunicadoOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setComunicadoOpen(false);
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        )
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [comunicadoOpen]);

  return (
    <div className="csd-page min-h-screen bg-[#FCF9F6] text-slate-900 antialiased">
      <style>{`
        .csd-page { font-family: var(--body-font, Inter, ui-sans-serif, system-ui, sans-serif); }
        .csd-page h1, .csd-page h2, .csd-page h3,
        .csd-announcement, .csd-announcement * { font-size-adjust: none !important; }
        .csd-announcement { font-family: var(--body-font, Inter, ui-sans-serif, system-ui, sans-serif); }
        .csd-announcement-title {
          font-family: var(--body-font, Inter, ui-sans-serif, system-ui, sans-serif) !important;
          font-size: clamp(29px, 5.2vw, 46px) !important;
          font-weight: 600 !important;
          line-height: 1.08 !important;
          letter-spacing: -.035em !important;
          overflow-wrap: break-word;
        }
        .csd-announcement-glass {
          background: linear-gradient(125deg, rgba(27,25,34,.98), rgba(25,18,30,.98) 55%, rgba(49,15,48,.97));
          border: 1px solid rgba(255,255,255,.13);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.13), 0 25px 90px rgba(0,0,0,.5);
          -webkit-backdrop-filter: blur(26px) saturate(145%);
          backdrop-filter: blur(26px) saturate(145%);
        }
        @keyframes csd-dialog-in {
          from { opacity: 0; transform: translateY(16px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .csd-announcement-glass { animation: csd-dialog-in .32s cubic-bezier(.2,.85,.25,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .csd-announcement-glass { animation: none; }
          .csd-page *, .csd-page *::before, .csd-page *::after { scroll-behavior: auto !important; }
        }
      `}</style>

      {/* Identidad naranja del CSD */}
      <div className="h-2 w-full bg-gradient-to-r from-[#DD7F27] via-[#E99221] to-[#FEC722]" />

      <header className="sticky top-0 z-40 border-b border-orange-100/80 bg-white/80 shadow-[0_8px_30px_rgba(72,46,21,.06)] backdrop-blur-2xl">
        <div className="mx-auto flex min-h-[84px] max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label="Volver al portal del Gobierno">
            <img
              src="/LALIGA/CSD.png"
              alt="Logotipo del Consejo Superior de Deportes"
              className="h-12 w-auto max-w-[145px] object-contain transition-transform duration-300 group-hover:scale-[1.03] sm:h-14"
            />
          </Link>

          <nav className="hidden items-center gap-4 xl:flex" aria-label="Navegación del CSD">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="whitespace-nowrap border-b-2 border-transparent py-2 text-[11px] font-bold uppercase tracking-wider text-slate-600 transition-colors hover:border-[#DD7F27] hover:text-[#BD641C] focus-visible:outline-2 focus-visible:outline-[#DD7F27]"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setComunicadoOpen(true)}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#DD7F27]/25 bg-[#FFF4E7] px-3 text-[#9A5118] transition-colors hover:bg-[#FFE8C9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DD7F27] sm:px-4"
              aria-label="Abrir comunicado de TVP"
            >
              <Megaphone className="h-4 w-4" aria-hidden="true" />
              <span className="hidden text-xs font-bold sm:inline">Comunicado</span>
            </button>
            <Link
              href="/"
              className="hidden min-h-10 items-center justify-center rounded-xl bg-[#E99221] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#C9781C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DD7F27] sm:inline-flex"
            >
              Portal Gobierno
            </Link>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-orange-200 bg-white text-[#A76023] xl:hidden"
              aria-label={mobileMenuOpen ? "Cerrar navegación" : "Abrir navegación"}
              aria-expanded={mobileMenuOpen}
              aria-controls="csd-mobile-nav"
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav id="csd-mobile-nav" aria-label="Navegación móvil del CSD" className="border-t border-orange-100 bg-white/95 px-4 py-3 backdrop-blur-xl xl:hidden">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-1 sm:grid-cols-2">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-orange-50 hover:text-[#A76023]"
                >
                  {link.name}
                </a>
              ))}
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-[#9A5118] sm:hidden">
                Portal Gobierno
              </Link>
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-7xl space-y-16 px-4 py-12 sm:space-y-20 sm:px-6 sm:py-16 lg:space-y-24">
        <section id="consejo" className="scroll-mt-36">
          <span className="mb-4 inline-block text-xs font-bold uppercase tracking-[.2em] text-[#B46B23]">Institución deportiva</span>
          <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight sm:text-5xl">El Consejo</h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Somos el órgano rector del deporte en el Reino del Pan. Nuestra misión es fomentar la actividad física y el alto rendimiento desde la transparencia y la excelencia institucional.
          </p>
        </section>

        <section id="ayudas" className="scroll-mt-36 rounded-3xl border border-orange-100 bg-white/75 p-5 shadow-[0_12px_35px_rgba(123,69,24,.05)] backdrop-blur-xl sm:p-8 lg:p-10">
          <h2 className="mb-8 text-2xl font-black leading-tight text-[#B86921] sm:text-3xl">Ayudas y Subvenciones</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-white/85 p-6 shadow-sm">
              <h3 className="mb-2 text-lg font-bold leading-snug">Becas para el Rendimiento</h3>
              <p className="text-sm leading-relaxed text-slate-500">Convocatoria abierta para atletas olímpicos.</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white/85 p-6 shadow-sm">
              <h3 className="mb-2 text-lg font-bold leading-snug">Modernización de Infraestructuras</h3>
              <p className="text-sm leading-relaxed text-slate-500">Fondos para la mejora de centros regionales.</p>
            </div>
          </div>
        </section>

        <section id="federaciones" className="scroll-mt-36">
          <h2 className="mb-8 text-2xl font-black leading-tight sm:text-3xl">Federaciones Deportivas</h2>
          <div className="rounded-r-2xl border-l-4 border-[#E99221] bg-[#FFF7EB] p-6 sm:p-8">
            <p className="italic leading-relaxed text-slate-700">“Coordinación total entre el estamento público y las federaciones nacionales para el éxito conjunto.”</p>
          </div>
        </section>

        <section id="salud" className="scroll-mt-36">
          <h2 className="mb-8 text-2xl font-black leading-tight sm:text-3xl">Salud en el Deporte</h2>
          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4">
            {["Control Antidopaje", "Medicina Deportiva", "Nutrición", "Prevención Lesiones"].map((item) => (
              <div key={item} className="flex min-h-28 items-center justify-center rounded-2xl border border-white/15 bg-slate-900 p-5 text-center font-bold text-white shadow-lg transition-colors hover:bg-[#B86921]">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section id="normativa" className="scroll-mt-36">
          <h2 className="mb-8 text-2xl font-black leading-tight sm:text-3xl">Normativa Jurídica</h2>
          <div className="flex flex-col gap-2 rounded-2xl border border-orange-100 bg-white/80 p-5 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-medium">Ley del Deporte 2026</span>
            <span className="text-xs font-bold text-[#B86921]">PDF pendiente de publicación</span>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 px-6 py-12 text-white sm:py-16">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
          <img src="/LALIGA/CSD.png" alt="Logotipo CSD" className="h-24 w-auto max-w-full brightness-0 invert sm:h-36" loading="lazy" />
          <button
            type="button"
            onClick={() => setComunicadoOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-white/80 transition hover:border-[#FEC722] hover:text-white"
          >
            <Megaphone className="h-4 w-4" aria-hidden="true" /> Consultar comunicado de TVP
          </button>
        </div>
      </footer>

      {/* Comunicado emergente de TVP: no es una declaración propia del CSD. */}
      {comunicadoOpen && (
        <div
          className="csd-announcement fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#08060B]/80 px-3 py-5 backdrop-blur-md sm:px-6"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setComunicadoOpen(false); }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="csd-tvp-dialog-title"
            aria-describedby="csd-tvp-dialog-description"
            className="csd-announcement-glass relative my-auto w-full max-w-[620px] overflow-hidden rounded-[26px] text-white sm:rounded-[32px]"
          >
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#FF4D00] via-[#E99572] to-[#630B57]" />
            <div className="absolute -right-24 -top-32 h-64 w-64 rounded-full bg-[#630B57]/40 blur-[85px]" aria-hidden="true" />

            <div className="relative max-h-[min(88dvh,750px)] overflow-y-auto p-6 sm:p-9">
              <div className="mb-7 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src="/LALIGA/CSD.png" alt="CSD" className="h-9 max-w-[100px] object-contain sm:h-11" />
                  <span className="hidden h-6 w-px bg-white/20 sm:block" aria-hidden="true" />
                  <span className="hidden text-[10px] font-bold uppercase tracking-[.17em] text-white/45 sm:block">Consejo Superior de Deportes</span>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setComunicadoOpen(false)}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/[.06] text-white/75 transition hover:bg-white/[.13] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF8855]"
                  aria-label="Cerrar comunicado"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="mb-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#FF9B6A]">
                <Megaphone className="h-3.5 w-3.5" aria-hidden="true" /> Posicionamiento institucional de TVP
              </div>
              <h2 id="csd-tvp-dialog-title" className="csd-announcement-title mb-5 text-white">
                Comunicado oficial del CSD
              </h2>
              <div className="mb-6 h-px bg-gradient-to-r from-[#FF4D00] via-white/20 to-transparent" />
              <p id="csd-tvp-dialog-description" className="text-[14px] leading-[1.9] text-white/80 sm:text-[15px]">
                {COMUNICADO_TVP}
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[.12em] text-white/35">
                  Consejo Superior de Deportes
                </span>
                <button
                  type="button"
                  onClick={() => setComunicadoOpen(false)}
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#FF733A] to-[#FF4D00] px-7 text-xs font-extrabold uppercase tracking-[.12em] text-[#1C0903] shadow-[0_8px_25px_rgba(255,77,0,.24)] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF8855]"
                >
                  Entendido <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-5 flex items-center justify-center gap-1 text-[10px] text-white/35">
                <ExternalLink className="h-3 w-3" aria-hidden="true" /> Comunicado del CSD mostrado en el portal del CSD
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
