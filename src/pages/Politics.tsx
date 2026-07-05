import Header from "../components/Header";
import Footer from "../components/Footer";

import { motion, Variants } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";


const GUILD_ID = "1381359904731693056";


interface Party {
  id: string;
  guild_id: string;
  nombre: string;
  siglas: string;
  ideologia?: string;
  descripcion?: string;
  lider_id?: string;
  lider_username?: string;
  lider_avatar_url?: string;
  miembros?: any[];
  logo_url?: string;
  color_hex?: string;
  activo?: boolean;
  creado_at?: string;
}


const FALLBACK_COLORS = [
  "from-rose-500/20 to-orange-500/20",
  "from-green-700/20 to-emerald-500/20",
  "from-purple-600/20 to-violet-400/20",
  "from-indigo-500/20 to-blue-400/20",
];


function hexToTailwindGradient(hex: string | undefined, idx: number) {
  if (hex) return null;
  return FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
}


export default function PoliticsPage() {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    async function fetchParties() {
      const { data, error } = await supabase
        .from("electa_partidos")
        .select("*")
        .eq("guild_id", GUILD_ID)
        .eq("activo", true);

      if (error) {
        setError(error.message);
      } else {
        const sortedParties = (data || []).sort((a, b) => {
          const countA = Array.isArray(a.miembros) ? a.miembros.length : 0;
          const countB = Array.isArray(b.miembros) ? b.miembros.length : 0;
          return countB - countA;
        });
        setParties(sortedParties);
      }
      setLoading(false);
    }

    fetchParties();
  }, []);


  const totalMembers = useMemo(() => {
    return parties.reduce((sum, p) => {
      const miembros = Array.isArray(p.miembros) ? p.miembros : [];
      return sum + miembros.length;
    }, 0);
  }, [parties]);


  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };


  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
  };


  const AnimatedNumber = ({ value }: { value: number }) => (
    <motion.span
      key={value}
      initial={{ scale: 1.2, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="font-bold text-accent"
    >
      {value}
    </motion.span>
  );


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-accent/5 text-foreground">
      <Header />

      <main className="flex-1 py-16 md:py-28 px-4 md:px-0">
        <div className="container mx-auto max-w-6xl space-y-32">

          {/* ========================================================================= */}
          {/* SECCIÓN: CABECERA PRINCIPAL DE LA PÁGINA                                  */}
          {/* ========================================================================= */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-6"
          >
            <div className="flex flex-col items-center gap-4 mb-2">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-accent/20 blur-xl scale-150" />
                <div className="relative p-4 rounded-full border border-accent/20 bg-accent/10 backdrop-blur-sm">
                  <img src="/electa/electa.png" alt="Electa" className="w-16 h-16 object-contain drop-shadow-lg" />
                </div>
              </div>

              <span className="text-xs font-mono tracking-[0.3em] uppercase text-foreground/40">
                Plataforma de Control Electoral
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Hemiciclo Político
            </h1>

            <p className="text-foreground/60 max-w-2xl mx-auto text-base md:text-lg font-light leading-relaxed">
              Fuerzas parlamentarias activas en la comunidad. Datos oficiales del censo paniense ordenados por representatividad civil.
            </p>
          </motion.div>


          {/* ========================================================================= */}
          {/* SECCIÓN: PANEL DE ESTADÍSTICAS GLOBALES                                   */}
          {/* ========================================================================= */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex justify-center gap-8 flex-wrap pt-4"
          >
            <div className="bg-background/40 backdrop-blur-sm border border-border rounded-2xl p-6 text-center w-56 shadow-sm space-y-1">
              <div className="text-3xl font-bold text-accent">
                {loading ? "…" : parties.length}
              </div>
              <div className="text-xs uppercase tracking-wider font-semibold text-foreground/40">Partidos registrados</div>
            </div>

            <div className="bg-background/40 backdrop-blur-sm border border-border rounded-2xl p-6 text-center w-56 shadow-sm space-y-1">
              <div className="text-3xl font-bold text-accent">
                {loading ? "…" : <AnimatedNumber value={totalMembers} />}
              </div>
              <div className="text-xs uppercase tracking-wider font-semibold text-foreground/40">Ciudadanos afiliados</div>
            </div>
          </motion.div>


          {/* ========================================================================= */}
          {/* ESTADOS AUXILIARES (CARGA Y ERROR)                                       */}
          {/* ========================================================================= */}
          {loading && (
            <div className="text-center text-foreground/50 py-24 text-xl font-medium tracking-wide animate-pulse">
              Sincronizando con el censo del Reino...
            </div>
          )}

          {error && (
            <div className="text-center text-red-400 py-16 border border-red-500/20 rounded-2xl bg-red-500/5 max-w-xl mx-auto shadow-sm">
              Error al cargar los datos electorales: {error}
            </div>
          )}


          {/* ========================================================================= */}
          {/* SECCIONES PARLAMENTARIAS                                                  */}
          {/* ========================================================================= */}
          {!loading && !error && (
            <>
              {/* SECCIÓN 1: Líderes de la Cámara */}
              <section>
                <div className="border-b border-border/60 pb-5 mb-10 space-y-3">
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
                    <span>👑</span> Líderes de la Cámara
                  </h2>
                  <p className="text-sm md:text-base text-foreground/50 tracking-wide font-light">
                    Formaciones políticas ordenadas por el volumen de apoyo de sus respectivas delegaciones.
                  </p>
                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
                >
                  {parties.map((party) => {
                    const miembros = Array.isArray(party.miembros) ? party.miembros : [];

                    return (
                      <motion.div
                        key={`lider-${party.id}`}
                        variants={itemVariants}
                        className="bg-background/20 backdrop-blur-sm border border-border/50 rounded-xl p-5 flex items-center gap-4 hover:border-accent/30 transition-all group shadow-sm"
                      >
                        {party.lider_avatar_url ? (
                          <img
                            src={party.lider_avatar_url}
                            alt={party.lider_username || "Líder"}
                            className="w-14 h-14 rounded-full object-cover border border-border group-hover:scale-105 transition-transform shadow-inner"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center text-xl border border-accent/20 flex-shrink-0">
                            👤
                          </div>
                        )}

                        <div className="min-w-0 flex-1 space-y-0.5">
                          <h3 className="font-bold text-base truncate text-foreground group-hover:text-accent transition-colors">
                            {party.lider_username || "Sin Identificar"}
                          </h3>

                          <p className="text-xs text-foreground/40 font-mono truncate">
                            Líder de {party.siglas}
                          </p>

                          <div className="text-[11px] text-accent/80 font-semibold pt-0.5">
                            {miembros.length} {miembros.length === 1 ? "respaldo" : "respaldos"}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </section>


              {/* SECCIÓN 2: Fuerza Electoral y Afiliados */}
              <section>
                <div className="border-b border-border/60 pb-5 mb-10 space-y-3">
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
                    <span>📊</span> Fuerza Electoral y Afiliados
                  </h2>
                  <p className="text-sm md:text-base text-foreground/50 tracking-wide font-light">
                    Organizaciones políticas jerarquizadas de mayor a menor número de militantes en el censo.
                  </p>
                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
                >
                  {parties.map((party, idx) => {
                    const miembros = Array.isArray(party.miembros) ? party.miembros : [];
                    const tailwindGradient = hexToTailwindGradient(party.color_hex, idx);
                    const gradientStyle = party.color_hex
                      ? { background: `linear-gradient(135deg, ${party.color_hex}22, ${party.color_hex}05)` }
                      : {};

                    return (
                      <motion.div
                        key={party.id}
                        variants={itemVariants}
                        whileHover={{ y: -6, scale: 1.01 }}
                        className="group relative bg-background/30 backdrop-blur-sm border border-border/60 rounded-2xl p-6 shadow-md hover:shadow-accent/5 transition-all overflow-hidden space-y-5"
                      >
                        {tailwindGradient ? (
                          <div className={`absolute inset-0 bg-gradient-to-br ${tailwindGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0`} />
                        ) : (
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0" style={gradientStyle} />
                        )}

                        <div className="relative z-10 space-y-5">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                              {party.logo_url ? (
                                <img
                                  src={party.logo_url}
                                  alt={`Logo ${party.siglas}`}
                                  className="w-12 h-12 rounded-xl object-cover border border-border/50 bg-background/50 shadow-sm"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center font-mono text-xs font-bold border border-border text-foreground/40 flex-shrink-0 select-none">
                                  NL
                                </div>
                              )}

                              <div className="space-y-0.5">
                                <h3 className="text-xl font-bold text-foreground tracking-tight leading-snug group-hover:text-accent transition-colors">
                                  {party.nombre}
                                </h3>
                                <span className="text-xs font-mono text-foreground/40">({party.siglas})</span>
                              </div>
                            </div>

                            <span className="text-2xl opacity-20 group-hover:opacity-100 transition-opacity">🏛️</span>
                          </div>

                          {party.ideologia && (
                            <p className="text-xs font-bold text-accent border-l-2 border-accent/50 pl-3 uppercase tracking-widest">
                              {party.ideologia}
                            </p>
                          )}

                          <div className="flex items-center gap-3 pt-1 border-t border-border/40">
                            {party.lider_avatar_url ? (
                              <img
                                src={party.lider_avatar_url}
                                alt={party.lider_username || "Líder"}
                                className="w-8 h-8 rounded-full object-cover border border-border/60"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center text-sm border border-border/40 text-foreground/50">
                                👤
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-[10px] uppercase font-mono tracking-wider text-foreground/40 leading-none">Liderazgo</p>
                              <p className="text-xs font-semibold text-foreground/80 truncate mt-0.5">
                                {party.lider_username || "Sin designar"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-sm bg-background/50 p-3 rounded-xl border border-border/40 shadow-inner">
                            <span className="text-lg">👥</span>
                            <div>
                              <span className="font-extrabold text-foreground">{miembros.length}</span>{" "}
                              <span className="text-foreground/50 font-light">{miembros.length === 1 ? "afiliado oficial" : "afiliados oficiales"}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </section>


              {/* SECCIÓN 3: Directorio de Doctrina y Bloques */}
              <section>
                <div className="border-b border-border/60 pb-5 mb-10 space-y-3">
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
                    <span>📖</span> Directorio de Doctrina y Bloques
                  </h2>
                  <p className="text-sm md:text-base text-foreground/50 tracking-wide font-light">
                    Idearios constitucionales, estatutos internos y resúmenes programáticos oficiales.
                  </p>
                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-6 md:grid-cols-2"
                >
                  {parties.map((party) => (
                    <motion.div
                      key={`resumen-${party.id}`}
                      variants={itemVariants}
                      className="bg-background/10 backdrop-blur-xs border border-border/40 rounded-xl p-5 flex gap-5 items-start hover:bg-background/30 transition-colors shadow-sm"
                    >
                      <div className="flex-shrink-0 mt-1">
                        {party.logo_url ? (
                          <img
                            src={party.logo_url}
                            alt={`Logo ${party.siglas}`}
                            className="w-14 h-14 rounded-xl object-cover border border-border bg-background shadow-inner"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center font-mono text-xs font-bold border border-border text-foreground/40 select-none">
                            NL
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <h4 className="font-bold text-lg tracking-tight text-foreground">
                            {party.nombre}
                          </h4>
                          <span className="text-xs font-mono text-foreground/40 flex-shrink-0">
                            ({party.siglas})
                          </span>
                        </div>

                        <p className="text-sm text-foreground/60 leading-relaxed font-light">
                          {party.descripcion || "Este partido político no ha redactado todavía un manifesto o una descripción programática oficial en los registros del censo."}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </section>
            </>
          )}

          <p className="text-center text-xs text-foreground/30 pt-10 border-t border-border/40 tracking-wider">
            • Datos en tiempo real del censo del Reino del Pan •
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}