/*
  # Configurar bucket de fotos para el sistema

  1. Storage Configuration
    - Crear bucket 'photos' si no existe
    - Configurar como público para facilidad de uso
    - Establecer políticas de seguridad básicas

  2. Security Policies
    - Permitir subida de archivos a usuarios autenticados y anónimos
    - Permitir lectura pública de archivos
    - Permitir eliminación a usuarios autenticados y anónimos

  3. Bucket Structure
    - El sistema creará automáticamente carpetas:
      - photos/novedades/ - Para fotos de novedades
      - photos/comentarios/ - Para fotos de comentarios
*/

-- Insertar bucket 'photos' si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos',
  'photos',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir subida de archivos (INSERT)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Allow authenticated and anon uploads to photos'
  ) THEN
    CREATE POLICY "Allow authenticated and anon uploads to photos"
    ON storage.objects
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (bucket_id = 'photos');
  END IF;
END $$;

-- Política para permitir lectura de archivos (SELECT)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Allow public downloads from photos'
  ) THEN
    CREATE POLICY "Allow public downloads from photos"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'photos');
  END IF;
END $$;

-- Política para permitir eliminación de archivos (DELETE)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Allow authenticated and anon deletes from photos'
  ) THEN
    CREATE POLICY "Allow authenticated and anon deletes from photos"
    ON storage.objects
    FOR DELETE
    TO authenticated, anon
    USING (bucket_id = 'photos');
  END IF;
END $$;

-- Política para permitir actualización de archivos (UPDATE)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Allow authenticated and anon updates to photos'
  ) THEN
    CREATE POLICY "Allow authenticated and anon updates to photos"
    ON storage.objects
    FOR UPDATE
    TO authenticated, anon
    USING (bucket_id = 'photos')
    WITH CHECK (bucket_id = 'photos');
  END IF;
END $$;