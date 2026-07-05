import { useMemo, useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import L, { type PathOptions } from "leaflet";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { supabase } from "../lib/supabaseClient";

import "leaflet/dist/leaflet.css";

// Fix base por si se necesitan marcadores nativos en algún momento (SSR/Vite)
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────
interface PuntoInteres {
    id: string;
    nombre: string;
    region: string;
    latitud: number;
    longitud: number;
    tipo: "capital" | "ciudad" | "monumento" | "recurso";
    icono: string;
}

interface Region {
    nombre: string;
    archivo?: string;
    color: string;
    colorBorde: string;
    emoji: string;
    descripcion: string;
    territorioReal: string;
}

// ─────────────────────────────────────────────
// REGIONES
// ─────────────────────────────────────────────
const REGIONES: Region[] = [
    {
        nombre: "Baguette",
        color: "#60a5fa",
        colorBorde: "#2563eb",
        emoji: "🥖",
        descripcion: "Las tierras altas del norte",
        territorioReal: "Ariège · Haute-Garonne (Francia)",
    },
    {
        nombre: "Croissant",
        color: "#f59e0b",
        colorBorde: "#b45309",
        emoji: "🥐",
        descripcion: "El oeste atlántico",
        territorioReal: "País Vasco francés · Pirineos Atlánticos",
    },
    {
        nombre: "Pimbo",
        color: "#a78bfa",
        colorBorde: "#6d28d9",
        emoji: "🫓",
        descripcion: "El bastión andorrano-catalán",
        territorioReal: "Andorra Oeste · Prov. Tarragona · Zona Badalona, Sabadell y Terrassa",
    },
    {
        nombre: "Pretzel",
        color: "#f97316",
        colorBorde: "#c2410c",
        emoji: "🥨",
        descripcion: "Las cimas orientales",
        territorioReal: "Parroquias este de Andorra (Canillo, Encamp, Escaldes)",
    },
    {
        nombre: "Pan Plano/Arepa",
        archivo: "Pan Plano-Arepa", // Mapea exactamente al nombre de tu archivo .png
        color: "#f87171",
        colorBorde: "#b91c1c",
        emoji: "🫔",
        descripcion: "La costa del calor eterno",
        territorioReal: "Languedoc · Hérault (Costa mediterránea francesa)",
    },
    {
        nombre: "Sin Glúten",
        color: "#34d399",
        colorBorde: "#059669",
        emoji: "🌿",
        descripcion: "El enclave insular",
        territorioReal: "Islas Medas (Girona, España)",
    },
];

const REGION_MAP = Object.fromEntries(REGIONES.map((r) => [r.nombre, r]));

// ─────────────────────────────────────────────
// GEOJSON (Coordenadas correctas en [longitud, latitud])
// ─────────────────────────────────────────────
const REGIONES_GEOJSON: FeatureCollection = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            properties: { region: "Baguette" },
            geometry: {
                type: "Polygon",
                coordinates: [[
                    [1.00, 42.75], [1.38, 42.72], [1.75, 42.61], [1.97, 42.71],
                    [2.15, 42.90], [1.90, 43.15], [1.60, 43.25], [1.25, 43.15],
                    [0.85, 42.90], [1.00, 42.75]
                ]],
            },
        },
        {
            type: "Feature",
            properties: { region: "Croissant" },
            geometry: {
                type: "Polygon",
                coordinates: [[
                    [-1.79, 43.35], [-1.40, 43.52], [-0.95, 43.50], [-0.45, 43.20],
                    [-0.75, 42.95], [-1.10, 43.02], [-1.35, 43.00], [-1.65, 43.15],
                    [-1.79, 43.35]
                ]],
            },
        },
        {
            type: "Feature",
            properties: { region: "Pimbo" },
            geometry: {
                type: "MultiPolygon",
                coordinates: [
                    [[
                        [1.414, 42.656], [1.531, 42.644], [1.522, 42.507],
                        [1.503, 42.435], [1.437, 42.448], [1.405, 42.555],
                        [1.414, 42.656]
                    ]],
                    [[
                        [0.16, 40.52], [0.55, 40.64], [0.89, 41.02], [1.53, 41.20],
                        [1.58, 41.56], [1.14, 41.60], [0.93, 41.35], [0.22, 41.32],
                        [0.16, 40.52]
                    ]],
                    [[
                        [1.96, 41.52], [2.14, 41.63], [2.27, 41.49],
                        [2.22, 41.43], [2.03, 41.52], [1.96, 41.52]
                    ]]
                ],
            },
        },
        {
            type: "Feature",
            properties: { region: "Pretzel" },
            geometry: {
                type: "Polygon",
                coordinates: [[
                    [1.531, 42.644], [1.782, 42.569], [1.745, 42.433],
                    [1.503, 42.435], [1.522, 42.507], [1.531, 42.644]
                ]],
            },
        },
        {
            type: "Feature",
            properties: { region: "Pan Plano/Arepa" },
            geometry: {
                type: "Polygon",
                coordinates: [[
                    [2.85, 43.25], [3.30, 43.65], [4.10, 43.60], [4.30, 43.35],
                    [3.70, 43.40], [3.10, 43.15], [2.85, 43.25]
                ]],
            },
        },
        {
            type: "Feature",
            properties: { region: "Sin Glúten" },
            geometry: {
                type: "Polygon",
                coordinates: [[
                    [3.210, 42.055], [3.225, 42.055], [3.225, 42.045],
                    [3.210, 42.045], [3.210, 42.055]
                ]],
            },
        },
    ],
};

