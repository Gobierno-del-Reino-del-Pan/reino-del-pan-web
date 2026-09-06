import React, { useState } from 'react';

export default function FuerzaTechPaniense() {
    const [bannerOpen, setBannerOpen] = useState(false);

    // Inyección de estilos con estética USWDS / TechForce.gov
    const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Merriweather:wght@400;700&display=swap');

    .ftp-scope {
      font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    .ftp-scope .font-serif-gov {
      font-family: 'Merriweather', Georgia, serif;
    }

    /* Borde superior azul institucional para tarjetas / bloques estilo USWDS */
    .ftp-border-top-accent {
      border-top: 4px solid #005ea2;
    }
  `;

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
            <style dangerouslySetInnerHTML={{ __html: customStyles }} />

            {/* Contenedor principal */}
            <div className="ftp-scope flex-1 flex flex-col">

                {/* 1. USWDS OFFICIAL GOVERNMENT BANNER */}
                <div className="bg-slate-100 border-b border-slate-200 text-xs text-slate-700 py-2 px-4 z-50">
                    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <img
                                src="/flag.png"
                                alt="Bandera del Reino del Pan"
                                className="h-3.5 w-5 object-contain"
                            />
                            <span className="font-medium text-slate-800">
                                Un sitio web oficial del Gobierno del Reino del Pan
                            </span>
                        </div>
                        <button
                            onClick={() => setBannerOpen(!bannerOpen)}
                            className="text-[#005ea2] hover:underline font-medium text-[11px] flex items-center gap-1 focus:outline-none"
                        >
                            Así es como sabes que es oficial
                            <svg
                                className={`w-3 h-3 transition-transform ${bannerOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>

                    {/* Desplegable de explicación de seguridad/dominio gubernamental */}
                    {bannerOpen && (
                        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 mt-2 border-t border-slate-200 text-slate-600 text-[11px]">
                            <div className="flex gap-3">
                                <div className="p-2 bg-slate-200 rounded-full h-fit text-slate-700">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <strong className="block font-semibold text-slate-800 mb-0.5">Los sitios web oficiales usan .pan.gov</strong>
                                    Los sitios web oficiales del gobierno pertenecen a organizaciones oficiales del Reino del Pan.
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="p-2 bg-slate-200 rounded-full h-fit text-slate-700">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <div>
                                    <strong className="block font-semibold text-slate-800 mb-0.5">Los sitios con HTTPS son seguros</strong>
                                    El candado de seguridad (🔒) significa que te has conectado de forma segura al sitio oficial.
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. HEADER OFICIAL TECHFORCE STYLE */}
                <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
                    <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">

                        {/* Branding Institucional */}
                        <a href="/" className="flex items-center gap-3 group">
                            <img
                                src="/Otros/PanTech.png"
                                alt="Fuerza Tech Paniense Logo"
                                className="h-10 w-auto object-contain"
                            />
                            <div className="border-l border-slate-300 pl-3 flex flex-col">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 leading-none mb-1">
                                    Ministerio de Transformación Digital
                                </span>
                                <span className="font-bold text-lg md:text-xl text-slate-900 group-hover:text-[#005ea2] transition-colors leading-none">
                                    Fuerza Tech Paniense
                                </span>
                            </div>
                        </a>

                        {/* Navegación estilo USWDS */}
                        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700">
                            <a href="#mision" className="hover:text-[#005ea2] hover:underline underline-offset-4 decoration-2">
                                Nuestra Misión
                            </a>
                            <a href="#proyectos" className="hover:text-[#005ea2] hover:underline underline-offset-4 decoration-2">
                                Proyectos y Software
                            </a>
                            <a href="#impacto" className="hover:text-[#005ea2] hover:underline underline-offset-4 decoration-2">
                                Impacto
                            </a>
                            <a
                                href="#unete"
                                className="bg-[#005ea2] hover:bg-[#1a4480] text-white px-5 py-2.5 rounded-md font-bold transition shadow-sm"
                            >
                                Unirse a la Fuerza Tech
                            </a>
                        </nav>

                    </div>
                </header>

                {/* 3. HERO SECTION - Estilo Tech Force / U.S. Digital Corps */}
                <section className="bg-[#0f1e36] text-white py-16 md:py-24 relative overflow-hidden">
                    <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">

                        <div className="lg:col-span-8 flex flex-col items-start gap-6">
                            <span className="bg-[#005ea2] text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded">
                                Servicio Público Tecnológico
                            </span>

                            <h1 className="font-serif-gov text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-white">
                                Construye tecnología de alto impacto para el Reino del Pan.
                            </h1>

                            <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl">
                                La Fuerza Tech Paniense es la unidad gubernamental de ingenieros de software, diseñadores de producto y especialistas en ciberdefensa dedicados a transformar la infraestructura pública digital.
                            </p>

                            <div className="flex flex-wrap gap-4 pt-2">
                                <a
                                    href="#unete"
                                    className="bg-[#005ea2] hover:bg-[#1a4480] text-white font-bold px-6 py-3.5 rounded-md transition shadow-md text-sm uppercase tracking-wide"
                                >
                                    Convocatoria Abierta 2026
                                </a>
                                <a
                                    href="#proyectos"
                                    className="bg-transparent hover:bg-slate-800 text-white font-semibold px-6 py-3.5 rounded-md border border-slate-400 transition text-sm uppercase tracking-wide"
                                >
                                    Explorar Repositorios Públicos
                                </a>
                            </div>
                        </div>

                        {/* Módulo de métricas de impacto gubernamental */}
                        <div className="lg:col-span-4 bg-slate-800/90 border border-slate-700 rounded-lg p-6 flex flex-col gap-6 shadow-xl">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-700 pb-3">
                                Estado de la Infraestructura Digital
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <div className="text-2xl md:text-3xl font-extrabold text-white">99.98%</div>
                                    <div className="text-xs text-slate-400">Disponibilidad de la Identidad Digital Paniense</div>
                                </div>

                                <div className="border-t border-slate-700/80 pt-3">
                                    <div className="text-2xl md:text-3xl font-extrabold text-emerald-400">100%</div>
                                    <div className="text-xs text-slate-400">Código Abierto en Sistemas de Sede Electrónica</div>
                                </div>

                                <div className="border-t border-slate-700/80 pt-3">
                                    <div className="text-2xl md:text-3xl font-extrabold text-sky-400">+1.2M</div>
                                    <div className="text-xs text-slate-400">Trámites procesados mensualmente sin interrupción</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* 4. SECCIÓN DE ÁREAS DE TRABAJO (Ejes Tecnológicos) */}
                <section id="mision" className="py-16 bg-white border-b border-slate-200">
                    <div className="max-w-6xl mx-auto px-4">

                        <div className="max-w-2xl mb-12">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-[#005ea2] mb-2">
                                Nuestra Estrategia
                            </h2>
                            <h3 className="font-serif-gov text-2xl md:text-3xl font-bold text-slate-900">
                                Pilar Tecnológico Institucional
                            </h3>
                            <p className="text-slate-600 text-sm md:text-base mt-3 leading-relaxed">
                                Diseñamos y mantenemos las herramientas críticas que potencian a la administración pública y protegen la privacidad de los ciudadanos.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                            {/* Tarjeta 1 */}
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 ftp-border-top-accent flex flex-col justify-between shadow-sm hover:shadow-md transition">
                                <div>
                                    <h4 className="font-bold text-lg text-slate-900 mb-3">
                                        Desarrollo de Software e Identidad
                                    </h4>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                        Creación de componentes UI de accesibilidad universal (WCAG 2.1 AA) y sistemas centralizados de autenticación segura para los servicios del Reino.
                                    </p>
                                </div>
                                <div className="text-xs font-semibold text-[#005ea2] uppercase tracking-wide">
                                    Tecnologías: React · Next.js · TypeScript
                                </div>
                            </div>

                            {/* Tarjeta 2 */}
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 ftp-border-top-accent flex flex-col justify-between shadow-sm hover:shadow-md transition">
                                <div>
                                    <h4 className="font-bold text-lg text-slate-900 mb-3">
                                        Ciberdefensa e Infraestructura
                                    </h4>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                        Protección proactiva de datos sensibles del Estado, auditoría continua de código y despliegues seguros en arquitectura Zero Trust.
                                    </p>
                                </div>
                                <div className="text-xs font-semibold text-[#005ea2] uppercase tracking-wide">
                                    Tecnologías: Rust · Cloudflare · Supabase
                                </div>
                            </div>

                            {/* Tarjeta 3 */}
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 ftp-border-top-accent flex flex-col justify-between shadow-sm hover:shadow-md transition">
                                <div>
                                    <h4 className="font-bold text-lg text-slate-900 mb-3">
                                        Ciencia de Datos y Geoportal
                                    </h4>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                        Plataformas abiertas de cartografía, transporte público y análisis presupuestario en tiempo real para máxima transparencia gubernamental.
                                    </p>
                                </div>
                                <div className="text-xs font-semibold text-[#005ea2] uppercase tracking-wide">
                                    Tecnologías: Python · REST APIs · OpenData
                                </div>
                            </div>

                        </div>

                    </div>
                </section>

                {/* 5. SECCIÓN DE PROYECTOS DESTACADOS */}
                <section id="proyectos" className="py-16 bg-slate-100 border-b border-slate-200">
                    <div className="max-w-6xl mx-auto px-4">

                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                            <div>
                                <h2 className="text-xs font-bold uppercase tracking-widest text-[#005ea2] mb-1">
                                    Ecosistema Digital
                                </h2>
                                <h3 className="font-serif-gov text-2xl md:text-3xl font-bold text-slate-900">
                                    Iniciativas de Código Abierto
                                </h3>
                            </div>
                            <a
                                href="#"
                                className="text-sm font-bold text-[#005ea2] hover:underline flex items-center gap-1"
                            >
                                Ver todos los repositorios en GitHub ↗
                            </a>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Proyecto 1 */}
                            <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                                        Producción
                                    </span>
                                    <span className="text-xs font-mono text-slate-500">v2.4.0</span>
                                </div>
                                <h4 className="font-bold text-xl text-slate-900 mb-2">
                                    Sistema de Diseño PanUI
                                </h4>
                                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                    Librería oficial de componentes accesibles para garantizar cohesión estética y funcional en todas las sedes electrónicas del Reino del Pan.
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                                    <span className="font-mono text-slate-500">npm @pan/ui-design</span>
                                    <a href="#" className="font-bold text-[#005ea2] hover:underline">
                                        Documentación Técnica →
                                    </a>
                                </div>
                            </div>

                            {/* Proyecto 2 */}
                            <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                                        Fase de Pruebas
                                    </span>
                                    <span className="text-xs font-mono text-slate-500">v0.9.1</span>
                                </div>
                                <h4 className="font-bold text-xl text-slate-900 mb-2">
                                    Geoportal Abierto del Reino
                                </h4>
                                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                    API pública y cuadro de mando interactivo para monitorización cartográfica, límites municipales e infraestructura pública.
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                                    <span className="font-mono text-slate-500">api.datos.pan.gov</span>
                                    <a href="#" className="font-bold text-[#005ea2] hover:underline">
                                        Especificación Swagger →
                                    </a>
                                </div>
                            </div>

                        </div>

                    </div>
                </section>

                {/* 6. CALL TO ACTION - RECLUTAMIENTO */}
                <section id="unete" className="py-16 bg-[#0f1e36] text-white">
                    <div className="max-w-4xl mx-auto px-4 text-center flex flex-col items-center gap-6">
                        <span className="bg-[#005ea2] text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded">
                            Únete a nuestro equipo
                        </span>
                        <h2 className="font-serif-gov text-3xl md:text-4xl font-bold leading-tight">
                            Pon tu talento tecnológico al servicio del interés general.
                        </h2>
                        <p className="text-slate-300 text-base leading-relaxed max-w-2xl">
                            Buscamos desarrolladores Full-Stack, ingenieros de infraestructura y diseñadores comprometidos con la transparencia, la accesibilidad y la excelencia técnica en la función pública.
                        </p>
                        <a
                            href="mailto:talento@tech.pan.gov"
                            className="bg-[#005ea2] hover:bg-[#1a4480] text-white font-bold px-8 py-3.5 rounded-md transition text-sm uppercase tracking-wider shadow-lg mt-2"
                        >
                            Presentar Candidatura
                        </a>
                    </div>
                </section>

                {/* 7. FOOTER INSTITUCIONAL TECHFORCE / USWDS STYLE */}
                <footer className="bg-slate-900 text-slate-300 text-xs py-12 border-t border-slate-800">
                    <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-8">

                        <div className="md:col-span-5 flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <img
                                    src="/Otros/PanTech.png"
                                    alt="Logo Fuerza Tech Paniense"
                                    className="h-8 w-auto object-contain brightness-200"
                                />
                                <span className="font-bold text-white text-base">
                                    Fuerza Tech Paniense
                                </span>
                            </div>
                            <p className="text-slate-400 leading-relaxed max-w-sm">
                                Unidad de Ingeniería y Transformación Digital adscrita al Ministerio de Transformación Digital del Reino del Pan.
                            </p>
                        </div>

                        <div className="md:col-span-3 flex flex-col gap-2">
                            <span className="font-bold text-white uppercase tracking-wider text-[11px] mb-1">
                                Portales Oficiales
                            </span>
                            <a href="#" className="hover:text-white transition">Sede Electrónica General</a>
                            <a href="#" className="hover:text-white transition">Boletín Oficial del Estado</a>
                            <a href="#" className="hover:text-white transition">Portal de Transparencia</a>
                            <a href="#" className="hover:text-white transition">Estándares de Accesibilidad</a>
                        </div>

                        <div className="md:col-span-4 flex flex-col gap-2">
                            <span className="font-bold text-white uppercase tracking-wider text-[11px] mb-1">
                                Aviso Legal y Licencia
                            </span>
                            <p className="text-slate-400 leading-relaxed">
                                El código y la documentación publicados por Fuerza Tech Paniense están sujetos a Licencia Pública Abierta salvo que se indique lo contrario.
                            </p>
                            <p className="text-slate-500 mt-2">
                                © 2026 Gobierno del Reino del Pan.
                            </p>
                        </div>

                    </div>
                </footer>

            </div>
        </div>
    );
}