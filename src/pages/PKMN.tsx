import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Estructura de un miembro de Discord que viene de la API
interface DiscordMember {
  id: string;
  username: string;
  globalName?: string;
  avatar: string;
}

export default function PKMN() {
  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" as const, delay },
  });

  // Configuración de IDs de Discord obligatorios
  const SERVER_ID = "1381359904731693056";
  const ROLES = {
    GIMNASIO: "1508080870303596604",
    ALTO_MANDO: "1508080141501333576",
    ENTRENADORES_REGISTRADOS: "1508081112230920402"
  };

  // Estados para almacenar los datos reales del servidor
  const [leaders, setLeaders] = useState<DiscordMember[]>([]);
  const [elite4, setElite4] = useState<DiscordMember[]>([]);
  const [totalTrainersCount, setTotalTrainersCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Llamada combinada para obtener los miembros de cada rol desde tu API backend
    // Nota: Ajusta las URLs si tu backend usa rutas distintas (ej: /api/discord/role/[id])
    Promise.all([
      fetch(`/api/roles/${ROLES.GIMNASIO}`).then(r => r.json()).catch(() => []),
      fetch(`/api/roles/${ROLES.ALTO_MANDO}`).then(r => r.json()).catch(() => []),
      fetch(`/api/roles/count?roles=${ROLES.ENTRENADORES_REGISTRADOS},${ROLES.ALTO_MANDO}`).then(r => r.json()).catch(() => ({ count: 0 }))
    ])
      .then(([leadersData, eliteData, trainersCountData]) => {
        // Si tu API devuelve un array directo o envuelto en un objeto (ej: leadersData.members) adaptarlo aquí
        setLeaders(Array.isArray(leadersData) ? leadersData : (leadersData.members || []));
        setElite4(Array.isArray(eliteData) ? eliteData : (eliteData.members || []));
        setTotalTrainersCount(trainersCountData.count ?? (leaders.length + elite4.length));
      })
      .catch((err) => console.error("Error cargando datos de La Liga:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <Header />

      <main className="flex-1">
        <section className="section-spacious relative">
          {/* Fondo geométrico */}
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
                        <img src={member.avatar || "https://via.placeholder.com/150"} alt={member.username} className="w-8 h-8 rounded-full border border-accent/20" />
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
                        <img src={member.avatar || "https://via.placeholder.com/150"} alt={member.username} className="w-7 h-7 rounded-full object-cover" />
                        <span className="text-xs font-medium text-foreground truncate">{member.globalName || member.username}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Comunicados de Prensa */}
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
            </div>

            {/* Próximamente */}
            <motion.div {...fadeUp(0.44)} className="mt-12 rounded-2xl border border-dashed border-border p-6 bg-background/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-3xl animate-pulse select-none">🧬</div>
                <div>
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono">Archivos Encriptados del Laboratorio</h4>
                  <p className="text-xs text-foreground/50 leading-relaxed mt-0.5">Muy pronto se anunciará de manera oficial el Profesor Pokémon gubernamental y los especímenes iniciales asignados a la región.</p>
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