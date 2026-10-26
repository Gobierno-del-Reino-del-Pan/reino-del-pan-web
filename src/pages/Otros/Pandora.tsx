import React, { useState, useMemo, useEffect } from 'react';

// ==========================================
// TIPOS Y MODELOS DE DATOS
// ==========================================
type TabType = 'todos' | 'Nota de Prensa' | 'Carta Pastoral' | 'Comisión de Educación';

interface Comunicado {
    id: string;
    fecha: string;
    categoria: 'Nota de Prensa' | 'Carta Pastoral' | 'Comisión de Educación';
    titulo: string;
    resumen: string;
    contenidoCompleto: string;
    autor: string;
    tiempoLectura: string;
}

interface Comision {
    nombre: string;
    presidente: string;
    descripcion: string;
    area: string;
}

interface Obispo {
    id: string;
    nombre: string;
    titulo: string;
    sede: string;
    lema: string;
    anioNombramiento: number;
    imagen?: string;
}

interface DocumentoMagisterio {
    id: string;
    titulo: string;
    tipo: 'Constitución Pastoral' | 'Decreto Episcopal' | 'Instrucción Litúrgica' | 'Directriz Escolar';
    fecha: string;
    referencia: string;
    tamanio: string;
}

// ==========================================
// DATOS INSTITUCIONALES ENRIQUECIDOS
// ==========================================
const COMUNICADOS: Comunicado[] = [
    {
        id: 'c-01',
        fecha: '10 de Septiembre, 2026',
        categoria: 'Nota de Prensa',
        titulo: 'Declaración de la Asamblea Plenaria sobre la cohesión social y el servicio a los más vulnerables',
        resumen: 'Los obispos del Estado Paniense reafirman su compromiso con las cáritas diocesanas y apelan a la concordia social en todo el territorio paniense.',
        contenidoCompleto: `Reunidos en la Septuagésima Cuarta Asamblea Plenaria de la Conferencia Pandora en el Palacio Arzobispal de Pantopía, los Obispos de las distintas circunscripciones eclesiásticas del Estado Paniense elevamos nuestra voz común en favor del bien común. 

En un tiempo donde las transformaciones institucionales y económicas demandan mayor fraternidad cívica, exhortamos a los poderes públicos y a la sociedad civil a consolidar las redes de auxilio directo. Cáritas Paniense ha visto incrementada la atención en más de un 18% en los distritos periféricos. Es imperativo que el progreso del Estado se mida por la protección al ciudadano más desfavorecido.

Reafirmamos nuestra total disposición a sostener mesas de diálogo constructivas sin renunciar jamás a la defensa irrestricta de la dignidad de cada persona humana creada a imagen de Dios.`,
        autor: 'Secretaría General del Episcopado',
        tiempoLectura: '4 min'
    },
    {
        id: 'c-02',
        fecha: '2 de Septiembre, 2026',
        categoria: 'Carta Pastoral',
        titulo: 'Exhortación de S.E.R. Mons. Mateo de la Cruz sobre el Jubileo Paniense 2027',
        resumen: 'Orientaciones pastorales e intenciones de oración para la preparación del próximo año jubilar de la Iglesia Paniense.',
        contenidoCompleto: `A los queridos sacerdotes, religiosos y a todo el santo pueblo fiel de Dios en el Estado Paniense:

Nos acercamos con paso firme y corazón esperanzado al Jubileo Nacional Paniense 2027. Este acontecimiento de gracia divina no debe agotarse en festividades exteriores; ha de ser un año propicio para la reconciliación comunitaria, la remisión espiritual de deudas morales y el redescubrimiento de nuestras raíces cristianas en esta tierra.

Se dispone la apertura de la Puerta Santa en la Catedral Primada el primer domingo de Adviento y se conceden indulgencias plenarias bajo las condiciones habituales de confesión, comunión y oración por las intenciones del Romano Pontífice.`,
        autor: 'S.E.R. Mons. Mateo de la Cruz (Presidente)',
        tiempoLectura: '6 min'
    },
    {
        id: 'c-03',
        fecha: '25 de Agosto, 2026',
        categoria: 'Comisión de Educación',
        titulo: 'Mensaje de la Conferencia Pandora al inicio del curso académico y catequético',
        resumen: 'Llamamiento a docentes, familias y catequistas a cultivar la formación humana integral y la esperanza en las aulas.',
        contenidoCompleto: `La educación no es meramente una instrucción técnica ni una transmisión estéril de datos digitales: es el arte supremo de acompañar a la persona hacia la plenitud de su vocación y de su libertad.

Al dar comienzo al nuevo año formativo en las escuelas diocesanas, universidades pontificias y centros parroquiales del Estado Paniense, animamos a los claustros a poner en el epicentro el amor por la verdad, la búsqueda del bien y el cultivo del espíritu frente a la indiferencia contemporánea.`,
        autor: 'Comisión Episcopal de Educación, Juventud y Cultura',
        tiempoLectura: '3 min'
    }
];

