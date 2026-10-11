import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Cpu,
  ExternalLink,
  Landmark,
  Layers3,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

// Contenido y destinos originales conservados.
const recursos = [
  {
    titulo: "Ministerio de Economía, Comercio y Empresa",
    descripcion: "Portal oficial del Ministerio de Economía, Comercio y Empresa del Reino del Pan.",
    url: "https://mineco.duckdns.org",
    icon: Landmark,
    numero: "01",
    area: "Economía y empresa",
  },
  {
    titulo: "Ministerio de Transformación Digital",
    descripcion:
      "Portal oficial del Ministerio de Transformación Digital del Reino del Pan. Impulsamos la digitalización y el desarrollo de servicios digitales.",
    url: "https://mitd.duckdns.org",
    icon: Cpu,
    numero: "02",
    area: "Innovación y tecnología",
  },
  {
    titulo: "Enciclopan",
    descripcion:
      "La enciclopedia libre y oficial del Reino del Pan. Consulta historia, leyes, cultura y más.",
    url: "https://enciclopan.duckdns.org",
    icon: BookOpen,
    numero: "03",
    area: "Información y documentación",
  },
] as const;

export default function Gobierno() {
  const reduceMotion = useReducedMotion();

  const stagger: Variants = {
    hidden: { opacity: 1 },
    show: {
      opacity: 1,
      transition: { staggerChildren: reduceMotion ? 0 : 0.09 },
    },
  };
  const appear: Variants = {
    hidden: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.55, ease: "easeOut" },
    },
  };

  const goBack = () => {
    if (window.history.length > 1) window.history.back();
    else window.location.assign("/");
  };

  return (
    <div className="gov-page flex min-h-screen flex-col antialiased">
      <Header />

      <main className="gov-main flex-1" id="contenido-gobierno">
        <div className="gov-ambient gov-ambient-a" aria-hidden="true" />
        <div className="gov-ambient gov-ambient-b" aria-hidden="true" />
        <div className="gov-grid" aria-hidden="true" />

        <div className="gov-shell">
          <div className="gov-utility">
            <button type="button" className="gov-back gov-glass" onClick={goBack}>
              <ArrowLeft size={15} strokeWidth={1.8} aria-hidden="true" />
              Volver
            </button>
            <div className="gov-breadcrumb" aria-label="Ruta de navegación">
              <span>Artis Panis</span>
              <span className="gov-breadcrumb-slash">/</span>
              <span aria-current="page">Gobierno</span>
            </div>
          </div>

          {/* Cabecera institucional: evita que la identidad compita con el título. */}
          <motion.section
            className="gov-hero gov-glass"
            aria-labelledby="gov-page-title"
            initial={reduceMotion ? false : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="gov-hero-copy">
              <span className="gov-eyebrow"><span className="gov-eyebrow-dot" /> ARTIS PANIS · GOBIERNO OFICIAL</span>
              <h1 id="gov-page-title">Estructura del <span>Gobierno.</span></h1>
              <p className="gov-lead">
                El Reino del Pan organiza su estructura institucional a través de documentos y referencias oficiales que definen su funcionamiento interno.
              </p>
              <div className="gov-hero-actions">
                <a href="#situacion-institucional" className="gov-primary-action">
                  Conocer la situación <ArrowRight size={16} aria-hidden="true" />
                </a>
                <a href="#recursos-oficiales" className="gov-secondary-action">
                  Explorar recursos <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
            <div className="gov-hero-art" aria-hidden="true">
              <div className="gov-orbit gov-orbit-outer" />
              <div className="gov-orbit gov-orbit-inner" />
              <div className="gov-seal"><Landmark strokeWidth={1.25} /></div>
              <span className="gov-art-word">INSTITUCIONES</span>
            </div>
          </motion.section>

          <motion.div className="gov-content" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.08 }}>
            <motion.section id="situacion-institucional" className="gov-status gov-glass" variants={appear} aria-labelledby="gov-status-title">
              <div className="gov-section-topline">
                <span className="gov-section-kicker"><ShieldAlert size={16} aria-hidden="true" /> ORGANIZACIÓN INSTITUCIONAL</span>
                <span className="gov-status-pill"><span className="gov-status-dot" /> ADMINISTRACIÓN PROVISIONAL</span>
              </div>
              <div className="gov-status-layout">
                <div>
                  <h2 id="gov-status-title">Estado institucional <span>actual</span></h2>
                  <div className="gov-rule" />
                  <p>
                    Actualmente no existe un gobierno formalmente estructurado ni un gabinete en funciones dentro del Reino del Pan. Sin embargo, se mantiene un <strong>gobierno provisional</strong> encargado de la administración y supervisión del orden general.
                  </p>
                  <p>
                    Este se encuentra formado por los <strong>Moderadores y Vigilantes</strong>, quienes velan por el cumplimiento de las leyes y el funcionamiento básico del sistema bajo la autoridad de <strong>Martini</strong>, el actual <strong>Director de Reformas y Coordinador del Estado</strong>.
                  </p>
                </div>
                <aside className="gov-status-aside" aria-label="Resumen de la administración provisional">
                  <div className="gov-aside-icon"><ShieldCheck size={23} strokeWidth={1.6} aria-hidden="true" /></div>
                  <p className="gov-aside-label">RESPONSABLE DE LA COORDINACIÓN</p>
                  <p className="gov-aside-name">Martini</p>
                  <p className="gov-aside-subtitle">Director de Reformas y Coordinador del Estado</p>
                  <div className="gov-aside-divider" />
                  <div className="gov-aside-row"><Check size={15} aria-hidden="true" /><span>Moderadores y Vigilantes</span></div>
                  <div className="gov-aside-row"><Check size={15} aria-hidden="true" /><span>Administración provisional</span></div>
                </aside>
              </div>
            </motion.section>

            <motion.section id="recursos-oficiales" className="gov-resources" variants={appear} aria-labelledby="gov-resources-title">
              <div className="gov-resources-heading">
                <div>
                  <span className="gov-section-kicker"><Layers3 size={16} aria-hidden="true" /> DIRECTORIO INSTITUCIONAL</span>
                  <h2 id="gov-resources-title">Recursos y <span>ministerios oficiales.</span></h2>
                  <p>Accede a los portales de información y servicios del ecosistema institucional.</p>
                </div>
                <span className="gov-resource-count" aria-label="Tres recursos disponibles">03 <span>RECURSOS</span></span>
              </div>
              <div className="gov-resource-grid">
                {recursos.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.a
                      className="gov-resource-card gov-glass"
                      key={item.url}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${item.titulo} (se abre en una pestaña nueva)`}
                      whileHover={reduceMotion ? undefined : { y: -4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="gov-card-top">
                        <span className="gov-card-icon"><Icon size={23} strokeWidth={1.65} aria-hidden="true" /></span>
                        <span className="gov-card-open"><ArrowUpRight size={18} aria-hidden="true" /></span>
                      </div>
                      <div className="gov-card-body">
                        <span className="gov-card-meta">{item.numero} / {item.area}</span>
                        <h3>{item.titulo}</h3>
                        <p>{item.descripcion}</p>
                      </div>
                      <div className="gov-card-bottom">
                        <span>Visitar sitio oficial</span>
                        <ExternalLink size={15} aria-hidden="true" />
                      </div>
                    </motion.a>
                  );
                })}
              </div>
            </motion.section>
          </motion.div>

          <div className="gov-endmark" aria-label="Artis Panis. Reino del Pan">
            <span>ARTIS PANIS</span>
            <span className="gov-endmark-line" />
            <span className="gov-crossed">REINO DEL</span>
            <strong>PAN</strong>
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        .gov-page{--gov-purple:#630B57;--gov-deep:#390633;--gov-soft:#A6659D;--gov-ink:#2E2130;color:var(--gov-ink);background:#F9F6F9}
        .gov-page *, .gov-page *::before, .gov-page *::after{box-sizing:border-box}
        .gov-main{position:relative;isolation:isolate;overflow:hidden;padding:clamp(28px,4.5vw,68px) 16px 90px;background:linear-gradient(140deg,#FCFAFC 3%,#F8F2F8 48%,#F5EFF6 100%)}
        .gov-ambient{position:absolute;z-index:-1;pointer-events:none;border-radius:50%;filter:blur(80px)}
        .gov-ambient-a{width:min(650px,75vw);height:420px;top:-110px;right:-130px;background:rgba(147,63,135,.13)}
        .gov-ambient-b{width:440px;height:500px;top:550px;left:-230px;background:rgba(99,11,87,.065)}
        .gov-grid{position:absolute;z-index:-1;inset:0;opacity:.23;pointer-events:none;background-image:linear-gradient(rgba(99,11,87,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(99,11,87,.055) 1px,transparent 1px);background-size:75px 75px;mask-image:linear-gradient(to bottom,black,transparent 73%)}
        .gov-shell{width:100%;max-width:1180px;margin:0 auto;min-width:0}
        .gov-glass{background:linear-gradient(122deg,rgba(255,255,255,.88),rgba(255,255,255,.61) 55%,rgba(253,245,252,.75));border:1px solid rgba(255,255,255,.92);box-shadow:inset 0 1px 0 rgba(255,255,255,1),0 14px 48px rgba(67,23,65,.075),0 2px 8px rgba(64,22,58,.035);-webkit-backdrop-filter:blur(26px) saturate(150%);backdrop-filter:blur(26px) saturate(150%)}
        .gov-utility{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px}
        .gov-back{display:inline-flex;align-items:center;gap:8px;border-radius:100px;padding:11px 17px;color:#67475F;font-size:12px;font-weight:700;cursor:pointer;transition:background .2s,color .2s,transform .2s}
        .gov-back:hover{background:#F2E6F0;color:var(--gov-purple);transform:translateX(-2px)}
        .gov-breadcrumb{display:flex;align-items:center;gap:9px;font-size:11px;letter-spacing:.07em;text-transform:uppercase;font-weight:700;color:#948192}
        .gov-breadcrumb span:last-child{color:var(--gov-purple)}.gov-breadcrumb-slash{opacity:.45}
        .gov-hero{position:relative;display:grid;grid-template-columns:minmax(0,1.3fr) minmax(245px,.7fr);min-height:375px;align-items:center;gap:24px;overflow:hidden;border-radius:34px;padding:clamp(30px,5vw,72px)}
        .gov-hero::before{content:"";position:absolute;inset:1px;border-radius:inherit;background:linear-gradient(175deg,rgba(255,255,255,.55),transparent 40%);pointer-events:none}
        .gov-hero-copy{position:relative;z-index:2;min-width:0}
        .gov-eyebrow,.gov-section-kicker{display:inline-flex;align-items:center;gap:9px;font-size:10px;letter-spacing:.19em;font-weight:800;color:var(--gov-purple);text-transform:uppercase}
        .gov-eyebrow-dot{width:7px;height:7px;border-radius:50%;background:var(--gov-purple);box-shadow:0 0 0 5px rgba(99,11,87,.09)}
        .gov-hero h1{max-width:650px;margin:19px 0 0;font-family:var(--display-font,serif);font-size:clamp(39px,5.6vw,70px);line-height:1.04;letter-spacing:-.045em;font-weight:500;overflow-wrap:break-word;color:#2E182E}
        .gov-hero h1 span{color:var(--gov-purple)}
        .gov-lead{max-width:580px;margin:22px 0 0;color:#655364;font-size:clamp(14px,1.3vw,16px);line-height:1.85}
        .gov-hero-actions{display:flex;flex-wrap:wrap;gap:11px;margin-top:27px}
        .gov-primary-action,.gov-secondary-action{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:45px;border-radius:999px;padding:12px 19px;font-size:12px;font-weight:750;text-decoration:none;transition:transform .2s,background .2s,box-shadow .2s}
        .gov-primary-action{background:linear-gradient(135deg,#85237A,var(--gov-purple));color:white;box-shadow:0 8px 18px rgba(99,11,87,.19),inset 0 1px 0 rgba(255,255,255,.23)}
        .gov-primary-action:hover{transform:translateY(-2px);box-shadow:0 10px 25px rgba(99,11,87,.26)}
        .gov-secondary-action{border:1px solid rgba(99,11,87,.17);color:var(--gov-purple);background:rgba(255,255,255,.63)}
        .gov-secondary-action:hover{background:rgba(247,231,245,.85);transform:translateY(-2px)}
        .gov-hero-art{position:relative;display:grid;place-items:center;min-height:250px;align-self:stretch;isolation:isolate}
        .gov-hero-art::before{content:"";position:absolute;width:280px;height:280px;max-width:100%;border-radius:50%;background:radial-gradient(circle,rgba(158,92,148,.22),rgba(173,125,167,.07) 55%,transparent 72%);filter:blur(3px);z-index:-1}
        .gov-orbit{position:absolute;aspect-ratio:1;border-radius:50%;border:1px solid rgba(99,11,87,.11)}
        .gov-orbit-outer{width:min(310px,100%);box-shadow:0 0 0 25px rgba(255,255,255,.1)}
        .gov-orbit-inner{width:min(245px,78%);border-style:dashed;border-color:rgba(99,11,87,.16)}
        .gov-seal{display:grid;place-items:center;width:160px;height:160px;max-width:60%;aspect-ratio:1;border-radius:42px;transform:rotate(-9deg);background:linear-gradient(145deg,rgba(255,255,255,.92),rgba(239,216,237,.67));box-shadow:inset 0 2px 3px white,0 20px 55px rgba(99,11,87,.16),0 3px 5px rgba(99,11,87,.06);border:1px solid #fff}
        .gov-seal svg{width:76px;height:76px;max-width:60%;color:var(--gov-purple);transform:rotate(9deg)}
        .gov-art-word{position:absolute;bottom:5px;font-size:9px;font-weight:800;letter-spacing:.32em;color:rgba(99,11,87,.43)}
        .gov-content{display:flex;flex-direction:column;gap:54px;margin-top:32px}
        .gov-status{border-radius:30px;padding:clamp(24px,4vw,46px);scroll-margin-top:115px}
        .gov-section-topline{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}
        .gov-status-pill{display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(166,111,32,.18);border-radius:999px;padding:9px 12px;background:rgba(254,245,227,.7);color:#98681E;font-size:9px;font-weight:800;letter-spacing:.08em}
        .gov-status-dot{width:7px;height:7px;border-radius:50%;background:#CD9339;box-shadow:0 0 0 4px rgba(205,147,57,.14)}
        .gov-status-layout{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(240px,.7fr);gap:clamp(24px,4vw,60px);align-items:start;margin-top:26px}
        .gov-status h2,.gov-resources-heading h2{font-family:var(--display-font,serif);font-weight:500;line-height:1.14;letter-spacing:-.033em;color:#2E182E;font-size:clamp(29px,3.1vw,43px);margin:0}
        .gov-status h2 span,.gov-resources-heading h2 span{color:var(--gov-purple)}
        .gov-rule{width:47px;height:3px;border-radius:999px;background:var(--gov-purple);margin:22px 0}
        .gov-status-layout p{font-size:14px;line-height:1.9;color:#615160;margin:0 0 14px}.gov-status-layout strong{font-weight:800;color:#42223D}
        .gov-status-aside{min-width:0;padding:24px;border-radius:24px;border:1px solid rgba(99,11,87,.09);background:linear-gradient(160deg,rgba(247,235,246,.95),rgba(255,255,255,.54));box-shadow:inset 0 1px 0 #fff}
        .gov-aside-icon{width:43px;height:43px;border-radius:14px;display:grid;place-items:center;background:rgba(99,11,87,.1);color:var(--gov-purple);margin-bottom:17px}
        .gov-status-aside .gov-aside-label{font-size:9px;letter-spacing:.16em;font-weight:800;color:#8E6487;margin-bottom:6px;line-height:1.6}
        .gov-status-aside .gov-aside-name{font-size:25px;line-height:1.2;font-family:var(--display-font,serif);color:var(--gov-purple);margin:0 0 7px}
        .gov-status-aside .gov-aside-subtitle{font-size:12px;line-height:1.6;margin:0;color:#645061}
        .gov-aside-divider{height:1px;background:rgba(99,11,87,.12);margin:19px 0 14px}
        .gov-aside-row{display:flex;align-items:flex-start;gap:9px;margin-top:10px;color:#654B60;font-size:11px;line-height:1.5;font-weight:650}.gov-aside-row svg{flex:none;color:var(--gov-purple)}
        .gov-resources{scroll-margin-top:115px}.gov-resources-heading{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:22px}
        .gov-resources-heading h2{margin:13px 0 9px}.gov-resources-heading p{font-size:14px;line-height:1.7;color:#756775;margin:0;max-width:590px}
        .gov-resource-count{flex:none;display:flex;flex-direction:column;align-items:end;font-family:var(--display-font,serif);font-size:48px;line-height:1;color:rgba(99,11,87,.35)}
        .gov-resource-count span{font-family:var(--body-font,sans-serif);font-size:9px;letter-spacing:.15em;font-weight:800;margin-top:6px;color:#886E85}
        .gov-resource-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
        .gov-resource-card{display:flex;flex-direction:column;justify-content:space-between;min-width:0;min-height:300px;border-radius:27px;padding:26px;text-decoration:none;color:inherit;transition:border-color .2s,box-shadow .2s,background .2s}
        .gov-resource-card:hover{border-color:rgba(166,101,157,.55);background:linear-gradient(135deg,rgba(255,255,255,.95),rgba(248,234,246,.86));box-shadow:inset 0 1px 0 white,0 18px 45px rgba(99,11,87,.14)}
        .gov-card-top,.gov-card-bottom{display:flex;align-items:center;justify-content:space-between;gap:9px}
        .gov-card-icon{width:51px;height:51px;display:grid;place-items:center;border-radius:17px;color:var(--gov-purple);background:linear-gradient(145deg,#F3E2F0,#fff);box-shadow:inset 0 1px 1px white;border:1px solid rgba(99,11,87,.07)}
        .gov-card-open{width:34px;height:34px;display:grid;place-items:center;border-radius:12px;color:#997B93;border:1px solid rgba(99,11,87,.1);background:rgba(255,255,255,.55);transition:transform .2s,color .2s}
        .gov-resource-card:hover .gov-card-open{transform:translate(2px,-2px);color:var(--gov-purple)}
        .gov-card-body{padding:24px 0 25px;flex:1}
        .gov-card-meta{font-size:9px;letter-spacing:.11em;color:#94648D;text-transform:uppercase;font-weight:800}
        .gov-card-body h3{font-family:var(--display-font,serif);font-size:clamp(21px,2vw,27px);line-height:1.19;font-weight:500;letter-spacing:-.015em;color:#341B31;margin:11px 0 13px;overflow-wrap:break-word}
        .gov-card-body p{font-size:12px;line-height:1.75;color:#716371;margin:0}
        .gov-card-bottom{padding-top:17px;border-top:1px solid rgba(99,11,87,.1);color:var(--gov-purple);font-size:11px;font-weight:800;letter-spacing:.02em}
        .gov-endmark{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;margin:55px auto 0;color:#A38AA0;font-size:10px;letter-spacing:.12em;font-weight:800}
        .gov-endmark-line{width:28px;height:1px;background:#D0B8CB}.gov-endmark strong{color:var(--gov-purple)}.gov-crossed{text-decoration:line-through;text-decoration-thickness:1.7px;text-decoration-color:#A6659D;text-decoration-skip-ink:none}
        .gov-page a:focus-visible,.gov-page button:focus-visible{outline:3px solid #A6659D;outline-offset:4px}
        @media(max-width:980px){.gov-hero{grid-template-columns:minmax(0,1.2fr) minmax(210px,.8fr)}.gov-hero-art{min-height:200px}.gov-seal{width:130px;border-radius:35px}.gov-status-layout{grid-template-columns:minmax(0,1.5fr) minmax(220px,1fr);gap:24px}.gov-resource-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:700px){.gov-main{padding-top:24px;padding-bottom:62px}.gov-hero{grid-template-columns:minmax(0,1fr);padding:clamp(25px,6vw,38px);min-height:0;gap:0;border-radius:26px}.gov-hero-art{position:absolute;right:-70px;top:0;bottom:0;width:210px;min-height:0;opacity:.17;z-index:0}.gov-hero-copy{z-index:1}.gov-hero h1{font-size:clamp(36px,9vw,57px);max-width:510px}.gov-lead{max-width:470px}.gov-status-layout{grid-template-columns:1fr;gap:16px}.gov-status{border-radius:25px}.gov-content{gap:42px;margin-top:22px}.gov-resources-heading{align-items:start}.gov-resource-count{font-size:36px}}
        @media(max-width:540px){.gov-resource-grid{grid-template-columns:1fr}.gov-resource-card{min-height:250px}.gov-breadcrumb{font-size:10px}.gov-hero-actions{flex-direction:column;align-items:stretch}.gov-primary-action,.gov-secondary-action{width:100%}.gov-hero-art{display:none}.gov-section-topline{align-items:flex-start}.gov-resources-heading{align-items:start}.gov-resource-count{font-size:33px}.gov-resource-count span{font-size:8px}.gov-status h2,.gov-resources-heading h2{font-size:clamp(28px,7.8vw,36px)}}
        @media(max-width:360px){.gov-main{padding-left:11px;padding-right:11px}.gov-hero{padding:25px 20px}.gov-hero h1{font-size:34px}.gov-status{padding:22px 18px}.gov-resource-card{padding:22px}.gov-breadcrumb{gap:5px}}
        @media(prefers-reduced-transparency:reduce){.gov-glass{background:#fff;backdrop-filter:none;-webkit-backdrop-filter:none}}
        @media(prefers-reduced-motion:reduce){.gov-page *, .gov-page *::before,.gov-page *::after{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
      `}</style>
    </div>
  );
}
