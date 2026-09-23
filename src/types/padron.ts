export type EstadoPadron =
    | "ACTIVO"
    | "BAJA"
    | "CADUCADO"
    | "SUSPENDIDO";

export type RegimenDocumento =
    | "PANIENSE"
    | "EXTRANJERO_CORTA"
    | "EXTRANJERO_LARGA";


// ─────────────────────────────────────────────────────────────
// MUNICIPIOS
// ─────────────────────────────────────────────────────────────

export interface Municipio {
    id: string | number;
    nombre: string;
    activo: boolean;
}


// ─────────────────────────────────────────────────────────────
// NIVELES DE ESTUDIOS
// ─────────────────────────────────────────────────────────────

export interface NivelEstudios {
    id: string | number;
    nombre: string;
    descripcion?: string | null;
    activo: boolean;
}


// ─────────────────────────────────────────────────────────────
// TIPOS DE EXPEDIENTE
// ─────────────────────────────────────────────────────────────

export interface TipoExpediente {
    id: string | number;

    codigo: string;
    nombre: string;

    descripcion?: string | null;

    activo: boolean;
}


// ─────────────────────────────────────────────────────────────
// EXPEDIENTES
// ─────────────────────────────────────────────────────────────

export interface Expediente {
    id: string | number;

    persona_id: string | number;

    tipo_expediente_id?: string | number | null;

    // Nombre/tipo mostrado por PersonaDetalle
    tipo_expediente: string | null;

    tipo?: string | null;
    tipo_nombre?: string | null;
    tipo_codigo?: string | null;

    numero_expediente?: string | null;

    estado?: string | null;

    // Fechas que usa PersonaDetalle
    fecha_inicio: string | null;
    fecha_resolucion: string | null;

    // Compatibilidad con otros posibles componentes
    fecha_apertura?: string | null;
    fecha_cierre?: string | null;

    descripcion?: string | null;
    observaciones?: string | null;

    creado_por?: string | null;

    created_at?: string | null;
    updated_at?: string | null;
}

// ─────────────────────────────────────────────────────────────
// PERSONA COMPLETA
// Vista: padron_personas_completo
// ─────────────────────────────────────────────────────────────

export interface PersonaCompleta {
    id: string | number;

    // Identificación
    nombre: string;
    apellidos: string;
    dpi: string;

    fecha_nacimiento?: string | null;

    // Padrón
    estado_padron: EstadoPadron;
    regimen_documento: RegimenDocumento;

    // Municipio
    municipio: string;
    municipio_id?: string | number | null;

    // Domicilio
    domicilio?: string | null;
    codigo_postal?: string | null;

    // Estudios
    nivel_estudios_id?: string | number | null;
    nivel_estudios_descripcion?: string | null;

    // Fechas padronales
    fecha_alta_padron: string | null;
    fecha_ultima_variacion: string | null;
    fecha_proxima_actuacion: string | null;
    // Compatibilidad con otros componentes
    fecha_alta?: string | null;
    fecha_baja?: string | null;

    // Otros datos
    direccion?: string | null;
    observaciones?: string | null;

    created_at?: string | null;
    updated_at?: string | null;
}


// ─────────────────────────────────────────────────────────────
// VENCIMIENTOS
// Vista: padron_vencimientos
// ─────────────────────────────────────────────────────────────

export interface Vencimiento {
    id: string | number;

    persona_id?: string | number | null;

    nombre: string;
    apellidos: string;

    regimen_documento: RegimenDocumento;

    fecha_proxima_actuacion: string | null;

    expediente_requerido: string | null;

    vencido: boolean;
}


// ─────────────────────────────────────────────────────────────
// LABELS
// ─────────────────────────────────────────────────────────────

export const REGIMEN_LABEL: Record<RegimenDocumento, string> = {
    PANIENSE: "Paniense",
    EXTRANJERO_CORTA: "Extranjero · corta (TPIT)",
    EXTRANJERO_LARGA: "Extranjero · larga (TPIP)",
};


// ─────────────────────────────────────────────────────────────
// BADGES
// ─────────────────────────────────────────────────────────────

export const ESTADO_BADGE: Record<
    EstadoPadron,
    {
        label: string;
        className: string;
    }
> = {
    ACTIVO: {
        label: "Activo",
        className:
            "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },

    BAJA: {
        label: "Baja",
        className:
            "bg-neutral-500/15 text-neutral-400 border-neutral-500/30",
    },

    CADUCADO: {
        label: "Caducado",
        className:
            "bg-rose-500/15 text-rose-400 border-rose-500/30",
    },

    SUSPENDIDO: {
        label: "Suspendido",
        className:
            "bg-amber-500/15 text-amber-400 border-amber-500/30",
    },
};