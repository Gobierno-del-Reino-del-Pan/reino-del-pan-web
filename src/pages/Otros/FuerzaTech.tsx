import React from 'react';

export default function FuerzaTechPaniense() {
    // Inyección de estilos y fuentes tipográficas (Inter + Space Grotesk + JetBrains Mono)
    const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@500;600;700;800&display=swap');

    .ftp-scope .font-title {
      font-family: 'Space Grotesk', sans-serif;
    }

    .ftp-scope .font-body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    .ftp-scope .font-mono {
      font-family: 'JetBrains Mono', monospace;
    }

    /* Malla de fondo sutil con gradiente */
    .ftp-bg-grid {
      background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
      background-size: 24px 24px;
    }

    /* Efecto Glow en tarjetas */
    .ftp-card-glow {
      position: relative;
    }
    .ftp-card-glow::before {
      content: '';
      position: absolute;
      inset: -1px;
      background: linear-gradient(135deg, rgba(226, 149, 120, 0.3) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%);
      border-radius: inherit;
      z-index: 0;
      pointer-events: none;
    }
  `;

    return (
        <div className="min-h-screen flex flex-col bg-[#090A0F] text-zinc-100 antialiased selection:bg-[#E29578]/30 selection:text-white">
            <style dangerouslySetInnerHTML={{ __html: customStyles }} />

            {/* Contenedor principal con alcance exclusivo */}
            <div className="ftp-scope font-body flex-1 flex flex-col">

                {/* 1. FRANJA DE WEB OFICIAL DEL GOBIERNO */}
                <div className="bg-zinc-950 border-b border-zinc-800/80 py-2 px-4 text-[10px] md:text-xs text-zinc-400 font-body z-50">
                    <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 md:gap-3 text-center">
                        <img
                            src="/flag.png"
                            alt="Bandera del Reino del Pan"
                            className="h-3 w-4 opacity-90 object-contain shrink-0"
                        />
                        <span className="font-semibold tracking-wider uppercase leading-tight text-zinc-300">
                            Web oficial del Gobierno del Reino del Pan · Ministerio de Transformación Digital
                        </span>
                    </div>
                </div>

                {/* 2. HEADER TIPO TECH FORCE */}
                <header className="w-full bg-[#090A0F]/90 backdrop-blur-xl px-4 py-4 md:px-8 border-b border-zinc-800/80 sticky top-0 z-40">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">

                        {/* Branding del Ministerio y Fuerza Tech */}
                        <div className="flex items-center gap-3 sm:gap-4">
                            <img
                                src="/Otros/PanTech.png"
                                alt="Logo Fuerza Tech Paniense"
                                className="h-9 sm:h-11 w-auto object-contain transition-transform hover:scale-105"
                            />
                            <div className="h-6 w-px bg-zinc-800 hidden sm:block"></div>
                            <div className="flex flex-col">
                                <span className="font-mono text-[10px] font-bold text-[#E29578] uppercase tracking-widest leading-none mb-1">
                                    FTP // TECH FORCE
                                </span>
                                <h1 className="font-title text-lg sm:text-xl font-bold tracking-tight text-white leading-none">
                                    Fuerza Tech Paniense
                                </h1>
                            </div>
                        </div>

                        {/* Navegación Principal */}
                        <nav className="flex items-center gap-3 sm:gap-6 flex-wrap justify-center">
                            <a
                                href="#mision"
                                className="text-xs uppercase tracking-wider font-semibold text-zinc-400 hover:text-white transition px-2 py-1"
                            >
                                Misión
                            </a>
                            <a
                                href="#proyectos"
                                className="text-xs uppercase tracking-wider font-semibold text-zinc-400 hover:text-white transition px-2 py-1"
                            >
                                Iniciativas
                            </a>
                            <a
                                href="#unete"
                                className="text-xs uppercase tracking-wider font-semibold text-zinc-400 hover:text-white transition px-2 py-1"
                            >
                                Talento
                            </a>

                            <div className="h-4 w-px bg-zinc-800 hidden sm:block"></div>

                            <a
                                href="/"
                                className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-zinc-700/80 bg-zinc-900/90 hover:bg-zinc-800 transition text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-200"
                            >
                                <span>Volver al portal</span>
                            </a>
                        </nav>
                    </div>
                </header>

                {/* 3. CONTENIDO PRINCIPAL */}
                <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 md:px-8 md:py-16 flex flex-col gap-16 md:gap-24 ftp-bg-grid">

                    {/* HERO SECTION estilo Tech Force */}
                    <section className="relative rounded-3xl border border-zinc-800 bg-zinc-950/90 p-8 md:p-14 lg:p-16 overflow-hidden shadow-2xl">
                        {/* Resplandor decorativo de fondo */}
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#E29578]/10 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                            <div className="lg:col-span-8 flex flex-col items-start gap-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#E29578]/30 bg-[#E29578]/10 text-[#E29578] text-[10px] md:text-xs font-mono font-medium tracking-wide">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#E29578] animate-pulse"></span>
                                    RECLUTAMIENTO DIGITAL Y SERVICIO PÚBLICO
                                </div>

                                <h2 className="font-title text-3xl sm:text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
                                    Construyendo la infraestructura digital para todo el <span className="text-[#E29578]">Reino del Pan</span>.
                                </h2>

                                <p className="text-zinc-400 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl font-normal">
                                    La Fuerza Tech Paniense (FTP) une a desarrolladores, ingenieros de datos y diseñadores para modernizar los servicios públicos, garantizando soberanía tecnológica, ciberseguridad y plataformas de alto rendimiento.
                                </p>

                                <div className="flex flex-wrap items-center gap-4 pt-2">
                                    <a
                                        href="#unete"
                                        className="px-6 py-3 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 font-title font-bold text-xs uppercase tracking-wider transition shadow-lg"
                                    >
                                        Unirse a la Fuerza Tech
                                    </a>
                                    <a
                                        href="#proyectos"
                                        className="px-6 py-3 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-300 font-title font-bold text-xs uppercase tracking-wider transition"
                                    >
                                        Explorar Código y Portales
                                    </a>
                                </div>
                            </div>

                            {/* Bloque lateral estético de consola */}
                            <div className="lg:col-span-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 font-mono text-xs flex flex-col gap-4 shadow-xl">
                                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                                    <div className="flex gap-1.5">
                                        <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
                                        <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
                                        <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block"></span>
                                    </div>
                                    <span className="text-zinc-500 text-[10px]">ftp-node-01.pan.gov</span>
                                </div>

                                <div className="space-y-2 text-zinc-300">
                                    <p className="text-zinc-500">// Estado de los Sistemas Pan-Digitales</p>
                                    <p className="flex justify-between">
                                        <span>Identidad Digital:</span>
                                        <span className="text-emerald-400 font-semibold">ONLINE [99.99%]</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span>Sede Electrónica:</span>
                                        <span className="text-emerald-400 font-semibold">OPERATIVA</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span>Ciberdefensa Paniense:</span>
                                        <span className="text-amber-400 font-semibold">ACTIVA (NIVEL 2)</span>
                                    </p>
                                    <div className="border-t border-zinc-800/80 pt-3 mt-2">
                                        <p className="text-[#E29578]">$ ftp --status</p>
                                        <p className="text-zinc-400 text-[11px] mt-1">
                                            Convocatoria abierta para ingenieros Full-Stack y expertos en infraestructura en la nube.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* BENTO GRID: EJES ESTRATÉGICOS */}
                    <section id="mision" className="flex flex-col gap-8">
                        <div className="border-b border-zinc-800 pb-6">
                            <span className="font-mono text-xs font-bold text-[#E29578] uppercase tracking-widest block mb-2">
                // Áreas Tecnológicas Principales
                            </span>
                            <h3 className="font-title text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                Pilares de la Transformación Digital
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Tarjeta 1 */}
                            <div className="ftp-card-glow bg-zinc-950 rounded-2xl border border-zinc-800/90 p-6 md:p-8 flex flex-col justify-between">
                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 text-[#E29578]">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457-.39-2.823-1.07-4" />
                                        </svg>
                                    </div>
                                    <h4 className="font-title text-xl font-bold text-white mb-3">
                                        Identidad y Plataforma Única
                                    </h4>
                                    <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-normal">
                                        Desarrollo de portales gubernamentales unificados con autenticación segura y accesible para la ciudadanía paniense.
                                    </p>
                                </div>
                                <div className="relative z-10 pt-6 mt-6 border-t border-zinc-900 font-mono text-[11px] text-zinc-500">
                                    REACT · NEXT.JS · OAUTH 2.1
                                </div>
                            </div>

                            {/* Tarjeta 2 */}
                            <div className="ftp-card-glow bg-zinc-950 rounded-2xl border border-zinc-800/90 p-6 md:p-8 flex flex-col justify-between">
                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 text-emerald-400">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-title text-xl font-bold text-white mb-3">
                                        Centro de Ciberdefensa
                                    </h4>
                                    <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-normal">
                                        Protección de infraestructuras críticas del Reino contra ciberamenazas mediante sistemas distribuidos y auditoría continua.
                                    </p>
                                </div>
                                <div className="relative z-10 pt-6 mt-6 border-t border-zinc-900 font-mono text-[11px] text-zinc-500">
                                    ZERO TRUST · RUST · MONITORING
                                </div>
                            </div>

                            {/* Tarjeta 3 */}
                            <div className="ftp-card-glow bg-zinc-950 rounded-2xl border border-zinc-800/90 p-6 md:p-8 flex flex-col justify-between">
                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 text-sky-400">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-title text-xl font-bold text-white mb-3">
                                        Sostenibilidad Digital
                                    </h4>
                                    <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-normal">
                                        Servidores eficientes y pipelines de despliegue optimizados para reducir la huella de carbono de los servicios públicos digitales.
                                    </p>
                                </div>
                                <div className="relative z-10 pt-6 mt-6 border-t border-zinc-900 font-mono text-[11px] text-zinc-500">
                                    VERCEL · CLOUDFLARE · EDGE
                                </div>
                            </div>

                        </div>
                    </section>

                    {/* SECCIÓN PROYECTOS E INICIATIVAS */}
                    <section id="proyectos" className="flex flex-col gap-8">
                        <div className="border-b border-zinc-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <span className="font-mono text-xs font-bold text-[#E29578] uppercase tracking-widest block mb-2">
                  // PROYECTOS DESTACADOS
                                </span>
                                <h3 className="font-title text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                    Ecosistema de Software Abierto
                                </h3>
                            </div>
                            <p className="text-zinc-400 text-xs sm:text-sm max-w-md">
                                Publicamos componentes modulares para potenciar la administración pública y fomentar la colaboración técnica.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl p-6 flex flex-col justify-between hover:border-zinc-700 transition">
                                <div className="flex flex-col gap-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded">
                                            DESPLIEGUE ACTIVO
                                        </span>
                                        <span className="text-zinc-500 font-mono text-xs">v2.4.0</span>
                                    </div>
                                    <h4 className="font-title text-lg font-bold text-white">
                                        PanUI Component Library
                                    </h4>
                                    <p className="text-zinc-400 text-xs leading-relaxed">
                                        Sistema de diseño y librería de componentes accesibles creados con Tailwind CSS y React para todas las webs institucionales del Reino del Pan.
                                    </p>
                                </div>
                                <div className="pt-6 mt-4 border-t border-zinc-900 flex items-center justify-between">
                                    <span className="font-mono text-[11px] text-zinc-500">npm @pan/ui-design</span>
                                    <a href="#" className="text-xs font-bold text-[#E29578] hover:underline">
                                        Documentación ↗
                                    </a>
                                </div>
                            </div>

                            <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl p-6 flex flex-col justify-between hover:border-zinc-700 transition">
                                <div className="flex flex-col gap-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-mono text-[10px] font-bold text-[#E29578] bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 rounded">
                                            EN DESARROLLO
                                        </span>
                                        <span className="text-zinc-500 font-mono text-xs">v0.9.1</span>
                                    </div>
                                    <h4 className="font-title text-lg font-bold text-white">
                                        Portal Abierto de Datos Geográficos
                                    </h4>
                                    <p className="text-zinc-400 text-xs leading-relaxed">
                                        API pública y panel de datos interactivo para la monitorización en tiempo real de infraestructuras, transporte y cartografía oficial.
                                    </p>
                                </div>
                                <div className="pt-6 mt-4 border-t border-zinc-900 flex items-center justify-between">
                                    <span className="font-mono text-[11px] text-zinc-500">api.datos.pan.gov</span>
                                    <a href="#" className="text-xs font-bold text-[#E29578] hover:underline">
                                        Especificación REST ↗
                                    </a>
                                </div>
                            </div>

                        </div>
                    </section>

                    {/* CALL TO ACTION: UNIRSE A LA FUERZA TECH */}
                    <section id="unete" className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 rounded-3xl p-8 sm:p-12 border border-zinc-800 text-center relative overflow-hidden">
                        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6 relative z-10">
                            <span className="font-mono text-xs font-bold text-[#E29578] uppercase tracking-widest">
                // CONVOCATORIA DE TALENTO TÉCNICO
                            </span>
                            <h3 className="font-title text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                                ¿Quieres programar para el servicio público del Reino?
                            </h3>
                            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                                Buscamos ingenieros de software, diseñadores UX/UI y especialistas en seguridad computacional comprometidos con el desarrollo abierto, moderno y transparente.
                            </p>
                            <a
                                href="mailto:talento@tech.pan.gov"
                                className="px-8 py-3.5 rounded-xl bg-[#E29578] text-zinc-950 hover:bg-[#d88465] font-title font-bold text-xs uppercase tracking-wider transition shadow-lg mt-2"
                            >
                                Enviar Candidatura
                            </a>
                        </div>
                    </section>

                </main>

                {/* 4. FOOTER INDEPENDIENTE (FUERZA TECH PANIENSE) */}
                <footer className="w-full bg-zinc-950 border-t border-zinc-800/80 text-zinc-400 text-xs font-body py-12 px-4 md:px-8 mt-12">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">

                        {/* Identidad en Footer */}
                        <div className="md:col-span-5 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src="/Otros/PanTech.png"
                                    alt="Logo Fuerza Tech Paniense"
                                    className="h-8 w-auto object-contain opacity-90"
                                />
                                <span className="font-title font-bold text-white text-base">
                                    Fuerza Tech Paniense
                                </span>
                            </div>
                            <p className="text-zinc-500 text-xs leading-relaxed max-w-sm">
                                Unidad gubernamental de ingeniería y tecnología pública del Reino del Pan. Adscrita al Ministerio de Transformación Digital.
                            </p>
                        </div>

                        {/* Enlaces de interés */}
                        <div className="md:col-span-3 flex flex-col gap-2">
                            <span className="font-title font-bold text-white uppercase text-[11px] tracking-wider mb-2">
                                Recursos Gubernamentales
                            </span>
                            <a href="#" className="hover:text-white transition">Sede Electrónica Nacional</a>
                            <a href="#" className="hover:text-white transition">Boletín Oficial del Reino</a>
                            <a href="#" className="hover:text-white transition">Portal de Transparencia</a>
                            <a href="#" className="hover:text-white transition">Estándares Web y Accesibilidad</a>
                        </div>

                        {/* Legales e Información */}
                        <div className="md:col-span-4 flex flex-col gap-2">
                            <span className="font-title font-bold text-white uppercase text-[11px] tracking-wider mb-2">
                                Seguridad y Licencia
                            </span>
                            <p className="text-zinc-500 text-xs leading-relaxed">
                                El código desarrollado por Fuerza Tech Paniense está bajo Licencia Pública Paniense salvo especificación en contrario.
                            </p>
                            <p className="text-zinc-600 text-[11px] mt-4">
                                © 2026 Reino del Pan · Todos los derechos reservados.
                            </p>
                        </div>

                    </div>
                </footer>

            </div>
        </div>
    );
}