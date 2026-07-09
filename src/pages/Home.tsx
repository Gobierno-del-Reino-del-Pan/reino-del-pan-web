import { useMemo, useState, useEffect } from "react";
import { Link } from "wouter";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { supabase } from "../lib/supabaseClient";


// ── INTERFACES Y CONFIGURACIONES ESTÁTICAS ──────────────────────────

interface RegionWeather {
  id: string;
  region: string;
  ciudad: string;
  lat: number;
  lon: number;
  bgGradient: string;
  temp?: string;
  clima?: string;
  icon?: string;
  maxMin?: string;
}

interface SupabaseNewsItem {
  id: string;
  type: "main" | "secondary";
  category: string;
  title: string;
  summary?: string;
  time_label: string;
  img_url: string;
  created_at: string;
}



const NEWS_ITEMS = [
  "El sistema de generación de DPIs está totalmente operativo",
  "LaMiga Paniense sigue advancing a pasos agigantados, próximamente el gobierno nombrará presidente de LaMiga Paniense",
  "Se está implementando la Pokédex de la Región, muy pronto disponible",
  "El 23 de julio se celebrará el primer año del nacimiento del Reino",
  "Muy pronto no habrá disponibilidad de DPIs"
];

const STATS_ITEMS = [
  { stat: "Casi 1 Año", title: "Desde su fundación", desc: "Iniciado como una visión el 23 de julio de 2025, ahora es un estado consolidado." },
  { stat: "500+", title: "Solicitudes de DPI", desc: "Ciudadanos digitales registrados y activos en nuestra plataforma global." },
  { stat: "100%", title: "Por la Libertad", desc: "Compromiso total con la libertad y la resiliencia de nuestro pueblo." },
  { stat: "50+", title: "Países conectados", desc: "Una comunidad diplomática que cruza fronteras internacionales." },
];

const LOCAL_NEWS_FALLBACK = {
  main: {
    category: "POLÍTICA",
    title: "Cargando noticias principales...",
    summary: "Conectando con el servidor central de TVP para obtener las últimas actualizaciones del Reino...",
    time: "Ahora",
    img: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=800&auto=format&fit=crop"
  },
  secondary: [
    { id: "n1", category: "INFO", title: "Actualizando boletines informativos secundarios...", time: "En línea", img: "https://images.unsplash.com/photo-1504370805625-d32c54b16100?q=80&w=400&auto=format&fit=crop" },
    { id: "n2", category: "INFO", title: "Conectando con la parrilla de TVP Play...", time: "En línea", img: "https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=400&auto=format&fit=crop" }
  ]
};

const FIESTAS_TEXTS = [
  "Y yo me voy con mi peña. María, Alberto, Manolo",
  "El color con el que transmites tu caminar",
  "Santa Brígida nos ilumina a este reino",
  "Y era un domingo en la tarde, fui a los coches de choque",
  "Valdrá la pena",
  "Hazlo, SÍ O SÍ. El 23J declárate a tu crush",
  "Yo diría que disparaste a cada una de mis emociones",
  "Prepara las copas, el DJ está cerca...",
  "Vivir solo cuesta la vida...",
  "Vamos, a ver si lo pillas, el 23J nos vemos y te la pillo",
  "Espero que esto no lo veas tú",
  "Vamos, a ver si lo pillas, el 23J nos vemos y te la pillo",

];

