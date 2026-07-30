/*
  # Schema inicial para Sistema de Gestión de Novedades

  1. Nuevas Tablas
    - `usuarios`
      - `id` (uuid, primary key)
      - `nombre` (text)
      - `apellido` (text)
      - `dni` (text, unique)
      - `contraseña` (text)
      - `rol` (text, check constraint)
      - `activo` (boolean, default true)
      - `created_at` (timestamp)
    
    - `sectores`
      - `id` (uuid, primary key)
      - `nombre` (text, unique)
      - `descripcion` (text)
      - `activo` (boolean, default true)
      - `created_at` (timestamp)
    
    - `novedades`
      - `id` (uuid, primary key)
      - `turno` (text, check constraint)
      - `titulo` (text)
      - `descripcion` (text)
      - `sector_id` (uuid, foreign key)
      - `prioridad` (text, check constraint)
      - `estado` (text, check constraint, default 'nueva')
      - `created_at` (timestamp)
      - `fecha_lectura` (timestamp)
      - `creado_por_id` (uuid, foreign key)
      - `leido_por_id` (uuid, foreign key)
    
    - `comentarios`
      - `id` (uuid, primary key)
      - `novedad_id` (uuid, foreign key)
      - `texto` (text)
      - `autor_id` (uuid, foreign key)
      - `turno` (text, check constraint)
      - `created_at` (timestamp)

  2. Seguridad
    - Enable RLS en todas las tablas
    - Políticas para usuarios autenticados
    - Políticas específicas para administradores

  3. Datos iniciales
    - Usuario administrador por defecto
    - Sectores básicos del sistema
*/

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  apellido text NOT NULL,
  dni text UNIQUE NOT NULL,
  contraseña text NOT NULL,
  rol text NOT NULL CHECK (rol IN ('administrador', 'usuario')),
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de sectores
CREATE TABLE IF NOT EXISTS sectores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text UNIQUE NOT NULL,
  descripcion text,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de novedades
CREATE TABLE IF NOT EXISTS novedades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  turno text NOT NULL CHECK (turno IN ('mañana', 'noche')),
  titulo text NOT NULL,
  descripcion text NOT NULL,
  sector_id uuid REFERENCES sectores(id) ON DELETE RESTRICT,
  prioridad text NOT NULL CHECK (prioridad IN ('baja', 'media', 'alta', 'critica')),
  estado text DEFAULT 'nueva' CHECK (estado IN ('nueva', 'leida', 'respondida')),
  created_at timestamptz DEFAULT now(),
  fecha_lectura timestamptz,
  creado_por_id uuid REFERENCES usuarios(id) ON DELETE RESTRICT,
  leido_por_id uuid REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Crear tabla de comentarios
CREATE TABLE IF NOT EXISTS comentarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  novedad_id uuid REFERENCES novedades(id) ON DELETE CASCADE,
  texto text NOT NULL,
  autor_id uuid REFERENCES usuarios(id) ON DELETE RESTRICT,
  turno text NOT NULL CHECK (turno IN ('mañana', 'noche')),
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE sectores ENABLE ROW LEVEL SECURITY;
ALTER TABLE novedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE comentarios ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY "Usuarios pueden ver todos los usuarios activos"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (activo = true);

CREATE POLICY "Solo administradores pueden insertar usuarios"
  ON usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND rol = 'administrador' AND activo = true
    )
  );

CREATE POLICY "Solo administradores pueden actualizar usuarios"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND rol = 'administrador' AND activo = true
    )
  );

-- Políticas para sectores
CREATE POLICY "Todos pueden ver sectores activos"
  ON sectores
  FOR SELECT
  TO authenticated
  USING (activo = true);

CREATE POLICY "Solo administradores pueden gestionar sectores"
  ON sectores
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND rol = 'administrador' AND activo = true
    )
  );

-- Políticas para novedades
CREATE POLICY "Todos pueden ver novedades"
  ON novedades
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Todos pueden crear novedades"
  ON novedades
  FOR INSERT
  TO authenticated
  WITH CHECK (creado_por_id = auth.uid());

CREATE POLICY "Todos pueden actualizar novedades"
  ON novedades
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Solo administradores pueden eliminar novedades"
  ON novedades
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND rol = 'administrador' AND activo = true
    )
  );

-- Políticas para comentarios
CREATE POLICY "Todos pueden ver comentarios"
  ON comentarios
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Todos pueden crear comentarios"
  ON comentarios
  FOR INSERT
  TO authenticated
  WITH CHECK (autor_id = auth.uid());

-- Insertar usuario administrador por defecto
INSERT INTO usuarios (nombre, apellido, dni, contraseña, rol) 
VALUES ('Admin', 'Sistema', '12345678', 'admin123', 'administrador')
ON CONFLICT (dni) DO NOTHING;

-- Insertar sectores por defecto
INSERT INTO sectores (nombre, descripcion) VALUES
  ('Operacional', 'Novedades relacionadas con operaciones diarias'),
  ('Mantenimiento', 'Novedades sobre mantenimiento de equipos e instalaciones'),
  ('Seguridad', 'Novedades relacionadas con seguridad y protección'),
  ('Personal', 'Novedades sobre recursos humanos y personal'),
  ('Sistemas', 'Novedades sobre sistemas informáticos y tecnología'),
  ('Calidad', 'Novedades relacionadas con control de calidad'),
  ('Otros', 'Otras novedades no clasificadas')
ON CONFLICT (nombre) DO NOTHING;

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_novedades_turno ON novedades(turno);
CREATE INDEX IF NOT EXISTS idx_novedades_estado ON novedades(estado);
CREATE INDEX IF NOT EXISTS idx_novedades_prioridad ON novedades(prioridad);
CREATE INDEX IF NOT EXISTS idx_novedades_created_at ON novedades(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comentarios_novedad_id ON comentarios(novedad_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_dni ON usuarios(dni);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);