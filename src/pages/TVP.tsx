import { useState, useEffect } from "react";
import { Link } from "wouter";
// 1. Importamos el cliente configurado con tus variables de entorno .env
import { supabase } from "../lib/supabaseClient";

// Interfaces para tipar estrictamente el contenido y evitar errores de compilación
interface PlayItem {
    id: string;
    title: string;
    subtitle: string;
    img: string;
    progress?: number; // Opcional, solo para "Seguir viendo"
}

interface PlayCategory {
    title: string;
    items: PlayItem[];
}

const PLAY_CONTENT: { hero: any; categories: PlayCategory[] } = {
    hero: {
        title: "La Promesa",
        category: "SERIE DE ÉXITO",
        description: "El gran drama de época que tiene en vilo a todo el Reino del Pan. Intriga, amor y traición en el palacio más custodiado del estado.",
        duration: "1h 45min",
        image: "https://img.rtve.es/imagenes/la-promesa/01773410920378.jpg"
    },
    categories: [
        {
            title: "Seguir viendo en TVP Play",
            items: [
                {
                    id: "sv1",
                    title: "Telediario 2",
                    progress: 75,
                    subtitle: "Informativo nocturno paniense con Angels Barceló y María José Sáez",
                    img: "TVP/Telediario2.png"
                },
                {
                    id: "sv2",
                    title: "NO ME DIGAS",
                    progress: 40,
                    subtitle: "Programa vespertino de los viernes donde se habla de toda la actualidad del Corazón con Yurena de presentadora",
                    img: "https://imagenes.atresplayer.com/atp/clipping/cmsimages01/2025/09/11/E8170CEA-0E08-4A61-B7EB-269C9973142D//386x217.jpg?optimize=low&format=webply"
                },
                {
                    id: "sv3",
                    title: "Y Ahora Santaolalla",
                    progress: 90,
                    subtitle: "Magacín que aborda la crónica social y toda la actualidad del día con un grupo de colaboradores de diversos ámbitos. El espacio se divide en diferentes secciones y cuenta con un equipo de reporteros a pie de calle",
                    img: "TVP/SANTAOLALLA.png"
                }
            ]
        },
        {
            title: "Series y Ficción Panienses",
            items: [
                { id: "sf1", title: "La Moderna", subtitle: "Nuevos capítulos", img: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=400&auto=format&fit=crop" },
                { id: "sf2", title: "Cuéntame cómo pasó", subtitle: "Temporada Final", img: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=400&auto=format&fit=crop" },
                { id: "sf3", title: "Operación Barrio Inglés", subtitle: "Serie Completa", img: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=400&auto=format&fit=crop" }
            ]
        }
    ]
};

const LOCAL_NEWS_FALLBACK = {
    breaking: "Urgente: El temporal obliga a activar la alerta naranja en todo el litoral del Reino del Pan",
    main: {
        category: "POLÍTICA",
        title: "Histórico acuerdo de infraestructuras para la conexión ferroviaria en el Reino del Pan",
        summary: "El Gobierno y las administraciones regionales sellan un plan de inversión de más de 3.000 millones de euros para acelerar la transición del transporte nacional paniense.",
        time: "Hace 12 min",
        img: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=800&auto=format&fit=crop"
    },
    secondary: [
        { id: "n1", category: "SOCIEDAD", title: "La ola de calor invernal bate récords en el este del país", time: "Hace 45 min", img: "https://images.unsplash.com/photo-1504370805625-d32c54b16100?q=80&w=400&auto=format&fit=crop" },
        { id: "n2", category: "DEPORTES", title: "El TVP Paniense F.C. se clasifica para la gran final continental tras una prórroga agónica", time: "Hace 1 hora", img: "https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=400&auto=format&fit=crop" }
    ],
    trending: [
        { id: "t1", number: "01", title: "Los trucos del nuevo borrador fiscal para autónomos del Reino" },
        { id: "t2", number: "02", title: "Las 5 series más vistas de TVP Play este mes" },
        { id: "t3", number: "03", title: "Previsión del tiempo: ¿Cuándo llegarán las lluvias al norte?" }
    ]
};

export default function TVPPortal() {
    const [activeTab, setActiveTab] = useState<'play' | 'noticias'>('play');
    const [mainNews, setMainNews] = useState(LOCAL_NEWS_FALLBACK.main);
    const [secondaryNews, setSecondaryNews] = useState(LOCAL_NEWS_FALLBACK.secondary);

    useEffect(() => {
        async function loadNewsFromSupabase() {
            try {
                // 2. Evaluamos directamente el cliente de Supabase importado
                if (supabase) {
                    const { data, error } = await supabase
                        .from('tvp_news')
                        .select('*')
                        .order('created_at', { ascending: false });

                    if (error) throw error;

                    if (data && data.length > 0) {
                        const supabaseMain = data.find((n: any) => n.type === 'main');
                        if (supabaseMain) {
                            setMainNews({
                                category: supabaseMain.category,
                                title: supabaseMain.title,
                                summary: supabaseMain.summary || '',
                                time: supabaseMain.time_label,
                                img: supabaseMain.img_url
                            });
                        }

                        const supabaseSecondaries = data.filter((n: any) => n.type === 'secondary');
                        if (supabaseSecondaries.length > 0) {
                            setSecondaryNews(supabaseSecondaries.map((n: any) => ({
                                id: n.id,
                                category: n.category,
                                title: n.title,
                                time: n.time_label,
                                img: n.img_url
                            })));
                        }
                    }
                }
            } catch (err) {
                console.warn("Usando noticias locales de fallback debido a un error:", err);
            }
        }

        if (activeTab === 'noticias') {
            loadNewsFromSupabase();
        }
    }, [activeTab]);

    const handleNewsClick = (newsId: string, title: string) => {
        console.log(`Cargando noticia ID: ${newsId}`);
        alert(`Cargando artículo: \n"${title}"`);
    };

    useEffect(() => {
        if (activeTab === 'play') {
            document.title = "TVP Play - Televisión Paniense Bajo Demanda";
        } else {
            document.title = "TVP Noticias - Última hora del Reino del Pan";
        }

        const canvas = document.createElement("canvas");
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext("2d");

        if (ctx) {
            const img = new Image();
            img.src = "/TVP/TVPPlay.png";
            img.onload = () => {
                ctx.drawImage(img, 0, 0, 64, 64);
                let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
                if (!link) {
                    link = document.createElement("link");
                    link.rel = "icon";
                    document.head.appendChild(link);
                }
                link.href = canvas.toDataURL("image/png");
            };
        }
    }, [activeTab]);

    return (
        <div className="min-h-screen bg-[#07080c] text-white flex flex-col font-tvp-text selection:bg-[#ff4d00] selection:text-white pb-20 md:pb-0">

            <style dangerouslySetInnerHTML={{
                __html: `
                @font-face {
                    font-family: 'TVP-Heading';
                    src: url('/TVP/TVP.ttf') format('truetype');
                    font-weight: bold;
                }
                @font-face {
                    font-family: 'TVP-Text';
                    src: url('/TVP/TVPtext.ttf') format('truetype');
                    font-weight: normal;
                }
                .font-tvp-head { font-family: 'TVP-Heading', sans-serif; }
                .font-tvp-text { font-family: 'TVP-Text', sans-serif; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />

            <header className="w-full bg-[#0a0b10]/95 backdrop-blur-xl border-b border-white/5 px-6 md:px-12 py-5 flex items-center justify-between sticky top-0 z-50 shadow-2xl">
                <div className="flex items-center gap-6 md:gap-8">
                    <img src="/TVP/TVP.png" alt="TVP" className="h-8 md:h-9 object-contain select-none" />
                    <div className="h-5 w-[1px] bg-white/20 hidden sm:block"></div>
                    <div className="hidden sm:flex items-center gap-3">
                        <img src="/TVP/2Pan.png" alt="2Pan" className="h-6 md:h-7 object-contain opacity-75" />
                    </div>
                </div>

                <nav className="hidden md:flex items-center gap-12 text-sm font-bold tracking-widest">
                    <button
                        onClick={() => setActiveTab('play')}
                        className={`transition-all duration-300 flex items-center gap-3.5 pb-2 border-b-2 uppercase font-tvp-head ${activeTab === 'play' ? 'text-[#ff4d00]' : 'text-white/60 hover:text-white border-transparent'}`}
                    >
                        TVP Play
                    </button>
                    <button
                        onClick={() => setActiveTab('noticias')}
                        className={`transition-all duration-300 pb-2 border-b-2 uppercase font-tvp-head ${activeTab === 'noticias' ? 'text-[#ff4d00]' : 'text-white/60 hover:text-white border-transparent'}`}
                    >
                        TVP Noticias
                    </button>
                </nav>

                <div className="flex items-center w-10 h-2"></div>
            </header>

            {activeTab === 'play' && (
                <main className="flex-1 flex flex-col w-full animate-in fade-in duration-500">
                    <section className="relative w-full min-h-[80vh] md:min-h-0 md:aspect-[21/9] bg-[#07080c] overflow-hidden flex items-end">
                        <div className="absolute inset-0">
                            <img src={PLAY_CONTENT.hero.image} alt={PLAY_CONTENT.hero.title} className="w-full h-full object-cover opacity-60 transform scale-101 object-center" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-[#07080c]/60 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#07080c]/80 via-transparent to-transparent hidden md:block" />
                        </div>

                        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 md:px-16 pb-12 pt-24 md:pb-20 flex flex-col items-start gap-4 md:gap-5">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <span className="bg-[#ff4d00]/10 text-[#ff4d00] border border-[#ff4d00]/30 text-[10px] md:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest font-tvp-head">
                                    {PLAY_CONTENT.hero.category}
                                </span>
                                <span className="text-white/50 text-xs font-medium tracking-wide">{PLAY_CONTENT.hero.duration}</span>
                            </div>
                            <h2 className="font-tvp-head text-4xl sm:text-5xl md:text-7xl font-black tracking-wide max-w-4xl leading-relaxed text-white drop-shadow-md">
                                {PLAY_CONTENT.hero.title}
                            </h2>
                            <p className="text-white/80 max-w-xl text-sm md:text-base line-clamp-4 md:line-clamp-3 font-light leading-relaxed tracking-wide drop-shadow">
                                {PLAY_CONTENT.hero.description}
                            </p>
                            <div className="flex items-center gap-4 mt-3 w-full sm:w-auto">
                                <button className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[#ff4d00] hover:bg-[#e04300] text-black font-black uppercase text-xs md:text-sm px-10 py-4 rounded-full transition-all shadow-xl hover:scale-[1.02] font-tvp-head">
                                    Ver ahora
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="px-6 sm:px-8 md:px-16 py-12 md:py-16 max-w-7xl mx-auto w-full flex flex-col gap-12 md:gap-24">
                        {PLAY_CONTENT.categories.map((cat, idx) => (
                            <div key={idx} className="flex flex-col gap-6 md:gap-8">
                                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                    <h3 className="font-tvp-head text-lg md:text-2xl font-bold tracking-wider leading-relaxed">{cat.title}</h3>
                                    <span className="text-xs text-[#ff4d00] cursor-pointer hover:underline uppercase tracking-[0.2em] font-bold font-tvp-head">Ver todo</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
                                    {cat.items.map((item) => (
                                        <div key={item.id} className="group cursor-pointer bg-[#0e1017] rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition-all duration-300 shadow-lg">
                                            <div className="relative aspect-video overflow-hidden">
                                                <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" />
                                                {item.progress !== undefined && (
                                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
                                                        <div className="bg-[#ff4d00] h-full" style={{ width: `${item.progress}%` }}></div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-5 md:p-6 flex flex-col gap-1.5">
                                                <h4 className="font-tvp-head font-bold text-sm md:text-base text-white/90 group-hover:text-white transition-colors tracking-wide leading-relaxed">
                                                    {item.title}
                                                </h4>
                                                <p className="text-xs md:text-sm text-white/45 tracking-wide font-light font-tvp-text">{item.subtitle}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </section>
                </main>
            )}

            {activeTab === 'noticias' && (
                <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-16 py-8 md:py-12 animate-in fade-in duration-500">
                    <div className="mb-8 md:mb-12 w-full bg-[#ff4d00]/10 border border-[#ff4d00]/25 rounded-xl p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center gap-4 shadow-sm">
                        <span className="flex items-center gap-2 bg-[#ff4d00] text-black text-xs font-black px-3 py-1.5 rounded uppercase tracking-widest font-tvp-head">
                            <span className="w-2 h-2 bg-black rounded-full animate-ping"></span>
                            Última hora
                        </span>
                        <p className="text-sm md:text-base font-bold tracking-wide text-neutral-200 leading-relaxed pl-1 font-tvp-text">
                            {LOCAL_NEWS_FALLBACK.breaking}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-14">
                        <div className="lg:col-span-2 flex flex-col gap-8 md:gap-12">
                            <div
                                onClick={() => handleNewsClick('main', mainNews.title)}
                                className="group cursor-pointer bg-[#0e1017] rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition-all duration-300 shadow-xl flex flex-col"
                            >
                                <div className="relative w-full aspect-video overflow-hidden">
                                    <img src={mainNews.img} alt={mainNews.title} className="w-full h-full object-cover" />
                                    <span className="absolute top-4 left-4 sm:top-5 sm:left-5 bg-[#ff4d00] text-black text-[10px] sm:text-xs font-black px-3 sm:px-4 py-1.5 rounded font-tvp-head tracking-widest uppercase">
                                        {mainNews.category}
                                    </span>
                                </div>
                                <div className="p-5 sm:p-8 md:p-10 flex flex-col gap-3.5 sm:gap-4 flex-1 justify-between">
                                    <div className="flex flex-col gap-2.5 sm:gap-3">
                                        <span className="text-[11px] sm:text-xs text-white/40 tracking-wider uppercase font-semibold font-tvp-text">{mainNews.time}</span>
                                        <h3 className="font-tvp-head text-xl sm:text-2xl md:text-4xl font-black tracking-wide text-white group-hover:text-[#ff4d00] transition-colors leading-relaxed">
                                            {mainNews.title}
                                        </h3>
                                        <p className="text-xs sm:text-sm md:text-base text-neutral-400 font-light leading-relaxed tracking-wide mt-1 font-tvp-text">
                                            {mainNews.summary}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6 md:gap-8">
                                {secondaryNews.map((news) => (
                                    <div
                                        key={news.id}
                                        onClick={() => handleNewsClick(news.id, news.title)}
                                        className="group cursor-pointer bg-[#0e1017] rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition-all duration-300 shadow-md flex flex-col md:flex-row w-full min-h-0"
                                    >
                                        <div className="relative w-full md:w-[40%] aspect-video md:aspect-auto md:min-h-[160px] overflow-hidden flex-shrink-0">
                                            <img src={news.img} alt={news.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                                            <span className="absolute top-3 left-3 bg-[#0a0b10]/95 backdrop-blur text-white text-[9px] font-bold px-2 py-1 rounded tracking-widest uppercase font-tvp-head">
                                                {news.category}
                                            </span>
                                        </div>
                                        <div className="p-5 md:p-6 flex flex-col gap-2.5 justify-center flex-1 min-w-0">
                                            <span className="text-[10px] text-white/40 font-medium tracking-wide font-tvp-text">{news.time}</span>
                                            <h4 className="font-tvp-head font-bold text-base sm:text-lg text-white/90 group-hover:text-[#ff4d00] transition-colors tracking-wide leading-relaxed balance">
                                                {news.title}
                                            </h4>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-8 md:gap-12">
                            <div className="bg-[#0e1017] rounded-xl border border-white/5 p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
                                <h3 className="font-tvp-head text-base sm:text-lg font-bold border-b border-white/10 pb-4 tracking-widest flex items-center gap-3 uppercase leading-relaxed">
                                    <span className="w-2.5 h-2.5 bg-[#ff4d00] rounded-full"></span>
                                    Lo más visto
                                </h3>
                                <div className="flex flex-col divide-y divide-white/5">
                                    {LOCAL_NEWS_FALLBACK.trending.map((trend) => (
                                        <div key={trend.id} className="py-4 sm:py-5 flex gap-4 sm:gap-5 items-start group cursor-pointer">
                                            <span className="font-tvp-head text-2xl sm:text-3xl font-black text-[#ff4d00]/40 group-hover:text-[#ff4d00] transition-colors leading-none">
                                                {trend.number}
                                            </span>
                                            <p className="font-tvp-head text-xs sm:text-sm font-bold text-neutral-300 group-hover:text-white transition-colors tracking-wide leading-relaxed">
                                                {trend.title}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-[#0e1017] rounded-xl border border-white/5 p-6 sm:p-8 text-center flex flex-col items-center justify-center gap-4 sm:gap-5 shadow-inner">
                                <span className="bg-[#ff4d00]/10 text-[#ff4d00] border border-[#ff4d00]/20 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest font-tvp-head">
                                    Área Deportiva Paniense
                                </span>
                                <h4 className="font-tvp-head text-sm sm:text-base font-bold text-white/90 tracking-wider leading-relaxed">Especial Copa del Reino 2026</h4>
                                <p className="text-[11px] sm:text-xs text-neutral-500 leading-relaxed max-w-xs font-light tracking-wide font-tvp-text">
                                    Estamos acondicionando la parrilla de retransmisión televisiva para los próximos encuentros oficiales del campeonato nacional paniense.
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            )}

            {/* FOOTER */}
            <footer className="w-full py-10 border-t border-white/5 bg-[#050609] text-xs text-neutral-600 px-6 md:px-12 mt-12 font-tvp-text">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6">
                        <Link to="/">
                            <a className="transition-opacity hover:opacity-80 block">
                                <img src="/logo.png" alt="Reino del Pan" className="h-8 object-contain" />
                            </a>
                        </Link>

                        <div className="h-4 w-[1px] bg-white/10 hidden sm:block"></div>

                        <a
                            href="https://discord.com/invite/reino-del-pan-1381359904731693056"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-[#5865F2]/10 hover:bg-[#5865F2] text-[#5865F2] hover:text-white px-4 py-2 rounded-full border border-[#5865F2]/20 transition-all duration-300 font-tvp-head font-bold uppercase tracking-wider text-[10px]"
                        >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 127.14 96.36" xmlns="http://www.w3.org/2000/svg">
                                <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a74.37,74.37,0,0,0,6.71-11,68.6,68.6,0,0,1-10.64-5.12c.91-.66,1.8-1.34,2.65-2a75.58,75.58,0,0,0,72.94,0c.85.71,1.74,1.39,2.65,2a68.6,68.6,0,0,1-10.64,5.12,74.37,74.37,0,0,0,6.71,11,105.73,105.73,0,0,0,31.54-18.83C130.1,49.22,123.39,26.47,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
                            </svg>
                            Discord
                        </a>
                    </div>
                    <p className="tracking-wide font-light text-center sm:text-right text-neutral-500 max-w-md sm:max-w-none">
                        © 2026 Corporación de Radio y Televisión del Reino del Pan (TVP). Todos los derechos reservados.
                    </p>
                </div>
            </footer>

            {/* BARRA MÓVIL */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0a0b10]/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-around z-50 px-6 shadow-2xl">
                <button onClick={() => setActiveTab('play')} className={`flex flex-col items-center justify-center gap-1.5 ${activeTab === 'play' ? 'text-[#ff4d00]' : 'text-white/45'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5.5 h-5.5">
                        <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3h13A1.5 1.5 0 0 1 20 4.5v11 a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16v-11.5zM5.5 4a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5h-13z" />
                        <path d="M9.75 13.848V8.152a.25.25 0 0 1 .388-.21l4.8 2.848a.25.25 0 0 1 0 .42l-4.8 2.848a.25.25 0 0 1-.388-.21z" />
                    </svg>
                    <span className="text-[9px] font-black tracking-widest uppercase font-tvp-head leading-none">TVP PLAY</span>
                </button>

                <button onClick={() => setActiveTab('noticias')} className={`flex flex-col items-center justify-center gap-1.5 ${activeTab === 'noticias' ? 'text-[#ff4d00]' : 'text-white/45'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5.5 h-5.5">
                        <path d="M19 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-5 12H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                    </svg>
                    <span className="text-[9px] font-black tracking-widest uppercase font-tvp-head leading-none">NOTICIAS</span>
                </button>
            </div>
        </div>
    );
}