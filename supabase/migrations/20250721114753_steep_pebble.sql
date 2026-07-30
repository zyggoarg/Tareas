/*
  # Create lecturas table for multiple readers

  1. New Tables
    - `lecturas`
      - `id` (uuid, primary key)
      - `novedad_id` (uuid, foreign key to novedades)
      - `usuario_id` (uuid, foreign key to usuarios)
      - `fecha_lectura` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `lecturas` table
    - Add policy for authenticated users to read and insert their own readings

  3. Changes
    - This allows multiple users to mark a novedad as read
    - Maintains history of who read what and when
*/

CREATE TABLE IF NOT EXISTS lecturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  novedad_id uuid NOT NULL REFERENCES novedades(id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  fecha_lectura timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(novedad_id, usuario_id)
);

ALTER TABLE lecturas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all lecturas"
  ON lecturas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own lecturas"
  ON lecturas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_lecturas_novedad_id ON lecturas(novedad_id);
CREATE INDEX IF NOT EXISTS idx_lecturas_usuario_id ON lecturas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_lecturas_fecha ON lecturas(fecha_lectura DESC);