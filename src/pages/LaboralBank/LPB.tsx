import React from 'react';
import "tailwindcss";

export default function LaboralPanianBank() {
    return (
        <div id="root">
            {/* ESTILOS CSS ENCAPSULADOS PARA ESTA WEB */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @import "tw-animate-css";

                @custom-variant dark (&:is(.dark *));

                /* ==========================================================================
                   TIPOGRAFÍAS (Optimización Bancaria)
                   ========================================================================== */
                @font-face {
                    font-family: 'Plus Jakarta Sans';
                    src: url('/fonts/PlusJakartaSans-Bold.woff2') format('woff2'),
                        url('/fonts/PlusJakartaSans-Bold.woff') format('woff');
                    font-weight: 700;
                    font-style: normal;
                    font-display: swap;
                }

                @font-face {
                    font-family: 'Plus Jakarta Sans';
                    src: url('/fonts/PlusJakartaSans-SemiBold.woff2') format('woff2'),
                        url('/fonts/PlusJakartaSans-SemiBold.woff') format('woff');
                    font-weight: 600;
                    font-style: normal;
                    font-display: swap;
                }

                @font-face {
                    font-family: 'Inter';
                    src: url('/fonts/Inter-Regular.woff2') format('woff2'),
                        url('/fonts/Inter-Regular.woff') format('woff');
                    font-weight: 400;
                    font-style: normal;
                    font-display: swap;
                }

                @font-face {
                    font-family: 'Inter';
                    src: url('/fonts/Inter-Medium.woff2') format('woff2'),
                        url('/fonts/Inter-Medium.woff') format('woff');
                    font-weight: 500;
                    font-style: normal;
                    font-display: swap;
                }

                /* ==========================================================================
                   CONFIGURACIÓN DEL TEMA (Tailwind CSS v4.0 Inline Theme)
                   ========================================================================== */
                @theme inline {
                    --radius-sm: calc(var(--radius) - 4px);
                    --radius-md: calc(var(--radius) - 2px);
                    --radius-lg: var(--radius);
                    --radius-xl: calc(var(--radius) + 4px);

                    --color-background: var(--background);
                    --color-foreground: var(--foreground);
                    --color-card: var(--card);
                    --color-card-foreground: var(--card-foreground);

                    --color-primary: var(--primary);
                    --color-primary-foreground: var(--primary-foreground);
                    --color-secondary: var(--secondary);
                    --color-secondary-foreground: var(--secondary-foreground);

                    --color-muted: var(--muted);
                    --color-muted-foreground: var(--muted-foreground);

                    --color-accent: var(--accent);
                    --color-accent-foreground: var(--accent-foreground);

                    --color-border: var(--border);
                    --color-input: var(--input);
                    --color-ring: var(--ring);

                    --font-sans: var(--body-font);
                    --font-display: var(--display-font);
                }

                :root {
                    --primary: #550252;
                    --primary-foreground: #ffffff;
                    --foreground: #471D26;
                    --muted-foreground: #61465D;
                    --accent: #7cd697;
                    --accent-foreground: #471D26;

                    --background: #fdfcfd;
                    --card: #ffffff;
                    --card-foreground: #471D26;
                    --secondary: #f6f0f4;
                    --secondary-foreground: #550252;
                    --muted: #f0e6ed;
                    --border: #e4dae2;
                    --input: #ffffff;
                    --ring: #550252;
                    --radius: 0.625rem;

                    --display-font: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
                    --body-font: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
                }

                .dark {
                    --background: #1a0f14;
                    --foreground: #f6f0f4;
                    --card: #25161d;
                    --card-foreground: #f6f0f4;
                    --primary: #7d1279;
                    --primary-foreground: #ffffff;
                    --secondary: #331e28;
                    --secondary-foreground: #7cd697;
                    --muted: #3a2530;
                    --muted-foreground: #a38fa0;
                    --border: #442d39;
                    --input: #1e1218;
                    --ring: #7cd697;
                }

                /* ==========================================================================
                   ESTILOS GENERALES Y RESET (Acotados a #root para no romper globales)
                   ========================================================================== */
                #root {
                    display: flex;
                    flex-direction: column;
                    min-height: 100vh;
                    font-family: var(--body-font);
                    background-color: var(--background);
                    color: var(--foreground);
                    letter-spacing: -0.01em;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-smoothing: grayscale;
                }

                #root *, #root *::before, #root *::after {
                    box-sizing: border-box;
                }

                /* ==========================================================================
                   TIPOGRAFÍA Y JERARQUÍA
                   ========================================================================== */
                #root .display,
                #root .display-font,
                #root h1, #root h2, #root h3, #root h4, #root h5, #root h6 {
                    font-family: var(--display-font);
                    font-weight: 700;
                    letter-spacing: -0.02em;
                }

                #root .financial-data,
                #root .balance-amount,
                #root .iban-display,
                #root table {
                    font-variant-numeric: tabular-nums lining-nums;
                    letter-spacing: 0em;
                }

                /* ==========================================================================
                   COMPONENTES DE LA SEDE ELECTRÓNICA
                   ========================================================================== */
                #root .logo-glow {
                    box-shadow: 0 4px 12px rgba(85, 2, 82, 0.08);
                    transition: transform 220ms cubic-bezier(.2, .9, .3, 1), box-shadow 220ms, filter 0.25s ease;
                }

                #root .logo-glow:hover {
                    transform: translateY(-2px);
                    filter: drop-shadow(0 0 12px rgba(124, 214, 151, 0.35));
                }

                #root .nav-link {
                    position: relative;
                    color: var(--muted-foreground);
                    font-weight: 500;
                    transition: color 200ms ease;
                }

                #root .nav-link:hover,
                #root .nav-link.active {
                    color: var(--primary);
                }

                .dark #root .nav-link:hover,
                .dark #root .nav-link.active {
                    color: var(--accent);
                }

                #root img {
                    display: block;
                    max-width: 100%;
                    height: auto;
                    user-select: none !important;
                    -webkit-user-select: none !important;
                    -moz-user-select: none !important;
                    -webkit-user-drag: none !important;
                }

                #root a {
                    color: inherit;
                    text-decoration: none;
                    cursor: pointer;
                    -webkit-user-drag: none !important;
                }

                #root button, #root select {
                    cursor: pointer;
                    -webkit-user-drag: none !important;
                }

                #root button, #root input, #root textarea, #root select {
                    font: inherit;
                }

                #root input, #root textarea {
                    cursor: text;
                }

                #root input[type="text"],
                #root input[type="password"],
                #root input[type="number"] {
                    background-color: var(--input);
                    border: 1px solid var(--border);
                    color: var(--foreground);
                    border-radius: var(--radius-sm);
                    transition: border-color 0.2s, box-shadow 0.2s;
                }

                #root input[type="text"]:focus,
                #root input[type="password"]:focus,
                #root input[type="number"]:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(85, 2, 82, 0.15);
                }

                /* ==========================================================================
                   LAYOUT Y CONTENEDORES
                   ========================================================================== */
                #root .container {
                    width: 100%;
                    max-width: 1280px;
                    margin-left: auto;
                    margin-right: auto;
                    padding-left: 1.5rem;
                    padding-right: 1.5rem;
                }

                @media (min-width: 768px) {
                    #root .container {
                        padding-left: 2.5rem;
                        padding-right: 2.5rem;
                    }
                }

                /* ==========================================================================
                   CLASES DE UTILIDAD / ACCESIBILIDAD (Tailwind Apply alternativo)
                   ========================================================================== */
                #root .btn-minimal {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 0.375rem;
                    border: 2px solid var(--primary);
                    background-color: transparent;
                    padding: 0.625rem 1.5rem;
                    font-size: 0.875rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--primary);
                    transition: all 0.2s ease;
                }

                #root .btn-minimal:hover {
                    background-color: var(--primary);
                    color: #ffffff;
                }

                #root .btn-minimal:active {
                    transform: scale(0.98);
                }

                #root .btn-minimal:focus {
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(85, 2, 82, 0.5);
                }

                .dark #root .btn-minimal {
                    border-color: var(--accent);
                    color: var(--accent);
                }

                .dark #root .btn-minimal:hover {
                    background-color: var(--accent);
                    color: var(--background);
                }

                .dark #root .btn-minimal:focus {
                    box-shadow: 0 0 0 2px rgba(124, 214, 151, 0.5);
                }

                #root .section-spacious {
                    padding-top: 4rem;
                    padding-bottom: 4rem;
                }

                @media (min-width: 1024px) {
                    #root .section-spacious {
                        padding-top: 6rem;
                        padding-bottom: 6rem;
                    }
                }

                #root .divider-brand {
                    height: 1px;
                    background-color: var(--border);
                    margin-top: 3rem;
                    margin-bottom: 3rem;
                }

                #root .bank-card {
                    background-color: var(--card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                    padding: 1.5rem;
                    box-shadow: 0 1px 3px rgba(71, 29, 38, 0.04);
                    transition: box-shadow 0.2s ease, border-color 0.2s ease;
                }

                #root .bank-card:hover {
                    box-shadow: 0 4px 12px rgba(71, 29, 38, 0.08);
                    border-color: var(--border);
                }

                /* ==========================================================================
                   SEGURIDAD VISUAL (Protección contra Data-Scraping)
                   ========================================================================== */
                #root *:not(.can-select) * {
                    user-select: none;
                    -webkit-user-select: none !important;
                    -moz-user-select: none !important;
                    -ms-user-select: none !important;
                }

                #root .can-select,
                #root .can-select * {
                    user-select: text !important;
                    -webkit-user-select: text !important;
                    -moz-user-select: text !important;
                }
            `}} />

            {/* HEADER / NAVEGACIÓN */}
            <header style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--card)', padding: '0 1.5rem' }}>
                <div className="container" style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                    {/* Bloque del Logo */}
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

                    {/* Enlaces de Navegación */}
                    <nav className="can-select" style={{ display: 'flex', gap: '2rem' }}>
                        <a href="#alianza" className="nav-link active">La Alianza</a>
                        <a href="#institucional" className="nav-link">Institucional</a>
                        <a href="#proximamente" className="nav-link">Banca Online</a>
                    </nav>

                    {/* Botón de Acceso */}
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

                {/* Separador */}
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
                        <span className="financial-data">v0.1.0-alpha</span>
                    </div>
                </div>
            </footer>

        </div>
    );
}