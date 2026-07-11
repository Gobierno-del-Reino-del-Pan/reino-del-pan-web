import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion, Variants } from "framer-motion"; // <-- Tipo Variants importado
// Iconos para dar seriedad institucional
import { ShieldAlert, Landmark, Cpu, BookOpen, ArrowUpRight } from "lucide-react";

export default function Gobierno() {
  // Array de datos para evitar la duplicación de código y facilitar cambios futuros
  const recursos = [
    {
      titulo: "Ministerio de Economía, Comercio y Empresa",
      descripcion: "Portal oficial del Ministerio de Economía, Comercio y Empresa del Reino del Pan.",
      url: "https://mineco.duckdns.org",
      icon: Landmark,
    },
    {
      titulo: "Ministerio de Transformación Digital",
      descripcion: "Portal oficial del Ministerio de Transformación Digital del Reino del Pan. Impulsamos la digitalización y el desarrollo de servicios digitales.",
      url: "https://mitd.duckdns.org",
      icon: Cpu,
    },
    {
      titulo: "Enciclopan",
      descripcion: "La enciclopedia libre y oficial del Reino del Pan. Consulta historia, leyes, cultura y más.",
      url: "https://enciclopan.duckdns.org",
      icon: BookOpen,
    },
  ];

  // Variantes de animación tipadas correctamente para satisfacer a TypeScript
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased">
      <Header />

      <main className="flex-1 section-spacious pb-20">
        <div className="container mx-auto max-w-4xl px-4">

          {/* HERO SECTION */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left"
          >
            <p className="text-xs uppercase tracking-[0.35em] text-accent font-semibold">
              Gobierno Oficial
            </p>
            <h1 className="display-font text-4xl sm:text-5xl font-bold tracking-tight leading-tight mt-3">
              Estructura del <span className="text-accent relative inline-block">Gobierno</span>
            </h1>
            <div className="mt-6 w-16 h-1 bg-accent rounded-full" />
            <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-foreground/70">
              El Reino del Pan organiza su estructura institucional a través de documentos y referencias oficiales que definen su funcionamiento interno.
            </p>
          </motion.div>

          {/* BANNERS Y SECCIONES */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="mt-12 space-y-10"
          >
            {/* AVISO FORMAL / ESTADO INSTITUCIONAL */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-warning/20 bg-warning/5 dark:bg-accent/5 dark:border-accent/20 p-6 flex gap-4 items-start"
            >
              <ShieldAlert className="w-6 h-6 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-2">
                  Estado Institucional
                </p>
                <div className="text-[14px] text-foreground/80 leading-relaxed space-y-3">
                  <p>
                    Actualmente no existe un gobierno formalmente estructurado ni un gabinete en funciones dentro del Reino del Pan. Sin embargo, se mantiene un <strong>gobierno provisional</strong> encargado de la administración y supervisión del orden general.
                  </p>
                  <p>
                    Este se encuentra formado por los <strong>Moderadores y Vigilantes</strong>, quienes velan por el cumplimiento de las leyes y el funcionamiento básico del sistema bajo la autoridad de <strong>Martini</strong>, el actual <strong>Director de Reformas y Coordinador del Estado</strong>.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* SECCIÓN DE RECURSOS OFICIALES */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h2 className="text-sm uppercase tracking-[0.2em] text-foreground/40 font-bold">
                Recursos y Ministerios Oficiales
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recursos.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <motion.a
                      key={index}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -4, backgroundColor: "rgba(var(--accent-rgb), 0.08)" }}
                      transition={{ duration: 0.2 }}
                      className="group p-5 rounded-xl border border-accent/15 bg-accent/5 flex flex-col justify-between gap-4 transition-colors duration-200 hover:border-accent/40"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-2 bg-background rounded-lg border border-accent/10 text-accent group-hover:scale-110 transition-transform duration-200">
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-foreground/30 group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                        </div>
                        <h3 className="text-[15px] font-bold text-foreground/90 group-hover:text-accent transition-colors duration-200">
                          {item.titulo}
                        </h3>
                        <p className="mt-1.5 text-[13px] text-foreground/60 leading-relaxed">
                          {item.descripcion}
                        </p>
                      </div>

                      <div className="text-xs font-medium text-accent inline-flex items-center gap-1 mt-2">
                        Visitar sitio oficial
                      </div>
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>

          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}