const COMISIONES: Comision[] = [
    {
        nombre: 'Doctrina de la Fe y Liturgia',
        presidente: 'S.E.R. Mons. Ignacio de la Espriella',
        descripcion: 'Cuidado de la enseñanza dogmática, la preservación litúrgica del rito paniense y la edición de textos sagrados.',
        area: 'Magisterio & Liturgia'
    },
    {
        nombre: 'Pastoral Social y Cáritas Paniense',
        presidente: 'S.E.R. Mons. Gabriel Ruiz',
        descripcion: 'Coordinación de la red nacional de ayuda asistencial, comedores sociales y atención al migrante en el Estado Paniense.',
        area: 'Acción Caritativa'
    },
    {
        nombre: 'Educación, Juventud y Cultura',
        presidente: 'S.E.R. Mons. Tomás Moro Valls',
        descripcion: 'Supervisión de colegios diocesanos, universidades católicas y patrimonio histórico-artístico eclesial.',
        area: 'Formativa & Cultural'
    },
    {
        nombre: 'Clero, Vida Consagrada y Vocaciones',
        presidente: 'S.E.R. Mons. Santiago de Pania',
        descripcion: 'Acompañamiento a los seminarios mayores, ordenaciones sacerdotales y comunidades monásticas del país.',
        area: 'Eclesial & Vocacional'
    }
];

const OBISPOS_PANIENSES: Obispo[] = [
    {
        id: 'ob-01',
        nombre: 'S.E.R. Mons. Mateo de la Cruz',
        titulo: 'Arzobispo Primado y Presidente de la Conferencia',
        sede: 'Archidiócesis Primada de Pantopía',
        lema: '"In Caritate et Veritate"',
        anioNombramiento: 2019
    },
    {
        id: 'ob-02',
        nombre: 'S.E.R. Mons. Ignacio de la Espriella',
        titulo: 'Obispo Diocesano & Vicepresidente',
        sede: 'Diócesis de San Marcos de Pania',
        lema: '"Fides Quaerens Intellectum"',
        anioNombramiento: 2021
    },
    {
        id: 'ob-03',
        nombre: 'S.E.R. Mons. Gabriel Ruiz',
        titulo: 'Obispo de las Tierras Costeras',
        sede: 'Diócesis de Puerto Paniense y del Mar',
        lema: '"Servire Populo Dei"',
        anioNombramiento: 2018
    },
    {
        id: 'ob-04',
        nombre: 'S.E.R. Mons. Tomás Moro Valls',
        titulo: 'Obispo de los Valles Centrales',
        sede: 'Diócesis de Santa Clara de Pania',
        lema: '"Lux in Tenebris Lucet"',
        anioNombramiento: 2023
    }
];

const DOCUMENTOS_OFICIALES: DocumentoMagisterio[] = [
    {
        id: 'doc-01',
        titulo: 'Directorio Pastoral de Sacramentos en el Rito Paniense',
        tipo: 'Instrucción Litúrgica',
        fecha: 'Junio 2026',
        referencia: 'CP-LIT-2026/04',
        tamanio: '1.8 MB'
    },
    {
        id: 'doc-02',
        titulo: 'Decreto General sobre la Administración Transparente de Bienes Diocesanos',
        tipo: 'Decreto Episcopal',
        fecha: 'Mayo 2026',
        referencia: 'CP-DEC-2026/12',
        tamanio: '840 KB'
    },
    {
        id: 'doc-03',
        titulo: 'Ideario Pedagógico para los Centros Educativos de la Iglesia Paniense',
        tipo: 'Directriz Escolar',
        fecha: 'Enero 2026',
        referencia: 'CP-EDU-2026/01',
        tamanio: '3.2 MB'
    },
    {
        id: 'doc-04',
        titulo: 'Estatuto Refundado de la Conferencia Episcopal Pandora',
        tipo: 'Constitución Pastoral',
        fecha: 'Noviembre 2025',
        referencia: 'CP-CONST-2025/08',
        tamanio: '2.4 MB'
    }
];

