/*
  # Extensión del módulo de Tareas - Asignaciones múltiples, Etiquetas y Checklist

  1. Nuevas Tablas
    - `tarjeta_asignados` (Card Assignments)
      - `id` (uuid, primary key)
      - `tarjeta_id` (uuid, referencia a tarjetas)
      - `usuario_id` (uuid, referencia a usuarios)
      - `created_at` (timestamptz)
      - Constraint único para evitar duplicados

    - `etiquetas` (Labels)
      - `id` (uuid, primary key)
      - `tablero_id` (uuid, referencia a tableros)
      - `nombre` (text, nombre de la etiqueta)
      - `color` (text, color hex de la etiqueta)
      - `created_at` (timestamptz)

    - `tarjeta_etiquetas` (Card Labels)
      - `id` (uuid, primary key)
      - `tarjeta_id` (uuid, referencia a tarjetas)
      - `etiqueta_id` (uuid, referencia a etiquetas)
      - `created_at` (timestamptz)
      - Constraint único para evitar duplicados

    - `tarjeta_checklist` (Card Checklist Items)
      - `id` (uuid, primary key)
      - `tarjeta_id` (uuid, referencia a tarjetas)
      - `texto` (text, contenido del item)
      - `completado` (boolean, estado del item)
      - `orden` (integer, orden del item)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS en todas las tablas nuevas
    - Políticas basadas en acceso al tablero/tarjeta correspondiente
*/

-- Crear tabla tarjeta_asignados
CREATE TABLE IF NOT EXISTS tarjeta_asignados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tarjeta_id uuid NOT NULL REFERENCES tarjetas(id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tarjeta_id, usuario_id)
);

-- Crear tabla etiquetas
CREATE TABLE IF NOT EXISTS etiquetas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tablero_id uuid NOT NULL REFERENCES tableros(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  color text NOT NULL DEFAULT '#6b7280',
  created_at timestamptz DEFAULT now()
);

-- Crear tabla tarjeta_etiquetas
CREATE TABLE IF NOT EXISTS tarjeta_etiquetas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tarjeta_id uuid NOT NULL REFERENCES tarjetas(id) ON DELETE CASCADE,
  etiqueta_id uuid NOT NULL REFERENCES etiquetas(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tarjeta_id, etiqueta_id)
);

-- Crear tabla tarjeta_checklist
CREATE TABLE IF NOT EXISTS tarjeta_checklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tarjeta_id uuid NOT NULL REFERENCES tarjetas(id) ON DELETE CASCADE,
  texto text NOT NULL,
  completado boolean DEFAULT false,
  orden integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_tarjeta_asignados_tarjeta ON tarjeta_asignados(tarjeta_id);
CREATE INDEX IF NOT EXISTS idx_tarjeta_asignados_usuario ON tarjeta_asignados(usuario_id);
CREATE INDEX IF NOT EXISTS idx_etiquetas_tablero ON etiquetas(tablero_id);
CREATE INDEX IF NOT EXISTS idx_tarjeta_etiquetas_tarjeta ON tarjeta_etiquetas(tarjeta_id);
CREATE INDEX IF NOT EXISTS idx_tarjeta_etiquetas_etiqueta ON tarjeta_etiquetas(etiqueta_id);
CREATE INDEX IF NOT EXISTS idx_tarjeta_checklist_tarjeta ON tarjeta_checklist(tarjeta_id);

-- Enable RLS
ALTER TABLE tarjeta_asignados ENABLE ROW LEVEL SECURITY;
ALTER TABLE etiquetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarjeta_etiquetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarjeta_checklist ENABLE ROW LEVEL SECURITY;

