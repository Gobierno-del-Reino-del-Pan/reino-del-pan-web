import { useEffect, useMemo, useState } from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";

import { supabase } from "../../lib/supabaseClient";

import { useMasaAuth } from "../../../context/MasaAuthContext";

import MasaLogin from "../MasaLogin";

import AltaPersonaModal from "../../components/padron/AltaPersonaModal";
import NuevoExpedienteModal from "../../components/padron/NuevoExpedienteModal";
import PersonaDetalle from "../../components/padron/PersonaDetalle";

import {
  ESTADO_BADGE,
  EstadoPadron,
  Municipio,
  NivelEstudios,
  PersonaCompleta,
  REGIMEN_LABEL,
  RegimenDocumento,
  TipoExpediente,
  Vencimiento,
} from "../../types/padron";

// ────────────────────────────────────────────────────────────────
// ePOB — Padrón Oficial de Panienses
// Panel de gestión del Reino del Pan (requiere sesión M@SA)
// ────────────────────────────────────────────────────────────────

type FiltroEstado = "TODOS" | EstadoPadron;
type FiltroRegimen = "TODOS" | RegimenDocumento;

function formatearFecha(fecha: string | null) {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function PadronDashboard() {
  const { user, signOut } = useMasaAuth();

  const [personas, setPersonas] = useState<PersonaCompleta[]>([]);
  const [vencimientos, setVencimientos] = useState<Vencimiento[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [nivelesEstudios, setNivelesEstudios] = useState<NivelEstudios[]>([]);
  const [tiposExpediente, setTiposExpediente] = useState<TipoExpediente[]>([]);

  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("TODOS");
  const [filtroRegimen, setFiltroRegimen] = useState<FiltroRegimen>("TODOS");
  const [vistaVencimientos, setVistaVencimientos] = useState(false);

  const [personaSeleccionada, setPersonaSeleccionada] = useState<PersonaCompleta | null>(null);
  const [modalAltaAbierto, setModalAltaAbierto] = useState(false);
  const [modalExpedienteAbierto, setModalExpedienteAbierto] = useState(false);
  const [personaParaExpediente, setPersonaParaExpediente] = useState<PersonaCompleta | null>(null);

  const usuarioActual = user?.email || "SISTEMA_MASA";

  async function cargarTodo() {
    setLoading(true);

    try {
      const [
        personasResult,
        vencimientosResult,
        municipiosResult,
        nivelesResult,
        tiposResult,
      ] = await Promise.all([
        supabase.from("padron_personas_completo").select("*").order("apellidos"),
        supabase.from("padron_vencimientos").select("*").order("fecha_proxima_actuacion"),
        supabase.from("padron_municipios").select("*").eq("activo", true).order("nombre"),
        supabase.from("padron_niveles_estudios").select("*").eq("activo", true),
        supabase.from("padron_tipos_expediente").select("*").eq("activo", true),
      ]);

      console.log("=== DIAGNÓSTICO ePOB ===");
      console.log("Personas:", personasResult.data);
      console.log("Error personas:", personasResult.error);
      console.log("Vencimientos:", vencimientosResult.data);
      console.log("Error vencimientos:", vencimientosResult.error);
      console.log("Municipios:", municipiosResult.data);
      console.log("Error municipios:", municipiosResult.error);
      console.log("Niveles estudios:", nivelesResult.data);
      console.log("Error niveles:", nivelesResult.error);
      console.log("Tipos expediente:", tiposResult.data);
      console.log("Error tipos:", tiposResult.error);
      console.log("========================");

      setPersonas((personasResult.data as PersonaCompleta[]) || []);
      setVencimientos((vencimientosResult.data as Vencimiento[]) || []);
      setMunicipios((municipiosResult.data as Municipio[]) || []);
      setNivelesEstudios((nivelesResult.data as NivelEstudios[]) || []);
      setTiposExpediente((tiposResult.data as TipoExpediente[]) || []);
    } catch (error) {
      console.error("Error general cargando ePOB:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarTodo();
  }, []);

  const personasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return personas.filter((p: PersonaCompleta) => {
      if (filtroEstado !== "TODOS" && p.estado_padron !== filtroEstado) return false;
      if (filtroRegimen !== "TODOS" && p.regimen_documento !== filtroRegimen) return false;

      if (termino) {
        const texto = `${p.nombre ?? ""} ${p.apellidos ?? ""} ${p.dpi ?? ""} ${p.municipio ?? ""}`.toLowerCase();
        if (!texto.includes(termino)) return false;
      }

      return true;
    });
  }, [personas, busqueda, filtroEstado, filtroRegimen]);

  const vencimientosCriticos = vencimientos.filter(
    (v: Vencimiento) => v.vencido
  );

  const totalActivos = personas.filter(
    (p: PersonaCompleta) => p.estado_padron === "ACTIVO"
  ).length;

  const abrirNuevoExpediente = (persona: PersonaCompleta) => {
    setPersonaParaExpediente(persona);
    setModalExpedienteAbierto(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      {/* ── CABECERA DEL MÓDULO ── */}
      <section className="w-full bg-[#07080c] border-b border-white/5 px-4 sm:px-6 py-12">
        <div className="container mx-auto max-w-7xl flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-[0.35em] text-accent font-bold bg-black/40 border border-white/10 px-4 py-1.5 rounded-full inline-block">
              Sistema M@SA · Gobierno del Reino del Pan
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl font-black text-white tracking-tight">
              ePOB — Padrón Oficial de Panienses
            </h1>
            <p className="mt-2 text-sm text-white/50 max-w-xl">
              Registro y mantenimiento de la situación padronal de quienes forman parte del
              Reino del Pan, sean panienses de nacimiento o extranjeros residentes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40 font-mono hidden sm:inline">{usuarioActual}</span>
            <button
              onClick={signOut}
              className="rounded-full border border-white/10 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-white/60 hover:text-white hover:border-white/30 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="container mx-auto max-w-7xl mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0e1017] border border-white/5 rounded-2xl p-5">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold block mb-1">
              Inscripciones activas
            </span>
            <span className="text-2xl font-black text-white">{totalActivos}</span>
          </div>
          <div className="bg-[#0e1017] border border-white/5 rounded-2xl p-5">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold block mb-1">
              Total en el padrón
            </span>
            <span className="text-2xl font-black text-white">{personas.length}</span>
          </div>
          <button
            onClick={() => setVistaVencimientos(!vistaVencimientos)}
            className={`text-left rounded-2xl p-5 border transition-colors ${vencimientosCriticos.length > 0
              ? "bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/15"
              : "bg-[#0e1017] border-white/5 hover:border-white/20"
              }`}
          >
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold block mb-1">
              Vencidos (requieren gestión)
            </span>
            <span
              className={`text-2xl font-black ${vencimientosCriticos.length > 0 ? "text-rose-400" : "text-white"
                }`}
            >
              {vencimientosCriticos.length}
            </span>
          </button>
          <button
            onClick={() => setModalAltaAbierto(true)}
            className="text-left rounded-2xl p-5 border border-accent/40 bg-accent/10 hover:bg-accent/15 transition-colors flex flex-col justify-between"
          >
            <span className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold block mb-1">
              Nueva inscripción
            </span>
            <span className="text-sm font-bold text-white">+ Dar de alta</span>
          </button>
        </div>
      </section>

      {/* ── PANEL DE VENCIMIENTOS (opcional) ── */}
      {vistaVencimientos && (
        <section className="w-full bg-[#0b0c10] border-b border-white/5 px-4 sm:px-6 py-10">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-lg font-black text-white mb-6">Próximas actuaciones y vencimientos</h2>
            {vencimientos.length === 0 ? (
              <p className="text-sm text-white/40">No hay renovaciones ni confirmaciones pendientes.</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-[10px] uppercase tracking-[0.2em] text-white/40">
                    <tr>
                      <th className="px-5 py-3 font-bold">Persona</th>
                      <th className="px-5 py-3 font-bold">Régimen</th>
                      <th className="px-5 py-3 font-bold">Próxima actuación</th>
                      <th className="px-5 py-3 font-bold">Expediente requerido</th>
                      <th className="px-5 py-3 font-bold">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {vencimientos
                      .filter((v) => v.fecha_proxima_actuacion)
                      .map((v) => (
                        <tr key={v.id} className={v.vencido ? "bg-rose-500/5" : ""}>
                          <td className="px-5 py-3 text-white font-semibold">
                            {v.nombre} {v.apellidos}
                          </td>
                          <td className="px-5 py-3 text-white/60">{REGIMEN_LABEL[v.regimen_documento]}</td>
                          <td className="px-5 py-3 text-white/60 font-mono">
                            {formatearFecha(v.fecha_proxima_actuacion)}
                          </td>
                          <td className="px-5 py-3 text-white/60 font-mono">{v.expediente_requerido}</td>
                          <td className="px-5 py-3">
                            <span
                              className={`text-[10px] font-bold px-3 py-1 rounded-full border ${v.vencido
                                ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                                : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                }`}
                            >
                              {v.vencido ? "Vencido" : "Próximo"}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── LISTADO Y BÚSQUEDA ── */}
      <section className="w-full bg-neutral-950 flex-1 px-4 sm:px-6 py-12">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, apellidos, DPI o municipio…"
              className="flex-1 rounded-2xl bg-[#0e1017] border border-white/10 px-5 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-accent/60"
            />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as FiltroEstado)}
              className="rounded-2xl bg-[#0e1017] border border-white/10 px-5 py-3 text-sm text-white outline-none focus:border-accent/60"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="ACTIVO">Activo</option>
              <option value="BAJA">Baja</option>
              <option value="CADUCADO">Caducado</option>
              <option value="SUSPENDIDO">Suspendido</option>
            </select>
            <select
              value={filtroRegimen}
              onChange={(e) => setFiltroRegimen(e.target.value as FiltroRegimen)}
              className="rounded-2xl bg-[#0e1017] border border-white/10 px-5 py-3 text-sm text-white outline-none focus:border-accent/60"
            >
              <option value="TODOS">Todos los regímenes</option>
              <option value="PANIENSE">Paniense</option>
              <option value="EXTRANJERO_CORTA">Extranjero · corta (TPIT)</option>
              <option value="EXTRANJERO_LARGA">Extranjero · larga (TPIP)</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse h-32 rounded-2xl bg-[#0e1017] border border-white/5" />
              ))}
            </div>
          ) : personasFiltradas.length === 0 ? (
            <p className="text-sm text-white/40">No se han encontrado inscripciones con esos criterios.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {personasFiltradas.map((p) => {
                const badge = ESTADO_BADGE[p.estado_padron];
                return (
                  <button
                    key={p.id}
                    onClick={() => setPersonaSeleccionada(p)}
                    className="text-left bg-[#0e1017] border border-white/5 hover:border-accent/40 rounded-2xl p-5 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-accent transition-colors">
                          {p.nombre} {p.apellidos}
                        </h3>
                        <p className="text-[11px] font-mono text-white/40 mt-0.5">{p.dpi}</p>
                      </div>
                      <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full border ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-[11px] text-white/40">
                      <span>{p.municipio}</span>
                      <span>{REGIMEN_LABEL[p.regimen_documento]}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />

      <AltaPersonaModal
        open={modalAltaAbierto}
        onClose={() => setModalAltaAbierto(false)}
        onCreated={cargarTodo}
        municipios={municipios}
        nivelesEstudios={nivelesEstudios}
        usuarioActual={usuarioActual}
      />

      <NuevoExpedienteModal
        open={modalExpedienteAbierto}
        onClose={() => setModalExpedienteAbierto(false)}
        onCreated={cargarTodo}
        persona={personaParaExpediente}
        tiposExpediente={tiposExpediente}
        usuarioActual={usuarioActual}
      />

      <PersonaDetalle
        persona={personaSeleccionada}
        onClose={() => setPersonaSeleccionada(null)}
        onNuevoExpediente={(persona) => {
          setPersonaSeleccionada(null);
          abrirNuevoExpediente(persona);
        }}
      />
    </div>
  );
}

export default function Padron() {
  const { session, loading } = useMasaAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07080c] flex items-center justify-center">
        <span className="text-white/40 text-xs font-mono uppercase tracking-[0.3em]">
          Cargando ePOB…
        </span>
      </div>
    );
  }

  if (!session) {
    return <MasaLogin />;
  }

  return <PadronDashboard />;
}