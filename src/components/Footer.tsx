export default function Footer() {
  return (
    <footer className="border-t-2 border-accent/20 bg-background py-12">
      <div className="container mx-auto">
        <div className="grid gap-8 md:grid-cols-3 mb-10">
          {/* Logo and brand */}
          <div className="flex flex-col gap-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="h-8 w-8 rounded-full" />
              <p className="text-sm uppercase tracking-[0.35em] font-semibold text-accent">Reino del Pan</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3 md:col-span-1">
            <p className="text-sm uppercase tracking-[0.35em] font-semibold text-accent">Conócenos</p>
            <div className="flex gap-6 items-center">
              {/* X  */}
              <a href="https://x.com/gov_pan" target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-accent transition-colors duration-200" title="Twitter/X">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.514l-5.106-6.694-5.934 6.694H2.88l7.644-8.769-8.16-10.731h6.514l4.888 6.465L15.939 2.25h2.305zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
                </svg>
              </a>
              {/* TikTok */}
              <a href="https://www.tiktok.com/@gov_pan" target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-accent transition-colors duration-200" title="TikTok">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.77a4.85 4.85 0 01-1.01-.08z"/>
                </svg>
              </a>
              {/* Discord */}
              <a href="https://discord.gg/reino-del-pan-1381359904731693056" target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-[#5865F2] transition-colors duration-200" title="Discord">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Legal links */}
          <div className="flex flex-col gap-3 md:col-span-1">
            <p className="text-sm uppercase tracking-[0.35em] font-semibold text-accent">Legal</p>
            <div className="space-y-2 text-foreground/75 text-sm">
              <a href="/privacy" className="block transition-all duration-200 hover:text-accent hover:translate-x-1">Política de privacidad</a>
              <a href="/terms" className="block transition-all duration-200 hover:text-accent hover:translate-x-1">Términos y condiciones</a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-accent/10 pt-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-foreground/50">
            Registrado desde 2025 © Todos los derechos reservados
          </p>
        </div>
      </div>
    </footer>
  );
}