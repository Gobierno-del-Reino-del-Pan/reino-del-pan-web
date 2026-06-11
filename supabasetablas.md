# Configuración Supabase o yea beby

```sql
-- ─────────────────────────────────────────────────────────────────────────────
-- Tabla principal de DPIs
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dpis (
  id           BIGSERIAL PRIMARY KEY,
  dpi_number   TEXT        NOT NULL UNIQUE,   -- "DPI - 000001A"
  nombre       TEXT        NOT NULL,
  apellidos    TEXT        NOT NULL,
  genero       TEXT        NOT NULL CHECK (genero IN ('Hombre', 'Mujer')),
  fecha_nac    DATE        NOT NULL,
  region       TEXT        NOT NULL,
  issued_at    TEXT        NOT NULL,           -- "DD/MM/YYYY"
  valid_until  TEXT        NOT NULL,           -- "DD/MM/YYYY"
  ip_address   TEXT,                           -- para auditoría, no para rate-limit
  qr_url       TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para búsquedas rápidas por número de DPI (el QR lo usa)
CREATE INDEX IF NOT EXISTS idx_dpis_dpi_number ON dpis (dpi_number);

-- ─────────────────────────────────────────────────────────────────────────────
-- Tabla contador atómico (una sola fila, id = 1)
-- Esto evita números duplicados aunque haya 1000 usuarios al mismo tiempo
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dpi_counter (
  id      INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),  -- solo una fila
  seq     BIGINT NOT NULL DEFAULT 0
);

-- Inserta la fila inicial si no existe
INSERT INTO dpi_counter (id, seq)
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- Función atómica: incrementa el contador y devuelve el nuevo valor
-- Usar FOR UPDATE garantiza que dos peticiones simultáneas nunca obtengan
-- el mismo número, sin necesidad de locks manuales.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_dpi_counter()
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
  new_seq BIGINT;
BEGIN
  UPDATE dpi_counter
  SET    seq = seq + 1
  WHERE  id  = 1
  RETURNING seq INTO new_seq;

  RETURN new_seq;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security (RLS)
-- El servidor usa service_role key, que bypasea RLS.
-- Así que simplemente habilitamos RLS y bloqueamos acceso público directo.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE dpis        ENABLE ROW LEVEL SECURITY;
ALTER TABLE dpi_counter ENABLE ROW LEVEL SECURITY;


-- ─────────────────────────────────────────────────────────────────────────────
-- Tabla de usuarios verificados
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS verificados (
  id                BIGSERIAL PRIMARY KEY,
  discord_id        TEXT        NOT NULL UNIQUE,   -- ID de Discord del usuario
  discord_username  TEXT        NOT NULL,          -- Tag de Discord (e.g., "usuario#0000")
  dpi               TEXT        NOT NULL UNIQUE    -- "DPI - 000001A" (un DPI por usuario, un usuario por DPI)
    REFERENCES dpis (dpi_number) ON UPDATE CASCADE ON DELETE RESTRICT,
  verified_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
 
-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_verificados_discord_id ON verificados (discord_id);
CREATE INDEX IF NOT EXISTS idx_verificados_dpi        ON verificados (dpi);
 
ALTER TABLE verificados ENABLE ROW LEVEL SECURITY;

 
```


---