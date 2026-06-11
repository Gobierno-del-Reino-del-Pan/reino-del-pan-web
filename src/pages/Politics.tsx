import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://vwejghgsnibjbqkuhklv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3ZWpnaGdzbmliamJxa3Voa2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0NDAyMjUsImV4cCI6MjA5NDAxNjIyNX0.nC06Dj8SMmcR-W4T-7E9Fs1DAT0h4UEUtDxz2maQiHQ"
);

const GUILD_ID = "1381359904731693056"; // El del server

interface Party {
  id: string;
  guild_id: string;
  nombre: string;
  siglas: string;
  ideologia?: string;
  descripcion?: string;
  lider_id?: string;
  lider_username?: string;      // ← nuevo
  lider_avatar_url?: string;    // ← nuevo
  miembros?: string[];
  logo_url?: string;
  color_hex?: string;
  activo?: boolean;
  creado_at?: string;
}

const FALLBACK_COLORS = [
  "from-rose-500/20 to-orange-500/20",
  "from-red-700/20 to-orange-700/20",
  "from-green-700/20 to-emerald-500/20",
  "from-red-500/20 to-pink-500/20",
  "from-purple-600/20 to-violet-400/20",
  "from-gray-700/20 to-stone-600/20",
  "from-yellow-600/20 to-amber-500/20",
  "from-indigo-500/20 to-blue-400/20",
  "from-teal-600/20 to-cyan-500/20",
  "from-emerald-500/20 to-green-400/20",
  "from-sky-500/20 to-blue-400/20",
  "from-fuchsia-500/20 to-pink-400/20",
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
        .eq("activo", true)
        .order("creado_at", { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setParties(data || []);
      }
      setLoading(false);
    }

    fetchParties();
  }, []);

  const totalMembers = parties.reduce((sum, p) => {
    const miembros = Array.isArray(p.miembros) ? p.miembros : [];
    return sum + miembros.length;
  }, 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" as const } },
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-accent/5">
      <Header />

      <main className="flex-1 py-12 md:py-20 px-4 md:px-0">
        <div className="container mx-auto max-w-6xl">
          {/* Cabecera */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="flex flex-col items-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-accent/20 blur-xl scale-150" />
                <div className="relative p-3 rounded-full border border-accent/20 bg-accent/10 backdrop-blur-sm">
                  <img src="/electa/electa.png" alt="Electa" className="w-14 h-14 object-contain drop-shadow-lg" />
                </div>
              </div>

              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-mono tracking-[0.3em] uppercase text-foreground/40">
                  Sistema
                </span>
                <h1
                  className="text-5xl md:text-6xl font-black tracking-tight"
                  style={{
                    background: "linear-gradient(to right, #f59e0b, #fbbf24, #f97316)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    lineHeight: "1.2",
                    paddingBottom: "4px",
                  }}
                >
                  eLECTA
                </h1>
              </div>
            </div>

            &nbsp; <p className="text-foreground/60 mt-3 max-w-2xl mx-auto">
              Partidos políticos activos en la comunidad. Datos oficiales del censo paniense.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex justify-center gap-6 mb-10 flex-wrap"
          >
            <div className="bg-background/40 backdrop-blur-sm border border-border rounded-2xl p-4 text-center w-48">
              <div className="text-2xl font-bold text-accent">
                {loading ? "…" : parties.length}
              </div>
              <div className="text-xs uppercase tracking-wide text-foreground/50">
                Partidos registrados
              </div>
            </div>
            <div className="bg-background/40 backdrop-blur-sm border border-border rounded-2xl p-4 text-center w-48">
              <div className="text-2xl font-bold text-accent">
                {loading ? "…" : <AnimatedNumber value={totalMembers} />}
              </div>
              <div className="text-xs uppercase tracking-wide text-foreground/50">
                Ciudadanos afiliados
              </div>
            </div>
          </motion.div>

          {/* Estado de carga / error */}
          {loading && (
            <div className="text-center text-foreground/50 py-20 text-lg animate-pulse">
              Cargando partidos…
            </div>
          )}
          {error && (
            <div className="text-center text-red-400 py-20">
              Error al cargar los datos: {error}
            </div>
          )}

          {/* Grid de partidos */}
          {!loading && !error && (
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
                  ? {
                    background: `linear-gradient(135deg, ${party.color_hex}33, ${party.color_hex}11)`,
                  }
                  : {};

                return (
                  <motion.div
                    key={party.id}
                    variants={cardVariants}
                    whileHover={{ y: -6, scale: 1.01, transition: { duration: 0.2 } }}
                    className="group relative bg-background/30 backdrop-blur-sm border border-border/60 rounded-2xl p-5 shadow-lg hover:shadow-accent/10 transition-all overflow-hidden"
                  >
                    {/* Fondo degradado hover */}
                    {tailwindGradient ? (
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${tailwindGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0`}
                      />
                    ) : (
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0"
                        style={gradientStyle}
                      />
                    )}

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {party.logo_url && (
                            <img
                              src={party.logo_url}
                              alt={`Logo ${party.siglas}`}
                              className="w-8 h-8 rounded-full object-cover border border-border/50"
                            />
                          )}
                          <div>
                            <h2 className="text-xl font-bold text-foreground tracking-tight leading-tight">
                              {party.nombre}
                            </h2>
                            <span className="text-xs font-mono text-foreground/40">
                              ({party.siglas})
                            </span>
                          </div>
                        </div>
                        <div className="text-2xl opacity-30 group-hover:opacity-100 transition">
                          🏛️
                        </div>
                      </div>

                      {party.ideologia && (
                        <p className="text-sm font-medium text-accent mb-3 border-l-2 border-accent/50 pl-2">
                          {party.ideologia}
                        </p>
                      )}

                      {party.descripcion && (
                        <p className="text-xs text-foreground/50 mb-3 line-clamp-2">
                          {party.descripcion}
                        </p>
                      )}

                      <div className="space-y-2 text-sm text-foreground/80">
                        <div className="flex items-center gap-2">
                          {party.lider_avatar_url ? (
                            <img
                              src={party.lider_avatar_url}
                              alt={party.lider_username || "Líder"}
                              className="w-7 h-7 rounded-full object-cover border border-border/50 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-xs text-accent font-bold flex-shrink-0">
                              👤
                            </div>
                          )}
                          <span className="font-mono text-xs truncate">
                            {party.lider_username || party.lider_id}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/50 text-right">
                        <span className="text-xs text-foreground/40">#partido</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          <p className="text-center text-xs text-foreground/30 mt-12 pt-6 border-t border-border/50">
            • Datos en tiempo real del censo del Reino del Pan •
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
