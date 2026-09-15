import React, { useState, useMemo } from 'react';

// Types
type TabType = 'todos' | 'Nota de Prensa' | 'Carta Pastoral';

interface Comunicado {
    id: string;
    fecha: string;
    categoria: 'Nota de Prensa' | 'Carta Pastoral' | 'Comisión de Educación';
    titulo: string;
    resumen: string;
}

interface Comision {
    nombre: string;
    presidente: string;
    descripcion: string;
}

// Data (Extraída del componente para evitar reallocaciones)
const COMUNICADOS: Comunicado[] = [
    {
        id: 'c-01',
        fecha: '10 de Septiembre, 2026',
        categoria: 'Nota de Prensa',
        titulo: 'Declaración de la Asamblea Plenaria sobre la cohesión social y el servicio a los más vulnerables',
        resumen: 'Los obispos del Reino del Pan reafirman su compromiso con las cáritas diocesanas y apelan a la concordia social en todo el territorio paniense.'
    },
    {
        id: 'c-02',
        fecha: '2 de Septiembre, 2026',
        categoria: 'Carta Pastoral',
        titulo: 'Exhortación de S.E.R. Mons. Mateo de la Cruz sobre el Jubileo Paniense 2027',
        resumen: 'Orientaciones pastorales e intenciones de oración para la preparación del próximo año jubilar de la Iglesia Paniense.'
    },
    {
        id: 'c-03',
        fecha: '25 de Agosto, 2026',
        categoria: 'Comisión de Educación',
        titulo: 'Mensaje de la Conferencia Pandora al inicio del curso académico y catequético',
        resumen: 'Llamamiento a docentes, familias y catequistas a cultivar la formación humana integral y la esperanza en las aulas.'
    }
];

const COMISIONES: Comision[] = [
    {
        nombre: 'Doctrina de la Fe y Liturgia',
        presidente: 'S.E.R. Mons. Ignacio de la Espriella',
        descripcion: 'Cuidado de la enseñanza dogmática, la preservación litúrgica del rito paniense y la edición de textos sagrados.'
    },
    {
        nombre: 'Pastoral Social y Cáritas Paniense',
        presidente: 'S.E.R. Mons. Gabriel Ruiz',
        descripcion: 'Coordinación de la red nacional de ayuda asistencial, comedores sociales y atención al migrante en el Reino.'
    },
    {
        nombre: 'Educación, Juventud y Cultura',
        presidente: 'S.E.R. Mons. Tomás Moro Valls',
        descripcion: 'Supervisión de colegios diocesanos, universidades católicas y patrimonio histórico-artístico eclesial.'
    },
    {
        nombre: 'Clero, Vida Consagrada y Vocaciones',
        presidente: 'S.E.R. Mons. Santiago de Pania',
        descripcion: 'Acompañamiento a los seminarios mayores, ordenaciones sacerdotales y comunidades monásticas del país.'
    }
];

