import Footer from "../../components/Footer";

export default function VisitPan() {
    // Inyección de estilos corregidos y blindados
    const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700;800&display=swap');
    
    .visitpan-scope .font-title {
      font-family: 'Space Grotesk', sans-serif;
    }

    .visitpan-scope .font-body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
  `;

    return (
        <div className="min-h-screen flex flex-col bg-[#F9FBFB] text-zinc-900 antialiased selection:bg-[#E29578]/30">
            <style dangerouslySetInnerHTML={{ __html: customStyles }} />

            {/* Contenedor aislado */}
            <div className="visitpan-scope font-body flex-1 flex flex-col">

                {/* 1. FRANJA DE WEB OFICIAL DEL GOBIERNO */}
                <div className="bg-zinc-900 border-b border-border/40 py-2.5 px-4 text-[10px] md:text-xs text-zinc-400 font-sans-modern">
                    <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-center">
                        <img
                            src="/flag.png"
                            alt="Bandera del Reino del Pan"
                            className="h-3 w-5 opacity-90"
                        />
                        <span className="font-semibold tracking-wider uppercase">
                            Web oficial del Gobierno del Reino del Pan · Ministerio de Industria y Turismo
                        </span>
                    </div>
                </div>

                {/* 2. HEADER */}
                <header className="w-full bg-white/90 backdrop-blur-md px-6 py-5 border-b border-zinc-100 sticky top-0 z-50 shadow-xs">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">

                        <div className="flex items-center gap-5">
                            <img
                                src="/Otros/VISITPAN.png"
                                alt="Logo VISIT PAN"
                                className="h-14 w-auto object-contain transition-transform hover:scale-105"
                            />
                            <div className="h-8 w-px bg-zinc-200 hidden sm:block"></div>
                            <div>
                                <h1 className="font-title text-2xl font-black text-zinc-900 tracking-tight leading-relaxed">
                                    VISIT PAN
                                </h1>
                            </div>
                        </div>

                        <nav className="flex items-center gap-5 flex-wrap justify-center">
                            <a
                                href="/patrimonio-panacional"
                                className="text-xs uppercase tracking-wider font-bold text-zinc-600 hover:text-[#006D77] transition px-2 py-1"
                            >
                                Patrimonio Panacional ↗
                            </a>

                            <div className="h-5 w-px bg-zinc-200 mx-1 hidden xs:block"></div>
                            <a
                                href="/"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 transition text-xs font-bold uppercase tracking-wider text-zinc-700 shadow-xs"
                            >
                                <span>Volver al portal</span>
                            </a>
                        </nav>
                    </div>
                </header>

                {/* 3. HERO SECTION */}
                <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-16 flex flex-col gap-28">

                    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-zinc-900 text-white rounded-3xl overflow-hidden shadow-2xl">
                        {/* Lado izquierdo */}
                        <div className="lg:col-span-7 p-8 md:p-16 flex flex-col justify-center gap-8">
                            <div className="flex flex-col items-start">
                                <span className="inline-flex items-center gap-2 bg-[#E29578] text-zinc-950 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md mb-6">
                                    Destino de Naturaleza y Bienestar
                                </span>
                                <h2 className="font-title text-3xl md:text-5xl font-extrabold tracking-normal leading-relaxed text-white">
                                    Descubre un paraíso entre <span className="text-[#E29578]">playas doradas</span>, montañas vírgenes y horizontes infinitos.
                                </h2>
                            </div>

                            <p className="text-zinc-400 text-sm md:text-base max-w-xl leading-loose font-normal mt-2">
                                El Reino del Pan te espera con contrastes únicos. Desde costas tranquilas de aguas cristalinas hasta senderos imponentes que custodian valles históricos. Un viaje diseñado para perderse en la naturaleza, desconectar del mundo y conectar con paisajes inolvidables.
                            </p>
                        </div>

                        {/* Lado derecho con Imagen */}
                        <div className="lg:col-span-5 relative min-h-[360px] flex flex-col items-center justify-center p-8 text-center overflow-hidden">
                            {/* Imagen de fondo */}
                            <img
                                src="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80"
                                alt="Paisaje de costa"
                                className="absolute inset-0 w-full h-full object-cover opacity-70"
                            />
                            {/* Overlay degradado para asegurar la legibilidad del texto */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#006D77] via-[#006D77]/80 to-transparent mix-blend-multiply"></div>

                            {/* Contenido */}
                            <div className="relative z-10 flex flex-col items-center gap-5 mt-auto pb-6">
                                <p className="font-title text-7xl font-black text-white drop-shadow-lg leading-none tracking-normal">
                                    2026
                                </p>
                                <p className="font-title text-lg font-bold tracking-widest uppercase text-white leading-relaxed drop-shadow-md">
                                    Temporada Dorada
                                </p>
                                <div className="w-14 h-1.5 bg-[#E29578] rounded-full shadow-lg mt-1"></div>
                            </div>
                        </div>
                    </section>

                    {/* 4. DESTINOS PREMIUM CON IMÁGENES */}
                    <section className="flex flex-col gap-12">
                        <div className="border-b border-zinc-200 pb-8 flex flex-col">
                            <h3 className="font-title text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 leading-relaxed mb-4">
                                Lo Mejor del Reino: Selección de Excelencia
                            </h3>
                            <p className="text-sm md:text-base text-zinc-500 font-normal leading-relaxed mt-1">
                                Los enclaves naturales y urbanos más valorados por los viajeros internacionales esta temporada.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {/* La mejor playa */}
                            <div className="bg-white rounded-2xl border border-zinc-100 shadow-xs overflow-hidden flex flex-col group hover:shadow-lg transition duration-300">
                                <div className="h-48 w-full relative overflow-hidden">
                                    <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80" alt="Playa de las Arenas Finas" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                    <div className="absolute top-4 left-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#006D77] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-sm">
                                            La Mejor Playa
                                        </span>
                                    </div>
                                    <div className="absolute top-4 right-4 flex text-amber-400 text-base drop-shadow-md bg-black/30 px-2 py-1 rounded-md backdrop-blur-sm">
                                        ★★★★★
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <h4 className="font-title text-xl font-bold text-zinc-900 leading-relaxed mb-4">
                                        Playa de las Arenas Finas
                                    </h4>
                                    <p className="text-xs md:text-sm text-zinc-600 leading-loose font-normal flex-1 mb-4">
                                        Kilómetros de costa virgen flanqueados por dunas naturales y aguas turquesas transparentes. Perfecta para el descanso absoluto y la desconexión total junto al mar.
                                    </p>
                                    <div className="text-[11px] font-bold text-[#006D77] bg-zinc-50 p-3 rounded-lg text-center mt-auto border border-zinc-100">
                                        Valoración: 4.9 / 5.0 · Eco-Litoral Protegido
                                    </div>
                                </div>
                            </div>

                            {/* La mejor montaña */}
                            <div className="bg-white rounded-2xl border border-zinc-100 shadow-xs overflow-hidden flex flex-col group hover:shadow-lg transition duration-300">
                                <div className="h-48 w-full relative overflow-hidden">
                                    <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80" alt="Pico Alto del Horizonte" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                    <div className="absolute top-4 left-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-sm">
                                            La Mejor Montaña
                                        </span>
                                    </div>
                                    <div className="absolute top-4 right-4 flex text-amber-400 text-base drop-shadow-md bg-black/30 px-2 py-1 rounded-md backdrop-blur-sm">
                                        ★★★★★
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <h4 className="font-title text-xl font-bold text-zinc-900 leading-relaxed mb-4">
                                        Pico Alto del Horizonte
                                    </h4>
                                    <p className="text-xs md:text-sm text-zinc-600 leading-loose font-normal flex-1 mb-4">
                                        Una imponente cumbre que ofrece las rutas de senderismo más hermosas y espectaculares del Reino, con miradores que abarcan todo el relieve y los valles del mapa.
                                    </p>
                                    <div className="text-[11px] font-bold text-emerald-800 bg-zinc-50 p-3 rounded-lg text-center mt-auto border border-zinc-100">
                                        Valoración: 4.8 / 5.0 · Rutas Balizadas Alta Montaña
                                    </div>
                                </div>
                            </div>

                            {/* La mejor ciudad */}
                            <div className="bg-white rounded-2xl border border-zinc-100 shadow-xs overflow-hidden flex flex-col group hover:shadow-lg transition duration-300">
                                <div className="h-48 w-full relative overflow-hidden">
                                    <img src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80" alt="Ciudadela de los Molinos" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                    <div className="absolute top-4 left-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-800 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-sm">
                                            La Mejor Ciudad
                                        </span>
                                    </div>
                                    <div className="absolute top-4 right-4 flex text-amber-400 text-base drop-shadow-md bg-black/30 px-2 py-1 rounded-md backdrop-blur-sm">
                                        ★★★★☆
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <h4 className="font-title text-xl font-bold text-zinc-900 leading-relaxed mb-4">
                                        Ciudadela de los Molinos
                                    </h4>
                                    <p className="text-xs md:text-sm text-zinc-600 leading-loose font-normal flex-1 mb-4">
                                        El núcleo urbano cultural por excelencia. Calles empedradas tradicionales llenas de encanto histórico, museos vibrantes y plazas con una oferta gastronómica inigualable.
                                    </p>
                                    <div className="text-[11px] font-bold text-indigo-800 bg-zinc-50 p-3 rounded-lg text-center mt-auto border border-zinc-100">
                                        Valoración: 4.6 / 5.0 · Centro Histórico y Cultural
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 5. GACETA DEL VIAJERO */}
                    <section className="flex flex-col gap-12">
                        <div className="border-b border-zinc-200 pb-8 flex flex-col">
                            <h3 className="font-title text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 leading-relaxed mb-4">
                                Gaceta del Viajero
                            </h3>
                            <p className="text-sm text-zinc-500 font-normal leading-relaxed mt-1">
                                Crónicas, avisos astronómicos y las mejores recomendaciones actualizadas de nuestra geografía.
                            </p>
                        </div>

                        {/* Fila 1 de Noticias */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <article className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-xs flex flex-col justify-between group hover:border-[#006D77]/40 transition hover:shadow-md">
                                <div className="flex flex-col">
                                    <div className="mb-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#006D77] bg-[#EDF6F9] px-2.5 py-1 rounded-md inline-block">
                                            Astronomía y Naturaleza
                                        </span>
                                    </div>
                                    <h4 className="font-title text-lg font-bold text-zinc-900 leading-relaxed tracking-normal group-hover:text-[#006D77] transition mb-4">
                                        2026: el año en el que "empiezan" los eclipses
                                    </h4>
                                    <p className="text-xs md:text-sm text-zinc-600 leading-loose font-normal mt-1">
                                        Prepara tus prismáticos. Este año inaugura una serie de fenómenos astronómicos únicos visibles desde nuestros miradores de montaña certificados.
                                    </p>
                                </div>
                                <span className="text-[11px] font-semibold text-zinc-400 mt-8 block border-t border-zinc-100 pt-4">Edición Especial</span>
                            </article>

                            <article className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-xs flex flex-col justify-between group hover:border-[#006D77]/40 transition hover:shadow-md">
                                <div className="flex flex-col">
                                    <div className="mb-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#006D77] bg-[#EDF6F9] px-2.5 py-1 rounded-md inline-block">
                                            Romántico
                                        </span>
                                    </div>
                                    <h4 className="font-title text-lg font-bold text-zinc-900 leading-relaxed tracking-normal group-hover:text-[#006D77] transition mb-4">
                                        Tres escapadas románticas para el verano
                                    </h4>
                                    <p className="text-xs md:text-sm text-zinc-600 leading-loose font-normal mt-1">
                                        Descubre rincones íntimos, hoteles rurales de ensueño y cenas bajo las estrellas en valles apartados del bullicio.
                                    </p>
                                </div>
                                <span className="text-[11px] font-semibold text-zinc-400 mt-8 block border-t border-zinc-100 pt-4">Recomendado</span>
                            </article>

                            <article className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-xs flex flex-col justify-between group hover:border-[#006D77]/40 transition hover:shadow-md">
                                <div className="flex flex-col">
                                    <div className="mb-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#006D77] bg-[#EDF6F9] px-2.5 py-1 rounded-md inline-block">
                                            Costas y playas
                                        </span>
                                    </div>
                                    <h4 className="font-title text-lg font-bold text-zinc-900 leading-relaxed tracking-normal group-hover:text-[#006D77] transition mb-4">
                                        Playa en familia: 4 destinos para pasarlo bien juntos
                                    </h4>
                                    <p className="text-xs md:text-sm text-zinc-600 leading-loose font-normal mt-1">
                                        Playas seguras, con aguas tranquilas y todos los servicios necesarios para unas vacaciones familiares perfectas e inolvidables.
                                    </p>
                                </div>
                                <span className="text-[11px] font-semibold text-zinc-400 mt-8 block border-t border-zinc-100 pt-4">Guía Familiar</span>
                            </article>
                        </div>

                        {/* Fila 2 de Noticias */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <article className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-xs flex flex-col justify-between group hover:border-[#006D77]/40 transition hover:shadow-md">
                                <div className="flex flex-col">
                                    <div className="mb-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#006D77] bg-[#EDF6F9] px-2.5 py-1 rounded-md inline-block">
                                            Naturaleza
                                        </span>
                                    </div>
                                    <h4 className="font-title text-xl font-bold text-zinc-900 leading-relaxed tracking-normal group-hover:text-[#006D77] transition mb-4">
                                        La unión de los dos mundos: mar y montaña en un solo viaje
                                    </h4>
                                    <p className="text-xs md:text-sm text-zinc-600 leading-loose font-normal mt-1">
                                        ¿Por qué elegir si puedes tener ambos? Te presentamos los itinerarios geográficos únicos donde los senderos montañosos mueren directamente en la arena del mar mediterráneo del Reino.
                                    </p>
                                </div>
                                <span className="text-[11px] font-semibold text-zinc-400 mt-8 block border-t border-zinc-100 pt-4">Ruta Completa</span>
                            </article>

                            <article className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-xs flex flex-col justify-between group hover:border-[#006D77]/40 transition hover:shadow-md">
                                <div className="flex flex-col">
                                    <div className="mb-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#006D77] bg-[#EDF6F9] px-2.5 py-1 rounded-md inline-block">
                                            Sostenibilidad
                                        </span>
                                    </div>
                                    <h4 className="font-title text-xl font-bold text-zinc-900 leading-relaxed tracking-normal group-hover:text-[#006D77] transition mb-4">
                                        Conoce los mejores destinos de buceo sostenible
                                    </h4>
                                    <p className="text-xs md:text-sm text-zinc-600 leading-loose font-normal mt-1">
                                        Sumérgete y explora praderas marinas intactas y arrecifes llenos de vida en nuestras zonas de reserva biológica con guías locales certificados.
                                    </p>
                                </div>
                                <span className="text-[11px] font-semibold text-zinc-400 mt-8 block border-t border-zinc-100 pt-4">Ecoturismo Marino</span>
                            </article>
                        </div>
                    </section>

                    {/* 6. SECCIÓN DE SOSTENIBILIDAD */}
                    <section className="bg-[#EDF6F9] rounded-3xl p-8 md:p-12 border border-zinc-100">
                        <div className="max-w-3xl mx-auto flex flex-col gap-10">
                            <div className="text-center flex flex-col">
                                <h3 className="font-title text-2xl font-bold text-zinc-900 tracking-tight leading-relaxed mb-3">
                                    Preservación y Compromiso
                                </h3>
                                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold leading-relaxed mt-1">
                                    Estadísticas del Observatorio de Sostenibilidad Turística · Visit Pan
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-2">
                                <div className="flex flex-col gap-8">
                                    <div>
                                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-zinc-700 mb-3 font-title">
                                            <span>Índice de Conservación</span>
                                            <span className="text-[#006D77]">92%</span>
                                        </div>
                                        <div className="w-full bg-zinc-200 h-2.5 rounded-full overflow-hidden">
                                            <div className="bg-[#006D77] h-full rounded-full" style={{ width: '92%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-zinc-700 mb-3 font-title">
                                            <span>Alojamientos Rurales</span>
                                            <span className="text-[#006D77]">78%</span>
                                        </div>
                                        <div className="w-full bg-zinc-200 h-2.5 rounded-full overflow-hidden">
                                            <div className="bg-[#006D77] h-full rounded-full" style={{ width: '78%' }}></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-8">
                                    <div>
                                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-zinc-700 mb-3 font-title">
                                            <span>Satisfacción del Visitante</span>
                                            <span className="text-[#E29578]">95%</span>
                                        </div>
                                        <div className="w-full bg-zinc-200 h-2.5 rounded-full overflow-hidden">
                                            <div className="bg-[#E29578] h-full rounded-full" style={{ width: '95%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-zinc-700 mb-3 font-title">
                                            <span>Fidelidad de Destino</span>
                                            <span className="text-[#E29578]">64%</span>
                                        </div>
                                        <div className="w-full bg-zinc-200 h-2.5 rounded-full overflow-hidden">
                                            <div className="bg-[#E29578] h-full rounded-full" style={{ width: '64%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>

            {/* 7. FOOTER */}
            <Footer />
        </div>
    );
}