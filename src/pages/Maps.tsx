import { useCallback, useEffect, useMemo, useState } from "react";
import { GeoJSON, MapContainer, Marker, Popup, ScaleControl, TileLayer, Tooltip, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import type { Feature, FeatureCollection, Geometry, Point } from "geojson";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "leaflet/dist/leaflet.css";
import "./TerritorialDivisions.css";

/*
 * ESTADO PANIENSE — Atlas territorial v2.0
 * Los polígonos de /public/atlas/ proceden de fuentes cartográficas REALES.
 * La agrupación de parroquias/municipios como regiones panienses es FICTICIA
 * y permanece provisional hasta su ratificación. No se interpolan fronteras.
 */

type Modo = "politico" | "geografico" | "gta";
type Identificador = "pimbo" | "baguette" | "croissant" | "pretzel" |
  "sin-gluten" | "pan-plano-arepa" | "atlantida" | "sahara";
type DatosCapa = "regiones" | "capitales" | "especiales" | "carreteras" |
  "ferrocarriles" | "aeropuertos" | "estaciones" | "puertos" | "otros";
type Propiedades = {
  id?: string;
  region_id?: string;
  nombre?: string;
  categoria?: string;
  clase?: string;
  rango?: string;
  estado?: string;
  estado_limite?: string;
  unidad_origen?: string;
  source?: string;
  nota?: string;
};
type Coleccion = FeatureCollection<Geometry, Propiedades>;
type Elemento = Feature<Geometry, Propiedades>;
type Atlas = Record<DatosCapa, Coleccion>;

type Region = {
  id: Identificador;
  nombre: string;
  capital: string | null;
  descripcion: string;
  color: string;
  bandera: string;
  situacion: string;
  centro: [number, number];
  zoom: number;
};

const REGIONES: Region[] = [
  { id: "pimbo", nombre: "Pimbo", capital: "Pimbolandia", descripcion: "Sector noroccidental y suroccidental andorrano", color: "#A17DEB", bandera: "Pimbo", situacion: "Ordino, La Massana y Sant Julià de Lòria · agrupación provisional", centro: [42.55, 1.49], zoom: 11 },
  { id: "baguette", nombre: "Baguette", capital: "Pantopía", descripcion: "Sede del Gobierno del Estado Paniense", color: "#4B9DDD", bandera: "Baguette", situacion: "Andorra la Vella y Escaldes-Engordany · agrupación provisional", centro: [42.51, 1.54], zoom: 12 },
  { id: "croissant", nombre: "Croissant", capital: "Vila Croissant", descripcion: "Sector oriental andorrano", color: "#E09A20", bandera: "Croissant", situacion: "Encamp y Canillo · agrupación provisional", centro: [42.555, 1.64], zoom: 11 },
  { id: "pretzel", nombre: "Pretzel", capital: "Pretzelópolis", descripcion: "Franja litoral vascofrancesa", color: "#F47544", bandera: "Pretzel", situacion: "10 comunas costeras reales · selección provisional", centro: [43.36, -1.55], zoom: 10 },
  { id: "sin-gluten", nombre: "Sin Glúten", capital: "ChinPan", descripcion: "Islas Medas y sector continental de Girona", color: "#67D58D", bandera: "Sin Glúten", situacion: "Límites insulares y continentales pendientes de aprobación", centro: [42.05, 3.225], zoom: 13 },
  { id: "pan-plano-arepa", nombre: "Pan Plano / Arepa", capital: "Arepa", descripcion: "Sector argentino de Tierra del Fuego", color: "#F16F76", bandera: "Pan Plano-Arepa", situacion: "Contorno real histórico; precisión local de Ushuaia pendiente", centro: [-54.4, -67.5], zoom: 7 },
  { id: "atlantida", nombre: "Atlántida", capital: null, descripcion: "Territorio de ultramar antártico", color: "#35CDE2", bandera: "Atlántida", situacion: "Perímetro y capital pendientes de definición", centro: [-77.87, -34.62], zoom: 5 },
  { id: "sahara", nombre: "Sáhara Occidental", capital: null, descripcion: "Territorio en negociaciones", color: "#B5BEC9", bandera: "", situacion: "No es una región ratificada del Estado Paniense", centro: [24.21, -13.21], zoom: 6 },
];
const POR_ID = Object.fromEntries(REGIONES.map(r => [r.id, r])) as Record<Identificador, Region>;
const CAPAS: DatosCapa[] = ["regiones", "capitales", "especiales", "carreteras", "ferrocarriles", "aeropuertos", "estaciones", "puertos", "otros"];
const CAPA_INFO: { id: DatosCapa; label: string; emoji: string }[] = [
  { id: "regiones", label: "Límites territoriales", emoji: "◇" },
  { id: "capitales", label: "Capitales", emoji: "★" },
  { id: "carreteras", label: "Carreteras", emoji: "═" },
  { id: "ferrocarriles", label: "Ferrocarriles", emoji: "≋" },
  { id: "aeropuertos", label: "Aeropuertos", emoji: "✈" },
  { id: "estaciones", label: "Estaciones", emoji: "▣" },
  { id: "puertos", label: "Puertos", emoji: "⚓" },
  { id: "otros", label: "Otros equipamientos", emoji: "◆" },
  { id: "especiales", label: "Situaciones especiales", emoji: "◎" },
];
const VACIA: Coleccion = { type: "FeatureCollection", features: [] };
const PANE_ORIGEN: L.LatLngTuple = [42.533, 1.568];
const BG: Record<Modo, { url: string; attribution: string; maxZoom: number }> = {
  politico: {
    url: "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
  },
  geografico: {
    // World Shaded Relief no incluye nombres urbanos como capa principal.
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri · Esri, USGS, NOAA",
    maxZoom: 13,
  },
  gta: {
    url: "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
  },
};

function useAtlas(): { atlas: Atlas | null; error: string | null } {
  const [atlas, setAtlas] = useState<Atlas | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const abort = new AbortController();
    (async () => {
      try {
        const pairs = await Promise.all(CAPAS.map(async (capa) => {
          const r = await fetch(`${import.meta.env.BASE_URL}atlas/${capa}.geojson`, { signal: abort.signal });
          if (!r.ok) throw new Error(`No se encontró ${capa}.geojson (HTTP ${r.status})`);
          const data = await r.json() as Coleccion;
          if (data.type !== "FeatureCollection" || !Array.isArray(data.features)) throw new Error(`GeoJSON inválido: ${capa}`);
          return [capa, data] as const;
        }));
        if (!abort.signal.aborted) setAtlas(Object.fromEntries(pairs) as Atlas);
      } catch (e) {
        if (!abort.signal.aborted) setError(e instanceof Error ? e.message : "Error cargando GeoJSON");
      }
    })();
    return () => abort.abort();
  }, []);
  return { atlas, error };
}

