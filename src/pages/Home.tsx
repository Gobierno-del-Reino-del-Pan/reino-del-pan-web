import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16 lg:py-24">
        <div className="container mx-auto grid gap-16 lg:grid-cols-[1fr_0.9fr] items-center">


          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-accent font-medium">
              Gobierno Oficial Soberano
            </p>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-[3.2rem] font-bold leading-[1.12] display-font">
              Nuestra tierra.
              <br />
              Nuestra gente.
              <br />
              <span className="text-accent">Reino del Pan</span>
            </h1>
            <div className="mt-5 w-12 h-0.5 bg-accent rounded-full" />
            <p className="mt-5 max-w-lg text-[15px] leading-7 text-foreground/60">
              Un estado digital y territorial dedicado a la paz, la reconciliación social, la ecología activa y la
              gobernanza del siglo XXI. Sé parte de la construcción de una nueva nación soberana.
            </p>
            <div className="mt-8 flex gap-3 flex-wrap">
              <Link href="/about" className="btn-minimal">
                Conocer más
              </Link>
              <Link
                href="/dpi"
                className="inline-flex items-center justify-center rounded-full border-2 border-accent bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground transition hover:opacity-85 active:scale-95"
              >
                Obtener DPI
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { stat: "Casi 1 Año",  title: "Desde su fundación",       desc: "Iniciado como una visión en 2025, ahora es un estado consolidado." },
              { stat: "5400+",       title: "Solicitudes de DPI",        desc: "Ciudadanos digitales registrados y activos en nuestra plataforma global." },
              { stat: "100%",        title: "Por la Libertad",           desc: "Compromiso total con la libertad y la resiliencia de nuestro pueblo." },
              { stat: "50+",         title: "Países conectados",         desc: "Una comunidad diplomática que cruza fronteras internacionales." },
            ].map(({ stat, title, desc }) => (
              <div
                key={stat}
                className="rounded-[20px] border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-sm"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-accent font-medium">{stat}</p>
                <p className="mt-1.5 text-[15px] font-semibold leading-snug">{title}</p>
                <p className="mt-2 text-[13px] text-foreground/55 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}