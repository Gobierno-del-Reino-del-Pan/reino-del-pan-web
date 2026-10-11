import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Página de privacidad. El contenido legal original se mantiene íntegro.
const SECTIONS = [
  { id: "introduccion", number: "01", label: "Introducción" },
  { id: "informacion", number: "02", label: "Información que recopilamos" },
  { id: "uso", number: "03", label: "Uso de la información" },
  { id: "seguridad", number: "04", label: "Seguridad" },
  { id: "derechos", number: "05", label: "Tus derechos" },
  { id: "contacto", number: "06", label: "Contacto" },
] as const;

const DATA_ITEMS = [
  "Nombre y apellidos",
  "Género",
  "Fecha de nacimiento",
  "Región de procedencia",
  "Dirección IP en el momento de la solicitud (con fines de auditoría y control de abuso)",
  "Fecha de expedición y validez del documento",
];

const USE_ITEMS = [
  "Emitir y validar el Documento Personal de Identidad (DPI).",
  "Verificar la identidad de los ciudadanos en el servidor de Discord del Reino del Pan.",
  "Prevenir el abuso del sistema (solicitudes masivas, duplicados, suplantación de identidad).",
  "Auditoría interna de seguridad.",
];

function ArrowLeft() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" /><path d="M5 12h14" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="privacy-bullet-list">
      {items.map((item) => (
        <li key={item}>
          <span className="privacy-bullet" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SectionCard({
  id, number, title, children,
}: {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="privacy-section privacy-glass" aria-labelledby={`${id}-title`}>
      <div className="privacy-section-heading">
        <span className="privacy-section-number" aria-hidden="true">{number}</span>
        <h2 id={`${id}-title`}>{title}</h2>
      </div>
      <div className="privacy-prose">{children}</div>
    </section>
  );
}

function SectionLinks({ activeSection }: { activeSection: string }) {
  return (
    <nav aria-label="Apartados de la política de privacidad" className="privacy-index-links">
      {SECTIONS.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className="privacy-index-link"
          aria-current={activeSection === section.id ? "location" : undefined}
        >
          <span className="privacy-index-number">{section.number}</span>
          <span>{section.label}</span>
        </a>
      ))}
    </nav>
  );
}

export default function Privacy() {
  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-110px 0px -55% 0px", threshold: 0 },
    );
    for (const { id } of SECTIONS) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, []);

  const goBack = () => {
    if (window.history.length > 1) window.history.back();
    else window.location.assign("/");
  };

  return (
    <div className="privacy-page min-h-screen flex flex-col text-foreground antialiased">
      <Header />

      <main className="privacy-main flex-1" id="contenido-privacidad">
        <div className="privacy-ambient privacy-ambient-one" aria-hidden="true" />
        <div className="privacy-ambient privacy-ambient-two" aria-hidden="true" />

        <div className="privacy-shell">
          <button type="button" onClick={goBack} className="privacy-back privacy-glass">
            <ArrowLeft />
            <span>Volver</span>
          </button>

          <div className="privacy-hero privacy-glass">
            <div className="privacy-hero-content">
              <span className="privacy-eyebrow"><span className="privacy-eyebrow-dot" /> ARTIS PANIS / TRANSPARENCIA</span>
              <h1>Política de <span>Privacidad</span></h1>
              <hr> </hr>
              <p className="privacy-hero-description">
                Información sobre el tratamiento de datos, la seguridad de la plataforma y tus derechos como usuario.
              </p>
              <div className="privacy-hero-metadata">
                <span className="privacy-metadata-pill">Última actualización: 1 de junio de 2026</span>
                <span className="privacy-metadata-pill">6 apartados</span>
              </div>
            </div>
            <div className="privacy-hero-emblem" aria-hidden="true">
              <div className="privacy-hero-emblem-inner"><ShieldIcon /></div>
            </div>
          </div>

          <div className="privacy-layout">
            <aside className="privacy-sidebar" aria-label="Navegación de la política">
              <div className="privacy-glass privacy-desktop-index">
                <p className="privacy-index-title">En esta página</p>
                <SectionLinks activeSection={activeSection} />
                <div className="privacy-index-footer"><ShieldIcon /><span>Protección y transparencia</span></div>
              </div>
              <details className="privacy-glass privacy-mobile-index">
                <summary><span>Explorar los 6 apartados</span><span className="privacy-summary-chevron" aria-hidden="true">⌄</span></summary>
                <SectionLinks activeSection={activeSection} />
              </details>
            </aside>

            <div className="privacy-articles">
              <SectionCard id="introduccion" number="01" title="Introducción">
                <p>
                  En el Reino del Pan, protegemos tu privacidad y tratamos tus datos personales con el mayor cuidado. Esta política explica qué datos recopilamos, cómo los utilizamos y qué medidas aplicamos para protegerlos.
                </p>
              </SectionCard>

              <SectionCard id="informacion" number="02" title="Información que Recopilamos">
                <p>Al solicitar un DPI, recopilamos y almacenamos en nuestra base de datos los siguientes datos:</p>
                <BulletList items={DATA_ITEMS} />

                <div className="privacy-highlight privacy-highlight-device">
                  <span className="privacy-highlight-icon"><ShieldIcon /></span>
                  <div>
                    <h3>Privacidad Absoluta de Archivos:</h3>
                    <p>Tu foto y tu firma nunca salen de tu dispositivo. La generación del DPI se realiza íntegramente en tu navegador: la imagen se construye localmente y no se envía ni se almacena en ningún servidor.</p>
                  </div>
                </div>

                <p>Si te verificas en nuestro servidor de Discord, también almacenamos tu ID y nombre de usuario de Discord, vinculados a tu número de DPI.</p>
              </SectionCard>

              <SectionCard id="uso" number="03" title="Uso de la Información">
                <p>Los datos recopilados se utilizan exclusivamente para:</p>
                <BulletList items={USE_ITEMS} />

                <div className="privacy-highlight privacy-highlight-promise">
                  <span className="privacy-highlight-icon"><CheckIcon /></span>
                  <p>✓ No compartimos tus datos con terceros ni los utilizamos con fines comerciales o publicitarios.</p>
                </div>
              </SectionCard>

              <SectionCard id="seguridad" number="04" title="Seguridad">
                <p>
                  Implementamos medidas de seguridad técnicas y administrativas para proteger tus datos personales contra accesos no autorizados. Las comunicaciones entre tu dispositivo y nuestros servidores se realizan de forma estrictamente cifrada.
                </p>
              </SectionCard>

              <SectionCard id="derechos" number="05" title="Tus Derechos">
                <p>
                  Tienes derecho a acceder, rectificar o solicitar la eliminación de tus datos personales en cualquier momento. Para ejercer estos derechos de ciudadanía, puedes ponerte en contacto con nosotros a través de nuestros canales oficiales.
                </p>
              </SectionCard>

              <SectionCard id="contacto" number="06" title="Contacto">
                <p>
                  Si tienes preguntas sobre esta política o deseas ejercer tus derechos, contáctanos mediante nuestro{" "}
                  <a href="https://discord.gg/reino-del-pan-1381359904731693056" target="_blank" rel="noopener noreferrer">
                    servidor oficial de Discord<span className="privacy-external" aria-hidden="true">↗</span>
                  </a>.
                </p>
              </SectionCard>

              <a className="privacy-back-to-top" href="#contenido-privacidad">↑ Volver al principio</a>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        .privacy-page { --privacy-purple: #630B57; --privacy-muted: #776474; background: #faf6fa; }
        .privacy-main { position: relative; isolation: isolate; overflow: clip; padding: clamp(26px, 4.5vw, 70px) 16px 90px; }
        .privacy-shell { width: min(100%, 1220px); position: relative; z-index: 1; margin: 0 auto; }
        .privacy-ambient { pointer-events: none; position: absolute; z-index: -1; border-radius: 50%; filter: blur(80px); }
        .privacy-ambient-one { top: -100px; left: -160px; width: 500px; height: 500px; background: rgba(165, 89, 155, .12); }
        .privacy-ambient-two { top: 460px; right: -180px; width: 520px; height: 550px; background: rgba(99, 11, 87, .07); }
        .privacy-glass { border: 1px solid rgba(255,255,255,.95); background: linear-gradient(145deg,rgba(255,255,255,.82),rgba(255,255,255,.53) 60%,rgba(252,244,251,.69)); box-shadow: inset 0 1px 0 rgba(255,255,255,.94), 0 1px 2px rgba(71,23,64,.03), 0 14px 48px rgba(54,13,48,.065); -webkit-backdrop-filter: blur(25px) saturate(160%); backdrop-filter: blur(25px) saturate(160%); }
        .privacy-back { min-height: 42px; padding: 0 17px 0 13px; border-radius: 99px; display: inline-flex; align-items: center; gap: 8px; color: #630B57; font: 750 11px/1 var(--body-font,system-ui); letter-spacing: .1em; text-transform: uppercase; margin-bottom: 24px; transition: transform .2s, box-shadow .2s; cursor: pointer; }
        .privacy-back svg { width: 17px; height: 17px; }
        .privacy-back:hover { transform: translateX(-3px); box-shadow: 0 10px 30px rgba(99,11,87,.13); }
        .privacy-hero { position: relative; overflow: hidden; border-radius: 32px; padding: clamp(25px, 5vw, 59px); margin-bottom: 27px; display: flex; align-items: center; gap: 20px; min-height: 240px; }
        .privacy-hero::after { content: ""; position: absolute; pointer-events: none; width: 360px; height: 260px; right: -80px; top: -160px; border-radius: 50%; background: radial-gradient(circle,rgba(166,101,157,.23),transparent 69%); }
        .privacy-hero-content { position: relative; z-index: 1; min-width: 0; flex: 1; }
        .privacy-eyebrow { display: inline-flex; align-items: center; gap: 9px; font: 800 10px/1.4 var(--body-font,system-ui); letter-spacing: .19em; color: #8b5382; }
        .privacy-eyebrow-dot { width: 7px; height: 7px; background: #9e4e92; border-radius: 99px; box-shadow: 0 0 0 4px rgba(99,11,87,.08); }
        .privacy-hero h1 { font-family: var(--display-font,Georgia,serif); color: #33102f; font-weight: 500; font-size: clamp(34px, 5.1vw, 65px); letter-spacing: -.045em; line-height: 1.05; overflow-wrap: anywhere; margin: 17px 0 12px; }
        .privacy-hero h1 span { color: #630B57; }
        .privacy-hero-description { font-size: clamp(13px,1.4vw,16px); line-height: 1.75; color: #695a67; max-width: 640px; margin: 0; }
        .privacy-hero-metadata { display: flex; flex-wrap: wrap; align-items: center; gap: 9px; margin-top: 23px; }
        .privacy-metadata-pill { display: inline-flex; align-items: center; padding: 9px 13px; border-radius: 99px; background: rgba(99,11,87,.055); color: #6b2a61; border: 1px solid rgba(99,11,87,.07); font: 650 11px/1.35 var(--body-font,system-ui); }
        .privacy-hero-emblem { width: clamp(110px, 17vw, 185px); aspect-ratio: 1; border-radius: 34%; display: grid; place-items: center; background: radial-gradient(circle at 30% 15%,#fff,rgba(220,174,213,.36) 53%,rgba(99,11,87,.08)); border: 1px solid rgba(255,255,255,.85); box-shadow: inset 0 3px 10px #fff, 0 15px 44px rgba(99,11,87,.14); transform: rotate(-8deg); flex-shrink: 0; margin-right: 20px; }
        .privacy-hero-emblem-inner { display: grid; place-items: center; width: 66%; height: 66%; border-radius: 30%; background: linear-gradient(140deg,#9e5393,#630B57); box-shadow: inset 0 2px 2px rgba(255,255,255,.25),0 12px 25px rgba(99,11,87,.25); color: white; }
        .privacy-hero-emblem svg { width: 51%; height: 51%; }
        .privacy-layout { display: grid; grid-template-columns: minmax(205px,260px) minmax(0,1fr); align-items: start; gap: clamp(20px,3vw,34px); }
        .privacy-sidebar { position: sticky; top: 105px; min-width: 0; }
        .privacy-desktop-index { border-radius: 25px; padding: 23px 12px 12px; }
        .privacy-index-title { color: #92758d; text-transform: uppercase; letter-spacing: .18em; font-size: 10px; font-weight: 850; margin: 0 12px 13px; }
        .privacy-index-links { display: flex; flex-direction: column; gap: 3px; }
        .privacy-index-link { display: flex; align-items: center; gap: 12px; padding: 11px 12px; border-radius: 14px; font-size: 12px; font-weight: 650; line-height: 1.4; color: #655561; transition: background .2s, color .2s, box-shadow .2s; }
        .privacy-index-number { color: #ad8ba7; font: 750 10px/1 var(--body-font,system-ui); }
        .privacy-index-link:hover { color: #630B57; background: rgba(99,11,87,.055); }
        .privacy-index-link[aria-current="location"] { color: #630B57; background: rgba(99,11,87,.09); box-shadow: inset 0 0 0 1px rgba(99,11,87,.07); }
        .privacy-index-link[aria-current="location"] .privacy-index-number { color: #630B57; }
        .privacy-index-footer { display: flex; align-items: center; gap: 8px; margin: 17px 10px 3px; border-top: 1px solid rgba(99,11,87,.1); padding-top: 16px; color: #a2899c; font-size: 10px; line-height: 1.4; }
        .privacy-index-footer svg { width: 16px; height: 16px; flex-shrink: 0; }
        .privacy-mobile-index { display: none; }
        .privacy-articles { min-width: 0; display: flex; flex-direction: column; gap: 18px; }
        .privacy-section { border-radius: 27px; padding: clamp(23px,3.5vw,40px); scroll-margin-top: 115px; }
        .privacy-section-heading { display: flex; gap: 17px; align-items: flex-start; padding-bottom: 18px; margin-bottom: 18px; border-bottom: 1px solid rgba(99,11,87,.095); }
        .privacy-section-number { width: 42px; height: 42px; border-radius: 15px; background: rgba(99,11,87,.085); color: #630B57; display: grid; place-items: center; flex: 0 0 42px; font: 800 12px/1 var(--body-font,system-ui); }
        .privacy-section h2 { margin: 4px 0 0; color: #341a31; font-size: clamp(20px,2.25vw,29px); font-family: var(--display-font,Georgia,serif); font-weight: 500; letter-spacing: -.02em; line-height: 1.3; }
        .privacy-prose { color: #554954; font-size: clamp(14px,1.2vw,15px); line-height: 1.92; overflow-wrap: break-word; }
        .privacy-prose p { margin: 0 0 18px; }
        .privacy-prose > :last-child { margin-bottom: 0; }
        .privacy-bullet-list { list-style: none; margin: 4px 0 23px; padding: 0; display: grid; gap: 11px; }
        .privacy-bullet-list li { display: flex; align-items: flex-start; gap: 12px; }
        .privacy-bullet { flex-shrink: 0; width: 7px; height: 7px; border-radius: 50%; background: #a6659d; margin-top: 12px; box-shadow: 0 0 0 4px rgba(166,101,157,.09); }
        .privacy-highlight { border-radius: 20px; display: flex; align-items: flex-start; gap: 14px; padding: 21px; margin: 24px 0; border: 1px solid rgba(99,11,87,.11); background: linear-gradient(120deg,rgba(248,234,246,.83),rgba(255,255,255,.45)); }
        .privacy-highlight-icon { display: grid; place-items: center; flex: 0 0 37px; width: 37px; height: 37px; border-radius: 13px; color: white; background: linear-gradient(145deg,#944389,#630B57); box-shadow: 0 5px 14px rgba(99,11,87,.17); }
        .privacy-highlight-icon svg { width: 19px; height: 19px; }
        .privacy-highlight h3 { color: #630B57; font: 800 11px/1.6 var(--body-font,system-ui); letter-spacing: .12em; text-transform: uppercase; margin: 0 0 6px; }
        .privacy-highlight p { font-size: 13px; font-weight: 550; line-height: 1.75; margin: 0; color: #584250; }
        .privacy-highlight-promise { align-items: center; }
        .privacy-prose a { color: #630B57; font-weight: 750; text-decoration: underline; text-decoration-color: rgba(99,11,87,.4); text-underline-offset: 4px; }
        .privacy-prose a:hover { color: #a6659d; }
        .privacy-external { margin-left: 3px; text-decoration: none; display: inline-block; font-size: .85em; }
        .privacy-back-to-top { align-self: flex-end; color: #630B57; font: 750 11px/1.5 var(--body-font,system-ui); letter-spacing: .1em; text-transform: uppercase; padding: 14px 3px; }
        .privacy-back-to-top:hover { text-decoration: underline; }
        .privacy-page a:focus-visible,.privacy-page button:focus-visible,.privacy-page summary:focus-visible { outline: 3px solid #b879ad; outline-offset: 3px; }
        @media (max-width: 850px) {
          .privacy-layout { grid-template-columns: minmax(0,1fr); gap: 18px; }
          .privacy-sidebar { position: static; }
          .privacy-desktop-index { display: none; }
          .privacy-mobile-index { display: block; border-radius: 19px; padding: 0 12px; }
          .privacy-mobile-index summary { display: flex; justify-content: space-between; align-items: center; cursor: pointer; list-style: none; padding: 17px 9px; font-size: 12px; font-weight: 750; color: #630B57; }
          .privacy-mobile-index summary::-webkit-details-marker { display: none; }
          .privacy-mobile-index[open] .privacy-summary-chevron { transform: rotate(180deg); }
          .privacy-summary-chevron { font-size: 21px; line-height: 1; transition: transform .2s; }
          .privacy-mobile-index .privacy-index-links { border-top: 1px solid rgba(99,11,87,.09); padding: 10px 0 13px; }
          .privacy-mobile-index .privacy-index-link { min-height: 43px; }
        }
        @media (max-width: 580px) {
          .privacy-main { padding: 23px 12px 65px; }
          .privacy-back { margin-bottom: 17px; }
          .privacy-hero { border-radius: 24px; padding: 27px 22px; margin-bottom: 18px; }
          .privacy-hero-emblem { display: none; }
          .privacy-hero h1 { font-size: clamp(32px,8.5vw,43px); }
          .privacy-hero-description { font-size: 13px; }
          .privacy-metadata-pill { font-size: 10px; }
          .privacy-section { border-radius: 23px; padding: 23px 19px; }
          .privacy-section-heading { gap: 12px; }
          .privacy-section-number { width: 37px; height: 37px; border-radius: 12px; flex-basis: 37px; }
          .privacy-section h2 { font-size: 21px; }
          .privacy-highlight { padding: 16px; gap: 11px; }
          .privacy-highlight-icon { flex-basis: 32px; width: 32px; height: 32px; border-radius: 11px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .privacy-page *, .privacy-page *::before, .privacy-page *::after { transition-duration: .01ms !important; animation-duration: .01ms !important; scroll-behavior: auto !important; }
        }
      `}</style>
    </div>
  );
}
