import Header from "../components/Header";
import Footer from "../components/Footer";
// Importamos 'Variants' para solucionar el error de 'ease: string'
import { motion, Variants } from "framer-motion";
import { useEffect, useState } from "react";
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
  miembros?: string[];
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

  const totalMembers = parties.reduce((sum, p) => {
    const miembros = Array.isArray(p.miembros) ? p.miembros : [];
    return sum + miembros.length;
  }, 0);

  // Tipamos explícitamente con ': Variants' para corregir el error del 'ease'
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

      <main className="flex-1 py-12 md:py-20 px-4 md:px-0">
        <div className="container mx-auto max-w-6xl space-y-20">

          {/* Cabecera Principal */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="flex flex-col items-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-accent/20 blur-xl scale-150" />
                <div className="relative p-3 rounded-full border border-accent/20 bg-accent/10 backdrop-blur-sm">
                  <img src="/electa/electa.png" alt="Electa" className="w-14 h-14 object-contain drop-shadow-lg" />
                </div>
              </div>
              <span className="text-xs font-mono tracking-[0.3em] uppercase text-foreground/40">
                Sistema Electa
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
              Hemiciclo Político
            </h1>
            <p className="text-foreground/60 max-w-2xl mx-auto text-sm md:text-base">
              Fuerzas parlamentarias activas en la comunidad. Datos oficiales del censo paniense ordenados por representatividad civil.
            </p>
          </motion.div>

          {/* Estadísticas de control global */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex justify-center gap-6 flex-wrap"
          >
            <div className="bg-background/40 backdrop-blur-sm border border-border rounded-2xl p-4 text-center w-48 shadow-sm">
              <div className="text-2xl font-bold text-accent">
                {loading ? "…" : parties.length}
              </div>
              <div className="text-xs uppercase tracking-wide text-foreground/50">Partidos registrados</div>
            </div>
            <div className="bg-background/40 backdrop-blur-sm border border-border rounded-2xl p-4 text-center w-48 shadow-sm">
              <div className="text-2xl font-bold text-accent">
                {loading ? "…" : <AnimatedNumber value={totalMembers} />}
              </div>
              <div className="text-xs uppercase tracking-wide text-foreground/50">Ciudadanos afiliados</div>
            </div>
          </motion.div>

          {/* Feedback de Carga / Error */}
          {loading && (
            <div className="text-center text-foreground/50 py-20 text-lg animate-pulse">
              Sincronizando con el censo del Reino...
            </div>
          )}
          {error && (
            <div className="text-center text-red-400 py-20 border border-red-500/20 rounded-2xl bg-red-500/5">
              Error al cargar los datos electorales: {error}
            </div>
          )}

          {/* Bloque de Contenido Principal una vez cargado */}
          {!loading && !error && (
            <>
              {/* SECCIÓN 1: Líderes Carismáticos */}
              <section className="space-y-6">
                <div className="border-b border-border/60 pb-2">
                  <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                    <span>👑</span> Líderes de la Cámara
                  </h2>
                  <p className="text-xs text-foreground/50">Ordenados por el volumen de apoyo de sus respectivas formaciones.</p>
                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                  {parties.map((party) => {
                    const miembros = Array.isArray(party.miembros) ? party.miembros : [];
                    return (
                      <motion.div
                        key={`lider-${party.id}`}
                        variants={itemVariants}
                        className="bg-background/20 backdrop-blur-sm border border-border/50 rounded-xl p-4 flex items-center gap-3 hover:border-accent/30 transition-all group"
                      >
                        {party.lider_avatar_url ? (
                          <img
                            src={party.lider_avatar_url}
                            alt={party.lider_username || "Líder"}
                            className="w-12 h-12 rounded-full object-cover border border-border group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-lg border border-accent/20">
                            👤
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-sm truncate text-foreground group-hover:text-accent transition-colors">
                            {party.lider_username || "Sin Identificar"}
                          </h3>
                          <p className="text-xs text-foreground/40 font-mono truncate">
                            Líder de {party.siglas}
                          </p>
                          <div className="text-[10px] text-accent/80 font-medium mt-0.5">
                            {miembros.length} {miembros.length === 1 ? "respaldo" : "respaldos"}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </section>

              {/* SECCIÓN 2: Tarjetas de Afiliación (Grid con Datos Completos) */}
              <section className="space-y-6">
                <div className="border-b border-border/60 pb-2">
                  <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                    <span>📊</span> Fuerza Electoral y Afiliados
                  </h2>
                  <p className="text-xs text-foreground/50">Organizaciones políticas jerarquizadas de mayor a menor número de militantes.</p>
                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
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
                        whileHover={{ y: -4, scale: 1.01 }}
                        className="group relative bg-background/30 backdrop-blur-sm border border-border/60 rounded-2xl p-5 shadow-md hover:shadow-accent/5 transition-all overflow-hidden"
                      >
                        {tailwindGradient ? (
                          <div className={`absolute inset-0 bg-gradient-to-br ${tailwindGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0`} />
                        ) : (
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0" style={gradientStyle} />
                        )}

                        <div className="relative z-10 space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              {party.logo_url && (
                                <img
                                  src={party.logo_url}
                                  alt={`Logo ${party.siglas}`}
                                  className="w-10 h-10 rounded-xl object-cover border border-border/50"
                                />
                              )}
                              <div>
                                <h3 className="text-lg font-bold text-foreground tracking-tight leading-tight group-hover:text-accent transition-colors">
                                  {party.nombre}
                                </h3>
                                <span className="text-xs font-mono text-foreground/40">({party.siglas})</span>
                              </div>
                            </div>
                            <span className="text-xl opacity-30 group-hover:opacity-100 transition-opacity">🏛️</span>
                          </div>

                          {party.ideologia && (
                            <p className="text-xs font-semibold text-accent border-l-2 border-accent/50 pl-2 uppercase tracking-wider">
                              {party.ideologia}
                            </p>
                          )}

                          <div className="flex items-center gap-2 text-xs bg-background/50 p-2 rounded-xl border border-border/40">
                            <span className="text-base">👥</span>
                            <div>
                              <span className="font-bold text-foreground">{miembros.length}</span>{" "}
                              <span className="text-foreground/50">{miembros.length === 1 ? "afiliado oficial" : "afiliados oficiales"}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </section>

              {/* SECCIÓN 3: Directorio de Bloques Políticos */}
              <section className="space-y-6">
                <div className="border-b border-border/60 pb-2">
                  <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                    <span>📖</span> Directorio de Doctrina y Bloques
                  </h2>
                  <p className="text-xs text-foreground/50">Idearios, estatutos y resúmenes programáticos informados por cada facción.</p>
                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-4 md:grid-cols-2"
                >
                  {parties.map((party) => (
                    <motion.div
                      key={`resumen-${party.id}`}
                      variants={itemVariants}
                      className="bg-background/10 backdrop-blur-xs border border-border/40 rounded-xl p-4 flex gap-4 items-start hover:bg-background/30 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-1">
                        {party.logo_url ? (
                          <img
                            src={party.logo_url}
                            alt={`Logo ${party.siglas}`}
                            className="w-12 h-12 rounded-xl object-cover border border-border bg-background"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center font-mono text-xs font-bold border border-border">
                            {party.siglas}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <h4 className="font-bold text-base truncate text-foreground">{party.nombre}</h4>
                          <span className="text-xs font-mono text-foreground/40 flex-shrink-0">({party.siglas})</span>
                        </div>
                        <p className="text-xs text-foreground/60 leading-relaxed">
                          {party.descripcion || "Este partido político no ha redactado todavía un manifiesto o una descripción programática oficial en los registros del censo."}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </section>
            </>
          )}

          <p className="text-center text-xs text-foreground/30 pt-6 border-t border-border/50">
            • Datos en tiempo real del censo del Reino del Pan •
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}