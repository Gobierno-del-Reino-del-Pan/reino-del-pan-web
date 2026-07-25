import { Link } from "wouter";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function PanedaContest() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-x-hidden antialiased font-tvp-text selection:bg-amber-500 selection:text-black">
            <Header />

            {/* ── CABECERA DE LA CONVOCATORIA ── */}
            <section className="relative pt-20 pb-16 px-4 sm:px-6 bg-[#07080c] border-b border-white/5 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

                <div className="container mx-auto max-w-4xl relative z-10 text-center">
                    <Link href="/">
                        <span className="inline-flex items-center text-xs uppercase tracking-[0.25em] text-amber-500 font-bold bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full mb-6 hover:bg-amber-500/20 transition-colors">
                            ← Volver al inicio
                        </span>
                    </Link>

                    <span className="text-xs uppercase tracking-[0.4em] text-white/50 font-bold block mb-3">
                        Concurso Oficial del Reino del Pan
                    </span>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-heading uppercase leading-tight">
                        Diseño de los Billetes de la Paneda
                    </h1>

                    <p className="text-sm sm:text-base text-white/60 mt-6 max-w-2xl mx-auto font-light leading-relaxed">
                        Bases oficiales para la selección de la primera familia oficial de billetes que respaldará la soberanía financiera del Reino.
                    </p>
                </div>
            </section>

            {/* ── CONTENIDO PRINCIPAL: BASES ── */}
            <main className="flex-1 container mx-auto max-w-4xl px-4 sm:px-6 py-16">
                <div className="bg-[#0e1017] rounded-3xl p-8 sm:p-12 border border-white/5 shadow-2xl space-y-12 text-white/80">

                    {/* I. Objeto */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3">
                            <span className="text-amber-500 font-mono text-lg">I.</span> Objeto
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-white/70">
                            El Gobierno del Reino del Pan convoca el Concurso Nacional para el Diseño de la Primera Familia Oficial de Billetes de la Paneda, con el objetivo de seleccionar el diseño que representará a la moneda nacional.
                        </p>
                        <p className="text-sm font-semibold text-white/90">La colección estará compuesta por ocho denominaciones:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                            {["Ᵽ100", "Ᵽ200", "Ᵽ500", "Ᵽ1.000", "Ᵽ2.000", "Ᵽ5.000", "Ᵽ10.000", "Ᵽ20.000"].map((den) => (
                                <div key={den} className="bg-black/40 border border-white/5 rounded-xl p-3 text-center font-mono font-bold text-amber-400 text-base shadow-inner">
                                    {den}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* II. Participantes */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3">
                            <span className="text-amber-500 font-mono text-lg">II.</span> Participantes
                        </h2>
                        <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-white/70">
                            <li>Podrá participar cualquier ciudadano o residente del Reino del Pan que presente un diseño original e inédito.</li>
                            <li>Cada participante podrá presentar una o varias propuestas.</li>
                        </ul>
                    </section>

                    {/* III. Libertad artística */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3">
                            <span className="text-amber-500 font-mono text-lg">III.</span> Libertad artística
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-white/70">
                            Los participantes gozarán de plena libertad creativa. En consecuencia:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-white/70">
                            <li>No existe una paleta de colores obligatoria.</li>
                            <li>No existe un estilo artístico obligatorio.</li>
                            <li>No existen personajes, edificios, monumentos o paisajes obligatorios.</li>
                            <li>Se permite representar elementos históricos, culturales, naturales, científicos, tecnológicos o completamente abstractos.</li>
                            <li>El objetivo es reflejar la identidad del Reino del Pan mediante propuestas originales.</li>
                        </ul>
                    </section>

                    {/* IV. Elementos obligatorios */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3">
                            <span className="text-amber-500 font-mono text-lg">IV.</span> Elementos obligatorios
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-white/70">Todos los billetes deberán incorporar obligatoriamente:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="bg-black/30 border border-white/5 rounded-2xl p-5">
                                <h3 className="font-bold text-white mb-2 text-sm uppercase tracking-wider text-amber-500">1. Logotipo del Gobierno</h3>
                                <p className="text-xs sm:text-sm text-white/60">Deberá aparecer de forma visible e integrada en el diseño.</p>
                            </div>
                            <div className="bg-black/30 border border-white/5 rounded-2xl p-5">
                                <h3 className="font-bold text-white mb-2 text-sm uppercase tracking-wider text-amber-500">2. Escudo oficial (Ᵽ)</h3>
                                <p className="text-xs sm:text-sm text-white/60">El símbolo oficial de la moneda deberá figurar claramente en el anverso del billete.</p>
                            </div>
                        </div>
                    </section>

                    {/* V. Elementos opcionales */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3">
                            <span className="text-amber-500 font-mono text-lg">V.</span> Elementos opcionales
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-white/70">Podrán incorporarse libremente:</p>
                        <div className="flex flex-wrap gap-2 pt-2">
                            {[
                                "Paisajes", "Monumentos", "Fauna", "Flora", "Ciencia", "Cultura",
                                "Arte", "Tecnología", "Personajes históricos", "Personajes ficticios",
                                "Motivos geométricos", "Patrones de seguridad simulados", "Ilustraciones originales",
                                "Cualquier otro elemento compatible con la imagen institucional"
                            ].map((el, i) => (
                                <span key={i} className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-white/70 font-mono">
                                    {el}
                                </span>
                            ))}
                        </div>
                    </section>

                    {/* VI. Formato */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3">
                            <span className="text-amber-500 font-mono text-lg">VI.</span> Formato
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-white/70">Cada propuesta deberá incluir:</p>
                        <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-white/70">
                            <li>Anverso.</li>
                            <li>Denominación correspondiente.</li>
                            <li>Diseño completo en alta resolución.</li>
                        </ul>
                    </section>

                    {/* VII. Criterios de valoración */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3">
                            <span className="text-amber-500 font-mono text-lg">VII.</span> Criterios de valoración
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-white/70">Se valorarán especialmente:</p>
                        <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-white/70">
                            <li>Originalidad.</li>
                            <li>Calidad artística.</li>
                            <li>Legibilidad.</li>
                            <li>Facilidad de reconocimiento.</li>
                            <li>Coherencia de la colección.</li>
                            <li>Representación de la identidad del Reino del Pan.</li>
                            <li>Potencial para convertirse en una serie monetaria reconocible.</li>
                        </ul>
                    </section>

                    {/* VIII. Sistema de selección */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3">
                            <span className="text-amber-500 font-mono text-lg">VIII.</span> Sistema de selección
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-white/70">El proceso de elección constará de dos fases:</p>

                        <div className="space-y-4 pt-2">
                            <div className="bg-black/30 border border-white/5 rounded-2xl p-5">
                                <h3 className="font-bold text-white mb-2 text-sm uppercase tracking-wider text-amber-500">Primera fase</h3>
                                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                                    Todas las propuestas serán evaluadas por el Consejo de Estado del Reino del Pan, que realizará una criba técnica y artística. El Consejo seleccionará las candidaturas finalistas para cada denominación.
                                </p>
                            </div>
                            <div className="bg-black/30 border border-white/5 rounded-2xl p-5">
                                <h3 className="font-bold text-white mb-2 text-sm uppercase tracking-wider text-amber-500">Segunda fase</h3>
                                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                                    Las propuestas finalistas serán sometidas a votación popular, en la que podrá participar toda la ciudadanía del Reino del Pan. El diseño que obtenga el mayor respaldo ciudadano será proclamado ganador para su correspondiente denominación.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* IX. Familia oficial de billetes */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3">
                            <span className="text-amber-500 font-mono text-lg">IX.</span> Familia oficial de billetes
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-white/70">
                            La primera serie oficial estará formada por las 8 denominaciones especificadas en el objeto del concurso. No se establece ninguna relación con otras monedas o divisas. Las denominaciones se expresarán exclusivamente en Panedas (Ᵽ).
                        </p>
                    </section>

                    {/* X. Derechos de las obras ganadoras */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3">
                            <span className="text-amber-500 font-mono text-lg">X.</span> Derechos de las obras ganadoras
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-white/70">
                            Los diseños ganadores pasarán a formar parte del patrimonio gráfico oficial del Reino del Pan. El Gobierno del Reino del Pan podrá reproducirlos, adaptarlos o incorporarlos a futuras emisiones de la Paneda, citando al autor cuando proceda.
                        </p>
                    </section>

                    {/* XI. Disposición final */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3">
                            <span className="text-amber-500 font-mono text-lg">XI.</span> Disposición final
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-white/70">
                            La participación en el presente concurso implica la aceptación íntegra de estas bases. Las decisiones del Consejo de Estado durante la fase de selección y el resultado de la votación ciudadana serán definitivos.
                        </p>
                    </section>

                    {/* Sección de envío de propuestas */}
                    <div className="pt-8 border-t border-white/10 text-center space-y-4">
                        <p className="text-sm text-white/70">
                            Presenta tu propuesta enviándola a través de correo electrónico a <a href="mailto:gobiernopaniese@protonmail.com" className="text-amber-400 hover:underline font-mono">gobiernopaniese@protonmail.com</a> o publícala en X utilizando el hashtag <span className="text-amber-400 font-mono font-bold">#DesignPaneda</span>.
                        </p>
                        <div className="flex justify-center gap-4 flex-wrap pt-2">
                            <a
                                href="mailto:gobiernopaniese@protonmail.com"
                                className="inline-flex items-center justify-center rounded-full bg-amber-500 px-8 py-4 text-xs font-bold uppercase tracking-[0.18em] text-neutral-950 transition-all duration-300 hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95"
                            >
                                Enviar por Correo
                            </a>
                            <a
                                href="https://twitter.com/intent/tweet?text=%23DesignPaneda"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center rounded-full border-2 border-amber-500/50 bg-transparent px-8 py-4 text-xs font-bold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:bg-amber-500/10 hover:border-amber-500 active:scale-95"
                            >
                                Publicar en X (#DesignPaneda)
                            </a>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}