/*
  # Agregar soporte para fotografías en novedades y comentarios

  1. Nuevas Tablas
    - `novedad_fotos`
      - `id` (uuid, primary key)
      - `novedad_id` (uuid, foreign key)
      - `url` (text)
      - `nombre_archivo` (text)
      - `created_at` (timestamp)
    - `comentario_fotos`
      - `id` (uuid, primary key)
      - `comentario_id` (uuid, foreign key)
      - `url` (text)
      - `nombre_archivo` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Tabla para fotos de novedades
CREATE TABLE IF NOT EXISTS novedad_fotos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  novedad_id uuid NOT NULL REFERENCES novedades(id) ON DELETE CASCADE,
  url text NOT NULL,
  nombre_archivo text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabla para fotos de comentarios
CREATE TABLE IF NOT EXISTS comentario_fotos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comentario_id uuid NOT NULL REFERENCES comentarios(id) ON DELETE CASCADE,
  url text NOT NULL,
  nombre_archivo text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_novedad_fotos_novedad_id ON novedad_fotos(novedad_id);
CREATE INDEX IF NOT EXISTS idx_comentario_fotos_comentario_id ON comentario_fotos(comentario_id);

-- Habilitar RLS
ALTER TABLE novedad_fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comentario_fotos ENABLE ROW LEVEL SECURITY;

-- Políticas para novedad_fotos
CREATE POLICY "Allow anon users to read novedad_fotos"
  ON novedad_fotos
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated users to read novedad_fotos"
  ON novedad_fotos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow anon users to insert novedad_fotos"
  ON novedad_fotos
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert novedad_fotos"
  ON novedad_fotos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anon users to delete novedad_fotos"
  ON novedad_fotos
  FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated users to delete novedad_fotos"
  ON novedad_fotos
  FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para comentario_fotos
CREATE POLICY "Allow anon users to read comentario_fotos"
  ON comentario_fotos
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated users to read comentario_fotos"
  ON comentario_fotos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow anon users to insert comentario_fotos"
  ON comentario_fotos
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert comentario_fotos"
  ON comentario_fotos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anon users to delete comentario_fotos"
  ON comentario_fotos
  FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated users to delete comentario_fotos"
  ON comentario_fotos
  FOR DELETE
  TO authenticated
  USING (true);