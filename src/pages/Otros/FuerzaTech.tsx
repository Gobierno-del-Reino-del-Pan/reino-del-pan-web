import React, { useState } from 'react';

export default function FuerzaTechPaniense() {
    const [activeAgency, setActiveAgency] = useState<number | null>(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [applyModalOpen, setApplyModalOpen] = useState(false);

    // Estilos tipográficos y utilidades personalizadas de Tech Force
    const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');

    .tf-scope {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    .tf-mono {
      font-family: 'JetBrains Mono', monospace;
    }

    /* Imagen de fondo satelital nocturna estilo Tech Force Hero */
    .tf-hero-bg {
      background-image: linear-gradient(180deg, rgba(10, 10, 10, 0.65) 0%, rgba(10, 10, 10, 0.95) 80%, #0A0A0A 100%), 
                        url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2069&auto=format&fit=crop');
      background-size: cover;
      background-position: center;
    }

    .tf-[#FF4D00] {
      color: #FF4D00;
    }
    
    .tf-bg-[#FF4D00] {
      background-color: #FF4D00;
    }
  `;

    // Datos de Ministerios / Áreas de Impacto
    const agencies = [
        {
            id: 'm-hacienda',
            code: 'MIN-HAC-01',
            title: 'Ministerio de Hacienda y Finanzas Públicas',
            summary: 'Administración de la infraestructura financiera crítica y sistemas fiscales del Reino.',
            description: 'Los ingenieros destinados a Hacienda reconstruirán las pasarelas de tributación pública, optimizarán la detección de fraude mediante analítica predictiva de datos en tiempo real y desarrollarán APIs de conciliación bancaria estatal con cifrado cuántico.',
            roles: ['Senior Backend Engineer (Go / Rust)', 'Data Architect', 'Distributed Systems Specialist'],
            impact: 'Procesamiento de más de 4.000 millones de monedas panienses en transacciones anuales.'
        },
        {
            id: 'm-defensa',
            code: 'MIN-DEF-02',
            title: 'Ministerio de Ciberdefensa y Transformación',
            summary: 'Protección de la soberanía digital e infraestructuras críticas nacionales.',
            description: 'Unidad de respuesta rápida ante ciberamenazas estatales. Desarrollo de defensas Zero-Trust, auditoría de firmware para telecomunicaciones públicas y fortificación de los servidores centrales de la Red Paniense.',
            roles: ['Cybersecurity Threat Hunter', 'Infrastructure DevSecOps', 'Kernel & Low-Level Engineer'],
            impact: 'Protección de 120+ entidades gubernamentales conectadas a la red cibernética.'
        },
        {
            id: 'm-presidencia',
            code: 'MIN-PRE-03',
            title: 'Presidencia y Sede Electrónica Única',
            summary: 'Plataforma unificada de servicios e identidad digital para el ciudadano.',
            description: 'Creación de la nueva identidad digital unificada PanID, simplificando trámites como empadronamiento, licencias y ayudas públicas a menos de 3 clics con estándar de accesibilidad AAA.',
            roles: ['Principal Frontend Engineer (React/Next.js)', 'UX Research Lead', 'Accessibility Systems Lead'],
            impact: 'Atención a más de 2.5 millones de usuarios con latencias inferiores a 50ms.'
        },
        {
            id: 'm-fomento',
            code: 'MIN-FOM-04',
            title: 'Ministerio de Fomento e Infraestructura Geográfica',
            summary: 'Sistemas cartográficos, sensores IoT urbanos y logística de movilidad.',
            description: 'Implementación de plataformas GeoJSON masivas para el trazado de obras públicas, gestión en tiempo real del transporte interurbano e integración de datos geoespaciales con satélites de monitoreo agrícola.',
            roles: ['GIS Software Engineer', 'IoT Stream Pipelines Specialist', 'Full-Stack Spatial Developer'],
            impact: 'Cobertura del 100% del territorio del Reino del Pan en la malla digital.'
        }
    ];

    // Preguntas frecuentes
    const faqs = [
        {
            q: '¿Qué es el programa Fuerza Tech Paniense?',
            a: 'Es una unidad de élite civil patrocinada por la Corona y el Gobierno del Reino del Pan que recluta a los mejores ingenieros, diseñadores y analistas de datos para resolver los desafíos tecnológicos más complejos del sector público durante una estancia estratégica de 2 años.'
        },
        {
            q: '¿Cuál es la duración del compromiso y qué ocurre al finalizar?',
            a: 'El programa principal dura 24 meses. Al completar el periodo, los participantes pueden optar por convertirse en funcionarios de carrera de la escala técnica del Estado, renovar su plaza de liderazgo o dar el salto a empresas tecnológicas aliadas de primer nivel.'
        },
        {
            q: '¿Puedo trabajar de forma remota o híbrida?',
            a: 'La mayoría de los proyectos permiten trabajo 100% remoto dentro del Reino del Pan o formato híbrido con estancias en la sede ministerial en la Capital Paniense o laboratorios regionales.'
        },
        {
            q: '¿Cuáles son los requisitos mínimos de elegibilidad?',
            a: 'Tener nacionalidad paniense o permiso de residencia de larga duración, experiencia acreditada en desarrollo de software, ciberseguridad o producto digital (de 2 a 8+ años según el rango) y superar la evaluación técnica de código y arquitectura.'
        }
    ];

    return (
        <div className="tf-scope min-h-screen bg-[#0A0A0A] text-white antialiased selection:bg-[#FF4D00] selection:text-black">
            <style dangerouslySetInnerHTML={{ __html: customStyles }} />

            {/* ==========================================
          HEADER FIXED (ALERTA GUBERNAMENTAL + NAVBAR)
      ========================================== */}
            <header className="fixed top-0 left-0 right-0 z-50">

                {/* 1. ALERTA / FRANJA DE WEB OFICIAL DEL GOBIERNO */}
                <div className="bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 py-2 px-4 text-[10px] md:text-xs text-zinc-400 tf-mono">
                    <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 md:gap-3 text-center">
                        <img
                            src="/flag.png"
                            alt="Bandera del Reino del Pan"
                            className="h-3 w-4 opacity-90 object-contain shrink-0"
                        />
                        <span className="font-semibold tracking-wider uppercase leading-tight">
                            Web oficial del Gobierno del Reino del Pan · Ministerio de Transformación Digital.
                        </span>
                    </div>
                </div>

                {/* 2. NAVBAR PRINCIPAL CON LOGO PANTECH */}
                <nav className="bg-[#0A0A0A]/80 backdrop-blur-md border-b border-zinc-800/60">
                    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

                        {/* Logo de la app (PanTech.png) */}
                        <a href="#" className="flex items-center gap-3 group">
                            <img
                                src="/Otros/PanTech.png"
                                alt="PanTech Logo"
                                className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
                            />
                        </a>

                        {/* Nav Links Desktop */}
                        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                            <a href="#programa" className="text-zinc-300 hover:text-white transition">El Programa</a>
                            <a href="#requisitos" className="text-zinc-300 hover:text-white transition">Requisitos</a>
                            <a href="#faq" className="text-zinc-300 hover:text-white transition">FAQ</a>
                            <a
                                href="https://x.com"
                                target="_blank"
                                rel="noreferrer"
                                className="text-zinc-400 hover:text-white transition text-xs tf-mono flex items-center gap-1.5 border border-zinc-800 px-3 py-1.5 rounded-full"
                            >
                                <span>Síguenos en X</span>
                                <span className="text-[10px]">↗</span>
                            </a>
                            <button
                                onClick={() => setApplyModalOpen(true)}
                                className="bg-white text-black font-semibold px-5 py-2.5 rounded-full text-xs uppercase tracking-wider hover:bg-[#FF4D00] hover:text-white transition-all transform hover:scale-105"
                            >
                                Postular ahora
                            </button>
                        </div>

                        {/* Toggle Menú Móvil */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden text-zinc-300 hover:text-white p-2"
                            aria-label="Abrir menú"
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

                    {/* Menú Desplegable Móvil */}
                    {mobileMenuOpen && (
                        <div className="md:hidden bg-[#0A0A0A] border-b border-zinc-800 px-6 py-6 flex flex-col gap-5">
                            <a href="#programa" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-zinc-200">El Programa</a>
                            <a href="#requisitos" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-zinc-200">Requisitos</a>
                            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-zinc-200">Preguntas Frecuentes</a>
                            <button
                                onClick={() => { setMobileMenuOpen(false); setApplyModalOpen(true); }}
                                className="bg-[#FF4D00] text-white font-bold py-3 rounded-lg uppercase tracking-wider text-sm"
                            >
                                Postular ahora
                            </button>
                        </div>
                    )}
                </nav>
            </header>

            {/* ==========================================
          2. HERO SECTION (Vista Satelital Nocturna + Título Gigante)
      ========================================== */}
            <section className="tf-hero-bg pt-44 pb-24 md:pt-56 md:pb-36 min-h-screen flex flex-col justify-between border-b border-zinc-800/80 relative">
                <div className="max-w-7xl mx-auto px-6 w-full flex-1 flex flex-col justify-end">

                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-700/80 bg-black/60 backdrop-blur-md text-xs tf-mono text-zinc-300 w-fit mb-8">
                        <span className="w-2 h-2 rounded-full bg-[#FF4D00] animate-ping"></span>
                        <span>CONVOCATORIA PÚBLICA DE INGENIERÍA 2026 // EDICIÓN I</span>
                    </div>

                    <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-white leading-[0.9] uppercase max-w-6xl">
                        Tecnología para el <span className="text-zinc-400">Reino del Pan.</span>
                    </h1>

                    <div className="mt-12 md:mt-20 grid grid-cols-1 md:grid-cols-12 gap-8 items-end border-t border-zinc-800/80 pt-8">
                        <div className="md:col-span-7">
                            <p className="text-zinc-300 text-lg sm:text-xl md:text-2xl font-light leading-relaxed">
                                La <strong className="text-white font-semibold">Fuerza Tech Paniense</strong> es un cuerpo técnico de élite que recluta ingenieros de software, analistas de datos y diseñadores para construir la próxima generación de servicios públicos estatales.
                            </p>
                        </div>
                        <div className="md:col-span-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 justify-end">
                            <button
                                onClick={() => setApplyModalOpen(true)}
                                className="bg-[#FF4D00] text-white hover:bg-[#e04400] text-sm font-bold uppercase tracking-widest px-8 py-4 rounded-none transition flex items-center justify-center gap-3"
                            >
                                <span>Postular a la Fuerza Tech</span>
                                <span>→</span>
                            </button>
                        </div>
                    </div>

                </div>
            </section>

            {/* ==========================================
          3. SECCIÓN EL PROGRAMA (Dos Columnas Brutalistas estilo Tech Force)
      ========================================== */}
            <section id="programa" className="py-24 md:py-36 bg-[#0A0A0A] border-b border-zinc-900">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

                        {/* Columna Izquierda - Título Fijo */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-36">
                                <span className="text-xs tf-mono text-[#FF4D00] uppercase tracking-widest block mb-3">// SOBRE EL PROGRAMA</span>
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-none">
                                    Fuerza Tech Paniense
                                </h2>
                                <div className="w-12 h-1 bg-[#FF4D00] mt-6"></div>
                            </div>
                        </div>

                        {/* Columna Derecha - Texto Extenso e Impactante */}
                        <div className="lg:col-span-8 flex flex-col gap-10 text-zinc-300 text-base sm:text-lg leading-relaxed font-light">
                            <p className="text-xl sm:text-2xl text-white font-normal leading-snug">
                                La Fuerza Tech Paniense está reclutando a un cuerpo técnico de élite para abordar los desafíos informáticos y de infraestructura cívica más complejos de nuestra era: desde administrar el sistema financiero público hasta fortificar la ciberdefensa del Estado.
                            </p>

                            <div className="space-y-6 text-zinc-400">
                                <p>
                                    A través de un programa intensivo de <strong className="text-zinc-200">dos años de duración</strong>, los participantes integrarán equipos técnicos de alto rendimiento que reportarán directamente a los secretarios de Estado y directores generales de cada ministerio.
                                </p>
                                <p>
                                    En colaboración con las principales compañías tecnológicas del sector privado y laboratorios de investigación, los ingenieros recibirán entrenamiento avanzado en arquitectura distribuida, seguridad Zero-Trust y gestión de productos públicos, trabajando codo con codo con referentes de la industria.
                                </p>
                                <p>
                                    Al finalizar la estancia de dos años, los graduados de la Fuerza Tech podrán incorporarse a plazas fijas dentro de la función pública paniense o dar el salto a empresas privadas asociadas con el máximo reconocimiento profesional.
                                </p>
                            </div>

                            {/* Estadísticas / Métricas Clave */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-zinc-800">
                                <div>
                                    <span className="text-4xl sm:text-5xl font-black text-white block tf-mono">2 AÑOS</span>
                                    <span className="text-xs text-zinc-500 uppercase tracking-wider mt-1 block">Duración del programa</span>
                                </div>
                                <div>
                                    <span className="text-4xl sm:text-5xl font-black text-[#FF4D00] block tf-mono">100%</span>
                                    <span className="text-xs text-zinc-500 uppercase tracking-wider mt-1 block">Código abierto y soberano</span>
                                </div>
                                <div>
                                    <span className="text-4xl sm:text-5xl font-black text-white block tf-mono">€ 45k-75k</span>
                                    <span className="text-xs text-zinc-500 uppercase tracking-wider mt-1 block">Rango retributivo anual</span>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </section>

            {/* ==========================================
          4. SECCIÓN NARANJA NEÓN ("Responde al llamado")
      ========================================== */}
            <section className="bg-[#FF4D00] text-black py-20 md:py-32 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                        {/* Mensaje Naranja Gigante */}
                        <div className="lg:col-span-7 flex flex-col items-start gap-8">
                            <span className="text-xs tf-mono font-bold uppercase tracking-widest bg-black text-[#FF4D00] px-3 py-1">
                                CONVOCATORIA NACIONAL
                            </span>

                            <h2 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter uppercase leading-none text-black">
                                Responde<br />al llamado.
                            </h2>

                            <p className="text-xl sm:text-2xl font-medium text-black/90 max-w-xl leading-snug">
                                Construye el futuro de la tecnología gubernamental del Reino del Pan en un programa de ingeniería respaldado por el Ministerio de Transformación Digital, trabajando en misiones reales desde el primer día.
                            </p>

                            <div className="flex flex-wrap items-center gap-4 pt-4">
                                <button
                                    onClick={() => setApplyModalOpen(true)}
                                    className="bg-black text-white hover:bg-zinc-900 text-sm font-bold uppercase tracking-widest px-8 py-4 transition"
                                >
                                    Postular Ahora
                                </button>
                                <a
                                    href="https://x.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs font-bold uppercase tracking-wider text-black border-b-2 border-black pb-0.5 hover:opacity-75 transition"
                                >
                                    Síguenos en X →
                                </a>
                            </div>
                        </div>

                        {/* Terminal de Misiones */}
                        <div className="lg:col-span-5 flex justify-center">
                            <div className="w-full max-w-md bg-black p-8 border-4 border-black shadow-2xl relative">
                                <div className="tf-mono text-xs text-[#FF4D00] mb-4 flex justify-between border-b border-zinc-800 pb-2">
                                    <span>TERMINAL DE MISIONES</span>
                                    <span>STATUS: RECRUITING</span>
                                </div>

                                <div className="space-y-4 text-xs tf-mono text-zinc-300">
                                    <p className="text-[#FF4D00]">$ ftp --list-missions</p>
                                    <p className="pl-2 border-l border-zinc-800">
                                        [1] Rediseño de la pasarela fiscal del Ministerio de Hacienda.<br />
                                        [2] Despliegue del firewall cibernético de la Red Paniense.<br />
                                        [3] Lanzamiento de la App Oficial de Movilidad del Reino.<br />
                                        [4] API de Transparencia de Contratos del Estado.
                                    </p>
                                    <p className="text-[#FF4D00]">$ ftp --eligible-profiles</p>
                                    <p className="pl-2 border-l border-zinc-800 text-zinc-400">
                                        * Software Engineers (Full-Stack / Backend)<br />
                                        * Cybersecurity & Infrastructure Engineers<br />
                                        * Data Analysts & AI Researchers<br />
                                        * UX/UI Product Designers
                                    </p>
                                </div>

                                <div className="mt-8 pt-4 border-t border-zinc-800 text-center">
                                    <span className="text-[10px] tf-mono text-zinc-500 uppercase">
                                        Gobierno del Reino del Pan · Ministerio de Transformación Digital
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>


            {/* ==========================================
          6. SECCIÓN REQUISITOS Y PROCESO DE SELECCIÓN
      ========================================== */}
            <section id="requisitos" className="py-24 md:py-36 bg-[#0A0A0A] border-b border-zinc-900">
                <div className="max-w-7xl mx-auto px-6">

                    <div className="max-w-3xl mb-16">
                        <span className="text-xs tf-mono text-[#FF4D00] uppercase tracking-widest block mb-3">// ELEGIBILIDAD Y FASES</span>
                        <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none">
                            Proceso de Selección
                        </h2>
                        <p className="text-zinc-400 text-lg mt-4 font-light">
                            Buscamos ingenieros excepcionales motivados por el impacto público. Nuestro proceso es riguroso, transparente y basado 100% en habilidades técnicas demostrables.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                        {/* Paso 1 */}
                        <div className="border border-zinc-800 bg-zinc-950 p-6 md:p-8 flex flex-col justify-between relative group hover:border-zinc-600 transition">
                            <div>
                                <span className="text-3xl font-black text-[#FF4D00] tf-mono block mb-4">01</span>
                                <h3 className="text-xl font-bold text-white mb-2">Solicitud Inicial</h3>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    Envío de currículum técnico, perfil de GitHub / Portfolio de proyectos y declaración de motivación para el servicio público.
                                </p>
                            </div>
                            <span className="text-[10px] tf-mono text-zinc-600 uppercase mt-6 block">Plazo: Hasta 31 de Octubre</span>
                        </div>

                        {/* Paso 2 */}
                        <div className="border border-zinc-800 bg-zinc-950 p-6 md:p-8 flex flex-col justify-between relative group hover:border-zinc-600 transition">
                            <div>
                                <span className="text-3xl font-black text-white tf-mono block mb-4">02</span>
                                <h3 className="text-xl font-bold text-white mb-2">Prueba Técnica</h3>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    Desafío práctico asíncrono de código, arquitectura de sistemas o diseño de componentes de acceso público.
                                </p>
                            </div>
                            <span className="text-[10px] tf-mono text-zinc-600 uppercase mt-6 block">Duración: 48 horas</span>
                        </div>

                        {/* Paso 3 */}
                        <div className="border border-zinc-800 bg-zinc-950 p-6 md:p-8 flex flex-col justify-between relative group hover:border-zinc-600 transition">
                            <div>
                                <span className="text-3xl font-black text-white tf-mono block mb-4">03</span>
                                <h3 className="text-xl font-bold text-white mb-2">Panel con Líderes</h3>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    Entrevista técnica profunda con los Directores de Tecnología de los ministerios y revisión del caso práctico.
                                </p>
                            </div>
                            <span className="text-[10px] tf-mono text-zinc-600 uppercase mt-6 block">Formato: Videoconferencia</span>
                        </div>

                        {/* Paso 4 */}
                        <div className="border border-zinc-800 bg-zinc-950 p-6 md:p-8 flex flex-col justify-between relative group border-t-4 border-t-[#FF4D00]">
                            <div>
                                <span className="text-3xl font-black text-[#FF4D00] tf-mono block mb-4">04</span>
                                <h3 className="text-xl font-bold text-white mb-2">Incorporación</h3>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    Asignación formal a ministerio, acreditación de seguridad pública y arranque del programa de 2 años en la Capital Paniense.
                                </p>
                            </div>
                            <span className="text-[10px] tf-mono text-[#FF4D00] uppercase mt-6 block">Inicio: Enero 2027</span>
                        </div>

                    </div>

                </div>
            </section>

            {/* ==========================================
          7. PREGUNTAS FRECUENTES (FAQ)
      ========================================== */}
            <section id="faq" className="py-24 md:py-36 bg-[#0A0A0A] border-b border-zinc-900">
                <div className="max-w-5xl mx-auto px-6">

                    <div className="text-center mb-16">
                        <span className="text-xs tf-mono text-[#FF4D00] uppercase tracking-widest block mb-3">// RESOLUCIÓN DE DUDAS</span>
                        <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
                            Preguntas Frecuentes
                        </h2>
                    </div>

                    <div className="space-y-6">
                        {faqs.map((faq, fIdx) => (
                            <div key={fIdx} className="border border-zinc-800/80 bg-zinc-950 p-6 sm:p-8">
                                <h3 className="text-lg sm:text-xl font-bold text-white mb-3">
                                    {faq.q}
                                </h3>
                                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-light">
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>

                </div>
            </section>

            {/* ==========================================
          8. FOOTER COMPLETO ESTILO TECH FORCE
      ========================================== */}
            <footer className="bg-black border-t border-zinc-900 text-zinc-400 text-xs py-16 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">

                    {/* Logo e Identidad del Gobierno */}
                    <div className="md:col-span-5 flex flex-col justify-between space-y-6">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <img
                                    src="/Otros/PanTech.png"
                                    alt="PanTech Logo"
                                    className="h-8 w-auto object-contain"
                                />
                            </div>
                            <p className="text-zinc-500 leading-relaxed max-w-sm text-xs">
                                Iniciativa gubernamental para el reclutamiento de talento informático de vanguardia al servicio del Reino del Pan. Adscrita al Ministerio de Transformación Digital y Coordinación Cívica.
                            </p>
                        </div>

                        <div className="tf-mono text-[11px] text-zinc-600">
                            GOBIERNO DEL REINO DEL PAN · SERVICIO PÚBLICO DE TECNOLOGÍA
                        </div>
                    </div>

                    {/* Enlaces de Navegación Rápida */}
                    <div className="md:col-span-3 space-y-3">
                        <span className="text-xs font-bold uppercase text-white tracking-wider block mb-4 tf-mono">Navegación</span>
                        <a href="#programa" className="block hover:text-white transition">El Programa de 2 Años</a>
                        <a href="#ministerios" className="block hover:text-white transition">Ministerios y Agencias</a>
                        <a href="#requisitos" className="block hover:text-white transition">Elegibilidad y Proceso</a>
                        <a href="#faq" className="block hover:text-white transition">Preguntas Frecuentes</a>
                        <a href="https://x.com" target="_blank" rel="noreferrer" className="block hover:text-white transition text-[#FF4D00]">Canal Oficial en X ↗</a>
                    </div>

                    {/* Legales y Transparencia */}
                    <div className="md:col-span-4 space-y-3">
                        <span className="text-xs font-bold uppercase text-white tracking-wider block mb-4 tf-mono">Transparencia y Licencia</span>
                        <p className="text-zinc-500 leading-relaxed text-xs">
                            Todo el código producido por los miembros de la Fuerza Tech Paniense es publicado bajo licencias abiertas compatibles con el Dominio Público Paniense.
                        </p>
                        <div className="pt-4 text-zinc-600 text-[11px]">
                            © 2026 Gobierno del Reino del Pan. Todos los derechos reservados.
                        </div>
                    </div>

                </div>
            </footer>

            {/* ==========================================
          MODAL DE POSTULACIÓN
      ========================================== */}
            {applyModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-zinc-950 border border-zinc-800 max-w-2xl w-full p-8 relative">
                        <button
                            onClick={() => setApplyModalOpen(false)}
                            className="absolute top-6 right-6 text-zinc-400 hover:text-white text-xl font-mono"
                        >
                            ✕
                        </button>

                        <span className="text-xs tf-mono text-[#FF4D00] uppercase tracking-widest block mb-2">// FORMULARIO DE CANDIDATURA</span>
                        <h3 className="text-2xl font-bold uppercase text-white mb-6">Unirse a la Fuerza Tech</h3>

                        <form onSubmit={(e) => { e.preventDefault(); alert('Candidatura registrada correctamente en la Fuerza Tech Paniense.'); setApplyModalOpen(false); }} className="space-y-4">
                            <div>
                                <label className="block text-xs tf-mono text-zinc-400 uppercase mb-1">Nombre Completo *</label>
                                <input required type="text" placeholder="Ej. Álex García" className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white text-sm focus:border-[#FF4D00] focus:outline-none" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs tf-mono text-zinc-400 uppercase mb-1">Correo Electrónico *</label>
                                    <input required type="email" placeholder="alex@ejemplo.pan" className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white text-sm focus:border-[#FF4D00] focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs tf-mono text-zinc-400 uppercase mb-1">Enlace a GitHub / Portfolio *</label>
                                    <input required type="url" placeholder="https://github.com/usuario" className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white text-sm focus:border-[#FF4D00] focus:outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs tf-mono text-zinc-400 uppercase mb-1">Ministerio de Preferencia</label>
                                <select className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white text-sm focus:border-[#FF4D00] focus:outline-none">
                                    {agencies.map(a => (
                                        <option key={a.id} value={a.id}>{a.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs tf-mono text-zinc-400 uppercase mb-1">Motivación para el servicio público</label>
                                <textarea rows={3} placeholder="Explica brevemente por qué deseas aportar tus conocimientos técnicos al Reino del Pan..." className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white text-sm focus:border-[#FF4D00] focus:outline-none"></textarea>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setApplyModalOpen(false)} className="px-5 py-2.5 text-xs font-bold uppercase text-zinc-400 hover:text-white">
                                    Cancelar
                                </button>
                                <button type="submit" className="bg-[#FF4D00] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#e04400]">
                                    Enviar Candidatura Oficial
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}