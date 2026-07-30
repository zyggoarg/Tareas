/*
  # Vinculación entre Novedades y Tarjetas

  1. Nueva Tabla
    - `novedad_tarjetas` (Relationship between Novedades and Tarjetas)
      - `id` (uuid, primary key)
      - `novedad_id` (uuid, referencia a novedades)
      - `tarjeta_id` (uuid, referencia a tarjetas)
      - `creado_por_id` (uuid, usuario que creó la vinculación)
      - `created_at` (timestamptz)
      - Constraint único para evitar duplicados

  2. Security
    - Enable RLS
    - Políticas basadas en acceso a proyecto
    - Los usuarios pueden vincular si tienen acceso tanto a la novedad como a la tarjeta
*/

-- Crear tabla novedad_tarjetas
CREATE TABLE IF NOT EXISTS novedad_tarjetas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  novedad_id uuid NOT NULL REFERENCES novedades(id) ON DELETE CASCADE,
  tarjeta_id uuid NOT NULL REFERENCES tarjetas(id) ON DELETE CASCADE,
  creado_por_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(novedad_id, tarjeta_id)
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_novedad_tarjetas_novedad ON novedad_tarjetas(novedad_id);
CREATE INDEX IF NOT EXISTS idx_novedad_tarjetas_tarjeta ON novedad_tarjetas(tarjeta_id);
CREATE INDEX IF NOT EXISTS idx_novedad_tarjetas_creado_por ON novedad_tarjetas(creado_por_id);

-- Enable RLS
ALTER TABLE novedad_tarjetas ENABLE ROW LEVEL SECURITY;

-- Políticas para novedad_tarjetas
CREATE POLICY "Ver vinculaciones accesibles"
  ON novedad_tarjetas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM novedades n
      JOIN proyectos p ON p.id = n.proyecto_id
      JOIN usuario_proyectos up ON up.proyecto_id = p.id
      WHERE n.id = novedad_tarjetas.novedad_id
      AND up.usuario_id IN (SELECT id FROM usuarios WHERE id = auth.uid())
    )
    OR
    EXISTS (
      SELECT 1 FROM tarjetas t
      JOIN listas l ON l.id = t.lista_id
      JOIN tableros tb ON tb.id = l.tablero_id
      JOIN usuario_proyectos up ON up.proyecto_id = tb.proyecto_id
      WHERE t.id = novedad_tarjetas.tarjeta_id
      AND up.usuario_id IN (SELECT id FROM usuarios WHERE id = auth.uid())
    )
  );

CREATE POLICY "Crear vinculaciones"
  ON novedad_tarjetas FOR INSERT
  TO authenticated
  WITH CHECK (
    creado_por_id IN (SELECT id FROM usuarios WHERE id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM novedades n
      JOIN proyectos p ON p.id = n.proyecto_id
      JOIN usuario_proyectos up ON up.proyecto_id = p.id
      WHERE n.id = novedad_id
      AND up.usuario_id IN (SELECT id FROM usuarios WHERE id = auth.uid())
    )
    AND EXISTS (
      SELECT 1 FROM tarjetas t
      JOIN listas l ON l.id = t.lista_id
      JOIN tableros tb ON tb.id = l.tablero_id
      JOIN usuario_proyectos up ON up.proyecto_id = tb.proyecto_id
      WHERE t.id = tarjeta_id
      AND up.usuario_id IN (SELECT id FROM usuarios WHERE id = auth.uid())
    )
  );

CREATE POLICY "Eliminar vinculaciones propias"
  ON novedad_tarjetas FOR DELETE
  TO authenticated
  USING (creado_por_id IN (SELECT id FROM usuarios WHERE id = auth.uid()));