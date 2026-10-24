import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { supabase } from "../lib/supabaseClient";
import {
  ArrowLeft, ArrowUpRight, ChevronRight, Megaphone, Newspaper,
  Play, Radio, X,
} from "lucide-react";

interface PlayItem {

  id: string;

  title: string;

  subtitle: string;

  img: string;

  progress?: number;

}

interface PlayCategory {

  title: string;

  items: PlayItem[];

}

const PLAY_CONTENT: { hero: { title: string; category: string; description: string; duration: string; image: string; }; categories: PlayCategory[]; } = {

  hero: {

    title: "La Promesa",

    category: "SERIE DE ÉXITO",

    description: "El gran drama de época que tiene en vilo a todo el Estado Paniense. Intriga, amor y traición en el palacio más custodiado del estado.",

    duration: "1h 45min",

    image: "https://img.rtve.es/imagenes/la-promesa/01773410920378.jpg"

  },

  categories: [

    {

      title: "Seguir viendo en TVP Play",

      items: [

        {

          id: "sv1",

          title: "Telediario 2",

          progress: 75,

          subtitle: "Informativo nocturno paniense con Angels Barceló y María José Sáez",

          img: "TVP/Telediario2.png"

        },

        {

          id: "sv2",

          title: "NO ME DIGAS",

          progress: 40,

          subtitle: "Programa vespertino de los viernes donde se habla de toda la actualidad del Corazón con Yurena de presentadora",

          img: "https://imagenes.atresplayer.com/atp/clipping/cmsimages01/2025/09/11/E8170CEA-0E08-4A61-B7EB-269C9973142D//386x217.jpg?optimize=low&format=webply"

        },

        {

          id: "sv3",

          title: "Y Ahora Santaolalla",

          progress: 90,

          subtitle: "Magacín que aborda la crónica social y toda la actualidad del día con un grupo de colaboradores de diversos ámbitos. El espacio se divide en diferentes secciones y cuenta con un equipo de reporteros a pie de calle",

          img: "TVP/SANTAOLALLA.png"

        }

      ]

    },

    {

      title: "Series y Ficción Panienses",

      items: [

        { id: "sf1", title: "La Moderna", subtitle: "Nuevos capítulos", img: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=400&auto=format&fit=crop" },

        { id: "sf2", title: "Cuéntame cómo pasó", subtitle: "Temporada Final", img: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=400&auto=format&fit=crop" },

        { id: "sf3", title: "Operación Barrio Inglés", subtitle: "Serie Completa", img: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=400&auto=format&fit=crop" }

      ]

    }

  ]

};

const LOCAL_NEWS_FALLBACK = {

  breaking: "Urgente: El temporal obliga a activar la alerta naranja en todo el litoral del Reino del Pan",

  main: {

    category: "POLÍTICA",

    title: "Histórico acuerdo de infraestructuras para la conexión ferroviaria en el Reino del Pan",

    summary: "El Gobierno y las administraciones regionales sellan un plan de inversión de más de 3.000 millones de euros para acelerar la transición del transporte nacional paniense.",

    time: "Hace 12 min",

    img: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=800&auto=format&fit=crop"

  },

  secondary: [

    { id: "n1", category: "SOCIEDAD", title: "La ola de calor invernal bate récords en el este del país", time: "Hace 45 min", img: "https://images.unsplash.com/photo-1504370805625-d32c54b16100?q=80&w=400&auto=format&fit=crop" },

    { id: "n2", category: "DEPORTES", title: "El TVP Paniense F.C. se clasifica para la gran final continental tras una prórroga agónica", time: "Hace 1 hora", img: "https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=400&auto=format&fit=crop" }

  ],

  trending: [

    { id: "t1", number: "01", title: "Los trucos del nuevo borrador fiscal para autónomos del Reino" },

    { id: "t2", number: "02", title: "Las 5 series más vistas de TVP Play este mes" },

    { id: "t3", number: "03", title: "Previsión del tiempo: ¿Cuándo llegarán las lluvias al norte?" }

  ]

};


type Tab = "play" | "directo" | "noticias";
type NewsCard = { id: string; category: string; title: string; time: string; img: string; summary?: string; };


const TABS: { id: Tab; label: string; icon: typeof Play; }[] = [
  { id: "play", label: "TVP Play", icon: Play },
  { id: "directo", label: "En directo", icon: Radio },
  { id: "noticias", label: "TVP Noticias", icon: Newspaper },
];

function IconButton({ children, onClick, label }: { children: ReactNode; onClick: () => void; label: string; }) {
  return (
    <button type="button" onClick={onClick} aria-label={label}
      className="tvp-glass flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] text-white/80 transition hover:bg-white/15 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff7b43]">
      {children}
    </button>
  );
}

/** A11y modal: focus on open, tab trapped and Escape dismissal. */
function Modal({ title, children, onClose, labelledBy }: {
  title: string; children: ReactNode; onClose: () => void; labelledBy: string;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onCloseRef.current(); return; }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusables = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )).filter(el => el.getClientRects().length > 0);
      if (focusables.length === 0) { event.preventDefault(); dialogRef.current.focus(); return; }
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKeyDown); previouslyFocused?.focus(); };
  }, []);

  return (
    <div className="tvp-modal-wrap fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-3 sm:p-6" role="presentation">
      <div className="absolute inset-0 bg-[#030308]/80 backdrop-blur-xl" onClick={onClose} aria-hidden="true" />
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        aria-labelledby={labelledBy} className="tvp-glass tvp-modal relative my-auto max-h-[calc(100dvh-24px)] w-full max-w-[590px] overflow-y-auto overflow-x-hidden rounded-[28px] p-5 text-white outline-none sm:max-h-[calc(100dvh-48px)] sm:rounded-[34px] sm:p-9">
        {children}
      </div>
    </div>
  );
}

