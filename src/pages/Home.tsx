import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Link } from "wouter";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { supabase } from "../lib/supabaseClient";
import * as musicMetadata from "music-metadata-browser";
import {
  ArrowRight, ArrowUpRight, Banknote, CloudSun, Coins,
  Headphones, Landmark, Megaphone, Music2, Pause, Play, Radio,
  ShieldCheck, Sparkles, TrendingUp, Trophy, Volume2, WifiOff,
} from "lucide-react";

// Página Inicio | Liquid Glass v2
// Se conservan las rutas, los archivos multimedia y los servicios originales.
// Importante: el PANEX es un índice ficticio; no se presenta como cotización real.

type RegionWeather = {
  id: string; region: string; ciudad: string; lat: number; lon: number;
  temp?: number; description?: string; icon?: string; max?: number; min?: number;
};
type NewsItem = {
  id: string; category: string; title: string; summary?: string;
  time: string; img: string;
};
type NewsRow = {
  id: string; type: "main" | "secondary"; category: string; title: string;
  summary: string | null; time_label: string | null; img_url: string | null;
};
type Song = {
  id: number; src: string; title: string; artist: string; cover: string | null;
  startTime?: number; endTime?: number;
};
type MarketQuote = { price: number; change: number };
type MarketState = { ibex: MarketQuote | null; nikkei: MarketQuote | null; status: "loading" | "live" | "offline" };

const MARQUEE = [
  "El sistema de generación de DPIs está totalmente operativo",
  "Convocatoria de concursos: billetes de Panedas, imagen de TVP y línea evolutiva Pokémon",
  "Feliz primer aniversario del Reino del Pan. A por el segundo",
];
const METRICS = [
  { number: "2025", label: "Año de fundación", detail: "El proyecto comenzó el 23 de julio de 2025", icon: Landmark },
  { number: "500+", label: "Solicitudes de DPI", detail: "Cifra de referencia publicada por el proyecto", icon: ShieldCheck },
  { number: "100%", label: "Compromiso", detail: "Libertad, convivencia y renovación", icon: Sparkles },
  { number: "Aviso", label: "Situación fronteriza", detail: "Fronteras cerradas hasta nuevo aviso", icon: Megaphone },
];
const REGIONS: RegionWeather[] = [
  { id: "baguette", region: "Baguette 🥖", ciudad: "Pantopía", lat: 37.3828, lon: -5.9732 },
  { id: "pimbo", region: "Pimbo 🍞", ciudad: "Pimbolandia", lat: 40.9688, lon: -5.6639 },
  { id: "pretzel", region: "Pretzel 🥨", ciudad: "Pretzelopolis", lat: 39.4698, lon: -0.3763 },
  { id: "croissant", region: "Croissant 🥐", ciudad: "Vila Croissant", lat: 43.4832, lon: -1.5586 },
  { id: "singluten", region: "Sin Glúten 🌾", ciudad: "ChinPan", lat: 34.0522, lon: -118.2437 },
  { id: "panplano", region: "Pan Plano/Arepa 🫓", ciudad: "Arepa", lat: -34.6037, lon: -58.3816 },
];
const SONG_FILES = [
  { id: 1, src: "/canciones/1.mp3", title: "Sin Explicacion3s", artist: "Dellafuente", cover: "/canciones/1.jpg", startTime: 30, endTime: 190 },
  { id: 2, src: "/canciones/2.m4a", title: "Perro", artist: "Bad Gyal y Victor Mendivil", cover: "/canciones/2.avif" },
  { id: 3, src: "/canciones/3.mp3", title: "Conexión", artist: "Cano y JC Reyes", cover: "/canciones/3.jpg" },
] satisfies Song[];
const CONTESTS = [
  { href: "/concursos/paneda", eyebrow: "Economía nacional", title: "Diseño de la Paneda", description: "Diseña los billetes oficiales y la identidad visual de la moneda paniense.", icon: Coins, color: "#C18A35" },
  { href: "/concursos/lineapoke", eyebrow: "Biodiversidad", title: "Línea Evolutiva", description: "Imagina una nueva línea evolutiva completa para el ecosistema Pokémon.", icon: Sparkles, color: "#BD83B5" },
  { href: "/concursos/imagentvp", eyebrow: "Medios públicos", title: "Identidad de TVP", description: "Participa en el diseño gráfico de la televisión paniense.", icon: Radio, color: "#FF6A30" },
];

