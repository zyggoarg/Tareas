/*
  # Corregir políticas RLS para proyectos

  ## Descripción
  Este migration corrige las políticas RLS de las tablas de proyectos para
  que funcionen sin autenticación de Supabase Auth, ya que el sistema usa
  autenticación personalizada.

  ## Cambios
  1. Eliminar políticas RLS existentes que dependen de auth.uid()
  2. Crear nuevas políticas más permisivas para permitir operaciones
  3. Mantener RLS habilitado pero con políticas adaptadas al sistema actual
*/

-- Eliminar políticas existentes de proyectos
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver proyectos" ON proyectos;
DROP POLICY IF EXISTS "Solo administradores pueden crear proyectos" ON proyectos;
DROP POLICY IF EXISTS "Solo administradores pueden actualizar proyectos" ON proyectos;
DROP POLICY IF EXISTS "Solo administradores pueden eliminar proyectos" ON proyectos;

-- Crear políticas simplificadas para proyectos
CREATE POLICY "Permitir lectura de proyectos"
  ON proyectos FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir inserción de proyectos"
  ON proyectos FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Permitir actualización de proyectos"
  ON proyectos FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación de proyectos"
  ON proyectos FOR DELETE
  TO public
  USING (true);

-- Eliminar políticas existentes de usuario_proyectos
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios proyectos" ON usuario_proyectos;
DROP POLICY IF EXISTS "Solo administradores pueden asignar proyectos" ON usuario_proyectos;
DROP POLICY IF EXISTS "Solo administradores pueden eliminar asignaciones de proyectos" ON usuario_proyectos;

-- Crear políticas simplificadas para usuario_proyectos
CREATE POLICY "Permitir lectura de usuario_proyectos"
  ON usuario_proyectos FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir inserción de usuario_proyectos"
  ON usuario_proyectos FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación de usuario_proyectos"
  ON usuario_proyectos FOR DELETE
  TO public
  USING (true);
