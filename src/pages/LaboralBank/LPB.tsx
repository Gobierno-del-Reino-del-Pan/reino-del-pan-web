import React from 'react';
import './LPB.css';

export default function LaboralPanianBank() {
    return (
        <div id="root">

            {/* HEADER / NAVEGACIÓN */}
            <header style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--card)', padding: '0 1.5rem' }}>
                <div className="container" style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                    {/* Bloque del Logo: Contenido y protegido para no deformarse */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                            src="/LaboralBank/LPB.png"
                            alt="Laboral Panian Bank"
                            className="logo-glow"
                            style={{ height: '40px', width: 'auto', display: 'block', objectFit: 'contain' }}
                        />
                        <span className="display-font" style={{ fontSize: '1.25rem', color: 'var(--primary)', textTransform: 'uppercase' }}>
                            Laboral Panian Bank
                        </span>
                    </div>

                    {/* Enlaces de Navegación usando las clases de tu CSS */}
                    <nav className="can-select" style={{ display: 'flex', gap: '2rem' }}>
                        <a href="#alianza" className="nav-link active">La Alianza</a>
                        <a href="#institucional" className="nav-link">Institucional</a>
                        <a href="#proximamente" className="nav-link">Banca Online</a>
                    </nav>

                    {/* Botón de Acceso usando tu clase CSS */}
                    <div>
                        <a href="#proximamente" className="btn-minimal">
                            Acceso Clientes
                        </a>
                    </div>
                </div>
            </header>

            {/* CUERPO PRINCIPAL */}
            <main style={{ flexGrow: 1 }}>

                {/* Sección Hero: Alianza Financiera */}
                <section id="alianza" className="section-spacious" style={{ backgroundColor: 'var(--secondary)' }}>
                    <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>

                        {/* Bloque Informativo Institucional */}
                        <div className="can-select" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)' }}>
                                Alianza Financiera
                            </span>

                            <h1 className="display-font" style={{ fontSize: '2.5rem', lineHeight: '1.2', margin: 0 }}>
                                Laboral Panian Bank
                            </h1>

                            <p style={{ color: 'var(--muted-foreground)', fontSize: '1.125rem', lineHeight: '1.6', margin: 0 }}>
                                El Gobierno del Reino del Pan y Laboral Kutxa han alcanzado un acuerdo para la creación de <strong>Laboral Panian Bank</strong>. Una nueva entidad financiera que impulsará el ahorro, la inversión y el crecimiento económico del país. El futuro de la banca paniense comienza hoy.
                            </p>

                            <div style={{ marginTop: '1rem' }}>
                                <p style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--foreground)', margin: '0 0 0.75rem 0' }}>
                                    Se une a nosotros para crear la primera entidad financiera del Reino del Pan
                                </p>
                            </div>
                        </div>

                        {/* Bloque de Contingencia: Estado de la Sede Electrónica */}
                        <div id="proximamente">
                            <div className="bank-card">
                                <h3 className="display-font" style={{ fontSize: '1.5rem', color: 'var(--primary)', margin: '0 0 1rem 0' }}>
                                    Sede Electrónica
                                </h3>

                                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', lineHeight: '1.5', margin: '0 0 1.5rem 0' }}>
                                    Nuestros equipos técnicos y de regulación están terminando los sistemas para garantizar una operativa segura.
                                </p>

                                {/* Mensaje de Alerta */}
                                <div style={{ backgroundColor: 'var(--muted)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', margin: '0 0 1.5rem 0' }}>
                                    <h4 className="display-font" style={{ fontSize: '0.875rem', color: 'var(--foreground)', margin: '0 0 0.25rem 0' }}>
                                        ⚠️ Banca Online No Operativa
                                    </h4>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', margin: 0 }}>
                                        Las consultas de saldo, transferencias y contratación de productos digitales se habilitarán próximamente.
                                    </p>
                                </div>

                                {/* Formulario de Notificación */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                                            Registro de interés
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="ejemplo@reinodelpan.gov"
                                            style={{ width: '100%', padding: '0.75rem', fontSize: '0.875rem' }}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        Notificarme en el lanzamiento
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* Separador nativo de tu CSS */}
                <div className="container">
                    <div className="divider-brand" />
                </div>

                {/* Detalles institucionales */}
                <section id="institucional" style={{ padding: '3rem 0', backgroundColor: 'var(--card)' }}>
                    <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                        <div>
                            <h4 className="display-font" style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>Respaldo Institucional</h4>
                            <p style={{ fontSize: '0.875rem', margin: 0 }}>Garantizado por el Gobierno del Reino del Pan.</p>
                        </div>
                        <div>
                            <h4 className="display-font" style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>Garantía y Solvencia</h4>
                            <p style={{ fontSize: '0.875rem', margin: 0 }}>Desarrollado en alianza estratégica junto a Laboral Kutxa.</p>
                        </div>
                        <div>
                            <h4 className="display-font" style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>Infraestructura Segura</h4>
                            <p style={{ fontSize: '0.875rem', margin: 0 }}>
                                Cifrado financiero desplegado en el año <span className="financial-data">2026</span>.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer style={{ backgroundColor: 'var(--secondary)', borderTop: '1px solid var(--border)', padding: '2rem 1.5rem' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className="display-font" style={{ fontWeight: 700, color: 'var(--foreground)' }}>LABORAL PANIAN BANK</span>
                        <span>© <span className="financial-data">2026</span>. Todos los derechos reservados.</span>
                    </div>
                    <div className="can-select" style={{ display: 'flex', gap: '1.5rem' }}>
                        <span>Contacto: info@laboralpanian.com</span>
                        <span className="financial-data">v0.1.0-alpha</span>
                    </div>
                </div>
            </footer>

        </div>
    );
}