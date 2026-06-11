export default function Footer() {
  return (
    <footer className="relative bg-white border-t border-neutral-200/60 py-14 overflow-hidden">
      {/* Efecto Liquid Glass: Distorsión y reflejo fluido de fondo */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[250px] bg-gradient-to-tr from-amber-200/20 via-orange-100/30 to-transparent blur-[60px] rounded-full pointer-events-none transform -translate-y-12" />
      <div className="absolute -bottom-10 right-1/4 w-[350px] h-[180px] bg-neutral-200/40 blur-[50px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 mb-12">

          {/* Columna 1: Logotipo e Identidad en Cristal Claro */}
          <div className="flex flex-col gap-4 items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-3 group">
              <div className="relative p-0.5 rounded-full bg-gradient-to-b from-white to-neutral-200/80 shadow-[0_4px_12px_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(255,255,255,0.8)]">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="h-9 w-9 rounded-full border border-neutral-200/50 object-contain transition-transform duration-500 group-hover:rotate-[12deg]"
                />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-neutral-400 leading-tight">Artis Panis</p>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-800 leading-tight mt-0.5">Reino del Pan</p>
              </div>
            </div>
          </div>

          {/* Columna 2: Redes Sociales con efecto Botones de Vidrio */}
          <div className="flex flex-col gap-4 items-center md:items-start">
            <p className="text-[11px] uppercase tracking-[0.3em] font-black text-neutral-800">Conócenos</p>
            <div className="flex gap-3.5 items-center">
              {[
                {
                  href: "https://x.com/gov_pan",
                  title: "Twitter/X",
                  hoverClass: "hover:text-black hover:bg-neutral-100 hover:border-neutral-300 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)]",
                  path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.514l-5.106-6.694-5.934 6.694H2.88l7.644-8.769-8.16-10.731h6.514l4.888 6.465L15.939 2.25h2.305zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"
                },
                {
                  href: "https://www.tiktok.com/@gov_pan",
                  title: "TikTok",
                  hoverClass: "hover:text-[#ff0050] hover:bg-red-50/40 hover:border-red-200 hover:shadow-[0_8px_20px_rgba(255,0,80,0.06)]",
                  path: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.77a4.85 4.85 0 01-1.01-.08z"
                },
                {
                  href: "https://discord.gg/reino-del-pan-1381359904731693056",
                  title: "Discord",
                  hoverClass: "hover:text-[#5865F2] hover:bg-indigo-50/40 hover:border-indigo-200 hover:shadow-[0_8px_20px_rgba(88,101,242,0.08)]",
                  path: "M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
                }
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social.title}
                  className={`w-11 h-11 flex items-center justify-center rounded-2xl border border-neutral-200/70 bg-gradient-to-b from-white/90 to-neutral-50/90 text-neutral-400 backdrop-blur-sm shadow-[0_4px_10px_rgba(0,0,0,0.02),inset_0_1px_1px_rgba(255,255,255,0.9)] transition-all duration-300 ${social.hoverClass} hover:-translate-y-1 active:scale-95`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Columna 3: Enlaces Legales */}
          <div className="flex flex-col gap-4 items-center md:items-start sm:col-span-2 md:col-span-1">

            <div className="flex flex-col gap-3 text-center md:text-left w-full sm:w-auto">
              <a
                href="/privacy"
                className="text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-500 transition-all duration-250 hover:text-amber-500 hover:translate-x-0.5 inline-block"
              >
                Política de privacidad
              </a>
              <a
                href="/terms"
                className="text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-500 transition-all duration-250 hover:text-amber-500 hover:translate-x-0.5 inline-block"
              >
                Términos y condiciones
              </a>
            </div>
          </div>
        </div>

        {/* Sección de Copyright e Inferencia de Cristal Líquido */}
        <div className="border-t border-neutral-200/50 pt-8 text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-bold">
            Registrado desde 2025 • Reino del Pan © Todos los derechos reservados
          </p>
        </div>
      </div>
    </footer>
  );
}