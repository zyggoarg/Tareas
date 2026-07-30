/*
  # Agregar sectores por usuario

  1. Nueva tabla
    - `usuario_sectores` - Relación muchos a muchos entre usuarios y sectores
      - `id` (uuid, primary key)
      - `usuario_id` (uuid, foreign key to usuarios)
      - `sector_id` (uuid, foreign key to sectores)
      - `created_at` (timestamp)

  2. Seguridad
    - Enable RLS en `usuario_sectores`
    - Políticas para permitir operaciones básicas
*/

-- Crear tabla de relación usuario-sectores
CREATE TABLE IF NOT EXISTS usuario_sectores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  sector_id uuid NOT NULL REFERENCES sectores(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(usuario_id, sector_id)
);

-- Habilitar RLS
ALTER TABLE usuario_sectores ENABLE ROW LEVEL SECURITY;

-- Crear políticas
CREATE POLICY "usuario_sectores_select_policy"
  ON usuario_sectores
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "usuario_sectores_insert_policy"
  ON usuario_sectores
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "usuario_sectores_update_policy"
  ON usuario_sectores
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "usuario_sectores_delete_policy"
  ON usuario_sectores
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_usuario_sectores_usuario_id ON usuario_sectores(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuario_sectores_sector_id ON usuario_sectores(sector_id);