function Desplazamiento({ id, atlas, reiniciar }: { id: Identificador | null; atlas: Atlas | null; reiniciar: number }) {
  const map = useMap();
  useEffect(() => {
    if (!atlas) return;
    if (!id) { map.flyTo(PANE_ORIGEN, 10, { duration: 0.65 }); return; }
    const region = POR_ID[id];
    const fs = atlas.regiones.features.filter(f => f.properties?.region_id === id);
    if (fs.length) {
      const bounds = L.geoJSON({ type: "FeatureCollection", features: fs } as Coleccion).getBounds();
      if (bounds.isValid()) { map.flyToBounds(bounds.pad(0.15), { maxZoom: region.zoom, duration: 0.8 }); return; }
    }
    map.flyTo(region.centro, region.zoom, { duration: 0.8 });
  }, [map, id, atlas, reiniciar]);
  return null;
}

function iconoPunto(kind: string, regionId?: string): L.DivIcon {
  const emoji = kind === "capital" ? "★" : kind === "aeropuerto" ? "✈" : kind === "estacion" ? "▣" :
    kind === "puerto" ? "⚓" : kind === "negociaciones" ? "!" : kind === "territorio_ultramar" ? "❄" : "◆";
  const color = regionId && (regionId as Identificador) in POR_ID ? POR_ID[regionId as Identificador].color : "#E5EBF5";
  return L.divIcon({ className: "ap-icono-wrap", html: `<span class="ap-icono" style="--ap-color:${color}">${emoji}</span>`, iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -14] });
}

