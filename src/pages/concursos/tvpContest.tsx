import { Link } from "wouter";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function TvRedesignContest() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-x-hidden antialiased font-tvp-text selection:bg-[#FF4D00] selection:text-white">
            <style dangerouslySetInnerHTML={{
                __html: `
        @font-face {
            font-family: 'TVP-Heading';
            src: url('/TVP/TVP.ttf') format('truetype');
            font-weight: bold;
        }
        @font-face {
            font-family: 'TVP-Text';
            src: url('/TVP/TVPtext.ttf') format('truetype');
            font-weight: normal;
        }
        .font-tvp-head { font-family: 'TVP-Heading', sans-serif; }
        .font-tvp-text { font-family: 'TVP-Text', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `}} />

            <Header />

            {/* ── CABECERA DE LA CONVOCATORIA ── */}
            <section className="relative pt-20 pb-16 px-4 sm:px-6 bg-[#07080c] border-b border-white/5 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-[#FF4D00]/10 rounded-full blur-[140px] pointer-events-none" />

                <div className="container mx-auto max-w-4xl relative z-10 text-center">
                    <Link href="/">
                        <span className="inline-flex items-center text-xs uppercase tracking-[0.25em] text-[#FF4D00] font-bold bg-[#FF4D00]/10 border border-[#FF4D00]/20 px-4 py-1.5 rounded-full mb-6 hover:bg-[#FF4D00]/20 transition-colors font-tvp-head">
                            ← Volver al inicio
                        </span>
                    </Link>

                    <span className="text-xs uppercase tracking-[0.4em] text-white/50 font-bold block mb-3 font-tvp-head">
                        Concurso Oficial del Reino del Pan
                    </span>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase leading-tight font-tvp-head">
                        Rediseño de tvp
                    </h1>

                    <p className="text-sm sm:text-base text-white/60 mt-6 max-w-2xl mx-auto font-light leading-relaxed">
                        Bases oficiales para el rediseño integral de la identidad visual y estratégica de los medios públicos del Reino del Pan.
                    </p>
                </div>
            </section>

            {/* ── CONTENIDO PRINCIPAL: BASES ── */}
            <main className="flex-1 container mx-auto max-w-4xl px-4 sm:px-6 py-16">
                <div className="bg-[#0e1017] rounded-3xl p-8 sm:p-12 border border-white/5 shadow-2xl space-y-12 text-white/85">

                    {/* I. Objeto */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3 font-tvp-head">
                            <span className="text-[#FF4D00] font-mono text-lg">I.</span> Objeto
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-white/70">
                            El Gobierno del Reino del Pan convoca el Concurso Nacional para el Rediseño Integral de la Corporación Televisión Paniense (TVP), con el objetivo de renovar la identidad visual y estratégica de los medios públicos del Reino del Pan.
                        </p>
                        <p className="text-sm font-semibold text-white/90">El concurso comprende el rediseño de:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                            {["Televisión Paniense (TVP)", "TVP Play", "La 2Pan"].map((item, idx) => (
                                <div key={idx} className="bg-black/40 border border-white/5 rounded-xl p-3 text-center font-tvp-head text-[#FF4D00] text-sm shadow-inner">
                                    {item}
                                </div>
                            ))}
                        </div>
                        <p className="text-xs sm:text-sm text-white/60 pt-1">Asimismo, las propuestas podrán incluir el diseño conceptual de un nuevo programa original para incorporarse a la parrilla de TVP.</p>
                    </section>

                    {/* II. Participantes */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3 font-tvp-head">
                            <span className="text-[#FF4D00] font-mono text-lg">II.</span> Participantes
                        </h2>
                        <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-white/70">
                            <li>Podrá participar cualquier ciudadano o residente del Reino del Pan que presente una propuesta original e inédita.</li>
                            <li>Cada participante podrá presentar una o varias propuestas.</li>
                        </ul>
                    </section>

                    {/* III. Objetivos del rediseño */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3 font-tvp-head">
                            <span className="text-[#FF4D00] font-mono text-lg">III.</span> Objetivos del rediseño
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-white/70">
                            Las propuestas deberán transmitir una visión renovada de la radiotelevisión pública del Reino del Pan, representando los siguientes valores:
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                            {[
                                "Modernidad", "Innovación", "Cercanía", "Pluralidad",
                                "Servicio público", "Participación ciudadana", "Libertad creativa",
                                "Accesibilidad", "Transparencia", "Identidad propia"
                            ].map((val, i) => (
                                <span key={i} className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-white/70 font-tvp-head">
                                    {val}
                                </span>
                            ))}
                        </div>
                        <div className="bg-black/30 border border-white/5 rounded-2xl p-5 mt-4">
                            <h3 className="font-bold text-white mb-2 text-sm uppercase tracking-wider text-[#FF4D00] font-tvp-head">La nueva TVP deberá proyectar la imagen de:</h3>
                            <p className="text-sm text-white/80 italic">"La televisión de todos." Una televisión donde cada ciudadano sienta que tiene su espacio, que informa, entretiene y conecta con la sociedad.</p>
                        </div>
                    </section>

                    {/* IV. Elementos del concurso */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3 font-tvp-head">
                            <span className="text-[#FF4D00] font-mono text-lg">IV.</span> Elementos del concurso
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-white/70">Las propuestas podrán incluir total o parcialmente los siguientes apartados:</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-2">
                                <h3 className="font-bold text-white text-sm uppercase tracking-wider text-[#FF4D00] font-tvp-head">1. Logotipos</h3>
                                <p className="text-xs sm:text-sm text-white/60">Diseño del nuevo logotipo de TVP, TVP Play y La 2Pan (deben mantener identidad visual coherente).</p>
                            </div>

                            <div className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-2">
                                <h3 className="font-bold text-white text-sm uppercase tracking-wider text-[#FF4D00] font-tvp-head">2. Identidad visual</h3>
                                <p className="text-xs sm:text-sm text-white/60">Grafismos, cortinillas, mosca en pantalla, cabeceras, rótulos, tipografía, paleta de colores, animaciones y estilo visual general.</p>
                            </div>

                            <div className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-2">
                                <h3 className="font-bold text-white text-sm uppercase tracking-wider text-[#FF4D00] font-tvp-head">3. Imagen corporativa</h3>
                                <p className="text-xs sm:text-sm text-white/60">Filosofía, eslogan, valores, manual de identidad (opcional) y aplicaciones digitales y televisivas.</p>
                            </div>

                            <div className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-2">
                                <h3 className="font-bold text-white text-sm uppercase tracking-wider text-[#FF4D00] font-tvp-head">4. Nuevo programa</h3>
                                <p className="text-xs sm:text-sm text-white/60">Formato original (nombre, temática, público objetivo, horario, descripción e imagen gráfica opcional).</p>
                            </div>
                        </div>
                    </section>

                    {/* V. Libertad creativa */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3 font-tvp-head">
                            <span className="text-[#FF4D00] font-mono text-lg">V.</span> Libertad creativa
                        </h2>
                        <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-white/70">
                            <li>Existe plena libertad artística.</li>
                            <li>No existen colores obligatorios.</li>
                            <li>No existe un estilo gráfico obligatorio.</li>
                            <li>Se permite inspiración en tendencias internacionales, televisión pública o plataformas digitales, siempre que el resultado sea original.</li>
                        </ul>
                    </section>

                    {/* VI. Formato */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3 font-tvp-head">
                            <span className="text-[#FF4D00] font-mono text-lg">VI.</span> Formato
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-white/70">Cada propuesta deberá incluir, al menos:</p>
                        <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-white/70">
                            <li>Imágenes o bocetos del rediseño.</li>
                            <li>Explicación del concepto creativo.</li>
                            <li>Diseño en alta resolución.</li>
                        </ul>
                        <p className="text-xs sm:text-sm text-[#FF4D00]/90 pt-1 font-tvp-head">Se valorará positivamente aportar versiones aplicadas a televisión, redes sociales, web y plataformas digitales.</p>
                    </section>

                    {/* VII. Criterios de valoración */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3 font-tvp-head">
                            <span className="text-[#FF4D00] font-mono text-lg">VII.</span> Criterios de valoración
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-white/70">Se valorarán especialmente:</p>
                        <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-white/70">
                            <li>Originalidad.</li>
                            <li>Calidad del diseño.</li>
                            <li>Coherencia visual.</li>
                            <li>Facilidad de reconocimiento.</li>
                            <li>Adaptabilidad a múltiples plataformas.</li>
                            <li>Innovación.</li>
                            <li>Imagen de marca.</li>
                            <li>Representación de los valores del Reino del Pan.</li>
                            <li>Viabilidad de implantación.</li>
                        </ul>
                    </section>

                    {/* VIII. Sistema de selección */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3 font-tvp-head">
                            <span className="text-[#FF4D00] font-mono text-lg">VIII.</span> Sistema de selección
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-white/70">El proceso de elección constará de dos fases:</p>

                        <div className="space-y-4 pt-2">
                            <div className="bg-black/30 border border-white/5 rounded-2xl p-5">
                                <h3 className="font-bold text-white mb-2 text-sm uppercase tracking-wider text-[#FF4D00] font-tvp-head">Primera fase</h3>
                                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                                    Todas las propuestas serán evaluadas por el Consejo de Estado del Reino del Pan, que realizará una criba técnica y artística y seleccionará las candidaturas finalistas.
                                </p>
                            </div>
                            <div className="bg-black/30 border border-white/5 rounded-2xl p-5">
                                <h3 className="font-bold text-white mb-2 text-sm uppercase tracking-wider text-[#FF4D00] font-tvp-head">Segunda fase</h3>
                                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                                    Las propuestas finalistas serán sometidas a votación popular entre toda la ciudadanía del Reino del Pan. La propuesta que obtenga mayor respaldo ciudadano será proclamada ganadora.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* IX. Proyecto ganador */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3 font-tvp-head">
                            <span className="text-[#FF4D00] font-mono text-lg">IX.</span> Proyecto ganador
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-white/70">
                            La propuesta ganadora podrá convertirse en la nueva identidad oficial de la Corporación Televisión Paniense. El Gobierno del Reino del Pan podrá implantar total o parcialmente los elementos presentados.
                        </p>
                    </section>

                    {/* X. Derechos de las obras ganadoras */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3 font-tvp-head">
                            <span className="text-[#FF4D00] font-mono text-lg">X.</span> Derechos de las obras ganadoras
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-white/70">
                            Las propuestas ganadoras pasarán a formar parte del patrimonio gráfico oficial del Reino del Pan. El Gobierno podrá reproducirlas, adaptarlas o desarrollarlas en futuras aplicaciones audiovisuales, citando al autor cuando proceda.
                        </p>
                    </section>

                    {/* XI. Cómo participar */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3 font-tvp-head">
                            <span className="text-[#FF4D00] font-mono text-lg">XI.</span> Cómo participar
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-white/70">
                            Las propuestas podrán presentarse por cualquiera de las siguientes vías oficiales:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-3">
                                <h3 className="font-bold text-white text-sm uppercase tracking-wider text-[#FF4D00] font-tvp-head">1. Correo electrónico</h3>
                                <p className="text-xs sm:text-sm text-white/60">
                                    Envía tu propuesta en alta resolución a: <a href="mailto:gobiernopaniese@protonmail.com" className="text-[#FF4D00] hover:underline font-mono">gobiernopaniese@protonmail.com</a>
                                </p>
                                <p className="text-xs text-white/50">Se recomienda incluir:</p>
                                <ul className="list-disc list-inside text-xs text-white/50 space-y-1">
                                    <li>Nombre o seudónimo.</li>
                                    <li>Título de la propuesta.</li>
                                    <li>Breve explicación del concepto.</li>
                                </ul>
                            </div>

                            <div className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-3">
                                <h3 className="font-bold text-white text-sm uppercase tracking-wider text-[#FF4D00] font-tvp-head">2. Red social X</h3>
                                <p className="text-xs sm:text-sm text-white/60">
                                    Publica tu propuesta utilizando el hashtag oficial: <span className="text-[#FF4D00] font-mono font-bold">#NuevaTVP</span>
                                </p>
                                <p className="text-xs text-white/50">
                                    Se recomienda mencionar al perfil oficial del Gobierno del Reino del Pan para facilitar la localización de las propuestas.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* XII. Disposición final */}
                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-3 font-tvp-head">
                            <span className="text-[#FF4D00] font-mono text-lg">XII.</span> Disposición final
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-white/70">
                            La participación en el presente concurso implica la aceptación íntegra de estas bases. Las decisiones del Consejo de Estado durante la fase de selección y el resultado de la votación ciudadana serán definitivos.
                        </p>
                    </section>

                    {/* Sección de botones de envío */}
                    <div className="pt-8 border-t border-white/10 text-center space-y-4">
                        <p className="text-sm text-white/70">
                            ¿Listo para transformar la televisión pública? Envía tu proyecto por correo o compártelo en X con el hashtag <span className="text-[#FF4D00] font-mono font-bold">#NuevaTVP</span>.
                        </p>
                        <div className="flex justify-center gap-4 flex-wrap pt-2">
                            <a
                                href="mailto:gobiernopaniese@protonmail.com"
                                className="inline-flex items-center justify-center rounded-full bg-[#FF4D00] px-8 py-4 text-xs font-bold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:bg-[#e04300] hover:shadow-lg hover:shadow-[#FF4D00]/20 active:scale-95 font-tvp-head"
                            >
                                Enviar por Correo
                            </a>
                            <a
                                href="https://twitter.com/intent/tweet?text=%23NuevaTVP"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center rounded-full border-2 border-[#FF4D00]/50 bg-transparent px-8 py-4 text-xs font-bold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:bg-[#FF4D00]/10 hover:border-[#FF4D00] active:scale-95 font-tvp-head"
                            >
                                Publicar en X (#NuevaTVP)
                            </a>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}