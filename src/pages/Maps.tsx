import { useCallback, useEffect, useMemo, useState } from "react";
import {
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  ScaleControl,
  TileLayer,
  Tooltip,
  ZoomControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { Feature, FeatureCollection, Geometry, Point } from "geojson";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "leaflet/dist/leaflet.css";
import "./TerritorialDivisions.css";

/** Atlas Paniense v1.0 — fuentes GeoJSON almacenadas en /public/atlas.
 * Los polígonos son una propuesta política FICTICIA y provisional.
 * Ningún corredor esquemático constituye una ruta GPS ni implica que haya sido construido.
 */
type Modo = "politico" | "geografico" | "gta";
type RegionId =
  | "pimbo" | "baguette" | "croissant" | "pretzel"
  | "sin-gluten" | "pan-plano-arepa" | "atlantida";
type CapaId = "capitales" | "carreteras" | "ferrocarriles" | "aeropuertos" |
  "estaciones" | "puertos" | "otros" | "especiales" | "regiones";

type AtlasProperties = {
  id?: string;
  region_id?: string | null;
  nombre?: string;
  categoria?: string;
  estado?: string;
  estado_limite?: string;
  rango?: string;
  nota?: string;
  ubicacion_real?: string;
  clase?: string;
  ambito?: string;
};
type AtlasCollection = FeatureCollection<Geometry, AtlasProperties>;
type AtlasFeature = Feature<Geometry, AtlasProperties>;

type AtlasData = {
  regiones: AtlasCollection;
  capitales: AtlasCollection;
  carreteras: AtlasCollection;
  ferrocarriles: AtlasCollection;
  infraestructuras: AtlasCollection;
  especiales: AtlasCollection;
};

type Region = {
  id: RegionId;
  nombre: string;
  capital: string | null;
  capitalLugar: string | null;
  descripcion: string;
  color: string;
  emoji: string;
  flagFile: string;
  situacion: string;
};

const REGIONES: Region[] = [
  { id: "pimbo", nombre: "Pimbo", capital: "Pimbolandia", capitalLugar: "Ordino", descripcion: "Occidente andorrano", color: "#9B7DE4", emoji: "🫓", flagFile: "Pimbo", situacion: "Límites interiores provisionales" },
  { id: "baguette", nombre: "Baguette", capital: "Pantopía", capitalLugar: "Capital estatal y regional", descripcion: "Centro y sur andorrano", color: "#4F98DD", emoji: "🥖", flagFile: "Baguette", situacion: "Ubicación exacta de Pantopía pendiente" },
  { id: "croissant", nombre: "Croissant", capital: "Vila Croissant", capitalLugar: "Meritxell", descripcion: "Oriente andorrano", color: "#D99014", emoji: "🥐", flagFile: "Croissant", situacion: "Límites interiores provisionales" },
  { id: "pretzel", nombre: "Pretzel", capital: "Pretzelópolis", capitalLugar: "Bayona", descripcion: "Costa vasca francesa", color: "#F5804A", emoji: "🥨", flagFile: "Pretzel", situacion: "Perímetro costero provisional" },
  { id: "sin-gluten", nombre: "Sin Glúten", capital: "ChinPan", capitalLugar: "Meda Gran (islas Medas)", descripcion: "Islas Medas y sector litoral de Girona", color: "#70D878", emoji: "🌿", flagFile: "Sin Glúten", situacion: "Parte continental pendiente de ratificar" },
  { id: "pan-plano-arepa", nombre: "Pan Plano/Arepa", capital: "Arepa", capitalLugar: "Ushuaia", descripcion: "Tierra del Fuego", color: "#F56A72", emoji: "🫓", flagFile: "Pan Plano-Arepa", situacion: "Límites de ultramar provisionales" },
  { id: "atlantida", nombre: "Atlántida", capital: null, capitalLugar: null, descripcion: "Territorio de ultramar antártico", color: "#32D3E8", emoji: "❄️", flagFile: "Atlántida", situacion: "Capital y perímetro sin determinar" },
];
const REGIONES_POR_ID = Object.fromEntries(REGIONES.map((r) => [r.id, r])) as Record<RegionId, Region>;
const COLECCIONES: (keyof AtlasData)[] = [
  "regiones", "capitales", "carreteras", "ferrocarriles", "infraestructuras", "especiales",
];
const VACIA: AtlasCollection = { type: "FeatureCollection", features: [] };
const ANDORRA: L.LatLngExpression = [42.535, 1.575];
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function escapar(texto: unknown): string {
  return String(texto ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c] ?? c));
}

