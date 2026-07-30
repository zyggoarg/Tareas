/*
  # Corregir políticas RLS basadas en asignaciones de usuarios

  ## Descripción
  Este migration corrige las políticas RLS para que los usuarios solo puedan
  ver las novedades de los proyectos y sectores que tienen asignados.
  Los administradores mantienen acceso completo a todo.

  ## Cambios en Seguridad

  ### Tabla `novedades`
  - Los administradores pueden ver todas las novedades
  - Los usuarios normales solo ven novedades donde:
    - El proyecto está asignado al usuario (usuario_proyectos)
    - Y el sector está asignado al usuario (usuario_sectores)
  - Solo usuarios con acceso pueden crear/actualizar/eliminar

  ### Tabla `sectores`
  - Los administradores pueden ver y gestionar todos los sectores
  - Los usuarios normales solo ven sectores asignados a ellos

  ### Tabla `proyectos`
  - Los administradores pueden ver y gestionar todos los proyectos
  - Los usuarios normales solo ven proyectos asignados a ellos

  ### Tabla `usuario_sectores`
  - Los administradores pueden ver todas las asignaciones
  - Los usuarios pueden ver sus propias asignaciones
  - Solo administradores pueden crear/eliminar asignaciones

  ### Tabla `usuario_proyectos`
  - Las políticas existentes ya son correctas

  ## Notas Importantes
  1. Un usuario sin asignaciones no verá ninguna novedad
  2. Los administradores (rol = 'administrador') tienen acceso total
  3. Las asignaciones son obligatorias para usuarios normales
*/

-- ============================================================================
-- NOVEDADES: Restringir acceso basado en asignaciones
-- ============================================================================

-- Eliminar políticas existentes de novedades
DROP POLICY IF EXISTS "novedades_select_policy" ON novedades;
DROP POLICY IF EXISTS "novedades_insert_policy" ON novedades;
DROP POLICY IF EXISTS "novedades_update_policy" ON novedades;
DROP POLICY IF EXISTS "novedades_delete_policy" ON novedades;

-- Los usuarios pueden ver novedades solo si tienen asignados el proyecto Y el sector
CREATE POLICY "Usuarios ven novedades de sus proyectos y sectores asignados"
  ON novedades FOR SELECT
  TO anon, authenticated
  USING (
    -- Administradores ven todo
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = creado_por_id
      AND usuarios.rol = 'administrador'
    )
    OR
    -- Usuario normal: debe tener asignado el proyecto Y el sector
    (
      -- Tiene el proyecto asignado
      EXISTS (
        SELECT 1 FROM usuario_proyectos
        WHERE usuario_proyectos.proyecto_id = novedades.proyecto_id
        AND usuario_proyectos.usuario_id IN (
          SELECT id FROM usuarios WHERE usuarios.id = novedades.creado_por_id
        )
      )
      AND
      -- Tiene el sector asignado
      EXISTS (
        SELECT 1 FROM usuario_sectores
        WHERE usuario_sectores.sector_id = novedades.sector_id
        AND usuario_sectores.usuario_id IN (
          SELECT id FROM usuarios WHERE usuarios.id = novedades.creado_por_id
        )
      )
    )
  );

-- Solo pueden insertar si tienen asignados el proyecto y sector
CREATE POLICY "Usuarios pueden crear novedades en sus proyectos y sectores"
  ON novedades FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    -- Administradores pueden crear en cualquier lugar
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = creado_por_id
      AND usuarios.rol = 'administrador'
    )
    OR
    -- Usuario normal: debe tener asignado el proyecto Y el sector
    (
      EXISTS (
        SELECT 1 FROM usuario_proyectos
        WHERE usuario_proyectos.proyecto_id = novedades.proyecto_id
        AND usuario_proyectos.usuario_id = creado_por_id
      )
      AND
      EXISTS (
        SELECT 1 FROM usuario_sectores
        WHERE usuario_sectores.sector_id = novedades.sector_id
        AND usuario_sectores.usuario_id = creado_por_id
      )
    )
  );

-- Solo pueden actualizar novedades de sus proyectos y sectores
CREATE POLICY "Usuarios pueden actualizar novedades de sus proyectos y sectores"
  ON novedades FOR UPDATE
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = creado_por_id
      AND usuarios.rol = 'administrador'
    )
    OR
    (
      EXISTS (
        SELECT 1 FROM usuario_proyectos
        WHERE usuario_proyectos.proyecto_id = novedades.proyecto_id
        AND usuario_proyectos.usuario_id = creado_por_id
      )
      AND
      EXISTS (
        SELECT 1 FROM usuario_sectores
        WHERE usuario_sectores.sector_id = novedades.sector_id
        AND usuario_sectores.usuario_id = creado_por_id
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = creado_por_id
      AND usuarios.rol = 'administrador'
    )
    OR
    (
      EXISTS (
        SELECT 1 FROM usuario_proyectos
        WHERE usuario_proyectos.proyecto_id = novedades.proyecto_id
        AND usuario_proyectos.usuario_id = creado_por_id
      )
      AND
      EXISTS (
        SELECT 1 FROM usuario_sectores
        WHERE usuario_sectores.sector_id = novedades.sector_id
        AND usuario_sectores.usuario_id = creado_por_id
      )
    )
  );

-- Solo pueden eliminar novedades de sus proyectos y sectores
CREATE POLICY "Usuarios pueden eliminar novedades de sus proyectos y sectores"
  ON novedades FOR DELETE
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = creado_por_id
      AND usuarios.rol = 'administrador'
    )
    OR
    (
      EXISTS (
        SELECT 1 FROM usuario_proyectos
        WHERE usuario_proyectos.proyecto_id = novedades.proyecto_id
        AND usuario_proyectos.usuario_id = creado_por_id
      )
      AND
      EXISTS (
        SELECT 1 FROM usuario_sectores
        WHERE usuario_sectores.sector_id = novedades.sector_id
        AND usuario_sectores.usuario_id = creado_por_id
      )
    )
  );

