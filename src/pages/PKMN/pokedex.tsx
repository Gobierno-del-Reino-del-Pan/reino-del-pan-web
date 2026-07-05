import Header from "../../components/Header";
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

                    let description = "No hay registros disponibles de este espécimen en la base de datos.";
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
        <div className="min-h-screen flex flex-col bg-white text-slate-800 selection:bg-blue-500/20 selection:text-blue-900">
            <Header />

            <main className="flex-1 container mx-auto max-w-6xl px-4 py-8 grid gap-8 md:grid-cols-12 items-start">

                {/* ================= SECCIÓN IZQUIERDA: INDEX & NAVEGACIÓN ================= */}
                <section className="md:col-span-4 bg-slate-50 border border-slate-200 shadow-sm rounded-2xl p-4 flex flex-col gap-4 max-h-[82vh]">
                    <div className="border-b border-slate-200 pb-3">
                        <span className="text-[10px] font-mono font-bold tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md uppercase">
                            DATOS_POKEDEX v4.26
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar Pokémon..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full mt-3 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-mono text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all shadow-sm"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                        {filteredList.map((pkmn) => {
                            const isSelected = selectedPkmn === pkmn.id;
                            return (
                                <button
                                    key={pkmn.id}
                                    onClick={() => setSelectedPkmn(pkmn.id)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl border font-mono text-left transition-all duration-200 group relative overflow-hidden ${isSelected
                                        ? "bg-gradient-to-r from-blue-600 to-blue-500 border-blue-600 text-white shadow-md font-bold"
                                        : "bg-white border-slate-200 text-slate-600 hover:bg-blue-50/50 hover:text-blue-600 hover:border-blue-200"
                                        }`}
                                >
                                    <div className="flex items-center gap-3 z-10">
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                                            {pkmn.isFanmade ? "FAN" : "GEN"}
                                        </span>
                                        <span className="text-xs tracking-tight">{pkmn.name}</span>
                                    </div>
                                    <span className={`text-xs transition-transform duration-300 z-10 ${isSelected ? "translate-x-0 text-white" : "group-hover:translate-x-1 text-blue-500"}`}>
                                        →
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* ================= SECCIÓN DERECHA: DIAGNÓSTICO ================= */}
                <section className="md:col-span-8 min-h-[70vh]">
                    <AnimatePresence mode="wait">
                        {loading || !pokemon ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-[65vh] rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center gap-4 border-dashed"
                            >
                                <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                                <p className="text-[11px] font-mono text-slate-400 tracking-wider">ACCEDIENDO AL REGISTRO NÚCLEO...</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={pokemon.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25 }}
                                className="space-y-6"
                            >
                                {/* FICHA PRINCIPAL INTEGRADA */}
                                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 grid gap-6 sm:grid-cols-12 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

                                    {/* Visor de la Imagen */}
                                    <div className="sm:col-span-4 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-100 p-4 relative">
                                        <span className="absolute top-2 left-3 font-mono text-[9px] text-slate-400 font-bold">VISOR_01</span>

                                        <div className="w-36 h-36 flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_4px_12px_rgba(59,130,246,0.1)]">
                                            <img src={pokemon.image} alt={pokemon.displayName} className="w-full h-full object-contain" />
                                        </div>

                                        {pokemon.cry && (
                                            <button
                                                onClick={playCry}
                                                disabled={playingCry}
                                                className="mt-3 w-full py-1.5 rounded-lg text-[9px] font-mono font-black tracking-widest bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50 active:scale-95 shadow-sm"
                                            >
                                                {playingCry ? "🔊 EMITIENDO AUDIO..." : "🎵 REPRODUCIR SONIDO"}
                                            </button>
                                        )}
                                    </div>

                                    {/* Metadatos y Datos Biológicos */}
                                    <div className="sm:col-span-8 flex flex-col justify-between space-y-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-[9px] text-slate-400">REG: #{pokemon.id}</span>
                                                <div className="h-1 w-1 rounded-full bg-slate-300" />
                                                <span className="font-mono text-[9px] text-blue-600 uppercase font-bold tracking-wider">Clase: {pokemon.family}</span>
                                            </div>
                                            <h2 className="text-3xl font-black mt-1 tracking-tight text-slate-900">{pokemon.displayName}</h2>

                                            <p className="text-xs text-slate-600 font-sans leading-relaxed mt-3 bg-slate-50 border border-slate-100 p-3 rounded-xl italic">
                                                "{pokemon.description}"
                                            </p>
                                        </div>

                                        {/* Habilidades y Tipo reorganizados verticalmente con espaciado controlado */}
                                        <div className="flex flex-col space-y-4 pt-3 border-t border-slate-100">
                                            <div>
                                                <h4 className="text-[10px] font-mono text-slate-400 uppercase font-bold mb-1.5">Tipos</h4>
                                                <div className="flex gap-1.5">
                                                    {pokemon.types.map((type) => {
                                                        const castellano = TYPE_TRANSLATIONS[type] || type;
                                                        return (
                                                            <img
                                                                key={type}
                                                                src={`/pkmn/tipos/${castellano}.png`}
                                                                alt={`Tipo ${castellano}`}
                                                                className="h-6 w-auto object-contain"
                                                                onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">Capacidad / Habilidad</h4>
                                                <div className="text-xs font-mono font-bold text-slate-700">
                                                    {pokemon.abilities.join(" / ")}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* DETALLE DE MECÁNICA DE CÓDIGO VECTOR */}
                                {pokemon.abilityDetail && (
                                    <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 font-mono">
                                        <div className="text-blue-600 text-[10px] font-bold tracking-wider uppercase mb-1">⚠️ DETALLE DE LA HABILIDAD EXCLUSIVA:</div>
                                        <p className="text-xs text-blue-900 leading-relaxed">
                                            <strong>{pokemon.abilityDetail.name}:</strong> {pokemon.abilityDetail.effect}
                                        </p>
                                    </div>
                                )}

                                {/* BLOQUE DE PARÁMETROS: STATS & MOVIMIENTOS */}
                                <div className="grid gap-6 md:grid-cols-2">
                                    {/* Estadísticas */}
                                    <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
                                        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-4 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Estadísticas Base
                                        </h3>

                                        {pokemon.stats ? (
                                            <div className="space-y-3">
                                                {pokemon.stats.map((stat) => (
                                                    <div key={stat.name} className="flex items-center gap-4">
                                                        <span className="w-16 text-[10px] font-mono text-slate-500 font-bold">{stat.name}</span>
                                                        <div className="flex-1 bg-slate-100 h-2 rounded-md overflow-hidden border border-slate-200">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${Math.min((stat.value / 160) * 100, 100)}%` }}
                                                                transition={{ duration: 0.5, ease: "easeOut" }}
                                                                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-md"
                                                            />
                                                        </div>
                                                        <span className="w-8 text-right text-xs font-mono font-bold text-slate-600">{stat.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="h-40 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center p-4 text-center">
                                                <span className="text-xl mb-1">🔒</span>
                                                <p className="text-[11px] font-mono text-blue-600 font-bold uppercase tracking-wider">DATOS ENCRIPTADOS</p>
                                                <p className="text-[10px] font-mono text-slate-400 mt-1 max-w-[200px]">Los atributos clínicos de esta entidad están protegidos por el sistema.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Movimientos */}
                                    <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-4 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Movimientos Clave
                                            </h3>
                                            <div className="grid gap-2">
                                                {pokemon.moves.map((move, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 font-mono text-xs">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[9px] text-slate-400 font-bold">0{idx + 1}</span>
                                                            <span className="font-bold text-slate-700 tracking-tight">{move.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded border border-slate-200 bg-white text-slate-500">
                                                                {TYPE_TRANSLATIONS[move.type] || move.type}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-blue-600 min-w-[40px] text-right">
                                                                P: {move.power}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
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