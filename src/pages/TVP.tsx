import { Link } from "wouter";

export default function EnConstruccion() {
    return (
        <div className="min-h-[85vh] flex items-center justify-center p-6 bg-black/20">
            {/* Contenedor de la Alerta estilo iOS */}
            <div className="w-full max-w-[270px] bg-neutral-900/75 backdrop-blur-xl border border-white/10 rounded-[14px] flex flex-col text-center overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">

                {/* Contenido de la Alerta */}
                <div className="p-5 flex flex-col items-center">
                    <span className="text-3xl mb-2 select-none" role="img" aria-label="Construcción">
                        🚧
                    </span>
                    <h2 className="text-[17px] font-semibold text-white tracking-tight leading-tight">
                        Sección en Construcción
                    </h2>
                    <p className="text-[13px] font-normal text-white/70 mt-1 leading-snug">
                        Estamos horneando el contenido de este apartado. Vuelve muy pronto.
                    </p>
                </div>

                {/* Separador Horizontal Fino */}
                <div className="h-[0.5px] bg-white/15 w-full" />

                {/* Acciones de la Alerta (Botones) */}
                <div className="flex w-full">
                    <Link
                        href="/"
                        className="flex-1 py-3 text-[17px] font-semibold text-accent hover:bg-white/5 active:bg-white/10 transition-colors duration-100 text-center select-none cursor-pointer"
                    >
                        Aceptar
                    </Link>
                </div>

            </div>
        </div>
    );
}