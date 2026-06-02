import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Privacy() {
  const goBack = () => window.history.back();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 py-12 md:py-16 px-4 md:px-0">
        <div className="container mx-auto max-w-3xl">
          <button
            onClick={goBack}
            className="mb-6 inline-flex items-center gap-1 text-sm text-accent hover:text-accent/80 transition cursor-pointer border border-accent/30 hover:border-accent rounded-full px-4 py-1.5"
          >
            ← Volver
          </button>

          <h1 className="text-3xl md:text-4xl font-bold text-accent mb-8">
            Política de Privacidad
          </h1>

          <div className="space-y-6 text-foreground/75 leading-relaxed text-sm md:text-base">

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                1. Introducción
              </h2>
              <p>
                En Reino del Pan, protegemos tu privacidad y tratamos tus datos personales con el mayor cuidado. Esta política explica qué datos recopilamos, cómo los utilizamos y qué medidas aplicamos para protegerlos.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                2. Información que Recopilamos
              </h2>
              <p>Al solicitar un DPI, recopilamos y almacenamos en nuestra base de datos los siguientes datos:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Nombre y apellidos</li>
                <li>Género</li>
                <li>Fecha de nacimiento</li>
                <li>Región de procedencia</li>
                <li>Dirección IP en el momento de la solicitud (con fines de auditoría y control de abuso)</li>
                <li>Fecha de expedición y validez del documento</li>
              </ul>
              <p className="mt-3">
                <strong className="text-foreground">Tu foto y tu firma nunca salen de tu dispositivo.</strong> La generación del DPI se realiza íntegramente en tu navegador: la imagen se construye localmente y no se envía ni se almacena en ningún servidor.
              </p>
              <p className="mt-3">
                Si te verificas en nuestro servidor de Discord, también almacenamos tu ID y nombre de usuario de Discord, vinculados a tu número de DPI.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                3. Uso de la Información
              </h2>
              <p>Los datos recopilados se utilizan exclusivamente para:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Emitir y validar el Documento Personal de Identidad (DPI)</li>
                <li>Verificar la identidad de los ciudadanos en el servidor de Discord del Reino del Pan</li>
                <li>Prevenir el abuso del sistema (solicitudes masivas, duplicados, suplantación de identidad)</li>
                <li>Auditoría interna de seguridad</li>
              </ul>
              <p className="mt-3">
                No compartimos tus datos con terceros ni los utilizamos con fines comerciales o publicitarios.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                4. Seguridad
              </h2>
              <p>
                Implementamos medidas de seguridad técnicas y administrativas para proteger tus datos personales contra accesos no autorizados. Las comunicaciones entre tu dispositivo y nuestros servidores se realizan de forma cifrada.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                5. Tus Derechos
              </h2>
              <p>
                Tienes derecho a acceder, rectificar o solicitar la eliminación de tus datos personales en cualquier momento. Para ejercer estos derechos, contáctanos a través de nuestros canales oficiales.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                6. Contacto
              </h2>
              <p>
                Si tienes preguntas sobre esta política o deseas ejercer tus derechos, Contáctanos mediante nuestro{" "}<a href="https://discord.gg/reino-del-pan-1381359904731693056" target="_blank" rel="noopener noreferrer" style={{ color: "#d4af37", textDecoration: "underline", textUnderlineOffset: "4px", fontWeight: 600 }}>Servidor oficial</a>
              </p>
            </section>

            <section className="pt-4 border-t border-border">
              <p className="text-xs md:text-sm text-foreground/50">
                Última actualización: 1 de junio de 2026
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