-- Políticas para tarjeta_asignados
CREATE POLICY "Usuarios pueden ver asignados de tarjetas accesibles"
  ON tarjeta_asignados FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tarjetas
      JOIN listas ON listas.id = tarjetas.lista_id
      JOIN tableros ON tableros.id = listas.tablero_id
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE tarjetas.id = tarjeta_asignados.tarjeta_id
      AND usuario_proyectos.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden asignar usuarios a tarjetas accesibles"
  ON tarjeta_asignados FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tarjetas
      JOIN listas ON listas.id = tarjetas.lista_id
      JOIN tableros ON tableros.id = listas.tablero_id
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE tarjetas.id = tarjeta_id
      AND usuario_proyectos.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden eliminar asignaciones de tarjetas accesibles"
  ON tarjeta_asignados FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tarjetas
      JOIN listas ON listas.id = tarjetas.lista_id
      JOIN tableros ON tableros.id = listas.tablero_id
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE tarjetas.id = tarjeta_asignados.tarjeta_id
      AND usuario_proyectos.usuario_id = auth.uid()
    )
  );

-- Políticas para etiquetas
CREATE POLICY "Usuarios pueden ver etiquetas de tableros accesibles"
  ON etiquetas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tableros
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE tableros.id = etiquetas.tablero_id
      AND usuario_proyectos.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden crear etiquetas en tableros accesibles"
  ON etiquetas FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tableros
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE tableros.id = tablero_id
      AND usuario_proyectos.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden actualizar etiquetas de tableros accesibles"
  ON etiquetas FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tableros
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE tableros.id = etiquetas.tablero_id
      AND usuario_proyectos.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tableros
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE tableros.id = tablero_id
      AND usuario_proyectos.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden eliminar etiquetas de tableros accesibles"
  ON etiquetas FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tableros
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE tableros.id = etiquetas.tablero_id
      AND usuario_proyectos.usuario_id = auth.uid()
    )
  );

-- Políticas para tarjeta_etiquetas
CREATE POLICY "Usuarios pueden ver etiquetas de tarjetas accesibles"
  ON tarjeta_etiquetas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tarjetas
      JOIN listas ON listas.id = tarjetas.lista_id
      JOIN tableros ON tableros.id = listas.tablero_id
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE tarjetas.id = tarjeta_etiquetas.tarjeta_id
      AND usuario_proyectos.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden agregar etiquetas a tarjetas accesibles"
  ON tarjeta_etiquetas FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tarjetas
      JOIN listas ON listas.id = tarjetas.lista_id
      JOIN tableros ON tableros.id = listas.tablero_id
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE tarjetas.id = tarjeta_id
      AND usuario_proyectos.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden eliminar etiquetas de tarjetas accesibles"
  ON tarjeta_etiquetas FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tarjetas
      JOIN listas ON listas.id = tarjetas.lista_id
      JOIN tableros ON tableros.id = listas.tablero_id
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE tarjetas.id = tarjeta_etiquetas.tarjeta_id
      AND usuario_proyectos.usuario_id = auth.uid()
    )
  );

-- Políticas para tarjeta_checklist
CREATE POLICY "Usuarios pueden ver checklist de tarjetas accesibles"
  ON tarjeta_checklist FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tarjetas
      JOIN listas ON listas.id = tarjetas.lista_id
      JOIN tableros ON tableros.id = listas.tablero_id
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE tarjetas.id = tarjeta_checklist.tarjeta_id
      AND usuario_proyectos.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden crear items de checklist en tarjetas accesibles"
  ON tarjeta_checklist FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tarjetas
      JOIN listas ON listas.id = tarjetas.lista_id
      JOIN tableros ON tableros.id = listas.tablero_id
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE tarjetas.id = tarjeta_id
      AND usuario_proyectos.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden actualizar checklist de tarjetas accesibles"
  ON tarjeta_checklist FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tarjetas
      JOIN listas ON listas.id = tarjetas.lista_id
      JOIN tableros ON tableros.id = listas.tablero_id
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE tarjetas.id = tarjeta_checklist.tarjeta_id
      AND usuario_proyectos.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tarjetas
      JOIN listas ON listas.id = tarjetas.lista_id
      JOIN tableros ON tableros.id = listas.tablero_id
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE tarjetas.id = tarjeta_id
      AND usuario_proyectos.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden eliminar items de checklist de tarjetas accesibles"
  ON tarjeta_checklist FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tarjetas
      JOIN listas ON listas.id = tarjetas.lista_id
      JOIN tableros ON tableros.id = listas.tablero_id
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE tarjetas.id = tarjeta_checklist.tarjeta_id
      AND usuario_proyectos.usuario_id = auth.uid()
    )
  );