// ==========================================
// ESTILOS CRISTAL LÍQUIDO (LIQUID GLASS)
// ==========================================
const liquidGlassStyles = `
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

    /* Fondo Líquido con destellos irisados */
    .liquid-mesh-bg {
      background: radial-gradient(circle at 15% 20%, rgba(92, 29, 130, 0.08) 0%, transparent 40%),
                  radial-gradient(circle at 85% 75%, rgba(212, 175, 55, 0.09) 0%, transparent 45%),
                  radial-gradient(circle at 50% 50%, rgba(42, 23, 59, 0.04) 0%, transparent 60%),
                  #FBF9F5;
    }

    /* Tarjeta de Cristal Líquido Superior */
    .liquid-glass-card {
      background: rgba(255, 255, 255, 0.65);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-top: 1px solid rgba(255, 255, 255, 0.95);
      border-left: 1px solid rgba(255, 255, 255, 0.8);
      border-right: 1px solid rgba(92, 29, 130, 0.08);
      border-bottom: 1px solid rgba(92, 29, 130, 0.12);
      box-shadow: 0 20px 40px -15px rgba(42, 23, 59, 0.07),
                  0 0 1px 1px rgba(255, 255, 255, 0.6) inset;
      transition: all 350ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    .liquid-glass-card:hover {
      background: rgba(255, 255, 255, 0.85);
      transform: translateY(-4px);
      box-shadow: 0 28px 50px -12px rgba(92, 29, 130, 0.14),
                  0 0 0 1px rgba(212, 175, 55, 0.35) inset;
    }

    /* Cristal Líquido Modo Oscuro */
    .liquid-glass-dark {
      background: rgba(28, 16, 42, 0.72);
      backdrop-filter: blur(24px) saturate(190%);
      -webkit-backdrop-filter: blur(24px) saturate(190%);
      border-top: 1px solid rgba(255, 255, 255, 0.22);
      border-left: 1px solid rgba(255, 255, 255, 0.15);
      border-right: 1px solid rgba(0, 0, 0, 0.3);
      border-bottom: 1px solid rgba(0, 0, 0, 0.4);
      box-shadow: 0 25px 60px rgba(10, 5, 18, 0.45),
                  0 0 0 1px rgba(212, 175, 55, 0.15) inset;
    }

    /* Píldora de Cristal Líquido */
    .liquid-pill {
      background: rgba(255, 255, 255, 0.75);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.8);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03), inset 0 1px 2px rgba(255, 255, 255, 0.9);
    }

    /* Hero con efecto de vidrio flotante */
    .cp-hero-liquid {
      background: linear-gradient(175deg, rgba(22, 12, 34, 0.78) 0%, rgba(20, 15, 30, 0.92) 100%), 
                  url('https://images.unsplash.com/photo-1548625149-fc4a29cf7092?q=80&w=2000&auto=format&fit=crop');
      background-size: cover;
      background-position: center;
      background-attachment: fixed;
    }

    /* Animaciones sutiles de orbes líquidos */
    @keyframes liquidFloat {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-12px) scale(1.03); }
    }

    .liquid-orb-1 {
      animation: liquidFloat 8s ease-in-out infinite;
    }
    .liquid-orb-2 {
      animation: liquidFloat 11s ease-in-out infinite reverse;
    }
`;

