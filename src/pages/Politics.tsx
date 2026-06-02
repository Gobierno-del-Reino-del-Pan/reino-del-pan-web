import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion } from "framer-motion";

export default function PoliticsPage() {
  const parties = [
    { name: "Adelante PAN (AP)", ideology: "Nacionalismo Paniense de Izquierdas", leader: "ID 1396303514120228957", members: 1, color: "from-rose-500/20 to-orange-500/20" },
    { name: "NOX (NOX)", ideology: "Extrema Derecha", leader: "Faze_Jp181905r ♠", members: 2, color: "from-red-700/20 to-orange-700/20" },
    { name: "Partido Popular del Estado Paniense (PP)", ideology: "Derecha", leader: "𝕄𝕒𝕣𝕥𝕚𝕟𝕚", members: 0, color: "from-blue-600/20 to-sky-500/20" },
    { name: "Bloque Nacionalista Paniense (BNP)", ideology: "Nacionalismo Paniense", leader: "ID 1223445444422", members: 1, color: "from-green-700/20 to-emerald-500/20" },
    { name: "Partido Socialista Obrero Paniense (PSOP)", ideology: "Centro Izquierda", leader: "ID 123456789101112", members: 1, color: "from-red-500/20 to-pink-500/20" },
    { name: "METRIKA (MTK)", ideology: "Partido de la Madre Fundadora", leader: "Kahuna de Salamanca / P-77644", members: 3, color: "from-purple-600/20 to-violet-400/20" },
    { name: "La Masa Negra (LMA)", ideology: "Anarquista", leader: "Harina ♠", members: 52, color: "from-gray-700/20 to-stone-600/20" },
    { name: "Se Acabó El Pan (SAEP)", ideology: "Soberanismo Paniense", leader: "cesar5355X / P-00046287", members: 1, color: "from-yellow-600/20 to-amber-500/20" },
    { name: "Partido Unido de las Regiones Panaderas (P.U.R.P.)", ideology: "libertad, unión, preservación, crecimiento, respeto y cooperación", leader: "Ruth", members: 4, color: "from-indigo-500/20 to-blue-400/20" },
    { name: "CUP PAÏSOS PANIENCS (CUP-P)", ideology: "Nacionalismo Paniense", leader: "EPG andress_uwu67", members: 31, color: "from-teal-600/20 to-cyan-500/20" },
    { name: "Unión Democrática Paniense (UDP)", ideology: "Centro", leader: "Elmaestrocriticon/P-00052021", members: 5, color: "from-emerald-500/20 to-green-400/20" },
    { name: "Partido Popular Paniense Nacional (P3N)", ideology: "Centro Nacional", leader: "Secretario General Paco Jones", members: 15, color: "from-sky-500/20 to-blue-400/20" },
    { name: "Los Correctos (LC)", ideology: "Purismo lingüístico", leader: "Esteban / P-41307 / L.C", members: 2, color: "from-fuchsia-500/20 to-pink-400/20" },
  ];

  const totalMembers = parties.reduce((sum, p) => sum + p.members, 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.2 }
    }
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const AnimatedNumber = ({ value }) => {
    return (
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
  };

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
              <span className="text-4xl">🏛️</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-accent to-amber-400 bg-clip-text text-transparent">
              Congreso del Reino del Pan
            </h1>
            <p className="text-foreground/60 mt-3 max-w-2xl mx-auto">
              Partidos políticos activos en la comunidad. Datos oficiales del censo paniense.
            </p>
          </motion.div>

          {/* Visteis, se programar chat */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex justify-center gap-6 mb-10 flex-wrap"
          >
            <div className="bg-background/40 backdrop-blur-sm border border-border rounded-2xl p-4 text-center w-48">
              <div className="text-2xl font-bold text-accent">{parties.length}</div>
              <div className="text-xs uppercase tracking-wide text-foreground/50">Partidos registrados</div>
            </div>
            <div className="bg-background/40 backdrop-blur-sm border border-border rounded-2xl p-4 text-center w-48">
              <div className="text-2xl font-bold text-accent">
                <AnimatedNumber value={totalMembers} />
              </div>
              <div className="text-xs uppercase tracking-wide text-foreground/50">Ciudadanos afiliados</div>
            </div>
          </motion.div>

          {/* Grid de partidos */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {parties.map((party, idx) => (
              <motion.div
                key={idx}
                variants={cardVariants}
                whileHover={{ y: -6, scale: 1.01, transition: { duration: 0.2 } }}
                className="group relative bg-background/30 backdrop-blur-sm border border-border/60 rounded-2xl p-5 shadow-lg hover:shadow-accent/10 transition-all overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${party.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0`}></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-foreground tracking-tight">
                      {party.name}
                    </h2>
                    <div className="text-2xl opacity-30 group-hover:opacity-100 transition">🏛️</div>
                  </div>
                  <p className="text-sm font-medium text-accent mb-3 border-l-2 border-accent/50 pl-2">
                    {party.ideology}
                  </p>
                  <div className="space-y-2 text-sm text-foreground/80">
                    <div className="flex items-center gap-2">
                      <span className="text-base">👤</span>
                      <span className="truncate">{party.leader}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base">👥</span>
                      <span className="font-mono">{party.members} afiliado{party.members !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/50 text-right">
                    <span className="text-xs text-foreground/40">#partido</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <p className="text-center text-xs text-foreground/30 mt-12 pt-6 border-t border-border/50">
            • Actualizado el 1 de junio de 2026 • Datos oficiales del censo del Reino del Pan •
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}