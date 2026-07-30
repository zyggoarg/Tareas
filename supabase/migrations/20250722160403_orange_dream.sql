/*
  # Crear tabla para lecturas de comentarios

  1. Nueva Tabla
    - `comentario_lecturas`
      - `id` (uuid, primary key)
      - `novedad_id` (uuid, foreign key to novedades)
      - `usuario_id` (uuid, foreign key to usuarios)
      - `ultimo_comentario_leido_at` (timestamp) - timestamp del último comentario leído
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Seguridad
    - Enable RLS en `comentario_lecturas`
    - Políticas para usuarios autenticados y anónimos

  3. Índices
    - Índice único en (novedad_id, usuario_id)
    - Índices para consultas eficientes
*/

CREATE TABLE IF NOT EXISTS comentario_lecturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  novedad_id uuid NOT NULL REFERENCES novedades(id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  ultimo_comentario_leido_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(novedad_id, usuario_id)
);

-- Habilitar RLS
ALTER TABLE comentario_lecturas ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios anónimos y autenticados
CREATE POLICY "Allow anon users to read comentario_lecturas"
  ON comentario_lecturas
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon users to insert comentario_lecturas"
  ON comentario_lecturas
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon users to update comentario_lecturas"
  ON comentario_lecturas
  FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated users to read comentario_lecturas"
  ON comentario_lecturas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert comentario_lecturas"
  ON comentario_lecturas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update comentario_lecturas"
  ON comentario_lecturas
  FOR UPDATE
  TO authenticated
  USING (true);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_comentario_lecturas_novedad_id ON comentario_lecturas(novedad_id);
CREATE INDEX IF NOT EXISTS idx_comentario_lecturas_usuario_id ON comentario_lecturas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_comentario_lecturas_timestamp ON comentario_lecturas(ultimo_comentario_leido_at DESC);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_comentario_lecturas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_comentario_lecturas_updated_at
  BEFORE UPDATE ON comentario_lecturas
  FOR EACH ROW
  EXECUTE FUNCTION update_comentario_lecturas_updated_at();