const REGIONES_CONFIG: RegionWeather[] = [
  { id: "baguette", region: "Baguette 🥖", ciudad: "Pantopía", lat: 37.3828, lon: -5.9732, bgGradient: "from-amber-500/20 via-orange-600/10 to-transparent" },
  { id: "pimbo", region: "Pimbo 🍞", ciudad: "Pimbolandia", lat: 40.9688, lon: -5.6639, bgGradient: "from-blue-400/10 via-slate-500/5 to-transparent" },
  { id: "pretzel", region: "Pretzel 🥨", ciudad: "Pretzelopolis", lat: 39.4698, lon: -0.3763, bgGradient: "from-sky-400/15 via-blue-500/5 to-transparent" },
  { id: "croissant", region: "Croissant 🥐", ciudad: "Vila Croissant", lat: 43.4832, lon: -1.5586, bgGradient: "from-indigo-500/15 via-slate-600/10 to-transparent" },
  { id: "singluten", region: "Sin Glúten 🌾", ciudad: "ChinPan", lat: 34.0522, lon: -118.2437, bgGradient: "from-zinc-400/20 via-neutral-700/5 to-transparent" },
  { id: "panplano", region: "Pan Plano/Arepa 🫓", ciudad: "Arepa", lat: -34.6037, lon: -58.3816, bgGradient: "from-red-600/15 via-blue-900/10 to-transparent" }
];

const getWeatherStatus = (code: number) => {
  if ([0].includes(code)) return { texto: "Despejado", icon: "☀️" };
  if ([1, 2, 3].includes(code)) return { texto: "Parcialmente Nublado", icon: "⛅" };
  if ([45, 48].includes(code)) return { texto: "Niebla", icon: "🌫️" };
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { texto: "Lluvia", icon: "🌧️" };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { texto: "Nieve", icon: "❄️" };
  if ([95, 96, 99].includes(code)) return { texto: "Tormenta eléctrica", icon: "⛈️" };
  return { texto: "Variable", icon: "🌤️" };
};

// ── COMPONENTE PRINCIPAL ─────────────────────────────────────────────

