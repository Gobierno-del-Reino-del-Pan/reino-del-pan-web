import { Link } from "wouter";
import { AlertCircle, ArrowLeft, ArrowUpRight, Home, Terminal } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Página 404 · Artis Panis
 * Diseño Liquid Glass responsive, accesible y sin dependencias adicionales.
 * Mantiene la navegación mediante Wouter y la identidad morada #630B57.
 */
export default function NotFound() {
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const };

  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.assign("/");
    }
  };

  return (
    <div className="ap-404 relative isolate flex min-h-[100svh] w-full flex-col overflow-hidden bg-[#F8F5F8] text-[#2A1828] antialiased selection:bg-[#630B57]/20">
      <style>{`
        .ap-404 {
          background:
            radial-gradient(ellipse 70% 48% at 50% -12%, rgba(99,11,87,.13), transparent 76%),
            radial-gradient(ellipse 45% 55% at 103% 85%, rgba(166,101,157,.14), transparent 75%),
            linear-gradient(155deg, #fff 0%, #F8F4F8 52%, #F3EDF3 100%);
        }
        .ap-404-glass {
          background: linear-gradient(135deg, rgba(255,255,255,.83), rgba(255,255,255,.51) 55%, rgba(249,233,246,.68));
          border: 1px solid rgba(255,255,255,.96);
          -webkit-backdrop-filter: blur(30px) saturate(170%);
          backdrop-filter: blur(30px) saturate(170%);
          box-shadow: inset 0 2px 2px rgba(255,255,255,.85), inset 0 -1px 1px rgba(99,11,87,.055), 0 30px 75px -28px rgba(54,19,49,.19), 0 4px 16px rgba(54,19,49,.055);
        }
        .ap-404-glass::before {
          content: ""; position: absolute; inset: 1px; border-radius: inherit; pointer-events: none;
          background: linear-gradient(170deg, rgba(255,255,255,.44), transparent 40%, rgba(99,11,87,.025));
        }
        .ap-404-action {
          background: linear-gradient(145deg, #812676, #630B57 72%, #510747);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.3), 0 12px 28px -8px rgba(99,11,87,.32);
        }
        .ap-404-action:hover { box-shadow: inset 0 1px 0 rgba(255,255,255,.3), 0 16px 34px -8px rgba(99,11,87,.43); }
        .ap-404-action::after {
          content: ""; position: absolute; inset: -40% auto -40% -70%; width: 42%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.23), transparent);
          transform: skewX(-20deg); pointer-events: none;
        }
        .ap-404-action:hover::after { animation: ap404Shine .8s ease-out forwards; }
        .ap-404-strike { text-decoration: line-through; text-decoration-color: #B778AD; text-decoration-thickness: 2px; text-decoration-skip-ink: none; }
        .ap-404-focus:focus-visible { outline: 3px solid #A6659D; outline-offset: 4px; }
        @keyframes ap404Shine { from { left: -70%; } to { left: 140%; } }
        @media (prefers-reduced-motion: reduce) {
          .ap-404 *, .ap-404 *::before, .ap-404 *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
        }
      `}</style>

      {/* Retícula ornamental: permanece detrás de toda la interfaz. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[.46]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(99,11,87,.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,11,87,.055) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
          maskImage: "radial-gradient(ellipse 75% 70% at 50% 48%, black 0%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 75% 70% at 50% 48%, black 0%, transparent 100%)",
        }}
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-[20%] z-0 h-80 w-80 rounded-full bg-[#A6659D]/20 blur-[90px] sm:h-[440px] sm:w-[440px]"
        animate={reduceMotion ? undefined : { x: [0, 28, 0], y: [0, -18, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 bottom-[8%] z-0 h-80 w-80 rounded-full bg-[#630B57]/[.11] blur-[100px] sm:h-[480px] sm:w-[480px]"
        animate={reduceMotion ? undefined : { x: [0, -22, 0], y: [0, 16, 0], scale: [1, 1.13, 1] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Marca ligera; no reutiliza Header para no introducir navegación en un estado de error. */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 pt-4 sm:px-7 sm:pt-7 lg:px-10">
        <Link
          href="/"
          aria-label="Artis Panis: volver al inicio"
          className="ap-404-focus inline-flex min-w-0 items-center gap-3 rounded-2xl px-1 py-1 transition-opacity hover:opacity-80"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[16px] border border-white/90 bg-white/70 shadow-[0_4px_16px_rgba(99,11,87,.1)] backdrop-blur-xl">
            <img src="/logo.png" alt="" className="h-9 w-9 object-contain" />
          </span>
          <span className="flex min-w-0 flex-col gap-1 leading-none">
            <span className="text-[9px] font-bold uppercase tracking-[.25em] text-[#98638F]">Artis Panis</span>
            <span className="whitespace-nowrap text-[11px] font-extrabold uppercase tracking-[.08em] text-[#630B57] sm:text-[12px]">
              <span className="ap-404-strike">Reino del</span> Pan
            </span>
          </span>
        </Link>
        <span className="hidden rounded-full border border-white/90 bg-white/55 px-3 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#815477] shadow-sm backdrop-blur-xl min-[380px]:inline-flex">
          Error 404
        </span>
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-center px-4 py-10 sm:px-7 sm:py-14 lg:px-10 lg:py-20">
        <div className="grid w-full items-center gap-7 sm:gap-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-12 xl:gap-20">
          {/* Identidad 404, sin solapar el contenido ni desbordar en pantallas pequeñas. */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
            className="relative flex min-w-0 flex-col items-center text-center lg:items-start lg:text-left"
          >
            <span className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#630B57]/10 bg-white/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.22em] text-[#805176] backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-[#630B57]" />
              Ruta no encontrada
            </span>
            <div
              aria-hidden="true"
              className="pointer-events-none select-none font-black leading-[.95] tracking-[-.09em] text-transparent"
              style={{
                fontFamily: "var(--body-font, Inter, ui-sans-serif, system-ui)",
                fontSize: "clamp(7.2rem, 24vw, 19rem)",
                backgroundImage: "linear-gradient(148deg, #440A3D 2%, #630B57 48%, #BE84B5 95%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                filter: "drop-shadow(0 18px 25px rgba(99,11,87,.12))",
              }}
            >
              404
            </div>
            <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold tracking-[.13em] text-[#946E8D] sm:text-xs">
              <span className="h-px w-8 bg-[#C7A3BF]" />
              ERROR DE NAVEGACIÓN
              <span className="h-px w-8 bg-[#C7A3BF]" />
            </div>
          </motion.div>

          {/* Panel de vidrio. La información principal siempre tiene contraste suficiente. */}
          <motion.section
            initial={reduceMotion ? false : { opacity: 0, y: 28, scale: .985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...transition, delay: reduceMotion ? 0 : .12 }}
            aria-labelledby="not-found-title"
            className="ap-404-glass relative min-w-0 overflow-hidden rounded-[28px] p-6 sm:rounded-[36px] sm:p-9 lg:p-11 xl:p-14"
          >
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-[10%] top-0 h-[2px] bg-gradient-to-r from-transparent via-[#C795BF]/80 to-transparent" />
            <div className="relative z-10">
              <div className="mb-6 flex flex-wrap items-center gap-2 sm:mb-8">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#630B57]/10 bg-[#630B57]/[.07] text-[#630B57]">
                  <AlertCircle aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#630B57]/10 bg-white/50 px-3 py-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#815075]">
                  <Terminal aria-hidden="true" className="h-3.5 w-3.5" />
                  SYSTEM / ROOT_NULL
                </span>
              </div>

              <h1 id="not-found-title" className="text-[clamp(1.9rem,5vw,3.4rem)] font-semibold leading-[1.12] tracking-[-.045em] text-[#34112E]">
                Enlace <span className="text-[#630B57]">interrumpido.</span>
              </h1>
              <p className="mt-4 max-w-[46ch] text-[14px] leading-[1.8] text-[#705F6B] sm:mt-5 sm:text-[16px]">
                El módulo de red no ha podido indexar la ruta solicitada. La dirección no figura en los registros centrales del{" "}
                <strong className="font-semibold text-[#630B57]">
                  <span className="ap-404-strike">Reino del</span> Pan
                </strong>.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center">
                {/* Wouter Link ya genera el <a>; no se anida otro anchor. */}
                <Link
                  href="/"
                  className="ap-404-action ap-404-focus group relative inline-flex min-h-12 w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl border border-white/25 px-6 py-3.5 text-[12px] font-bold tracking-[.04em] text-white transition-transform duration-300 hover:-translate-y-0.5 active:scale-[.985] sm:w-auto"
                >
                  <Home aria-hidden="true" className="h-4 w-4 shrink-0" />
                  <span>Volver al inicio</span>
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <button
                  type="button"
                  onClick={goBack}
                  className="ap-404-focus inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[#630B57]/15 bg-white/60 px-5 py-3.5 text-[12px] font-bold text-[#630B57] transition-colors hover:bg-white/90 active:scale-[.985] sm:w-auto"
                >
                  <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                  Página anterior
                </button>
              </div>

              <div className="mt-8 flex items-start gap-2.5 border-t border-[#630B57]/10 pt-5 sm:mt-10">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#A6659D]" />
                <p className="text-xs leading-relaxed text-[#887585]">
                  Comprueba la dirección o utiliza el botón de inicio para continuar navegando.
                </p>
              </div>
            </div>
          </motion.section>
        </div>
      </main>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-4 pb-5 sm:px-7 sm:pb-7 lg:px-10">
        <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#967C90]">Artis Panis · Plataforma institucional</p>
        <span className="text-[10px] font-bold tracking-[.2em] text-[#A17D99]">404 / 404</span>
      </div>
    </div>
  );
}
