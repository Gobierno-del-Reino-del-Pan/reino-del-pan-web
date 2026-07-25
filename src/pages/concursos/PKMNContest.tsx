import { Link } from "wouter";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function PokemonContest() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-x-hidden antialiased font-tvp-text selection:bg-amber-500 selection:text-black">
            <Header />

            {/* ── CABECERA DE LA CONVOCATORIA ── */}
            <section className="relative pt-20 pb-16 px-4 sm:px-6 bg-[#07080c] border-b border-white/5 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

                <div className="container mx-auto max-w-4xl relative z-10 text-center">
                    <Link href="/">
                        <span className="inline-flex items-center text-xs uppercase tracking-[0.25em] text-amber-500 font-bold bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full mb-6 hover:bg-amber-500/20 transition-colors ">
                            ← Volver al inicio
                        </span>
                    </Link>

                    <span className="text-xs uppercase tracking-[0.4em] text-white/50 font-bold block mb-3">
                        Concurso Oficial del Reino del Pan
                    </span>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-heading uppercase leading-tight ">
                        Diseño de Líneas Evolutivas Pokémon del Reino del Pan
                    </h1>

                    <p className="text-sm sm:text-base text-white/60 mt-6 max-w-2xl mx-auto font-light leading-relaxed">
                        Bases oficiales para la selección de las primeras líneas evolutivas Pokémon originales que pasarán a formar parte del universo oficial del Reino.
                    </p>
                </div>
            </section>

            {/* ── CONTENIDO PRINCIPAL: BASES ── */}
            <main className="flex-1 container mx-auto max-w-4xl px-4 sm:px-6 py-16">
                <div className="bg-[#0e1017] rounded-3xl p-8 sm:p-12 border border-white/5 shadow-2xl space-y-12 text-white/85">

                    {/* I. Objeto */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3 ">
                            <span className="text-amber-500 font-mono text-lg">I.</span> Objeto
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-white/70">
                            El Gobierno del Reino del Pan convoca el Concurso Nacional para el Diseño de las Primeras Líneas Evolutivas Pokémon Oficiales del Reino del Pan, con el objetivo de seleccionar tres líneas evolutivas originales que pasarán a formar parte del universo Pokémon del Reino del Pan.
                        </p>
                        <p className="text-sm font-semibold text-white/90">Se seleccionarán tres líneas evolutivas ganadoras, cada una compuesta por:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                            <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-center font-mono font-bold text-amber-400 text-sm shadow-inner">
                                Pokémon inicial
                            </div>
                            <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-center font-mono font-bold text-amber-400 text-sm shadow-inner">
                                Primera evolución
                            </div>
                            <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-center font-mono font-bold text-amber-400 text-sm shadow-inner">
                                Segunda evolución
                            </div>
                        </div>
                        <p className="text-xs sm:text-sm text-white/60 pt-1">Cada línea deberá contar, por tanto, con tres especies Pokémon.</p>
                    </section>

                    {/* II. Participantes */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3 ">
                            <span className="text-amber-500 font-mono text-lg">II.</span> Participantes
                        </h2>
                        <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-white/70">
                            <li>Podrá participar cualquier ciudadano o residente del Reino del Pan que presente un diseño original e inédito.</li>
                            <li>Cada participante podrá presentar una o varias propuestas.</li>
                        </ul>
                    </section>

                    {/* III. Libertad artística */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3   ">
                            <span className="text-amber-500 font-mono text-lg">III.</span> Libertad artística
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-white/70">
                            Los participantes gozarán de plena libertad creativa. En consecuencia:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-white/70">
                            <li>No existe una temática obligatoria.</li>
                            <li>No existe un estilo artístico obligatorio.</li>
                            <li>No existen animales, plantas, objetos o conceptos obligatorios.</li>
                            <li>Se permite inspirarse en la naturaleza, la cultura, la gastronomía, la historia, la ciencia, la tecnología, la fantasía o cualquier otra temática.</li>
                            <li>Se permite diseñar Pokémon basados en criaturas reales, mitológicas o completamente originales.</li>
                            <li>El objetivo es crear especies únicas que reflejen la identidad y creatividad del Reino del Pan.</li>
                        </ul>
                    </section>

                    {/* IV. Elementos obligatorios */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3 ">
                            <span className="text-amber-500 font-mono text-lg">IV.</span> Elementos obligatorios
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-white/70">Todas las propuestas deberán cumplir los siguientes requisitos:</p>
                        <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-white/70">
                            <li>La línea evolutiva deberá estar formada por tres Pokémon (inicial, primera evolución y segunda evolución).</li>
                            <li>Las tres evoluciones deberán mantener una coherencia visual y conceptual entre sí.</li>
                            <li>Cada Pokémon deberá tener un nombre propio.</li>
                            <li>Cada Pokémon deberá indicar su tipo o combinación de tipos.</li>
                        </ul>
                    </section>

                    {/* V. Tipos Pokémon */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3 ">
                            <span className="text-amber-500 font-mono text-lg">V.</span> Tipos Pokémon
                        </h2>
                        <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-white/70">
                            <li>Existe plena libertad para asignar tipos a las especies creadas.</li>
                            <li>Se permite utilizar cualquiera de los tipos Pokémon existentes.</li>
                            <li>Asimismo, se autoriza la creación de nuevos tipos Pokémon, siempre que el autor explique brevemente su funcionamiento y temática.</li>
                        </ul>
                    </section>

                    {/* VI. Formato */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3  ">
                            <span className="text-amber-500 font-mono text-lg">VI.</span> Formato
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-white/70">Cada propuesta deberá incluir:</p>
                        <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-white/70">
                            <li>Ilustración de los tres Pokémon.</li>
                            <li>Nombre de cada evolución.</li>
                            <li>Tipo o tipos de cada Pokémon.</li>
                            <li>Breve descripción de la línea evolutiva.</li>
                            <li>Diseño completo en alta resolución.</li>
                        </ul>
                    </section>

                    {/* VII. Criterios de valoración */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3    ">
                            <span className="text-amber-500 font-mono text-lg">VII.</span> Criterios de valoración
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-white/70">Se valorarán especialmente:</p>
                        <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-white/70">
                            <li>Originalidad.</li>
                            <li>Calidad artística.</li>
                            <li>Creatividad.</li>
                            <li>Coherencia entre las tres evoluciones.</li>
                            <li>Identidad propia.</li>
                            <li>Potencial para integrarse en el universo Pokémon.</li>
                            <li>Representación de la identidad del Reino del Pan.</li>
                        </ul>
                    </section>

                    {/* VIII. Sistema de selección */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3 ">
                            <span className="text-amber-500 font-mono text-lg">VIII.</span> Sistema de selección
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-white/70">El proceso de elección constará de dos fases:</p>

                        <div className="space-y-4 pt-2">
                            <div className="bg-black/30 border border-white/5 rounded-2xl p-5">
                                <h3 className="font-bold text-white mb-2 text-sm uppercase tracking-wider text-amber-500 ">Primera fase</h3>
                                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                                    Todas las propuestas serán evaluadas por el Consejo de Estado del Reino del Pan, que realizará una criba técnica y artística y seleccionará las candidaturas finalistas.
                                </p>
                            </div>
                            <div className="bg-black/30 border border-white/5 rounded-2xl p-5">
                                <h3 className="font-bold text-white mb-2 text-sm uppercase tracking-wider text-amber-500 ">Segunda fase</h3>
                                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                                    Las propuestas finalistas serán sometidas a votación popular entre toda la ciudadanía del Reino del Pan. Las tres líneas evolutivas que obtengan mayor respaldo ciudadano serán proclamadas ganadoras y pasarán a formar parte de la primera colección oficial de Pokémon del Reino del Pan.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* IX. Líneas evolutivas oficiales */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3 ">
                            <span className="text-amber-500 font-mono text-lg">IX.</span> Líneas evolutivas oficiales
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-white/70">
                            El concurso elegirá tres líneas evolutivas oficiales, compuestas por tres Pokémon cada una. Las líneas ganadoras podrán ser utilizadas en futuras publicaciones, videojuegos, eventos, material promocional o cualquier otro proyecto oficial relacionado con el Reino del Pan.
                        </p>
                    </section>

                    {/* X. Derechos de las obras ganadoras */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3 ">
                            <span className="text-amber-500 font-mono text-lg">X.</span> Derechos de las obras ganadoras
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-white/70">
                            Las líneas evolutivas ganadoras pasarán a formar parte del patrimonio creativo oficial del Reino del Pan. El Gobierno del Reino del Pan podrá reproducirlas, adaptarlas o incorporarlas a futuras obras y proyectos oficiales, citando al autor cuando proceda.
                        </p>
                    </section>

                    {/* XI. Cómo participar */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3 ">
                            <span className="text-amber-500 font-mono text-lg">XI.</span> Cómo participar
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-white/70">
                            Las propuestas podrán presentarse por cualquiera de las siguientes vías oficiales:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-3">
                                <h3 className="font-bold text-white text-sm uppercase tracking-wider text-amber-500 ">1. Correo electrónico</h3>
                                <p className="text-xs sm:text-sm text-white/60">
                                    Envía tu propuesta en alta resolución al correo oficial: <a href="mailto:gobiernopaniese@protonmail.com" className="text-amber-400 hover:underline font-mono">gobiernopaniese@protonmail.com</a>
                                </p>
                                <p className="text-xs text-white/50">Se recomienda incluir:</p>
                                <ul className="list-disc list-inside text-xs text-white/50 space-y-1">
                                    <li>Nombre o seudónimo del autor.</li>
                                    <li>Nombre de la línea evolutiva.</li>
                                    <li>Breve descripción de la propuesta (opcional).</li>
                                </ul>
                            </div>

                            <div className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-3">
                                <h3 className="font-bold text-white text-sm uppercase tracking-wider text-amber-500 ">2. Red social X</h3>
                                <p className="text-xs sm:text-sm text-white/60">
                                    Publica tu propuesta en X utilizando el hashtag oficial: <span className="text-amber-400 font-mono font-bold">#LíneaPKMNPan</span>
                                </p>
                                <p className="text-xs text-white/50">
                                    Se recomienda mencionar al perfil oficial del Gobierno del Reino del Pan para facilitar la localización de las propuestas.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* XII. Disposición final */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3 ">
                            <span className="text-amber-500 font-mono text-lg">XII.</span> Disposición final
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-white/70">
                            La participación en el presente concurso implica la aceptación íntegra de estas bases. Las decisiones del Consejo de Estado durante la fase de selección y el resultado de la votación ciudadana serán definitivos.
                        </p>
                    </section>

                    {/* Sección de botones de envío */}
                    <div className="pt-8 border-t border-white/10 text-center space-y-4">
                        <p className="text-sm text-white/70">
                            ¿Listo para presentar tu línea evolutiva? Envía tu propuesta por correo o compártela en X con el hashtag <span className="text-amber-400 font-mono font-bold">#LíneaPKMNPan</span>.
                        </p>
                        <div className="flex justify-center gap-4 flex-wrap pt-2">
                            <a
                                href="mailto:gobiernopaniese@protonmail.com"
                                className="inline-flex items-center justify-center rounded-full bg-amber-500 px-8 py-4 text-xs font-bold uppercase tracking-[0.18em] text-neutral-950 transition-all duration-300 hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 "
                            >
                                Enviar por Correo
                            </a>
                            <a
                                href="https://twitter.com/intent/tweet?text=%23L%C3%ADneaPKMNPan"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center rounded-full border-2 border-amber-500/50 bg-transparent px-8 py-4 text-xs font-bold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:bg-amber-500/10 hover:border-amber-500 active:scale-95 "
                            >
                                Publicar en X (#LíneaPKMNPan)
                            </a>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}