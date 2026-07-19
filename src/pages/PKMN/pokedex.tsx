import Footer from "../../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

// --- MAPEADO DE TIPOS A CASTELLANO PARA LOGOS LOCALES ---
const TYPE_TRANSLATIONS: { [key: string]: string } = {
    water: "agua",
    grass: "planta",
    fire: "fuego",
    fairy: "hada",
    dark: "siniestro",
    ghost: "fantasma",
    psychic: "psiquico",
    electric: "electrico",
    steel: "acero",
    normal: "normal",
    flying: "volador",
    bug: "bicho",
    poison: "veneno",
    ground: "tierra",
    rock: "roca",
    ice: "hielo",
    fighting: "lucha",
    dragon: "dragon",
    stellar: "astral",
    fisico: "fisico"
};

// --- MAPEADO DE ESTADÍSTICAS A CASTELLANO ---
const STAT_TRANSLATIONS: { [key: string]: string } = {
    "hp": "PS",
    "attack": "Ataque",
    "defense": "Defensa",
    "special-attack": "At. Esp",
    "special-defense": "Def. Esp",
    "speed": "Velocidad"
};

// --- LISTADO TOTAL INCLUYENDO FAMILIAS Y EL FANMADE ---
const POKEDEX_LIST = [
    { id: "popplio", name: "Popplio", baseId: "popplio", isFanmade: false },
    { id: "brionne", name: "Brionne", baseId: "popplio", isFanmade: false },
    { id: "primarina", name: "Primarina", baseId: "popplio", isFanmade: false },
    { id: "sprigatito", name: "Sprigatito", baseId: "sprigatito", isFanmade: false },
    { id: "floragato", name: "Floragato", baseId: "sprigatito", isFanmade: false },
    { id: "meowscarada", name: "Meowscarada", baseId: "sprigatito", isFanmade: false },
    { id: "cyndaquil", name: "Cyndaquil", baseId: "cyndaquil", isFanmade: false },
    { id: "quilava", name: "Quilava", baseId: "cyndaquil", isFanmade: false },
    { id: "typhlosion-hisui", name: "Typhlosion (Hisui)", baseId: "cyndaquil", isFanmade: false },
    { id: "riolu", name: "Riolu", baseId: "riolu", isFanmade: false },
    { id: "lucario", name: "Lucario", baseId: "riolu", isFanmade: false },
    // Pokémon Fanmade
    { id: "codigo-vector", name: "Código Vector", baseId: "codigo-vector", isFanmade: true }
];

interface Move {
    name: string;
    type: string;
    power: number | string;
}

interface PokemonData {
    id: string | number;
    name: string;
    displayName: string;
    types: string[];
    image: string;
    cry: string | null;
    description: string;
    abilities: string[];
    abilityDetail?: { name: string; effect: string };
    stats: { name: string; value: number }[] | null;
    moves: Move[];
    family: string;
    isFanmade: boolean;
}