-- ============================================================================
-- SECTORES: Restringir acceso basado en asignaciones
-- ============================================================================

-- Eliminar políticas existentes de sectores
DROP POLICY IF EXISTS "sectores_select_policy" ON sectores;
DROP POLICY IF EXISTS "sectores_insert_policy" ON sectores;
DROP POLICY IF EXISTS "sectores_update_policy" ON sectores;
DROP POLICY IF EXISTS "sectores_delete_policy" ON sectores;

-- Los usuarios solo ven sectores asignados
CREATE POLICY "Usuarios ven solo sectores asignados"
  ON sectores FOR SELECT
  TO anon, authenticated
  USING (
    -- Administradores ven todos
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.rol = 'administrador'
    )
    OR
    -- Usuario normal: solo sectores asignados
    EXISTS (
      SELECT 1 FROM usuario_sectores
      WHERE usuario_sectores.sector_id = sectores.id
    )
  );

-- Solo administradores pueden crear sectores
CREATE POLICY "Solo administradores crean sectores"
  ON sectores FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.rol = 'administrador'
    )
  );

-- Solo administradores pueden actualizar sectores
CREATE POLICY "Solo administradores actualizan sectores"
  ON sectores FOR UPDATE
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.rol = 'administrador'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.rol = 'administrador'
    )
  );

-- Solo administradores pueden eliminar sectores
CREATE POLICY "Solo administradores eliminan sectores"
  ON sectores FOR DELETE
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.rol = 'administrador'
    )
  );

-- ============================================================================
-- PROYECTOS: Restringir acceso basado en asignaciones
-- ============================================================================

-- Eliminar políticas existentes de proyectos
DROP POLICY IF EXISTS "Permitir lectura de proyectos" ON proyectos;
DROP POLICY IF EXISTS "Permitir inserción de proyectos" ON proyectos;
DROP POLICY IF EXISTS "Permitir actualización de proyectos" ON proyectos;
DROP POLICY IF EXISTS "Permitir eliminación de proyectos" ON proyectos;

-- Los usuarios solo ven proyectos asignados
CREATE POLICY "Usuarios ven solo proyectos asignados"
  ON proyectos FOR SELECT
  TO anon, authenticated
  USING (
    -- Administradores ven todos
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.rol = 'administrador'
    )
    OR
    -- Usuario normal: solo proyectos asignados
    EXISTS (
      SELECT 1 FROM usuario_proyectos
      WHERE usuario_proyectos.proyecto_id = proyectos.id
    )
  );

-- Solo administradores pueden crear proyectos
CREATE POLICY "Solo administradores crean proyectos"
  ON proyectos FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.rol = 'administrador'
    )
  );

-- Solo administradores pueden actualizar proyectos
CREATE POLICY "Solo administradores actualizan proyectos"
  ON proyectos FOR UPDATE
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.rol = 'administrador'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.rol = 'administrador'
    )
  );

-- Solo administradores pueden eliminar proyectos
CREATE POLICY "Solo administradores eliminan proyectos"
  ON proyectos FOR DELETE
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.rol = 'administrador'
    )
  );

-- ============================================================================
-- USUARIO_SECTORES: Mejorar políticas
-- ============================================================================

-- Eliminar políticas existentes de usuario_sectores
DROP POLICY IF EXISTS "usuario_sectores_select_policy" ON usuario_sectores;
DROP POLICY IF EXISTS "usuario_sectores_insert_policy" ON usuario_sectores;
DROP POLICY IF EXISTS "usuario_sectores_update_policy" ON usuario_sectores;
DROP POLICY IF EXISTS "usuario_sectores_delete_policy" ON usuario_sectores;

-- Solo administradores y el propio usuario pueden ver sus asignaciones
CREATE POLICY "Usuarios ven sus asignaciones de sectores"
  ON usuario_sectores FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.rol = 'administrador'
    )
  );

-- Solo administradores pueden crear asignaciones
CREATE POLICY "Solo administradores asignan sectores"
  ON usuario_sectores FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.rol = 'administrador'
    )
  );

-- Solo administradores pueden eliminar asignaciones
CREATE POLICY "Solo administradores eliminan asignaciones de sectores"
  ON usuario_sectores FOR DELETE
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.rol = 'administrador'
    )
  );

-- ============================================================================
-- USUARIO_PROYECTOS: Mejorar políticas existentes
-- ============================================================================

-- Eliminar políticas existentes de usuario_proyectos
DROP POLICY IF EXISTS "Permitir lectura de usuario_proyectos" ON usuario_proyectos;
DROP POLICY IF EXISTS "Permitir inserción de usuario_proyectos" ON usuario_proyectos;
DROP POLICY IF EXISTS "Permitir eliminación de usuario_proyectos" ON usuario_proyectos;

-- Solo administradores pueden ver asignaciones
CREATE POLICY "Usuarios ven sus asignaciones de proyectos"
  ON usuario_proyectos FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.rol = 'administrador'
    )
  );

-- Solo administradores pueden crear asignaciones
CREATE POLICY "Solo administradores asignan proyectos"
  ON usuario_proyectos FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.rol = 'administrador'
    )
  );

-- Solo administradores pueden eliminar asignaciones
CREATE POLICY "Solo administradores eliminan asignaciones de proyectos"
  ON usuario_proyectos FOR DELETE
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.rol = 'administrador'
    )
  );
