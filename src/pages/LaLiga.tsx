import { Link } from "wouter";

export default function LaLigaPaniense() {
    return (
        <div className="min-h-screen bg-slate-950 text-white antialiased flex flex-col font-laliga-body">

            {/* INYECCIÓN DE FUENTES PERSONALIZADAS */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @font-face {
                    font-family: 'LALIGAFONT';
                    src: url('/LALIGA/LALIGAFONT.ttf') format('truetype');
                    font-display: swap;
                }
                @font-face {
                    font-family: 'LALIGAMinor';
                    src: url('/LALIGA/LALIGAMinor.ttf') format('truetype');
                    font-display: swap;
                }
                .font-laliga-title {
                    font-family: 'LALIGAFONT', sans-serif !important;
                }
                .font-laliga-body {
                    font-family: 'LALIGAMinor', sans-serif !important;
                }
            `}} />

            {/* HEADER LALIGA PANIENSE */}
            <header className="bg-slate-950/95 backdrop-blur border-b border-slate-800 sticky top-0 z-50 px-4 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">

                    {/* Logo LALIGA */}
                    <div className="flex items-center gap-3">
                        <img
                            src="/LALIGA/laliga.png"
                            alt="Logo LALIGA"
                            className="h-8 w-auto object-contain"
                        />
                        <span className="text-2xl font-laliga-title tracking-tight text-white flex gap-1 uppercase">
                            LA<span className="text-red-600">MIGA</span> <span className="font-light">PANIENSE</span>
                        </span>
                    </div>

                    {/* Botón de Volver / Inicio */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-wider bg-red-600 text-white hover:bg-red-700 transition duration-200 shadow-md hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 font-laliga-title"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Inicio
                    </Link>

                </div>
            </header>

            {/* PANEL DE ESCUDOS EN BLANCO */}
            <section className="bg-slate-950 py-8 px-4 border-b border-slate-900">
                <div className="max-w-7xl mx-auto">
                    {/* Grid responsivo: cambia los números si tienes más o menos equipos */}
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-6 items-center justify-items-center">
                        {[
                            "Martini City F.C.png",
                            "barcelona.png",
                            "atletico.png",
                            "valencia.png",
                            "sevilla.png",
                            "betis.png",
                            "sociedad.png",
                            "athletic.png",
                            "girona.png",
                            "villarreal.png"
                            // ... Añade aquí todos los nombres exactos de tus archivos de la carpeta
                        ].map((archivo, index) => {
                            // Extraemos el nombre del equipo quitando la extensión para el atributo 'alt'
                            const nombreEquipo = archivo.split('.')[0];

                            return (
                                <div
                                    key={index}
                                    className="group flex flex-col items-center justify-center p-2 transition duration-300"
                                    title={nombreEquipo.toUpperCase()}
                                >
                                    <img
                                        src={`/LALIGA/Equipos/${archivo}`}
                                        alt={`Escudo de ${nombreEquipo}`}
                                        // 'brightness-0 invert' hace la magia del blanco puro.
                                        // 'opacity-60 hover:opacity-100' le da un toque interactivo muy pro.
                                        className="h-12 w-12 object-contain filter brightness-0 invert opacity-60 group-hover:opacity-100 group-hover:scale-110 transition duration-200"
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* MAIN CONTENT */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">

                {/* Hero Banner */}
                <div className="relative bg-slate-900 rounded-2xl p-8 sm:p-12 mb-12 overflow-hidden border border-slate-800">
                    <div className="absolute -top-32 -right-32 w-96 h-96 bg-red-600/30 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <span className="inline-block text-xs font-bold uppercase tracking-widest bg-red-600 text-white px-3 py-1 rounded-full mb-4">
                            Temporada Oficial
                        </span>
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 uppercase font-laliga-title">
                            La pasión del fútbol paniense
                        </h1>
                        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mb-8 leading-relaxed">
                            Bienvenido a la máxima competición de nuestro país. Sigue en directo la clasificación, los resultados y toda la actualidad de los clubes históricos de Pania.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <button className="bg-red-600 text-white px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400">
                                Jornada en Directo
                            </button>
                            <button className="border-2 border-slate-700 text-white px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-slate-800 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40">
                                Ver Calendario
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs / Filtros Divisiones */}
                <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                    <button className="px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider bg-red-600 text-white whitespace-nowrap hover:bg-red-700 transition">
                        Primera División
                    </button>
                    <button className="px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider bg-slate-900 text-slate-300 whitespace-nowrap hover:bg-slate-800 transition border border-slate-800">
                        División de Plata
                    </button>
                    <button className="px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider bg-slate-900 text-slate-300 whitespace-nowrap hover:bg-slate-800 transition border border-slate-800">
                        Copa Nacional
                    </button>
                </div>

                {/* Grid Principal */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Columna Principal: Noticias */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Noticia Principal */}
                        <article className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition">
                            <div className="h-48 bg-gradient-to-br from-slate-700 to-slate-800"></div>
                            <div className="p-6">
                                <span className="text-xs font-bold uppercase text-red-500 tracking-widest">Mercado de Fichajes</span>
                                <h3 className="text-2xl font-black mt-3 mb-3 text-white leading-tight font-laliga-title">
                                    Movimientos clave antes del cierre de registros
                                </h3>
                                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                                    Los principales clubes de la Primera División apuran sus opciones en el mercado. El Real Pania busca un delantero, mientras que el Atlético Sur refuerza su defensa.
                                </p>
                                <a href="#" className="inline-flex items-center text-sm font-bold text-red-500 hover:text-red-400 transition">
                                    Leer más
                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </a>
                            </div>
                        </article>

                        {/* Noticias Secundarias */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <article className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
                                <span className="text-xs font-bold uppercase text-red-500 tracking-widest">Análisis</span>
                                <h4 className="text-lg font-bold mt-2 mb-2 text-white font-laliga-title">El derbi capitalino</h4>
                                <p className="text-sm text-slate-400">Tácticas y alineaciones probables para el esperado encuentro de este domingo.</p>
                            </article>
                            <article className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
                                <span className="text-xs font-bold uppercase text-red-500 tracking-widest">MVP</span>
                                <h4 className="text-lg font-bold mt-2 mb-2 text-white font-laliga-title">Jugador de la Jornada</h4>
                                <p className="text-sm text-slate-400">Descubre quién ha sido elegido por la afición como el jugador más valioso.</p>
                            </article>
                        </div>
                    </div>

                    {/* Columna Lateral: Clasificación Paniense */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-fit lg:sticky lg:top-24">
                        <h3 className="font-black text-base tracking-tight text-white mb-4 uppercase border-b-2 border-red-600 pb-3 font-laliga-title">
                            Clasificación en vivo
                        </h3>
                        <div className="space-y-2 text-sm font-semibold text-slate-300">
                            <div className="flex justify-between items-center bg-red-600/10 p-3 rounded-lg border border-red-600/30">
                                <span className="font-bold text-white">1. Martini City F.C.</span>
                                <span className="text-red-500 font-black">24 PTS</span>
                            </div>
                            <div className="flex justify-between items-center p-3 hover:bg-slate-800 rounded-lg transition">
                                <span>2. Atlético Sur</span>
                                <span className="text-slate-400">21 PTS</span>
                            </div>
                            <div className="flex justify-between items-center p-3 hover:bg-slate-800 rounded-lg transition">
                                <span>3. Deportivo Norte</span>
                                <span className="text-slate-400">19 PTS</span>
                            </div>
                            <div className="flex justify-between items-center p-3 hover:bg-slate-800 rounded-lg transition">
                                <span>4. Sporting Capital</span>
                                <span className="text-slate-400">18 PTS</span>
                            </div>
                            <div className="flex justify-between items-center p-3 hover:bg-slate-800 rounded-lg transition">
                                <span>5. Unión Marítima</span>
                                <span className="text-slate-400">16 PTS</span>
                            </div>
                        </div>
                        <button className="w-full mt-6 py-2.5 text-xs font-bold uppercase tracking-wider text-red-500 border-2 border-red-600/40 rounded-lg hover:bg-red-600/10 transition">
                            Ver tabla completa
                        </button>
                    </div>

                </div>

                {/* Próximos Partidos Panieses */}
                <section className="mt-12">
                    <h2 className="text-3xl font-black tracking-tight text-white mb-6 uppercase font-laliga-title">
                        Próxima Jornada
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { date: "SÁB 23.05 - 18:00", home: "Real Pania FC", away: "Atlético Sur" },
                            { date: "SÁB 23.05 - 20:30", home: "Sporting Capital", away: "Unión Marítima" },
                            { date: "DOM 24.05 - 16:00", home: "Deportivo Norte", away: "CF Valles" },
                        ].map((match, i) => (
                            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
                                <p className="text-xs font-bold uppercase text-slate-500 mb-3">{match.date}</p>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-center flex-1">
                                        <p className="font-bold text-white">{match.home}</p>
                                    </div>
                                    <div className="text-center px-4">
                                        <p className="text-2xl font-black text-slate-500">VS</p>
                                    </div>
                                    <div className="text-center flex-1">
                                        <p className="font-bold text-white">{match.away}</p>
                                    </div>
                                </div>
                                <button className="w-full py-2 text-xs font-bold uppercase tracking-wider bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                                    Centro de Partido
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

            </main>

            {/* FOOTER LALIGA PANIENSE */}
            <footer className="bg-slate-950 text-slate-400 py-12 px-4 mt-16 border-t border-slate-800">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

                        {/* Sección: Juego Limpio y Reglamento */}
                        <div>
                            <h4 className="font-black text-white text-sm uppercase tracking-wider mb-4 font-laliga-title">Compromiso</h4>
                            <ul className="space-y-2 text-xs">
                                <li><Link href="/LALIGA/juego-limpio" className="hover:text-white transition">Juego Limpio</Link></li>
                                <li><Link href="/LALIGA/reglamento" className="hover:text-white transition">Reglamento</Link></li>
                            </ul>
                        </div>

                        {/* Institución */}
                        <div>
                            <h4 className="font-black text-white text-sm uppercase tracking-wider mb-4 font-laliga-title">Institución</h4>
                            <ul className="space-y-2 text-xs">
                                <li><Link href="/LALIGA/CSD" className="hover:text-white transition">CSD</Link></li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="font-black text-white text-sm uppercase tracking-wider mb-4 font-laliga-title">Legal</h4>
                            <ul className="space-y-2 text-xs">
                                <li><Link href="/privacy" className="hover:text-white transition">Política de privacidad</Link></li>
                                <li><Link href="/terms" className="hover:text-white transition">Términos y condiciones</Link></li>
                            </ul>
                        </div>

                        {/* Comunidad */}
                        <div>
                            <h4 className="font-black text-white text-sm uppercase tracking-wider mb-4 font-laliga-title">Comunidad</h4>
                            <ul className="space-y-2 text-xs">
                                <li>
                                    <a
                                        href="https://discord.com/invite/reino-del-pan-1381359904731693056"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-white hover:text-red-500 transition duration-200"
                                        aria-label="Discord"
                                    >
                                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.298 12.298 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" />
                                        </svg>
                                    </a>
                                </li>
                            </ul>
                        </div>

                    </div>

                    <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                        <p>© 2026 LaMiga Paniense. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}