function weatherDescription(code: number) {
  if (code === 0) return { description: "Despejado", icon: "☀️" };
  if ([1, 2, 3].includes(code)) return { description: "Parcialmente nublado", icon: "⛅" };
  if ([45, 48].includes(code)) return { description: "Niebla", icon: "🌫️" };
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { description: "Lluvia", icon: "🌧️" };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { description: "Nieve", icon: "❄️" };
  if ([95, 96, 99].includes(code)) return { description: "Tormenta", icon: "⛈️" };
  return { description: "Variable", icon: "🌤️" };
}
function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  return `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, "0")}`;
}
function formatPrice(price: number) {
  return price.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Home() {
  const [mainNews, setMainNews] = useState<NewsItem | null>(null);
  const [secondaryNews, setSecondaryNews] = useState<NewsItem[]>([]);
  const [newsStatus, setNewsStatus] = useState<"loading" | "ready" | "offline">("loading");
  const [weather, setWeather] = useState<RegionWeather[]>([]);
  const [weatherStatus, setWeatherStatus] = useState<"loading" | "ready" | "offline">("loading");
  const [markets, setMarkets] = useState<MarketState>({ ibex: null, nikkei: null, status: "loading" });
  const [songs, setSongs] = useState<Song[]>(SONG_FILES);
  const [selected, setSelected] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [fullSong, setFullSong] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrls = useRef<string[]>([]);
  const activeSong = songs.find(s => s.id === selected) ?? songs[0];

  // Noticias reales: no se muestran noticias inventadas ni rótulos ficticios de última hora.
  useEffect(() => {
    let mounted = true;
    async function getNews() {
      if (!supabase) { if (mounted) setNewsStatus("offline"); return; }
      try {
        const { data, error } = await supabase.from("tvp_news")
          .select("id,type,category,title,summary,time_label,img_url")
          .order("created_at", { ascending: false }).limit(15);
        if (error) throw error;
        const rows = (data ?? []) as NewsRow[];
        const toNews = (item: NewsRow): NewsItem => ({
          id: String(item.id), category: item.category || "ACTUALIDAD", title: item.title,
          summary: item.summary || "", time: item.time_label || "TVP Noticias",
          img: item.img_url || "/TVP/TVP.png",
        });
        if (mounted) {
          const main = rows.find(n => n.type === "main");
          const secondary = rows.filter(n => n.type === "secondary").slice(0, 2);
          setMainNews(main ? toNews(main) : null);
          setSecondaryNews(secondary.map(toNews));
          setNewsStatus(rows.length ? "ready" : "offline");
        }
      } catch (error) {
        console.warn("TVP Noticias no está disponible:", error);
        if (mounted) setNewsStatus("offline");
      }
    }
    getNews();
    return () => { mounted = false; };
  }, []);

  // Open-Meteo devuelve un objeto por ubicación en consultas con varios pares lat/lon.
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    async function getWeather() {
      try {
        const lats = REGIONS.map(r => r.lat).join(",");
        const lons = REGIONS.map(r => r.lon).join(",");
        const endpoint = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
        const response = await fetch(endpoint, { signal: controller.signal });
        if (!response.ok) throw new Error("Error meteorológico HTTP " + response.status);
        const raw: unknown = await response.json();
        const entries = Array.isArray(raw) ? raw : [raw];
        if (entries.length !== REGIONS.length) throw new Error("Datos meteorológicos incompletos");
        const updated = REGIONS.map((region, index) => {
          const entry = entries[index];
          const value = entry?.current?.temperature_2m;
          const code = entry?.current?.weather_code;
          if (typeof value !== "number" || typeof code !== "number") throw new Error("Datos meteorológicos no válidos");
          const summary = weatherDescription(code);
          return {
            ...region, temp: Math.round(value), ...summary,
            max: entry?.daily?.temperature_2m_max?.[0],
            min: entry?.daily?.temperature_2m_min?.[0],
          };
        });
        if (mounted) { setWeather(updated); setWeatherStatus("ready"); }
      } catch (error) {
        if (controller.signal.aborted) return;
        console.warn("No se pudo consultar el tiempo:", error);
        if (mounted) setWeatherStatus("offline");
      }
    }
    getWeather();
    const interval = window.setInterval(getWeather, 10 * 60 * 1000);
    return () => { mounted = false; controller.abort(); window.clearInterval(interval); };
  }, []);

  // Yahoo Finance puede bloquear peticiones directas desde el navegador (CORS).
  // Si falla, mostrar indisponible en vez de cotizaciones antiguas como si fueran nuevas.
  useEffect(() => {
    let mounted = true;
    async function getMarkets() {
      try {
        const response = await fetch("https://query1.finance.yahoo.com/v7/finance/quote?symbols=%5EIBEX,%5EN225");
        if (!response.ok) throw new Error("Cotizaciones no disponibles");
        const payload = await response.json();
        const quotes = payload?.quoteResponse?.result;
        const quote = (symbol: string): MarketQuote | null => {
          const row = Array.isArray(quotes) ? quotes.find(q => q.symbol === symbol) : undefined;
          return typeof row?.regularMarketPrice === "number" && typeof row?.regularMarketChangePercent === "number"
            ? { price: row.regularMarketPrice, change: row.regularMarketChangePercent } : null;
        };
        const ibex = quote("^IBEX"); const nikkei = quote("^N225");
        if (!ibex || !nikkei) throw new Error("Respuesta bursátil incompleta");
        if (mounted) setMarkets({ ibex, nikkei, status: "live" });
      } catch {
        if (mounted) setMarkets({ ibex: null, nikkei: null, status: "offline" });
      }
    }
    getMarkets();
    const interval = window.setInterval(getMarkets, 60_000);
    return () => { mounted = false; window.clearInterval(interval); };
  }, []);

  useEffect(() => {
    let active = true;
    async function readMetadata() {
      const loaded = await Promise.all(SONG_FILES.map(async (fallback) => {
        try {
          const metadata = await Promise.race([
            musicMetadata.fetchFromUrl(fallback.src),
            new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error("Tiempo agotado")), 2200)),
          ]);
          const picture = metadata.common.picture?.[0];
          let cover: string | null = fallback.cover;
          if (picture && active) {
            const blob = new Blob([Uint8Array.from(picture.data)], { type: picture.format });
            cover = URL.createObjectURL(blob);
            objectUrls.current.push(cover);
          }
          return { ...fallback, title: metadata.common.title || fallback.title,
            artist: metadata.common.artist || fallback.artist, cover };
        } catch { return fallback; }
      }));
      if (active) setSongs(loaded);
    }
    readMetadata();
    return () => {
      active = false;
      objectUrls.current.forEach(url => URL.revokeObjectURL(url));
      objectUrls.current = [];
    };
  }, []);

  // No reproducimos automáticamente al entrar en la página.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause(); setPlaying(false); setDuration(0); setCurrentTime(0);
    audio.load();
    const seek = () => {
      if (activeSong.startTime !== undefined) {
        audio.currentTime = activeSong.startTime;
        setCurrentTime(activeSong.startTime);
      }
    };
    audio.addEventListener("loadedmetadata", seek, { once: true });
    return () => audio.removeEventListener("loadedmetadata", seek);
  }, [selected]); // Cambio de pista; metadatos de título y carátula no reinician el audio.

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try { await audio.play(); setPlaying(true); } catch { setPlaying(false); }
    } else { audio.pause(); setPlaying(false); }
  };
  const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = Number(event.target.value);
    audio.currentTime = time; setCurrentTime(time);
  };
  const onTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!fullSong && selected === 1 && activeSong.endTime !== undefined && audio.currentTime >= activeSong.endTime) {
      audio.pause(); setPlaying(false);
    }
    setCurrentTime(audio.currentTime);
  };

  return (
    <div className="home-v2 min-h-screen flex flex-col">
      <style>{`
        .home-v2{--hm-purple:#630B57;--hm-soft:#AB72A3;--hm-ink:#251C26;background:#FAF5F9;color:var(--hm-ink);overflow-x:clip;font-family:var(--body-font,Inter,system-ui,sans-serif)}
        .home-v2 *, .home-v2 *::before,.home-v2 *::after{box-sizing:border-box}
        .home-v2 main h1,.home-v2 section h2,.home-v2 section h3,.home-v2 section h4{font-size-adjust:none!important;line-height:1.17;letter-spacing:-.035em;font-family:var(--body-font,Inter,system-ui,sans-serif);font-weight:800;overflow-wrap:break-word}
        .hm-wrap{width:min(1220px,100%);margin-inline:auto;padding-inline:clamp(16px,3vw,32px)}
        .hm-glass{background:linear-gradient(130deg,rgba(255,255,255,.88),rgba(255,255,255,.55) 55%,rgba(246,230,243,.7));border:1px solid rgba(255,255,255,.92);box-shadow:inset 0 1px 0 #fff,0 15px 42px rgba(70,27,65,.09),0 2px 8px rgba(70,27,65,.04);-webkit-backdrop-filter:blur(20px) saturate(155%);backdrop-filter:blur(20px) saturate(155%)}
        .hm-pill{display:inline-flex;align-items:center;gap:7px;border-radius:999px;padding:8px 13px;border:1px solid #d8bad2;background:rgba(255,255,255,.78);font-size:10px;font-weight:850;letter-spacing:.13em;text-transform:uppercase;color:#630B57}
        .hm-heading{font-size:clamp(28px,4.2vw,45px)!important;margin:9px 0 0;color:#311F2F}
        .hm-section{padding-block:clamp(48px,7vw,90px)}
        .hm-intro{margin-bottom:26px;display:flex;align-items:end;justify-content:space-between;gap:16px}
        .hm-muted{font-size:13px;line-height:1.7;color:#786676;max-width:440px}
        .hm-marquee{overflow:hidden;background:linear-gradient(105deg,#823476,#630B57);color:#fff;border-block:1px solid rgba(255,255,255,.14)}
        .hm-ticker{display:flex;width:max-content;animation:hmMarquee 40s linear infinite}
        .hm-ticker-group{display:flex;align-items:center;gap:44px;padding-right:44px;white-space:nowrap;flex-shrink:0;font:700 11px/1.6 ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase;padding-block:11px}
        .hm-ticker-item{display:inline-flex;align-items:center;gap:12px}
        .hm-ticker-item span{opacity:.58}
        .hm-marquee:hover .hm-ticker,.hm-marquee:focus-within .hm-ticker{animation-play-state:paused}
        @keyframes hmMarquee{to{transform:translateX(-50%)}}
        .hm-hero{position:relative;isolation:isolate;min-height:clamp(570px,65vw,730px);display:flex;align-items:center;overflow:hidden;background:#130D17;color:#fff;padding-block:clamp(56px,9vw,98px)}
        .hm-hero-video,.hm-hero-overlay{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
        .hm-hero-video{object-fit:cover;filter:brightness(.68) saturate(.85)}
        .hm-hero-overlay{background:linear-gradient(90deg,rgba(14,7,17,.94) 0%,rgba(24,13,29,.86) 42%,rgba(30,13,35,.6) 100%)}
        .hm-hero-content{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,1.06fr) minmax(0,.94fr);gap:clamp(28px,5vw,70px);align-items:center}
        .hm-hero h1{font-size:clamp(40px,5.3vw,74px)!important;line-height:1.06!important;letter-spacing:-.055em!important;font-weight:900;overflow-wrap:normal}
        .hm-hero h1 span{display:block}
        .hm-hero h1 .hm-brandline{color:#E5B4DE;letter-spacing:-.055em}
        .hm-strike{text-decoration:line-through;text-decoration-thickness:clamp(2px,.25vw,4px);text-decoration-color:#fff;text-decoration-skip-ink:none}
        .hm-hero-desc{max-width:570px;margin-top:22px;font-size:clamp(14px,1.3vw,16px);line-height:1.85;color:#E6DDE7}
        .hm-actions{display:flex;flex-wrap:wrap;gap:11px;margin-top:29px}
        .hm-action{display:inline-flex;align-items:center;justify-content:center;gap:9px;min-height:46px;padding:12px 18px;border:1px solid rgba(255,255,255,.25);border-radius:15px;font-size:12px;font-weight:850;transition:transform .22s,background .22s,box-shadow .22s}
        .hm-action:hover{transform:translateY(-2px)}
        .hm-action-primary{background:#fff;color:#531449}.hm-action-primary:hover{background:#FAEBF7}
        .hm-action-secondary{background:rgba(159,79,147,.35);color:#fff;-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px)}
        .hm-action-secondary:hover{background:rgba(159,79,147,.55)}
        .hm-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
        .hm-metric{padding:clamp(17px,2.6vw,25px);background:rgba(31,20,38,.47);border:1px solid rgba(255,255,255,.19);border-radius:22px;box-shadow:inset 0 1px 1px rgba(255,255,255,.09);-webkit-backdrop-filter:blur(19px);backdrop-filter:blur(19px)}
        .hm-metric-top{display:flex;align-items:center;justify-content:space-between;gap:7px;color:#E3B1DB}
        .hm-metric-number{font-size:clamp(23px,3.1vw,37px);line-height:1.1;font-weight:850;color:#fff;margin:15px 0 7px}
        .hm-metric-label{font-size:13px;color:#fff;font-weight:750}
        .hm-metric small{display:block;margin-top:7px;color:#CEC0D0;font-size:11px;line-height:1.5}
        .hm-night{background:linear-gradient(160deg,#160F1B 0%,#211226 70%,#170E1A 100%);color:#fff}
        .hm-duo{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}
        .hm-night-glass{background:linear-gradient(140deg,rgba(255,255,255,.1),rgba(255,255,255,.045));border:1px solid rgba(255,255,255,.16);border-radius:26px;box-shadow:inset 0 1px 1px rgba(255,255,255,.08),0 15px 30px rgba(0,0,0,.14);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px)}
        .hm-panel{padding:clamp(19px,3vw,32px);min-width:0}
        .hm-panel-header{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:9px;margin-bottom:18px}
        .hm-panel-title{font-size:clamp(20px,2.5vw,26px)!important;color:#fff;margin:14px 0 16px}
        .hm-song{width:100%;display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.045);border:1px solid transparent;border-radius:15px;padding:10px 12px;color:#eee3ef;text-align:left;transition:background .2s,border .2s}
        .hm-song+.hm-song{margin-top:8px}.hm-song:hover{background:rgba(255,255,255,.09)}
        .hm-song[data-active=true]{border-color:rgba(221,169,213,.43);background:rgba(99,11,87,.29)}
        .hm-song img{width:45px;height:45px;object-fit:cover;border-radius:10px;background:#38243e}
        .hm-song strong{display:block;font-size:13px;line-height:1.3;overflow-wrap:anywhere}
        .hm-song small{display:block;font-size:11px;color:#BDB1C2;margin-top:4px;line-height:1.35}
        .hm-player{margin-top:21px;border-top:1px solid rgba(255,255,255,.14);padding-top:20px}
        .hm-progress{width:100%;accent-color:#D7A2CF;cursor:pointer;margin-block:12px}
        .hm-play-button{display:grid;place-items:center;width:45px;height:45px;flex-shrink:0;border-radius:50%;background:#D9A6D0;color:#31152F;transition:background .2s}
        .hm-play-button:hover{background:#F4C6EA}
        .hm-market{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px;border-radius:16px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.09);margin-top:10px}
        .hm-market span{font-size:10px;color:#D0B6CF;text-transform:uppercase;letter-spacing:.08em}
        .hm-market strong{display:block;font-size:18px;line-height:1.3;color:#fff;margin-top:3px}
        .hm-market-value{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
        .hm-market-value b{display:block;font-size:16px}
        .hm-market-value small{display:block;font-size:11px;margin-top:5px}
        .hm-sponsor img{display:block;width:100%;height:auto}
        .hm-weather-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
        .hm-weather{padding:22px;min-width:0;border-radius:23px;display:flex;flex-direction:column;min-height:181px;justify-content:space-between}
        .hm-weather-head{display:flex;justify-content:space-between;align-items:start;gap:6px}
        .hm-weather-head small{font-size:11px;color:#916989;font-weight:800}
        .hm-weather-head strong{font-size:18px;color:#392638;display:block;margin-top:5px}
        .hm-weather-temperature{font-size:clamp(25px,3vw,38px);font-weight:850;line-height:1;color:#630B57}
        .hm-weather-bottom{display:flex;justify-content:space-between;align-items:end;gap:10px}
        .hm-weather-bottom small{font-size:11px;line-height:1.65;color:#766474}
        .hm-feature{display:flex;flex-direction:column;justify-content:space-between;padding:clamp(21px,3vw,35px);min-height:265px;border-radius:27px;min-width:0}
        .hm-feature p{margin-top:13px;line-height:1.75;font-size:14px;color:#716070}
        .hm-feature h3{font-size:clamp(22px,2.7vw,31px)!important;color:#372336;margin-top:14px}
        .hm-feature-bottom{display:flex;align-items:end;justify-content:space-between;gap:15px;margin-top:26px}
        .hm-feature-bottom img{max-width:150px;max-height:120px;object-fit:contain}
        .hm-dark-title{color:#fff!important}
        .hm-contest-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
        .hm-contest{display:flex;flex-direction:column;min-height:255px;border-radius:24px;padding:25px;transition:transform .22s,border-color .22s;min-width:0}
        .hm-contest:hover{transform:translateY(-4px);border-color:rgba(255,255,255,.4)}
        .hm-contest-icon{display:grid;place-items:center;width:50px;height:50px;border-radius:15px;background:rgba(255,255,255,.08)}
        .hm-contest h3{font-size:21px!important;color:#fff;margin:20px 0 11px}
        .hm-contest p{font-size:13px;line-height:1.75;color:#CFC4D2;flex:1}
        .hm-tvp{background:linear-gradient(135deg,#17131B,#241826);border:1px solid rgba(255,255,255,.15);border-radius:28px;padding:clamp(18px,3.4vw,35px);box-shadow:0 18px 50px rgba(31,13,31,.2)}
        .hm-tvp-grid{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(0,1fr);gap:15px}
        .hm-news-card{border-radius:19px;overflow:hidden;display:flex;flex-direction:column;background:#ffffff0d;border:1px solid #ffffff17;min-width:0}
        .hm-news-card>img{width:100%;aspect-ratio:16/9;object-fit:cover;background:#201823}
        .hm-news-body{padding:clamp(15px,2.4vw,26px)}
        .hm-news-body h3{font-size:clamp(19px,2.6vw,30px)!important;color:#fff;margin-top:12px}
        .hm-news-body h4{font-size:17px!important;color:#fff;margin-top:7px}
        .hm-news-body p{font-size:13px;color:#CABDCD;line-height:1.75;margin-top:12px}
        .hm-news-tag{color:#FF8C5E;font-size:10px;letter-spacing:.13em;text-transform:uppercase;font-weight:800}
        .hm-news-others{display:grid;gap:12px}
        .hm-news-small{display:grid;grid-template-columns:110px 1fr;align-items:center;gap:12px}
        .hm-news-small>img{width:110px;height:100%;min-height:125px;object-fit:cover}
        .hm-news-small .hm-news-body{padding:12px 12px 12px 0}
        .hm-soft-panel{border-radius:21px;padding:22px;text-align:center;background:#fff8;border:1px dashed #ccabc6;color:#765b70;line-height:1.7}
        .home-v2 a:focus-visible,.home-v2 button:focus-visible,.home-v2 input:focus-visible{outline:3px solid #CB8AC0;outline-offset:3px}
        @media(max-width:1000px){.hm-hero-content{grid-template-columns:1fr}.hm-hero{min-height:auto}.hm-hero-overlay{background:linear-gradient(100deg,#110a14eF,#26182dd1)}.hm-weather-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.hm-tvp-grid{grid-template-columns:1fr}.hm-news-others{grid-template-columns:repeat(2,minmax(0,1fr))}.hm-news-small{grid-template-columns:1fr}.hm-news-small>img{width:100%;height:auto;min-height:0;aspect-ratio:16/9}.hm-news-small .hm-news-body{padding:17px}}
        @media(max-width:700px){.hm-intro{display:block}.hm-intro .hm-muted{margin-top:11px}.hm-duo{grid-template-columns:1fr}.hm-contest-grid{grid-template-columns:1fr}.hm-contest{min-height:218px}.hm-weather-grid{grid-template-columns:1fr 1fr}.hm-hero h1{font-size:clamp(34px,9vw,55px)!important}.hm-hero{padding-block:55px}.hm-metrics{gap:9px}.hm-metric{padding:16px}.hm-news-others{grid-template-columns:1fr}.hm-news-small{grid-template-columns:110px 1fr}.hm-news-small>img{width:110px;height:100%;min-height:120px;aspect-ratio:auto}.hm-news-small .hm-news-body{padding:13px 12px 13px 0}}
        @media(max-width:410px){.hm-weather-grid{grid-template-columns:1fr}.hm-actions>a{width:100%}.hm-hero h1{font-size:34px!important}.hm-metric-number{font-size:23px}.hm-market{gap:5px}.hm-market-value b{font-size:13px}.hm-news-small{grid-template-columns:1fr}.hm-news-small>img{width:100%;height:auto;min-height:0;aspect-ratio:16/9}.hm-news-small .hm-news-body{padding:15px}}
        @media(prefers-reduced-motion:reduce){.home-v2 *,.home-v2 *::before,.home-v2 *::after{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}.hm-ticker{animation:none!important}}
      `}</style>
      <Header />

      <div className="hm-marquee" role="region" aria-label="Tablón de anuncios institucionales">
        <div className="hm-ticker">
          {[0, 1].map(copy => (
            <div className="hm-ticker-group" key={copy} aria-hidden={copy === 1 ? "true" : undefined}>
              {MARQUEE.map(item => <div key={item} className="hm-ticker-item"><span>✦</span>{item}</div>)}
            </div>
          ))}
        </div>
      </div>

      <main className="hm-hero" id="inicio">
        <video className="hm-hero-video" autoPlay loop muted playsInline preload="metadata" poster="/videos/hero-poster.jpg" aria-hidden="true">
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div className="hm-hero-overlay" />
        <div className="hm-wrap hm-hero-content">
          <div>
            <span className="hm-pill" style={{ background: "#ffffff17", color: "#F2C5EA", borderColor: "#ffffff38" }}><Landmark size={13} /> Portal institucional</span>
            <h1 className="mt-6">
              <span>Nuestra tierra.</span><span>Nuestra gente.</span>
              <span className="hm-brandline"><s className="hm-strike">REINO DEL</s> PAN</span>
            </h1>
            <p className="hm-hero-desc">Un estado digital y territorial dedicado a la paz, la reconciliación social, la ecología activa y la gobernanza del siglo XXI. Sé parte de la construcción de una nueva nación soberana.</p>
            <div className="hm-actions">
              <Link href="/about" className="hm-action hm-action-primary">Conocer el proyecto <ArrowRight size={16} /></Link>
              <Link href="/dpi" className="hm-action hm-action-secondary">Obtener DPI <ShieldCheck size={17} /></Link>
            </div>
          </div>
          <div className="hm-metrics">
            {METRICS.map(({ number, label, detail, icon: Icon }) => (
              <div className="hm-metric" key={label}>
                <div className="hm-metric-top"><Icon size={20} aria-hidden="true" /><span style={{ fontSize: 10, fontWeight: 800 }}>ARTIS PANIS</span></div>
                <div className="hm-metric-number">{number}</div>
                <div className="hm-metric-label">{label}</div><small>{detail}</small>
              </div>
            ))}
          </div>
        </div>
      </main>

      <section className="hm-section hm-night" aria-label="Música y mercados">
        <div className="hm-wrap">
          <div className="hm-intro"><div><span className="hm-pill" style={{ background: "#ffffff17", borderColor: "#ffffff29", color: "#E3BADB" }}>Ecosistema paniense</span><h2 className="hm-heading hm-dark-title">En movimiento.</h2></div><p className="hm-muted" style={{ color: "#C5B5C9" }}>Música de nuestra comunidad e información sobre los mercados, cada cosa en su sitio.</p></div>
          <div className="hm-duo">
            <div className="hm-night-glass hm-panel">
              <div className="hm-panel-header"><span className="hm-pill" style={{ background: "#ffffff0f", borderColor: "#ffffff27", color: "#E6C1DF" }}><Headphones size={14} /> Selección musical</span><span style={{ fontSize: 11, color: "#B6A8BA" }}>TOP 3 · Música</span></div>
              <h3 className="hm-panel-title">Éxitos en Pantopía</h3>
              <audio ref={audioRef} src={activeSong.src} preload="metadata" onTimeUpdate={onTimeUpdate} onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)} onEnded={() => setPlaying(false)} onPause={() => setPlaying(false)} aria-label="Reproductor musical" />
              <div role="group" aria-label="Lista de canciones">
                {songs.map(song => (
                  <button key={song.id} type="button" className="hm-song" data-active={selected === song.id} onClick={() => { if (song.id !== selected) { setSelected(song.id); setFullSong(false); } else { void togglePlay(); } }}>
                    <span style={{ fontSize: 11, minWidth: 20, color: "#BCAEC1" }}>{String(song.id).padStart(2, "0")}</span>
                    {song.cover ? <img src={song.cover} alt="" onError={(e) => { e.currentTarget.style.opacity = "0.2"; }} /> : <Music2 size={25} />}
                    <span style={{ minWidth: 0, flex: 1 }}><strong>{song.title}</strong><small>{song.artist}</small></span>
                    {selected === song.id && (playing ? <Volume2 size={17} color="#DDA6D4" /> : <Play size={17} color="#DDA6D4" />)}
                  </button>
                ))}
              </div>
              <div className="hm-player">
                <div className="flex justify-between text-[11px] text-white/60"><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div>
                <input className="hm-progress" type="range" min={0} max={duration || 1} step={0.1} value={Math.min(currentTime, duration || 1)} onChange={handleSeek} aria-label="Posición de reproducción" />
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => void togglePlay()} className="hm-play-button" aria-label={playing ? "Pausar" : "Reproducir"}>{playing ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" />}</button>
                  <div className="flex-1 min-w-0"><div className="font-bold text-sm truncate">{activeSong.title}</div><div className="text-xs text-white/55 truncate">{activeSong.artist}</div></div>
                  {activeSong.endTime !== undefined && <button type="button" onClick={() => setFullSong(v => !v)} aria-pressed={fullSong} className="rounded-xl border border-white/20 px-3 py-2 text-[11px] text-white/80 hover:bg-white/10">{fullSong ? "Completa" : "Fragmento"}</button>}
                  <img src="/flag.png" alt="Bandera paniense" className="w-7 h-5 object-cover rounded" />
                </div>
              </div>
            </div>
            <div className="hm-night-glass hm-panel">
              <div className="hm-panel-header"><span className="hm-pill" style={{ background: "#ffffff0f", borderColor: "#ffffff27", color: "#E6C1DF" }}><TrendingUp size={14} /> Panorama financiero</span><span className="text-[11px] text-white/60">{markets.status === "live" ? "Datos consultados" : markets.status === "loading" ? "Consultando…" : "Servicio no disponible"}</span></div>
              <h3 className="hm-panel-title">Índices bursátiles</h3>
              {markets.status === "offline" && <p className="text-sm text-white/60 leading-relaxed mb-4">No se han podido obtener cotizaciones verificadas desde el navegador. Se omiten los valores anteriores para evitar mostrar precios obsoletos.</p>}
              <div className="hm-market" style={{ borderColor: "#C7A36E55", background: "#B4872E12" }}>
                <div><span>Índice ficticio · Reino del Pan</span><strong>PANEX 75</strong></div>
                <div className="hm-market-value"><b style={{ color: "#E5BA75" }}>Simulado</b><small style={{ color: "#CFC1C3" }}>Sin cotización real</small></div>
              </div>
              {[{ label: "España", title: "IBEX 35", quote: markets.ibex }, { label: "Japón", title: "Nikkei 225", quote: markets.nikkei }].map(row => (
                <div key={row.title} className="hm-market">
                  <div><span>{row.label}</span><strong>{row.title}</strong></div>
                  <div className="hm-market-value"><b>{row.quote ? formatPrice(row.quote.price) : "—"}</b><small style={{ color: row.quote ? (row.quote.change >= 0 ? "#86E1B2" : "#FF9BA6") : "#BAAABB" }}>{row.quote ? `${row.quote.change >= 0 ? "+" : ""}${row.quote.change.toFixed(2)}%` : "No disponible"}</small></div>
                </div>
              ))}
              <p className="mt-5 text-xs text-white/50 leading-relaxed">Las cifras se actualizan únicamente cuando el proveedor responde correctamente. PANEX 75 es un elemento del universo ficticio paniense.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="hm-sponsor" aria-label="Anuncio institucional"><img src="/anunciosgov/seguimosavanzando.jpg" alt="Anuncio institucional: Seguimos avanzando" loading="lazy" /></section>

      <section className="hm-section" aria-labelledby="weather-title">
        <div className="hm-wrap">
          <div className="hm-intro"><div><span className="hm-pill"><CloudSun size={14} /> Servicio meteorológico</span><h2 id="weather-title" className="hm-heading">El tiempo en nuestras regiones.</h2></div><p className="hm-muted">Datos obtenidos de Open-Meteo para las coordenadas configuradas de cada región.</p></div>
          {weatherStatus === "loading" ? <div className="hm-soft-panel" role="status">Consultando el servicio meteorológico…</div>
            : weatherStatus === "offline" ? <div className="hm-soft-panel" role="status"><WifiOff size={24} className="mx-auto mb-3" />No hemos podido cargar la previsión. Vuelve a intentarlo más tarde.</div>
            : <div className="hm-weather-grid">{weather.map(item => (
              <article key={item.id} className="hm-weather hm-glass">
                <div className="hm-weather-head"><div><small>REGIÓN {item.region}</small><strong>{item.ciudad}</strong></div><span className="text-3xl" aria-hidden="true">{item.icon}</span></div>
                <div className="hm-weather-bottom"><div><div className="hm-weather-temperature">{item.temp}°</div><small>{item.description}<br />{typeof item.max === "number" && typeof item.min === "number" ? `Máx. ${Math.round(item.max)}° · Mín. ${Math.round(item.min)}°` : ""}</small></div><CloudSun size={21} color="#A06997" aria-hidden="true" /></div>
              </article>
            ))}</div>}
        </div>
      </section>

      <section className="hm-section" style={{ background: "linear-gradient(145deg,#F3E6F0,#F9F4F8)" }} aria-label="Actualidad y proyectos">
        <div className="hm-wrap hm-duo">
          <article className="hm-feature hm-glass"><div><span className="hm-pill"><Banknote size={14} /> Alianza financiera</span><h3>Laboral Panian Bank</h3><p>El Gobierno del Reino del Pan y Laboral Kutxa han alcanzado un acuerdo para crear Laboral Panian Bank, una entidad destinada al ahorro, la inversión y el crecimiento económico paniense.</p></div><div className="hm-feature-bottom"><span className="text-xs font-bold" style={{ color: "#630B57" }}>El futuro de la banca paniense</span><img src="/LK.png" alt="Laboral Kutxa" loading="lazy" /></div></article>
          <article className="hm-feature hm-glass"><div><span className="hm-pill"><Trophy size={14} /> Descubrimiento Pokémon</span><h3>Tercer inicial revelado</h3><p>Cyndaquil es oficialmente el tercer inicial anunciado para el ecosistema paniense. Su naturaleza y sus capacidades abren una nueva etapa de exploración.</p></div><div className="hm-feature-bottom"><Link href="/pkmn" className="text-xs font-bold inline-flex items-center gap-1" style={{ color: "#630B57" }}>Explorar Pokémon Pania <ArrowUpRight size={15} /></Link><img src="/pkmn/cyndaquil.png" alt="Cyndaquil" loading="lazy" /></div></article>
        </div>
      </section>

      <section className="hm-section hm-night" aria-labelledby="contests-title">
        <div className="hm-wrap"><div className="hm-intro"><div><span className="hm-pill" style={{ background: "#ffffff17", color: "#EEC8E8", borderColor: "#ffffff36" }}>Convocatorias abiertas</span><h2 className="hm-heading hm-dark-title" id="contests-title">Concursos del Reino.</h2></div><p className="hm-muted" style={{ color: "#CBBDCF" }}>Participa en el desarrollo de la identidad y los proyectos de nuestro territorio.</p></div>
          <div className="hm-contest-grid">{CONTESTS.map(({ href, eyebrow, title, description, icon: Icon, color }) => (
            <Link href={href} key={href} className="hm-contest hm-night-glass"><span className="hm-contest-icon" style={{ color }}><Icon size={26} /></span><small className="uppercase tracking-widest font-bold mt-4" style={{ color, fontSize: 10 }}>{eyebrow}</small><h3>{title}</h3><p>{description}</p><span className="mt-5 inline-flex gap-2 items-center text-xs font-bold" style={{ color }}>Ver bases y participar <ArrowRight size={15} /></span></Link>
          ))}</div>
        </div>
      </section>

      <section className="hm-section" aria-labelledby="tvp-news-title">
        <div className="hm-wrap"><div className="hm-tvp"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-5 mb-5"><div className="flex gap-3 items-center"><img src="/TVP/TVP.png" alt="TVP" className="h-8 w-auto object-contain" loading="lazy" /><div><div className="text-[10px] uppercase tracking-widest text-[#FF8C5E] font-bold">Corporación paniense</div><h2 id="tvp-news-title" className="text-white text-xl mt-1">TVP Noticias</h2></div></div><Link href="/tvp" className="hm-action" style={{ background: "#FF4D00", color: "#1E0B07", border: "none", minHeight: 41 }}>Portal TVP <ArrowUpRight size={15} /></Link></div>
          {newsStatus === "loading" ? <div className="text-sm text-white/70 py-12 text-center" role="status">Cargando las noticias del servidor de TVP…</div>
            : newsStatus === "offline" ? <div className="text-sm text-white/70 py-12 text-center">No hay noticias disponibles en este momento. Puedes consultar el <Link href="/tvp" className="text-[#FF8C5E] underline">portal TVP</Link>.</div>
            : <div className="hm-tvp-grid">{mainNews ? <article className="hm-news-card"><img src={mainNews.img} alt="" loading="lazy" /><div className="hm-news-body"><div className="hm-news-tag">{mainNews.category} · {mainNews.time}</div><h3>{mainNews.title}</h3><p>{mainNews.summary}</p></div></article> : <div className="hm-news-card hm-news-body text-white/65">Sin noticia principal publicada.</div>}
              <div className="hm-news-others">{secondaryNews.length ? secondaryNews.map(news => <article key={news.id} className="hm-news-card hm-news-small"><img src={news.img} alt="" loading="lazy" /><div className="hm-news-body"><span className="hm-news-tag">{news.category}</span><h4>{news.title}</h4><span className="text-[11px] text-white/45 mt-2 block">{news.time}</span></div></article>) : <div className="hm-news-card hm-news-body text-white/60">Sin noticias secundarias publicadas.</div>}</div>
            </div>}
        </div></div>
      </section>
      <Footer />
    </div>
  );
}