export default function TVPPortal() {
  const [activeTab, setActiveTab] = useState<Tab>("play");
  const [mainNews, setMainNews] = useState(LOCAL_NEWS_FALLBACK.main);
  const [secondaryNews, setSecondaryNews] = useState<NewsCard[]>(LOCAL_NEWS_FALLBACK.secondary);
  const [newsMode, setNewsMode] = useState<"fallback" | "supabase">("fallback");
  const [parentDomain, setParentDomain] = useState<string | null>(null);
  const [noticeOpen, setNoticeOpen] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsCard | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setParentDomain(window.location.hostname || "localhost"); }, []);
  useEffect(() => {
    const titles = { play: "TVP Play - Televisión Paniense", directo: "TVP En Directo - Emisión en Vivo", noticias: "TVP Noticias - Actualidad Paniense" };
    const prevTitle = document.title;
    document.title = titles[activeTab];
    return () => { document.title = prevTitle; };
  }, [activeTab]);

  // Same Supabase table and data fields as the original implementation.
  useEffect(() => {
    if (activeTab !== "noticias" || !supabase) return;
    let active = true;
    async function fetchNews() {
      try {
        const { data, error } = await supabase.from("tvp_news")
          .select("id,type,category,title,summary,time_label,img_url,created_at")
          .order("created_at", { ascending: false }).limit(20);
        if (error) throw error;
        if (!active || !data?.length) return;
        const principal = data.find((n: any) => n.type === "main");
        const others = data.filter((n: any) => n.type === "secondary");
        if (principal) {
          setMainNews({
            category: principal.category || "ACTUALIDAD", title: principal.title,
            summary: principal.summary || "", time: principal.time_label || "TVP Noticias",
            img: principal.img_url || LOCAL_NEWS_FALLBACK.main.img,
          });
        }
        if (others.length) {
          setSecondaryNews(others.map((n: any) => ({
            id: String(n.id), category: n.category || "NOTICIAS", title: n.title,
            summary: n.summary || "", time: n.time_label || "TVP Noticias",
            img: n.img_url || LOCAL_NEWS_FALLBACK.main.img,
          })));
        }
        if (principal || others.length) setNewsMode("supabase");
      } catch (err) { console.warn("TVP: noticias de muestra; no se pudo consultar Supabase", err); }
    }
    void fetchNews();
    return () => { active = false; };
  }, [activeTab]);

  const chooseTab = (tab: Tab) => {
    setActiveTab(tab);
    topRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
  };

  const showNews = (item: NewsCard) => setSelectedNews(item);

  return (
    <div ref={topRef} className="tvp-root relative flex min-h-screen flex-col overflow-x-clip bg-[#08090d] text-white selection:bg-[#ff4d00]/50">
      <style>{`
        @font-face {font-family:TVPHeading;src:url('/TVP/TVP.ttf') format('truetype');font-display:swap;}
        @font-face {font-family:TVPText;src:url('/TVP/TVPtext.ttf') format('truetype');font-display:swap;}
        .tvp-root {font-family:TVPText,Inter,system-ui,sans-serif;--tvp-orange:#ff4d00;--tvp-purple:#630B57;}
        /* El CSS general aplica font-size-adjust:1 a todos los encabezados.
           Ese valor amplifica los glifos y provoca exactamente el solapamiento
           visible en las capturas. Se anula SOLO dentro del portal TVP. */
        .tvp-root :is(h1,h2,h3,h4,h5,h6) {
          font-size-adjust: none;
        }
        /* TVP.ttf tiene además métricas peculiares a tamaños grandes:
           usamos titulares legibles y mantenemos el branding en logos TVP. */
        .tvp-head {
          font-family: Inter, "Segoe UI", Arial, system-ui, sans-serif;
          font-weight: 750;
          font-synthesis: weight;
          font-size-adjust: none;
          line-height: 1.16;
          letter-spacing: -0.035em;
          overflow-wrap: break-word;
          text-wrap: balance;
        }
        .tvp-hero-title {
          font-family: Inter, "Segoe UI", Arial, system-ui, sans-serif;
          font-size: clamp(2.8rem, 6.1vw, 5.25rem);
          line-height: 1.03;
          letter-spacing: -0.055em;
          font-weight: 800;
          font-size-adjust: none;
          max-width: 760px;
          overflow-wrap: break-word;
          text-wrap: balance;
        }
        .tvp-modal-title {
          font-family: Inter, "Segoe UI", Arial, system-ui, sans-serif;
          font-size: clamp(1.85rem, 4.4vw, 2.75rem);
          line-height: 1.12;
          letter-spacing: -0.045em;
          font-weight: 750;
          font-size-adjust: none;
          overflow-wrap: break-word;
          text-wrap: balance;
        }
        @media (max-width: 400px) {
          .tvp-hero-title {font-size: clamp(2.35rem, 11vw, 2.8rem);}
          .tvp-modal-title {font-size: clamp(1.75rem, 8vw, 2rem);}
        }
        .tvp-glass {background:linear-gradient(125deg,rgba(37,38,46,.82),rgba(23,22,31,.75) 45%,rgba(39,27,43,.76));border:1px solid rgba(255,255,255,.13);box-shadow:inset 0 1px 0 rgba(255,255,255,.16),0 15px 38px rgba(0,0,0,.25);backdrop-filter:blur(25px) saturate(145%);-webkit-backdrop-filter:blur(25px) saturate(145%);}
        .tvp-card {background:linear-gradient(145deg,rgba(36,37,45,.82),rgba(16,17,23,.92));border:1px solid rgba(255,255,255,.095);box-shadow:inset 0 1px rgba(255,255,255,.1),0 16px 38px rgba(0,0,0,.22);}
        .tvp-primary {background:linear-gradient(135deg,#ff7438,#ff4d00);color:#100906;box-shadow:inset 0 1px rgba(255,255,255,.37),0 8px 24px rgba(255,77,0,.25);}
        .tvp-tab[data-active=true] {background:linear-gradient(135deg,rgba(255,103,41,.2),rgba(99,11,87,.23));color:#fff;border-color:rgba(255,111,56,.32);}
        .tvp-modal:before {content:'';position:absolute;inset:0 0 auto;height:2px;background:linear-gradient(90deg,transparent,#ff7131 40%,#c67bc5 70%,transparent);}
        .tvp-modal-wrap {animation:tvpFade .2s ease-out both;}
        .tvp-modal {animation:tvpRise .3s cubic-bezier(.2,.8,.2,1) both;}
        @keyframes tvpFade {from{opacity:0}to{opacity:1}}
        @keyframes tvpRise {from{opacity:0;transform:translateY(12px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
        .tvp-root button:focus-visible,.tvp-root a:focus-visible {outline:2px solid #ff915e;outline-offset:3px;}
        .tvp-hide-scrollbar {scrollbar-width:none;} .tvp-hide-scrollbar::-webkit-scrollbar{display:none;}
        @media (prefers-reduced-motion:reduce){.tvp-root *, .tvp-root *:before,.tvp-root *:after {animation-duration:.01ms!important;scroll-behavior:auto!important;transition-duration:.01ms!important;}}
      `}</style>

      {/* Header uses TVP's own identity and is independent of the general government header. */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#08090d]/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-[#08090d]/70">
        <div className="mx-auto flex h-[68px] w-full max-w-[1440px] items-center justify-between gap-2 px-3 sm:h-[76px] sm:px-6 lg:px-9">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-4">
            <Link href="/" aria-label="Volver al portal principal" className="tvp-glass flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] transition hover:bg-white/15" title="Inicio">
              <ArrowLeft size={18} className="text-white/90" />
            </Link>
            <div className="h-7 w-px shrink-0 bg-white/15" aria-hidden="true" />
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <img src="/TVP/TVP.png" alt="TVP" className="max-h-10 w-auto max-w-[88px] object-contain sm:max-h-11 sm:max-w-[115px]" />
              <div className="hidden min-w-0 flex-col border-l border-white/15 pl-3 sm:flex">
                <span className="text-[10px] font-bold uppercase tracking-[.20em] text-white/65">Televisión Paniense</span>
                <span className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#f0a5d9]">Estado Paniense</span>
              </div>
              <img src="/TVP/2Pan.png" alt="2Pan" className="ml-1 hidden max-h-6 max-w-[65px] object-contain opacity-75 xl:block" />
            </div>
          </div>
          <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[.045] p-1.5 min-[900px]:flex" aria-label="Secciones de TVP">
            {TABS.map(({ id, label, icon: TabIcon }) => (
              <button key={id} type="button" onClick={() => chooseTab(id)} data-active={activeTab === id}
                aria-current={activeTab === id ? "page" : undefined}
                className="tvp-tab flex items-center gap-2 rounded-full border border-transparent px-3 py-2.5 text-[11px] font-bold uppercase tracking-[.07em] text-white/60 transition hover:text-white min-[1100px]:px-4">
                <TabIcon size={15} aria-hidden="true" />{label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {activeTab === "play" && (
        <main className="min-w-0 flex-1">
          <section className="relative isolate flex min-h-[500px] items-end overflow-hidden bg-[#0a0b10] sm:min-h-[580px] lg:min-h-[610px]">
            <img src={PLAY_CONTENT.hero.image} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-65" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#08090d] via-[#08090d]/65 to-[#08090d]/15" />
            <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-[#08090d]/75 via-transparent to-transparent lg:block" />
            <div className="mx-auto w-full max-w-[1440px] px-5 pb-12 pt-24 sm:px-8 sm:pb-16 lg:px-12 lg:pb-20">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="tvp-glass rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-[#ffa77b]">{PLAY_CONTENT.hero.category}</span>
                <span className="text-xs font-semibold text-white/70">{PLAY_CONTENT.hero.duration}</span>
              </div>
              <h1 className="tvp-hero-title drop-shadow-xl">{PLAY_CONTENT.hero.title}</h1>
              <p className="relative mt-6 max-w-[610px] text-sm leading-7 text-white/85 sm:mt-7 sm:text-base">{PLAY_CONTENT.hero.description}</p>
              <a href="#tvp-catalogo" className="tvp-primary mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-full px-7 py-3 text-xs font-black uppercase tracking-[.14em] transition hover:brightness-110 active:scale-[.98] sm:w-auto">
                <Play size={17} fill="currentColor" aria-hidden="true" /> Explorar programación <ChevronRight size={17} aria-hidden="true" />
              </a>
            </div>
          </section>
          <div id="tvp-catalogo" className="scroll-mt-24 mx-auto max-w-[1440px] space-y-12 px-4 py-12 sm:px-8 sm:py-16 lg:space-y-20 lg:px-12">
            {PLAY_CONTENT.categories.map((cat) => (
              <section key={cat.title} aria-label={cat.title}>
                <div className="mb-5 flex items-end justify-between gap-4 border-b border-white/10 pb-4 sm:mb-7">
                  <h2 className="tvp-head text-[clamp(1.2rem,2.2vw,1.9rem)] font-bold tracking-wide">{cat.title}</h2>
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-[.16em] text-[#ff9d71]">{cat.items.length} programas</span>
                </div>
                <div className="tvp-hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-3">
                  {cat.items.map(item => (
                    <article key={item.id} className="tvp-card group w-[min(82vw,350px)] shrink-0 snap-start overflow-hidden rounded-[22px] sm:w-auto sm:shrink">
                      <div className="relative aspect-video overflow-hidden bg-black/40">
                        <img src={item.img.startsWith("http") || item.img.startsWith("/") ? item.img : `/${item.img}`} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
                        {item.progress !== undefined && (
                          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/25" aria-label={`${item.progress}% reproducido`} role="progressbar" aria-valuenow={item.progress} aria-valuemin={0} aria-valuemax={100}>
                            <div className="h-full bg-[#ff4d00]" style={{ width: `${item.progress}%` }} />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5 p-4 sm:p-5">
                        <h3 className="tvp-head text-base font-bold leading-snug text-white">{item.title}</h3>
                        <p className="line-clamp-3 text-sm leading-relaxed text-white/60">{item.subtitle}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </main>
      )}

      {activeTab === "directo" && (
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#ff4d00]/35 bg-[#ff4d00]/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.16em] text-[#ff915d]"><span className="h-2 w-2 rounded-full bg-[#ff4d00]" />Canal en directo</span>
              <h1 className="tvp-head text-3xl font-bold sm:text-4xl">TVP en directo</h1>
            </div>
            <p className="text-xs text-white/55">Emisión desde Twitch · Televisión Paniense</p>
          </div>
          <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(270px,1fr)]">
            <div className="tvp-card min-w-0 overflow-hidden rounded-[22px] p-1.5 sm:rounded-[28px] sm:p-2">
              <div className="aspect-video overflow-hidden rounded-[16px] bg-black sm:rounded-[22px]">
                {parentDomain ? (
                  <iframe title="Emisión en directo de TVP" src={`https://player.twitch.tv/?channel=televisionpaniense&parent=${encodeURIComponent(parentDomain)}&autoplay=false`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen className="h-full w-full border-0" />
                ) : <div className="grid h-full place-items-center text-sm text-white/55">Cargando reproductor…</div>}
              </div>
            </div>
            <div className="tvp-card min-w-0 overflow-hidden rounded-[22px] p-1.5 sm:rounded-[28px] sm:p-2">
              <div className="h-[390px] overflow-hidden rounded-[16px] bg-[#13141d] sm:h-[490px] xl:h-full xl:min-h-[300px] sm:rounded-[22px]">
                {parentDomain ? (
                  <iframe title="Chat de la emisión de TVP" src={`https://www.twitch.tv/embed/televisionpaniense/chat?parent=${encodeURIComponent(parentDomain)}`} className="h-full w-full border-0" />
                ) : <div className="grid h-full place-items-center text-sm text-white/55">Cargando chat…</div>}
              </div>
            </div>
          </div>
        </main>
      )}

      {activeTab === "noticias" && (
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
          <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#ff9b69]"><Newspaper size={15} aria-hidden="true" /> TVP Noticias</div>
              <h1 className="tvp-head text-3xl font-bold sm:text-4xl lg:text-5xl">Actualidad paniense</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">Información, análisis y actualidad del territorio.</p>
            </div>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] uppercase tracking-[.1em] text-white/60">{newsMode === "supabase" ? "Titulares del registro TVP" : "Contenido de muestra"}</span>
          </div>
          <div className="tvp-glass mb-8 flex flex-col gap-3 rounded-[20px] px-4 py-4 sm:flex-row sm:items-center sm:px-6">
            <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg bg-[#ff4d00] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.12em] text-black">Titulares</span>
            <p className="text-sm font-semibold leading-6 text-white/80">{newsMode === "fallback" ? LOCAL_NEWS_FALLBACK.breaking : mainNews.title}</p>
          </div>
          <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.85fr)_minmax(290px,1fr)] lg:gap-8">
            <div className="min-w-0 space-y-5">
              <button type="button" onClick={() => showNews({ id: "main", ...mainNews })} className="tvp-card group w-full overflow-hidden rounded-[24px] text-left transition hover:border-[#ff4d00]/45">
                <div className="relative aspect-video overflow-hidden">
                  <img src={mainNews.img} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]" />
                  <span className="absolute left-4 top-4 rounded-lg bg-[#ff4d00] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.1em] text-black">{mainNews.category}</span>
                </div>
                <div className="p-5 sm:p-8">
                  <p className="mb-2 text-xs text-white/50">{mainNews.time}</p>
                  <h2 className="tvp-head text-[clamp(1.4rem,3vw,2.5rem)] font-bold leading-snug transition group-hover:text-[#ffb086]">{mainNews.title}</h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-white/65">{mainNews.summary}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#ff9c71]">Ver información <ArrowUpRight size={15} aria-hidden="true" /></span>
                </div>
              </button>
              <div className="grid gap-4 sm:grid-cols-2">
                {secondaryNews.map(news => (
                  <button key={news.id} type="button" onClick={() => showNews(news)} className="tvp-card group overflow-hidden rounded-[20px] text-left transition hover:border-[#ff4d00]/45">
                    <div className="aspect-video overflow-hidden"><img src={news.img} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]" /></div>
                    <div className="p-4 sm:p-5"><p className="text-[10px] font-bold uppercase tracking-wider text-[#ff9b70]">{news.category} · {news.time}</p><h3 className="tvp-head mt-2 text-lg font-bold leading-snug">{news.title}</h3></div>
                  </button>
                ))}
              </div>
            </div>
            <aside className="min-w-0 space-y-5">
              <div className="tvp-card rounded-[24px] p-5 sm:p-7">
                <h2 className="tvp-head mb-5 border-b border-white/10 pb-4 text-xl font-bold">Lo más visto</h2>
                {LOCAL_NEWS_FALLBACK.trending.map(t => (
                  <div key={t.id} className="flex items-start gap-4 border-b border-white/10 py-4 last:border-0">
                    <span className="tvp-head text-3xl font-bold text-[#ff4d00]/75">{t.number}</span><p className="text-sm leading-6 text-white/75">{t.title}</p>
                  </div>
                ))}
              </div>
              <div className="tvp-glass rounded-[24px] p-5 sm:p-7">
                <span className="text-[10px] font-black uppercase tracking-[.14em] text-[#ff9a6d]">Área Deportiva Paniense</span>
                <h2 className="tvp-head mt-3 text-xl font-bold">Especial Copa del Estado Paniense 2026</h2>
                <p className="mt-3 text-sm leading-7 text-white/65">Estamos acondicionando la parrilla de retransmisión televisiva para los próximos encuentros oficiales del campeonato nacional paniense.</p>
              </div>
            </aside>
          </div>
        </main>
      )}

      {/* TVP footer kept separate from the general government footer. */}
      <footer className="mt-auto border-t border-white/10 bg-[#050608] px-4 py-8 text-xs text-white/50 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/" aria-label="Volver al inicio"><img src="/logo.png" alt="Artis Panis" className="h-8 w-auto object-contain" /></Link>
            <a href="https://discord.com/invite/reino-del-pan-1381359904731693056" target="_blank" rel="noopener noreferrer" className="tvp-glass rounded-full px-4 py-2 text-[11px] font-bold text-white/80 transition hover:text-[#ffa77b]">Comunidad Discord ↗</a>
          </div>
          <p className="max-w-xl leading-6 text-white/50">© {new Date().getFullYear()} Corporación de Radio y Televisión Paniense (TVP). Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* Mobile navigation: fixed bar under 900px, with safe-area support. */}
      <nav aria-label="Navegación móvil de TVP" className="tvp-glass fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 gap-1 rounded-t-[22px] border-x-0 border-b-0 p-1.5 pb-[max(6px,env(safe-area-inset-bottom))] min-[900px]:hidden">
        {TABS.map(({ id, label, icon: TabIcon }) => (
          <button key={id} type="button" onClick={() => chooseTab(id)} data-active={activeTab === id} aria-current={activeTab === id ? "page" : undefined}
            className="tvp-tab flex min-h-14 flex-col items-center justify-center gap-1 rounded-[16px] border border-transparent px-1 text-center text-[10px] font-bold uppercase tracking-[.03em] text-white/65 transition hover:text-white">
            <TabIcon size={19} aria-hidden="true" />{label}
          </button>
        ))}
      </nav>
      <div aria-hidden="true" className="h-[calc(70px+env(safe-area-inset-bottom))] shrink-0 min-[900px]:hidden" />


      {/* Preview modal avoids fake article navigation where no article URL exists. */}
      {selectedNews && !noticeOpen && (
        <Modal title={selectedNews.title} labelledBy="tvp-news-title" onClose={() => setSelectedNews(null)}>
          <div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold uppercase tracking-[.15em] text-[#ff9f75]">{selectedNews.category} · {selectedNews.time}</span><IconButton onClick={() => setSelectedNews(null)} label="Cerrar noticia"><X size={19} /></IconButton></div>
          <h2 id="tvp-news-title" className="tvp-head mt-5 text-2xl font-bold leading-snug sm:text-3xl">{selectedNews.title}</h2>
          <img src={selectedNews.img} alt="" className="mt-5 aspect-video w-full rounded-[18px] object-cover" />
          <p className="mt-5 text-sm leading-7 text-white/70">{selectedNews.summary || "Este titular aún no dispone de un artículo ampliado."}</p>
          <button type="button" onClick={() => setSelectedNews(null)} className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[#ffa77b]"><ArrowLeft size={16} /> Volver a las noticias</button>
        </Modal>
      )}
    </div>
  );
}