export default function Pokedex() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPkmn, setSelectedPkmn] = useState("popplio");
    const [pokemon, setPokemon] = useState<PokemonData | null>(null);
    const [loading, setLoading] = useState(true);
    const [playingCry, setPlayingCry] = useState(false);

    useEffect(() => {
        setLoading(true);

        const staticData = POKEDEX_LIST.find((p) => p.id === selectedPkmn);

        if (staticData?.isFanmade) {
            setTimeout(() => {
                setPokemon({
                    id: "ERR_VCTR",
                    name: "codigo-vector",
                    displayName: "Código Vector",
                    types: ["steel", "psychic"],
                    image: "/pkmn/vector.png",
                    cry: null,
                    description: "Es capaz de calcular trayectorias perfectas en milisegundos, fallar no es una opción para él.",
                    abilities: ["Impulso Vectorial"],
                    abilityDetail: {
                        name: "Impulso Vectorial",
                        effect: "Aumenta su Velocidad al entrar en combate. Absorbe los ataques eléctricos aumentando su velocidad. Inmune a la electricidad."
                    },
                    stats: null,
                    moves: [
                        { name: "Golpe Cinético", type: "fisico", power: 90 },
                        { name: "Chispazo", type: "electric", power: 80 },
                        { name: "Sorpresa", type: "normal", power: 40 },
                        { name: "Alarido", type: "dark", power: 55 }
                    ],
                    family: "Código Vector",
                    isFanmade: true
                });
                setLoading(false);
            }, 300);
        } else {
            fetch(`https://pokeapi.co/api/v2/pokemon/${selectedPkmn}`)
                .then((res) => res.json())
                .then(async (data) => {
                    const types = data.types.map((t: any) => t.type.name);

                    const stats = data.stats.map((s: any) => ({
                        name: STAT_TRANSLATIONS[s.stat.name] || s.stat.name.toUpperCase(),
                        value: s.base_stat
                    }));

                    const abilityPromises = data.abilities.map(async (a: any) => {
                        const abRes = await fetch(a.ability.url);
                        const abData = await abRes.json();
                        const esName = abData.names.find((n: any) => n.language.name === "es")?.name;
                        return esName || abData.name;
                    });
                    const resolvedAbilities = await Promise.all(abilityPromises);

                    let description = "No hay registros disponibles de este espécimen en la base de datos oficial.";
                    try {
                        const speciesRes = await fetch(data.species.url);
                        const speciesData = await speciesRes.json();
                        const esEntry = speciesData.flavor_text_entries.find(
                            (entry: any) => entry.language.name === "es"
                        );
                        if (esEntry) {
                            description = esEntry.flavor_text.replace(/\f/g, " ");
                        }
                    } catch (e) {
                        console.error("Error obteniendo descripción", e);
                    }

                    const movePromises = data.moves.slice(0, 15).map(async (m: any) => {
                        try {
                            const mRes = await fetch(m.move.url);
                            const mData = await mRes.json();
                            return {
                                name: mData.names.find((n: any) => n.language.name === "es")?.name || mData.name,
                                type: mData.type.name,
                                power: mData.power || "---"
                            };
                        } catch {
                            return { name: m.move.name, type: "normal", power: "---" };
                        }
                    });

                    const resolvedMoves = await Promise.all(movePromises);
                    const bestMoves = resolvedMoves
                        .filter((m) => m.power !== "---")
                        .sort((a, b) => (b.power as number) - (a.power as number))
                        .slice(0, 4);

                    setPokemon({
                        id: data.id,
                        name: data.name,
                        displayName: staticData?.name || data.name,
                        types,
                        image: data.sprites.other["official-artwork"].front_default || data.sprites.front_default,
                        cry: data.cries?.latest || data.cries?.legacy || null,
                        description,
                        abilities: resolvedAbilities,
                        stats,
                        moves: bestMoves.length ? bestMoves : resolvedMoves.slice(0, 4),
                        family: staticData?.baseId || "Desconocida",
                        isFanmade: false
                    });
                })
                .catch((err) => console.error("Error cargando PokéAPI:", err))
                .finally(() => setLoading(false));
        }
    }, [selectedPkmn]);

    const playCry = () => {
        if (!pokemon?.cry || playingCry) return;
        setPlayingCry(true);
        const audio = new Audio(pokemon.cry);
        audio.volume = 0.3;
        audio.play();
        audio.onended = () => setPlayingCry(false);
    };

    const filteredList = POKEDEX_LIST.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground overflow-hidden">

            {/* 1. Franja de Web Oficial del Gobierno - FUENTE INTER EXPLICITA */}
            <div className="bg-zinc-900 border-b border-border/40 py-1.5 px-4 text-[10px] md:text-xs text-zinc-400 font-sans relative z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-center gap-2.5 text-center">
                    <img
                        src="/flag.png"
                        alt="Bandera del Reino del Pan"
                        className="h-3 w-5 opacity-90 object-cover rounded-[1px]"
                    />
                    <span className="font-semibold tracking-wider uppercase">
                        Web oficial del Gobierno del Reino del Pan · Ministerio de Desregulación y Pokémon
                    </span>
                </div>
            </div>

            {/* 2. HEADER ULTRA OPTIMIZADO (CENTRADO Y ENGRANDEDIDO con Botón de Regreso) */}
            <header className="w-full border-b border-border/40 bg-card/10 backdrop-blur-xl sticky top-0 z-50 font-sans overflow-hidden">
                {/* Efecto sutil de haz de luz superior en el fondo */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px] bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

                <div className="container mx-auto max-w-5xl px-4 sm:px-6 h-20 flex items-center justify-between relative">

                    {/* BOTÓN REGRESAR A LA PRINCIPAL */}
                    <div className="flex items-center absolute left-4 sm:left-6">
                        <a
                            href="/pkmn"
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/60 bg-background/40 hover:bg-background/80 hover:border-foreground/20 transition-all group font-mono text-[11px] uppercase tracking-wider text-foreground/80"
                        >
                            <span className="text-accent transition-transform group-hover:-translate-x-0.5">←</span>
                            <span>Volver</span>
                        </a>
                    </div>

                    {/* Bloque Central de Identidad (Engrandecido y Centrado Absoluto) */}
                    <div className="mx-auto text-center flex flex-col items-center justify-center gap-0.5 group select-none">
                        <span className="text-2xl sm:text-3xl font-black tracking-tight display-font text-foreground transition-transform duration-300 group-hover:scale-[1.02]">
                            Pokémon{" "}
                            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-accent via-amber-500 to-red-500 drop-shadow-[0_2px_10px_rgba(245,158,11,0.15)]">
                                Pania
                            </span>
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="h-[1px] w-4 bg-gradient-to-r from-transparent to-border/60" />
                            <div className="h-[1px] w-4 bg-gradient-to-l from-transparent to-border/60" />
                        </div>
                    </div>

                    {/* Adorno Derecho Técnico / Sincronización para equilibrar el layout */}
                    <div className="hidden md:flex items-center gap-3 absolute right-6 font-mono text-[10px]">
                        <span className="text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                            Sincronizado
                        </span>
                    </div>

                </div>
            </header>

            {/* CONTENIDO PRINCIPAL DE LA POKÉDEX */}
            <main className="flex-1 container mx-auto max-w-6xl px-4 py-8 grid gap-8 md:grid-cols-12 items-start">

                {/* ================= SECCIÓN IZQUIERDA: INDEX & NAVEGACIÓN ================= */}
                <section className="md:col-span-4 flex flex-col gap-4 max-h-[82vh]">
                    <div className="pb-2">
                        <span className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground uppercase">
                            REGISTROS DISPONIBLES DE LA NACIÓN
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar espécimen gubernamental..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full mt-2 bg-muted/40 border border-border/60 px-4 py-2.5 rounded-xl text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:bg-background focus:border-border transition-all"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                        {filteredList.map((pkmn) => {
                            const isSelected = selectedPkmn === pkmn.id;
                            return (
                                <button
                                    key={pkmn.id}
                                    onClick={() => setSelectedPkmn(pkmn.id)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl font-mono text-left transition-all duration-150 group relative ${isSelected
                                        ? "bg-foreground text-background font-bold"
                                        : "bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                        }`}
                                >
                                    <div className="flex items-center gap-3 z-10">
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${isSelected ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"
                                            }`}>
                                            {pkmn.isFanmade ? "AUTÓCTONO" : "REGIONAL"}
                                        </span>
                                        <span className="text-xs tracking-tight">{pkmn.name}</span>
                                    </div>
                                    <span className={`text-xs transition-transform duration-200 z-10 ${isSelected ? "translate-x-0 text-background" : "opacity-0 group-hover:opacity-100 group-hover:translate-x-1 text-foreground"
                                        }`}>
                                        →
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* ================= SECCIÓN DERECHA: DIAGNÓSTICO INSTITUCIONAL ================= */}
                <section className="md:col-span-8 min-h-[70vh]">
                    <AnimatePresence mode="wait">
                        {loading || !pokemon ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-[65vh] flex flex-col items-center justify-center gap-3"
                            >
                                <div className="w-6 h-6 border-2 border-border border-t-foreground rounded-full animate-spin" />
                                <p className="text-[10px] font-mono text-muted-foreground tracking-wider">CONECTANDO CON EL ARCHIVO CENTRAL DE PANIA...</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={pokemon.id}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.15 }}
                                className="space-y-8"
                            >
                                {/* FICHA PRINCIPAL INTEGRADA */}
                                <div className="grid gap-8 sm:grid-cols-12 items-start">

                                    {/* Visor de la Imagen */}
                                    <div className="sm:col-span-5 flex flex-col items-center bg-muted/30 rounded-2xl p-6 relative border border-border/40">
                                        <span className="absolute top-3 left-4 font-mono text-[9px] text-muted-foreground tracking-wider font-bold">REGISTRO FOTOGRÁFICO IP-01</span>

                                        <div className="w-44 h-44 mt-4 flex items-center justify-center p-2 transition-transform duration-300 hover:scale-102">
                                            <img src={pokemon.image} alt={pokemon.displayName} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                                        </div>

                                        {pokemon.cry && (
                                            <button
                                                onClick={playCry}
                                                disabled={playingCry}
                                                className="mt-6 w-full py-2 rounded-xl text-[9px] font-mono font-bold tracking-widest bg-card border border-border text-foreground hover:bg-foreground hover:border-foreground hover:text-background transition-all disabled:opacity-50"
                                            >
                                                {playingCry ? "🔊 EMITIENDO FONOGRAMA..." : "🎵 REPRODUCIR REGISTRO SONORO"}
                                            </button>
                                        )}
                                    </div>

                                    {/* Metadatos y Datos Biológicos */}
                                    <div className="sm:col-span-7 flex flex-col justify-between py-1">
                                        <div>
                                            <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                                                <span>REF: #{pokemon.id}</span>
                                                <span className="text-border">•</span>
                                                <span className="uppercase tracking-wider font-bold text-muted-foreground/80">LINAGE: {pokemon.family}</span>
                                            </div>
                                            <h2 className="text-3xl font-bold mt-1 tracking-tight text-foreground">{pokemon.displayName}</h2>

                                            <p className="text-xs text-muted-foreground font-sans leading-relaxed mt-4 bg-muted/20 p-4 rounded-xl border-l-2 border-border italic">
                                                "{pokemon.description}"
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 pt-6 mt-6 border-t border-border/40">
                                            <div>
                                                <h4 className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider font-bold mb-2">Tipología Oficial</h4>
                                                <div className="flex flex-wrap gap-1">
                                                    {pokemon.types.map((type) => {
                                                        const castellano = TYPE_TRANSLATIONS[type] || type;
                                                        return (
                                                            <img
                                                                key={type}
                                                                src={`/pkmn/tipos/${castellano}.png`}
                                                                alt={`Tipo ${castellano}`}
                                                                className="h-5 w-auto object-contain"
                                                                onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider font-bold mb-2">Habilidad Homologada</h4>
                                                <div className="text-xs font-mono font-bold text-foreground break-words">
                                                    {pokemon.abilities.join(" / ")}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* DETALLE DE MECÁNICA DE CÓDIGO VECTOR */}
                                {pokemon.abilityDetail && (
                                    <div className="p-4 rounded-xl bg-zinc-900 text-zinc-100 font-mono border-l-4 border-accent">
                                        <div className="text-[9px] font-bold tracking-widest text-accent uppercase mb-1">ANEXO DE SEGURIDAD NACIONAL:</div>
                                        <p className="text-xs leading-relaxed text-zinc-300">
                                            <strong className="text-white">{pokemon.abilityDetail.name}:</strong> {pokemon.abilityDetail.effect}
                                        </p>
                                    </div>
                                )}

                                {/* BLOQUE DE PARÁMETROS: STATS & MOVIMIENTOS */}
                                <div className="grid gap-8 md:grid-cols-2 pt-4 border-t border-border/40">
                                    {/* Estadísticas */}
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-2">
                                            <span className="w-1 h-1 rounded-full bg-foreground" /> Índices de Aptitud Base
                                        </h3>

                                        {pokemon.stats ? (
                                            <div className="space-y-3.5">
                                                {pokemon.stats.map((stat) => (
                                                    <div key={stat.name} className="flex items-center gap-4">
                                                        <span className="w-16 text-[10px] font-mono text-muted-foreground font-bold">{stat.name}</span>
                                                        <div className="flex-1 bg-muted h-1.5 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${Math.min((stat.value / 160) * 100, 100)}%` }}
                                                                transition={{ duration: 0.4, ease: "easeOut" }}
                                                                className="h-full bg-foreground rounded-full"
                                                            />
                                                        </div>
                                                        <span className="w-8 text-right text-xs font-mono font-bold text-foreground/80">{stat.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="h-40 rounded-xl bg-muted/20 flex flex-col items-center justify-center p-4 text-center border border-dashed border-border">
                                                <p className="text-[10px] font-mono text-destructive font-bold uppercase tracking-wider">REGISTRO CONFIDENCIAL</p>
                                                <p className="text-[10px] font-mono text-muted-foreground mt-1 max-w-[220px]">Los parámetros biológicos de este espécimen están restringidos por decreto gubernamental.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Movimientos */}
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-2">
                                            <span className="w-1 h-1 rounded-full bg-muted-foreground" /> Matriz de Acciones Ofensivas
                                        </h3>
                                        <div className="grid gap-1.5">
                                            {pokemon.moves.map((move, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 font-mono text-xs border border-border/20">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="text-[9px] text-muted-foreground">0{idx + 1}</span>
                                                        <span className="font-bold text-foreground tracking-tight">{move.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-background text-muted-foreground border border-border/40">
                                                            {TYPE_TRANSLATIONS[move.type] || move.type}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-foreground/80 min-w-[35px] text-right">
                                                            P: {move.power}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>

            </main>

            <Footer />
        </div>
    );
}