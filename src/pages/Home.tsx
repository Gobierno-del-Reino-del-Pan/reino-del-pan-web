import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties } from "react";
import { Link } from "wouter";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { supabase } from "../lib/supabaseClient";
import * as musicMetadata from "music-metadata-browser";
import {
  ArrowRight, ArrowUpRight, Banknote, CloudSun, Coins,
  Headphones, Landmark, Megaphone, Music2, Pause, Play, Radio,
  ShieldCheck, Sparkles, TrendingUp, Trophy, Volume2, WifiOff,
  RefreshCw, Crown, Wind, Droplets, ThermometerSun, TrendingDown,
  Clock3, CalendarDays, Medal, ExternalLink,
  ChevronLeft, ChevronRight, PauseCircle, PlayCircle, Sunrise, Sunset, Moon, X,
} from "lucide-react";

// Página Inicio | Liquid Glass v3 | Cotizaciones mediante API propia + podio + observatorio.
// Se conservan las rutas, los archivos multimedia y los servicios originales.
// Importante: el PANEX es un índice ficticio; no se presenta como cotización real.

type WeatherDay = { date: string; max: number; min: number; code: number };
type RegionWeather = {
  id: string; region: string; ciudad: string; lat: number; lon: number;
  tagline: string; phrase: string;
  temp?: number; description?: string; icon?: string; max?: number; min?: number;
  code?: number; feel?: number; wind?: number; humidity?: number;
  observation?: string; forecast?: WeatherDay[];
  timezone?: string; utcOffsetSeconds?: number; isDay?: boolean;
  sunrise?: string; sunset?: string;
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
type MarketQuote = {
  price: number; change: number; currency: string;
  timestamp: string | null;
};
type MarketState = {
  ibex: MarketQuote | null; nikkei: MarketQuote | null;
  status: "loading" | "ready" | "partial" | "offline";
  source: string; fetchedAt: string | null; stale: boolean; refreshing: boolean;
};
type RankUser = {
  posicion: number; id: string; username: string; level: number;
  total_xp: number; avatar: string;
};
type LeaderboardState = {
  status: "loading" | "ready" | "offline";
  top3: RankUser[];
};

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
  { id: "baguette", region: "Baguette 🥖", ciudad: "Pantopía", lat: 37.3828, lon: -5.9732, tagline: "Observatorio de Pantopía", phrase: "El cielo de nuestra capital" },
  { id: "pimbo", region: "Pimbo 🍞", ciudad: "Pimbolandia", lat: 40.9688, lon: -5.6639, tagline: "Estación Pimbo", phrase: "Un día para descubrir la ciudad" },
  { id: "pretzel", region: "Pretzel 🥨", ciudad: "Pretzelópolis", lat: 39.4698, lon: -0.3763, tagline: "Estación Pretzel", phrase: "El cielo marca el ritmo" },
  { id: "croissant", region: "Croissant 🥐", ciudad: "Vila Croissant", lat: 43.4832, lon: -1.5586, tagline: "Estación Croissant", phrase: "Así amanece por aquí" },
  { id: "singluten", region: "Sin Glúten 🌾", ciudad: "ChinPan", lat: 34.0522, lon: -118.2437, tagline: "Estación ChinPan", phrase: "Entre nubes y horizontes" },
  { id: "panplano", region: "Pan Plano/Arepa 🫓", ciudad: "Arepa", lat: -34.6037, lon: -58.3816, tagline: "Estación Arepa", phrase: "La otra cara del cielo" },
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


const DEFAULT_AVATAR = "https://cdn.discordapp.com/embed/avatars/0.png";
function avatarFor(user: RankUser) {
  const image = user.avatar?.trim();
  if (image && /^https:\/\//i.test(image) && !image.includes("undefined") && !image.includes("null")) return image;
  if (image && user.id && /^[a-zA-Z0-9_]+$/.test(image)) {
    return `https://cdn.discordapp.com/avatars/${encodeURIComponent(user.id)}/${image}.${image.startsWith("a_") ? "gif" : "png"}?size=128`;
  }
  return DEFAULT_AVATAR;
}
function marketTime(value: string | null) {
  if (!value) return "Horario no disponible";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Horario no disponible" : new Intl.DateTimeFormat("es-ES", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid"
  }).format(date) + " (hora peninsular)";
}
function weatherMood(code: number | undefined) {
  if (code === 0) return { label: "Un cielo para disfrutar", message: "Jornada despejada. Buen momento para salir a descubrir la región.", tint: "#FFD19A", glow: "#F4AC56" };
  if (code !== undefined && [1,2,3].includes(code)) return { label: "Nubes con personalidad", message: "El cielo cambia de aspecto. Planes al aire libre, con un ojo puesto arriba.", tint: "#E0D2F4", glow: "#9A7FCB" };
  if (code !== undefined && [45,48].includes(code)) return { label: "Paisaje entre brumas", message: "La niebla dibuja otro horizonte. Más atención al desplazarte.", tint: "#D5E5ED", glow: "#7AABC6" };
  if (code !== undefined && [51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) return { label: "El paraguas entra en escena", message: "Nubes y lluvia en el pronóstico. Un día para los planes bajo techo.", tint: "#B8D6F5", glow: "#5686C8" };
  if (code !== undefined && [71,73,75,77,85,86].includes(code)) return { label: "Día de paisaje blanco", message: "La nieve gana protagonismo. Abrígate y consulta los avisos locales.", tint: "#E5F5FF", glow: "#9FC8EA" };
  if (code !== undefined && [95,96,99].includes(code)) return { label: "El cielo se hace notar", message: "Posibilidad de tormenta. Conviene seguir la evolución del tiempo.", tint: "#D6C6EA", glow: "#7665AF" };
  return { label: "Cielo en movimiento", message: "Observa cómo evoluciona el día en tu región.", tint: "#E6D7ED", glow: "#AC86BA" };
}
function forecastDay(date: string) {
  const parsed = new Date(date + "T12:00:00Z");
  return Number.isNaN(parsed.getTime()) ? date : new Intl.DateTimeFormat("es-ES", { weekday: "short", timeZone: "UTC" }).format(parsed);
}
const STATEMENT_STORAGE_KEY = "artispanis-home-declaracion-v1";
const ROTATION_INTERVAL_MS = 8000;

/** La zona IANA procede de la coordenada meteorológica, NO del nombre ficticio de la región. */
function formatRegionalTime(date: Date, timezone: string | undefined, offset: number | undefined, options: Intl.DateTimeFormatOptions) {
  try {
    if (timezone) return new Intl.DateTimeFormat("es-ES", { ...options, timeZone: timezone }).format(date);
  } catch { /* Zona desconocida: usar el desplazamiento UTC proporcionado por la API. */ }
  if (typeof offset === "number" && Number.isFinite(offset)) {
    return new Intl.DateTimeFormat("es-ES", { ...options, timeZone: "UTC" }).format(new Date(date.getTime() + offset * 1000));
  }
  return "—";
}

function RegionalClock({ region, compact = false }: { region: RegionWeather; compact?: boolean }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    // El reloj solo actualiza este componente, sin volver a renderizar la Home completa.
    const id = window.setInterval(() => setNow(new Date()), compact ? 30_000 : 1000);
    return () => window.clearInterval(id);
  }, [compact]);
  const time = formatRegionalTime(now, region.timezone, region.utcOffsetSeconds, {
    hour: "2-digit", minute: "2-digit", ...(compact ? {} : { second: "2-digit" }), hourCycle: "h23",
  });
  if (compact) return <span className="hm-sky-local-mini"><Clock3 size={12} aria-hidden="true" /> {time} h</span>;
  const date = formatRegionalTime(now, region.timezone, region.utcOffsetSeconds, { weekday: "long", day: "numeric", month: "long" });
  return (
    <div className="hm-sky-clock" aria-label={`Hora local de ${region.ciudad}`}>
      <div className="hm-sky-clock-label"><Clock3 size={14} aria-hidden="true" /> HORA LOCAL · {region.region}</div>
      <time className="hm-sky-clock-time">{time}</time>
      <div className="hm-sky-clock-date">{date}</div>
    </div>
  );
}

