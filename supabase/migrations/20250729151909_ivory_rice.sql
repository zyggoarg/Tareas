/*
  # Corregir políticas RLS para tabla lecturas

  1. Problema
    - Las políticas actuales no permiten a usuarios autenticados insertar/actualizar lecturas
    - Error: "new row violates row-level security policy"

  2. Solución
    - Eliminar políticas problemáticas existentes
    - Crear nuevas políticas que permitan a usuarios autenticados:
      - Insertar sus propias lecturas
      - Actualizar sus propias lecturas  
      - Leer todas las lecturas (para mostrar quién leyó qué)

  3. Seguridad
    - Los usuarios solo pueden insertar/actualizar lecturas con su propio usuario_id
    - Pueden leer todas las lecturas para funcionalidad de "quién leyó"
*/

-- Eliminar políticas existentes que causan problemas
DROP POLICY IF EXISTS "Allow anon users to insert lecturas" ON public.lecturas;
DROP POLICY IF EXISTS "Allow anon users to read lecturas" ON public.lecturas;
DROP POLICY IF EXISTS "Allow authenticated users to insert lecturas" ON public.lecturas;
DROP POLICY IF EXISTS "Allow authenticated users to read lecturas" ON public.lecturas;

-- Asegurar que RLS esté habilitado
ALTER TABLE public.lecturas ENABLE ROW LEVEL SECURITY;

-- Política para permitir a usuarios autenticados insertar sus propias lecturas
CREATE POLICY "Allow authenticated users to insert their own lecturas"
ON public.lecturas
FOR INSERT TO authenticated
WITH CHECK (usuario_id::text = auth.uid()::text);

-- Política para permitir a usuarios autenticados actualizar sus propias lecturas
CREATE POLICY "Allow authenticated users to update their own lecturas"
ON public.lecturas
FOR UPDATE TO authenticated
USING (usuario_id::text = auth.uid()::text)
WITH CHECK (usuario_id::text = auth.uid()::text);

-- Política para permitir a usuarios autenticados leer todas las lecturas
-- (necesario para mostrar quién leyó cada novedad)
CREATE POLICY "Allow authenticated users to read all lecturas"
ON public.lecturas
FOR SELECT TO authenticated
USING (true);

-- También permitir a usuarios anónimos leer lecturas (para compatibilidad)
CREATE POLICY "Allow anon users to read lecturas"
ON public.lecturas
FOR SELECT TO anon
USING (true);