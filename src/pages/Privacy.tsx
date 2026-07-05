import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Privacy() {
  const goBack = () => window.history.back();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-accent/20">
      <Header />

      <main className="flex-1 py-12 md:py-20 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Botón Volver */}
          <button
            onClick={goBack}
            className="mb-8 inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-muted-foreground hover:text-accent border border-border/60 hover:border-accent rounded-full px-4 py-2 bg-card/50 transition cursor-pointer backdrop-blur-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </button>

          {/* Encabezado Principal Dividido */}
          <header className="mb-12 border-b border-border/60 pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-accent uppercase">
                Política de Privacidad
              </h1>
            </div>
            <div className="md:text-right shrink-0">
              <p className="text-xs text-muted-foreground/80 font-medium tracking-wider uppercase bg-card border border-border/40 px-3 py-1 rounded-md inline-block">
                Última actualización: 1 de junio de 2026
              </p>
            </div>
          </header>

          {/* Cuerpo Legal */}
          <div className="space-y-12 text-foreground/85 leading-relaxed text-sm md:text-base max-w-2xl">

            {/* Sección 1 */}
            <section className="scroll-mt-20">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">
                1. Introducción
              </h2>
              <p>
                En el Reino del Pan, protegemos tu privacidad y tratamos tus datos personales con el mayor cuidado. Esta política explica qué datos recopilamos, cómo los utilizamos y qué medidas aplicamos para protegerlos.
              </p>
            </section>

            {/* Sección 2 */}
            <section className="scroll-mt-20">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">
                2. Información que Recopilamos
              </h2>
              <p className="mb-4">
                Al solicitar un DPI, recopilamos y almacenamos en nuestra base de datos los siguientes datos:
              </p>

              <ul className="space-y-2.5 pl-1 text-foreground/80 mb-6">
                <li className="flex items-start gap-2.5">
                  <span className="text-accent font-bold mt-0.5">•</span>
                  <span>Nombre y apellidos</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-accent font-bold mt-0.5">•</span>
                  <span>Género</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-accent font-bold mt-0.5">•</span>
                  <span>Fecha de nacimiento</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-accent font-bold mt-0.5">•</span>
                  <span>Región de procedencia</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-accent font-bold mt-0.5">•</span>
                  <span>Dirección IP en el momento de la solicitud (con fines de auditoría y control de abuso)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-accent font-bold mt-0.5">•</span>
                  <span>Fecha de expedición y validez del documento</span>
                </li>
              </ul>

              {/* Bloque Destacado: Seguridad Local */}
              <div className="my-6 p-5 rounded-xl border border-accent/20 bg-accent/5 backdrop-blur-xs">
                <p className="font-bold text-accent mb-2 text-xs uppercase tracking-wider">
                  Privacidad Absoluta de Archivos:
                </p>
                <p className="text-sm text-foreground/90 font-medium">
                  Tu foto y tu firma nunca salen de tu dispositivo. La generación del DPI se realiza íntegramente en tu navegador: la imagen se construye localmente y no se envía ni se almacena en ningún servidor.
                </p>
              </div>

              <p>
                Si te verificas en nuestro servidor de Discord, también almacenamos tu ID y nombre de usuario de Discord, vinculados a tu número de DPI.
              </p>
            </section>

            {/* Sección 3 */}
            <section className="scroll-mt-20">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">
                3. Uso de la Información
              </h2>
              <p className="mb-4">Los datos recopilados se utilizan exclusivamente para:</p>

              <ul className="space-y-2.5 pl-1 text-foreground/80 mb-4">
                <li className="flex items-start gap-2.5">
                  <span className="text-accent font-bold mt-0.5">•</span>
                  <span>Emitir y validar el Documento Personal de Identidad (DPI).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-accent font-bold mt-0.5">•</span>
                  <span>Verificar la identidad de los ciudadanos en el servidor de Discord del Reino del Pan.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-accent font-bold mt-0.5">•</span>
                  <span>Prevenir el abuso del sistema (solicitudes masivas, duplicados, suplantación de identidad).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-accent font-bold mt-0.5">•</span>
                  <span>Auditoría interna de seguridad.</span>
                </li>
              </ul>

              <p className="text-sm font-semibold text-accent/90 bg-card/40 border border-border/60 rounded-lg p-3 inline-block">
                ✓ No compartimos tus datos con terceros ni los utilizamos con fines comerciales o publicitarios.
              </p>
            </section>

            {/* Sección 4 */}
            <section className="scroll-mt-20">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">
                4. Seguridad
              </h2>
              <p>
                Implementamos medidas de seguridad técnicas y administrativas para proteger tus datos personales contra accesos no autorizados. Las comunicaciones entre tu dispositivo y nuestros servidores se realizan de forma estrictamente cifrada.
              </p>
            </section>

            {/* Sección 5 */}
            <section className="scroll-mt-20">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">
                5. Tus Derechos
              </h2>
              <p>
                Tienes derecho a acceder, rectificar o solicitar la eliminación de tus datos personales en cualquier momento. Para ejercer estos derechos de ciudadanía, puedes ponerte en contacto con nosotros a través de nuestros canales oficiales.
              </p>
            </section>

            {/* Sección 6 */}
            <section className="scroll-mt-20 border-t border-border pt-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">
                6. Contacto
              </h2>
              <p>
                Si tienes preguntas sobre esta política o deseas ejercer tus derechos, contáctanos mediante nuestro{" "}
                <a
                  href="https://discord.gg/reino-del-pan-1381359904731693056"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline underline-offset-4 font-semibold hover:opacity-80 transition"
                >
                  servidor oficial de Discord
                </a>.
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}