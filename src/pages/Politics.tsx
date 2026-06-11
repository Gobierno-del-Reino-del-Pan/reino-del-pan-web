import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://vwejghgsnibjbqkuhklv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3ZWpnaGdzbmliamJxa3Voa2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0NDAyMjUsImV4cCI6MjA5NDAxNjIyNX0.nC06Dj8SMmcR-W4T-7E9Fs1DAT0h4UEUtDxz2maQiHQ"
);

const GUILD_ID = "TU_GUILD_ID"; // ← Cambia esto por tu guild_id real

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

function hexToTailwindGradient(hex, idx) {
  // Si tiene color_hex, genera un estilo inline; si no, usa fallback Tailwind
  if (hex) return null; // señal para usar style inline
  return FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
}

export default function PoliticsPage() {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
  };

  const AnimatedNumber = ({ value }) => (
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
            <div className="inline-block p-3 rounded-full bg-accent/10 mb-4">
              <img src="/electa/electa.png" alt="Electa" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-accent to-amber-400 bg-clip-text text-transparent">
              Sistema eLECTA
            </h1>
            <p className="text-foreground/60 mt-3 max-w-2xl mx-auto">
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
                          <span className="text-base">👤</span>
                          <span className="truncate font-mono text-xs">
                            {party.lider_id}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-base">👥</span>
                          <span className="font-mono">
                            {miembros.length} afiliado{miembros.length !== 1 ? "s" : ""}
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
