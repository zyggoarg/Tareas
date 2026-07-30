/*
  # Revertir a filtrado del lado del cliente

  ## Descripción
  Este migration revierte las políticas RLS restrictivas y vuelve a políticas permisivas
  porque el sistema usa autenticación personalizada (no Supabase Auth) y el control
  de acceso se maneja completamente en el lado del cliente.

  ## Importante
  - El sistema NO usa Supabase Auth (auth.uid() no está disponible)
  - La autenticación se maneja con localStorage y filtrado en el cliente
  - Las asignaciones de proyectos y sectores se respetan en useNovedades.ts
  - Las políticas RLS deben ser permisivas para permitir operaciones desde el cliente

  ## Cambios
  - Restaurar políticas permisivas para todas las tablas
  - El filtrado por proyectos y sectores asignados se hace en el cliente
*/

-- ============================================================================
-- NOVEDADES: Políticas permisivas
-- ============================================================================

DROP POLICY IF EXISTS "Usuarios ven novedades de sus proyectos y sectores asignados" ON novedades;
DROP POLICY IF EXISTS "Usuarios pueden crear novedades en sus proyectos y sectores" ON novedades;
DROP POLICY IF EXISTS "Usuarios pueden actualizar novedades de sus proyectos y sectores" ON novedades;
DROP POLICY IF EXISTS "Usuarios pueden eliminar novedades de sus proyectos y sectores" ON novedades;

CREATE POLICY "novedades_select_policy"
  ON novedades FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "novedades_insert_policy"
  ON novedades FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "novedades_update_policy"
  ON novedades FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "novedades_delete_policy"
  ON novedades FOR DELETE
  TO anon, authenticated
  USING (true);

-- ============================================================================
-- SECTORES: Políticas permisivas
-- ============================================================================

DROP POLICY IF EXISTS "Usuarios ven solo sectores asignados" ON sectores;
DROP POLICY IF EXISTS "Solo administradores crean sectores" ON sectores;
DROP POLICY IF EXISTS "Solo administradores actualizan sectores" ON sectores;
DROP POLICY IF EXISTS "Solo administradores eliminan sectores" ON sectores;

CREATE POLICY "sectores_select_policy"
  ON sectores FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "sectores_insert_policy"
  ON sectores FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "sectores_update_policy"
  ON sectores FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "sectores_delete_policy"
  ON sectores FOR DELETE
  TO anon, authenticated
  USING (true);

-- ============================================================================
-- PROYECTOS: Políticas permisivas
-- ============================================================================

DROP POLICY IF EXISTS "Usuarios ven solo proyectos asignados" ON proyectos;
DROP POLICY IF EXISTS "Solo administradores crean proyectos" ON proyectos;
DROP POLICY IF EXISTS "Solo administradores actualizan proyectos" ON proyectos;
DROP POLICY IF EXISTS "Solo administradores eliminan proyectos" ON proyectos;

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

-- ============================================================================
-- USUARIO_SECTORES: Políticas permisivas
-- ============================================================================

DROP POLICY IF EXISTS "Usuarios ven sus asignaciones de sectores" ON usuario_sectores;
DROP POLICY IF EXISTS "Solo administradores asignan sectores" ON usuario_sectores;
DROP POLICY IF EXISTS "Solo administradores eliminan asignaciones de sectores" ON usuario_sectores;

CREATE POLICY "usuario_sectores_select_policy"
  ON usuario_sectores FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "usuario_sectores_insert_policy"
  ON usuario_sectores FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "usuario_sectores_update_policy"
  ON usuario_sectores FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "usuario_sectores_delete_policy"
  ON usuario_sectores FOR DELETE
  TO anon, authenticated
  USING (true);

-- ============================================================================
-- USUARIO_PROYECTOS: Políticas permisivas
-- ============================================================================

DROP POLICY IF EXISTS "Usuarios ven sus asignaciones de proyectos" ON usuario_proyectos;
DROP POLICY IF EXISTS "Solo administradores asignan proyectos" ON usuario_proyectos;
DROP POLICY IF EXISTS "Solo administradores eliminan asignaciones de proyectos" ON usuario_proyectos;

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
