import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Terms() {
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
            Términos y Condiciones
          </h1>

          <div className="space-y-6 text-foreground/75 leading-relaxed text-sm md:text-base">

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                1. Aceptación de Términos
              </h2>
              <p>
                Al acceder y utilizar el sitio web del Reino del Pan, aceptas cumplir con estos términos y condiciones en su totalidad. Si no estás de acuerdo con alguna parte, debes abstenerte de usar este sitio y sus servicios.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                2. Uso del Sitio
              </h2>
              <p>
                El sitio web del Reino del Pan es de uso personal e informativo. Queda expresamente prohibido:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>El uso automatizado, masivo o mediante bots para generar solicitudes de DPI</li>
                <li>Cualquier intento de manipular, alterar o explotar el sistema de numeración de DPIs</li>
                <li>El uso malicioso orientado a saturar, degradar o comprometer el servicio</li>
                <li>Intentar acceder a datos de otros ciudadanos sin autorización</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                3. Solicitud de DPI
              </h2>
              <p>
                Al solicitar el Documento Personal de Identidad (DPI), el usuario confirma que toda la información proporcionada es verídica y cumple con las normas del Reino del Pan.
              </p>
              <p className="mt-3">
                El sistema aplica límites automáticos por dirección IP para prevenir el abuso:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Hasta 5 DPIs por IP: uso normal permitido</li>
                <li>A partir de 5 DPIs: bloqueo temporal de 24 horas</li>
                <li>A partir de 10 DPIs: bloqueo de 7 días</li>
              </ul>
              <p className="mt-3">
                Cada número de DPI es único e irrepetible, generado de forma atómica para garantizar que no existan duplicados aunque haya múltiples solicitudes simultáneas.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                4. Normas de Nombres, Imágenes y Contenido
              </h2>
              <p>
                Los nombres, apellidos, fotos y firmas deben cumplir criterios de integridad y formato. No se permiten nombres ofensivos, discriminatorios, inapropiados o destinados a generar confusión.
              </p>
              <p className="mt-3">Normas de formato para nombre y apellidos:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Solo se permiten letras (incluyendo acentos y ñ) y espacios</li>
                <li>Mínimo 2 letras válidas</li>
                <li>Máximo 2 palabras en el nombre, máximo 4 en los apellidos</li>
                <li>Sin espacios al inicio ni al final</li>
                <li>Nombre: máximo 20 caracteres. Apellidos: máximo 30 caracteres</li>
              </ul>
              <p className="mt-3">
                El incumplimiento de estas normas resultará en el rechazo automático de la solicitud.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                5. Foto y Firma
              </h2>
              <p>
                La foto de perfil y la firma manuscrita se procesan y renderizan íntegramente en el navegador del usuario. Estos datos <strong className="text-foreground">no se transmiten ni se almacenan</strong> en ningún servidor del Reino del Pan.
              </p>
              <p className="mt-3">
                Como consecuencia, en caso de recuperación de un DPI, la foto y la firma no podrán ser regeneradas. El documento recuperado mostrará los datos textuales y el código QR, pero sin imagen ni firma original.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                6. Verificación en Discord
              </h2>
              <p>
                El Reino del Pan dispone de un bot oficial en su servidor de Discord que permite verificar la ciudadanía mediante el DPI. Al verificarse, el usuario acepta que su ID y nombre de usuario de Discord queden vinculados a su número de DPI en la base de datos del Reino.
              </p>
              <p className="mt-3">
                Cada DPI solo puede estar vinculado a una cuenta de Discord, y cada cuenta de Discord solo puede verificarse con un DPI. Cualquier intento de usar el mismo DPI desde cuentas distintas será rechazado automáticamente.
              </p>
            </section>

            {/* SECCIÓN 7: Validez y Caducidad del DPI - con enlaces azules y subrayados */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                7. Validez y Caducidad del DPI
              </h2>
              <p>
                Todo DPI generado en la plataforma del Reino del Pan debe ser verificado en el servidor oficial de Discord en un plazo máximo de <strong className="text-foreground">30 días naturales</strong> desde su creación.
              </p>
              <p className="mt-3">
                Transcurrido ese período sin haberse completado la verificación mediante el bot oficial, el DPI <strong className="text-foreground">perderá toda validez legal</strong> y será automáticamente eliminado de la base de datos del Reino. El número de DPI quedará liberado y no podrá ser recuperado.
              </p>
              <p className="mt-3">
                La gestión de este proceso, así como la definición de las normativas asociadas, corresponde al <strong className="text-foreground">Ministerio de Transformación Digital</strong>, que podrá consultar en su sitio oficial:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  Web del Ministerio:{" "}
                  <a
                    href="https://mitd.duckdns.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline underline-offset-2 font-medium hover:text-blue-800"
                  >
                    https://mitd.duckdns.org
                  </a>
                </li>
                <li>
                  Normativas y disposiciones:{" "}
                  <a
                    href="https://mitd.duckdns.org/normativas"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline underline-offset-2 font-medium hover:text-blue-800"
                  >
                    https://mitd.duckdns.org/normativas
                  </a>
                </li>
              </ul>
              <p className="mt-3 text-foreground/60 text-xs">
                El Ministerio se reserva el derecho de modificar los plazos o condiciones mediante disposiciones publicadas en su portal.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                8. Conducta del Usuario
              </h2>
              <p>
                El uso de datos ofensivos, imágenes inapropiadas o firmas malintencionadas resultará en sanciones. Dependiendo de la gravedad, estas pueden incluir:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Rechazo inmediato del DPI</li>
                <li>Eliminación del registro asociado en la base de datos</li>
                <li>Bloqueo temporal o permanente del acceso a la plataforma</li>
                <li>Expulsión del servidor de Discord del Reino del Pan</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                9. Responsabilidad
              </h2>
              <p>
                El sistema se proporciona "tal cual", sin garantías de disponibilidad continua ni ausencia de errores. El Reino del Pan no se hace responsable de pérdidas de datos, interrupciones del servicio ni daños derivados del uso o imposibilidad de uso de la plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                10. Enlaces Externos
              </h2>
              <p>
                El sitio puede contener enlaces a sitios externos. No nos hacemos responsables del contenido, políticas ni prácticas de terceros.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                11. Modificaciones
              </h2>
              <p>
                Estos términos pueden ser modificados en cualquier momento sin previo aviso. El uso continuado del sitio tras cualquier modificación implica la aceptación de los nuevos términos.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                12. Contacto
              </h2>
              <p>
                Para dudas, reclamaciones o solicitudes relacionadas con estos términos, contáctanos mediante nuestro{" "}
                <a
                  href="https://discord.gg/reino-del-pan-1381359904731693056"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline underline-offset-4 font-medium"
                >
                  servidor oficial
                </a>.
              </p>
            </section>

            <section className="pt-4 border-t border-border">
              <p className="text-xs md:text-sm text-foreground/50">
                Última actualización: 21 de junio de 2026
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}