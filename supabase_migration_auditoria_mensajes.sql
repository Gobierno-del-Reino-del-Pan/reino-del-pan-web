-- Auditoría persistente para ModAndSecurityCog.py
-- Ejecutar en Supabase antes de desplegar el cog.

create table if not exists casos_auditoria (
    numero_caso integer primary key,
    tipo text not null,
    usuario_id bigint,
    moderador_id bigint,
    motivo text,
    detalles text,
    creado_en timestamptz not null default now()
);

create index if not exists casos_auditoria_usuario_idx
    on casos_auditoria (usuario_id, creado_en desc);

create index if not exists casos_auditoria_tipo_idx
    on casos_auditoria (tipo, creado_en desc);

-- El cog guarda el contenido truncado a 500 caracteres en detalles y conserva
-- el contenido completo en el embed/transcript enviado al canal de auditoría.
-- Si se desea una retención independiente del canal de Discord, puede añadirse
-- posteriormente una tabla de archivos o ampliar detalles a jsonb.

alter table casos_auditoria enable row level security;

-- No se crean políticas públicas deliberadamente. Las inserciones y consultas
-- las realiza el cliente de confianza del bot mediante la clave de servidor.