// ─────────────────────────────────────────────
// HELPER: ICONO DE BANDERA EXCLUSIVO
// ─────────────────────────────────────────────
const obtenerIconoBandera = (nombreRegion: string, tipo: string) => {
    const region = REGION_MAP[nombreRegion];
    const nombreArchivo = region?.archivo ?? region?.nombre ?? "default";

    // Las capitales tienen una bandera ligeramente más grande para destacar
    const ancho = tipo === "capital" ? 44 : 32;
    const alto = tipo === "capital" ? 28 : 20;

    return L.icon({
        iconUrl: `/Maps/${nombreArchivo}.png`,
        iconSize: [ancho, alto],
        iconAnchor: [ancho / 2, alto], // La base de la bandera apunta al punto exacto
        popupAnchor: [0, -alto],
        className: "bandera-marcador"
    });
};

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
export default function TerritorialDivisions() {
    const [puntos, setPuntos] = useState<PuntoInteres[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [regionActiva, setRegionActiva] = useState<string | null>(null);

    // Referencia al GeoJSON para poder modificar sus estilos sin re-montar el componente
    const geoJsonRef = useRef<L.GeoJSON>(null);

    // ── Supabase ─────────────────────────────
    useEffect(() => {
        async function fetchPuntos() {
            setCargando(true);
            try {
                const { data, error: sbError } = await supabase
                    .from("puntos_interes")
                    .select("id, nombre, region, latitud, longitud, tipo, icono");
                if (sbError) throw sbError;
                setPuntos(data ?? []);
            } catch (err: any) {
                console.error("Error cargando puntos:", err);
                setError("Mostrando datos de demostración geolocalizados.");
                setPuntos([
                    { id: "1", nombre: "Pan-Dorra la Vella", region: "Pimbo", latitud: 42.5063, longitud: 1.5218, tipo: "capital", icono: "" },
                    { id: "2", nombre: "Núcleo Sabadell", region: "Pimbo", latitud: 41.5462, longitud: 2.1086, tipo: "ciudad", icono: "" },
                    { id: "3", nombre: "Bastión de Badalona", region: "Pimbo", latitud: 41.4501, longitud: 2.2474, tipo: "ciudad", icono: "" },
                    { id: "4", nombre: "Puerto de Tarraco Paniense", region: "Pimbo", latitud: 41.1189, longitud: 1.2445, tipo: "ciudad", icono: "" },
                    { id: "5", nombre: "Canillo Crujiente", region: "Pretzel", latitud: 42.5670, longitud: 1.5990, tipo: "capital", icono: "" },
                    { id: "6", nombre: "Fortaleza de Baguette-sur-Ariège", region: "Baguette", latitud: 42.9200, longitud: 1.6050, tipo: "capital", icono: "" },
                    { id: "7", nombre: "Bastión de Bayona", region: "Croissant", latitud: 43.4929, longitud: -1.4748, tipo: "capital", icono: "" },
                    { id: "8", nombre: "Santuario sin TACC", region: "Sin Glúten", latitud: 42.0520, longitud: 3.2190, tipo: "capital", icono: "" },
                ]);
            } finally {
                setCargando(false);
            }
        }
        fetchPuntos();
    }, []);

    // ── Estilo Dinámico GeoJSON ───────────────
    const estiloRegion = useCallback(
        (feature?: Feature<Geometry>): PathOptions => {
            const nombre = feature?.properties?.region as string;
            const reg = REGION_MAP[nombre];
            const activa = regionActiva === nombre;
            return {
                fillColor: reg?.color ?? "#6b7280",
                color: reg?.colorBorde ?? "#374151",
                weight: activa ? 3.5 : 1.5,
                opacity: 0.95,
                fillOpacity: activa ? 0.55 : 0.28,
            };
        },
        [regionActiva]
    );

    // Aplicar los nuevos estilos a la capa cuando cambia regionActiva 
    // sin re-renderizar todo el componente GeoJSON
    useEffect(() => {
        if (geoJsonRef.current) {
            geoJsonRef.current.setStyle(estiloRegion);
        }
    }, [regionActiva, estiloRegion]);

    // ── Eventos GeoJSON (Hover sin bugs) ──────
    const onEachRegion = useCallback(
        (feature: Feature<Geometry>, layer: L.Layer) => {
            const nombre = feature.properties?.region as string;
            const reg = REGION_MAP[nombre];

            layer.on({
                mouseover: (e) => {
                    const target = e.target as L.Path;
                    target.setStyle({ fillOpacity: 0.65, weight: 3.5 });
                },
                mouseout: (e) => {
                    // resetStyle revierte automáticamente al estilo dictado por estiloRegion actual
                    if (geoJsonRef.current) {
                        geoJsonRef.current.resetStyle(e.target as L.Path);
                    }
                },
                click: () => {
                    setRegionActiva((prev) => (prev === nombre ? null : nombre));
                },
            });

            layer.bindTooltip(
                `<span style="font-weight:700;font-size:12px;letter-spacing:0.03em">${reg?.emoji ?? "📍"} ${nombre}</span>`,
                { permanent: true, direction: "center", className: "region-tooltip" }
            );
        },
        [] // Importante: Sin dependencias para que Leaflet no acumule listeners
    );

    const puntosFiltrados = useMemo(
        () => regionActiva ? puntos.filter((p) => p.region === regionActiva) : puntos,
        [puntos, regionActiva]
    );

    const mapCenter: [number, number] = [42.20, 1.40];

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-accent/20">
            <Header />

            <main className="flex-grow flex flex-col items-center justify-start container section-spacious text-center gap-8">
                <div className="text-7xl animate-bounce select-none">🍞</div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl text-primary max-w-2xl leading-tight font-chillvornia">
                    Divisiones Territoriales Panienses
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-xl tracking-wide">
                    Explora el mapa geopolítico de las seis regiones del Imperio del Pan.
                </p>

                {/* Filtros */}
                <div className="flex flex-wrap gap-2 justify-center">
                    {REGIONES.map((r) => (
                        <button
                            key={r.nombre}
                            onClick={() => setRegionActiva((prev) => prev === r.nombre ? null : r.nombre)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all"
                            style={{
                                borderColor: r.colorBorde,
                                backgroundColor: regionActiva === r.nombre ? r.color + "33" : "transparent",
                                color: regionActiva === r.nombre ? r.color : "var(--muted-foreground)",
                                outline: regionActiva === r.nombre ? `2px solid ${r.color}` : "none",
                            }}
                        >
                            {r.emoji} {r.nombre}
                        </button>
                    ))}
                    {regionActiva && (
                        <button
                            onClick={() => setRegionActiva(null)}
                            className="px-3 py-1.5 rounded-full text-sm font-medium border border-border text-muted-foreground hover:bg-muted transition-all"
                        >
                            ✕ Ver todo
                        </button>
                    )}
                </div>

                {/* Info de Región Activa */}
                {regionActiva && REGION_MAP[regionActiva] && (
                    <div
                        className="flex items-center gap-3 px-5 py-3 rounded-xl border text-left max-w-lg w-full"
                        style={{
                            borderColor: REGION_MAP[regionActiva].colorBorde + "66",
                            backgroundColor: REGION_MAP[regionActiva].color + "11"
                        }}
                    >
                        <span className="text-3xl">{REGION_MAP[regionActiva].emoji}</span>
                        <div>
                            <p className="font-semibold text-foreground text-sm">{REGION_MAP[regionActiva].descripcion}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{REGION_MAP[regionActiva].territorioReal}</p>
                        </div>
                    </div>
                )}

                {error && (
                    <p className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/30 rounded-md px-4 py-2 max-w-lg">
                        ⚠️ {error}
                    </p>
                )}

                {/* MAPA CONTENEDOR */}
                <div className="w-full max-w-5xl h-[600px] rounded-xl overflow-hidden border border-border shadow-lg logo-glow relative z-0">
                    {cargando && (
                        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-background/80 text-muted-foreground text-sm">
                            Cargando territorios oficiales…
                        </div>
                    )}

                    <MapContainer center={mapCenter} zoom={7} style={{ height: "100%", width: "100%" }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />

                        {/* El GeoJSON ahora usa la referencia para actualizar estilos sin desmontarse */}
                        <GeoJSON
                            ref={geoJsonRef}
                            data={REGIONES_GEOJSON}
                            style={estiloRegion}
                            onEachFeature={onEachRegion}
                        />

                        {puntosFiltrados.map((punto) => (
                            <Marker
                                key={punto.id}
                                position={[punto.latitud, punto.longitud]}
                                icon={obtenerIconoBandera(punto.region, punto.tipo)}
                            >
                                <Popup>
                                    <div className="text-left p-1 min-w-[160px]" style={{ color: "#1e293b" }}>
                                        <h3 className="font-bold text-sm leading-tight mb-1">{punto.nombre}</h3>
                                        <p className="text-xs font-semibold mb-2" style={{ color: REGION_MAP[punto.region]?.color ?? "#6b7280" }}>
                                            {REGION_MAP[punto.region]?.emoji} {punto.region}
                                        </p>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium uppercase tracking-wide">
                                                {punto.tipo}
                                            </span>
                                            {punto.tipo === "capital" && (
                                                <span className="inline-block bg-yellow-400 text-yellow-900 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                                    👑 Capital
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>

                    <style>{`
                        .region-tooltip {
                            background: rgba(10, 15, 30, 0.9);
                            border: 1px solid rgba(255,255,255,0.15);
                            color: #f1f5f9;
                            border-radius: 6px;
                            padding: 3px 9px;
                            font-family: inherit;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.6);
                            pointer-events: none;
                            white-space: nowrap;
                        }
                        .region-tooltip::before { display: none; }
                        .leaflet-popup-content-wrapper {
                            border-radius: 10px;
                            box-shadow: 0 4px 20px rgba(0,0,0,0.4);
                        }
                        .bandera-marcador {
                            object-fit: cover;
                            border-radius: 4px;
                            box-shadow: 0 4px 8px rgba(0,0,0,0.5);
                            border: 1px solid rgba(255,255,255,0.25);
                            transition: transform 0.2s ease;
                        }
                        .bandera-marcador:hover {
                            transform: scale(1.15);
                            z-index: 1000 !important;
                        }
                    `}</style>
                </div>

                {/* Panel de Puntos inferior */}
                {regionActiva && puntosFiltrados.length > 0 && (
                    <div className="w-full max-w-5xl">
                        <h3 className="text-sm font-medium text-muted-foreground mb-3 text-left">
                            {REGION_MAP[regionActiva]?.emoji} Puntos en <span className="text-foreground">{regionActiva}</span>
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {puntosFiltrados.map((p) => {
                                const archivoBandera = REGION_MAP[p.region]?.archivo ?? p.region;
                                return (
                                    <div key={p.id} className="flex items-start gap-2 p-3 rounded-lg bg-card border border-border text-left hover:bg-muted/50 transition-colors">
                                        <img
                                            src={`/Maps/${archivoBandera}.png`}
                                            alt={`Bandera de ${p.region}`}
                                            className="w-8 h-5 object-cover rounded-sm border shadow-sm shrink-0 mt-0.5"
                                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                                        />
                                        <div>
                                            <p className="text-xs font-semibold leading-tight text-foreground">{p.nombre}</p>
                                            <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">{p.tipo}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="divider-gold w-full max-w-2xl my-4" />

                {/* Grid Facciones */}
                <div className="w-full max-w-4xl">
                    <h2 className="text-xl md:text-2xl mb-6 text-muted-foreground tracking-wide font-medium">
                        Estados y Facciones
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-8">
                        {REGIONES.map((region) => (
                            <button
                                key={region.nombre}
                                onClick={() => setRegionActiva((prev) => prev === region.nombre ? null : region.nombre)}
                                className="flex flex-col items-center p-5 bg-card rounded-lg border transition-all hover:-translate-y-1 focus:outline-none focus-visible:ring-2 text-left"
                                style={{
                                    borderColor: regionActiva === region.nombre ? region.color : "var(--border)",
                                    boxShadow: regionActiva === region.nombre ? `0 0 14px ${region.color}55` : undefined,
                                }}
                            >
                                <div
                                    className="w-32 h-20 rounded-md overflow-hidden flex items-center justify-center mb-3 border shadow-sm"
                                    style={{ borderColor: region.colorBorde + "55", backgroundColor: region.color + "15" }}
                                >
                                    <img
                                        src={`/Maps/${region.archivo ?? region.nombre}.png`}
                                        alt={`Bandera de ${region.nombre}`}
                                        className="w-full h-full object-cover pointer-events-none"
                                        onError={(e) => {
                                            const img = e.currentTarget as HTMLImageElement;
                                            img.style.display = "none";
                                            const span = document.createElement("span");
                                            span.textContent = region.emoji;
                                            span.style.fontSize = "2.5rem";
                                            img.parentElement?.appendChild(span);
                                        }}
                                    />
                                </div>
                                <span className="font-semibold text-sm md:text-base tracking-wide text-foreground text-center">
                                    {region.emoji} {region.nombre}
                                </span>
                                <span className="text-[11px] text-muted-foreground mt-1 text-center leading-tight">
                                    {region.territorioReal}
                                </span>
                                <span className="text-[11px] mt-1.5" style={{ color: region.color }}>
                                    {puntos.filter((p) => p.region === region.nombre).length} punto(s)
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}