function geoEstilo(f: Feature | undefined, selected: Identificador | null, modo: Modo, show: boolean): L.PathOptions {
  const id = f?.properties?.region_id as Identificador | undefined;
  const color = id && POR_ID[id] ? POR_ID[id].color : "#82909F";
  const active = selected === id;
  const muted = selected && !active;
  return {
    color: modo === "gta" ? (active ? "#FFFFFF" : color) : color,
    weight: active ? 3.3 : modo === "gta" ? 2.3 : 1.8,
    opacity: show ? 0.95 : 0,
    fillColor: color,
    fillOpacity: !show ? 0 : muted ? 0.09 : modo === "geografico" ? (active ? 0.24 : 0.12) : modo === "gta" ? (active ? 0.62 : 0.39) : active ? 0.58 : 0.40,
  };
}

function capitalPopup(f: Elemento) {
  const p = f.properties ?? {};
  const id = p.region_id as Identificador | undefined;
  return <div className="ap-popup">
    <strong>{p.nombre}</strong>
    <span>{id && POR_ID[id]?.nombre}</span>
    <p>{p.rango === "capital_estado_y_region" ? "Capital del Estado Paniense y de Baguette" : "Capital regional"}</p>
    {p.estado !== "emplazamiento_acordado" && <small>Emplazamiento cartográfico aproximado</small>}
  </div>;
}

