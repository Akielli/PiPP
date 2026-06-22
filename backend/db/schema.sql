-- =============================================================================
-- PiPP — Esquema de base de datos (pipp_dev)
-- Aplicar con: psql -U pipp -d pipp_dev -f backend/db/schema.sql
-- =============================================================================

-- Geografía: colonias/unidades territoriales de la CDMX
CREATE TABLE IF NOT EXISTS unidad_territorial (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre      TEXT NOT NULL,
    alcaldia    TEXT NOT NULL,
    lat         NUMERIC(9, 6) NOT NULL,
    lng         NUMERIC(9, 6) NOT NULL
);

-- Empresas contratistas (datos ficticios en seed)
CREATE TABLE IF NOT EXISTS empresa (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    razon_social        TEXT        NOT NULL,
    rfc                 VARCHAR(13) NOT NULL UNIQUE,
    fecha_constitucion  DATE        NOT NULL,
    domicilio           TEXT        NOT NULL
);

-- Proyectos del presupuesto participativo
CREATE TABLE IF NOT EXISTS proyecto (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ut_id           UUID           NOT NULL REFERENCES unidad_territorial(id),
    nombre          TEXT           NOT NULL,
    anio            SMALLINT       NOT NULL,
    monto_asignado  NUMERIC(14, 2) NOT NULL,
    lat             NUMERIC(9, 6)  NOT NULL,
    lng             NUMERIC(9, 6)  NOT NULL
);

-- Beneficiarios reales (personas físicas detrás de la empresa)
CREATE TABLE IF NOT EXISTS beneficiario (
    id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id  UUID           NOT NULL REFERENCES empresa(id),
    nombre      TEXT           NOT NULL,
    pct_control NUMERIC(5, 2)  NOT NULL
        CHECK (pct_control > 0 AND pct_control <= 100)
);

-- Contratos: relaciona proyecto con empresa
CREATE TABLE IF NOT EXISTS contrato (
    id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID           NOT NULL REFERENCES proyecto(id),
    empresa_id  UUID           NOT NULL REFERENCES empresa(id),
    modalidad   TEXT           NOT NULL
        CHECK (modalidad IN ('adjudicacion_directa', 'invitacion_restringida', 'licitacion')),
    monto       NUMERIC(14, 2) NOT NULL,
    avance_pct  SMALLINT       NOT NULL CHECK (avance_pct >= 0 AND avance_pct <= 100),
    nivel_riesgo TEXT          NOT NULL
        CHECK (nivel_riesgo IN ('bajo', 'medio', 'alto')),
    -- Fechas de ejecución (planeadas vs. reales)
    fecha_contratacion_plan  DATE,
    fecha_contratacion_real  DATE,
    fecha_inicio_plan        DATE,
    fecha_inicio_real        DATE,
    fecha_termino_plan       DATE,
    fecha_termino_real       DATE
);

-- Migración: añadir columnas de fechas si la tabla ya existe sin ellas
ALTER TABLE contrato ADD COLUMN IF NOT EXISTS fecha_contratacion_plan DATE;
ALTER TABLE contrato ADD COLUMN IF NOT EXISTS fecha_contratacion_real DATE;
ALTER TABLE contrato ADD COLUMN IF NOT EXISTS fecha_inicio_plan       DATE;
ALTER TABLE contrato ADD COLUMN IF NOT EXISTS fecha_inicio_real       DATE;
ALTER TABLE contrato ADD COLUMN IF NOT EXISTS fecha_termino_plan      DATE;
ALTER TABLE contrato ADD COLUMN IF NOT EXISTS fecha_termino_real      DATE;

-- =============================================================================
-- Portal de carga: autenticación y roles
-- =============================================================================

-- Usuarios del portal de carga (NO son ciudadanos; el tablero público no usa login)
CREATE TABLE IF NOT EXISTS usuario (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,                 -- bcrypt; nunca texto plano
    rol           TEXT NOT NULL
        CHECK (rol IN ('iecm', 'alcaldia')),
    alcaldia      TEXT                            -- NULL para iecm; nombre para alcaldia
);

-- Sesiones activas: el token (UUID opaco) viaja en una cookie HttpOnly
CREATE TABLE IF NOT EXISTS sesion (
    token       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id  UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    creada_en   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_proyecto_ut        ON proyecto(ut_id);
CREATE INDEX IF NOT EXISTS idx_contrato_proyecto  ON contrato(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_contrato_empresa   ON contrato(empresa_id);
CREATE INDEX IF NOT EXISTS idx_beneficiario_empresa ON beneficiario(empresa_id);
CREATE INDEX IF NOT EXISTS idx_sesion_usuario     ON sesion(usuario_id);
