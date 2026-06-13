import React from 'react';
import './LPB.css'; // Ruta del CSS solicitada

export default function LaboralPanianBank() {
    return (
        <div id="root" className="min-h-screen bg-background text-foreground font-sans">

            {/* HEADER / NAVEGACIÓN */}
            <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
                <div className="container h-20 flex items-center justify-between">
                    {/* Logo con la clase animada del CSS */}
                    <div className="flex items-center gap-3">
                        <img
                            src="/LaboralBank/LPB.png"
                            alt="Laboral Panian Bank Logo"
                            className="h-10 w-auto logo-glow rounded-md"
                        />
                        <span className="font-display font-bold text-lg tracking-tight text-primary uppercase">
                            Laboral Panian Bank
                        </span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#alianza" className="nav-link active text-sm font-semibold tracking-wide">La Alianza</a>
                        <a href="#institucional" className="nav-link text-sm font-semibold tracking-wide">Institucional</a>
                        <a href="#proximamente" className="nav-link text-sm font-semibold tracking-wide">Banca Online</a>
                    </nav>

                    <div>
                        <a href="#proximamente" className="btn-minimal">
                            Acceso Clientes
                        </a>
                    </div>
                </div>
            </header>

            {/* SECCIÓN HERO / ALIANZA FINANCIERA */}
            <main className="flex-grow">
                <section id="alianza" className="section-spacious bg-gradient-to-b from-secondary/50 to-transparent">
                    <div className="container grid md:grid-cols-12 gap-12 items-center">

                        {/* Texto Principal */}
                        <div className="md:col-span-7 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                                Alianza Financiera Internacional
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight font-bold">
                                El futuro de la banca paniense comienza hoy
                            </h1>

                            <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
                                El Gobierno del Reino del Pan y Laboral Kutxa han alcanzado un acuerdo para la creación de
                                <strong className="text-primary font-semibold"> Laboral Panian Bank</strong>. Una nueva entidad financiera
                                que impulsará el ahorro, la inversión y el crecimiento económico del país.
                            </p>

                            <div className="pt-4">
                                <p className="text-sm font-bold uppercase tracking-wider text-foreground mb-3">
                                    Se une a nosotros para crear la primera entidad financiera del Reino del Pan
                                </p>
                                <div className="h-1 w-20 bg-accent rounded-full"></div>
                            </div>
                        </div>

                        {/* Panel Lateral: Aviso de Banca Online */}
                        <div id="proximamente" className="md:col-span-5">
                            <div className="bank-card border-2 border-primary/20 bg-card p-8 relative overflow-hidden shadow-xl">
                                {/* Indicador de estado */}
                                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-bl-md">
                                    Próximamente
                                </div>

                                <h3 className="text-xl font-display font-bold text-primary mb-4">
                                    Sede Electrónica
                                </h3>

                                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                                    Nuestros ingenieros y equipos reguladores están ultimando los sistemas de alta seguridad para ofrecerte la experiencia digital más robusta del Reino del Pan.
                                </p>

                                {/* Caja de Estado Informativo */}
                                <div className="bg-secondary p-4 rounded-md border border-border mb-6">
                                    <div className="flex items-start gap-3">
                                        <span className="text-xl mt-0.5">⚠️</span>
                                        <div>
                                            <h4 className="text-sm font-bold text-foreground">Banca Online No Operativa</h4>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Las consultas de saldo, transferencias y contratación de productos digitales se habilitarán tras el despliegue de la fase institucional.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Formulario Simulado de Registro de Interés */}
                                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                            Introduce tu correo para recibir el alta prioritaria
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="ejemplo@reinodelpan.gov"
                                            className="w-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                                        />
                                    </div>
                                    <button type="button" className="w-full bg-primary text-white text-sm font-semibold py-3 rounded-md hover:bg-primary/90 transition active:scale-[0.99]">
                                        Notificarme en el lanzamiento
                                    </button>
                                </form>
                            </div>
                        </div>

                    </div>
                </section>

                <div className="container">
                    <hr className="divider-brand" />
                </div>

                {/* SECCIÓN DATOS INSTITUCIONALES / SEGURIDAD */}
                <section id="institucional" className="py-12 bg-card">
                    <div className="container">
                        <div className="grid sm:grid-cols-3 gap-8 text-center md:text-left">
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Respaldo Gubernamental</h4>
                                <p className="text-sm text-foreground">Garantizado por el tesoro y los fondos soberanos del Reino del Pan.</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Experiencia Europea</h4>
                                <p className="text-sm text-foreground">Desarrollado bajo la solvencia, tecnología y buenas prácticas de Laboral Kutxa.</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Datos Financieros Seguros</h4>
                                <p className="text-sm text-foreground font-sans">Sistemas adaptados con cifrado asimétrico y tecnología <span className="financial-data font-medium">2026</span>.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="bg-secondary border-t border-border mt-auto py-8">
                <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <span className="font-display font-bold uppercase tracking-wider text-foreground">Laboral Panian Bank</span>
                        <span>© 2026. Todos los derechos reservados.</span>
                    </div>
                    <div className="flex gap-6">
                        <span className="can-select cursor-help">Soporte: info@laboralpanian.com</span>
                        <span className="financial-data">v0.1.0-alpha</span>
                    </div>
                </div>
            </footer>

        </div>
    );
}