export default function ConferenciaPandora() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [modalComunicado, setModalComunicado] = useState<Comunicado | null>(null);
    const [scrolled, setScrolled] = useState(false);

    // Detección de scroll para refinar navbar de cristal
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 30) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Filtrar comunicados dinámicamente con búsqueda y categoría
    const filteredComunicados = useMemo(() => {
        return COMUNICADOS.filter(item => {
            const coincideCategoria = activeTab === 'todos' || item.categoria === activeTab;
            const coincideTexto = item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.resumen.toLowerCase().includes(searchTerm.toLowerCase());
            return coincideCategoria && coincideTexto;
        });
    }, [activeTab, searchTerm]);

    return (
        <div className="cp-scope liquid-mesh-bg text-amber-950 min-h-screen antialiased selection:bg-[#5C1D82] selection:text-white relative overflow-x-hidden">
            <style dangerouslySetInnerHTML={{ __html: liquidGlassStyles }} />

            {/* Orbes traseros para refracción del cristal líquido */}
            <div className="fixed top-24 left-[-8rem] w-96 h-96 bg-[#5C1D82]/10 rounded-full blur-3xl pointer-events-none liquid-orb-1 -z-10" />
            <div className="fixed bottom-24 right-[-8rem] w-[32rem] h-[32rem] bg-amber-400/10 rounded-full blur-3xl pointer-events-none liquid-orb-2 -z-10" />

            {/* ==========================================
                1. HEADER Y BARRA DE NAVEGACIÓN CRISTALINA
            ========================================== */}
            <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
                {/* Franja Superior */}
                <div className="bg-[#2A173B]/90 backdrop-blur-md text-amber-100/90 py-1.5 px-4 text-[11px] md:text-xs border-b border-white/10">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                            </span>
                            <span className="font-medium tracking-wide">Portal Oficial de la Conferencia Episcopal · Estado Paniense</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-6 text-[11px]">
                            <a href="https://vatican.va" target="_blank" rel="noreferrer" className="hover:text-amber-300 transition-colors">
                                Santa Sede (Vaticano) ↗
                            </a>
                            <span className="text-white/20">|</span>
                            <a href="#diocesis" className="hover:text-amber-300 transition-colors">
                                Guía Diocesana
                            </a>
                            <span className="text-white/20">|</span>
                            <a href="#documentos" className="hover:text-amber-300 transition-colors">
                                Biblioteca Magisterio
                            </a>
                        </div>
                    </div>
                </div>

                {/* Navbar Principal Cristal Líquido */}
                <nav className={`transition-all duration-300 ${scrolled
                    ? 'bg-white/80 backdrop-blur-xl border-b border-white/40 shadow-[0_10px_30px_rgba(42,23,59,0.08)] py-2'
                    : 'bg-white/90 backdrop-blur-lg border-b border-amber-900/10 py-3'
                    }`}>
                    <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

                        {/* Logo */}
                        <a href="#" className="flex items-center gap-3.5 group focus:outline-none">
                            <div className="p-1.5 rounded-xl bg-gradient-to-br from-white/90 to-amber-100/60 border border-white/90 shadow-sm transition-transform group-hover:scale-105">
                                <img
                                    src="/Otros/ConferenciaPandora.png"
                                    alt="Logo Conferencia Pandora"
                                    className="h-9 w-auto object-contain"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="cp-cinzel text-lg md:text-xl font-black text-[#2A173B] leading-tight tracking-wider">
                                    CONFERENCIA PANDORA
                                </span>
                                <span className="text-[9px] md:text-[10px] text-amber-900/80 uppercase tracking-widest font-semibold">
                                    Iglesia Católica en el Estado Paniense
                                </span>
                            </div>
                        </a>

                        {/* Menú Desktop */}
                        <div className="hidden lg:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-amber-950/80">
                            <a href="#institucion" className="hover:text-[#5C1D82] transition-colors">La Conferencia</a>
                            <a href="#obispos" className="hover:text-[#5C1D82] transition-colors">Episcopado</a>
                            <a href="#diocesis" className="hover:text-[#5C1D82] transition-colors">Diócesis</a>
                            <a href="#comisiones" className="hover:text-[#5C1D82] transition-colors">Comisiones</a>
                            <a href="#actualidad" className="hover:text-[#5C1D82] transition-colors">Actualidad</a>
                            <a href="#documentos" className="hover:text-[#5C1D82] transition-colors">Magisterio</a>
                            <a
                                href="https://mitd.duckdns.org/participa/desarrollador"
                                target="_blank"
                                rel="noreferrer"
                                className="relative overflow-hidden group bg-gradient-to-r from-[#5C1D82] to-[#7423a6] text-amber-100 px-5 py-2.5 rounded-full font-bold transition shadow-md hover:shadow-lg hover:brightness-110 border border-white/20"
                            >
                                <span className="relative z-10 flex items-center gap-1.5">
                                    <span>Sede Electrónica</span>
                                    <span className="text-[10px]">↗</span>
                                </span>
                                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            </a>
                        </div>

                        {/* Botón Menú Móvil */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden text-amber-950 p-2.5 focus:outline-none focus:ring-2 focus:ring-[#5C1D82] rounded-xl liquid-pill"
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

                    {/* Menú Móvil Cristalino */}
                    {mobileMenuOpen && (
                        <div className="lg:hidden bg-white/95 backdrop-blur-2xl border-b border-amber-900/10 px-6 py-6 flex flex-col gap-4 text-sm font-semibold shadow-2xl">
                            <a href="#institucion" onClick={() => setMobileMenuOpen(false)} className="text-amber-950 py-1 hover:text-[#5C1D82]">La Conferencia</a>
                            <a href="#obispos" onClick={() => setMobileMenuOpen(false)} className="text-amber-950 py-1 hover:text-[#5C1D82]">Episcopado Paniense</a>
                            <a href="#diocesis" onClick={() => setMobileMenuOpen(false)} className="text-amber-950 py-1 hover:text-[#5C1D82]">Guía Diocesana</a>
                            <a href="#comisiones" onClick={() => setMobileMenuOpen(false)} className="text-amber-950 py-1 hover:text-[#5C1D82]">Comisiones Episcopales</a>
                            <a href="#actualidad" onClick={() => setMobileMenuOpen(false)} className="text-amber-950 py-1 hover:text-[#5C1D82]">Actualidad y Comunicados</a>
                            <a href="#documentos" onClick={() => setMobileMenuOpen(false)} className="text-amber-950 py-1 hover:text-[#5C1D82]">Documentos y Magisterio</a>
                            <a
                                href="https://mitd.duckdns.org/participa/desarrollador"
                                target="_blank"
                                rel="noreferrer"
                                className="bg-[#5C1D82] text-white text-center py-3 rounded-xl font-bold mt-2 shadow-lg"
                            >
                                Acceso a Sede Electrónica
                            </a>
                        </div>
                    )}
                </nav>
            </header>

            {/* ==========================================
                2. HERO CRISTAL LÍQUIDO
            ========================================== */}
            <section className="cp-hero-liquid pt-44 pb-28 md:pt-52 md:pb-36 min-h-[90vh] flex items-center justify-center text-white relative border-b-2 border-amber-400/40">
                <div className="max-w-5xl mx-auto px-6 text-center relative z-10">

                    {/* Badge Vidriada */}
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/30 text-amber-200 text-[11px] font-bold tracking-widest uppercase mb-8 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                        <span className="text-amber-400">✦</span>
                        <span>PAX ET VERITAS IN REGNO PANIS</span>
                        <span className="text-amber-400">✦</span>
                    </div>

                    <h1 className="cp-cinzel text-4xl sm:text-6xl md:text-7xl font-bold tracking-normal leading-tight text-amber-100 max-w-4xl mx-auto drop-shadow-md">
                        Iglesia Católica en el Estado Paniense
                    </h1>

                    <p className="cp-serif text-lg sm:text-2xl text-stone-200 font-normal italic max-w-3xl mx-auto mt-6 leading-relaxed drop-shadow-sm">
                        "Unidos en la fe, servidora del pueblo paniense y promotora de la paz, la justicia y la dignidad humana."
                    </p>

                    {/* Botonera de Acción */}
                    <div className="mt-12 flex flex-wrap justify-center gap-4">
                        <a
                            href="#actualidad"
                            className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-extrabold text-xs uppercase tracking-wider px-8 py-4 rounded-full transition duration-300 shadow-[0_10px_25px_rgba(217,119,6,0.35)] hover:shadow-[0_15px_30px_rgba(217,119,6,0.45)] hover:scale-[1.02]"
                        >
                            Últimas Notas Pastorales
                        </a>
                        <a
                            href="#obispos"
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/40 font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-full backdrop-blur-md transition duration-300 shadow-md hover:scale-[1.02]"
                        >
                            Conocer la Asamblea
                        </a>
                        <a
                            href="#documentos"
                            className="bg-[#2A173B]/70 hover:bg-[#2A173B] text-amber-200 border border-amber-300/30 font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-full backdrop-blur-md transition duration-300 shadow-md hover:scale-[1.02]"
                        >
                            Biblioteca y Decretos
                        </a>
                    </div>
                </div>

                {/* Reflejo inferior degradado */}
                <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#FBF9F5] to-transparent pointer-events-none" />
            </section>

            {/* ==========================================
                3. BIENVENIDA Y PRESIDENCIA (CRISTAL LÍQUIDO)
            ========================================== */}
            <section id="institucion" className="py-24 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                        {/* Tarjeta de Presidencia */}
                        <div className="lg:col-span-5">
                            <div className="liquid-glass-card p-9 rounded-3xl relative">
                                <div className="absolute -top-3.5 left-8 bg-gradient-to-r from-[#5C1D82] to-[#7423a6] text-amber-300 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md border border-white/20">
                                    PRESIDENCIA PANDORA
                                </div>
                                <div className="mt-3 text-center">
                                    <div className="relative w-36 h-36 mx-auto mb-5">
                                        <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-100 to-amber-200 border-4 border-white shadow-xl flex items-center justify-center text-[#5C1D82] font-serif">
                                            <span className="text-5xl drop-shadow">✙</span>
                                        </div>
                                        <span className="absolute bottom-1 right-2 bg-amber-400 text-stone-900 text-xs px-2 py-0.5 rounded-full font-bold border border-white">
                                            Primado
                                        </span>
                                    </div>
                                    <h3 className="cp-cinzel text-2xl font-bold text-stone-900 leading-snug">
                                        S.E.R. Mons. Mateo de la Cruz
                                    </h3>
                                    <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mt-1.5">
                                        Arzobispo Primado de la Capital Paniense
                                    </p>
                                    <p className="text-xs text-stone-500 mt-1">
                                        Presidente de la Conferencia Pandora (Período 2024–2028)
                                    </p>

                                    <div className="mt-6 pt-6 border-t border-amber-900/10 flex justify-center gap-6 text-xs text-stone-600">
                                        <div>
                                            <span className="block font-bold text-stone-900">Pantopía</span>
                                            <span className="text-[10px] text-stone-500">Sede Primada</span>
                                        </div>
                                        <div className="w-px h-8 bg-amber-900/10" />
                                        <div>
                                            <span className="block font-bold text-stone-900">In Caritate</span>
                                            <span className="text-[10px] text-stone-500">Lema Episcopal</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Texto Institucional */}
                        <div className="lg:col-span-7 space-y-6">
                            <span className="text-xs font-extrabold text-[#5C1D82] uppercase tracking-widest inline-block px-3 py-1 rounded-md bg-[#5C1D82]/10 border border-[#5C1D82]/20">
                                BIENVENIDA INSTITUCIONAL
                            </span>
                            <h2 className="cp-cinzel text-3xl sm:text-4xl font-bold text-stone-900 leading-tight">
                                Servir a la comunión y anunciar el Evangelio en la sociedad paniense
                            </h2>
                            <p className="cp-serif text-stone-700 text-lg leading-relaxed">
                                La <strong className="text-stone-900 font-semibold">Conferencia Pandora</strong> es la institución permanente integrada por los Obispos de las distintas archidiócesis y diócesis del Estado Paniense, en comunión con el Romano Pontífice y la Santa Sede.
                            </p>
                            <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
                                A través de nuestras comisiones, coordinamos la labor evangelizadora, la acción caritativa y social de Cáritas Paniense, la defensa inquebrantable de la familia, el patrimonio sacro y el diálogo respetuoso con las instituciones públicas y cívicas para la construcción de una paz duradera.
                            </p>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
                                <div className="liquid-glass-card p-4 rounded-2xl text-center">
                                    <span className="block cp-cinzel text-2xl font-bold text-[#5C1D82]">4</span>
                                    <span className="text-xs text-stone-600 font-medium">Circunscripciones</span>
                                </div>
                                <div className="liquid-glass-card p-4 rounded-2xl text-center">
                                    <span className="block cp-cinzel text-2xl font-bold text-[#5C1D82]">140+</span>
                                    <span className="text-xs text-stone-600 font-medium">Parroquias Activas</span>
                                </div>
                                <div className="liquid-glass-card p-4 rounded-2xl text-center col-span-2 sm:col-span-1">
                                    <span className="block cp-cinzel text-2xl font-bold text-[#5C1D82]">100%</span>
                                    <span className="text-xs text-stone-600 font-medium">Compromiso Solidario</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ==========================================
                4. EL EPISCOPADO PANIENSE (#obispos)
            ========================================== */}
            <section id="obispos" className="py-24 relative bg-gradient-to-b from-transparent via-white/50 to-transparent">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-xs font-bold text-[#5C1D82] uppercase tracking-widest block mb-2">
                            COLEGIO DE PASTORES
                        </span>
                        <h2 className="cp-cinzel text-3xl sm:text-4xl font-bold text-stone-900">
                            Episcopado del Estado Paniense
                        </h2>
                        <p className="cp-serif text-stone-600 mt-4 text-base">
                            Sucesores de los Apóstoles al servicio de las comunidades diocesanas y guardianes de la fe en la nación paniense.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {OBISPOS_PANIENSES.map((obispo) => (
                            <div key={obispo.id} className="liquid-glass-card p-6 rounded-2xl flex flex-col justify-between text-center relative group">
                                <div>
                                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-[#5C1D82]/20 to-amber-200/50 border border-white shadow-md flex items-center justify-center text-[#5C1D82] text-2xl mb-4 group-hover:scale-105 transition-transform">
                                        <span>✙</span>
                                    </div>
                                    <h3 className="cp-cinzel text-lg font-bold text-stone-900 leading-tight">
                                        {obispo.nombre}
                                    </h3>
                                    <p className="text-xs font-semibold text-amber-800 mt-1">
                                        {obispo.titulo}
                                    </p>
                                    <p className="text-xs text-stone-500 mt-2">
                                        {obispo.sede}
                                    </p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-amber-900/10">
                                    <span className="text-[11px] font-serif italic text-stone-600 block">
                                        {obispo.lema}
                                    </span>
                                    <span className="text-[10px] text-stone-400 mt-1 block">
                                        Consagrado en {obispo.anioNombramiento}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ==========================================
                5. GUÍA DIOCESANA (#diocesis)
            ========================================== */}
            <section id="diocesis" className="py-24 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="liquid-glass-card p-8 md:p-12 rounded-3xl border border-white/80">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                            <div className="lg:col-span-5 space-y-4">
                                <span className="text-xs font-bold text-[#5C1D82] uppercase tracking-widest block">
                                    TERRITORIO ECLESIÁSTICO
                                </span>
                                <h2 className="cp-cinzel text-3xl font-bold text-stone-900 leading-snug">
                                    Guía y Mapa de las Diócesis Panienses
                                </h2>
                                <p className="text-sm text-stone-600 leading-relaxed">
                                    El territorio del Estado Paniense se organiza pastoralmente en una sede metropolitana primada y tres diócesis sufragáneas, asegurando la atención espiritual y social en cada rincón del país.
                                </p>
                            </div>

                            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-5 rounded-2xl bg-white/70 border border-white/90 shadow-sm">
                                    <h4 className="font-bold text-[#2A173B] text-sm">Archidiócesis Primada de Pantopía</h4>
                                    <p className="text-xs text-stone-500 mt-1">Sede Central: Catedral Metropolitana. 58 parroquias y centros de acogida.</p>
                                </div>
                                <div className="p-5 rounded-2xl bg-white/70 border border-white/90 shadow-sm">
                                    <h4 className="font-bold text-[#2A173B] text-sm">Diócesis de San Marcos</h4>
                                    <p className="text-xs text-stone-500 mt-1">Sede Central: Basílica de San Marcos. 32 parroquias y santuarios marianos.</p>
                                </div>
                                <div className="p-5 rounded-2xl bg-white/70 border border-white/90 shadow-sm">
                                    <h4 className="font-bold text-[#2A173B] text-sm">Diócesis de Puerto Paniense</h4>
                                    <p className="text-xs text-stone-500 mt-1">Sede Central: Santuario del Stella Maris. Atención especial a pescadores y marinos.</p>
                                </div>
                                <div className="p-5 rounded-2xl bg-white/70 border border-white/90 shadow-sm">
                                    <h4 className="font-bold text-[#2A173B] text-sm">Diócesis de Santa Clara</h4>
                                    <p className="text-xs text-stone-500 mt-1">Sede Central: Colegiata de Santa Clara. Red de colegios diocesanos y orfanatos.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==========================================
                6. ACTUALIDAD Y MENSAJES PASTORALES (CON FILTRADO Y BUSCADOR)
            ========================================== */}
            <section id="actualidad" className="py-24 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                        <div>
                            <span className="text-xs font-bold text-[#5C1D82] uppercase tracking-widest block mb-2">
                                COMUNICACIÓN Y MAGISTERIO VIVO
                            </span>
                            <h2 className="cp-cinzel text-3xl sm:text-4xl font-bold text-stone-900">
                                Actualidad y Notas de Prensa
                            </h2>
                        </div>

                        {/* Buscador de Noticias */}
                        <div className="w-full md:w-72">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar comunicados..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl liquid-pill border border-white/80 focus:outline-none focus:ring-2 focus:ring-[#5C1D82] text-stone-800 placeholder-stone-400"
                                />
                                <svg className="w-4 h-4 text-stone-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Filtros Píldora Cristal Líquido */}
                    <div className="flex gap-2 pb-6 overflow-x-auto scrollbar-none">
                        {(['todos', 'Nota de Prensa', 'Carta Pastoral', 'Comisión de Educación'] as TabType[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2.5 text-xs font-bold rounded-full transition-all duration-300 whitespace-nowrap ${activeTab === tab
                                    ? 'bg-[#5C1D82] text-amber-100 shadow-md scale-105 border border-white/30'
                                    : 'liquid-pill text-stone-600 hover:text-stone-900 hover:bg-white/90'
                                    }`}
                            >
                                {tab === 'todos' ? 'Todos los Comunicados' : tab}
                            </button>
                        ))}
                    </div>

                    {/* Lista de Noticias en Cristal Líquido */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {filteredComunicados.length > 0 ? (
                            filteredComunicados.map((item) => (
                                <article key={item.id} className="liquid-glass-card p-8 rounded-2xl flex flex-col justify-between group">
                                    <div>
                                        <div className="flex items-center justify-between text-xs text-stone-500 mb-4">
                                            <span className="font-semibold text-amber-900 bg-amber-100/70 px-2.5 py-1 rounded-full border border-amber-300/40">
                                                {item.categoria}
                                            </span>
                                            <span>{item.fecha}</span>
                                        </div>
                                        <h3 className="cp-cinzel text-xl font-bold text-stone-900 mb-3 leading-snug group-hover:text-[#5C1D82] transition-colors">
                                            {item.titulo}
                                        </h3>
                                        <p className="cp-serif text-stone-600 text-sm leading-relaxed">
                                            {item.resumen}
                                        </p>
                                    </div>
                                    <div className="mt-8 pt-4 border-t border-amber-900/10 flex items-center justify-between">
                                        <span className="text-[11px] text-stone-400 font-medium">Lectura: {item.tiempoLectura}</span>
                                        <button
                                            onClick={() => setModalComunicado(item)}
                                            className="text-xs font-bold text-[#5C1D82] uppercase tracking-wider hover:underline inline-flex items-center gap-1.5 focus:outline-none"
                                        >
                                            <span>Leer íntegro</span>
                                            <span className="text-sm">→</span>
                                        </button>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-16 liquid-glass-card rounded-2xl">
                                <p className="text-stone-500 font-serif">No se encontraron comunicados con el criterio de búsqueda.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ==========================================
                7. COMISIONES EPISCOPALES
            ========================================== */}
            <section id="comisiones" className="py-24 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-xs font-bold text-[#5C1D82] uppercase tracking-widest block mb-2">
                            ÓRGANOS PASTORALES PERMANENTES
                        </span>
                        <h2 className="cp-cinzel text-3xl sm:text-4xl font-bold text-stone-900">
                            Comisiones Episcopales
                        </h2>
                        <p className="cp-serif text-stone-600 mt-4 text-base">
                            Las comisiones estudian, dictaminan y coordinan las áreas pastorales específicas de la Iglesia en todo el territorio paniense.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {COMISIONES.map((com, idx) => (
                            <div key={idx} className="liquid-glass-card p-8 rounded-2xl flex gap-6 items-start">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5C1D82] to-[#3a0f55] text-amber-200 font-serif text-xl font-bold flex items-center justify-center shrink-0 shadow-md border border-white/20">
                                    0{idx + 1}
                                </div>
                                <div className="space-y-1">
                                    <div className="inline-block text-[10px] uppercase tracking-widest font-bold text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded-full mb-1">
                                        {com.area}
                                    </div>
                                    <h3 className="cp-cinzel text-xl font-bold text-stone-900">
                                        {com.nombre}
                                    </h3>
                                    <span className="text-xs font-semibold text-amber-800 block pb-2">
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
        </div>
    );
}