export default function TerritorialDivisions() {
  const { atlas, error } = useAtlas();
  const [modo, setModo] = useState<Modo>("politico");
  const [seleccion, setSeleccion] = useState<Identificador | null>(null);
  const [reiniciar, setReiniciar] = useState(0);
  const [capas, setCapas] = useState<Record<DatosCapa, boolean>>({
    regiones: true, capitales: true, especiales: true, carreteras: false,
    ferrocarriles: false, aeropuertos: false, estaciones: false, puertos: false, otros: false,
  });
  const [fichaAbierta, setFichaAbierta] = useState(true);
  const activo = seleccion ? POR_ID[seleccion] : null;
  const vacio = (nombre: DatosCapa) => atlas?.[nombre] ?? VACIA;
  const provinciasActivas = useMemo(() => (atlas?.regiones.features ?? []).filter(f => seleccion === null || f.properties?.region_id === seleccion), [atlas, seleccion]);
  const capitalesActivas = useMemo(() => (atlas?.capitales.features ?? []).filter(f => seleccion === null || f.properties?.region_id === seleccion), [atlas, seleccion]);
  const regionFeatureCollection: Coleccion = useMemo(() => ({ type: "FeatureCollection", features: atlas?.regiones.features ?? [] }), [atlas]);
  const elegir = useCallback((id: Identificador | null) => { setSeleccion(id); if (id === seleccion) setReiniciar(n => n + 1); }, [seleccion]);
  const exportar = (n: DatosCapa) => { const base = import.meta.env.BASE_URL; window.open(`${base}atlas/${n}.geojson`, "_blank", "noopener,noreferrer"); };

  return (
    <div className="ap-page">
      <Header />
      <main className="ap-main">
        <div className="ap-kicker">ESTADO PANIENSE <span>/</span> CARTOGRAFÍA NACIONAL <span>/</span> v2.0</div>
        <header className="ap-header">
          <div><h1>Atlas territorial</h1><p>Mapa político, geográfico y urbano · Cartografía basada en límites reales · Nombres panienses</p></div>
          <div className="ap-header-actions"><button onClick={() => exportar("regiones")} className="ap-export">↓ Descargar GeoJSON</button></div>
        </header>
        <nav className="ap-modes" aria-label="Tipo de mapa">
          {(["politico", "geografico", "gta"] as Modo[]).map((m) => (
            <button key={m} aria-pressed={modo === m} className={modo === m ? "activo" : ""} onClick={() => setModo(m)}>
              {m === "politico" ? "◇ Político" : m === "geografico" ? "▲ Geográfico" : "◉ GTA V mode"}
            </button>
          ))}
          <span className="ap-status">{error ? "Error de cartografía" : atlas ? "Geometrías verificadas · GeoJSON" : "Cargando datos..."}</span>
        </nav>

        <section className="ap-layout">
          <aside className="ap-side">
            <div className="ap-side-top"><span>REGIONES Y TERRITORIOS</span><b>7 + negociación</b></div>
            <button className={!seleccion ? "ap-region selected ap-home" : "ap-region ap-home"} onClick={() => elegir(null)}>◎ Vista general de Andorra <span>↗</span></button>
            <div className="ap-lista-regiones">
              {REGIONES.map(r => (
                <button key={r.id} className={`ap-region ${seleccion === r.id ? "selected" : ""}`} onClick={() => elegir(r.id)} aria-pressed={seleccion === r.id}>
                  <span className="ap-region-color" style={{ background: r.color }} />
                  <span className="ap-region-text"><strong>{r.nombre}</strong><small>{r.id === "sahara" ? "Territorio en negociaciones" : r.capital ?? "Ultramar · sin capital definida"}</small></span>
                  <span className="ap-chevron">›</span>
                </button>
              ))}
            </div>
            <div className="ap-filters"><h2>CAPAS DE INFORMACIÓN</h2>
              {CAPA_INFO.map(c => (
                <label key={c.id} className="ap-layer">
                  <input type="checkbox" checked={capas[c.id]} onChange={(e) => setCapas(actual => ({ ...actual, [c.id]: e.target.checked }))} />
                  <span className="ap-layer-symbol">{c.emoji}</span><span>{c.label}</span>
                  {atlas && c.id !== "regiones" && c.id !== "especiales" && c.id !== "capitales" && <small>{vacio(c.id).features.length || "—"}</small>}
                </label>
              ))}
              <p className="ap-sidebar-note">Las infraestructuras sin datos aparecen desactivadas. Se incorporarán trazados y ubicaciones reales o proyectos documentados, nunca líneas ficticias como si fueran carreteras construidas.</p>
            </div>
          </aside>

          <div className="ap-mapcol">
            <div className={`ap-map-shell ap-${modo}`}>
              <MapContainer center={PANE_ORIGEN} zoom={10} zoomControl={false} className="ap-map" preferCanvas>
                <TileLayer key={modo} url={BG[modo].url} attribution={BG[modo].attribution} maxZoom={BG[modo].maxZoom} />
                <Desplazamiento id={seleccion} atlas={atlas} reiniciar={reiniciar} />
                {atlas && capas.regiones && <GeoJSON key={`${modo}-${seleccion}`} data={regionFeatureCollection}
                  style={f => geoEstilo(f, seleccion, modo, capas.regiones)}
                  onEachFeature={(f, layer) => {
                    const id = f.properties?.region_id as Identificador;
                    layer.on({ click: () => elegir(id), mouseover: (evt) => (evt.target as L.Path).setStyle({ weight: 3.5, fillOpacity: 0.64 }), mouseout: (evt) => (evt.target as L.Path).setStyle(geoEstilo(f, seleccion, modo, true)) });
                    layer.bindTooltip(POR_ID[id]?.nombre ?? "Región", { sticky: true, className: "ap-poly-tooltip" });
                  }}
                />}
                {atlas && capas.capitales && capitalesActivas.map(f => {
                  if (f.geometry.type !== "Point") return null;
                  const p = f.properties ?? {}; const [lon, lat] = (f.geometry as Point).coordinates;
                  return <Marker key={p.id} position={[lat, lon]} icon={iconoPunto("capital", p.region_id)}>
                    <Tooltip className="ap-capital-tooltip" permanent direction="top" offset={[0, -20]}>{p.nombre}</Tooltip>
                    <Popup>{capitalPopup(f)}</Popup>
                  </Marker>;
                })}
                {atlas && capas.especiales && atlas.especiales.features.filter(f => {
                  if (f.properties?.id === "medes-referencia" && (seleccion !== "sin-gluten" || capas.capitales)) return false;
                  return (seleccion === null && f.properties?.id !== "medes-referencia") || f.properties?.region_id === seleccion;
                }).map(f => {
                  if (f.geometry.type !== "Point") return null;
                  const [lon, lat] = f.geometry.coordinates;
                  return <Marker key={f.properties?.id} position={[lat, lon]} icon={iconoPunto(f.properties?.categoria ?? "especial", f.properties?.region_id)}>
                    <Popup><strong>{f.properties?.nombre}</strong><p>{f.properties?.nota ?? "Área pendiente de delimitar"}</p></Popup>
                  </Marker>;
                })}
                {atlas && (["carreteras", "ferrocarriles"] as DatosCapa[]).filter(k => capas[k] && vacio(k).features.length).map(k => (
                  <GeoJSON key={k} data={vacio(k)} style={(f) => ({ color: f?.properties?.estado === "propuesto" ? "#EBAA5C" : k === "ferrocarriles" ? "#D3E8EA" : modo === "gta" ? "#F4F8FA" : "#EBCB74", weight: k === "ferrocarriles" ? 2.5 : 3.5, dashArray: f?.properties?.estado === "propuesto" ? "7 6" : undefined })}
                    onEachFeature={(f, layer) => layer.bindPopup(`<strong>${String(f.properties?.nombre ?? "Trazado").replaceAll("<", "&lt;")}</strong><p>${String(f.properties?.estado ?? "sin estado").replaceAll("<", "&lt;")}</p>`)} />
                ))}
                {atlas && (["aeropuertos", "estaciones", "puertos", "otros"] as DatosCapa[]).filter(k => capas[k]).flatMap(k => atlas[k].features.map(f => {
                  if (f.geometry.type !== "Point") return null;
                  const [lon, lat] = f.geometry.coordinates;
                  return <Marker key={`${k}-${f.properties?.id}`} position={[lat, lon]} icon={iconoPunto(k === "aeropuertos" ? "aeropuerto" : k === "estaciones" ? "estacion" : k === "puertos" ? "puerto" : "otro", f.properties?.region_id)}>
                    <Popup><div className="ap-popup"><strong>{f.properties?.nombre}</strong><p>{f.properties?.estado ?? "Sin clasificar"}</p></div></Popup>
                  </Marker>;
                }))}
                <ZoomControl position="bottomright" />
                <ScaleControl position="bottomleft" metric imperial={false} />
              </MapContainer>
              <div className="ap-map-legend"><span className="ap-indicator" /> {modo === "politico" ? "MAPA POLÍTICO" : modo === "geografico" ? "MAPA GEOGRÁFICO" : "MAPA ESTILO GTA V"}</div>
              {!atlas && !error && <div className="ap-loading">Cargando cartografía georreferenciada…</div>}
              {error && <div className="ap-loading ap-error">Error: {error}<p>Comprueba que public/atlas/ contiene los archivos y vuelve a cargar la página.</p></div>}
            </div>

            <div className="ap-footpanels">
              <div className="ap-detail">
                <button className="ap-detail-title" onClick={() => setFichaAbierta(x => !x)} aria-expanded={fichaAbierta}>
                  <span>{activo ? `FICHA TERRITORIAL · ${activo.nombre.toUpperCase()}` : "ESTADO PANIENSE · INFORMACIÓN TERRITORIAL"}</span><span>{fichaAbierta ? "−" : "+"}</span>
                </button>
                {fichaAbierta && <div className="ap-detail-body">
                  {activo ? <>
                    <h3>{activo.nombre}</h3>
                    <p>{activo.descripcion}</p>
                    <div className="ap-detail-meta"><div><small>CAPITAL PANIENSE</small><strong>{activo.capital ?? "Pendiente"}</strong></div><div><small>BASE GEOGRÁFICA</small><strong>{activo.situacion}</strong></div></div>
                    <p className="ap-caveat">La base procede de geometrías administrativas reales donde están disponibles. La adscripción al Estado Paniense es ficción cartográfica; los límites políticos están en revisión.</p>
                  </> : <><h3>El territorio, con precisión</h3><p>Selecciona una región para consultar su capital y delimitación. Las capitales se representan exclusivamente por sus nombres panienses.</p><p className="ap-caveat">Sin Glúten y Atlántida aún no tienen polígonos definitivos; el Sáhara Occidental se mantiene separado, en negociaciones.</p></>}
                </div>}
              </div>
              <div className="ap-sources"><span><b>{atlas ? atlas.regiones.features.length : "—"}</b><small>unidades geográficas</small></span><span><b>{atlas ? atlas.capitales.features.length : "—"}</b><small>capitales panienses</small></span><span><b>{provinciasActivas.length}</b><small>piezas en selección</small></span></div>
            </div>
          </div>
        </section>
        <footer className="ap-carto-footer">Fuentes de límites: geoBoundaries, IGN Admin Express · Fondo: OpenStreetMap / CARTO / Esri · Sistema WGS84 · Adscripciones políticas ficticias · v2.0</footer>
      </main>
      <Footer />
    </div>
  );
}
