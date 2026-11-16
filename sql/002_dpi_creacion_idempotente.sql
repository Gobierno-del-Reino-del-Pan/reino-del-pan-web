begin;

create schema dpi_privado;
revoke all on schema dpi_privado from public, anon, authenticated;
grant usage on schema dpi_privado to service_role;

create table dpi_privado.solicitudes (
    clave uuid primary key,
    dpi_id bigint not null references public.dpis(id) on delete cascade
);
revoke all on dpi_privado.solicitudes from public, anon, authenticated;
grant select, insert on dpi_privado.solicitudes to service_role;

create index dpis_ip_created_at_idx on public.dpis (ip_address, created_at desc);

create function public.emitir_dpi_web(
    p_clave uuid,
    p_nombre text,
    p_apellidos text,
    p_genero text,
    p_fecha_nac date,
    p_region text,
    p_ip text,
    p_issued_at text,
    p_valid_until text,
    p_public_url text,
    p_rate_limited boolean
) returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
    documento public.dpis%rowtype;
    numero bigint;
    codigo text;
    estado text;
begin
    -- La clave aleatoria identifica un intento incluso si cambia la IP.
    if p_clave is not null then
        perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_clave::text, 0));

        select d.* into documento
        from dpi_privado.solicitudes s
        join public.dpis d on d.id = s.dpi_id
        where s.clave = p_clave;

        if found then
            if (documento.nombre, documento.apellidos, documento.genero, documento.fecha_nac, documento.region)
                is distinct from (p_nombre, p_apellidos, p_genero, p_fecha_nac, p_region) then
                return jsonb_build_object('estado', 'key_conflict');
            end if;
            estado := 'replayed';
        end if;
    end if;

    if estado is null then
        -- Dos claves diferentes (por ejemplo, dos pestañas) pueden enviar el mismo formulario.
        -- Esta segunda familia de bloqueos ocupa un espacio distinto al de las claves UUID.
        perform pg_catalog.pg_advisory_xact_lock(
            591207,
            pg_catalog.hashtext(jsonb_build_array(p_ip, p_nombre, p_apellidos, p_genero, p_fecha_nac, p_region)::text)
        );

        if exists (
            select 1
            from public.dpis d
            where d.ip_address = p_ip
              and d.created_at >= pg_catalog.clock_timestamp() - interval '1 minute'
              and (d.nombre, d.apellidos, d.genero, d.fecha_nac, d.region) =
                  (p_nombre, p_apellidos, p_genero, p_fecha_nac, p_region)
        ) then
            return jsonb_build_object('estado', 'duplicate');
        end if;

        if p_rate_limited then
            return jsonb_build_object('estado', 'rate_limited');
        end if;

        -- Usa la misma secuencia que increment_dpi_counter(), con esquema explícito.
        numero := pg_catalog.nextval('public.dpi_counter_seq'::regclass);
        codigo := lpad(numero::text, greatest(6, length(numero::text)), '0')
            || substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ', (numero % 26)::integer + 1, 1);

        insert into public.dpis (
            dpi_number, nombre, apellidos, genero, fecha_nac, region,
            issued_at, valid_until, ip_address, qr_url, created_at
        ) values (
            'DPI - ' || codigo, p_nombre, p_apellidos, p_genero, p_fecha_nac, p_region,
            p_issued_at, p_valid_until, p_ip, rtrim(p_public_url, '/') || '/api/dpi/verify/' || codigo,
            pg_catalog.clock_timestamp()
        ) returning * into documento;

        if p_clave is not null then
            insert into dpi_privado.solicitudes (clave, dpi_id) values (p_clave, documento.id);
        end if;

        estado := 'issued';
    end if;

    return jsonb_build_object(
        'estado', estado,
        'dpiNumber', documento.dpi_number,
        'issuedAt', documento.issued_at,
        'validUntil', documento.valid_until,
        'qrUrl', documento.qr_url
    );
end;
$$;

revoke all on function public.emitir_dpi_web(uuid, text, text, text, date, text, text, text, text, text, boolean)
    from public, anon, authenticated;
grant execute on function public.emitir_dpi_web(uuid, text, text, text, date, text, text, text, text, text, boolean)
    to service_role;

notify pgrst, 'reload schema';

commit;