function formatSolarHour(value?: string) {
  return value?.includes("T") ? `${value.split("T")[1].slice(0, 5)} h` : "—";
}

function formatLocalObservation(value: string | undefined) {
  if (!value || !value.includes("T")) return "Última observación disponible";
  return "Observación de las " + (value.split("T")[1] || "").slice(0, 5) + " h locales";
}

export default function Home() {
  const [mainNews, setMainNews] = useState<NewsItem | null>(null);
  const [secondaryNews, setSecondaryNews] = useState<NewsItem[]>([]);
  const [newsStatus, setNewsStatus] = useState<"loading" | "ready" | "offline">("loading");
  const [weather, setWeather] = useState<RegionWeather[]>([]);
  const [weatherStatus, setWeatherStatus] = useState<"loading" | "ready" | "offline">("loading");
  const [markets, setMarkets] = useState<MarketState>({ ibex: null, nikkei: null, status: "loading", source: "", fetchedAt: null, stale: false, refreshing: false });
  const [marketRetry, setMarketRetry] = useState(0);
  const [weatherRetry, setWeatherRetry] = useState(0);
  const [featuredRegionIndex, setFeaturedRegionIndex] = useState(0);
  const [weatherRotationPaused, setWeatherRotationPaused] = useState(false);
  const [weatherHovering, setWeatherHovering] = useState(false);
  const [statementOpen, setStatementOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try { return window.sessionStorage.getItem(STATEMENT_STORAGE_KEY) !== "dismissed"; }
    catch { return true; }
  });
  const modalRef = useRef<HTMLDivElement | null>(null);
  const modalCloseRef = useRef<HTMLButtonElement | null>(null);
  const [leaders, setLeaders] = useState<LeaderboardState>({ status: "loading", top3: [] });
  const [leaderRetry, setLeaderRetry] = useState(0);
  const [songs, setSongs] = useState<Song[]>(SONG_FILES);
  const [selected, setSelected] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [fullSong, setFullSong] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrls = useRef<string[]>([]);
  const activeSong = songs.find(s => s.id === selected) ?? songs[0];
  const featuredRegion = weather.length ? weather[featuredRegionIndex % weather.length] : null;

  const changeFeaturedRegion = (direction: number) => {
    setFeaturedRegionIndex(prev => (prev + direction + REGIONS.length) % REGIONS.length);
  };
  useEffect(() => {
    if (weather.length <= 1 || weatherRotationPaused || weatherHovering || statementOpen) return;
    if (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!document.hidden) setFeaturedRegionIndex(prev => (prev + 1) % weather.length);
    }, ROTATION_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [weather.length, weatherRotationPaused, weatherHovering, statementOpen, featuredRegionIndex]);

  const closeStatement = () => {
    setStatementOpen(false);
    try { window.sessionStorage.setItem(STATEMENT_STORAGE_KEY, "dismissed"); } catch { /* Almacenamiento restringido */ }
  };
  useEffect(() => {
    if (!statementOpen) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modalCloseRef.current?.focus();
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); closeStatement(); return; }
      if (event.key !== "Tab" || !modalRef.current) return;
      const focusable = Array.from(modalRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )).filter(node => node.getClientRects().length > 0);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKeyboard);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", handleKeyboard);
      previouslyFocused?.focus();
    };
  }, [statementOpen]);

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

  // Una consulta con seis coordenadas devuelve seis objetos, uno por cada región.
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    async function getWeather() {
      setWeatherStatus(previous => previous === "ready" ? "ready" : "loading");
      try {
        const lats = REGIONS.map(r => r.lat).join(",");
        const lons = REGIONS.map(r => r.lon).join(",");
        const endpoint = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,weather_code,apparent_temperature,relative_humidity_2m,wind_speed_10m,is_day&daily=temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset&forecast_days=3&timezone=auto`;
        const response = await fetch(endpoint, { signal: controller.signal });
        if (!response.ok) throw new Error("Error meteorológico HTTP " + response.status);
        const raw: unknown = await response.json();
        const entries = Array.isArray(raw) ? raw : [raw];
        if (entries.length !== REGIONS.length) throw new Error("Datos meteorológicos incompletos");
        const updated = REGIONS.map((region, index) => {
          const entry = entries[index];
          const value = entry?.current?.temperature_2m;
          const code = entry?.current?.weather_code;
          if (typeof value !== "number" || typeof code !== "number") throw new Error("Lectura no válida");
          const summary = weatherDescription(code);
          const days = Array.isArray(entry?.daily?.time) ? entry.daily.time.map((day: string, dayIndex: number) => ({
            date: day,
            max: entry.daily.temperature_2m_max?.[dayIndex],
            min: entry.daily.temperature_2m_min?.[dayIndex],
            code: entry.daily.weather_code?.[dayIndex],
          })).filter((day: WeatherDay) => Number.isFinite(day.max) && Number.isFinite(day.min) && typeof day.code === "number") : [];
          return { ...region, temp: Math.round(value), code, ...summary,
            max: entry?.daily?.temperature_2m_max?.[0], min: entry?.daily?.temperature_2m_min?.[0],
            feel: entry.current.apparent_temperature, wind: entry.current.wind_speed_10m,
            humidity: entry.current.relative_humidity_2m, observation: entry.current.time,
            timezone: typeof entry.timezone === "string" ? entry.timezone : undefined,
            utcOffsetSeconds: typeof entry.utc_offset_seconds === "number" ? entry.utc_offset_seconds : undefined,
            isDay: entry.current.is_day === 1,
            sunrise: entry.daily?.sunrise?.[0], sunset: entry.daily?.sunset?.[0],
            forecast: days as WeatherDay[],
          };
        });
        if (mounted) { setWeather(updated); setWeatherStatus("ready"); }
      } catch (error) {
        if (controller.signal.aborted) return;
        console.warn("No se pudo consultar el tiempo:", error);
        if (mounted) { setWeather([]); setWeatherStatus("offline"); }
      }
    }
    void getWeather();
    const interval = window.setInterval(() => { void getWeather(); }, 10 * 60 * 1000);
    return () => { mounted = false; controller.abort(); window.clearInterval(interval); };
  }, [weatherRetry]);

  // /api/markets consulta el proveedor DESDE EL SERVIDOR, con caché y sin CORS de navegador.
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    async function getMarkets() {
      if (mounted) setMarkets(prev => ({ ...prev, refreshing: true }));
      try {
        const response = await fetch("/api/markets", { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = await response.json();
        const parse = (value: any): MarketQuote | null =>
          typeof value?.price === "number" && Number.isFinite(value.price) &&
          typeof value?.change === "number" && Number.isFinite(value.change)
            ? { price: value.price, change: value.change, currency: typeof value.currency === "string" ? value.currency : "",
                timestamp: typeof value.timestamp === "string" ? value.timestamp : null }
            : null;
        const ibex = parse(payload?.quotes?.ibex);
        const nikkei = parse(payload?.quotes?.nikkei);
        if (!ibex && !nikkei) throw new Error("Sin precios de proveedor");
        if (mounted) setMarkets({ ibex, nikkei, status: ibex && nikkei ? "ready" : "partial",
          source: typeof payload.source === "string" ? payload.source : "Fuente bursátil",
          fetchedAt: typeof payload.fetchedAt === "string" ? payload.fetchedAt : null,
          stale: Boolean(payload.stale), refreshing: false });
      } catch (error) {
        if (controller.signal.aborted) return;
        console.warn("Servicio de mercados no disponible:", error);
        if (mounted) setMarkets(prev => ({ ...prev, ibex: null, nikkei: null, status: "offline", refreshing: false }));
      }
    }
    void getMarkets();
    const interval = window.setInterval(() => { void getMarkets(); }, 2 * 60 * 1000);
    return () => { mounted = false; controller.abort(); window.clearInterval(interval); };
  }, [marketRetry]);

  // Reutiliza el MISMO endpoint, formato y roles de la página Level.tsx.
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    async function getLeaders() {
      try {
        const response = await fetch("/api/leaderboard", { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = await response.json();
        const all = Array.isArray(payload?.top5) ? payload.top5 : Array.isArray(payload?.rankingCompleto) ? payload.rankingCompleto : null;
        if (!all) throw new Error("Respuesta inválida de clasificación");
        const top3 = all.filter((item: any) =>
          item && typeof item.username === "string" && Number.isFinite(Number(item.posicion)) && Number(item.posicion) >= 1 && Number(item.posicion) <= 3
        ).map((item: any): RankUser => ({
          posicion: Number(item.posicion), id: String(item.id || ""), username: item.username,
          level: Number(item.level || 0), total_xp: Number(item.total_xp || 0), avatar: String(item.avatar || ""),
        })).sort((a: RankUser, b: RankUser) => a.posicion - b.posicion).slice(0, 3);
        if (mounted) setLeaders({ status: "ready", top3 });
      } catch (error) {
        if (controller.signal.aborted) return;
        console.warn("Clasificación no disponible:", error);
        if (mounted) setLeaders({ status: "offline", top3: [] });
      }
    }
    void getLeaders();
    const interval = window.setInterval(() => { void getLeaders(); }, 5 * 60 * 1000);
    return () => { mounted = false; controller.abort(); window.clearInterval(interval); };
  }, [leaderRetry]);



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

        /* Financiación: fecha de mercado y refresco real sin valores falsos. */
        .hm-market-row{gap:14px}
        .hm-market-source{margin-top:17px;padding:12px 14px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);border-radius:15px;color:#D3C4D4;font-size:11px;line-height:1.7}
        .hm-market-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:10px!important;color:#BBAEC0!important}
        .hm-refresh{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:8px 11px;color:#EED6E9;border:1px solid rgba(233,192,226,.27);border-radius:11px;background:rgba(255,255,255,.065);font-size:11px;font-weight:750;cursor:pointer;transition:background .2s}
        .hm-refresh:hover{background:rgba(255,255,255,.14)}.hm-refresh:disabled{opacity:.6;cursor:wait}
        .hm-market-value .hm-market-date{display:block;font-size:10px;color:#BAA8C1;white-space:normal;max-width:190px;margin-top:5px;line-height:1.4}
        /* Podio del reino: 2 - 1 - 3 en escritorio y 1 - 2 - 3 en móvil. */
        .hm-leaders{position:relative;overflow:hidden;background:linear-gradient(140deg,#f8f0f7 0%,#faf7fb 55%,#f4e3f2 100%)}
        .hm-leaders::before{content:"";position:absolute;right:-8%;top:1%;width:320px;height:320px;border-radius:50%;background:#e8c8e9;filter:blur(100px);opacity:.55;pointer-events:none}
        .hm-rank-header{position:relative;display:flex;align-items:end;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:25px}
        .hm-rank-rail{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:17px;align-items:end}
        .hm-rank-card{position:relative;display:flex;align-items:center;flex-direction:column;text-align:center;min-width:0;padding:30px 18px 0;border-radius:27px 27px 20px 20px;isolation:isolate;overflow:hidden;text-decoration:none;transition:transform .25s ease,box-shadow .25s ease}
        .hm-rank-card:hover{transform:translateY(-5px);box-shadow:0 18px 45px rgba(81,27,72,.16)}
        .hm-rank-card[data-place="1"]{min-height:350px;--rank-color:#E5B464;--rank-fade:#FBF0D8;z-index:2}
        .hm-rank-card[data-place="2"]{min-height:310px;--rank-color:#9CA4B9;--rank-fade:#ECEFF6}
        .hm-rank-card[data-place="3"]{min-height:285px;--rank-color:#BB8878;--rank-fade:#F5E7DE}
        .hm-rank-card::before{content:"";position:absolute;top:0;left:0;right:0;height:5px;background:var(--rank-color)}
        .hm-rank-medal{width:39px;height:39px;display:grid;place-items:center;border-radius:14px;background:var(--rank-fade);color:#503047;font-weight:900;margin-bottom:13px}
        .hm-rank-avatar{height:82px;width:82px;object-fit:cover;border-radius:25px;border:3px solid var(--rank-color);box-shadow:0 8px 20px rgba(80,27,64,.14);background:#eadcec}
        .hm-rank-name{display:block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:clamp(15px,2vw,20px);color:#321D31;font-weight:850;margin-top:15px}
        .hm-rank-level{color:#7B6477;font-size:12px;margin-top:5px;font-weight:650}
        .hm-rank-points{color:#630B57;font-size:12px;font-weight:800;margin-top:11px;letter-spacing:.02em}
        .hm-rank-foot{margin-top:auto;width:calc(100% + 36px);min-height:62px;background:linear-gradient(100deg,var(--rank-fade),rgba(255,255,255,.5));display:flex;align-items:center;justify-content:center;gap:10px;border-top:1px solid rgba(99,11,87,.09)}
        .hm-rank-foot strong{font:900 29px/1 var(--body-font,Inter,system-ui,sans-serif);font-size-adjust:none}
        .hm-rank-foot span{font-size:11px;font-weight:800;color:#81667A;letter-spacing:.12em;text-transform:uppercase}
        .hm-rank-status{position:relative;text-align:center;padding:30px 20px;border-radius:22px;border:1px dashed #d7b9d1;background:#fff9;color:#6E5C6B;font-size:13px;line-height:1.7}
        .hm-rank-bottom{position:relative;display:flex;justify-content:center;margin-top:24px}
        /* Observatorio meteorológico con identidad propia. */
        .hm-sky{background:linear-gradient(175deg,#F8F2FA 0%,#F1E6F4 62%,#FCF8FD 100%);position:relative;overflow:hidden}
        .hm-sky::before{content:"";position:absolute;top:-140px;right:-100px;height:430px;width:430px;border-radius:50%;background:rgba(210,163,209,.2);filter:blur(60px);pointer-events:none}
        .hm-sky-grid{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);gap:15px;align-items:stretch}
        .hm-sky-feature{border:1px solid rgba(255,255,255,.7);background:linear-gradient(140deg,#2C1637 0%,#4B1D50 55%,#3B1A45 100%);color:white;min-height:440px;position:relative;overflow:hidden;padding:clamp(22px,3.2vw,37px);border-radius:30px;box-shadow:0 22px 55px rgba(92,36,87,.17)}
        .hm-sky-glow{position:absolute;width:250px;height:250px;border-radius:50%;right:-72px;top:-42px;background:var(--sky-glow,#E2AB6A);filter:blur(30px);opacity:.18}
        .hm-sky-disc{position:absolute;top:50px;right:38px;width:115px;height:115px;border:1px solid rgba(255,255,255,.20);border-radius:50%;display:grid;place-items:center;font-size:64px;box-shadow:0 0 0 24px rgba(255,255,255,.04),0 0 0 48px rgba(255,255,255,.025);pointer-events:none}
        .hm-sky-eyebrow{font-size:10px;letter-spacing:.17em;text-transform:uppercase;font-weight:800;color:#EDC7E9}
        .hm-sky-city{font-size:clamp(30px,4vw,47px)!important;line-height:1.12!important;color:#fff;margin-top:14px}
        .hm-sky-sub{font-size:12px;color:#D9C0DC;line-height:1.6;margin-top:6px}
        .hm-sky-temp{font-size:clamp(66px,9vw,108px);font-weight:850;letter-spacing:-.09em;line-height:1;font-size-adjust:none;margin-top:32px}
        .hm-sky-mood{font-size:clamp(16px,2.2vw,23px)!important;color:#F1D7EE;margin-top:13px}
        .hm-sky-phrase{font-size:12px;color:#E4D6E3;line-height:1.65;margin-top:7px;max-width:400px}
        .hm-sky-facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:20px}
        .hm-sky-fact{border-radius:13px;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.14);padding:11px 9px}
        .hm-sky-fact span{display:block;font-size:10px;color:#D7BDD8;margin-bottom:7px;line-height:1.25}
        .hm-sky-fact strong{color:#fff;font-size:14px;font-weight:850;font-size-adjust:none}
        .hm-sky-days{margin-top:24px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
        .hm-sky-day{display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px;padding:10px 5px;border-radius:12px;border:1px solid rgba(255,255,255,.13);background:rgba(255,255,255,.055);font-size:11px;color:#E9D9E9}
        .hm-sky-day strong{font-weight:800;color:white}
        .hm-sky-stations{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
        .hm-sky-station{--sky-accent:#CFB1DB;position:relative;display:flex;flex-direction:column;min-width:0;min-height:162px;border-radius:24px;overflow:hidden;padding:17px;background:linear-gradient(135deg,#fffefed9,#ffffff8c);border:1px solid #fff;box-shadow:inset 0 1px #fff,0 9px 22px rgba(64,20,64,.05);transition:transform .2s}
        .hm-sky-station:hover{transform:translateY(-3px)}
        .hm-sky-station::before{content:"";position:absolute;top:-34px;right:-44px;width:125px;height:125px;border-radius:50%;background:var(--sky-accent);opacity:.24;filter:blur(16px);pointer-events:none}
        .hm-sky-station-top{position:relative;display:flex;align-items:start;justify-content:space-between;gap:8px}
        .hm-sky-station .hm-sky-station-label{font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#916786;line-height:1.4;display:block}
        .hm-sky-station strong{font-size:17px;color:#362338;line-height:1.25;font-weight:850;display:block;margin-top:5px;font-size-adjust:none}
        .hm-sky-station-icon{font-size:31px;line-height:1}
        .hm-sky-station-bottom{position:relative;display:flex;justify-content:space-between;align-items:end;gap:8px;margin-top:auto;padding-top:14px}
        .hm-sky-station-temp{font-size:38px;letter-spacing:-.065em;line-height:1;color:#630B57;font-weight:850;font-size-adjust:none}
        .hm-sky-station-caption{font-size:11px;line-height:1.55;color:#7C6978;text-align:right}
        /* Observatorio rotatorio: accesible, con pausado y hora de cada coordenada. */
        .hm-sky-feature[data-night="true"]{background:linear-gradient(145deg,#15152d 0%,#2b2349 55%,#26172f 100%)}
        .hm-sky-feature[data-night="true"] .hm-sky-disc{background:rgba(201,185,244,.035)}
        .hm-sky-feature[data-night="false"]{background:linear-gradient(140deg,#321838 0%,#5D2859 56%,#46204A 100%)}
        .hm-sky-feature-body{position:relative;z-index:2;animation:hmSkyEnter .45s cubic-bezier(.2,.8,.2,1) both}
        @keyframes hmSkyEnter{from{opacity:.1;transform:translateY(9px)}to{opacity:1;transform:translateY(0)}}
        .hm-sky-nav{position:relative;z-index:3;display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:17px}
        .hm-sky-nav-btn{display:grid;place-items:center;height:34px;width:34px;border-radius:12px;background:#ffffff18;border:1px solid #ffffff37;color:white;cursor:pointer;transition:background .2s,transform .2s}
        .hm-sky-nav-btn:hover{background:#ffffff31;transform:translateY(-1px)}
        .hm-sky-nav-pause{display:inline-flex;align-items:center;gap:7px;padding:0 11px;height:34px;border-radius:12px;background:#ffffff12;border:1px solid #ffffff30;color:#F4DAEF;font-size:11px;font-weight:700;cursor:pointer}
        .hm-sky-nav-counter{font-size:11px;font-variant-numeric:tabular-nums;color:#EDC7E9;letter-spacing:.14em;font-weight:800;margin-right:auto}
        .hm-sky-nav-dots{display:flex;gap:5px;align-items:center}
        .hm-sky-nav-dot{border:none;border-radius:999px;width:8px;height:8px;background:#ffffff62;cursor:pointer;transition:width .25s,background .25s}
        .hm-sky-nav-dot[data-active="true"]{background:#FFD3E9;width:24px}
        .hm-sky-clock{margin:17px 0 12px;padding:13px 15px;border:1px solid #ffffff30;border-radius:17px;background:linear-gradient(120deg,#ffffff19,#ffffff07);display:grid;grid-template-columns:1fr auto;gap:2px 12px;max-width:380px}
        .hm-sky-clock-label{font-size:10px;font-weight:750;color:#F1D4F0;display:flex;align-items:center;gap:6px;letter-spacing:.1em}
        .hm-sky-clock-time{font:800 clamp(23px,3vw,31px)/1.2 ui-monospace,SFMono-Regular,Consolas,monospace;color:#fff;font-variant-numeric:tabular-nums;grid-row:1 / 3;grid-column:2;align-self:center;white-space:nowrap}
        .hm-sky-clock-date{color:#DBC7DF;font-size:11px;text-transform:capitalize}
        .hm-sky-solar{display:flex;gap:9px;flex-wrap:wrap;margin-top:15px}
        .hm-sky-solar span{display:inline-flex;gap:7px;align-items:center;border-radius:11px;background:#ffffff10;border:1px solid #ffffff22;padding:9px 12px;color:#F1DEED;font-size:11px}
        .hm-sky-solar strong{color:white;font-variant-numeric:tabular-nums}
        .hm-sky-local-mini{display:inline-flex;align-items:center;gap:4px;color:#83527D;font-size:11px;font-weight:800;white-space:nowrap;font-variant-numeric:tabular-nums;margin-top:7px}
        .hm-sky-station{width:100%;text-align:left;font:inherit;cursor:pointer}
        .hm-sky-station:focus-visible{outline:3px solid #A96FA2;outline-offset:3px}
        .hm-sky-station:hover{border-color:#CBA6C9;transform:translateY(-3px)}
        .hm-statement-launch{background:#ffffff13;color:#F7E0F1;font-size:11px}
        .hm-statement-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:clamp(12px,3vw,24px);background:rgba(11,6,14,.76);-webkit-backdrop-filter:blur(17px);backdrop-filter:blur(17px)}
        .hm-statement-modal{position:relative;isolation:isolate;width:min(620px,100%);max-height:min(88dvh,740px);overflow:auto;border-radius:clamp(22px,3vw,34px);border:1px solid #ffffff30;background:linear-gradient(132deg,#1C1621 0%,#28122B 65%,#4C1644 100%);color:white;padding:clamp(25px,5vw,47px);box-shadow:0 25px 90px rgba(0,0,0,.45),inset 0 1px 0 #ffffff28;animation:hmStatementIn .34s cubic-bezier(.2,.8,.2,1) both}
        @keyframes hmStatementIn{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
        .hm-statement-modal::before{content:"";position:absolute;right:-140px;top:-120px;width:380px;height:380px;background:#AC3D90;opacity:.25;filter:blur(100px);pointer-events:none}
        .hm-statement-top{display:flex;align-items:center;justify-content:space-between;gap:15px;position:relative}
        .hm-statement-mark{font-size:13px;font-weight:950;letter-spacing:-.07em;color:#FFB184}
        .hm-statement-close{height:38px;width:38px;border-radius:13px;background:#ffffff11;border:1px solid #ffffff28;color:white;display:grid;place-items:center}
        .hm-statement-label{margin-top:26px;display:flex;align-items:center;gap:8px;color:#FFB184;letter-spacing:.15em;font-size:10px;font-weight:850;text-transform:uppercase}
        .hm-statement-title{font-family:var(--body-font,Inter,system-ui,sans-serif)!important;font-size:clamp(36px,7vw,66px)!important;font-weight:850!important;font-size-adjust:none!important;line-height:1.04!important;letter-spacing:-.055em!important;overflow-wrap:normal!important;margin-top:17px;color:#FFFFFF}
        .hm-statement-title span{display:block;color:#FF995A;margin-top:8px}
        .hm-statement-actions{position:relative;margin-top:30px;padding-top:20px;border-top:1px solid #ffffff26;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
        .hm-statement-accept{display:inline-flex;align-items:center;justify-content:center;gap:9px;background:#FF6A25;color:#1E1016;padding:13px 21px;border-radius:999px;font-size:12px;font-weight:900;letter-spacing:.08em}
        .hm-statement-close:hover,.hm-statement-accept:hover{filter:brightness(1.12)}
        .hm-statement-close:focus-visible,.hm-statement-accept:focus-visible{outline:3px solid white;outline-offset:3px}
        @media(max-width:460px){.hm-sky-nav{gap:6px}.hm-sky-nav-counter{font-size:10px;letter-spacing:.03em}.hm-sky-nav-pause{padding:0 8px}.hm-sky-clock{grid-template-columns:1fr;gap:5px}.hm-sky-clock-time{grid-column:1;grid-row:auto}.hm-sky-disc{opacity:.5}.hm-statement-title{font-size:clamp(34px,10vw,45px)!important}}
        @media(prefers-reduced-motion:reduce){.hm-sky-feature-body,.hm-statement-modal{animation:none!important}}
        .hm-sky-footer{position:relative;margin-top:19px;display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;color:#806B7F;font-size:11px}
        .hm-sky-footer span{display:inline-flex;align-items:center;gap:6px}
        @media(max-width:1000px){.hm-sky-grid{grid-template-columns:1fr}.hm-sky-feature{min-height:360px}.hm-sky-stations{grid-template-columns:repeat(3,minmax(0,1fr))}.hm-rank-card[data-place="1"]{min-height:320px}.hm-rank-card[data-place="2"]{min-height:295px}.hm-rank-card[data-place="3"]{min-height:280px}}
        @media(max-width:700px){.hm-sky-stations{grid-template-columns:repeat(2,minmax(0,1fr))}.hm-rank-rail{gap:9px}.hm-rank-card{padding:23px 9px 0;border-radius:19px}.hm-rank-card[data-place="1"]{min-height:294px}.hm-rank-card[data-place="2"],.hm-rank-card[data-place="3"]{min-height:273px}.hm-rank-avatar{width:63px;height:63px;border-radius:18px}.hm-rank-foot{width:calc(100% + 18px)}.hm-rank-name{font-size:13px}.hm-sky-disc{width:88px;height:88px;font-size:45px;right:26px;top:25px}}
        @media(max-width:460px){.hm-rank-rail{grid-template-columns:1fr;align-items:stretch}.hm-rank-card{min-height:auto!important;display:grid;grid-template-columns:58px minmax(0,1fr) auto;grid-template-rows:auto auto auto;gap:2px 13px;text-align:left;padding:17px;align-items:center}.hm-rank-medal{grid-column:1;grid-row:1;margin:0;position:absolute;z-index:2;left:52px;top:5px;width:26px;height:26px;font-size:12px;border-radius:9px}.hm-rank-avatar{grid-column:1;grid-row:1/4;width:54px;height:54px;border-radius:16px}.hm-rank-name{grid-column:2;grid-row:1;margin:0;font-size:15px}.hm-rank-level{grid-column:2;grid-row:2;margin:0}.hm-rank-points{grid-column:2;grid-row:3;margin:0}.hm-rank-foot{grid-column:3;grid-row:1/4;width:auto;min-height:auto;padding:8px;border:0;border-radius:12px;align-self:center;gap:3px;flex-direction:column;margin:0}.hm-rank-foot strong{font-size:20px}.hm-rank-foot span{font-size:8px}.hm-sky-feature{padding:22px;min-height:410px}.hm-sky-disc{right:15px;top:50px;width:65px;height:65px;font-size:36px}.hm-sky-temp{font-size:74px}.hm-sky-facts{gap:5px}.hm-sky-fact{padding:8px 6px}.hm-sky-fact span{font-size:9px}.hm-sky-fact strong{font-size:12px}.hm-sky-stations{grid-template-columns:1fr}.hm-sky-station{min-height:134px}}

        .home-v2 a:focus-visible,.home-v2 button:focus-visible,.home-v2 input:focus-visible{outline:3px solid #CB8AC0;outline-offset:3px}
        @media(max-width:1000px){.hm-hero-content{grid-template-columns:1fr}.hm-hero{min-height:auto}.hm-hero-overlay{background:linear-gradient(100deg,#110a14eF,#26182dd1)}.hm-weather-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.hm-tvp-grid{grid-template-columns:1fr}.hm-news-others{grid-template-columns:repeat(2,minmax(0,1fr))}.hm-news-small{grid-template-columns:1fr}.hm-news-small>img{width:100%;height:auto;min-height:0;aspect-ratio:16/9}.hm-news-small .hm-news-body{padding:17px}}
        @media(max-width:700px){.hm-intro{display:block}.hm-intro .hm-muted{margin-top:11px}.hm-duo{grid-template-columns:1fr}.hm-contest-grid{grid-template-columns:1fr}.hm-contest{min-height:218px}.hm-weather-grid{grid-template-columns:1fr 1fr}.hm-hero h1{font-size:clamp(34px,9vw,55px)!important}.hm-hero{padding-block:55px}.hm-metrics{gap:9px}.hm-metric{padding:16px}.hm-news-others{grid-template-columns:1fr}.hm-news-small{grid-template-columns:110px 1fr}.hm-news-small>img{width:110px;height:100%;min-height:120px;aspect-ratio:auto}.hm-news-small .hm-news-body{padding:13px 12px 13px 0}}
        @media(max-width:410px){.hm-weather-grid{grid-template-columns:1fr}.hm-actions>a{width:100%}.hm-hero h1{font-size:34px!important}.hm-metric-number{font-size:23px}.hm-market{gap:5px}.hm-market-value b{font-size:13px}.hm-news-small{grid-template-columns:1fr}.hm-news-small>img{width:100%;height:auto;min-height:0;aspect-ratio:16/9}.hm-news-small .hm-news-body{padding:15px}}
        @media(prefers-reduced-motion:reduce){.home-v2 *,.home-v2 *::before,.home-v2 *::after{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}.hm-ticker{animation:none!important}}
      `}</style>
      <Header />

      {statementOpen && (
        <div className="hm-statement-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) closeStatement(); }}>
          <div className="hm-statement-modal" role="dialog" aria-modal="true" aria-labelledby="hm-statement-title" aria-describedby="hm-statement-caption" ref={modalRef}>
            <div className="hm-statement-top">
              <span className="hm-statement-mark">ARTIS PANIS · DECLARACIÓN</span>
              <button ref={modalCloseRef} className="hm-statement-close" type="button" aria-label="Cerrar comunicado" onClick={closeStatement}><X size={18} /></button>
            </div>
            <div className="hm-statement-label"><Megaphone size={14} aria-hidden="true" /> Mensaje institucional</div>
            <h2 className="hm-statement-title" id="hm-statement-title">Abajo el Monarca.{" "}<span>NOS TEMERÁN</span></h2>
            <p id="hm-statement-caption" className="mt-5 text-xs leading-relaxed text-[#D9C4D7]">Mensaje del portal Artis Panis.</p>
            <div className="hm-statement-actions">
              <span className="text-[10px] tracking-widest text-[#BCA7BB] font-semibold">COMUNICADO · ARTIS PANIS</span>
              <button className="hm-statement-accept" type="button" onClick={closeStatement}>ENTENDIDO <ArrowRight size={15} aria-hidden="true" /></button>
            </div>
          </div>
        </div>
      )}

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
              <button type="button" className="hm-action hm-statement-launch" onClick={() => setStatementOpen(true)}><Megaphone size={16} aria-hidden="true" /> Ver comunicado</button>
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
              <div className="hm-panel-header">
                <span className="hm-pill" style={{ background: "#ffffff0f", borderColor: "#ffffff27", color: "#E6C1DF" }}><TrendingUp size={14} /> Panorama financiero</span>
                <button type="button" className="hm-refresh" onClick={() => setMarketRetry(v => v + 1)} disabled={markets.refreshing}><RefreshCw size={13} className={markets.refreshing ? "animate-spin" : ""} /> Actualizar</button>
              </div>
              <h3 className="hm-panel-title">Índices bursátiles</h3>
              <div className="hm-market" style={{ borderColor: "#C7A36E55", background: "#B4872E12" }}>
                <div><span>Índice del universo ficticio paniense</span><strong>PANEX 75</strong></div>
                <div className="hm-market-value"><b style={{ color: "#E5BA75" }}>Simulado</b><small style={{ color: "#CFC1C3" }}>No negociable</small></div>
              </div>
              {([{ label: "España · Bolsa", title: "IBEX 35", quote: markets.ibex, currency: "EUR" },
                { label: "Japón · Bolsa", title: "Nikkei 225", quote: markets.nikkei, currency: "JPY" }] as const).map(row => (
                <div key={row.title} className="hm-market hm-market-row">
                  <div className="min-w-0"><span>{row.label}</span><strong>{row.title}</strong>
                    <div className="hm-market-meta"><Clock3 size={12} aria-hidden="true" />{row.quote ? marketTime(row.quote.timestamp) : "Pendiente de conexión"}</div>
                  </div>
                  <div className="hm-market-value">
                    <b>{row.quote ? `${formatPrice(row.quote.price)} ${row.quote.currency || row.currency}` : "—"}</b>
                    <small style={{ color: row.quote ? (row.quote.change >= 0 ? "#86E1B2" : "#FF9BA6") : "#BAAABB" }}>
                      {row.quote ? <>{row.quote.change >= 0 ? <TrendingUp size={12} className="inline mr-1" /> : <TrendingDown size={12} className="inline mr-1" />}{row.quote.change >= 0 ? "+" : ""}{row.quote.change.toFixed(2)}%</> : "No disponible"}
                    </small>
                  </div>
                </div>
              ))}
              <div className="hm-market-source" role="status" aria-live="polite">
                <div className="flex gap-2 items-center justify-between flex-wrap">
                  <span>{markets.status === "loading" ? "Conectando con la fuente bursátil…" :
                    markets.status === "offline" ? "Cotizaciones temporalmente no disponibles" :
                    markets.stale ? "Últimos datos conservados: servicio temporalmente no disponible" :
                    markets.status === "partial" ? "Datos parciales del proveedor" : "Últimas cotizaciones publicadas por el proveedor"}</span>
                  {markets.refreshing && <RefreshCw size={13} className="animate-spin" aria-label="Actualizando" />}
                </div>
                {markets.fetchedAt && <div>Consulta: {marketTime(markets.fetchedAt)}</div>}
                <div className="opacity-70">{markets.source || "Fuente: servidor /api/markets"} · La última cotización puede corresponder al cierre anterior. Los valores no son asesoramiento financiero.</div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <section className="hm-section hm-leaders" id="ranking" aria-labelledby="ranking-title">
        <div className="hm-wrap">
          <div className="hm-rank-header">
            <div><span className="hm-pill"><Crown size={15} /> Ranking ciudadano · Artis Panis</span>
              <h2 id="ranking-title" className="hm-heading">Los tres que marcan el ritmo.</h2>
              <p className="hm-muted mt-3">Los ciudadanos con mayor experiencia de la clasificación oficial. Sin datos inventados: conectamos con el ranking real del servidor.</p>
            </div>
            <Link href="/level" className="hm-action" style={{ background: "#630B57", color: "white", border: 0 }}>
              Ver clasificación completa <ArrowUpRight size={16} />
            </Link>
          </div>
          {leaders.status === "loading" ? <div className="hm-rank-status" role="status">Consultando el podio de ciudadanos…</div> :
            leaders.status === "offline" ? <div className="hm-rank-status" role="status">No se ha podido contactar con el ranking.
              <button type="button" className="hm-action mx-auto mt-4" style={{ background: "#630B57", color: "white", border: 0 }} onClick={() => { setLeaders({ status: "loading", top3: [] }); setLeaderRetry(v => v + 1); }}><RefreshCw size={14} /> Reintentar</button>
            </div> : leaders.top3.length === 0 ? <div className="hm-rank-status">Todavía no hay ciudadanos en la clasificación.</div> :
            <div className="hm-rank-rail" aria-label="Top 3 de ciudadanos por experiencia">
              {[2, 1, 3].map(position => leaders.top3.find(user => user.posicion === position)).filter((user): user is RankUser => Boolean(user)).map(user => (
                <Link href="/level" key={user.id || user.username} className="hm-rank-card hm-glass" data-place={user.posicion} aria-label={`Ver clasificación de ${user.username}, posición ${user.posicion}`}>
                  <span className="hm-rank-medal">{user.posicion === 1 ? <Crown size={21} /> : user.posicion === 2 ? <Medal size={20} /> : <Trophy size={19} />}</span>
                  <img className="hm-rank-avatar" src={avatarFor(user)} alt="" loading="lazy" onError={e => { if (e.currentTarget.src !== DEFAULT_AVATAR) e.currentTarget.src = DEFAULT_AVATAR; }} />
                  <strong className="hm-rank-name" title={user.username}>@{user.username}</strong>
                  <small className="hm-rank-level">Nivel {user.level}</small>
                  <div className="hm-rank-points">{user.total_xp.toLocaleString("es-ES")} XP</div>
                  <div className="hm-rank-foot"><strong>{String(user.posicion).padStart(2, "0")}</strong><span>{user.posicion === 1 ? "Líder" : user.posicion === 2 ? "Segundo" : "Tercero"}</span></div>
                </Link>
              ))}
            </div>}
          <div className="hm-rank-bottom"><span className="text-[11px] text-[#866B83]">Datos sincronizados con /api/leaderboard · Se actualizan cada cinco minutos</span></div>
        </div>
      </section>

      <section className="hm-sponsor" aria-label="Anuncio institucional"><img src="/anunciosgov/seguimosavanzando.jpg" alt="Anuncio institucional: Seguimos avanzando" loading="lazy" /></section>

      <section className="hm-section hm-sky" aria-labelledby="weather-title">
        <div className="hm-wrap">
          <div className="hm-intro">
            <div><span className="hm-pill"><CloudSun size={14} /> Observatorio meteorológico paniense</span>
              <h2 id="weather-title" className="hm-heading">El cielo también cuenta historias.</h2>
              <p className="hm-muted mt-3">De Pantopía a Arepa: seis regiones, seis cielos y una misma mirada.</p>
            </div>
            <button className="hm-refresh" type="button" style={{ background: "white", color: "#630B57", borderColor: "#D9BFDA" }} onClick={() => setWeatherRetry(v => v + 1)} disabled={weatherStatus === "loading"}>
              <RefreshCw size={14} className={weatherStatus === "loading" ? "animate-spin" : ""} /> Actualizar el tiempo
            </button>
          </div>
          {weatherStatus === "loading" ? <div className="hm-soft-panel" role="status">Consultando los observatorios regionales…</div>
            : weatherStatus === "offline" ? <div className="hm-soft-panel" role="status"><WifiOff size={24} className="mx-auto mb-3" />No hemos podido cargar los datos meteorológicos. Puedes reintentarlo cuando quieras.</div>
            : <div className="hm-sky-grid">
              {featuredRegion && (() => {
                const region = featuredRegion;
                const mood = weatherMood(region.code);
                return (
                  <article
                    className="hm-sky-feature"
                    data-night={region.isDay === false ? "true" : "false"}
                    style={{ "--sky-glow": mood.glow } as CSSProperties}
                    onMouseEnter={() => setWeatherHovering(true)}
                    onMouseLeave={() => setWeatherHovering(false)}
                    onFocusCapture={() => setWeatherHovering(true)}
                    onBlurCapture={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setWeatherHovering(false);
                    }}
                    aria-label={`Observatorio meteorológico de ${region.ciudad}`}
                  >
                    <div className="hm-sky-glow" aria-hidden="true" />
                    <div className="hm-sky-disc" aria-hidden="true">{region.isDay === false && region.code === 0 ? "🌙" : region.icon}</div>
                    <nav className="hm-sky-nav" aria-label="Cambiar región del observatorio">
                      <span className="hm-sky-nav-counter">{String(featuredRegionIndex + 1).padStart(2, "0")} / {String(weather.length).padStart(2, "0")}</span>
                      <div className="hm-sky-nav-dots" aria-label="Elegir estación">
                        {weather.map((entry, index) => (
                          <button key={entry.id} type="button" className="hm-sky-nav-dot" data-active={index === featuredRegionIndex} onClick={() => setFeaturedRegionIndex(index)} aria-label={`Ver estación ${entry.ciudad}`} aria-current={index === featuredRegionIndex ? "true" : undefined} />
                        ))}
                      </div>
                      <button className="hm-sky-nav-btn" type="button" onClick={() => changeFeaturedRegion(-1)} aria-label="Región anterior"><ChevronLeft size={17} /></button>
                      <button className="hm-sky-nav-btn" type="button" onClick={() => changeFeaturedRegion(1)} aria-label="Región siguiente"><ChevronRight size={17} /></button>
                      <button className="hm-sky-nav-pause" type="button" onClick={() => setWeatherRotationPaused(value => !value)} aria-pressed={weatherRotationPaused}>
                        {weatherRotationPaused ? <PlayCircle size={16} /> : <PauseCircle size={16} />}
                        {weatherRotationPaused ? "Reanudar" : "Pausar"}
                      </button>
                    </nav>
                    <div className="hm-sky-feature-body" key={region.id}>
                      <div className="hm-sky-eyebrow">✦ Observatorio rotatorio · {region.region}</div>
                      <h3 className="hm-sky-city">{region.ciudad}</h3>
                      <div className="hm-sky-sub">{region.tagline} · {formatLocalObservation(region.observation)}</div>
                      <RegionalClock region={region} />
                      <div className="hm-sky-temp">{region.temp}°</div>
                      <div className="text-xs text-[#E2CFE3] mt-1 inline-flex items-center gap-2">{region.isDay ? <Sunrise size={15} /> : <Moon size={15} />} {region.isDay ? "Ahora es de día" : "Ahora es de noche"}</div>
                      <h4 className="hm-sky-mood">{mood.label}</h4>
                      <p className="hm-sky-phrase">{region.description}. {mood.message}</p>
                      <div className="hm-sky-facts">
                        <div className="hm-sky-fact"><span><ThermometerSun size={12} className="inline mr-1" /> Sensación</span><strong>{typeof region.feel === "number" ? `${Math.round(region.feel)}°` : "—"}</strong></div>
                        <div className="hm-sky-fact"><span><Wind size={12} className="inline mr-1" /> Viento</span><strong>{typeof region.wind === "number" ? `${Math.round(region.wind)} km/h` : "—"}</strong></div>
                        <div className="hm-sky-fact"><span><Droplets size={12} className="inline mr-1" /> Humedad</span><strong>{typeof region.humidity === "number" ? `${Math.round(region.humidity)}%` : "—"}</strong></div>
                      </div>
                      <div className="hm-sky-solar">
                        <span><Sunrise size={15} aria-hidden="true" /> Amanecer <strong>{formatSolarHour(region.sunrise)}</strong></span>
                        <span><Sunset size={15} aria-hidden="true" /> Atardecer <strong>{formatSolarHour(region.sunset)}</strong></span>
                      </div>
                      {region.forecast && region.forecast.length > 0 && <div className="hm-sky-days" aria-label={`Previsión de tres días para ${region.ciudad}`}>{region.forecast.slice(0, 3).map(day => (
                        <div className="hm-sky-day" key={day.date}><span className="capitalize">{forecastDay(day.date)}</span><span className="text-xl" aria-hidden="true">{weatherDescription(day.code).icon}</span><strong>{Math.round(day.max)}° / {Math.round(day.min)}°</strong></div>
                      ))}</div>}
                    </div>
                  </article>
                );
              })()}
              <div className="hm-sky-stations" aria-label="Otras estaciones meteorológicas">
                {weather.filter((_, index) => index !== featuredRegionIndex).map(region => {
                  const mood = weatherMood(region.code);
                  const index = weather.findIndex(entry => entry.id === region.id);
                  return <button type="button" className="hm-sky-station" key={region.id}
                    onClick={() => setFeaturedRegionIndex(index)}
                    aria-label={`Mostrar ${region.ciudad} como observatorio principal`}
                    style={{ "--sky-accent": mood.tint } as CSSProperties}>
                    <div className="hm-sky-station-top"><div><span className="hm-sky-station-label">{region.region}</span><strong>{region.ciudad}</strong><RegionalClock region={region} compact /></div><span className="hm-sky-station-icon" aria-hidden="true">{region.isDay === false && region.code === 0 ? "🌙" : region.icon}</span></div>
                    <div className="hm-sky-station-bottom"><span className="hm-sky-station-temp">{region.temp}°</span><div className="hm-sky-station-caption">{region.description}<br />{typeof region.max === "number" && typeof region.min === "number" ? `Máx. ${Math.round(region.max)}° · Mín. ${Math.round(region.min)}°` : ""}</div></div>
                  </button>;
                })}
              </div>
            </div>}
          <div className="hm-sky-footer"><span><CalendarDays size={14} /> Observaciones y pronósticos de Open-Meteo, actualizados periódicamente</span><span><Clock3 size={14} /> Hora local calculada con la zona horaria de cada coordenada · Sin geolocalización del visitante</span></div>
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
