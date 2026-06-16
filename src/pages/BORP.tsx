import { useState, useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Constante que simula el número del ÚLTIMO boletín publicado en el sistema.
const ULTIMO_BOLETIN_ID = 3;

interface DecretoReciente {
    id: string;
    seccion: string;
    titulo: string;
    fecha: string;
    organo: string;
}

const DECRETOS_RECIENTES: DecretoReciente[] = [
    {
        id: "D-2026-08",
        seccion: "I. Disposiciones Generales",
        organo: "Ministerio del Interior",
        titulo: "Real Decreto 12/2026, por el que se aprueba el Reglamento General del Documento Paniense de Identidad (DPI) y los entornos biométricos estatales.",
        fecha: "15/06/2026"
    },
    {
        id: "D-2026-07",
        seccion: "I. Disposiciones Generales",
        organo: "Ministerio de Hacienda y Seguridad Social",
        titulo: "Orden HP/402/2026, por la que se dictan las normas para la emisión de las primeras licencias bancarias destinadas a Laboral Panian Bank.",
        fecha: "15/06/2026"
    },
    {
        id: "D-2026-06",
        seccion: "II. Autoridades y Personal",
        organo: "Jefatura del Estado",
        titulo: "Resolución de nombramiento de personal de ordenanza y gestión de accesos logísticos para las sedes gubernamentales de Virgen de la Vega y Rosario",
        fecha: "15/06/2026"
    },
    {
        id: "D-2026-05",
        seccion: "III. Otras Disposiciones",
        organo: "Ministerio de Cultura y Deportes",
        titulo: "Corrección de errores del expediente regulador de marcas de la entidad deportiva Martini City FC y su escudo oficial unificado.",
        fecha: "15/06/2026"
    }
];

export default function Borp() {
    const [searchId, setSearchId] = useState<string>("");

    // Historial automático de los 3 últimos boletines (BORP-3, BORP-2, BORP-1...)
    const ultimosBoletines = useMemo(() => {
        const list = [];
        for (let i = 0; i < 3; i++) {
            const current = ULTIMO_BOLETIN_ID - i;
            if (current > 0) {
                list.push(current);
            }
        }
        return list;
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchId.trim()) return;

        const numero = parseInt(searchId, 10);
        if (isNaN(numero) || numero <= 0) {
            alert("Por favor, introduce un número de boletín válido.");
            return;
        }

        window.open(`/borp/BORP-${numero}.pdf`, "_blank");
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-x-hidden antialiased">
            <Header />

            {/* ── CABECERA INSTITUCIONAL CON LOGO OFICIAL ── */}
            <header className="w-full bg-card border-b border-border shadow-sm py-8">
                <div className="container flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        {/* Logo oficial integrado deshabilitando arrastre y usando el contenedor estricto */}
                        <img
                            src="/borp/borp.jpg"
                            alt="Logo BORP"
                            className="h-16 md:h-20 w-auto object-contain"
                        />

                    </div>
                    <div className="text-left md:text-right font-mono text-xs text-muted-foreground bg-secondary border border-border px-5 py-3 rounded-xl shadow-inner">
                        <p className="font-bold text-foreground">Diario Oficial del Estado</p>
                        <p className="mt-1 text-[11px]">Sección de Consulta Legislativa</p>
                    </div>
                </div>
            </header>

            {/* ── CONTENIDO EN GRID PRINCIPAL ── */}
            <main className="flex-1 container py-12 grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-8">

                {/* PANEL IZQUIERDO: DECRETOS RECIENTES */}
                <section className="bg-card rounded-xl border border-border p-6 sm:p-8 shadow-sm flex flex-col">
                    <div className="border-b border-border pb-4 mb-6">
                        <h2 className="text-2xl text-primary font-normal tracking-wide flex items-center gap-3">
                            <span className="w-2.5 h-2.5 bg-accent rounded-full shadow-sm"></span>
                            Sumario de Disposiciones Recientes
                        </h2>
                        <p className="text-xs text-muted-foreground mt-1">
                            Extracto informativo de normativas soberanas de obligada aplicación y conocimiento general.
                        </p>
                    </div>

                    <div className="flex flex-col gap-6">
                        {DECRETOS_RECIENTES.map((dec) => (
                            <article
                                key={dec.id}
                                className="p-5 rounded-xl bg-secondary/40 border border-border/60 hover:bg-secondary/70 transition-colors duration-200 flex flex-col gap-3 group"
                            >
                                <div className="flex justify-between items-start gap-4 flex-wrap text-xs">
                                    <span className="font-mono font-bold text-primary bg-accent/20 border border-accent/30 px-3 py-0.5 rounded-full">
                                        {dec.seccion}
                                    </span>
                                    <span className="text-muted-foreground font-medium">{dec.fecha}</span>
                                </div>

                                {/* Marcado como legible para el usuario final */}
                                <h3 className="text-lg text-foreground leading-snug font-normal can-select">
                                    {dec.titulo}
                                </h3>

                                <div className="flex justify-between items-center gap-4 pt-3 border-t border-border text-xs text-muted-foreground">
                                    <span className="font-medium italic can-select">{dec.organo}</span>
                                    <span className="font-mono text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded font-semibold">
                                        {dec.id}
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {/* PANEL DERECHO: ACCESO DIRECTO PDF Y BUSCADOR */}
                <aside className="flex flex-col gap-8">

                    {/* CONTROL DE LOS ÚLTIMOS 3 PDF PUBLICADOS */}
                    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                        <h2 className="text-xl text-primary font-normal tracking-wide border-b border-border pb-3 mb-4">
                            Últimos Diarios Íntegros
                        </h2>
                        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                            Descarga directa del documento oficial completo en formato inalterable PDF de los tres últimos boletines.
                        </p>

                        <div className="flex flex-col gap-3">
                            {ultimosBoletines.map((num) => (
                                <a
                                    key={num}
                                    href={`/borp/BORP-${num}.pdf`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/30 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 group shadow-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl group-hover:scale-110 transition-transform">📄</span>
                                        <div>
                                            <h4 className="text-[15px] font-bold text-foreground group-hover:text-white transition-colors">
                                                Boletín Oficial BORP-{num}
                                            </h4>
                                            <p className="text-[11px] text-muted-foreground group-hover:text-accent font-mono mt-0.5 transition-colors">
                                                Archivo PDF Oficial
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-mono font-bold bg-muted text-muted-foreground px-3 py-1 rounded-lg group-hover:bg-white/20 group-hover:text-white transition-all">
                                        Abrir
                                    </span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* BUSCADOR HISTÓRICO INTEGRAL */}
                    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                        <h2 className="text-xl text-primary font-normal tracking-wide border-b border-border pb-3 mb-4">
                            Buscador del Archivo
                        </h2>
                        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                            Introduce el número secuencial del diario de la nación que deseas auditar para saltar directamente a su almacenamiento.
                        </p>

                        <form onSubmit={handleSearch} className="flex flex-col gap-3">
                            <div className="relative flex items-center">
                                <span className="absolute left-4 font-mono text-xs font-bold text-muted-foreground/80 pointer-events-none">
                                    BORP -
                                </span>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Ej: 1"
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                    className="w-full pl-16 pr-4 py-3 bg-input border border-border rounded-xl text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-inner transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-[0.18em] hover:bg-primary/95 transition-all shadow-md active:scale-95"
                            >
                                Localizar Boletín
                            </button>
                        </form>
                    </div>

                </aside>

            </main>

            <Footer />
        </div>
    );
}