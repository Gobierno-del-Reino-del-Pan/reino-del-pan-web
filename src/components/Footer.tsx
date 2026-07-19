import { motion, useReducedMotion } from "framer-motion";

const SOCIALS = [
  {
    href: "https://x.com/gov_pan",
    label: "Twitter / X",
    hover: "hover:text-foreground hover:bg-foreground/10",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.514l-5.106-6.694-5.934 6.694H2.88l7.644-8.769-8.16-10.731h6.514l4.888 6.465L15.939 2.25h2.305zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z",
  },
  {
    href: "https://www.tiktok.com/@gov_pan",
    label: "TikTok",
    hover: "hover:text-white hover:bg-[#ff0050]",
    path: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.77a4.85 4.85 0 01-1.01-.08z",
  },
  {
    href: "https://discord.gg/reino-del-pan-1381359904731693056",
    label: "Discord",
    hover: "hover:text-white hover:bg-[#5865F2]",
    path: "M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z",
  },
  {
    href: "https://www.twitch.tv/televisionpaniense",
    label: "Twitch",
    hover: "hover:text-white hover:bg-[#9146FF]",
    path: "M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z",
  }
];

const IMPORTANT_LINKS = [
  { label: "Ministerio de Economía, Comercio y Empresa", href: "https://mineco.duckdns.org/", isExternal: true },
  { label: "Ministerio de Transformación Digital", href: "https://mitd.duckdns.org/", isExternal: true },
  { label: "Enciclopan", href: "https://enciclopan.duckdns.org/", isExternal: true },
  { label: "Policía Nacional del Pan", href: "/policia", isExternal: false },
];

const LEGAL_LINKS = [
  { label: "Política de Privacidad", href: "/privacy" },
  { label: "Términos y Condiciones", href: "/terms" },
];

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default function Footer() {
  const shouldReduceMotion = useReducedMotion();

  const fadeUp = {
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: {
      duration: shouldReduceMotion ? 0.01 : 0.6,
      ease: "easeOut" as const,
    },
  };

  return (
    <footer className="relative bg-background border-t border-accent/10 py-16 overflow-hidden">
      {/* Efecto de Iluminación Ambiental */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[250px] bg-gradient-to-tr from-accent/15 via-accent/5 to-transparent blur-[100px] rounded-full pointer-events-none transform -translate-y-20 select-none" />
      <div className="absolute bottom-0 right-10 w-[300px] h-[200px] bg-foreground/3 blur-[80px] rounded-full pointer-events-none select-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="flex flex-col md:flex-row md:justify-between items-start gap-12 mb-16">

          {/* Bloque de Identidad Principal */}
          <motion.div
            {...fadeUp}
            className="flex flex-col gap-4 max-w-md w-full text-left"
          >
            <div className="flex items-center gap-3.5 group cursor-default">
              <div className="relative p-1 rounded-xl bg-accent/5 border border-accent/10 shadow-sm overflow-hidden">
                <img
                  src="/logo.png"
                  alt="Logotipo de Artis Panis, Reino del Pan"
                  width={36}
                  height={36}
                  loading="lazy"
                  className="h-9 w-9 rounded-lg object-contain transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-foreground/45 leading-tight">
                  Artis Panis
                </p>
                <p className="text-base font-bold uppercase tracking-[0.1em] text-foreground/90 mt-0.5">
                  Reino del Pan
                </p>
              </div>
            </div>
            <p className="text-[13px] text-foreground/55 leading-relaxed font-light">
              Infraestructura digital y registro institutional oficial. Coordinando el desarrollo tecnológico, legal y administrativo del ecosistema.
            </p>
          </motion.div>

          {/* Bloque de Enlaces y Redes Alineados */}
          <motion.div
            {...fadeUp}
            className="flex flex-wrap gap-x-16 gap-y-10 justify-between md:justify-end w-full md:w-auto"
          >
            {/* Enlaces Importantes */}
            <nav aria-label="Enlaces importantes" className="flex flex-col gap-3 max-w-[260px] min-w-[200px]">
              <p className="text-[11px] uppercase tracking-[0.25em] font-bold text-foreground/35">
                Enlaces Importantes
              </p>
              <ul className="flex flex-col gap-2 items-start">
                {IMPORTANT_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target={link.isExternal ? "_blank" : undefined}
                      rel={link.isExternal ? "noopener noreferrer" : undefined}
                      className={`relative text-[13px] text-foreground/60 hover:text-foreground transition-colors duration-200 py-0.5 group rounded-sm block ${FOCUS_RING}`}
                    >
                      {link.label}
                      <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent transition-all duration-300 group-hover:w-full" />
                    </a>
                  </li>
                ))}
                <li className="text-[11px] italic text-foreground/30 pt-1 select-none">
                  Más en el futuro...
                </li>
              </ul>
            </nav>

            {/* Comunidad */}
            <div className="flex flex-col gap-4 min-w-[140px]">
              <p className="text-[11px] uppercase tracking-[0.25em] font-bold text-foreground/35">
                Comunidad
              </p>
              <ul className="flex gap-2.5" aria-label="Redes sociales">
                {SOCIALS.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      title={social.label}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg bg-foreground/[0.03] text-foreground/40 transition-all duration-300 ${social.hover} hover:scale-105 active:scale-95 ${FOCUS_RING}`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d={social.path} />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <nav aria-label="Enlaces legales" className="flex flex-col gap-3 min-w-[160px]">
              <p className="text-[11px] uppercase tracking-[0.25em] font-bold text-foreground/35">
                Legal
              </p>
              <ul className="flex flex-col gap-2 items-start">
                {LEGAL_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className={`relative text-[13px] text-foreground/60 hover:text-foreground transition-colors duration-200 py-0.5 group rounded-sm ${FOCUS_RING}`}
                    >
                      {link.label}
                      <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent transition-all duration-300 group-hover:w-full" />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>
        </div>

        {/* Cierre inferior */}
        <div className="border-t border-accent/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] tracking-wide text-foreground/40 font-medium text-center sm:text-left">
            Reino del Pan © {new Date().getFullYear()} • Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-1 text-[10px] tracking-[0.15em] font-bold uppercase text-foreground/30 select-none">
            <span>Est. 2025</span>
          </div>
        </div>
      </div>
    </footer>
  );
}