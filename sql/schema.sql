-- =============================================
-- AllArch — Schema de Base de Datos
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- =============================================

-- 1. TABLA DE USUARIOS (todos los roles)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  nombre TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  tipo_usuario TEXT NOT NULL CHECK (tipo_usuario IN ('admin', 'arqueologo', 'publico')),
  telefono TEXT,
  activo BOOLEAN DEFAULT true,
  aprobado BOOLEAN DEFAULT false,
  institucion TEXT,
  especializacion TEXT,
  anios_experiencia INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABLA DE HALLAZGOS
CREATE TABLE IF NOT EXISTS hallazgos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id) NOT NULL,
  descripcion TEXT NOT NULL,
  contexto TEXT CHECK (contexto IN ('excavacion', 'hallazgo_casual', 'coleccion_familiar', 'otro')),
  latitud DOUBLE PRECISION,
  longitud DOUBLE PRECISION,
  direccion_manual TEXT,
  fecha_hallazgo DATE,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_revision', 'evaluado')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABLA DE FOTOS DE HALLAZGOS
CREATE TABLE IF NOT EXISTS hallazgo_fotos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hallazgo_id UUID REFERENCES hallazgos(id) ON DELETE CASCADE NOT NULL,
  foto_url TEXT NOT NULL,
  orden INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TABLA DE EVALUACIONES
CREATE TABLE IF NOT EXISTS evaluaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hallazgo_id UUID REFERENCES hallazgos(id) NOT NULL,
  arqueologo_id UUID REFERENCES usuarios(id) NOT NULL,
  valor_arqueologico INTEGER NOT NULL CHECK (valor_arqueologico BETWEEN 1 AND 10),
  veredicto TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- STORAGE: Crear bucket para fotos
-- Ir a: Storage > New Bucket
-- Nombre: hallazgo-fotos
-- Public: SI (activar)
-- =============================================

-- =============================================
-- DATOS DE PRUEBA (para demo FLL)
-- =============================================

-- Admin (equipo de robótica)
INSERT INTO usuarios (email, password, nombre, apellidos, tipo_usuario, activo, aprobado)
VALUES ('admin@allarch.demo', 'demo2026', 'Equipo', 'AllArch', 'admin', true, true);

-- Arqueólogo verificado 1
INSERT INTO usuarios (email, password, nombre, apellidos, tipo_usuario, activo, aprobado, institucion, especializacion, anios_experiencia, telefono)
VALUES ('roberto@allarch.demo', 'demo2026', 'Roberto', 'Martínez', 'arqueologo', true, true, 'Universidad Nacional de Colombia', 'Arqueología precolombina y cerámica', 12, '+57 310 555 0001');

-- Arqueólogo verificado 2
INSERT INTO usuarios (email, password, nombre, apellidos, tipo_usuario, activo, aprobado, institucion, especializacion, anios_experiencia, telefono)
VALUES ('ana@allarch.demo', 'demo2026', 'Ana', 'Gutiérrez', 'arqueologo', true, true, 'Universidad de los Andes', 'Patrimonio cultural y restauración', 8, '+57 310 555 0002');

-- Arqueólogo pendiente de aprobación (para demo del admin)
INSERT INTO usuarios (email, password, nombre, apellidos, tipo_usuario, activo, aprobado, institucion, especializacion, anios_experiencia, telefono)
VALUES ('carlos@allarch.demo', 'demo2026', 'Carlos', 'Ramírez', 'arqueologo', true, false, 'Universidad del Valle', 'Lítica y herramientas prehispánicas', 5, '+57 310 555 0003');

-- Usuario público 1
INSERT INTO usuarios (email, password, nombre, apellidos, tipo_usuario, activo, aprobado, telefono)
VALUES ('maria@allarch.demo', 'demo2026', 'María', 'García', 'publico', true, true, '+57 300 123 4567');

-- Usuario público 2
INSERT INTO usuarios (email, password, nombre, apellidos, tipo_usuario, activo, aprobado, telefono)
VALUES ('juan@allarch.demo', 'demo2026', 'Juan', 'López', 'publico', true, true, '+57 300 987 6543');
