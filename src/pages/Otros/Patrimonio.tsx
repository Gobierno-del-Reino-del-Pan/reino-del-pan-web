import Footer from "../../components/Footer";

export default function PatrimonioPanacional() {
    // Inyección de estilos blindados y fuentes institucionales
    const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700;800&display=swap');
    
    .patrimonio-scope .font-title {
      font-family: 'Space Grotesk', sans-serif;
    }

    .patrimonio-scope .font-body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
  `;

    return (
        <div className="min-h-screen flex flex-col bg-[#FAFBFB] text-zinc-900 antialiased selection:bg-[#0F326A]/20">
            <style dangerouslySetInnerHTML={{ __html: customStyles }} />

            {/* Contenedor aislado */}
            <div className="patrimonio-scope font-body flex-1 flex flex-col">

                {/* 1. FRANJA INSTITUCIONAL DEL GOBIERNO */}
                <div className="bg-zinc-950 border-b border-zinc-800 py-2.5 px-4 text-[10px] md:text-xs text-zinc-400 font-sans-modern">
                    <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-center">
                        <img
                            src="/flag.png"
                            alt="Bandera del Reino del Pan"
                            className="h-3 w-5 opacity-90"
                        />
                        <span className="font-semibold tracking-wider uppercase">
                            Gobierno del Reino del Pan · Ministerio de Industria y Turismo
                        </span>
                    </div>
                </div>

                {/* 2. HEADER PATRIMONIO PANACIONAL */}
                <header className="w-full bg-white/95 backdrop-blur-md px-6 py-5 border-b border-zinc-200 sticky top-0 z-50 shadow-xs">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">

                        <div className="flex items-center gap-5">
                            <img
                                src="/Otros/PATRIMONIOPANACIONAL.png"
                                alt="Logo PATRIMONIO PANACIONAL"
                                className="h-16 w-auto object-contain transition-transform hover:scale-102"
                            />
                            <div className="h-10 w-px bg-zinc-200 hidden sm:block"></div>
                            <div className="flex flex-col">
                                <h1 className="font-title text-xl font-black text-[#0F326A] tracking-wide leading-relaxed">
                                    PATRIMONIO PANACIONAL
                                </h1>

                            </div>
                        </div>

                        <nav className="flex items-center gap-5 flex-wrap justify-center font-sans">
                            <a
                                href="/turismo"
                                className="text-xs uppercase tracking-wider font-bold text-zinc-600 hover:text-[#006D77] transition px-2 py-1"
                            >
                                ← Volver a Visit Pan
                            </a>

                        </nav>
                    </div>
                </header>

                {/* 3. HERO SECTION - MONUMENTAL */}
                <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-16 flex flex-col gap-28">

                    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-zinc-950 text-white rounded-3xl overflow-hidden shadow-2xl">
                        {/* Lado izquierdo */}
                        <div className="lg:col-span-7 p-8 md:p-16 flex flex-col justify-center gap-8">
                            <div className="flex flex-col items-start">
                                <span className="inline-flex items-center gap-2 bg-[#0F326A] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm mb-6 border border-blue-400/30">
                                    Apertura de Reservas Oficiales 2026
                                </span>
                                <h2 className="font-title text-3xl md:text-5xl font-extrabold tracking-normal leading-relaxed text-white">
                                    Explora la memoria viva, los <span className="text-amber-400">palacios reales</span> y monasterios del Reino.
                                </h2>
                            </div>

                            <p className="text-zinc-400 text-sm md:text-base max-w-xl leading-loose font-normal mt-2">
                                Patrimonio Panacional custodia de forma activa los monumentos e hitos arquitectónicos heredados de la historia dinástica del Reino del Pan. Espacios singulares llenos de arte, tapices milenarios, jardines botánicos e imponentes conjuntos monásticos accesibles hoy al ciudadano.
                            </p>
                        </div>

                        {/* Lado derecho con Imagen Histórica */}
                        <div className="lg:col-span-5 relative min-h-[380px] flex flex-col items-center justify-center p-8 text-center overflow-hidden">
                            <img
                                src="https://www.metalocus.es/sites/default/files/styles/mopis_fullslider_desktop/public/lead-images/metalocus_10-edificios-memoria-historica_24_p.jpg?itok=3r-QPmwG"
                                alt="Fachada Clásica de Palacio del Reino"
                                className="absolute inset-0 w-full h-full object-cover opacity-60"
                            />
                            {/* Overlay corporativo degradado */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0F326A] via-[#0F326A]/90 to-transparent mix-blend-multiply"></div>

                            {/* Contenido */}
                            <div className="relative z-10 flex flex-col items-center gap-5 mt-auto pb-6">
                                <p className="font-title text-5xl font-black text-amber-400 drop-shadow-lg leading-none tracking-normal">
                                    HISTORIA
                                </p>
                                <p className="font-title text-sm font-bold tracking-widest uppercase text-white leading-relaxed drop-shadow-md">
                                    Reserva de Entradas e Itinerarios
                                </p>
                                <div className="w-14 h-1 bg-amber-400 rounded-full shadow-lg mt-1"></div>
                            </div>
                        </div>
                    </section>

                    {/* 4. SELECCIÓN DE MONUMENTOS PREMIUM (TICKETS COMPRA) */}
                    <section className="flex flex-col gap-12">
                        <div className="border-b border-zinc-200 pb-8 flex flex-col">
                            <h3 className="font-title text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 leading-relaxed mb-4">
                                Venta de Entradas y Monumentos Principales
                            </h3>
                            <p className="text-sm md:text-base text-zinc-500 font-normal leading-relaxed mt-1">
                                Planifica tu acceso y evita colas reservando el pase oficial digital con control de aforo integrado en moneda local.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {/* Palacio Real */}
                            <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden flex flex-col group hover:shadow-lg transition duration-300">
                                <div className="h-52 w-full relative overflow-hidden">
                                    <img src="https://images.ecestaticos.com/2ieC09eoBQl8trAwcyQtCdRifgE=/210x26:1536x1020/1200x900/filters:fill(white):format(jpg)/f.elconfidencial.com%2Foriginal%2F13e%2F6a4%2F1e0%2F13e6a41e01f7621b7b7b07067ab628b0.jpg" alt="Palacio Real Monumental" className="w-full h-full object-cover group-hover:scale-103 transition duration-500" />
                                    <div className="absolute top-4 left-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white bg-[#0F326A] px-3 py-1.5 rounded-sm shadow-sm">
                                            Sede de la Corona
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <h4 className="font-title text-xl font-bold text-zinc-900 leading-relaxed mb-4">
                                        Palacio Real del Reino del Pan
                                    </h4>
                                    <p className="text-xs md:text-sm text-zinc-600 leading-loose font-normal flex-1 mb-6">
                                        Testigo de los grandes concilios históricos. Visita los salones oficiales de la corte, la imponente armería dinástica y las galerías de arte que albergan frescos renacentistas únicos.
                                    </p>
                                    <button className="w-full text-xs font-bold uppercase tracking-wider text-white bg-[#0F326A] hover:bg-zinc-900 p-3.5 rounded-md text-center transition shadow-xs mt-auto">
                                        Reservar Entrada · 456 Ᵽ
                                    </button>
                                </div>
                            </div>

                            {/* Monasterio de la Orden */}
                            <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden flex flex-col group hover:shadow-lg transition duration-300">
                                <div className="h-52 w-full relative overflow-hidden">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/76/Monasterio_de_El_Parral%2C_Segovia.JPG" alt="Claustro y Monasterio Histórico" className="w-full h-full object-cover group-hover:scale-103 transition duration-500" />
                                    <div className="absolute top-4 left-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white bg-[#0F326A] px-3 py-1.5 rounded-sm shadow-sm">
                                            Monasterio Real
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <h4 className="font-title text-xl font-bold text-zinc-900 leading-relaxed mb-4">
                                        Monasterio de San Quintín
                                    </h4>
                                    <p className="text-xs md:text-sm text-zinc-600 leading-loose font-normal flex-1 mb-6">
                                        Una obra magna de piedra tallada y silencio absoluto. Su biblioteca secreta custodia códices iluminados históricos de la geografía y primeros cartógrafos panacionales.
                                    </p>
                                    <button className="w-full text-xs font-bold uppercase tracking-wider text-white bg-[#0F326A] hover:bg-zinc-900 p-3.5 rounded-md text-center transition shadow-xs mt-auto">
                                        Reservar Entrada · 304 Ᵽ
                                    </button>
                                </div>
                            </div>

                            {/* Jardines del Pardo */}
                            <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden flex flex-col group hover:shadow-lg transition duration-300">
                                <div className="h-52 w-full relative overflow-hidden">
                                    <img src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80" alt="Jardines del Laberinto Regio" className="w-full h-full object-cover group-hover:scale-103 transition duration-500" />
                                    <div className="absolute top-4 left-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-900 bg-amber-400 px-3 py-1.5 rounded-sm shadow-sm">
                                            Paisaje Protegido
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <h4 className="font-title text-xl font-bold text-zinc-900 leading-relaxed mb-4">
                                        Jardines del Laberinto Regio
                                    </h4>
                                    <p className="text-xs md:text-sm text-zinc-600 leading-loose font-normal flex-1 mb-6">
                                        Hectáreas de diseño paisajístico geométrico flanqueadas por fuentes monumentales y canales antiguos navegables. Una delicia botánica abierta en su máximo esplendor.
                                    </p>
                                    <button className="w-full text-xs font-bold uppercase tracking-wider text-[#0F326A] bg-zinc-100 hover:bg-zinc-200 p-3.5 rounded-md text-center transition font-semibold shadow-xs mt-auto">
                                        Acceso Libre · Reservar Guía
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 5. SECCIÓN DE ANUNCIOS Y EVENTOS REALES */}
                    <section className="flex flex-col gap-12">
                        <div className="border-b border-zinc-200 pb-8 flex flex-col">
                            <h3 className="font-title text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 leading-relaxed mb-4">
                                Gaceta Cultural e Investigaciones Históricas
                            </h3>
                            <p className="text-sm text-zinc-500 font-normal leading-relaxed mt-1">
                                Últimos hallazgos, restauraciones de patrimonio y aperturas extraordinarias nocturnas bajo gestión institucional.
                            </p>
                        </div>

                        {/* Fila 1 de Noticias */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <article className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between group hover:border-[#0F326A]/40 transition hover:shadow-md">
                                <div className="flex flex-col">
                                    <div className="mb-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#0F326A] bg-blue-50 px-2.5 py-1 rounded-sm inline-block">
                                            Restauración Textil
                                        </span>
                                    </div>
                                    <h4 className="font-title text-lg font-bold text-zinc-900 leading-relaxed tracking-normal group-hover:text-[#0F326A] transition mb-4">
                                        Recuperación de los Tapices del Siglo XVII
                                    </h4>
                                    <p className="text-xs md:text-sm text-zinc-600 leading-loose font-normal mt-1">
                                        Los maestros artesanos del Reino finalizan la meticulosa restauración del tapiz dinástico central, expuesto ahora en la Gran Galería de Honor.
                                    </p>
                                </div>
                                <span className="text-[11px] font-semibold text-zinc-400 mt-8 block border-t border-zinc-100 pt-4">Taller de Palacio</span>
                            </article>

                            <article className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between group hover:border-[#0F326A]/40 transition hover:shadow-md">
                                <div className="flex flex-col">
                                    <div className="mb-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#0F326A] bg-blue-50 px-2.5 py-1 rounded-sm inline-block">
                                            Ciclo de Música
                                        </span>
                                    </div>
                                    <h4 className="font-title text-lg font-bold text-zinc-900 leading-relaxed tracking-normal group-hover:text-[#0F326A] transition mb-4">
                                        Conciertos Nocturnos en el Órgano Real
                                    </h4>
                                    <p className="text-xs md:text-sm text-zinc-600 leading-loose font-normal mt-1">
                                        Se anuncia la apertura del ciclo estival de música de cámara barroca en la Capilla Palaciega, utilizando el histórico instrumento restaurado de tubos de plomo.
                                    </p>
                                </div>
                                <span className="text-[11px] font-semibold text-zinc-400 mt-8 block border-t border-zinc-100 pt-4">Entradas Limitadas</span>
                            </article>

                            <article className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between group hover:border-[#0F326A]/40 transition hover:shadow-md">
                                <div className="flex flex-col">
                                    <div className="mb-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800 bg-amber-50 px-2.5 py-1 rounded-sm inline-block">
                                            Arqueología
                                        </span>
                                    </div>
                                    <h4 className="font-title text-lg font-bold text-zinc-900 leading-relaxed tracking-normal group-hover:text-[#0F326A] transition mb-4">
                                        Nuevos pasadizos subterráneos descubiertos
                                    </h4>
                                    <p className="text-xs md:text-sm text-zinc-600 leading-loose font-normal mt-1">
                                        Las excavaciones estructurales en el ala norte sacan a la luz canalizaciones fortificadas medievales que conectaban la ciudad amurallada con el torreón principal.
                                    </p>
                                </div>
                                <span className="text-[11px] font-semibold text-zinc-400 mt-8 block border-t border-zinc-100 pt-4">Crónica Científica</span>
                            </article>
                        </div>
                    </section>

                    {/* 6. COMPROMISO DE PRESERVACIÓN HISTÓRICA */}
                    <section className="bg-zinc-100 rounded-3xl p-8 md:p-12 border border-zinc-200">
                        <div className="max-w-3xl mx-auto flex flex-col gap-10">
                            <div className="text-center flex flex-col">
                                <h3 className="font-title text-2xl font-bold text-zinc-900 tracking-tight leading-relaxed mb-3">
                                    Conservación Arqueológica y Digitalización
                                </h3>
                                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold leading-relaxed mt-1">
                                    Plan de Excelencia e Impacto · Patrimonio Panacional
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-2">
                                <div className="flex flex-col gap-8">
                                    <div>
                                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-zinc-700 mb-3 font-title">
                                            <span>Catalogación de Obras (B.I.C.)</span>
                                            <span className="text-[#0F326A]">98%</span>
                                        </div>
                                        <div className="w-full bg-zinc-200 h-2.5 rounded-full overflow-hidden">
                                            <div className="bg-[#0F326A] h-full rounded-full" style={{ width: '98%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-zinc-700 mb-3 font-title">
                                            <span>Restauración Arquitectónica Activa</span>
                                            <span className="text-[#0F326A]">84%</span>
                                        </div>
                                        <div className="w-full bg-zinc-200 h-2.5 rounded-full overflow-hidden">
                                            <div className="bg-[#0F326A] h-full rounded-full" style={{ width: '84%' }}></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-8">
                                    <div>
                                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-zinc-700 mb-3 font-title">
                                            <span>Digitalización 3D y Archivo Histórico</span>
                                            <span className="text-[#0F326A]">91%</span>
                                        </div>
                                        <div className="w-full bg-zinc-200 h-2.5 rounded-full overflow-hidden">
                                            <div className="bg-[#0F326A] h-full rounded-full" style={{ width: '91%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-zinc-700 mb-3 font-title">
                                            <span>Sostenibilidad e Infraestructura de Aforo</span>
                                            <span className="text-emerald-700">100%</span>
                                        </div>
                                        <div className="w-full bg-zinc-200 h-2.5 rounded-full overflow-hidden">
                                            <div className="bg-emerald-700 h-full rounded-full" style={{ width: '100%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>

            {/* 7. FOOTER INSTITUCIONAL */}
            <Footer />
        </div>
    );
}