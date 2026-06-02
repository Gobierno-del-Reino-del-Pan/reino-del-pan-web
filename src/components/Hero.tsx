import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="section-spacious overflow-hidden">
      <div className="container mx-auto grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-accent">Gobierno Oficial</p>
          <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-tight tracking-tight display-font">
            Nuestra tierra. Nuestra gente. Reino del Pan
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-foreground/75">
            Un estado digital y territorial dedicado a la paz, la reconciliación social, la ecología activa y la gobernanza del siglo XXI.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a href="/about" className="btn-minimal">
              Conocer más
            </a>
            <a href="/dpi" className="inline-flex items-center justify-center rounded-full border border-accent bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent/90">
              Obtener DPI
            </a>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative overflow-hidden rounded-[2rem] border border-border bg-secondary p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
        >
          <div className="absolute -left-16 top-0 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-foreground/50">Identidad noble</p>
              <h2 className="display-font mt-4 text-3xl font-semibold text-foreground">Paz, ecología y soberanía.</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-accent">Visión</p>
                <p className="mt-3 text-sm text-foreground/75">Una nación mínima con impacto máximo.</p>
              </div>
              <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-accent">Ciudadanía</p>
                <p className="mt-3 text-sm text-foreground/75">Participación abierta y transparente.</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 rounded-3xl border border-border bg-background p-5">
              <img src="/logo.png" alt="Escudo Reino del Pan" className="h-16 w-16 rounded-full" />
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-foreground/50">Escudo oficial</p>
                <p className="mt-2 text-base font-semibold text-foreground">Gobierno soberano</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