export default function Home() {
  const news = useMemo(() => NEWS_ITEMS, []);
  const stats = useMemo(() => STATS_ITEMS, []);
  const fiestaTexts = useMemo(() => FIESTAS_TEXTS, []);

  const [mainNews, setMainNews] = useState(LOCAL_NEWS_FALLBACK.main);
  const [secondaryNews, setSecondaryNews] = useState(LOCAL_NEWS_FALLBACK.secondary);

  const [weatherData, setWeatherData] = useState<RegionWeather[]>([]);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchSupabaseNews() {
      try {
        if (!supabase) return;

        const { data, error } = await supabase
          .from('tvp_news')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0 && isMounted) {
          const typedData = data as SupabaseNewsItem[];

          const supabaseMain = typedData.find((n) => n.type === 'main');
          if (supabaseMain) {
            setMainNews({
              category: supabaseMain.category,
              title: supabaseMain.title,
              summary: supabaseMain.summary || '',
              time: supabaseMain.time_label,
              img: supabaseMain.img_url
            });
          }

          const supabaseSecondaries = typedData.filter((n) => n.type === 'secondary');
          if (supabaseSecondaries.length > 0) {
            setSecondaryNews(supabaseSecondaries.slice(0, 2).map((n) => ({
              id: n.id,
              category: n.category,
              title: n.title,
              time: n.time_label,
              img: n.img_url
            })));
          }
        }
      } catch (err) {
        console.warn("Error al extraer noticias de Supabase:", err);
      }
    }

    const fetchWeather = async () => {
      try {
        const promesas = REGIONES_CONFIG.map(async (reg) => {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${reg.lat}&longitude=${reg.lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
          const res = await fetch(url);
          const data = await res.json();
          const infoClima = getWeatherStatus(data.current.weather_code);

          return {
            ...reg,
            temp: `${Math.round(data.current.temperature_2m)}°C`,
            clima: infoClima.texto,
            icon: infoClima.icon,
            maxMin: `Máx: ${Math.round(data.daily.temperature_2m_max[0])}° Mín: ${Math.round(data.daily.temperature_2m_min[0])}°`,
          };
        });

        const resultados = await Promise.all(promesas);
        if (isMounted) {
          setWeatherData(resultados);
          setWeatherLoading(false);
        }
      } catch (error) {
        console.error("Error al sincronizar con el satélite meteorológico:", error);
      }
    };

    fetchSupabaseNews();
    fetchWeather();

    const interval = setInterval(fetchWeather, 10 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleNewsClick = (title: string) => {
    alert(`Abriendo emisión / artículo de TVP: \n"${title}"`);
  };

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

      {/* ── SECCIÓN: ANUNCIO INSTITUCIONAL COMPLETO ── */}
      <section className="w-full">
        <img
          src="/anunciosgov/seguimosavanzando.jpg"
          alt="Anuncio Institucional: Seguimos Avanzando"
          className="w-full h-auto block"
        />
      </section>

      {/* ── SECCIÓN METEOROLÓGICA DEL REINO ── */}
      <section className="w-full bg-neutral-950 py-16 px-4 sm:px-6 border-t border-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-accent font-bold block mb-2">
                Servicio Meteorológico Nacional
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Estado del Clima en el Reino
              </h2>
            </div>
            <p className="text-xs text-white/50 max-w-xs md:text-right font-medium">
              Datos reales medidos por satélite para la gobernanza territorial del Reino del Pan.
            </p>
          </div>

          {weatherLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse h-44 rounded-[24px] bg-neutral-900/50 border border-white/5" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {weatherData.map((item) => (
                <div
                  key={item.id}
                  className={`relative overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br ${item.bgGradient} bg-neutral-900/40 backdrop-blur-xl p-6 flex flex-col justify-between h-44 transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:bg-neutral-900/60 shadow-md group`}
                >
                  <div className="flex justify-between items-start z-10">
                    <div>
                      <span className="text-[11px] font-bold tracking-widest uppercase text-white/40 block mb-0.5">
                        Región {item.region}
                      </span>
                      <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-accent transition-colors duration-300">
                        {item.ciudad}
                      </h3>
                    </div>
                    <span className="text-3xl filter drop-shadow-sm select-none">{item.icon}</span>
                  </div>

                  <div className="flex justify-between items-end z-10">
                    <div>
                      <p className="text-xs font-semibold text-white/80">{item.clima}</p>
                      <p className="text-[11px] text-white/50 mt-0.5 font-medium">{item.maxMin}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-5xl font-light tracking-tighter text-white">
                        {item.temp}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── SECCIÓN: CONTENEDOR INTEGRADO CON FONDO BLANCO AZULADO (#CDCCD4) ── */}
      <section className="w-full px-4 sm:px-6 py-16 lg:py-24 bg-[#CDCCD4]">
        <div className="container mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Tarjeta Laboral Panian Bank */}
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
                Una nueva entidad identidad financiera que impulsará el ahorro, la inversión y el crecimiento económico del país.
                El futuro de la banca paniense comienza hoy.
              </p>
            </div>
            <div className="mt-8 flex items-center">
              <span className="text-xs uppercase tracking-[0.15em] font-mono font-bold text-emerald-800/90">Se une a nosotros para crear la primera entidad financiera del Reino del Pan</span>
            </div>
          </div>

          {/* Tarjeta PKMN */}
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

      {/* ── SECCIÓN: TARJETA TVP NOTICIAS (EXTRAÍDA DE SUPABASE) ── */}
      <section className="w-full px-4 sm:px-6 mt-8 max-w-7xl mx-auto z-10">
        <div className="w-full bg-[#07080c] text-white rounded-3xl overflow-hidden border border-white/5 p-6 sm:p-8 md:p-10 shadow-2xl flex flex-col gap-10 font-tvp-text selection:bg-[#ff4d00]">

          {/* Header del Módulo TVP */}
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <div className="flex items-center gap-4">
              <img src="/TVP/TVP.png" alt="TVP" className="h-7 md:h-8 object-contain select-none" />
              <div className="h-5 w-[1px] bg-white/20"></div>
              <h3 className="font-tvp-head text-base md:text-xl font-bold tracking-widest uppercase text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#ff4d00] rounded-full animate-ping"></span>
              </h3>
            </div>
            <Link href="/tvp">
              <span className="text-xs text-[#ff4d00] cursor-pointer hover:underline uppercase tracking-[0.25em] font-bold font-tvp-head transition-all">
                Portal Play →
              </span>
            </Link>
          </div>

          {/* Grid de Noticias de Supabase */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-12">

            {/* Noticia Principal */}
            <div
              onClick={() => handleNewsClick(mainNews.title)}
              className="lg:col-span-2 group cursor-pointer bg-[#0e1017] rounded-2xl overflow-hidden border border-white/5 hover:border-[#ff4d00]/30 transition-all duration-300 shadow-xl flex flex-col justify-between"
            >
              <div className="relative w-full aspect-video overflow-hidden">
                <img src={mainNews.img} alt={mainNews.title} className="w-full h-full object-cover group-hover:scale-[1.015] transition-transform duration-500" />
                <span className="absolute top-4 left-4 bg-[#ff4d00] text-black text-[10px] sm:text-xs font-black px-4 py-2 rounded font-tvp-head tracking-[0.2em] uppercase shadow-md">
                  {mainNews.category}
                </span>
              </div>

              <div className="p-8 sm:p-10 md:p-12 flex flex-col gap-8 flex-1 justify-between">
                <div className="flex flex-col gap-6">
                  <span className="text-[11px] text-white/40 tracking-[0.25em] uppercase font-semibold font-mono">{mainNews.time}</span>
                  <h3 className="font-tvp-head text-2xl sm:text-3xl md:text-4xl font-black text-white group-hover:text-[#ff4d00] transition-colors tracking-[0.06em] leading-[1.6]">
                    {mainNews.title}
                  </h3>
                  <p className="text-sm sm:text-base text-neutral-400 font-light tracking-[0.05em] leading-[1.9] mt-2">
                    {mainNews.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Noticias Secundarias */}
            <div className="flex flex-col gap-5 justify-between">
              {secondaryNews.map((sn) => (
                <div
                  key={sn.id}
                  onClick={() => handleNewsClick(sn.title)}
                  className="group cursor-pointer bg-[#0e1017] rounded-2xl overflow-hidden border border-white/5 hover:border-[#ff4d00]/20 transition-all duration-300 shadow-md flex flex-col h-full justify-between"
                >
                  <div className="relative w-full aspect-video overflow-hidden shrink-0">
                    <img src={sn.img} alt={sn.title} className="w-full h-full object-cover group-hover:scale-[1.015] transition-transform duration-500" />
                    <span className="absolute top-3 left-3 bg-[#0a0b10]/95 backdrop-blur text-white text-[9px] font-bold px-3 py-1.5 rounded tracking-[0.2em] uppercase font-tvp-head border border-white/5">
                      {sn.category}
                    </span>
                  </div>

                  <div className="p-10 flex flex-col gap-10 flex-1 justify-center">
                    <span className="text-[10px] text-white/40 font-medium tracking-[0.2em] font-mono">{sn.time}</span>
                    <h4 className="font-tvp-head font-bold text-base sm:text-xl text-white/90 group-hover:text-[#ff4d00] transition-colors tracking-[0.07em] leading-[1.7]">
                      {sn.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── NUEVA SECCIÓN: FIESTAS PATRONALES CON SERPENTINAS 3D Y EFECTOS ESPECIALES ── */}
      <section className="w-full px-4 sm:px-6 py-24 mt-20 bg-[#07080c] relative overflow-hidden select-none border-t border-white/5">

        {/* Efecto de luces de fondo (Ambience) */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto max-w-7xl relative">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.4em] text-accent font-bold block mb-3 animate-pulse">
              🎉 ¡VIVE LA TRADICIÓN! 🎉
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
              Fiesta Nacional del Reino
            </h2>
            <br />
            <p className="text-sm text-white/40 mt-6 max-w-md mx-auto font-medium">
              Siente la música, la peña y la energía de una celebración soberana única.
            </p>
          </div>

          {/* CONTENEDOR 3D PRINCIPAL */}
          <div className="relative min-h-[700px] lg:min-h-[550px] flex flex-col lg:flex-row justify-center items-center gap-16 lg:gap-32 bg-[#0e1017]/60 backdrop-blur-md p-8 sm:p-12 md:p-16 rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">

            {/* ── CAPA Z-0: SERPENTINAS POR DETRÁS ── */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              {fiestaTexts[9] && (
                <div className="absolute top-[12%] left-[-2%] bg-gradient-to-r from-accent to-orange-500 text-accent-foreground text-xs font-black tracking-widest uppercase px-6 py-3 rounded-full shadow-lg border border-white/10 transform animate-serpentina-back-1 whitespace-nowrap">
                  🎗️ {fiestaTexts[9]}
                </div>
              )}
              {fiestaTexts[2] && (
                <div className="absolute bottom-[25%] right-[-5%] bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black tracking-widest uppercase px-6 py-3 rounded-full shadow-lg border border-white/10 transform animate-serpentina-back-2 whitespace-nowrap">
                  ✨ {fiestaTexts[2]}
                </div>
              )}
              {fiestaTexts[4] && (
                <div className="absolute top-[45%] left-[5%] bg-gradient-to-r from-neutral-800 to-neutral-950 text-white/90 text-xs font-bold tracking-widest uppercase px-5 py-2.5 rounded-full shadow-md border border-white/5 transform animate-serpentina-back-3 whitespace-nowrap">
                  ⚡ {fiestaTexts[4]}
                </div>
              )}
            </div>

            {/* ── CAPA Z-10: CARTEL DE LA IZQUIERDA ── */}
            <div className="z-10 relative group perspective-1000 transform hover:scale-[1.03] transition-all duration-500">
              <div className="absolute -inset-1 bg-gradient-to-r from-accent to-amber-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
              <img
                src="/anunciosgov/cartel1.jpg"
                alt="Cartel Fiestas Patronales 1"
                className="max-h-[400px] sm:max-h-[460px] w-auto rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] border border-white/10 relative z-10 transform lg:-rotate-2 group-hover:rotate-0 transition-transform duration-500"
              />
            </div>

            {/* ── CAPA Z-20: SERPENTINAS INTERMEDIAS (CRUZAN POR DELANTE DEL CARTEL 1 Y DETRÁS DEL CARTEL 2) ── */}
            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
              {fiestaTexts[1] && (
                <div className="absolute top-[35%] left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 text-neutral-950 text-sm sm:text-base font-black tracking-wider uppercase px-8 py-3.5 rounded-xl shadow-[0_15px_35px_rgba(0,0,0,0.5)] transform animate-serpentina-mid-1 whitespace-nowrap border-y-2 border-white/20">
                  🔥 {fiestaTexts[1]} 🔥
                </div>
              )}
              {fiestaTexts[5] && (
                <div className="absolute bottom-[38%] left-[15%] bg-gradient-to-r from-rose-600 to-red-500 text-white text-xs sm:text-sm font-extrabold tracking-widest uppercase px-6 py-3 rounded-xl shadow-xl transform animate-serpentina-mid-2 whitespace-nowrap">
                  💘 {fiestaTexts[5]}
                </div>
              )}
              {fiestaTexts[8] && (
                <div className="absolute top-[15%] right-[8%] bg-gradient-to-r from-purple-600 via-pink-600 to-accent text-white text-xs font-black tracking-widest uppercase px-6 py-3 rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.6)] transform animate-serpentina-front-2 whitespace-nowrap pointer-events-auto hover:scale-110 transition-transform cursor-pointer">
                  🎯 {fiestaTexts[8]}
                </div>
              )}
            </div>

            {/* ── CAPA Z-30: CARTEL DE LA DERECHA ── */}
            <div className="z-30 relative group perspective-1000 transform hover:scale-[1.03] transition-all duration-500">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-accent rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
              <img
                src="/anunciosgov/cartel2.jpg"
                alt="Cartel Fiestas Patronales 2"
                className="max-h-[400px] sm:max-h-[460px] w-auto rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] border border-white/10 relative z-10 transform lg:rotate-2 group-hover:rotate-0 transition-transform duration-500"
              />
            </div>

            {/* ── CAPA Z-40: SERPENTINAS POR DELANTE DE TODO ── */}
            <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden">
              {fiestaTexts[3] && (
                <div className="absolute bottom-[10%] left-[25%] bg-gradient-to-r from-emerald-400 to-teal-500 text-neutral-950 text-xs sm:text-sm font-black tracking-widest uppercase px-6 py-3.5 rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.6)] transform animate-serpentina-front-1 whitespace-nowrap pointer-events-auto hover:scale-110 transition-transform cursor-pointer">
                  🚗 {fiestaTexts[3]}
                </div>
              )}
              {fiestaTexts[6] && (
                <div className="absolute top-[15%] right-[8%] bg-gradient-to-r from-purple-600 via-pink-600 to-accent text-white text-xs font-black tracking-widest uppercase px-6 py-3 rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.6)] transform animate-serpentina-front-2 whitespace-nowrap pointer-events-auto hover:scale-110 transition-transform cursor-pointer">
                  🎯 {fiestaTexts[6]}
                </div>
              )}
              {fiestaTexts[0] && (
                <div className="absolute top-[12%] left-[-2%] bg-gradient-to-r from-accent to-orange-500 text-accent-foreground text-xs font-black tracking-widest uppercase px-6 py-3 rounded-full shadow-lg border border-white/10 transform animate-serpentina-back-1 whitespace-nowrap">
                  🎗️ {fiestaTexts[0]}
                </div>
              )}

            </div>

            {/* ── CAPA Z-50: FUEGOS ARTIFICIALES DE TEXTO (DISPARADOR AUTOMÁTICO SI SUPERA LAS 10 FRASES) ── */}
            {fiestaTexts.length > 10 && (
              <div className="absolute inset-0 z-50 pointer-events-none">
                {fiestaTexts.slice(10).map((extraText, index) => (
                  <div
                    key={index}
                    className="absolute text-center animate-firework-explosion"
                    style={{
                      left: `${20 + (index * 25) % 60}%`,
                      top: `${30 + (index * 20) % 50}%`,
                      animationDelay: `${index * 2}s`
                    }}
                  >
                    <span className="text-xs sm:text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-accent to-pink-500 tracking-widest block uppercase whitespace-nowrap drop-shadow-[0_0_15px_rgba(255,77,0,0.8)]">
                      💥 {extraText} 💥
                    </span>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </section>


      <Footer />

      <style dangerouslySetInnerHTML={{
        __html: `
        
        /* ── ANIMACIONES SERPENTINAS (FIESTAS PATRONALES) ── */
        
        /* Capa trasera 1: Ondulación curva lenta de izquierda a derecha */
        @keyframes serpentina-back-1 {
          0%, 100% { transform: translate(0, 0) rotate(-4deg); }
          33% { transform: translate(15px, -10px) rotate(-1deg); }
          66% { transform: translate(-10px, 15px) rotate(-6deg); }
        }
        /* Capa trasera 2: Movimiento diagonal opuesto */
        @keyframes serpentina-back-2 {
          0%, 100% { transform: translate(0, 0) rotate(5deg); }
          50% { transform: translate(-25px, -15px) rotate(9deg); }
        }
        /* Capa trasera 3: Vaivén sutil */
        @keyframes serpentina-back-3 {
          0%, 100% { transform: translate(0, 0) rotate(-2deg); }
          50% { transform: translate(20px, 5px) rotate(2deg); }
        }

        /* Capa Media 1: Cruza el centro con balanceo de balance festivo */
        @keyframes serpentina-mid-1 {
          0%, 100% { transform: translate(-50%, -50%) rotate(4deg) scale(1); }
          50% { transform: translate(-48%, -54%) rotate(-2deg) scale(1.03); }
        }
        /* Capa Media 2: Trayectoria de flote flotante */
        @keyframes serpentina-mid-2 {
          0%, 100% { transform: translateY(0) rotate(-8deg); }
          50% { transform: translateY(-20px) rotate(-4deg); }
        }

        /* Capa Delantera 1: Gran vaivén por el frente (Simula flotar muy cerca de la pantalla) */
        @keyframes serpentina-front-1 {
          0%, 100% { transform: translate(0, 0) rotate(-3deg) scale(1); filter: drop-shadow(0 15px 20px rgba(0,0,0,0.6)); }
          50% { transform: translate(-15px, -25px) rotate(3deg) scale(1.05); filter: drop-shadow(0 30px 30px rgba(0,0,0,0.8)); }
        }
        /* Capa Delantera 2: Movimiento curvo orgánico descendente */
        @keyframes serpentina-front-2 {
          0%, 100% { transform: translate(0, 0) rotate(6deg) scale(1); }
          50% { transform: translate(25px, 20px) rotate(2deg) scale(1.04); }
        }

        /* Ejecución de tiempos descompasados para naturalidad */
        .animate-serpentina-back-1 { animation: serpentina-back-1 7s ease-in-out infinite; }
        .animate-serpentina-back-2 { animation: serpentina-back-2 8s ease-in-out infinite; }
        .animate-serpentina-back-3 { animation: serpentina-back-3 6s ease-in-out infinite; }
        .animate-serpentina-mid-1 { animation: serpentina-mid-1 5.5s ease-in-out infinite; }
        .animate-serpentina-mid-2 { animation: serpentina-mid-2 6.5s ease-in-out infinite; }
        .animate-serpentina-front-1 { animation: serpentina-front-1 5s ease-in-out infinite; }
        .animate-serpentina-front-2 { animation: serpentina-front-2 7.5s ease-in-out infinite; }

        /* ── ANIMACIÓN EFECTO FUEGO ARTIFICIAL (TEXT EXPLOSION) ── */
        @keyframes firework-explosion {
          0% { transform: scale(0.3) translateY(40px); opacity: 0; filter: blur(5px); }
          10% { opacity: 1; filter: blur(0px); }
          40% { transform: scale(1.1) translateY(-20px); opacity: 1; }
          60% { transform: scale(1) translateY(0px); opacity: 1; filter: drop-shadow(0 0 20px rgba(255,200,0,1)); }
          85%, 100% { transform: scale(0.8) translateY(15px); opacity: 0; filter: blur(8px); }
        }
        .animate-firework-explosion { 
          animation: firework-explosion 6s cubic-bezier(0.25, 1, 0.5, 1) infinite;
          will-change: transform, opacity;
        }

        @font-face {
            font-family: 'TVP-Heading';
            src: url('/TVP/TVP.ttf') format('truetype');
            font-weight: bold;
        }
        @font-face {
            font-family: 'TVP-Text';
            src: url('/TVP/TVPtext.ttf') format('truetype');
            font-weight: normal;
        }
        .font-tvp-head { font-family: 'TVP-Heading', sans-serif; }
        .font-tvp-text { font-family: 'TVP-Text', sans-serif; }
      `}} />

      <style>{`
  @keyframes marquee {
    0% {
      transform: translate3d(0, 0, 0);
    }
    100% {
      transform: translate3d(-50%, 0, 0);
    }
  }

  .custom-marquee {
    animation: marquee 35s linear infinite !important;
  }

  /* Por si acaso el hover de Tailwind no te funciona, aseguramos el pause aquí: */
  .custom-marquee:hover {
    animation-play-state: paused !important;
  }
`}</style>

    </div>
  );
}