function useDatosAtlas() {
  const [datos, setDatos] = useState<AtlasData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function cargar() {
      try {
        const colecciones = await Promise.all(COLECCIONES.map(async (nombre) => {
          const respuesta = await fetch(`/atlas/${nombre}.geojson`, { signal: controller.signal });
          if (!respuesta.ok) throw new Error(`No se puede cargar /atlas/${nombre}.geojson (${respuesta.status})`);
          const json = (await respuesta.json()) as AtlasCollection;
          if (json.type !== "FeatureCollection" || !Array.isArray(json.features)) {
            throw new Error(`GeoJSON incorrecto: ${nombre}`);
          }
          return json;
        }));
        if (controller.signal.aborted) return;
        setDatos(Object.fromEntries(COLECCIONES.map((nombre, i) => [nombre, colecciones[i]])) as AtlasData);
      } catch (ex) {
        if (controller.signal.aborted) return;
        setError(ex instanceof Error ? ex.message : "Error al cargar el atlas.");
      }
    }
    void cargar();
    return () => controller.abort();
  }, []);
  return { datos, error };
}

function Navegador({ seleccion, datos }: { seleccion: string | null; datos: AtlasData | null }) {
  const mapa = useMap();
  useEffect(() => {
    if (!datos) return;
    if (!seleccion) {
      mapa.flyTo(ANDORRA, 10, { duration: 0.9 });
      return;
    }
    const region = datos.regiones.features.find((f) => f.properties?.region_id === seleccion);
    if (region) {
      const limites = L.geoJSON(region).getBounds();
      if (limites.isValid()) {
        mapa.flyToBounds(limites.pad(0.12), {
          maxZoom: seleccion === "sin-gluten" ? 13 : seleccion === "pimbo" || seleccion === "baguette" || seleccion === "croissant" ? 11 : 10,
          duration: 0.9,
        });
        return;
      }
    }
    const especial = datos.especiales.features.find((f) =>
      seleccion === "sahara" ? f.properties?.id === "sahara-ref" : f.properties?.region_id === seleccion);
    if (especial?.geometry.type === "Point") {
      const [lon, lat] = especial.geometry.coordinates;
      mapa.flyTo([lat, lon], seleccion === "sahara" ? 5 : 7, { duration: 0.9 });
    }
  }, [mapa, seleccion, datos]);
  return null;
}

function IconoMarcador(categoria: string, regionId?: string | null) {
  const iconos: Record<string, string> = {
    capital: "★", aeropuerto: "✈", estacion_tren: "🚆", puerto: "⚓",
    hospital: "+", monumento: "◆", recurso: "●", ciudad: "●",
    referencia_territorial: "❄", territorio_en_negociaciones: "?",
  };
  const icono = iconos[categoria] ?? "•";
  const color = regionId && regionId in REGIONES_POR_ID
    ? REGIONES_POR_ID[regionId as RegionId].color : "#e2e8f0";
  return L.divIcon({
    className: "atlas-marker-wrapper",
    html: `<span class="atlas-marker" style="--marker-color:${color}">${icono}</span>`,
    iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -13],
  });
}

function PiezaMarcador({ f, alSeleccionar, etiqueta }: {
  f: AtlasFeature;
  alSeleccionar: (id: string) => void;
  etiqueta?: boolean;
}) {
  if (f.geometry.type !== "Point") return null;
  const propiedades = f.properties ?? {};
  const [lon, lat] = (f.geometry as Point).coordinates;
  const categoria = propiedades.categoria ?? "ciudad";
  const region = propiedades.region_id ?? "";
  const nombre = propiedades.nombre ?? "Punto sin nombre";
  const r = region in REGIONES_POR_ID ? REGIONES_POR_ID[region as RegionId] : null;
  return (
    <Marker
      key={String(f.id ?? propiedades.id ?? nombre)}
      position={[lat, lon]}
      icon={IconoMarcador(categoria, region)}
      eventHandlers={{ click: () => { if (region) alSeleccionar(region); } }}
    >
      {etiqueta && <Tooltip permanent direction="top" offset={[0, -12]} className="atlas-capital-tooltip">{nombre}</Tooltip>}
      <Popup>
        <div className="atlas-popup">
          <b>{nombre}</b>
          <p>{r ? r.nombre : "Territorio especial"}</p>
          {categoria === "capital" && <p><strong>{propiedades.rango === "nacional_y_regional" ? "Capital del Estado Paniense y de Baguette" : "Capital regional"}</strong></p>}
          {propiedades.ubicacion_real && <p>Ubicación: {propiedades.ubicacion_real}</p>}
          {propiedades.estado && <small>Estado: {propiedades.estado}</small>}
          {propiedades.nota && <p>{propiedades.nota}</p>}
        </div>
      </Popup>
    </Marker>
  );
}

