import { Link } from "wouter";

export default function Reglamento() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
            <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 mt-12 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                    <h1 className="text-3xl font-black uppercase text-white tracking-tight">
                        Reglamento Oficial
                    </h1>
                    <Link href="/LALIGA" className="text-xs bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-full font-bold transition">
                        Volver
                    </Link>
                </div>
                <div className="space-y-4 text-sm text-slate-300">
                    <h2 className="text-base font-bold text-white mt-4">Artículo 1: Sistema de Competición</h2>
                    <p className="text-xs leading-relaxed">
                        LaLiga Paniense se disputa mediante formato de liga regular a doble partido. La victoria otorga 3 puntos, el empate 1 punto y la derrota 0 puntos.
                    </p>
                    <h2 className="text-base font-bold text-white mt-4">Artículo 2: Clasificaciones y Desempates</h2>
                    <p className="text-xs leading-relaxed">
                        En caso de igualdad de puntos al finalizar el torneo, el desempate se resolverá mediante el enfrentamiento directo (goal-average), seguido por la diferencia de goles general.
                    </p>
                </div>
            </div>
        </div>
    );
}