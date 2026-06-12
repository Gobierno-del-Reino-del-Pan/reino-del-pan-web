import { Link } from "wouter";

export default function CSD() {
    // Lista de navegación vinculada por ID
    const navLinks = [
        { name: "El Consejo", id: "consejo" },
        { name: "Ayudas y Subvenciones", id: "ayudas" },
        { name: "Federaciones", id: "federaciones" },
        { name: "Salud en el Deporte", id: "salud" },
        { name: "Normativa", id: "normativa" },
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900 antialiased font-sans">
            {/* Top Bar decorativa */}
            <div className="bg-gradient-to-r from-[#DD7F27] via-[#E99221] to-[#FEC722] h-2 w-full" />

            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-4 group">
                        <img src="/LALIGA/CSD.png" alt="Logo CSD" className="h-30 w-auto transition-transform group-hover:scale-105" />
                    </Link>

                    <div className="flex items-center gap-8">
                        <nav className="hidden lg:flex gap-6">
                            {navLinks.map((link) => (
                                <a
                                    key={link.id}
                                    href={`#${link.id}`}
                                    className="text-[11px] font-bold uppercase tracking-wider text-slate-600 hover:text-[#DD7F27] transition-colors py-2 border-b-2 border-transparent hover:border-[#DD7F27]"
                                >
                                    {link.name}
                                </a>
                            ))}
                        </nav>
                        <Link href="/" className="bg-[#E99221] hover:bg-[#DD7F27] text-white px-5 py-2.5 rounded-lg text-xs font-bold transition shadow-sm">
                            Portal Gobierno
                        </Link>
                    </div>
                </div>
            </header>

            {/* Contenido con IDs */}
            <main className="max-w-7xl mx-auto px-6 py-12 space-y-24">

                <section id="consejo" className="scroll-mt-32">
                    <h2 className="text-4xl font-black mb-6">El Consejo</h2>
                    <p className="text-slate-600 max-w-2xl leading-relaxed text-lg">
                        Somos el órgano rector del deporte en el Reino del Pan. Nuestra misión es fomentar la actividad física y el alto rendimiento desde la transparencia y la excelencia institucional.
                    </p>
                </section>

                <section id="ayudas" className="scroll-mt-32 bg-slate-50 p-10 rounded-3xl border border-slate-100">
                    <h2 className="text-3xl font-black mb-8 text-[#DD7F27]">Ayudas y Subvenciones</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                            <h3 className="font-bold mb-2">Becas para el Rendimiento</h3>
                            <p className="text-sm text-slate-500">Convocatoria abierta para atletas olímpicos.</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                            <h3 className="font-bold mb-2">Modernización de Infraestructuras</h3>
                            <p className="text-sm text-slate-500">Fondos para la mejora de centros regionales.</p>
                        </div>
                    </div>
                </section>

                <section id="federaciones" className="scroll-mt-32">
                    <h2 className="text-3xl font-black mb-8">Federaciones Deportivas</h2>
                    <div className="p-8 border-l-4 border-[#E99221] bg-slate-50">
                        <p className="italic text-slate-700">"Coordinación total entre el estamento público y las federaciones nacionales para el éxito conjunto."</p>
                    </div>
                </section>

                <section id="salud" className="scroll-mt-32">
                    <h2 className="text-3xl font-black mb-8">Salud en el Deporte</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {["Control Antidopaje", "Medicina Deportiva", "Nutrición", "Prevención Lesiones"].map((item) => (
                            <div key={item} className="p-6 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-bold text-center hover:bg-[#DD7F27] transition-colors">
                                {item}
                            </div>
                        ))}
                    </div>
                </section>

                <section id="normativa" className="scroll-mt-32">
                    <h2 className="text-3xl font-black mb-8">Normativa Jurídica</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200">
                            <span className="font-medium">Ley del Deporte 2026</span>
                            <button className="text-xs font-bold text-[#DD7F27] hover:underline">DESCARGAR PDF</button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-slate-800 text-white py-16 px-6">
                <div className="max-w-5xl mx-auto flex flex-col items-center text-center gap-6">
                    <img src="/LALIGA/CSD.png" alt="Logo CSD" className="h-40 brightness-0 invert" />
                </div>
            </footer>
        </div>
    );
}