// Estilos globales / fuentes
const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Lora:ital,wght@0,400;0,600;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

    .cp-scope {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    .cp-serif {
      font-family: 'Lora', Georgia, serif;
    }

    .cp-cinzel {
      font-family: 'Cinzel', Trajan, Georgia, serif;
    }

    .cp-hero-bg {
      background-image: linear-gradient(180deg, rgba(20, 15, 30, 0.75) 0%, rgba(20, 15, 30, 0.92) 100%), 
                        url('https://images.unsplash.com/photo-1548625149-fc4a29cf7092?q=80&w=2000&auto=format&fit=crop');
      background-size: cover;
      background-position: center;
    }
`;

export default function ConferenciaPandora() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('todos');

    // Filtrar comunicados según la pestaña seleccionada
    const filteredComunicados = useMemo(() => {
        if (activeTab === 'todos') return COMUNICADOS;
        return COMUNICADOS.filter(item => item.categoria === activeTab);
    }, [activeTab]);

    return (
        <div className="cp-scope bg-[#FBF9F5] text-amber-950 antialiased selection:bg-[#5C1D82] selection:text-white">
            <style dangerouslySetInnerHTML={{ __html: customStyles }} />

            {/* ==========================================
                1. HEADER Y BARRA DE NAVEGACIÓN
            ========================================== */}
            <header className="fixed top-0 left-0 right-0 z-50 shadow-sm">
                {/* Franja Superior */}
                <div className="bg-[#2A173B] text-amber-100/80 py-2 px-4 text-[11px] md:text-xs border-b border-amber-900/40">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                            <span className="font-medium tracking-wide">Portal Oficial de la Conferencia Episcopal</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-6 text-[11px]">
                            <a href="https://vatican.va" target="_blank" rel="noreferrer" className="hover:text-amber-300 transition-colors">
                                Santa Sede (Vaticano) ↗
                            </a>
                            <span className="text-amber-900/60">|</span>
                            <a href="#diocesis" className="hover:text-amber-300 transition-colors">
                                Guía Diocesana
                            </a>
                        </div>
                    </div>
                </div>

                {/* Navbar Principal */}
                <nav className="bg-white/95 backdrop-blur-md border-b border-amber-900/10">
                    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

                        {/* Logo */}
                        <a href="#" className="flex items-center gap-3 group focus:outline-none">
                            <img
                                src="/Otros/ConferenciaPandora.png"
                                alt="Logo Conferencia Pandora"
                                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
                            />
                            <div className="flex flex-col">
                                <span className="cp-cinzel text-lg font-bold text-[#2A173B] leading-tight tracking-wider">
                                    CONFERENCIA PANDORA
                                </span>
                                <span className="text-[10px] text-amber-800 uppercase tracking-widest font-semibold">
                                    Iglesia Católica en el Reino del Pan
                                </span>
                            </div>
                        </a>

                        {/* Menú Desktop */}
                        <div className="hidden lg:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-amber-950">
                            <a href="#institucion" className="hover:text-[#5C1D82] transition-colors">La Conferencia</a>
                            <a href="#obispos" className="hover:text-[#5C1D82] transition-colors">Episcopado</a>
                            <a href="#comisiones" className="hover:text-[#5C1D82] transition-colors">Comisiones</a>
                            <a href="#actualidad" className="hover:text-[#5C1D82] transition-colors">Actualidad</a>
                            <a href="#documentos" className="hover:text-[#5C1D82] transition-colors">Magisterio</a>
                            <a
                                href="https://mitd.duckdns.org/participa/desarrollador"
                                target="_blank"
                                rel="noreferrer"
                                className="bg-[#5C1D82] text-amber-100 hover:bg-[#481567] px-5 py-2.5 rounded-full font-bold transition shadow-sm hover:shadow"
                            >
                                Sede Electrónica
                            </a>
                        </div>

                        {/* Botón Menú Móvil */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden text-amber-950 p-2 focus:outline-none focus:ring-2 focus:ring-[#5C1D82] rounded-lg"
                            aria-label="Toggle Navigation Menu"
                            aria-expanded={mobileMenuOpen}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {mobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>

                    {/* Menú Móvil */}
                    {mobileMenuOpen && (
                        <div className="lg:hidden bg-white border-b border-amber-900/10 px-6 py-6 flex flex-col gap-4 text-sm font-semibold">
                            <a href="#institucion" onClick={() => setMobileMenuOpen(false)} className="text-amber-950 py-1">La Conferencia</a>
                            <a href="#obispos" onClick={() => setMobileMenuOpen(false)} className="text-amber-950 py-1">Episcopado Paniense</a>
                            <a href="#comisiones" onClick={() => setMobileMenuOpen(false)} className="text-amber-950 py-1">Comisiones Episcopales</a>
                            <a href="#actualidad" onClick={() => setMobileMenuOpen(false)} className="text-amber-950 py-1">Actualidad y Comunicados</a>
                            <a href="#documentos" onClick={() => setMobileMenuOpen(false)} className="text-amber-950 py-1">Documentos y Magisterio</a>
                            <a
                                href="https://mitd.duckdns.org/participa/desarrollador"
                                target="_blank"
                                rel="noreferrer"
                                className="bg-[#5C1D82] text-white text-center py-3 rounded-lg font-bold mt-2"
                            >
                                Acceso a Sede Electrónica
                            </a>
                        </div>
                    )}
                </nav>
            </header>

            {/* ==========================================
                2. HERO SECTION
            ========================================== */}
            <section className="cp-hero-bg pt-44 pb-28 md:pt-52 md:pb-36 min-h-[85vh] flex items-center justify-center text-white relative border-b-4 border-amber-500">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-semibold tracking-widest uppercase mb-8 backdrop-blur-sm">
                        <span>✦ PAX ET VERITAS IN REGNO PANIS ✦</span>
                    </div>

                    <h1 className="cp-cinzel text-4xl sm:text-6xl md:text-7xl font-bold tracking-normal leading-tight text-amber-100 max-w-4xl mx-auto">
                        Iglesia Católica en el Reino del Pan
                    </h1>

                    <p className="cp-serif text-lg sm:text-2xl text-stone-200 font-normal italic max-w-3xl mx-auto mt-6 leading-relaxed">
                        "Unidos en la fe, servidora del pueblo paniense y promotora de la paz, la justicia y la dignidad humana."
                    </p>

                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        <a
                            href="#actualidad"
                            className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-full transition shadow-lg hover:shadow-xl"
                        >
                            Últimas Notas Pastorales
                        </a>
                        <a
                            href="#obispos"
                            className="bg-white/10 hover:bg-white/20 text-amber-100 border border-amber-200/30 font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-full backdrop-blur-sm transition"
                        >
                            Conocer la Asamblea
                        </a>
                    </div>
                </div>
            </section>

            {/* ==========================================
                3. PRESENTACIÓN Y MENSAJE DEL PRESIDENTE
            ========================================== */}
            <section id="institucion" className="py-20 md:py-28 bg-white border-b border-stone-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-5">
                            <div className="bg-[#F8F5EE] border border-amber-900/10 p-8 rounded-2xl relative shadow-md">
                                <div className="absolute -top-4 left-8 bg-[#5C1D82] text-amber-300 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded">
                                    PRESIDENCIA PANDORA
                                </div>
                                <div className="mt-2 text-center">
                                    <div className="w-32 h-32 mx-auto rounded-full bg-stone-300 border-4 border-amber-200 overflow-hidden mb-4 shadow-inner flex items-center justify-center text-stone-500 font-serif">
                                        <span className="text-4xl">✙</span>
                                    </div>
                                    <h3 className="cp-cinzel text-2xl font-bold text-stone-900">
                                        S.E.R. Mons. Mateo de la Cruz
                                    </h3>
                                    <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mt-1">
                                        Arzobispo Primado de la Capital Paniense
                                    </p>
                                    <p className="text-xs text-stone-500 mt-0.5">
                                        Presidente de la Conferencia Pandora (2024–2028)
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-7 space-y-6">
                            <span className="text-xs font-bold text-[#5C1D82] uppercase tracking-widest block">
                                BIENVENIDA INSTITUCIONAL
                            </span>
                            <h2 className="cp-cinzel text-3xl sm:text-4xl font-bold text-stone-900 leading-tight">
                                Servir a la comunión y anunciar el Evangelio en la sociedad paniense
                            </h2>
                            <p className="cp-serif text-stone-700 text-lg leading-relaxed">
                                La <strong className="text-stone-900 font-semibold">Conferencia Pandora</strong> es la institución permanente integrada por los Obispos de las distintas archidiócesis y diócesis del Reino del Pan, en comunión con el Romano Pontífice.
                            </p>
                            <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
                                A través de nuestras comisiones, coordinamos la labor evangelizadora, la acción caritativa y social de Cáritas Paniense, la defensa de la familia y el diálogo respetuoso con las instituciones del Estado para el bien común de todos los ciudadanos.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==========================================
                4. ACTUALIDAD Y MENSAJES PASTORALES
            ========================================== */}
            <section id="actualidad" className="py-20 md:py-28 bg-[#F5F1E8] border-b border-stone-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                        <div>
                            <span className="text-xs font-bold text-[#5C1D82] uppercase tracking-widest block mb-2">
                                COMUNICACIÓN OFICIAL
                            </span>
                            <h2 className="cp-cinzel text-3xl sm:text-4xl font-bold text-stone-900">
                                Actualidad y Magisterio
                            </h2>
                        </div>

                        {/* Pestañas de Filtrado */}
                        <div className="mt-6 md:mt-0 flex gap-2 border-b border-amber-900/20 pb-2 overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('todos')}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'todos' ? 'bg-[#5C1D82] text-white' : 'text-stone-600 hover:text-stone-900'}`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setActiveTab('Nota de Prensa')}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'Nota de Prensa' ? 'bg-[#5C1D82] text-white' : 'text-stone-600 hover:text-stone-900'}`}
                            >
                                Notas de Prensa
                            </button>
                            <button
                                onClick={() => setActiveTab('Carta Pastoral')}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'Carta Pastoral' ? 'bg-[#5C1D82] text-white' : 'text-stone-600 hover:text-stone-900'}`}
                            >
                                Cartas Pastorales
                            </button>
                        </div>
                    </div>

                    {/* Lista de Noticias */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {filteredComunicados.map((item) => (
                            <article key={item.id} className="bg-white p-8 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between text-xs text-stone-500 mb-4">
                                        <span className="font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200/50">
                                            {item.categoria}
                                        </span>
                                        <span>{item.fecha}</span>
                                    </div>
                                    <h3 className="cp-cinzel text-xl font-bold text-stone-900 mb-3 leading-snug">
                                        {item.titulo}
                                    </h3>
                                    <p className="cp-serif text-stone-600 text-sm leading-relaxed">
                                        {item.resumen}
                                    </p>
                                </div>
                                <a
                                    href="#"
                                    className="mt-6 text-xs font-bold text-[#5C1D82] uppercase tracking-wider hover:underline inline-flex items-center gap-1"
                                >
                                    <span>Leer documento completo</span>
                                    <span>→</span>
                                </a>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ==========================================
                5. COMISIONES EPISCOPALES
            ========================================== */}
            <section id="comisiones" className="py-20 md:py-28 bg-white border-b border-stone-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-xs font-bold text-[#5C1D82] uppercase tracking-widest block mb-2">
                            ÓRGANOS DE TRABAJO
                        </span>
                        <h2 className="cp-cinzel text-3xl sm:text-4xl font-bold text-stone-900">
                            Comisiones Episcopales
                        </h2>
                        <p className="cp-serif text-stone-600 mt-4 text-base">
                            Las comisiones estudian y coordinan las áreas pastorales específicas de la Iglesia en el Reino del Pan.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {COMISIONES.map((com, idx) => (
                            <div key={idx} className="p-8 rounded-xl bg-[#FBF9F5] border border-amber-900/10 flex gap-6">
                                <div className="text-amber-800 font-serif text-3xl font-bold shrink-0">
                                    0{idx + 1}
                                </div>
                                <div>
                                    <h3 className="cp-cinzel text-xl font-bold text-stone-900 mb-1">
                                        {com.nombre}
                                    </h3>
                                    <span className="text-xs font-semibold text-amber-800 block mb-3">
                                        Presidente: {com.presidente}
                                    </span>
                                    <p className="text-stone-600 text-sm leading-relaxed">
                                        {com.descripcion}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ==========================================
                6. CÁRITAS PANIENSE / ACCIÓN SOCIAL
            ========================================== */}
            <section className="bg-[#2A173B] text-white py-20 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-8 space-y-6">
                            <span className="bg-amber-400 text-stone-950 font-bold text-[11px] uppercase tracking-widest px-3 py-1 rounded">
                                OBRA SOCIAL PATROCINADA
                            </span>
                            <h2 className="cp-cinzel text-3xl sm:text-5xl font-bold text-amber-100 leading-tight">
                                Cáritas Paniense: El amor que transforma el Reino
                            </h2>
                            <p className="cp-serif text-stone-300 text-lg leading-relaxed">
                                Más de 140 centros parroquiales en todo el Reino del Pan ofrecen apoyo alimentario, acogida a familias vulnerables y programas de empleo sin distinción de credo u origen.
                            </p>
                        </div>

                        <div className="lg:col-span-4 flex flex-col gap-4">
                            <a
                                href="https://mitd.duckdns.org/participa/desarrollador"
                                target="_blank"
                                rel="noreferrer"
                                className="bg-amber-400 hover:bg-amber-500 text-stone-950 font-bold text-center py-4 rounded-xl text-xs uppercase tracking-wider transition shadow-lg"
                            >
                                Colaborar o Hacer Donación
                            </a>
                            <a
                                href="#diocesis"
                                className="bg-white/10 hover:bg-white/20 text-amber-100 text-center py-4 rounded-xl text-xs font-bold uppercase tracking-wider border border-white/20 transition"
                            >
                                Buscar Centro de Ayuda Cercano
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==========================================
                7. FOOTER INSTITUCIONAL
            ========================================== */}
            <footer className="bg-[#190E24] text-stone-400 text-xs py-16 px-6 border-t border-amber-900/30">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
                    <div className="md:col-span-5 space-y-4">
                        <div className="flex items-center gap-3">
                            <img
                                src="/Otros/ConferenciaPandora.png"
                                alt="Logo Conferencia Pandora"
                                className="h-8 w-auto object-contain"
                            />
                            <span className="cp-cinzel text-lg font-bold text-white tracking-wider">
                                CONFERENCIA PANDORA
                            </span>
                        </div>
                        <p className="text-stone-400 leading-relaxed text-xs max-w-sm">
                            Órgano permanente de los Obispos de la Iglesia Católica en el Reino del Pan. Sede Secretaría General: Calle de la Catedral Nº 12, Pantopía.
                        </p>
                    </div>

                    <div className="md:col-span-3 space-y-3">
                        <span className="text-white font-bold uppercase tracking-wider block mb-2">Secciones</span>
                        <a href="#institucion" className="block hover:text-amber-300 transition-colors">Asamblea Plenaria</a>
                        <a href="#obispos" className="block hover:text-amber-300 transition-colors">Diócesis del Reino</a>
                        <a href="#comisiones" className="block hover:text-amber-300 transition-colors">Comisiones Episcopales</a>
                        <a href="#actualidad" className="block hover:text-amber-300 transition-colors">Notas y Documentos</a>
                    </div>

                    <div className="md:col-span-4 space-y-3">
                        <span className="text-white font-bold uppercase tracking-wider block mb-2">Enlaces Oficiales</span>
                        <a href="https://vatican.va" target="_blank" rel="noreferrer" className="block hover:text-amber-300 transition-colors">
                            Santa Sede (Vatican.va) ↗
                        </a>

                        <div className="pt-4 text-stone-500 text-[11px]">
                            © 2026 Conferencia Pandora. Todos los derechos reservados.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}