import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "wouter";

// Conservamos los enlaces originales y los iconos vectoriales.
const SOCIALS = [
  { href: "https://x.com/gov_pan", label: "Twitter / X", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.514l-5.106-6.694-5.934 6.694H2.88l7.644-8.769-8.16-10.731h6.514l4.888 6.465L15.939 2.25h2.305zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z", brandClass: "social-x" },
  { href: "https://www.tiktok.com/@gov_pan", label: "TikTok", path: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.77a4.85 4.85 0 01-1.01-.08z", brandClass: "social-tiktok" },
  { href: "/alertas", label: "Discord", path: "M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z", brandClass: "social-discord" },
  { href: "https://www.twitch.tv/televisionpaniense", label: "Twitch", path: "M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z", brandClass: "social-twitch" },
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

const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#630B57] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF6FA]";

// <Link> para rutas internas y <a> para destinos externos.
function FooterLink({ href, external = false, children }: { href: string; external?: boolean; children: ReactNode }) {
  const className = `pan-footer-link group relative inline-flex max-w-full items-center rounded-md py-1.5 text-[13px] leading-relaxed ${focusRing}`;
  if (external) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}<span className="ml-1 text-[10px] opacity-40" aria-hidden="true">↗</span></a>;
  }
  return <Link href={href} className={className}>{children}</Link>;
}

export default function Footer() {
  const reduceMotion = useReducedMotion();
  const rise = {
    initial: { opacity: 0, y: reduceMotion ? 0 : 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: reduceMotion ? 0 : 0.55, ease: "easeOut" as const },
  };

  return (
    <footer className="pan-footer relative isolate overflow-hidden border-t border-[#630B57]/10 px-4 pb-5 pt-14 text-[#291524] sm:px-6 sm:pt-20" aria-label="Pie de página">
      <style>{`
        .pan-footer {
          background: linear-gradient(135deg, #FCF9FB 0%, #F4ECF3 51%, #F9F3F8 100%);
        }
        .pan-footer::before {
          content: ""; pointer-events: none; position: absolute; inset: 0;
          background: radial-gradient(ellipse at 12% 12%, rgba(166,101,157,.17), transparent 42%),
                      radial-gradient(ellipse at 88% 80%, rgba(99,11,87,.09), transparent 43%);
        }
        .pan-footer-glass {
          position: relative; isolation: isolate;
          background: linear-gradient(135deg, rgba(255,255,255,.78), rgba(255,255,255,.48) 52%, rgba(255,255,255,.66));
          border: 1px solid rgba(255,255,255,.90);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.96), inset 0 -1px 0 rgba(99,11,87,.035),
                      0 20px 55px -26px rgba(83,12,71,.19), 0 2px 8px rgba(69,12,61,.045);
          -webkit-backdrop-filter: blur(28px) saturate(175%);
          backdrop-filter: blur(28px) saturate(175%);
        }
        .pan-footer-glass::before {
          content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
          background: linear-gradient(155deg, rgba(255,255,255,.6), transparent 29%, rgba(99,11,87,.025) 85%);
          z-index: -1;
        }
        .pan-footer-mark {
          background: linear-gradient(145deg,rgba(255,255,255,.96),rgba(241,211,236,.67));
          border: 1px solid rgba(255,255,255,.9);
          box-shadow: inset 0 1px 0 #fff, 0 6px 22px rgba(99,11,87,.13);
          transition: transform .3s cubic-bezier(.2,.8,.2,1), box-shadow .3s ease;
        }
        .pan-footer-brand:hover .pan-footer-mark { transform: translateY(-2px) rotate(-3deg); box-shadow: 0 10px 26px rgba(99,11,87,.21); }
        .pan-footer-strike { text-decoration: line-through; text-decoration-color: #A6659D; text-decoration-thickness: 2px; text-decoration-skip-ink: none; opacity: .8; }
        .pan-footer-label { color: #7D5276; letter-spacing: .19em; }
        .pan-footer-link { color: #685365; transition: color .2s ease, transform .2s ease; }
        .pan-footer-link:hover { color: #630B57; transform: translateX(3px); }
        .pan-footer-link::after {
          content: ""; position: absolute; left: 0; bottom: 3px; width: 0; height: 1px;
          background: #A6659D; transition: width .24s ease;
        }
        .pan-footer-link:hover::after { width: 100%; }
        .pan-footer-social {
          display: inline-flex; align-items: center; justify-content: center;
          width: 43px; height: 43px; border-radius: 15px; color: #630B57;
          background: linear-gradient(135deg,rgba(255,255,255,.75),rgba(248,233,245,.65));
          border: 1px solid rgba(255,255,255,.92);
          box-shadow: inset 0 1px rgba(255,255,255,.9), 0 4px 14px rgba(99,11,87,.07);
          -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
          transition: transform .22s ease, color .22s ease, background .22s ease, box-shadow .22s ease;
        }
        .pan-footer-social:hover { transform: translateY(-3px); color: white; box-shadow: 0 8px 18px rgba(99,11,87,.16); }
        .pan-footer-social.social-x:hover { background: #171717; }
        .pan-footer-social.social-tiktok:hover { background: #FF0050; }
        .pan-footer-social.social-discord:hover { background: #5865F2; }
        .pan-footer-social.social-twitch:hover { background: #9146FF; }
        .pan-footer-bottom { border-top: 1px solid rgba(99,11,87,.11); }
        @media (prefers-reduced-motion: reduce) {
          .pan-footer-mark,.pan-footer-link,.pan-footer-link::after,.pan-footer-social { transition: none !important; }
          .pan-footer-brand:hover .pan-footer-mark, .pan-footer-link:hover, .pan-footer-social:hover { transform: none; }
        }
        @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
          .pan-footer-glass { background: #FDF9FC; }
          .pan-footer-social { background: #F8EBF4; }
        }
      `}</style>

      <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-[#A6659D]/15 blur-[90px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#630B57]/10 blur-[110px]" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="pan-footer-glass overflow-hidden rounded-[30px] p-6 sm:rounded-[36px] sm:p-9 lg:p-12">
          <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" aria-hidden="true" />
          <div className="grid gap-12 lg:grid-cols-[1.12fr_1.45fr] lg:gap-12 xl:gap-20">
            <motion.div {...rise} className="flex min-w-0 flex-col items-start">
              <Link href="/" aria-label="Ir al inicio de Artis Panis" className={`pan-footer-brand group inline-flex items-center gap-3.5 rounded-xl ${focusRing}`}>
                <span className="pan-footer-mark grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-[20px]">
                  <img src="/logo.png" alt="" loading="lazy" width={48} height={48} className="h-12 w-12 object-contain" />
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[.3em] text-[#8C6488]">ARTIS PANIS</span>
                  <span className="flex flex-wrap items-baseline gap-x-1.5 text-[17px] font-extrabold uppercase tracking-[.055em] text-[#630B57] sm:text-lg">
                    <span className="pan-footer-strike">REINO DEL</span><span>PAN</span>
                  </span>
                </span>
              </Link>
              <p className="mt-6 max-w-sm text-[13px] leading-7 text-[#6F5B6C] sm:text-sm">
                Infraestructura digital y registro institucional oficial. Coordinando el desarrollo tecnológico, legal y administrativo del ecosistema.
              </p>
              <div className="mt-7 flex items-center gap-2 rounded-full border border-[#630B57]/10 bg-white/55 px-4 py-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#7D5276] shadow-[inset_0_1px_0_rgba(255,255,255,.9)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#630B57]" aria-hidden="true" />
                Desde 2025
              </div>
            </motion.div>

            <motion.div {...rise} className="grid min-w-0 grid-cols-1 gap-10 sm:grid-cols-2 xl:grid-cols-[1.45fr_.85fr_.9fr] xl:gap-8">
              <nav aria-label="Enlaces importantes">
                <h2 className="pan-footer-label mb-4 text-[11px] font-extrabold uppercase">Enlaces importantes</h2>
                <ul className="space-y-1.5">
                  {IMPORTANT_LINKS.map(link => (
                    <li key={link.href}><FooterLink href={link.href} external={link.isExternal}>{link.label}</FooterLink></li>
                  ))}
                </ul>
                <p className="mt-3 text-[11px] italic text-[#988693]">Más en el futuro...</p>
              </nav>

              <div>
                <h2 className="pan-footer-label mb-4 text-[11px] font-extrabold uppercase">Comunidad</h2>
                <ul className="flex flex-wrap gap-2" aria-label="Redes sociales">
                  {SOCIALS.map(social => (
                    <li key={social.label}>
                      {social.href.startsWith("/") ? (
                        <Link href={social.href} className={`pan-footer-social ${social.brandClass} ${focusRing}`} aria-label={social.label} title={social.label}>
                          <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true"><path d={social.path} /></svg>
                        </Link>
                      ) : (
                        <a href={social.href} target="_blank" rel="noopener noreferrer" className={`pan-footer-social ${social.brandClass} ${focusRing}`} aria-label={social.label} title={social.label}>
                          <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true"><path d={social.path} /></svg>
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <nav aria-label="Enlaces legales">
                <h2 className="pan-footer-label mb-4 text-[11px] font-extrabold uppercase">Legal</h2>
                <ul className="space-y-1.5">
                  {LEGAL_LINKS.map(link => (
                    <li key={link.href}><FooterLink href={link.href}>{link.label}</FooterLink></li>
                  ))}
                </ul>
              </nav>
            </motion.div>
          </div>

          <div className="pan-footer-bottom mt-12 flex flex-col items-start justify-between gap-4 pt-6 sm:flex-row sm:items-center">
            <p className="text-[11px] leading-relaxed text-[#816D7C]">
              <span className="pan-footer-strike">REINO DEL</span>{" "}<span className="font-semibold text-[#630B57]">PAN</span>{" "}
              © {new Date().getFullYear()} · Todos los derechos reservados.
            </p>
            <span className="rounded-full border border-[#630B57]/10 bg-white/45 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-[#886580]">
              EST. 2025
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
