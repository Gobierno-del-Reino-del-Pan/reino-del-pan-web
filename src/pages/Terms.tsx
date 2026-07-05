import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Terms() {
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

          {/* Encabezado Principal */}
          <header className="mb-12 border-b border-border/60 pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-accent uppercase">
                Términos y Condiciones
              </h1>
            </div>
            <div className="md:text-right shrink-0">
              <p className="text-xs text-muted-foreground/80 font-medium tracking-wider uppercase bg-card border border-border/40 px-3 py-1 rounded-md inline-block">
                Última actualización: 21 de junio de 2026
              </p>
            </div>
          </header>

          {/* Cuerpo Legal */}
          <div className="space-y-12 text-foreground/85 leading-relaxed text-sm md:text-base max-w-2xl">

            {/* Sección 1 */}
            <section className="scroll-mt-20">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">
                1. Aceptación de Términos
              </h2>
              <p>
                Al acceder y utilizar el sitio web del Reino del Pan, aceptas cumplir con estos términos y condiciones en su totalidad. Si no estás de acuerdo con alguna parte, debes abstenerte de usar este sitio y sus servicios.
              </p>
            </section>

            {/* Sección 2 */}
            <section className="scroll-mt-20">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">
                2. Uso del Sitio
              </h2>
              <p className="mb-4">
                El sitio web del Reino del Pan es de uso personal e informativo. Queda expresamente prohibido:
              </p>
              <ul className="space-y-2.5 pl-1 text-foreground/80">
                <li className="flex items-start gap-2.5">
                  <span className="text-accent font-bold mt-0.5">•</span>
                  <span>El uso automatizado, masivo o mediante bots para generar solicitudes de DPI.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-accent font-bold mt-0.5">•</span>
                  <span>Cualquier intento de manipular, alterar o explotar el sistema de numeración de DPIs.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-accent font-bold mt-0.5">•</span>
                  <span>El uso malicioso orientado a saturar, degradar o comprometer el servicio.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-accent font-bold mt-0.5">•</span>
                  <span>Intentar acceder a datos de otros ciudadanos sin autorización.</span>
                </li>
              </ul>
            </section>

            {/* Sección 3 */}
            <section className="scroll-mt-20">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">
                3. Solicitud de DPI
              </h2>
              <p className="mb-4">
                Al solicitar el Documento Personal de Identidad (DPI), el usuario confirma que toda la información proporcionada es verídica y cumple con las normas del Reino del Pan.
              </p>

              {/* Alerta de Límites de IP */}
              <div className="my-6 p-4 rounded-xl border border-accent/20 bg-accent/5 backdrop-blur-xs">
                <p className="font-bold text-accent mb-3 text-xs uppercase tracking-wider">
                  Límites automáticos por dirección IP:
                </p>
                <ul className="space-y-2 text-sm text-foreground/90 font-medium">
                  <li className="flex justify-between border-b border-border/40 pb-1.5">
                    <span>Hasta 5 DPIs por IP</span>
                    <span className="text-emerald-500 font-semibold">Uso normal permitido</span>
                  </li>
                  <li className="flex justify-between border-b border-border/40 pb-1.5">
                    <span>A partir de 5 DPIs</span>
                    <span className="text-amber-500 font-semibold">Bloqueo temporal de 24 horas</span>
                  </li>
                  <li className="flex justify-between pt-0.5">
                    <span>A partir de 10 DPIs</span>
                    <span className="text-destructive font-semibold">Bloqueo de 7 días</span>
                  </li>
                </ul>
              </div>

              <p>
                Cada número de DPI es único e irrepetible, generado de forma atómica para garantizar que no existan duplicados aunque haya múltiples solicitudes simultáneas.
              </p>
            </section>

            {/* Sección 4 */}
            <section className="scroll-mt-20">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">
                4. Normas de Nombres, Imágenes y Contenido
              </h2>
              <p className="mb-4">
                Los nombres, apellidos, fotos y firmas deben cumplir criterios de integridad y formato. No se permiten nombres ofensivos, discriminatorios, inapropiados o destinados a generar confusión.
              </p>

              <div className="bg-card/40 border border-border/80 rounded-xl p-5 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Normas estrictas de formato:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs md:text-sm text-foreground/80">
                  <li className="flex items-center gap-2">• Solo letras (con acentos y ñ) y espacios</li>
                  <li className="flex items-center gap-2">• Mínimo 2 letras válidas</li>
                  <li className="flex items-center gap-2">• Máx 2 palabras en nombre / 4 en apellidos</li>
                  <li className="flex items-center gap-2">• Sin espacios al inicio ni al final</li>
                  <li className="flex items-center gap-2">• Nombre: máx. 20 caracteres</li>
                  <li className="flex items-center gap-2">• Apellidos: máx. 30 caracteres</li>
                </ul>
              </div>
              <p className="mt-4 text-xs font-semibold text-destructive/80">
                * El incumplimiento de estas normas resultará en el rechazo automático de la solicitud.
              </p>
            </section>

            {/* Sección 5 */}
            <section className="scroll-mt-20">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">
                5. Foto y Firma
              </h2>
              <p className="mb-3">
                La foto de perfil y la firma manuscrita se procesan y renderizan íntegramente en el navegador del usuario. Estos datos <strong className="text-foreground border-b border-accent/30 font-semibold">no se transmiten ni se almacenan</strong> en ningún servidor del Reino del Pan.
              </p>
              <p>
                Como consecuencia, en caso de recuperación de un DPI, la foto y la firma no podrán ser regeneradas. El documento recuperado mostrará los datos textuales y el código QR, pero sin imagen ni firma original.
              </p>
            </section>

            {/* Sección 6 */}
            <section className="scroll-mt-20">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">
                6. Verificación en Discord
              </h2>
              <p className="mb-3">
                El Reino del Pan dispone de un bot oficial en su servidor de Discord que permite verificar la ciudadanía mediante el DPI. Al verificarse, el usuario acepta que su ID y nombre de usuario de Discord queden vinculados a su número de DPI en la base de datos del Reino.
              </p>
              <p>
                Cada DPI solo puede estar vinculado a una cuenta de Discord, y cada cuenta de Discord solo puede verificarse con un DPI. Cualquier intento de usar el mismo DPI desde cuentas distintas será rechazado automáticamente.
              </p>
            </section>

            {/* Sección 7 */}
            <section className="scroll-mt-20">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">
                7. Validez y Caducidad del DPI
              </h2>
              <p className="mb-4">
                Todo DPI generado en la plataforma del Reino del Pan debe ser verificado en el servidor oficial de Discord en un plazo máximo de <strong className="text-foreground font-semibold">30 días naturales</strong> desde su creación.
              </p>

              {/* Alerta Destructive / Caducidad */}
              <div className="my-6 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-sm">
                Transcurrido ese período sin haberse completado la verificación mediante el bot oficial, el DPI <strong className="text-destructive font-bold uppercase tracking-wide">perderá toda validez legal</strong> y será automáticamente eliminado de la base de datos del Reino. El número de DPI quedará liberado y no podrá ser recuperado.
              </div>

              <p className="mb-4">
                La gestión de este proceso, así como la definición de las normativas asociadas, corresponde al <strong className="text-foreground font-semibold">Ministerio de Transformación Digital</strong>, que podrá consultar en su sitio oficial:
              </p>

              <div className="space-y-2 text-sm bg-card/30 border border-border/50 p-4 rounded-xl font-medium">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground text-xs uppercase tracking-wider self-center">Web del Ministerio:</span>
                  <a
                    href="https://mitd.duckdns.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent underline underline-offset-4 hover:opacity-80 transition break-all"
                  >
                    https://mitd.duckdns.org
                  </a>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 pt-2 border-t border-border/40">
                  <span className="text-muted-foreground text-xs uppercase tracking-wider self-center">Normativas y disposiciones:</span>
                  <a
                    href="https://mitd.duckdns.org/normativas"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent underline underline-offset-4 hover:opacity-80 transition break-all"
                  >
                    https://mitd.duckdns.org/normativas
                  </a>
                </div>
              </div>

              <p className="mt-4 text-muted-foreground/60 text-xs italic">
                El Ministerio se reserva el derecho de modificar los plazos o condiciones mediante disposiciones publicadas en su portal.
              </p>
            </section>

            {/* Sección 8 */}
            <section className="scroll-mt-20">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">
                8. Conducta del Usuario
              </h2>
              <p className="mb-4">
                El uso de datos ofensivos, imágenes inapropiadas o firmas malintencionadas resultará en sanciones. Dependiendo de la gravedad, estas pueden incluir:
              </p>
              <ul className="space-y-2.5 pl-1 text-foreground/80 text-sm">
                <li className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-destructive" /> Rechazo inmediato del DPI.</li>
                <li className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-destructive" /> Eliminación del registro asociado en la base de datos.</li>
                <li className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-destructive" /> Bloqueo temporal o permanente del acceso a la plataforma.</li>
                <li className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-destructive" /> Expulsión del servidor de Discord del Reino del Pan.</li>
              </ul>
            </section>

            {/* Sección 9 */}
            <section className="scroll-mt-20">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">
                9. Responsabilidad
              </h2>
              <p>
                El sistema se proporciona "tal cual", sin garantías de disponibilidad continua ni ausencia de errores. El Reino del Pan no se hace responsable de pérdidas de datos, interrupciones del servicio ni daños derivados del uso o imposibilidad de uso de la plataforma.
              </p>
            </section>

            {/* Sección 10 */}
            <section className="scroll-mt-20">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">
                10. Enlaces Externos
              </h2>
              <p>
                El sitio puede contener enlaces a sitios externos. No nos hacemos responsables del contenido, políticas ni prácticas de terceros.
              </p>
            </section>

            {/* Sección 11 */}
            <section className="scroll-mt-20">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">
                11. Modificaciones
              </h2>
              <p>
                Estos términos pueden ser modificados en cualquier momento sin previo aviso. El uso continuado del sitio tras cualquier modificación implica la aceptación de los nuevos términos.
              </p>
            </section>

            {/* Sección 12 */}
            <section className="scroll-mt-20 border-t border-border pt-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">
                12. Contacto
              </h2>
              <p>
                Para dudas, reclamaciones o solicitudes relacionadas con estos términos, contáctanos mediante nuestro{" "}
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