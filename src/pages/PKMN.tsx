import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Estructura nativa que devuelve la API de Discord para cada miembro
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

// --- CONFIGURACIÓN DE VARIABLES DE ENTORNO (FUERA DEL COMPONENTE) ---
// Al estar aquí fuera, no causan que el useEffect se vuelva loco en cada renderizado.
const SERVER_ID = String(import.meta.env.VITE_GUILD_ID || "1381359904731693056");

const ROLES = {
  GIMNASIO: String(import.meta.env.VITE_ROLE_GIMNASIO || "1508080870303596604"),
  ALTO_MANDO: String(import.meta.env.VITE_ROLE_ALTO_MANDO || "1508080141501333576"),
  ENTRENADORES_REGISTRADOS: String(import.meta.env.VITE_ROLE_ENTRENADORES || "1508081112230920402")
};

console.log("¿Vite lee el .env?", import.meta.env.VITE_ROLE_GIMNASIO);
console.log("Objeto ROLES cargado:", ROLES);

export default function PKMN() {
  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" as const, delay },
  });

  const [leaders, setLeaders] = useState<DiscordMember[]>([]);
  const [elite4, setElite4] = useState<DiscordMember[]>([]);
  const [totalTrainersCount, setTotalTrainersCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper para transformar el formato nativo de Discord a tu interfaz limpia
  const mapDiscordMember = (member: DiscordGuildMember): DiscordMember => {
    const { id, username, global_name, avatar } = member.user;
    const avatarUrl = avatar
      ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`
      : "https://via.placeholder.com/150";

    return {
      id,
      username,
      globalName: global_name || undefined,
      avatar: avatarUrl
    };
  };

  useEffect(() => {
    // Al no depender de variables internas replicadas, se ejecuta una sola vez de forma segura
    fetch(`/api/roles`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      })
      .then((allMembers: DiscordGuildMember[]) => {
        if (!Array.isArray(allMembers)) {
          console.error("La estructura devuelta no es un array válido:", allMembers);
          return;
        }

        // 1. Filtrar Líderes de Gimnasio
        const gymLeaders = allMembers
          .filter(m => m.roles.includes(ROLES.GIMNASIO))
          .map(mapDiscordMember);

        // 2. Filtrar Alto Mando
        const elite4Members = allMembers
          .filter(m => m.roles.includes(ROLES.ALTO_MANDO))
          .map(mapDiscordMember);

        // 3. Contar entrenadores totales unificados
        const totalTrainers = allMembers.filter(m =>
          m.roles.includes(ROLES.ENTRENADORES_REGISTRADOS) || m.roles.includes(ROLES.ALTO_MANDO)
        ).length;

        setLeaders(gymLeaders);
        setElite4(elite4Members);
        setTotalTrainersCount(totalTrainers);
      })
      .catch((err) => {
        console.error("Error crítico conectando con el Proxy de Discord:", err);
      })
      .finally(() => setLoading(false));
  }, []); // Array de dependencias vacío para evitar bucles infinitos

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <Header />

      <main className="flex-1">
        <section className="section-spacious relative">
          <div className="absolute right-[-10%] top-[10%] w-96 h-96 rounded-full border-8 border-accent/5 pointer-events-none after:content-[''] after:absolute after:top-1/2 after:w-full after:h-2 after:bg-accent/5 before:content-[''] before:absolute before:top-[38%] before:left-[38%] before:w-24 before:h-24 before:rounded-full before:border-8 before:border-accent/5" />

          <div className="container mx-auto max-w-5xl px-4 sm:px-6">
            <motion.div {...fadeUp(0)}>
              <span className="text-xs font-mono tracking-[0.35em] uppercase text-accent font-semibold bg-accent/10 px-3 py-1 rounded-full inline-block mb-4">
                Proyecto Oficial · Liga Paniense
              </span>
              <h1 className="display-font text-5xl sm:text-6xl font-black tracking-tight leading-tight">
                Pokémon <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-amber-500 to-red-500">Pania</span> Edition
              </h1>
              <p className="mt-4 max-w-2xl text-[15px] sm:text-base text-foreground/70 leading-relaxed">
                Bienvenido a la delegación oficial de la Liga Pokémon del Reino del Pan. Un ecosistema soberano donde la estrategia, la constancia y la convivencia armónica definen a los mejores entrenadores del territorio.
              </p>
            </motion.div>

            {/* Marcadores / Contadores Dinámicos */}
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 mt-12">
              <motion.div {...fadeUp(0.12)} className="p-5 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm">
                <span className="text-xs font-mono text-foreground/40 uppercase tracking-wider block">Líderes de Gimnasio</span>
                <span className="text-3xl sm:text-4xl font-bold display-font text-accent block mt-1">
                  {loading ? "..." : leaders.length} <span className="text-sm font-normal text-foreground/40">/ 8</span>
                </span>
                <span className="text-[11px] text-foreground/50 font-mono block mt-2">ID: ...{ROLES.GIMNASIO.slice(-6)}</span>
              </motion.div>

              <motion.div {...fadeUp(0.18)} className="p-5 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm">
                <span className="text-xs font-mono text-foreground/40 uppercase tracking-wider block">Alto Mando</span>
                <span className="text-3xl sm:text-4xl font-bold display-font text-foreground block mt-1">
                  {loading ? "..." : elite4.length} <span className="text-sm font-normal text-foreground/40">Elite</span>
                </span>
                <span className="text-[11px] text-foreground/50 font-mono block mt-2">ID: ...{ROLES.ALTO_MANDO.slice(-6)}</span>
              </motion.div>

              <motion.div {...fadeUp(0.24)} className="col-span-2 sm:col-span-1 p-5 rounded-2xl border border-accent/20 bg-accent/5 backdrop-blur-sm">
                <span className="text-xs font-mono text-accent uppercase tracking-wider block">Entrenadores Registrados</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-bold display-font text-foreground">
                    {loading || totalTrainersCount === null ? "Sincronizando..." : totalTrainersCount}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                </div>
                <span className="text-[11px] text-foreground/50 font-mono block mt-2">Roles unificados de combate</span>
              </motion.div>
            </div>

            {/* Listados de Personalidades Activas */}
            <div className="grid gap-6 md:grid-cols-2 mt-12">
              {/* Bloque Alto Mando */}
              <motion.div {...fadeUp(0.28)} className="p-6 rounded-2xl border border-border bg-card/20">
                <h3 className="text-lg font-bold display-font mb-4 flex items-center gap-2">
                  <span className="text-red-500">🏆</span> Miembros del Alto Mando
                </h3>
                {loading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-10 bg-border/40 rounded-xl" />
                    <div className="h-10 bg-border/40 rounded-xl" />
                  </div>
                ) : elite4.length === 0 ? (
                  <p className="text-xs text-foreground/40 italic py-2">No hay miembros asignados al Alto Mando todavía.</p>
                ) : (
                  <div className="grid gap-2">
                    {elite4.map((member) => (
                      <div key={member.id} className="flex items-center gap-3 p-2 rounded-xl bg-background/40 border border-border/40">
                        <img
                          src={member.avatar}
                          alt={member.username}
                          className="w-8 h-8 rounded-full border border-accent/20 object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/150" }}
                        />
                        <div>
                          <p className="text-sm font-medium leading-none text-foreground">{member.globalName || member.username}</p>
                          <p className="text-[10px] font-mono text-foreground/40 mt-0.5">@{member.username}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Bloque Líderes de Gimnasio */}
              <motion.div {...fadeUp(0.32)} className="p-6 rounded-2xl border border-border bg-card/20">
                <h3 className="text-lg font-bold display-font mb-4 flex items-center gap-2">
                  <span className="text-amber-500">⚡</span> Líderes de Gimnasio del Reino
                </h3>
                {loading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-10 bg-border/40 rounded-xl" />
                    <div className="h-10 bg-border/40 rounded-xl" />
                  </div>
                ) : leaders.length === 0 ? (
                  <p className="text-xs text-foreground/40 italic py-2">Los gimnasios están vacíos en este momento.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {leaders.map((member) => (
                      <div key={member.id} className="flex items-center gap-2 p-2 rounded-xl bg-background/40 border border-border/40">
                        <img
                          src={member.avatar}
                          alt={member.username}
                          className="w-7 h-7 rounded-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/150" }}
                        />
                        <span className="text-xs font-medium text-foreground truncate">{member.globalName || member.username}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Secciones de Comunicados */}
            <div className="grid gap-6 md:grid-cols-2 mt-6">
              {/* Tarjeta 1: Corelia */}
              <motion.div {...fadeUp(0.36)} className="rounded-2xl border border-border/60 bg-card/30 overflow-hidden flex flex-col justify-between">
                <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-background border border-border/80 p-1 flex-shrink-0 shadow-sm">
                    <img src="/pkmn/corelia.png" alt="Corelia" className="w-full h-full object-cover rounded-lg" onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/150" }} />
                  </div>
                  <div className="space-y-2 text-center sm:text-left">
                    <span className="inline-block text-[10px] font-mono tracking-widest text-amber-500 uppercase font-bold bg-amber-500/10 px-2 py-0.5 rounded">Desarrollo de Liga</span>
                    <h3 className="text-xl font-bold display-font text-foreground">Actualización de Corelia</h3>
                    <p className="text-sm text-foreground/70 leading-relaxed italic">"Corelia está en pleno desarrollo de LaLiga Paniense. Estén atentos a las noticias."</p>
                  </div>
                </div>
                <div className="px-6 py-3 bg-background/50 border-t border-border/40 text-[11px] text-foreground/40 font-mono">Estado: Fase de Configuración de Gimnasios</div>
              </motion.div>

              {/* Tarjeta 2: Quastelar S.A */}
              <motion.div {...fadeUp(0.4)} className="rounded-2xl border border-accent/20 bg-gradient-to-b from-card/30 to-accent/[0.02] overflow-hidden flex flex-col justify-between">
                <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-background border border-border/80 p-2 flex-shrink-0 shadow-sm flex items-center justify-center">
                    <img src="/pkmn/Quastelar.png" alt="Quastelar S.A. Logo" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/150" }} />
                  </div>
                  <div className="space-y-2 text-center sm:text-left">
                    <span className="inline-block text-[10px] font-mono tracking-widest text-accent uppercase font-bold bg-accent/10 px-2 py-0.5 rounded">Pacto Bilateral Estatal</span>
                    <h3 className="text-xl font-bold display-font text-foreground">Inversión Quastelar S.A.</h3>
                    <p className="text-sm text-foreground/75 leading-relaxed">
                      El Gobierno y la Empresa <strong className="text-foreground">Quastelar S. A</strong> llegan a un pacto de más de <span className="text-accent font-semibold">900M de Panedas</span> para la lucha por un entorno donde humanos y Pokémon puedan convivir en paz. Serán los encargados de la La Liga Paniense, Los Gimnasios, entre otras funciones.
                    </p>
                  </div>
                </div>
                <div className="px-6 py-3 bg-accent/5 border-t border-accent/10 text-[11px] text-accent/70 font-mono">Asignación: Infraestructuras de Combate Gubernamentales</div>
              </motion.div>

              &nbsp;&nbsp;

              {/* Tarjeta 3: Popplio */}
              <motion.div {...fadeUp(0.42)} className="col-span-1 md:col-span-2 rounded-2xl border border-blue-500/20 bg-gradient-to-r from-card/40 via-blue-950/[0.02] to-card/40 overflow-hidden flex flex-col justify-between shadow-md">
                <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:items-center">
                  <div className="w-full md:w-44 flex flex-col items-center justify-center bg-background/50 border border-border/80 rounded-xl p-4 shadow-sm shrink-0 gap-3">
                    <div className="w-24 h-24 flex items-center justify-center">
                      <img src="/pkmn/Popplio.png" alt="Especie Popplio" className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(147,197,253,0.3)] hover:scale-105 transition-transform" onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/150" }} />
                    </div>
                    <img src="/pkmn/tipos/agua.png" alt="Tipo Agua" className="h-6 w-auto object-contain" />
                  </div>

                  <div className="space-y-3 flex-1 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                      <span className="text-[10px] font-mono tracking-widest text-blue-400 uppercase font-bold bg-blue-500/10 px-2 py-0.5 rounded">Primer Inicial Anunciado</span>
                      <span className="text-[10px] font-mono text-foreground/40 bg-muted/60 px-2 py-0.5 rounded border border-border/40">Pokédex Internacional: #728</span>
                    </div>
                    <h3 className="text-2xl font-black display-font text-foreground tracking-tight">Informe Biológico: Popplio</h3>
                    <p className="text-sm text-foreground/80 leading-relaxed max-w-3xl">
                      Maneja con soltura los globos de agua que crea. Para poder hacer globos más grandes, necesita practicar sin descanso. Gracias al entrenamiento diario al que se somete, es capaz de inflar globos cada vez más grandes a través de la nariz.
                    </p>
                  </div>
                </div>
                <div className="px-6 py-3 bg-blue-500/[0.02] border-t border-blue-500/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-blue-400/80 font-mono">
                  <span>Registro: Bioma Costero Paniense</span>
                  <span className="text-[10px] text-foreground/40">Especie Verificada por el Laboratorio Central ★</span>
                </div>
              </motion.div>
            </div>

            &nbsp;&nbsp;

            {/* Tarjeta 4: Sprigatito */}
            <motion.div {...fadeUp(0.42)} className="col-span-1 md:col-span-2 rounded-2xl border border-green-500/20 bg-gradient-to-r from-card/40 via-green-950/[0.02] to-card/40 overflow-hidden flex flex-col justify-between shadow-md">
              <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:items-center">
                <div className="w-full md:w-44 flex flex-col items-center justify-center bg-background/50 border border-border/80 rounded-xl p-4 shadow-sm shrink-0 gap-3">
                  <div className="w-24 h-24 flex items-center justify-center">
                    <img
                      src="/pkmn/sprigatito.png"
                      alt="Especie Sprigatito"
                      className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(134,239,172,0.3)] hover:scale-105 transition-transform"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/150" }}
                    />
                  </div>
                  <img src="/pkmn/tipos/planta.png" alt="Tipo Planta" className="h-6 w-auto object-contain" />
                </div>

                <div className="space-y-3 flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <span className="text-[10px] font-mono tracking-widest text-green-400 uppercase font-bold bg-green-500/10 px-2 py-0.5 rounded">Segundo Inicial Anunciado</span>
                    <span className="text-[10px] font-mono text-foreground/40 bg-muted/60 px-2 py-0.5 rounded border border-border/40">Pokédex Internacional: #0906</span>
                  </div>
                  <h3 className="text-2xl font-black display-font text-foreground tracking-tight">Informe Biológico: Sprigatito</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed max-w-3xl">
                    Su sedoso pelaje se asemeja en composición a las plantas. Se lava la cara con diligencia para que no se le seque. Su cuerpo desprende una dulce fragancia que embriaga a quien tiene a su alrededor.
                  </p>
                </div>
              </div>
              <div className="px-6 py-3 bg-green-500/[0.02] border-t border-green-500/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-green-400/80 font-mono">
                <span>Registro: Bosque Paniense</span>
                <span className="text-[10px] text-foreground/40">Especie Verificada por el Laboratorio Central ★</span>
              </div>
            </motion.div>

            &nbsp;&nbsp;

            {/* Tarjeta 5: Cyndaquil */}
            <motion.div {...fadeUp(0.42)} className="col-span-1 md:col-span-2 rounded-2xl border border-orange-500/20 bg-gradient-to-r from-card/40 via-orange-950/[0.02] to-card/40 overflow-hidden flex flex-col justify-between shadow-md">
              <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:items-center">
                <div className="w-full md:w-44 flex flex-col items-center justify-center bg-background/50 border border-border/80 rounded-xl p-4 shadow-sm shrink-0 gap-3">
                  <div className="w-24 h-24 flex items-center justify-center">
                    <img
                      src="/pkmn/cyndaquil.png"
                      alt="Especie Cyndaquil"
                      className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(249,115,22,0.3)] hover:scale-105 transition-transform"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/150" }}
                    />
                  </div>
                  <img src="/pkmn/tipos/fuego.png" alt="Tipo Fuego" className="h-6 w-auto object-contain" />
                </div>

                <div className="space-y-3 flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <span className="text-[10px] font-mono tracking-widest text-orange-400 uppercase font-bold bg-orange-500/10 px-2 py-0.5 rounded">Tercer Inicial Descubierto</span>
                    <span className="text-[10px] font-mono text-foreground/40 bg-muted/60 px-2 py-0.5 rounded border border-border/40">Pokédex Internacional: #0155</span>
                  </div>
                  <h3 className="text-2xl font-black display-font text-foreground tracking-tight">Informe Biológico: Cyndaquil</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed max-w-3xl">
                    Es tímido y suele estar acurrucado. Se protege soltando llamas por el lomo; cuando está enfadado, estas son fieras e infernales para intimidar a sus rivales, pero si está cansado sólo consigue echar algunas chispas. Los Cyndaquil del Reino del Pan han podido mantener su ADN de Hisui.
                  </p>
                </div>
              </div>
              <div className="px-6 py-3 bg-orange-500/[0.02] border-t border-orange-500/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-orange-400/80 font-mono">
                <span>Registro: Área Volcánica Paniense</span>
                <span className="text-[10px] text-foreground/40">Especie Verificada por el Laboratorio Central ★</span>
              </div>
            </motion.div>

            &nbsp;&nbsp;

            {/* Tarjeta: HACKED BY LA MAFIA DEL PAN ♠️ */}
            <motion.div
              {...fadeUp(0.42)}
              className="col-span-1 md:col-span-2 rounded-2xl border border-amber-600/30 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 overflow-hidden flex flex-col justify-between shadow-lg relative"
            >
              {/* Código de terminal sutil en el fondo */}
              <div className="absolute top-2 right-4 text-[9px] text-amber-500/20 font-mono hidden sm:block select-none pointer-events-none tracking-wider">
                STATUS: INTRUSION_DETECTED // OVR_044
              </div>

              <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:items-center">

                {/* Contenedor del Espécimen Izquierda */}
                <div className="w-full md:w-44 flex flex-col items-center justify-center shrink-0 gap-3">

                  {/* Celda de contención de la silueta */}
                  <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-md relative overflow-hidden flex flex-col items-center justify-center">
                    {/* Rejilla de escaneo minimalista */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(217,119,6,0.02)_50%,transparent_50%)] bg-[length:100%_4px] pointer-events-none"></div>

                    {/* Silueta con destello Ámbar industrial */}
                    <div className="w-24 h-24 flex items-center justify-center bg-zinc-950 border border-amber-500/10 rounded-lg relative group">
                      <img
                        src="/pkmn/zercorr.png"
                        alt="PROYECTO: ZREL_M-02"
                        className="w-full h-full object-contain brightness-0 drop-shadow-[0_0_12px_rgba(217,119,6,0.25)] scale-105 transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/150/09090b/ffffff?text=SILUETA" }}
                      />
                    </div>
                  </div>

                  {/* Doble Tipo (Ahora FUERA del contenedor de la silueta y uno encima del otro) */}
                  <div className="flex flex-col gap-1 w-full items-center justify-center mt-1">
                    <img src="/pkmn/tipos/electrico.png" alt="Tipo Eléctrico" className="h-5 w-auto object-contain grayscale opacity-80" />
                    <img src="/pkmn/tipos/acero.png" alt="Tipo Acero" className="h-5 w-auto object-contain grayscale opacity-80" />
                  </div>
                </div>

                {/* Textos de la Terminal de Hackeo */}
                <div className="space-y-3 flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      ⚠️ ARCHIVO INFILTRADO
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/50 px-2 py-0.5 rounded border border-zinc-700/30">
                      SEC_LEVEL: BLACK
                    </span>
                  </div>

                  <h3 className="text-2xl font-black display-font text-zinc-100 tracking-tight flex items-center justify-center md:justify-start gap-2">
                    <span className="text-amber-500 font-normal">♠️</span> REPORTE: <span className="text-amber-500 font-mono tracking-tight">[SUJETO_02-X]</span>
                  </h3>

                  <p className="text-sm text-zinc-400 leading-relaxed max-w-3xl font-mono">
                    <span className="text-amber-500/90 font-bold">[EXTRACCIÓN]</span> Información sustraída de los servidores del Laboratorio Central. Archivos clasificados detallan la alteración genética de un espécimen base felino-humanoide. Financiación conjunta entre <span className="text-amber-400/90 underline underline-offset-4 decoration-dashed">La Mafia del Pan</span> y la división científica del <span className="text-zinc-300 font-bold">Team Rocket</span>. Estructura celular reescrita para asimilar energía cinética destructiva. Estado actual: En fase de incubación biomecánica.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-zinc-900/40 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono">
                <span className="flex items-center gap-1.5 text-amber-500/80">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  MAFIA_NET // LINK_ESTABLISHED ♠️
                </span>
                <span className="text-[10px] text-zinc-600 line-through decoration-zinc-700">
                  Especie Verificada por el Laboratorio Central ★
                </span>
              </div>
            </motion.div>

            {/* Próximamente */}
            <motion.div {...fadeUp(0.44)} className="mt-12 rounded-2xl border border-dashed border-border p-6 bg-background/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-3xl animate-pulse select-none">🧬</div>
                <div>
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono">Archivos Encriptados del Laboratorio</h4>
                  <p className="text-xs text-foreground/50 leading-relaxed mt-0.5">Muy pronto se anunciará de manera oficial el Profesor Pokémon gubernamental y los especímenes iniciales restantes asignados a la región.</p>
                </div>
              </div>
              <div className="w-full sm:w-auto text-center font-mono text-[10px] uppercase bg-border/40 text-foreground/60 px-3 py-1.5 rounded-lg border border-border/50">Clasificado por el Estado</div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}