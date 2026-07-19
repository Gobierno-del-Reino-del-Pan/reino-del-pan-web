import Footer from "../../components/Footer";

export default function PoliciaNacional() {
    // Inyección de fuentes aisladas mediante alcance (scoping) para no afectar al Footer
    const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap');

    @font-face {
      font-family: 'POLNAC';
      src: url('/Policía/POLNAC.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    
    /* Fuentes del ecosistema POLNAC */
    .polnac-scope .font-polnac {
      font-family: 'POLNAC', sans-serif;
    }

    .polnac-scope .font-sans-modern {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    .polnac-scope .font-subtitle {
      font-family: 'Space Grotesk', sans-serif;
    }

    /* Variación de fondo basada en tu color corporativo #011E64 */
    .polnac-scope .bg-polnac-brand {
      background-color: #011E64;
    }
    .polnac-scope .text-polnac-brand {
      color: #011E64;
    }
    .polnac-scope .border-polnac-brand {
      border-color: #011E64;
    }
  `;

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-accent/20">
            {/* Etiqueta de estilo inyectada directamente */}
            <style dangerouslySetInnerHTML={{ __html: customStyles }} />

            {/* Contenedor con alcance aislado para que las fuentes no afecten al Footer */}
            <div className="polnac-scope font-sans-modern flex-1 flex flex-col">

                {/* 1. Franja de Web Oficial del Gobierno */}
                <div className="bg-zinc-900 border-b border-border/40 py-2 px-4 text-[10px] md:text-xs text-zinc-400 font-sans-modern">
                    <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center flex-wrap">
                        <img
                            src="/flag.png"
                            alt="Bandera del Reino del Pan"
                            className="h-3 w-5 opacity-90 inline-block"
                        />
                        <span className="font-semibold tracking-wider uppercase break-words max-w-full">
                            Web oficial del Gobierno del Reino del Pan · Ministerio del Interior y Defensa
                        </span>
                    </div>
                </div>

                {/* 2. Header Institucional */}
                <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-card/30 backdrop-blur-md px-4 py-3 md:py-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">

                        {/* LADO IZQUIERDO: Logo y Títulos */}
                        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
                            <img
                                src="/Policía/POLNAC.png"
                                alt="Logo POLNAC"
                                className="h-10 sm:h-12 md:h-14 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)] shrink-0"
                            />
                            <div className="min-w-0">
                                <span className="font-polnac text-lg sm:text-2xl md:text-3xl font-black tracking-tight uppercase block leading-none text-foreground truncate">
                                    CPNP
                                </span>
                                <span className="text-[8px] sm:text-[10px] tracking-widest font-extrabold uppercase text-polnac-brand mt-0.5 sm:mt-1 block truncate">
                                    Reino del Pan
                                </span>
                            </div>
                        </div>

                        {/* LADO DERECHO: Botón de Regresar */}
                        <div className="flex items-center shrink-0">
                            <a
                                href="/"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/60 bg-background/40 hover:bg-background/80 hover:border-foreground/20 transition-all group font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-foreground/80 shadow-sm"
                            >
                                <span className="text-accent transition-transform group-hover:-translate-x-0.5" aria-hidden="true">←</span>
                                <span>Volver</span>
                            </a>
                        </div>

                    </div>
                </header>

                {/* 3. Banner de Emergencias */}
                <div className="bg-red-950/40 border-b border-red-500/30 px-4 py-3 text-center font-sans-modern">
                    <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2">
                        <span className="inline-flex items-center justify-center bg-red-600 text-white font-black text-xs px-2 py-0.5 rounded animate-pulse shrink-0">
                            ALERTA
                        </span>
                        <p className="text-xs md:text-sm text-red-200 font-medium balance">
                            Si se encuentra ante una situación de emergencia inmediata, llame al <strong className="text-white bg-red-700/60 px-1.5 py-0.5 rounded inline-block my-0.5">112</strong> o al <strong className="text-white bg-red-700/60 px-1.5 py-0.5 rounded inline-block my-0.5">99</strong>.
                        </p>
                    </div>
                </div>

                {/* Cuerpo de la página */}
                <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 md:py-12 space-y-12 md:space-y-16">

                    {/* Enlace destacado central para el trámite del DPI */}
                    <section className="relative overflow-hidden rounded-2xl bg-polnac-brand p-6 sm:p-8 md:p-12 text-center max-w-3xl mx-auto shadow-xl border border-white/10 text-white">
                        <div className="absolute top-0 right-0 p-6 opacity-5 md:opacity-10 pointer-events-none hidden sm:block">
                            <img src="/Policía/POLNAC.png" alt="" className="w-48 h-48 object-contain" />
                        </div>
                        <h2 className="font-polnac text-2xl md:text-4xl font-bold uppercase mb-4 tracking-wide text-white">
                            DPI
                        </h2>
                        <p className="text-blue-100 text-xs sm:text-sm md:text-base max-w-xl mx-auto mb-6 sm:mb-8 leading-relaxed font-normal">
                            Es obligatorio para todos los ciudadanos del reino portar su acreditación vigente. Realice la solicitud de forma segura con cifrado local y procesamiento inmediato.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-3.5">
                            <a
                                href="/dpi/create"
                                className="w-full sm:w-auto inline-flex items-center justify-center text-xs sm:text-sm font-extrabold uppercase tracking-wider bg-white text-polnac-brand hover:bg-zinc-100 px-6 sm:px-8 py-3 rounded-xl transition-all shadow-lg transform hover:scale-[1.02] active:scale-100"
                            >
                                Iniciar Solicitud de DPI
                            </a>
                            <a
                                href="/dpi/restore"
                                className="w-full sm:w-auto inline-flex items-center justify-center text-xs sm:text-sm font-extrabold uppercase tracking-wider bg-white text-polnac-brand hover:bg-zinc-100 px-6 sm:px-8 py-3 rounded-xl transition-all shadow-lg transform hover:scale-[1.02] active:scale-100"
                            >
                                Recuperar DPI
                            </a>
                        </div>
                    </section>

                    {/* Grid Principal: Noticias y Panel Estadístico */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                        {/* Bloque Izquierda: Noticias */}
                        <div className="lg:col-span-2 space-y-6">
                            <h3 className="font-polnac text-xl font-bold uppercase tracking-tight text-muted-foreground border-b border-border/40 pb-2">
                                Actualidad y Notas de Prensa
                            </h3>

                            <div className="space-y-4">
                                <article className="p-4 sm:p-5 rounded-xl border border-border/50 bg-card/40 hover:bg-card/70 transition space-y-2">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-polnac-brand font-subtitle">Operaciones</span>
                                    <h4 className="text-base md:text-lg font-bold text-foreground font-subtitle">
                                        Desarticulada una red clandestina de contrabando de levadura industrial
                                    </h4>
                                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                                        Agentes de la POLNAC incautaron más de tres toneladas de materia prima no registrada en los límites del distrito norte. Cuatro sospechosos han sido puestos a disposición judicial.
                                    </p>
                                </article>

                                <article className="p-4 sm:p-5 rounded-xl border border-border/50 bg-card/40 hover:bg-card/70 transition space-y-2">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-polnac-brand font-subtitle">Seguridad Vial</span>
                                    <h4 className="text-base md:text-lg font-bold text-foreground font-subtitle">
                                        Nuevos controles de velocidad en las rutas de distribución de harinas
                                    </h4>
                                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                                        Con el fin de garantizar la integridad de las cargas críticas, se desplegarán patrullas estáticas automatizadas durante los horarios de alta congestión logística.
                                    </p>
                                </article>

                                <article className="p-4 sm:p-5 rounded-xl border border-border/50 bg-card/40 hover:bg-card/70 transition space-y-2">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-polnac-brand font-subtitle">Institucional</span>
                                    <h4 className="text-base md:text-lg font-bold text-foreground font-subtitle">
                                        Convocatoria abierta para la escala básica de Inspectores del Horno
                                    </h4>
                                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                                        Se habilitan los plazos de inscripción oficiales para el ingreso en la academia nacional. Los aspirantes deberán superar los exámenes físicos y de control de calidad.
                                    </p>
                                </article>
                            </div>
                        </div>

                        {/* Bloque Derecha: Estadísticas en Tiempo Real */}
                        <div className="space-y-6">
                            <div className="font-polnac text-xl font-bold uppercase tracking-tight text-muted-foreground border-b border-border/40 pb-2 flex justify-between items-center">
                                <span>Registro Judicial</span>
                                <span className="inline-flex items-center gap-1.5 text-[10px] text-green-500 tracking-normal normal-case font-semibold">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    Tiempo real
                                </span>
                            </div>

                            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-5 shadow-sm">
                                <div className="text-center border-b border-border/60 pb-4">
                                    <p className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">1129</p>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1 font-subtitle">
                                        Detenidos Totales (Año Actual)
                                    </p>
                                </div>

                                {/* Desglose por delitos */}
                                <div className="space-y-3.5 text-xs sm:text-sm font-normal">
                                    <div>
                                        <div className="flex justify-between font-medium mb-1 font-subtitle">
                                            <span className="text-foreground/90">Baneados</span>
                                            <span className="font-bold">14</span>
                                        </div>
                                        <div className="w-full bg-border/50 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-polnac-brand h-full rounded-full" style={{ width: '15%' }}></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between font-medium mb-1 font-subtitle">
                                            <span className="text-foreground/90">Robos</span>
                                            <span className="font-bold">412</span>
                                        </div>
                                        <div className="w-full bg-border/50 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-polnac-brand h-full rounded-full" style={{ width: '85%' }}></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between font-medium mb-1 font-subtitle">
                                            <span className="text-foreground/90">Suplantación de Identidad</span>
                                            <span className="font-bold">389</span>
                                        </div>
                                        <div className="w-full bg-border/50 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-polnac-brand h-full rounded-full" style={{ width: '65%' }}></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between font-medium mb-1 font-subtitle">
                                            <span className="text-foreground/90">Fraude de Cripto</span>
                                            <span className="font-bold">294</span>
                                        </div>
                                        <div className="w-full bg-border/50 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-polnac-brand h-full rounded-full" style={{ width: '50%' }}></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between font-medium mb-1 font-subtitle">
                                            <span className="text-foreground/90">Asesinatos</span>
                                            <span className="font-bold">34</span>
                                        </div>
                                        <div className="w-full bg-border/50 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-polnac-brand h-full rounded-full" style={{ width: '28%' }}></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Crédito Oficial Obligatorio */}
                                <div className="pt-4 border-t border-border/60 text-center">
                                    <p className="text-[9px] sm:text-[10px] text-muted-foreground/80 font-semibold uppercase tracking-wider leading-relaxed font-subtitle">
                                        Datos validados y ordenados por el<br />
                                        <span className="text-polnac-brand font-extrabold">Ministerio de Desregulación y Pokémon</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>

            {/* 4. Footer Reutilizado */}
            <Footer />
        </div>
    );
}