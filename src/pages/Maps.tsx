import { useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function TerritorialDivisions() {
    // Lista de regiones respetando fielmente las rutas requeridas
    const regiones = useMemo(() => [
        { nombre: "Baguette" },
        { nombre: "Pimbo" },
        { nombre: "Pretzel" },
        { nombre: "Croissant" },
        { nombre: "Sin Glúten" },
        { nombre: "Pan Plano/Arepa", archivo: "Pan Plano-Arepa" } // Fallback para evitar problemas con la barra '/' en sistemas de archivos
    ], []);

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-accent/20">
            <Header />

            {/* Contenido Principal con espaciado amplio configurado en tu CSS */}
            <main className="flex-grow flex flex-col items-center justify-center container section-spacious text-center">

                {/* Icono animado */}
                <div className="text-7xl mb-6 animate-bounce select-none">
                    🍞
                </div>

                {/* Mensaje de Mantenimiento (H1 hereda automáticamente la fuente 'Chillvornia') */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl mb-4 text-primary max-w-2xl leading-tight">
                    Estamos preparando las divisiones territoriales
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-md tracking-wide">
                    Disculpen las molestias
                </p>

                {/* Separador estilizado mediante tu clase CSS */}
                <div className="divider-gold w-full max-w-2xl" />

                {/* Sección de Banderas */}
                <div className="w-full max-w-4xl">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-8 justify-center">
                        {regiones.map((region) => (
                            <div
                                key={region.nombre}
                                className="flex flex-col items-center p-5 bg-card rounded-lg border border-border logo-glow"
                            >
                                {/* Contenedor de la Bandera */}
                                <div className="w-32 h-20 bg-muted rounded-md overflow-hidden flex items-center justify-center mb-4 border border-border/60 shadow-sm">
                                    <img
                                        src={`/Maps/${region.archivo || region.nombre}.png`}
                                        alt={`Bandera de ${region.nombre}`}
                                        className="w-full h-full object-cover pointer-events-none"
                                        onError={(e) => {
                                            // Oculta la imagen rota de forma segura si no encuentra el archivo
                                            (e.target as HTMLElement).style.display = 'none';
                                        }}
                                    />
                                </div>

                                {/* Nombre de la Región (Aplica tu tipografía base 'RMNeue') */}
                                <span className="font-medium text-sm md:text-base tracking-wide text-foreground">
                                    {region.nombre}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
}