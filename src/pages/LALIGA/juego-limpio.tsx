import { Link } from "wouter";

export default function JuegoLimpio() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
            <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 mt-12 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                    <h1 className="text-3xl font-black uppercase text-white tracking-tight">
                        Juego Limpio <span className="text-red-500">LALIGA</span>
                    </h1>
                    <Link href="/LALIGA" className="text-xs bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-full font-bold transition">
                        Volver
                    </Link>
                </div>
                <div className="space-y-6 text-sm leading-relaxed text-slate-300">
                    <p>
                        El programa de <strong>Juego Limpio de LaLiga Paniense</strong> garantiza un entorno competitivo íntegro, sano y de respeto mutuo entre todos los clubes, jugadores y aficionados de Pania.
                    </p>
                    <section className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <h2 className="font-bold text-white uppercase text-xs tracking-wider mb-2 text-red-400">Pilares Fundamentales</h2>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>Respeto absoluto al cuerpo arbitral y sus decisiones.</li>
                            <li>Tolerancia cero contra el racismo, la discriminación y la violencia.</li>
                            <li>Transparencia en la gestión deportiva e institucional.</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}