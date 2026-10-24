import Footer from "../components/Footer";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import {
  ArrowLeft, ArrowRight, BookOpen,
  ShieldCheck, Users, Trophy, Swords, RefreshCw, AlertCircle,
  FlaskConical, Sparkles, LockKeyhole,
} from "lucide-react";

// Mantiene las variables de entorno, los roles y la API del componente original.
interface DiscordGuildMember {
  user: {
    id: string;
    username: string;
    global_name?: string;
    avatar: string | null;
  };
  roles: string[];
}

interface DiscordMember {
  id: string;
  username: string;
  globalName?: string;
  avatar: string;
}

const SERVER_ID = String(import.meta.env.VITE_GUILD_ID || "1559527103420965016");
const ROLES = {
  GIMNASIO: String(import.meta.env.VITE_ROLE_GIMNASIO || "1559527104654213166"),
  ALTO_MANDO: String(import.meta.env.VITE_ROLE_ALTO_MANDO || "1559527104654213169"),
  ENTRENADORES_REGISTRADOS: String(import.meta.env.VITE_ROLE_ENTRENADORES || "1559527104549359680"),
};

const DEFAULT_AVATAR = "https://cdn.discordapp.com/embed/avatars/0.png";
const mapDiscordMember = ({ user }: DiscordGuildMember): DiscordMember => ({
  id: user.id,
  username: user.username,
  globalName: user.global_name || undefined,
  avatar: user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith("a_") ? "gif" : "png"}?size=128`
    : DEFAULT_AVATAR,
});

const starters = [
  {
    key: "agua", name: "Popplio", number: "#728", caption: "Primer inicial anunciado",
    img: "/pkmn/Popplio.png", typeImg: "/pkmn/tipos/agua.png", type: "Agua",
    biome: "Bioma Costero Paniense", color: "#2A79D5", tint: "#E8F4FF",
    description: "Maneja con soltura los globos de agua que crea. Para poder hacer globos más grandes, necesita practicar sin descanso. Gracias al entrenamiento diario al que se somete, es capaz de inflar globos cada vez más grandes a través de la nariz.",
  },
  {
    key: "planta", name: "Sprigatito", number: "#0906", caption: "Segundo inicial anunciado",
    img: "/pkmn/sprigatito.png", typeImg: "/pkmn/tipos/planta.png", type: "",
    biome: "Bosque Paniense", color: "#24875A", tint: "#E7F8EE",
    description: "Su sedoso pelaje se asemeja en composición a las plantas. Se lava la cara con diligencia para que no se le seque. Su cuerpo desprende una dulce fragancia que embriaga a quien tiene a su alrededor.",
  },
  {
    key: "fuego", name: "Cyndaquil", number: "#0155", caption: "Tercer inicial descubierto",
    img: "/pkmn/cyndaquil.png", typeImg: "/pkmn/tipos/fuego.png", type: "Fuego",
    biome: "Área Volcánica Paniense", color: "#C65C26", tint: "#FFF0E5",
    description: "Es tímido y suele estar acurrucado. Se protege soltando llamas por el lomo; cuando está enfadado, estas son fieras e infernales para intimidar a sus rivales, pero si está cansado sólo consigo echar algunas chispas. Los Cyndaquil del Estado Paniense han podido mantener su ADN de Hisui.",
  },
] as const;

function UserRow({ member }: { member: DiscordMember }) {
  return (
    <div className="pk-user-row">
      <img
        src={member.avatar}
        alt=""
        loading="lazy"
        onError={(e) => { if (e.currentTarget.src !== DEFAULT_AVATAR) e.currentTarget.src = DEFAULT_AVATAR; }}
      />
      <span className="pk-user-ident">
        <strong>{member.globalName || member.username}</strong>
        <small>@{member.username}</small>
      </span>
      <span className="pk-user-dot" aria-hidden="true" />
    </div>
  );
}

function StarterCard({ pokemon }: { pokemon: (typeof starters)[number] }) {
  return (
    <article
      className="pk-starter pk-glass"
      style={{ "--type-color": pokemon.color, "--type-tint": pokemon.tint } as CSSProperties}
    >
      <div className="pk-starter-visual">
        <span className="pk-species-orbit" aria-hidden="true" />
        <img className="pk-starter-art" src={pokemon.img} alt={`Ilustración de ${pokemon.name}`} loading="lazy" />
        <span className="pk-type-chip"><img src={pokemon.typeImg} alt="" loading="lazy" /> {pokemon.type}</span>
      </div>
      <div className="pk-starter-info">
        <div className="pk-starter-tags">
          <span className="pk-type-status">{pokemon.caption}</span>
          <span className="pk-number">Pokédex {pokemon.number}</span>
        </div>
        <h3>Informe biológico: <span>{pokemon.name}</span></h3>
        <p>{pokemon.description}</p>
        <div className="pk-starter-footer">
          <span><ShieldCheck size={15} aria-hidden="true" /> Especie verificada por el Laboratorio Central</span>
          <span>{pokemon.biome}</span>
        </div>
      </div>
    </article>
  );
}

export default function PKMN() {
  const reducedMotion = useReducedMotion();
  const [leaders, setLeaders] = useState<DiscordMember[]>([]);
  const [elite4, setElite4] = useState<DiscordMember[]>([]);
  const [totalTrainersCount, setTotalTrainersCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError(false);

    fetch("/api/roles", { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(`Error HTTP ${r.status}`);
        return r.json();
      })
      .then((data: unknown) => {
        if (controller.signal.aborted) return;
        if (!Array.isArray(data)) throw new Error("Respuesta inesperada en /api/roles");
        const members = data.filter((m): m is DiscordGuildMember =>
          Boolean(m && typeof m === "object" && m.user && typeof m.user.id === "string" &&
            typeof m.user.username === "string" && Array.isArray(m.roles))
        );
        setLeaders(members.filter(m => m.roles.includes(ROLES.GIMNASIO)).map(mapDiscordMember));
        setElite4(members.filter(m => m.roles.includes(ROLES.ALTO_MANDO)).map(mapDiscordMember));
        setTotalTrainersCount(members.filter(m =>
          m.roles.includes(ROLES.ENTRENADORES_REGISTRADOS) || m.roles.includes(ROLES.ALTO_MANDO)
        ).length);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error("No se pudieron cargar los roles de Discord:", err);
        setLoadError(true);
        setLeaders([]);
        setElite4([]);
        setTotalTrainersCount(null);
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });

    return () => controller.abort();
  }, [retryKey]);

  const appear = (delay = 0) => ({
    initial: reducedMotion ? false as const : { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.12 },
    transition: { duration: reducedMotion ? 0 : 0.48, delay: reducedMotion ? 0 : delay, ease: "easeOut" as const },
  });

  return (
    <div className="pkmn-page min-h-screen flex flex-col">
      <style>{`
        .pkmn-page{--pk-primary:#630B57;--pk-ink:#312330;--pk-muted:#746575;--pk-line:rgba(99,11,87,.12);--pk-heading:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;font-size-adjust:none;background:linear-gradient(155deg,#fcf8fc 0%,#f6edf5 52%,#fbf8fc 100%);color:var(--pk-ink);font-family:var(--body-font,Inter,system-ui,sans-serif);overflow-x:clip}
        .pkmn-page *, .pkmn-page *::before, .pkmn-page *::after{box-sizing:border-box}
        /* Sobrescribe font-size-adjust:1 y las métricas incompatibles de Chillvornia del CSS global. */
        .pkmn-page h1,.pkmn-page h2,.pkmn-page h3,.pkmn-page h4,.pkmn-page h5,.pkmn-page h6{font-size-adjust:none!important;font-stretch:normal!important;font-family:var(--pk-heading)!important;letter-spacing:-.025em;overflow-wrap:break-word}
        .pkmn-page .pk-title-lockup strong{font-size-adjust:none!important;font-family:var(--pk-heading)!important}
        .pkmn-page .pk-metric-value{font-size-adjust:none!important}
        .pkmn-page .pk-intro h1{letter-spacing:-.045em}
        .pkmn-page h1,.pkmn-page h2,.pkmn-page h3{max-width:100%}

        .pk-shell{width:min(1160px,100%);margin-inline:auto;padding-inline:clamp(16px,3vw,32px)}
        .pk-glass{background:linear-gradient(135deg,rgba(255,255,255,.85),rgba(255,255,255,.52) 55%,rgba(249,235,247,.65));border:1px solid rgba(255,255,255,.95);box-shadow:inset 0 1px 0 rgba(255,255,255,.95),0 13px 42px rgba(66,24,61,.065),0 1px 4px rgba(66,24,61,.045);-webkit-backdrop-filter:blur(22px) saturate(145%);backdrop-filter:blur(22px) saturate(145%)}
        .pk-utility{background:#251522;color:#efdeea;font-size:10px;letter-spacing:.065em;line-height:1.6;text-align:center;padding:9px 16px}
        .pk-utility-inner{display:flex;align-items:center;justify-content:center;gap:9px;max-width:1100px;margin:auto}
        .pk-utility img{width:23px;height:15px;object-fit:cover;border-radius:2px;flex-shrink:0}
        .pk-utility s{text-decoration-thickness:1.4px;text-decoration-color:#d4a4cd}
        .pk-page-header{position:sticky;top:0;z-index:40;padding:10px 14px;isolation:isolate}
        .pk-head-inner{width:min(1180px,100%);min-height:72px;margin:auto;padding:10px clamp(12px,2vw,22px);border-radius:23px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,auto) minmax(0,1fr);align-items:center;gap:12px}
        .pk-title-lockup{text-align:center;min-width:0;line-height:1.1}
        .pk-title-lockup small{display:block;font-size:9px;font-weight:800;letter-spacing:.21em;color:#876780;margin-bottom:5px;text-transform:uppercase}
        .pk-title-lockup strong{display:block;font-size:clamp(16px,2vw,23px);line-height:1.25;font-family:var(--pk-heading);font-weight:800;letter-spacing:-.035em;white-space:nowrap}
        .pk-title-lockup em{font-style:normal;color:#630B57}
        .pk-head-end{display:flex;justify-content:flex-end;min-width:0}
        .pk-head-inner>.pk-nav-pill{justify-self:start;width:max-content;max-width:100%}
        .pk-nav-pill{display:inline-flex;justify-content:center;align-items:center;gap:9px;min-height:42px;border-radius:15px;padding:10px 14px;font-size:12px;font-weight:800;white-space:nowrap;color:#630B57;border:1px solid rgba(99,11,87,.12);background:rgba(255,255,255,.62);box-shadow:inset 0 1px 0 #fff;transition:transform .2s,background .2s,box-shadow .2s}
        .pk-nav-pill:hover{transform:translateY(-2px);background:#fff;box-shadow:0 7px 16px rgba(99,11,87,.09)}
        .pk-nav-pill:focus-visible,.pk-action:focus-visible,.pk-quiet-action:focus-visible,.pk-retry:focus-visible{outline:3px solid #be8cb6;outline-offset:3px}
        .pk-nav-primary{color:#fff;background:linear-gradient(140deg,#8c397e,#630B57);border-color:rgba(99,11,87,.4)}
        .pk-nav-primary:hover{background:#630B57}
        .pk-hero{position:relative;padding:clamp(38px,7vw,92px) 0 35px}
        .pk-orb{position:absolute;border-radius:50%;filter:blur(45px);pointer-events:none;opacity:.6}
        .pk-orb-a{height:260px;width:260px;top:18px;right:-95px;background:rgba(157,74,146,.14)}
        .pk-orb-b{height:160px;width:160px;bottom:10px;left:-85px;background:rgba(253,185,89,.15)}
        .pk-intro{position:relative;max-width:880px}
        .pk-overline{display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(99,11,87,.14);border-radius:99px;padding:8px 12px;background:rgba(255,255,255,.8);color:#630B57;font-size:10px;font-weight:800;letter-spacing:.13em;text-transform:uppercase}
        .pk-intro h1{font-family:var(--pk-heading);font-weight:850;font-size:clamp(34px,5.4vw,68px);line-height:1.15;letter-spacing:-.045em;margin:22px 0 22px;color:#231823;overflow-wrap:normal;word-break:normal}
        .pk-intro h1 span{color:#630B57}
        .pk-intro p{max-width:690px;font-size:clamp(14px,1.45vw,17px);line-height:1.8;color:#6a5868}
        .pk-hero-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:26px}
        .pk-action,.pk-quiet-action{display:inline-flex;align-items:center;justify-content:center;gap:9px;min-height:46px;padding:12px 17px;border-radius:15px;font-size:12px;font-weight:800;transition:transform .2s,background .2s,box-shadow .2s}
        .pk-action{background:#630B57;color:white;box-shadow:0 9px 22px rgba(99,11,87,.2)}
        .pk-action:hover{transform:translateY(-2px);background:#7b206f}
        .pk-quiet-action{background:#ffffffad;border:1px solid #fff;color:#5c2854}
        .pk-quiet-action:hover{background:white;transform:translateY(-2px)}
        .pk-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin:37px 0 0}
        .pk-metric{padding:clamp(17px,2.6vw,27px);border-radius:23px;min-width:0}
        .pk-metric-icon{display:flex;align-items:center;justify-content:space-between;color:#9d6294;font-size:10px;font-weight:800;letter-spacing:.11em;text-transform:uppercase;gap:7px}
        .pk-metric-value{margin:16px 0 5px;display:flex;gap:9px;align-items:baseline;min-height:45px;font-size:clamp(28px,4vw,43px);line-height:1;font-weight:850;color:#630B57;font-variant-numeric:tabular-nums}
        .pk-metric-value small{font-size:14px;font-weight:600;color:#998a96}
        .pk-metric-caption{font-size:12px;color:#7c6b78;overflow-wrap:anywhere}
        .pk-section{padding-top:clamp(40px,6vw,70px)}
        .pk-section-head{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:20px}
        .pk-section-kicker{color:#853d79;font-size:11px;letter-spacing:.2em;font-weight:800;text-transform:uppercase}
        .pk-section-title{font-family:var(--pk-heading);font-size:clamp(25px,3.2vw,37px);line-height:1.24;color:#291c28;margin:9px 0 0;font-weight:800;letter-spacing:-.035em}
        .pk-section-sub{font-size:13px;color:#796776;line-height:1.7;max-width:420px}
        .pk-roster-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}
        .pk-roster{padding:clamp(16px,2.5vw,28px);border-radius:24px;min-width:0}
        .pk-roster-top{display:flex;align-items:center;justify-content:space-between;gap:9px;margin-bottom:17px}
        .pk-roster-top strong{display:flex;gap:10px;align-items:center;font-size:16px;color:#3c2538}
        .pk-roster-count{border-radius:99px;padding:5px 10px;background:#f3e5f0;color:#630B57;font-size:11px;font-weight:850}
        .pk-roster-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
        .pk-user-row{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.7);border:1px solid rgba(99,11,87,.065);border-radius:15px;padding:9px;min-width:0}
        .pk-user-row img{width:38px;height:38px;border-radius:12px;object-fit:cover;flex-shrink:0;background:#e9d8e7}
        .pk-user-ident{min-width:0;display:block;flex:1}
        .pk-user-ident strong,.pk-user-ident small{display:block;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
        .pk-user-ident strong{font-size:12px;color:#3e2e3c}
        .pk-user-ident small{font-size:10px;color:#967c90;margin-top:2px}
        .pk-user-dot{width:6px;height:6px;border-radius:100%;background:#ab83a5;flex-shrink:0}
        .pk-empty{padding:23px 12px;background:#fff8;border:1px dashed rgba(99,11,87,.15);border-radius:15px;font-size:13px;line-height:1.6;color:#827180;text-align:center}
        .pk-skeleton{height:54px;background:linear-gradient(95deg,#f6eaf3,#fff9,#f6eaf3);background-size:210% 100%;animation:pkShimmer 1.6s linear infinite;border-radius:14px;margin-bottom:9px}
        .pk-error{display:flex;align-items:center;justify-content:space-between;gap:12px;background:#fff0f2;border:1px solid #edc4ce;border-radius:17px;padding:13px 15px;color:#9c3453;font-size:13px;margin-bottom:16px}
        .pk-retry{display:inline-flex;gap:5px;align-items:center;white-space:nowrap;background:white;border:1px solid #edc4ce;border-radius:10px;padding:8px 11px;font-size:11px;font-weight:800}
        .pk-comms{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}
        .pk-comm{padding:clamp(17px,2.6vw,27px);border-radius:24px;min-width:0;display:flex;gap:18px;align-items:flex-start}
        .pk-comm-art{width:99px;height:99px;flex-shrink:0;border-radius:19px;background:#fff9;border:1px solid rgba(99,11,87,.09);display:grid;place-items:center;padding:12px}
        .pk-comm-art img{width:100%;height:100%;object-fit:contain}
        .pk-comm-body{min-width:0}
        .pk-comm-body small{color:#8b4d81;font-size:10px;font-weight:850;text-transform:uppercase;letter-spacing:.11em}
        .pk-comm-body h3{font-size:19px;line-height:1.32;margin:9px 0 12px;color:#3a2435;font-weight:800;font-family:var(--pk-heading)}
        .pk-comm-body p{font-size:13px;line-height:1.7;color:#786976}
        .pk-comm-foot{margin-top:16px;border-top:1px solid rgba(99,11,87,.1);padding-top:12px;color:#8f7789;font-size:11px}
        .pk-starters{display:grid;gap:15px}
        .pk-starter{--type-color:#630B57;--type-tint:#f4e4f2;display:grid;grid-template-columns:minmax(170px,240px) minmax(0,1fr);border-radius:26px;overflow:hidden;min-width:0}
        .pk-starter-visual{position:relative;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;min-height:234px;padding:25px 20px;background:linear-gradient(135deg,var(--type-tint),#fff9)}
        .pk-species-orbit{position:absolute;width:165px;height:165px;border:2px solid color-mix(in srgb,var(--type-color),transparent 83%);border-radius:50%}
        .pk-species-orbit::after{content:"";position:absolute;inset:18px;border:1px dashed color-mix(in srgb,var(--type-color),transparent 70%);border-radius:50%}
        .pk-starter-art{height:140px;width:140px;object-fit:contain;position:relative;z-index:1;transition:transform .32s ease;filter:drop-shadow(0 12px 11px rgba(20,20,20,.12))}
        .pk-starter:hover .pk-starter-art{transform:scale(1.07) translateY(-4px)}
        .pk-type-chip{position:relative;z-index:1;background:#fffd;border:1px solid #fff;padding:6px 13px;border-radius:999px;display:flex;gap:7px;align-items:center;color:var(--type-color);font-size:11px;font-weight:850}
        .pk-type-chip img{height:18px;width:auto;max-width:26px;object-fit:contain}
        .pk-starter-info{padding:clamp(19px,3vw,32px);min-width:0;display:flex;flex-direction:column;justify-content:center}
        .pk-starter-tags{display:flex;flex-wrap:wrap;gap:9px;align-items:center}
        .pk-type-status{background:var(--type-tint);color:var(--type-color);border-radius:999px;padding:6px 11px;text-transform:uppercase;letter-spacing:.07em;font-size:10px;font-weight:850}
        .pk-number{font-size:11px;color:#918291;font-weight:700}
        .pk-starter-info h3{font-size:clamp(20px,2.3vw,27px);line-height:1.3;margin:16px 0 13px;font-family:var(--pk-heading);font-weight:800;letter-spacing:-.035em;color:#3a2537}
        .pk-starter-info h3 span{color:var(--type-color)}
        .pk-starter-info p{max-width:740px;font-size:13px;line-height:1.8;color:#746472}
        .pk-starter-footer{display:flex;justify-content:space-between;flex-wrap:wrap;gap:9px;margin-top:19px;padding-top:13px;border-top:1px solid rgba(99,11,87,.1);color:#887686;font-size:11px}
        .pk-starter-footer span:first-child{display:flex;align-items:center;gap:7px}
        .pk-mafia{background:linear-gradient(130deg,#151116,#241923 65%,#151116);color:#f3eaf1;border:1px solid #654b3a;border-radius:27px;overflow:hidden;box-shadow:0 13px 39px rgba(31,22,28,.17);position:relative}
        .pk-mafia::before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.18;background:repeating-linear-gradient(0deg,transparent 0,transparent 3px,#ac8147 4px)}
        .pk-mafia-main{position:relative;display:grid;grid-template-columns:170px minmax(0,1fr);gap:25px;padding:clamp(20px,4vw,35px);align-items:center}
        .pk-mafia-art{background:#0f0b10;border:1px solid #645036;border-radius:19px;padding:20px;min-height:171px;display:flex;flex-direction:column;gap:12px;align-items:center;justify-content:center}
        .pk-mafia-art>img{width:108px;height:108px;object-fit:contain;filter:grayscale(1) brightness(.85) contrast(1.2) drop-shadow(0 0 12px rgba(232,173,92,.2))}
        .pk-mafia-types{display:flex;align-items:center;gap:9px}
        .pk-mafia-types img{max-height:21px;max-width:61px;object-fit:contain;filter:grayscale(1)}
        .pk-mafia-eyebrow{color:#e6ba7e;font:800 10px ui-monospace,monospace;letter-spacing:.12em}
        .pk-mafia h3{font-size:clamp(21px,2.8vw,28px);font-family:var(--pk-heading);margin:13px 0 15px;line-height:1.28;color:#fff}
        .pk-mafia h3 span{color:#e4ab5f}
        .pk-mafia p{font:12px/1.9 ui-monospace,monospace;color:#d6c9d1;max-width:730px}
        .pk-mafia-footer{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;background:#0d0b0eb8;border-top:1px solid #4f3c31;padding:13px clamp(20px,4vw,35px);color:#d9ad74;font:10px/1.5 ui-monospace,monospace}
        .pk-mafia-footer s{color:#93838c}
        .pk-next{margin-top:17px;padding:21px 24px;display:flex;gap:17px;align-items:center;justify-content:space-between;border:1px dashed #c7a8bf;border-radius:21px;background:#fff8}
        .pk-next h3{color:#442b40;font-size:15px;line-height:1.35;font-weight:800}
        .pk-next p{max-width:750px;font-size:12px;line-height:1.6;color:#8c7888;margin-top:4px}
        .pk-next-label{display:inline-flex;align-items:center;gap:6px;border-radius:99px;padding:8px 10px;color:#8c6283;background:#f3e8f0;font-size:10px;letter-spacing:.06em;text-transform:uppercase;font-weight:800;white-space:nowrap}
        .pk-bottom{padding-bottom:clamp(55px,7vw,90px)}
        @keyframes pkShimmer{to{background-position-x:-210%}}
        @media(max-width:850px){.pk-roster-list{grid-template-columns:1fr}.pk-comms{grid-template-columns:1fr}}
        @media(max-width:640px){.pk-page-header{padding:8px}.pk-head-inner{grid-template-columns:1fr auto;min-height:auto;gap:10px;border-radius:19px;padding:10px 11px}.pk-title-lockup{grid-column:1/-1;grid-row:1;text-align:center;padding-bottom:9px;border-bottom:1px solid rgba(99,11,87,.1)}.pk-head-inner>.pk-nav-pill{grid-column:1;grid-row:2;justify-self:start}.pk-head-end{grid-column:2;grid-row:2}.pk-nav-pill{min-height:39px;padding:9px 12px;font-size:11px}.pk-hero{padding-top:34px}.pk-metrics{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:30px}.pk-metric:last-child{grid-column:1/-1}.pk-metric{padding:17px}.pk-roster-grid{grid-template-columns:1fr}.pk-roster-list{grid-template-columns:repeat(2,minmax(0,1fr))}.pk-section-head{flex-direction:column;align-items:start;gap:7px}.pk-starter{grid-template-columns:1fr}.pk-starter-visual{min-height:205px}.pk-starter-art{height:135px}.pk-mafia-main{grid-template-columns:1fr}.pk-mafia-art{min-height:150px}.pk-next{flex-direction:column;align-items:start}.pk-comm{align-items:center}}
        @media(max-width:400px){.pk-utility{font-size:9px}.pk-intro h1{font-size:clamp(32px,9vw,38px)}.pk-roster-list{grid-template-columns:1fr}.pk-comm{flex-direction:column}.pk-comm-art{width:85px;height:85px}.pk-metric-value{font-size:28px}.pk-starter-info{padding:18px}.pk-next{padding:17px}}
        @media(max-width:360px){.pk-head-inner{gap:7px}.pk-title-lockup strong{font-size:19px}.pk-nav-pill{padding:9px 10px}.pk-intro h1{font-size:32px}.pk-hero-actions>a{width:100%}.pk-metric-icon{font-size:9px;letter-spacing:.055em}.pk-starter-tags{gap:7px}.pk-starter-info h3{font-size:20px}}
        @media(prefers-reduced-motion:reduce){.pkmn-page *, .pkmn-page *::before, .pkmn-page *::after{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
      `}</style>

      <div className="pk-utility">
        <div className="pk-utility-inner">
          <img src="/flag.png" alt="Bandera paniense" />
          <span>Web oficial del Gobierno del Estado Paniense · Ministerio de Desregulación y Pokémon</span>
        </div>
      </div>

      <header className="pk-page-header">
        <div className="pk-head-inner pk-glass">
          <a className="pk-nav-pill" href="/" aria-label="Volver al inicio">
            <ArrowLeft size={16} aria-hidden="true" /> Inicio
          </a>
          <div className="pk-title-lockup" aria-label="Pokémon Pania">
            <small>Artis Panis · Liga Paniense</small>
            <strong>Pokémon <em>Pania</em></strong>
          </div>
          <div className="pk-head-end">
            <a href="/PKMN/pokedex" className="pk-nav-pill pk-nav-primary">
              <BookOpen size={17} aria-hidden="true" /> Pokédex <ArrowRight size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1" id="contenido-pkmn">
        <section className="pk-hero" aria-labelledby="pkmn-title">
          <div className="pk-orb pk-orb-a" aria-hidden="true" />
          <div className="pk-orb pk-orb-b" aria-hidden="true" />
          <div className="pk-shell">
            <motion.div {...appear()} className="pk-intro">
              <span className="pk-overline"><Sparkles size={13} aria-hidden="true" /> Proyecto oficial · Liga Paniense</span>
              <h1 id="pkmn-title">Pokémon <span>Pania</span> Edition.</h1>
              <p>Bienvenido a la delegación oficial de la Liga Pokémon del Estado Paniense. Un ecosistema soberano donde la estrategia, la constancia y la convivencia armónica definen a los mejores entrenadores del territorio.</p>
              <div className="pk-hero-actions">
                <a href="/PKMN/pokedex" className="pk-action"><BookOpen size={16} aria-hidden="true" /> Explorar Pokédex <ArrowRight size={16} aria-hidden="true" /></a>
                <a href="#liga" className="pk-quiet-action"><Trophy size={16} aria-hidden="true" /> Conocer la Liga</a>
              </div>
            </motion.div>
            <div className="pk-metrics" aria-label="Resumen de la Liga Paniense">
              <motion.div {...appear(0.05)} className="pk-metric pk-glass">
                <div className="pk-metric-icon"><span>Líderes de gimnasio</span><Swords size={19} aria-hidden="true" /></div>
                <div className="pk-metric-value">{loading ? "—" : loadError ? "—" : leaders.length}<small>/ 8</small></div>
                <div className="pk-metric-caption">Puestos de liderazgo · Rol {ROLES.GIMNASIO.slice(-6)}</div>
              </motion.div>
              <motion.div {...appear(0.1)} className="pk-metric pk-glass">
                <div className="pk-metric-icon"><span>Alto Mando</span><Trophy size={19} aria-hidden="true" /></div>
                <div className="pk-metric-value">{loading || loadError ? "—" : elite4.length}<small>Élite</small></div>
                <div className="pk-metric-caption">Miembros asignados · Rol {ROLES.ALTO_MANDO.slice(-6)}</div>
              </motion.div>
              <motion.div {...appear(0.15)} className="pk-metric pk-glass">
                <div className="pk-metric-icon"><span>Entrenadores registrados</span><Users size={19} aria-hidden="true" /></div>
                <div className="pk-metric-value">{loading || loadError || totalTrainersCount === null ? "—" : totalTrainersCount}</div>
                <div className="pk-metric-caption">Roles de entrenadores y Alto Mando · Servidor {SERVER_ID.slice(-6)}</div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="pk-section" id="liga" aria-labelledby="liga-title">
          <div className="pk-shell">
            <div className="pk-section-head">
              <div><span className="pk-section-kicker">Organización oficial</span><h2 className="pk-section-title" id="liga-title">La Liga Paniense</h2></div>
              <p className="pk-section-sub">Líderes y Alto Mando sincronizados con los roles oficiales del servidor de Discord.</p>
            </div>
            {loadError && (
              <div className="pk-error" role="alert">
                <span className="inline-flex items-center gap-2"><AlertCircle size={18} aria-hidden="true" /> No se han podido recuperar los roles del servidor.</span>
                <button type="button" className="pk-retry" onClick={() => setRetryKey(v => v + 1)}><RefreshCw size={13} aria-hidden="true" /> Reintentar</button>
              </div>
            )}
            <div className="pk-roster-grid">
              <motion.article {...appear()} className="pk-roster pk-glass">
                <div className="pk-roster-top"><strong><Trophy size={19} color="#9A447F" aria-hidden="true" /> Miembros del Alto Mando</strong><span className="pk-roster-count">{loading || loadError ? "—" : elite4.length}</span></div>
                {loading ? <div aria-label="Cargando Alto Mando"><div className="pk-skeleton" /><div className="pk-skeleton" /></div>
                  : loadError ? <p className="pk-empty">No se ha podido consultar el Alto Mando.</p>
                    : elite4.length === 0 ? <p className="pk-empty">No hay miembros asignados al Alto Mando todavía.</p>
                      : <div className="pk-roster-list">{elite4.map(m => <UserRow key={m.id} member={m} />)}</div>}
              </motion.article>
              <motion.article {...appear(.06)} className="pk-roster pk-glass">
                <div className="pk-roster-top"><strong><Swords size={19} color="#9A447F" aria-hidden="true" /> Líderes de Gimnasio</strong><span className="pk-roster-count">{loading || loadError ? "—" : leaders.length} / 8</span></div>
                {loading ? <div aria-label="Cargando gimnasios"><div className="pk-skeleton" /><div className="pk-skeleton" /></div>
                  : loadError ? <p className="pk-empty">No se han podido consultar los gimnasios.</p>
                    : leaders.length === 0 ? <p className="pk-empty">Los gimnasios están vacíos en este momento.</p>
                      : <div className="pk-roster-list">{leaders.map(m => <UserRow key={m.id} member={m} />)}</div>}
              </motion.article>
            </div>
          </div>
        </section>

        <section className="pk-section" aria-labelledby="noticias-liga-title">
          <div className="pk-shell">
            <div className="pk-section-head"><div><span className="pk-section-kicker">Actualidad institucional</span><h2 id="noticias-liga-title" className="pk-section-title">Comunicados oficiales</h2></div></div>
            <div className="pk-comms">
              <motion.article {...appear()} className="pk-comm pk-glass">
                <div className="pk-comm-art"><img src="/pkmn/corelia.png" alt="Corelia" loading="lazy" /></div>
                <div className="pk-comm-body"><small>Desarrollo de Liga</small><h3>Actualización de Corelia</h3><p>«Corelia está en pleno desarrollo de LaLiga Paniense. Estén atentos a las noticias».</p><div className="pk-comm-foot">Estado: Fase de Configuración de Gimnasios</div></div>
              </motion.article>
              <motion.article {...appear(.06)} className="pk-comm pk-glass">
                <div className="pk-comm-art"><img src="/pkmn/Quastelar.png" alt="Logotipo de Quastelar S. A." loading="lazy" /></div>
                <div className="pk-comm-body"><small>Pacto Bilateral Estatal</small><h3>Inversión Quastelar S. A.</h3><p>El Gobierno y la Empresa <strong>Quastelar S. A.</strong> llegan a un pacto de más de <strong>900M de Panedas</strong> para la lucha por un entorno donde humanos y Pokémon puedan convivir en paz. Serán los encargados de la La Liga Paniense, los Gimnasios, entre otras funciones.</p><div className="pk-comm-foot">Asignación: Infraestructuras de Combate Gubernamentales</div></div>
              </motion.article>
            </div>
          </div>
        </section>

        <section className="pk-section" id="especies" aria-labelledby="iniciales-title">
          <div className="pk-shell">
            <div className="pk-section-head">
              <div><span className="pk-section-kicker">Laboratorio Central</span><h2 className="pk-section-title" id="iniciales-title">Primeros descubrimientos</h2></div>
              <p className="pk-section-sub">Los tres Pokémon iniciales registrados en el ecosistema paniense.</p>
            </div>
            <div className="pk-starters">
              {starters.map((pokemon, i) => <motion.div key={pokemon.key} {...appear(i * .06)}><StarterCard pokemon={pokemon} /></motion.div>)}
            </div>

            <motion.article {...appear()} className="pk-mafia" style={{ marginTop: 16 }}>
              <div className="pk-mafia-main">
                <div className="pk-mafia-art">
                  <img src="/pkmn/vector.png" alt="Silueta clasificada del proyecto ZREL_M-02" loading="lazy" />
                  <div className="pk-mafia-types"><img src="/pkmn/tipos/psiquico.png" alt="Psíquico" loading="lazy" /><img src="/pkmn/tipos/acero.png" alt="Acero" loading="lazy" /></div>
                </div>
                <div>
                  <span className="pk-mafia-eyebrow">♠ ARCHIVO INFILTRADO · SEC_LEVEL: BLACK</span>
                  <h3>REPORTE: <span>[SUJETO_02-X]</span></h3>
                  <p><strong style={{ color: "#e4ab5f" }}>[EXTRACCIÓN]</strong> Información sustraída de los servidores del Laboratorio Central. Archivos clasificados detallan la alteración genética de un espécimen base felino-humanoide. Financiación conjunta entre <strong style={{ color: "#e4ab5f" }}>La Mafia del Pan</strong> y la división científica del <strong>Team Rocket</strong>. Estructura celular reescrita para asimilar energía cinética destructiva. Estado actual: En fase de incubación biomecánica.</p>
                </div>
              </div>
              <div className="pk-mafia-footer"><span>● MAFIA_NET // LINK_ESTABLISHED ♠</span><s>Especie verificada por el Laboratorio Central ★</s></div>
            </motion.article>

            <div className="pk-next">
              <div className="flex items-center gap-3"><FlaskConical size={26} color="#90528a" aria-hidden="true" className="shrink-0" /><div><h3>Archivos encriptados del laboratorio</h3><p>Muy pronto se anunciará de manera oficial el Profesor Pokémon gubernamental y los especímenes iniciales restantes asignados a la región.</p></div></div>
              <span className="pk-next-label"><LockKeyhole size={13} aria-hidden="true" /> Código de acceso requerido</span>
            </div>
          </div>
        </section>
        <div className="pk-bottom" />
      </main>
      <Footer />
    </div>
  );
}
