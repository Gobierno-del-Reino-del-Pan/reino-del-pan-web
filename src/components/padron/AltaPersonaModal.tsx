import { FormEvent, useState } from "react";

import { supabase } from "../../lib/supabaseClient";

import type {
    Municipio,
    NivelEstudios,
    RegimenDocumento,
} from "../../types/padron";

interface AltaPersonaModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: () => void | Promise<void>;

    municipios: Municipio[];
    nivelesEstudios: NivelEstudios[];

    usuarioActual: string;
}

export default function AltaPersonaModal({
    open,
    onClose,
    onCreated,
    municipios,
    nivelesEstudios,
    usuarioActual,
}: AltaPersonaModalProps) {
    const [nombre, setNombre] = useState("");
    const [apellidos, setApellidos] = useState("");
    const [dpi, setDpi] = useState("");

    const [municipioId, setMunicipioId] = useState("");
    const [nivelEstudios, setNivelEstudios] = useState("");

    const [regimen, setRegimen] =
        useState<RegimenDocumento>("PANIENSE");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!open) {
        return null;
    }

    function limpiarFormulario() {
        setNombre("");
        setApellidos("");
        setDpi("");
        setMunicipioId("");
        setNivelEstudios("");
        setRegimen("PANIENSE");
        setError(null);
    }

    function cerrar() {
        if (loading) return;

        limpiarFormulario();
        onClose();
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase
                .from("padron_personas")
                .insert({
                    nombre: nombre.trim(),
                    apellidos: apellidos.trim(),
                    dpi: dpi.trim(),

                    municipio_id: municipioId ? Number(municipioId) : null,
                    nivel_estudios: nivelEstudios || null,

                    regimen_documento: regimen,
                    estado_padron: "ACTIVO",

                    creado_por: usuarioActual,
                });

            if (error) {
                throw error;
            }

            await onCreated();

            limpiarFormulario();
            onClose();
        } catch (err) {
            console.error("Error creando inscripción:", err);

            setError(
                err instanceof Error
                    ? err.message
                    : "No se ha podido crear la inscripción."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0e1017] shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
                    <div>
                        <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-accent">
                            ePOB
                        </span>

                        <h2 className="mt-1 text-xl font-black text-white">
                            Nueva inscripción
                        </h2>

                        <p className="mt-1 text-sm text-white/40">
                            Alta de una persona en el Padrón Oficial de Panienses.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={cerrar}
                        className="text-white/40 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-white/50">
                                Nombre
                            </label>

                            <input
                                value={nombre}
                                onChange={(event) => setNombre(event.target.value)}
                                required
                                className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-white/50">
                                Apellidos
                            </label>

                            <input
                                value={apellidos}
                                onChange={(event) => setApellidos(event.target.value)}
                                required
                                className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-white/50">
                                DPI
                            </label>

                            <input
                                value={dpi}
                                onChange={(event) => setDpi(event.target.value)}
                                required
                                className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-sm text-white font-mono outline-none focus:border-accent/60"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-white/50">
                                Régimen documental
                            </label>

                            <select
                                value={regimen}
                                onChange={(event) =>
                                    setRegimen(event.target.value as RegimenDocumento)
                                }
                                className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
                            >
                                <option value="PANIENSE">Paniense</option>

                                <option value="EXTRANJERO_CORTA">
                                    Extranjero · corta (TPIT)
                                </option>

                                <option value="EXTRANJERO_LARGA">
                                    Extranjero · larga (TPIP)
                                </option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-white/50">
                                Municipio
                            </label>

                            <select
                                value={municipioId}
                                onChange={(event) =>
                                    setMunicipioId(event.target.value)
                                }
                                className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
                            >
                                <option value="">
                                    Seleccionar municipio
                                </option>

                                {municipios.map((municipio) => (
                                    <option
                                        key={municipio.id}
                                        value={municipio.id}
                                    >
                                        {municipio.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-white/50">
                                Nivel de estudios
                            </label>

                            <select
                                value={nivelEstudios}
                                onChange={(event) =>
                                    setNivelEstudios(event.target.value)
                                }
                                className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
                            >
                                <option value="">
                                    Seleccionar nivel
                                </option>

                                {nivelesEstudios.map((nivel) => (
                                    <option
                                        key={nivel.codigo}
                                        value={nivel.codigo}
                                    >
                                        {nivel.descripcion}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                            {error}
                        </div>
                    )}

                    <div className="mt-7 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={cerrar}
                            disabled={loading}
                            className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-white/60 hover:text-white"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-accent px-5 py-3 text-sm font-black text-black disabled:opacity-50"
                        >
                            {loading
                                ? "Inscribiendo…"
                                : "Crear inscripción"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}