export default function TerritorialDivisions() {
  const { datos, error } = useDatosAtlas();
  const [modo, setModo] = useState<Modo>("politico");
  const [regionId, setRegionId] = useState<string | null>(null);
  const [capas, setCapas] = useState<Record<CapaId, boolean>>({
    regiones: true, capitales: true, carreteras: true, ferrocarriles: false,
    aeropuertos: true, estaciones: true, puertos: true, otros: false, especiales: true,
  });

  const alternarCapa = useCallback((capa: CapaId) => setCapas((actual) => ({ ...actual, [capa]: !actual[capa] })), []);
  const regionActual = regionId && regionId in REGIONES_POR_ID ? REGIONES_POR_ID[regionId as RegionId] : null;
  const territorios = datos?.regiones ?? VACIA;
  const carreteras = datos?.carreteras ?? VACIA;
  const ferrocarriles = datos?.ferrocarriles ?? VACIA;
  const especiales = datos?.especiales ?? VACIA;
  const capitales = datos?.capitales ?? VACIA;

  const puntosAdicionales = useMemo(() => (datos?.infraestructuras.features ?? []).filter((f) => {
    if (f.geometry.type !== "Point") return false;
    const tipo = f.properties?.categoria;
    if (tipo === "aeropuerto") return capas.aeropuertos;
    if (tipo === "estacion_tren") return capas.estaciones;
    if (tipo === "puerto") return capas.puertos;
    return capas.otros;
  }), [datos, capas]);

  const estiloRegion = useCallback((f?: Feature): L.PathOptions => {
    const id = f?.properties?.region_id as string | undefined;
    const region = id && id in REGIONES_POR_ID ? REGIONES_POR_ID[id as RegionId] : null;
    const color = region?.color ?? "#94a3b8";
    const activa = regionId === id;
    const atenuada = regionId !== null && !activa;
    return {
      color: activa ? "#ffffff" : color,
      weight: activa ? 3 : modo === "gta" ? 2.4 : 1.8,
      fillColor: color,
      fillOpacity: atenuada ? 0.06 : modo === "politico" ? 0.42 : modo === "geografico" ? 0.16 : 0.27,
      opacity: atenuada ? 0.35 : 1,
      dashArray: modo === "gta" ? "8 3" : undefined,
    };
  }, [modo, regionId]);

  const onEachRegion = useCallback((f: Feature, layer: L.Layer) => {
    const id = String(f.properties?.region_id ?? "");
    const nombre = String(f.properties?.nombre ?? id);
    const shape = layer as L.Path;
    layer.bindTooltip(escapar(nombre), { className: "atlas-region-tooltip", sticky: true });
    layer.bindPopup(`<strong>${escapar(nombre)}</strong><p>Límite político provisional. Selecciona la región para consultar su ficha.</p>`);
    layer.on("click", () => setRegionId(id));
    layer.on("mouseover", () => shape.setStyle({ weight: 3.6, fillOpacity: 0.55 }));
    layer.on("mouseout", () => shape.setStyle(estiloRegion(f)));
  }, [estiloRegion]);

  const onEachVia = useCallback((f: Feature, layer: L.Layer) => {
    const p = f.properties ?? {};
    layer.bindPopup(`<b>${escapar(p.nombre)}</b><p>${escapar(p.nota ?? "Infraestructura de transporte")}</p>`);
  }, []);

  const capasLista: { id: CapaId; etiqueta: string; cuenta?: number }[] = [
    { id: "regiones", etiqueta: "Fronteras políticas", cuenta: territorios.features.length },
    { id: "capitales", etiqueta: "Capitales", cuenta: capitales.features.length },
    { id: "carreteras", etiqueta: "Carreteras / corredores", cuenta: carreteras.features.length },
    { id: "ferrocarriles", etiqueta: "Ferrocarriles", cuenta: ferrocarriles.features.length },
    { id: "aeropuertos", etiqueta: "Aeropuertos" },
    { id: "estaciones", etiqueta: "Estaciones" },
    { id: "puertos", etiqueta: "Puertos" },
    { id: "otros", etiqueta: "Otros servicios" },
    { id: "especiales", etiqueta: "Territorios especiales" },
  ];

  const topografia = modo === "geografico";
  return (
    <div className="atlas-pagina">
      <Header />
      <main className="atlas-contenedor">
        <header className="atlas-cabecera">
          <div>
            <p className="atlas-eyebrow">ESTADO PANIENSE / CARTOGRAFÍA NACIONAL</p>
            <h1>Atlas Territorial <span className="atlas-version">v1.0</span></h1>
            <p>Atlas político, geográfico y modo GTA · 7 regiones y territorios · límites en revisión</p>
          </div>
          <a className="atlas-descargar" href="/atlas/regiones.geojson" download="regiones-paniense.geojson">↓ GeoJSON territorial</a>
        </header>

        <section className="atlas-botones-modo" aria-label="Modo cartográfico">
          {(["politico", "geografico", "gta"] as const).map((valor) => (
            <button key={valor} className={modo === valor ? "activo" : ""} onClick={() => setModo(valor)} aria-pressed={modo === valor}>
              {valor === "politico" ? "◈ Político" : valor === "geografico" ? "▲ Geográfico" : "◉ GTA V mode"}
            </button>
          ))}
          <span className="atlas-estado">{!datos && !error ? "Cargando GeoJSON…" : error ? "Error de carga" : "GeoJSON cargados"}</span>
        </section>

        {error && <div className="atlas-error" role="alert"><b>Error:</b> {error}. Comprueba que la carpeta <code>public/atlas</code> está disponible.</div>}

        <div className="atlas-grid">
          <aside className="atlas-sidebar" aria-label="Regiones y capas">
            <div className="atlas-panel-titulo">DIVISIÓN TERRITORIAL <small>7 unidades</small></div>
            <button className={`atlas-region-todo ${!regionId ? "seleccionada" : ""}`} onClick={() => setRegionId(null)}>⌖ Ver territorio principal</button>
            <div className="atlas-region-lista">
              {REGIONES.map((r) => (
                <button key={r.id} className={`atlas-region-opcion ${regionId === r.id ? "seleccionada" : ""}`} onClick={() => setRegionId(r.id)}>
                  <span className="atlas-region-indicador" style={{ backgroundColor: r.color }} />
                  <span className="atlas-region-nombre"><b>{r.nombre}</b><small>{r.capital ? `${r.capital} · ${r.capitalLugar}` : "Capital pendiente"}</small></span>
                  <span className="atlas-chevron">›</span>
                </button>
              ))}
              <button className={`atlas-region-opcion atlas-zona-especial ${regionId === "sahara" ? "seleccionada" : ""}`} onClick={() => setRegionId("sahara")}>
                <span className="atlas-region-indicador" style={{ backgroundColor: "#94a3b8" }} />
                <span className="atlas-region-nombre"><b>Sáhara Occidental</b><small>Territorio en negociaciones</small></span>
                <span className="atlas-chevron">›</span>
              </button>
            </div>

            <div className="atlas-panel-titulo atlas-capitulo">CAPAS DEL ATLAS <small>GeoJSON</small></div>
            <div className="atlas-capas">
              {capasLista.map((c) => (
                <label key={c.id} className="atlas-capa-toggle">
                  <input type="checkbox" checked={capas[c.id]} onChange={() => alternarCapa(c.id)} />
                  <span>{c.etiqueta}</span>
                  {c.cuenta !== undefined && <small>{c.cuenta}</small>}
                </label>
              ))}
            </div>
            <p className="atlas-sidebar-nota">Las carreteras precargadas son corredores esquemáticos de planificación, no rutas navegables. Los aeropuertos y las estaciones están preparados para incorporar nuevos GeoJSON.</p>
          </aside>

          <div className={`atlas-mapa-panel atlas-mapa-${modo}`}>
            <MapContainer center={ANDORRA} zoom={10} minZoom={2} maxZoom={18} zoomControl={false} className="atlas-leaflet">
              <Navegador seleccion={regionId} datos={datos} />
              {topografia ? (
                <TileLayer key="topo" url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" maxNativeZoom={17} maxZoom={18}
                  attribution={`${OSM_ATTRIBUTION} | © OpenTopoMap (CC-BY-SA)`} />
              ) : (
                <TileLayer key={modo} className={modo === "gta" ? "atlas-tiles-gta" : "atlas-tiles-politico"}
                  url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution={OSM_ATTRIBUTION} maxZoom={19} />
              )}
              <ZoomControl position="bottomright" />
              <ScaleControl position="bottomleft" imperial={false} />

              {capas.regiones && territorios.features.length > 0 && <GeoJSON
                key={`region-${modo}-${regionId ?? "global"}`}
                data={territorios}
                style={estiloRegion}
                onEachFeature={onEachRegion}
              />}
              {capas.carreteras && carreteras.features.length > 0 && <GeoJSON
                key={`via-${modo}`}
                data={carreteras}
                style={() => ({ color: modo === "gta" ? "#f5d85e" : "#efbd51", weight: modo === "gta" ? 4 : 3, opacity: 0.95, dashArray: "7, 7" })}
                onEachFeature={onEachVia}
              />}
              {capas.ferrocarriles && ferrocarriles.features.length > 0 && <GeoJSON
                data={ferrocarriles}
                style={{ color: "#f8fafc", weight: 3, dashArray: "2, 7" }}
                onEachFeature={onEachVia}
              />}
              {capas.capitales && capitales.features.map((f) => (
                <PiezaMarcador key={String(f.id ?? f.properties?.id)} f={f} alSeleccionar={setRegionId} etiqueta />
              ))}
              {puntosAdicionales.map((f) => <PiezaMarcador key={String(f.id ?? f.properties?.id)} f={f} alSeleccionar={setRegionId} />)}
              {capas.especiales && especiales.features.map((f) => <PiezaMarcador key={String(f.id ?? f.properties?.id)} f={f} alSeleccionar={setRegionId} />)}
            </MapContainer>
            <div className="atlas-mapa-etiqueta">{modo === "politico" ? "MAPA POLÍTICO" : modo === "geografico" ? "MAPA GEOGRÁFICO" : "GTA V · MAPA TÁCTICO"}</div>
          </div>
        </div>

        <section className="atlas-ficha" aria-live="polite">
          {regionActual ? (
            <>
              <span className="atlas-ficha-color" style={{ background: regionActual.color }} />
              <div className="atlas-ficha-texto">
                <span className="atlas-ficha-super">FICHA TERRITORIAL · {regionActual.id.toUpperCase()}</span>
                <h2>{regionActual.nombre}</h2>
                <p>{regionActual.descripcion}. <b>Capital:</b> {regionActual.capital ?? "Por definir"}{regionActual.capitalLugar ? ` (${regionActual.capitalLugar})` : ""}.</p>
                <small>{regionActual.situacion}</small>
              </div>
              <img src={`/Maps/${regionActual.flagFile}.png`} alt={`Bandera de ${regionActual.nombre}`} onError={(e) => { e.currentTarget.style.display = "none"; }} />
            </>
          ) : regionId === "sahara" ? (
            <div className="atlas-ficha-texto"><span className="atlas-ficha-super">ESTATUS ESPECIAL</span><h2>Sáhara Occidental</h2><p>Territorio en negociaciones. No se representa como región integrada ni se establece una frontera paniense.</p></div>
          ) : (
            <div className="atlas-ficha-texto"><span className="atlas-ficha-super">CAPITAL DEL ESTADO PANIENSE · PANTOPÍA</span><h2>Un Estado, varios territorios</h2><p>Selecciona una región o cambia de mapa. Las fronteras de la v1.0 son borradores cartográficos; las capitales sí siguen el acuerdo territorial.</p></div>
          )}
        </section>
        <footer className="atlas-legal">Cartografía ficticia · Los límites de las regiones son propuestas pendientes de ratificación · GeoJSON WGS84 (longitud, latitud) · Base © OpenStreetMap contributors</footer>
      </main>
      <Footer />
    </div>
  );
}
