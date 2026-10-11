import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

/**
 * Términos y Condiciones · Artis Panis
 * Rediseño visual Liquid Glass · #630B57.
 * Mantiene íntegramente el contenido legal de la versión proporcionada.
 */
export default function Terms() {
  const [indexOpen, setIndexOpen] = useState(false);
  const goBack = () => {
    if (window.history.length > 1) window.history.back();
    else window.location.assign("/");
  };

  return (
    <div className="terms-page flex min-h-screen flex-col overflow-x-clip text-[#322630] antialiased selection:bg-[#A6659D]/25">
      <style>{`
        .terms-page {
          background: radial-gradient(ellipse 900px 500px at 92% 8%,rgba(166,101,157,.17),transparent 70%),
            radial-gradient(ellipse 700px 580px at 0% 45%,rgba(99,11,87,.075),transparent 76%),
            linear-gradient(160deg,#FEFCFE 0%,#F9F4F8 48%,#F5EDF4 100%);
        }
        .terms-glass {
          position:relative; isolation:isolate;
          border:1px solid rgba(255,255,255,.87);
          background:linear-gradient(138deg,rgba(255,255,255,.89),rgba(255,255,255,.70) 52%,rgba(252,242,250,.75));
          box-shadow:inset 0 1.5px 0 rgba(255,255,255,.98),inset 0 -1px 0 rgba(99,11,87,.035),
            0 10px 32px -16px rgba(67,15,62,.15),0 2px 7px rgba(67,15,62,.035);
          -webkit-backdrop-filter:blur(24px) saturate(160%);
          backdrop-filter:blur(24px) saturate(160%);
        }
        .terms-glass::before { content:"";position:absolute;inset:1px;border-radius:inherit;
          background:linear-gradient(165deg,rgba(255,255,255,.33),transparent 36%);
          pointer-events:none;z-index:-1; }
        .terms-section { transition:box-shadow .25s ease,border-color .25s ease,transform .25s ease; }
        .terms-section:hover { border-color:rgba(166,101,157,.28);
          box-shadow:inset 0 1.5px 0 rgba(255,255,255,1),0 16px 40px -20px rgba(67,15,62,.22); }
        .terms-section-title { font-family:var(--display-font,inherit); overflow-wrap:anywhere; }
        .terms-section p { line-height:1.85; }
        .terms-section a:focus-visible,.terms-toc-link:focus-visible,.terms-mobile-link:focus-visible,
        .terms-page button:focus-visible { outline:3px solid #A6659D;outline-offset:3px; }
        .terms-toc-link,.terms-mobile-link { display:flex; align-items:center; gap:12px;
          border-radius:14px;padding:11px 12px;font-size:12px;font-weight:650;color:#654B60;
          transition:background .2s,color .2s,transform .2s; }
        .terms-toc-link:hover,.terms-mobile-link:hover {background:rgba(99,11,87,.085);color:#630B57;}
        .terms-toc-num {font-family:ui-monospace,SFMono-Regular,monospace;font-size:10px;font-weight:700;
          color:#9D6394;flex-shrink:0;}
        .terms-index-chevron {transition:transform .2s ease;}
        @media (prefers-reduced-motion:reduce) {
          .terms-page *,.terms-page *::before,.terms-page *::after {transition-duration:.01ms!important;animation-duration:.01ms!important;scroll-behavior:auto!important;}
        }
        @media (max-width:640px) {
          .terms-section p {line-height:1.75;}
          .terms-section ul li {min-width:0;}
        }
      `}</style>
      <Header />

      <main id="contenido-principal" className="relative flex-1 px-3 pb-16 pt-7 sm:px-6 sm:pb-24 sm:pt-12 lg:pt-16">
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-2 h-44 w-[min(90vw,900px)] -translate-x-1/2 rounded-full bg-[#B787B0]/15 blur-[85px]" />
        <div className="relative mx-auto w-full max-w-[1180px]">
          <div className="mb-5 flex items-center justify-between gap-4 sm:mb-7">
            <button type="button" onClick={goBack}
              className="inline-flex min-h-11 items-center gap-2.5 rounded-full border border-white/90 bg-white/70 px-4 text-xs font-bold uppercase tracking-[.11em] text-[#633A5D] shadow-[0_3px_15px_rgba(99,11,87,.06)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_7px_19px_rgba(99,11,87,.12)]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true"><path d="m12 19-7-7 7-7M5 12h14" /></svg>
              Volver
            </button>
            <span className="hidden sm:inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.20em] text-[#8E6A87]">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#630B57]" /> Marco legal
            </span>
          </div>

          <div className="terms-glass relative mb-7 overflow-hidden rounded-[28px] px-5 py-8 sm:mb-9 sm:rounded-[36px] sm:px-10 sm:py-12 lg:px-12">
            <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#A6659D]/15 blur-3xl" />
            <div className="relative z-10">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#630B57]/10 bg-[#630B57]/[.055] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.22em] text-[#630B57]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#630B57]" /> Artis Panis · Normativa
              </p>
              <h1 className="max-w-4xl text-[clamp(2rem,5vw,3.75rem)] leading-[1.12] tracking-[-.035em] text-[#48113F]">
                Términos y condiciones
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#6D5868] sm:text-base">
                Condiciones de uso del sitio, solicitud de DPI, verificación y responsabilidades de la plataforma.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-[#630B57]/10 pt-5">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/65 px-3.5 py-2 text-[11px] font-semibold text-[#6C5266]">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#8C4380]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>
                  Última actualización: 21 de junio de 2026
                </span>
                <span className="text-[11px] font-medium text-[#806C7A]">12 apartados</span>
              </div>
            </div>
          </div>

          {/* Índice móvil/tablet. En escritorio se presenta en columna lateral. */}
          <div className="terms-glass mb-6 rounded-[24px] p-2 lg:hidden">
            <button type="button" aria-expanded={indexOpen} aria-controls="terms-mobile-index"
              onClick={() => setIndexOpen(x => !x)}
              className="flex min-h-12 w-full items-center justify-between rounded-[18px] px-4 text-left text-sm font-semibold text-[#57114E] hover:bg-[#630B57]/[.045]">
              <span className="flex items-center gap-2.5"><svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg> Índice de contenidos</span>
              <svg viewBox="0 0 24 24" className={`terms-index-chevron h-4 w-4 ${indexOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            {indexOpen && (
              <nav id="terms-mobile-index" aria-label="Índice de términos" className="grid grid-cols-1 gap-0.5 px-1 pb-2 sm:grid-cols-2">
                <a key="aceptacion" href="#aceptacion" onClick={() => setIndexOpen(false)} className="terms-mobile-link"><span className="terms-toc-num">01</span><span>Aceptación</span><span aria-hidden="true" className="ml-auto">↗</span></a>
                <a key="uso-del-sitio" href="#uso-del-sitio" onClick={() => setIndexOpen(false)} className="terms-mobile-link"><span className="terms-toc-num">02</span><span>Uso del sitio</span><span aria-hidden="true" className="ml-auto">↗</span></a>
                <a key="solicitud-dpi" href="#solicitud-dpi" onClick={() => setIndexOpen(false)} className="terms-mobile-link"><span className="terms-toc-num">03</span><span>Solicitud de DPI</span><span aria-hidden="true" className="ml-auto">↗</span></a>
                <a key="normas-contenido" href="#normas-contenido" onClick={() => setIndexOpen(false)} className="terms-mobile-link"><span className="terms-toc-num">04</span><span>Nombres y contenido</span><span aria-hidden="true" className="ml-auto">↗</span></a>
                <a key="foto-firma" href="#foto-firma" onClick={() => setIndexOpen(false)} className="terms-mobile-link"><span className="terms-toc-num">05</span><span>Foto y firma</span><span aria-hidden="true" className="ml-auto">↗</span></a>
                <a key="verificacion-discord" href="#verificacion-discord" onClick={() => setIndexOpen(false)} className="terms-mobile-link"><span className="terms-toc-num">06</span><span>Verificación en Discord</span><span aria-hidden="true" className="ml-auto">↗</span></a>
                <a key="validez-dpi" href="#validez-dpi" onClick={() => setIndexOpen(false)} className="terms-mobile-link"><span className="terms-toc-num">07</span><span>Validez del DPI</span><span aria-hidden="true" className="ml-auto">↗</span></a>
                <a key="conducta" href="#conducta" onClick={() => setIndexOpen(false)} className="terms-mobile-link"><span className="terms-toc-num">08</span><span>Conducta</span><span aria-hidden="true" className="ml-auto">↗</span></a>
                <a key="responsabilidad" href="#responsabilidad" onClick={() => setIndexOpen(false)} className="terms-mobile-link"><span className="terms-toc-num">09</span><span>Responsabilidad</span><span aria-hidden="true" className="ml-auto">↗</span></a>
                <a key="enlaces-externos" href="#enlaces-externos" onClick={() => setIndexOpen(false)} className="terms-mobile-link"><span className="terms-toc-num">10</span><span>Enlaces externos</span><span aria-hidden="true" className="ml-auto">↗</span></a>
                <a key="modificaciones" href="#modificaciones" onClick={() => setIndexOpen(false)} className="terms-mobile-link"><span className="terms-toc-num">11</span><span>Modificaciones</span><span aria-hidden="true" className="ml-auto">↗</span></a>
                <a key="contacto" href="#contacto" onClick={() => setIndexOpen(false)} className="terms-mobile-link"><span className="terms-toc-num">12</span><span>Contacto</span><span aria-hidden="true" className="ml-auto">↗</span></a>
              </nav>
            )}
          </div>

          <div className="grid min-w-0 grid-cols-1 items-start gap-7 lg:grid-cols-[242px_minmax(0,1fr)] lg:gap-9 xl:gap-12">
            <aside className="hidden lg:block">
              <nav aria-label="Índice de términos" className="terms-glass sticky top-28 rounded-[27px] p-3">
                <p className="px-3 pb-3 pt-2 text-[10px] font-bold uppercase tracking-[.23em] text-[#9A6991]">Contenido</p>
                <div className="space-y-0.5">
              <a href="#aceptacion" className="terms-toc-link"><span className="terms-toc-num">01</span><span>Aceptación</span></a>
              <a href="#uso-del-sitio" className="terms-toc-link"><span className="terms-toc-num">02</span><span>Uso del sitio</span></a>
              <a href="#solicitud-dpi" className="terms-toc-link"><span className="terms-toc-num">03</span><span>Solicitud de DPI</span></a>
              <a href="#normas-contenido" className="terms-toc-link"><span className="terms-toc-num">04</span><span>Nombres y contenido</span></a>
              <a href="#foto-firma" className="terms-toc-link"><span className="terms-toc-num">05</span><span>Foto y firma</span></a>
              <a href="#verificacion-discord" className="terms-toc-link"><span className="terms-toc-num">06</span><span>Verificación en Discord</span></a>
              <a href="#validez-dpi" className="terms-toc-link"><span className="terms-toc-num">07</span><span>Validez del DPI</span></a>
              <a href="#conducta" className="terms-toc-link"><span className="terms-toc-num">08</span><span>Conducta</span></a>
              <a href="#responsabilidad" className="terms-toc-link"><span className="terms-toc-num">09</span><span>Responsabilidad</span></a>
              <a href="#enlaces-externos" className="terms-toc-link"><span className="terms-toc-num">10</span><span>Enlaces externos</span></a>
              <a href="#modificaciones" className="terms-toc-link"><span className="terms-toc-num">11</span><span>Modificaciones</span></a>
              <a href="#contacto" className="terms-toc-link"><span className="terms-toc-num">12</span><span>Contacto</span></a>
                </div>
              </nav>
            </aside>

            <div className="min-w-0 space-y-5 sm:space-y-6">
<section id="aceptacion" aria-labelledby="title-aceptacion" className="terms-glass terms-section scroll-mt-28 sm:scroll-mt-32 rounded-[26px] sm:rounded-[32px] px-5 py-7 sm:px-9 sm:py-9">

              <h2 id="title-aceptacion" className="terms-section-title mb-5 text-xl sm:text-2xl font-semibold tracking-tight text-[#34152F]">

                1. Aceptación de Términos

              </h2>

              <p>

                Al acceder y utilizar el sitio web del Reino del Pan, aceptas cumplir con estos términos y condiciones en su totalidad. Si no estás de acuerdo con alguna parte, debes abstenerte de usar este sitio y sus servicios.

              </p>

            </section>

<section id="uso-del-sitio" aria-labelledby="title-uso-del-sitio" className="terms-glass terms-section scroll-mt-28 sm:scroll-mt-32 rounded-[26px] sm:rounded-[32px] px-5 py-7 sm:px-9 sm:py-9">

              <h2 id="title-uso-del-sitio" className="terms-section-title mb-5 text-xl sm:text-2xl font-semibold tracking-tight text-[#34152F]">

                2. Uso del Sitio

              </h2>

              <p className="mb-4">

                El sitio web del Reino del Pan es de uso personal e informativo. Queda expresamente prohibido:

              </p>

              <ul className="space-y-3 pl-0 text-[#4B3B49]">

                <li className="flex items-start gap-2.5">

                  <span className="text-[#8B367D] font-bold mt-0.5">•</span>

                  <span>El uso automatizado, masivo o mediante bots para generar solicitudes de DPI.</span>

                </li>

                <li className="flex items-start gap-2.5">

                  <span className="text-[#8B367D] font-bold mt-0.5">•</span>

                  <span>Cualquier intento de manipular, alterar o explotar el sistema de numeración de DPIs.</span>

                </li>

                <li className="flex items-start gap-2.5">

                  <span className="text-[#8B367D] font-bold mt-0.5">•</span>

                  <span>El uso malicioso orientado a saturar, degradar o comprometer el servicio.</span>

                </li>

                <li className="flex items-start gap-2.5">

                  <span className="text-[#8B367D] font-bold mt-0.5">•</span>

                  <span>Intentar acceder a datos de otros ciudadanos sin autorización.</span>

                </li>

              </ul>

            </section>

<section id="solicitud-dpi" aria-labelledby="title-solicitud-dpi" className="terms-glass terms-section scroll-mt-28 sm:scroll-mt-32 rounded-[26px] sm:rounded-[32px] px-5 py-7 sm:px-9 sm:py-9">

              <h2 id="title-solicitud-dpi" className="terms-section-title mb-5 text-xl sm:text-2xl font-semibold tracking-tight text-[#34152F]">

                3. Solicitud de DPI

              </h2>

              <p className="mb-4">

                Al solicitar el Documento Personal de Identidad (DPI), el usuario confirma que toda la información proporcionada es verídica y cumple con las normas del Reino del Pan.

              </p>



              {/* Alerta de Límites de IP */}

              <div className="my-6 rounded-[22px] border border-[#A6659D]/25 bg-[#F8ECF5]/85 p-4 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">

                <p className="font-bold text-[#630B57] mb-4 text-xs uppercase tracking-wider">

                  Límites automáticos por dirección IP:

                </p>

                <ul className="space-y-3 text-[13px] sm:text-sm text-[#362A35] font-medium">

                  <li className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-[#630B57]/10 pb-3">

                    <span>Hasta 5 DPIs por IP</span>

                    <span className="text-emerald-500 font-semibold">Uso normal permitido</span>

                  </li>

                  <li className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-[#630B57]/10 pb-3">

                    <span>A partir de 5 DPIs</span>

                    <span className="text-amber-500 font-semibold">Bloqueo temporal de 24 horas</span>

                  </li>

                  <li className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between pt-0.5">

                    <span>A partir de 10 DPIs</span>

                    <span className="text-rose-700 font-semibold">Bloqueo de 7 días</span>

                  </li>

                </ul>

              </div>



              <p>

                Cada número de DPI es único e irrepetible, generado de forma atómica para garantizar que no existan duplicados aunque haya múltiples solicitudes simultáneas.

              </p>

            </section>

<section id="normas-contenido" aria-labelledby="title-normas-contenido" className="terms-glass terms-section scroll-mt-28 sm:scroll-mt-32 rounded-[26px] sm:rounded-[32px] px-5 py-7 sm:px-9 sm:py-9">

              <h2 id="title-normas-contenido" className="terms-section-title mb-5 text-xl sm:text-2xl font-semibold tracking-tight text-[#34152F]">

                4. Normas de Nombres, Imágenes y Contenido

              </h2>

              <p className="mb-4">

                Los nombres, apellidos, fotos y firmas deben cumplir criterios de integridad y formato. No se permiten nombres ofensivos, discriminatorios, inapropiados o destinados a generar confusión.

              </p>



              <div className="rounded-[22px] border border-white/80 bg-white/55 p-4 sm:p-6 space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">

                <p className="text-xs font-bold uppercase tracking-wider text-[#795A74]">

                  Normas estrictas de formato:

                </p>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs md:text-sm text-[#594954]">

                  <li className="flex items-center gap-2">• Solo letras (con acentos y ñ) y espacios</li>

                  <li className="flex items-center gap-2">• Mínimo 2 letras válidas</li>

                  <li className="flex items-center gap-2">• Máx 2 palabras en nombre / 4 en apellidos</li>

                  <li className="flex items-center gap-2">• Sin espacios al inicio ni al final</li>

                  <li className="flex items-center gap-2">• Nombre: máx. 20 caracteres</li>

                  <li className="flex items-center gap-2">• Apellidos: máx. 30 caracteres</li>

                </ul>

              </div>

              <p className="mt-4 text-xs font-semibold text-rose-700/85">

                * El incumplimiento de estas normas resultará en el rechazo automático de la solicitud.

              </p>

            </section>

<section id="foto-firma" aria-labelledby="title-foto-firma" className="terms-glass terms-section scroll-mt-28 sm:scroll-mt-32 rounded-[26px] sm:rounded-[32px] px-5 py-7 sm:px-9 sm:py-9">

              <h2 id="title-foto-firma" className="terms-section-title mb-5 text-xl sm:text-2xl font-semibold tracking-tight text-[#34152F]">

                5. Foto y Firma

              </h2>

              <p className="mb-3">

                La foto de perfil y la firma manuscrita se procesan y renderizan íntegramente en el navegador del usuario. Estos datos <strong className="text-[#630B57] border-b border-[#A6659D]/40 font-semibold">no se transmiten ni se almacenan</strong> en ningún servidor del Reino del Pan.

              </p>

              <p>

                Como consecuencia, en caso de recuperación de un DPI, la foto y la firma no podrán ser regeneradas. El documento recuperado mostrará los datos textuales y el código QR, pero sin imagen ni firma original.

              </p>

            </section>

<section id="verificacion-discord" aria-labelledby="title-verificacion-discord" className="terms-glass terms-section scroll-mt-28 sm:scroll-mt-32 rounded-[26px] sm:rounded-[32px] px-5 py-7 sm:px-9 sm:py-9">

              <h2 id="title-verificacion-discord" className="terms-section-title mb-5 text-xl sm:text-2xl font-semibold tracking-tight text-[#34152F]">

                6. Verificación en Discord

              </h2>

              <p className="mb-3">

                El Reino del Pan dispone de un bot oficial en su servidor de Discord que permite verificar la ciudadanía mediante el DPI. Al verificarse, el usuario acepta que su ID y nombre de usuario de Discord queden vinculados a su número de DPI en la base de datos del Reino.

              </p>

              <p>

                Cada DPI solo puede estar vinculado a una cuenta de Discord, y cada cuenta de Discord solo puede verificarse con un DPI. Cualquier intento de usar el mismo DPI desde cuentas distintas será rechazado automáticamente.

              </p>

            </section>

<section id="validez-dpi" aria-labelledby="title-validez-dpi" className="terms-glass terms-section scroll-mt-28 sm:scroll-mt-32 rounded-[26px] sm:rounded-[32px] px-5 py-7 sm:px-9 sm:py-9">

              <h2 id="title-validez-dpi" className="terms-section-title mb-5 text-xl sm:text-2xl font-semibold tracking-tight text-[#34152F]">

                7. Validez y Caducidad del DPI

              </h2>

              <p className="mb-4">

                Todo DPI generado en la plataforma del Reino del Pan debe ser verificado en el servidor oficial de Discord en un plazo máximo de <strong className="text-[#4E2048] font-semibold">30 días naturales</strong> desde su creación.

              </p>



              {/* Alerta Destructive / Caducidad */}

              <div className="my-6 p-4 rounded-xl border border-destructive/20 bg-rose-600/5 text-sm">

                Transcurrido ese período sin haberse completado la verificación mediante el bot oficial, el DPI <strong className="text-rose-700 font-bold uppercase tracking-wide">perderá toda validez legal</strong> y será automáticamente eliminado de la base de datos del Reino. El número de DPI quedará liberado y no podrá ser recuperado.

              </div>



              <p className="mb-4">

                La gestión de este proceso, así como la definición de las normativas asociadas, corresponde al <strong className="text-[#4E2048] font-semibold">Ministerio de Transformación Digital</strong>, que podrá consultar en su sitio oficial:

              </p>



              <div className="space-y-3 text-sm bg-white/55 border border-white/80 p-4 sm:p-5 rounded-[22px] font-medium">

                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">

                  <span className="text-[#79677A] text-xs uppercase tracking-wider self-start sm:self-center">Web del Ministerio:</span>

                  <a

                    href="https://mitd.duckdns.org"

                    target="_blank"

                    rel="noopener noreferrer"

                    className="break-all text-[#630B57] underline underline-offset-4 hover:text-[#9A438E] transition"

                  >

                    https://mitd.duckdns.org

                  </a>

                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 pt-2 border-t border-border/40">

                  <span className="text-[#79677A] text-xs uppercase tracking-wider self-start sm:self-center">Normativas y disposiciones:</span>

                  <a

                    href="https://mitd.duckdns.org/normativas"

                    target="_blank"

                    rel="noopener noreferrer"

                    className="break-all text-[#630B57] underline underline-offset-4 hover:text-[#9A438E] transition"

                  >

                    https://mitd.duckdns.org/normativas

                  </a>

                </div>

              </div>



              <p className="mt-4 text-[#79677A] text-xs italic">

                El Ministerio se reserva el derecho de modificar los plazos o condiciones mediante disposiciones publicadas en su portal.

              </p>

            </section>

<section id="conducta" aria-labelledby="title-conducta" className="terms-glass terms-section scroll-mt-28 sm:scroll-mt-32 rounded-[26px] sm:rounded-[32px] px-5 py-7 sm:px-9 sm:py-9">

              <h2 id="title-conducta" className="terms-section-title mb-5 text-xl sm:text-2xl font-semibold tracking-tight text-[#34152F]">

                8. Conducta del Usuario

              </h2>

              <p className="mb-4">

                El uso de datos ofensivos, imágenes inapropiadas o firmas malintencionadas resultará en sanciones. Dependiendo de la gravedad, estas pueden incluir:

              </p>

              <ul className="space-y-3 pl-0 text-[#4B3B49] text-sm">

                <li className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-600" /> Rechazo inmediato del DPI.</li>

                <li className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-600" /> Eliminación del registro asociado en la base de datos.</li>

                <li className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-600" /> Bloqueo temporal o permanente del acceso a la plataforma.</li>

                <li className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-600" /> Expulsión del servidor de Discord del Reino del Pan.</li>

              </ul>

            </section>

<section id="responsabilidad" aria-labelledby="title-responsabilidad" className="terms-glass terms-section scroll-mt-28 sm:scroll-mt-32 rounded-[26px] sm:rounded-[32px] px-5 py-7 sm:px-9 sm:py-9">

              <h2 id="title-responsabilidad" className="terms-section-title mb-5 text-xl sm:text-2xl font-semibold tracking-tight text-[#34152F]">

                9. Responsabilidad

              </h2>

              <p>

                El sistema se proporciona "tal cual", sin garantías de disponibilidad continua ni ausencia de errores. El Reino del Pan no se hace responsable de pérdidas de datos, interrupciones del servicio ni daños derivados del uso o imposibilidad de uso de la plataforma.

              </p>

            </section>

<section id="enlaces-externos" aria-labelledby="title-enlaces-externos" className="terms-glass terms-section scroll-mt-28 sm:scroll-mt-32 rounded-[26px] sm:rounded-[32px] px-5 py-7 sm:px-9 sm:py-9">

              <h2 id="title-enlaces-externos" className="terms-section-title mb-5 text-xl sm:text-2xl font-semibold tracking-tight text-[#34152F]">

                10. Enlaces Externos

              </h2>

              <p>

                El sitio puede contener enlaces a sitios externos. No nos hacemos responsables del contenido, políticas ni prácticas de terceros.

              </p>

            </section>

<section id="modificaciones" aria-labelledby="title-modificaciones" className="terms-glass terms-section scroll-mt-28 sm:scroll-mt-32 rounded-[26px] sm:rounded-[32px] px-5 py-7 sm:px-9 sm:py-9">

              <h2 id="title-modificaciones" className="terms-section-title mb-5 text-xl sm:text-2xl font-semibold tracking-tight text-[#34152F]">

                11. Modificaciones

              </h2>

              <p>

                Estos términos pueden ser modificados en cualquier momento sin previo aviso. El uso continuado del sitio tras cualquier modificación implica la aceptación de los nuevos términos.

              </p>

            </section>

<section id="contacto" aria-labelledby="title-contacto" className="terms-glass terms-section scroll-mt-28 sm:scroll-mt-32 rounded-[26px] sm:rounded-[32px] px-5 py-7 sm:px-9 sm:py-9">

              <h2 id="title-contacto" className="terms-section-title mb-5 text-xl sm:text-2xl font-semibold tracking-tight text-[#34152F]">

                12. Contacto

              </h2>

              <p>

                Para dudas, reclamaciones o solicitudes relacionadas con estos términos, contáctanos mediante nuestro{" "}

                <a

                  href="https://discord.gg/reino-del-pan-1381359904731693056"

                  target="_blank"

                  rel="noopener noreferrer"

                  className="text-[#630B57] underline underline-offset-4 font-semibold hover:text-[#9A438E] transition"

                >

                  servidor oficial de Discord

                </a>.

              </p>

            </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
