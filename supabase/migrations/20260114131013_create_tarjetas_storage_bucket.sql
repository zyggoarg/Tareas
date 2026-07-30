/*
  # Crear bucket de storage para adjuntos de tarjetas

  1. Bucket
    - Crear bucket 'tarjetas' para adjuntos de tarjetas
    - Tamaño máximo: 50MB por archivo
    - Tipos permitidos: imágenes y PDFs

  2. Security
    - Usuarios autenticados pueden leer archivos
    - Usuarios autenticados pueden subir archivos
    - Usuarios autenticados pueden eliminar sus propios archivos
*/

-- Crear bucket para adjuntos de tarjetas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tarjetas',
  'tarjetas',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Políticas para bucket tarjetas - SELECT (lectura)
CREATE POLICY "Usuarios pueden leer bucket tarjetas"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'tarjetas');

-- Políticas para bucket tarjetas - INSERT (subida)
CREATE POLICY "Usuarios pueden subir a bucket tarjetas"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'tarjetas'
    AND (storage.foldername(name))[1] = 'tarjeta-adjuntos'
  );

-- Políticas para bucket tarjetas - DELETE
CREATE POLICY "Usuarios pueden eliminar de bucket tarjetas"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'tarjetas'
    AND (storage.foldername(name))[1] = 'tarjeta-adjuntos'
  );