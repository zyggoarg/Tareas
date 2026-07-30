/*
  # Crear buckets de storage para fotos

  1. Buckets
    - Crear bucket 'novedades' para fotos de novedades
    - Crear bucket 'comentarios' para fotos de comentarios

  2. Security
    - Permitir que usuarios autenticados y anónimos puedan leer archivos
    - Permitir que usuarios autenticados y anónimos puedan subir archivos
    - Los buckets son públicos para lectura
*/

-- Crear bucket para fotos de novedades
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'novedades',
  'novedades',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Crear bucket para fotos de comentarios
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'comentarios',
  'comentarios',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Políticas para bucket novedades - SELECT (lectura)
CREATE POLICY "Public can read novedades bucket"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'novedades');

-- Políticas para bucket novedades - INSERT (subida)
CREATE POLICY "Authenticated can upload to novedades bucket"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'novedades');

CREATE POLICY "Anon can upload to novedades bucket"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'novedades');

-- Políticas para bucket novedades - DELETE
CREATE POLICY "Authenticated can delete from novedades bucket"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'novedades');

CREATE POLICY "Anon can delete from novedades bucket"
  ON storage.objects
  FOR DELETE
  TO anon
  USING (bucket_id = 'novedades');

-- Políticas para bucket comentarios - SELECT (lectura)
CREATE POLICY "Public can read comentarios bucket"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'comentarios');

-- Políticas para bucket comentarios - INSERT (subida)
CREATE POLICY "Authenticated can upload to comentarios bucket"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'comentarios');

CREATE POLICY "Anon can upload to comentarios bucket"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'comentarios');

-- Políticas para bucket comentarios - DELETE
CREATE POLICY "Authenticated can delete from comentarios bucket"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'comentarios');

CREATE POLICY "Anon can delete from comentarios bucket"
  ON storage.objects
  FOR DELETE
  TO anon
  USING (bucket_id = 'comentarios');