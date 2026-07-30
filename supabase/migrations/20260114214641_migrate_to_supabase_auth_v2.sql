/*
  # Migración a Supabase Auth - Versión 2

  ## Cambios Realizados

  1. **Estructura de Usuarios**
     - Agregar columna `auth_id` a la tabla `usuarios` para vincular con auth.users
     - Esta columna conectará el perfil extendido con la autenticación de Supabase
  
  2. **Actualización de Políticas RLS**
     - Convertir todas las políticas para usar `auth.uid()` en lugar de verificaciones personalizadas
     - Crear políticas que permitan acceso basado en el auth_id
  
  3. **Seguridad**
     - Permitir a usuarios anónimos ver usuarios (para el proceso de migración inicial)
     - Una vez autenticados, usuarios solo pueden ver sus propios datos o datos compartidos
     - Administradores mantienen acceso completo

  ## Notas Importantes
  - Los usuarios existentes serán migrados a auth.users durante su primer login
  - El email será generado como: {dni}@rotorc.com.ar
  - La contraseña inicial será su DNI (debe cambiarse después)
*/

-- 1. Agregar columna auth_id a usuarios
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'usuarios' AND column_name = 'auth_id'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN auth_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_usuarios_auth_id ON usuarios(auth_id);
  END IF;
END $$;

-- 2. Crear función para obtener el perfil del usuario actual
CREATE OR REPLACE FUNCTION get_user_profile()
RETURNS TABLE (
  id uuid,
  nombre text,
  apellido text,
  dni text,
  rol text,
  activo boolean,
  created_at timestamptz,
  photo_url text,
  auth_id uuid
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.nombre, u.apellido, u.dni, u.rol, u.activo, u.created_at, u.photo_url, u.auth_id
  FROM usuarios u
  WHERE u.auth_id = auth.uid() AND u.activo = true;
END;
$$;

-- 3. Crear función para vincular usuario existente con auth
CREATE OR REPLACE FUNCTION link_user_to_auth(p_dni text, p_auth_id uuid)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE usuarios
  SET auth_id = p_auth_id
  WHERE dni = p_dni AND auth_id IS NULL;
END;
$$;

-- 4. Eliminar políticas anteriores y crear nuevas basadas en auth.uid()

-- Políticas para usuarios
DROP POLICY IF EXISTS "Usuarios pueden ver todos los usuarios activos" ON usuarios;
DROP POLICY IF EXISTS "Solo administradores pueden insertar usuarios" ON usuarios;
DROP POLICY IF EXISTS "Solo administradores pueden actualizar usuarios" ON usuarios;
DROP POLICY IF EXISTS "Permitir acceso anónimo para login" ON usuarios;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver usuarios activos" ON usuarios;
DROP POLICY IF EXISTS "Acceso anónimo para migración" ON usuarios;
DROP POLICY IF EXISTS "Permitir vincular auth_id" ON usuarios;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su perfil" ON usuarios;

-- Permitir a usuarios autenticados ver todos los usuarios activos
CREATE POLICY "Usuarios autenticados pueden ver usuarios activos"
  ON usuarios FOR SELECT
  TO authenticated
  USING (activo = true);

-- Permitir acceso anónimo para el proceso de migración/login
CREATE POLICY "Acceso anónimo para migración"
  ON usuarios FOR SELECT
  TO anon
  USING (activo = true);

-- Permitir actualización para vincular auth_id (anon necesita esto para la migración)
CREATE POLICY "Permitir vincular auth_id"
  ON usuarios FOR UPDATE
  TO anon
  USING (auth_id IS NULL)
  WITH CHECK (true);

-- Solo administradores pueden insertar usuarios
CREATE POLICY "Solo administradores pueden insertar usuarios"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE auth_id = auth.uid() AND rol = 'administrador' AND activo = true
    )
  );

-- Usuarios pueden actualizar su propio perfil o administradores pueden actualizar cualquiera
CREATE POLICY "Usuarios pueden actualizar su perfil"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (
    auth_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE auth_id = auth.uid() AND rol = 'administrador' AND activo = true
    )
  );

-- Políticas para sectores
DROP POLICY IF EXISTS "Todos pueden ver sectores activos" ON sectores;
DROP POLICY IF EXISTS "Solo administradores pueden gestionar sectores" ON sectores;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver sectores" ON sectores;

CREATE POLICY "Usuarios autenticados pueden ver sectores"
  ON sectores FOR SELECT
  TO authenticated
  USING (activo = true);

CREATE POLICY "Solo administradores pueden gestionar sectores"
  ON sectores FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE auth_id = auth.uid() AND rol = 'administrador' AND activo = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE auth_id = auth.uid() AND rol = 'administrador' AND activo = true
    )
  );

-- Políticas para novedades
DROP POLICY IF EXISTS "Todos pueden ver novedades" ON novedades;
DROP POLICY IF EXISTS "Todos pueden crear novedades" ON novedades;
DROP POLICY IF EXISTS "Todos pueden actualizar novedades" ON novedades;
DROP POLICY IF EXISTS "Solo administradores pueden eliminar novedades" ON novedades;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver novedades" ON novedades;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear novedades" ON novedades;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar novedades" ON novedades;

CREATE POLICY "Usuarios autenticados pueden ver novedades"
  ON novedades FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear novedades"
  ON novedades FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE auth_id = auth.uid() AND id = creado_por_id
    )
  );

CREATE POLICY "Usuarios autenticados pueden actualizar novedades"
  ON novedades FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Solo administradores pueden eliminar novedades"
  ON novedades FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE auth_id = auth.uid() AND rol = 'administrador' AND activo = true
    )
  );

-- Políticas para comentarios
DROP POLICY IF EXISTS "Todos pueden ver comentarios" ON comentarios;
DROP POLICY IF EXISTS "Todos pueden crear comentarios" ON comentarios;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver comentarios" ON comentarios;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear comentarios" ON comentarios;

CREATE POLICY "Usuarios autenticados pueden ver comentarios"
  ON comentarios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear comentarios"
  ON comentarios FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE auth_id = auth.uid() AND id = autor_id
    )
  );

-- Políticas para proyectos
DROP POLICY IF EXISTS "Usuarios pueden ver sus proyectos" ON proyectos;
DROP POLICY IF EXISTS "Administradores pueden gestionar todos los proyectos" ON proyectos;
DROP POLICY IF EXISTS "Solo administradores pueden crear proyectos" ON proyectos;
DROP POLICY IF EXISTS "Solo administradores pueden actualizar proyectos" ON proyectos;
DROP POLICY IF EXISTS "Solo administradores pueden eliminar proyectos" ON proyectos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver proyectos" ON proyectos;

CREATE POLICY "Usuarios autenticados pueden ver proyectos"
  ON proyectos FOR SELECT
  TO authenticated
  USING (activo = true);

CREATE POLICY "Solo administradores pueden crear proyectos"
  ON proyectos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE auth_id = auth.uid() AND rol = 'administrador' AND activo = true
    )
  );

CREATE POLICY "Solo administradores pueden actualizar proyectos"
  ON proyectos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE auth_id = auth.uid() AND rol = 'administrador' AND activo = true
    )
  );

CREATE POLICY "Solo administradores pueden eliminar proyectos"
  ON proyectos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE auth_id = auth.uid() AND rol = 'administrador' AND activo = true
    )
  );

-- Políticas para usuario_sectores
DROP POLICY IF EXISTS "Usuarios pueden ver sus sectores" ON usuario_sectores;
DROP POLICY IF EXISTS "Solo administradores pueden gestionar asignaciones de sectores" ON usuario_sectores;
DROP POLICY IF EXISTS "Usuarios pueden ver asignaciones de sectores" ON usuario_sectores;
DROP POLICY IF EXISTS "Solo administradores pueden gestionar asignaciones" ON usuario_sectores;

CREATE POLICY "Usuarios pueden ver asignaciones de sectores"
  ON usuario_sectores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Solo administradores pueden gestionar asignaciones"
  ON usuario_sectores FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE auth_id = auth.uid() AND rol = 'administrador' AND activo = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE auth_id = auth.uid() AND rol = 'administrador' AND activo = true
    )
  );

-- Políticas para usuario_proyectos
DROP POLICY IF EXISTS "Usuarios pueden ver sus proyectos asignados" ON usuario_proyectos;
DROP POLICY IF EXISTS "Solo administradores pueden gestionar asignaciones de proyectos" ON usuario_proyectos;
DROP POLICY IF EXISTS "Usuarios pueden ver asignaciones de proyectos" ON usuario_proyectos;

CREATE POLICY "Usuarios pueden ver asignaciones de proyectos"
  ON usuario_proyectos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Solo administradores pueden gestionar asignaciones de proyectos"
  ON usuario_proyectos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE auth_id = auth.uid() AND rol = 'administrador' AND activo = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE auth_id = auth.uid() AND rol = 'administrador' AND activo = true
    )
  );

-- Políticas para tableros
DROP POLICY IF EXISTS "Usuarios pueden ver tableros de sus proyectos" ON tableros;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver tableros" ON tableros;
DROP POLICY IF EXISTS "Usuarios pueden crear tableros en sus proyectos" ON tableros;
DROP POLICY IF EXISTS "Usuarios pueden modificar tableros de sus proyectos" ON tableros;
DROP POLICY IF EXISTS "Solo administradores pueden eliminar tableros" ON tableros;
DROP POLICY IF EXISTS "Admin puede insertar tablero" ON tableros;
DROP POLICY IF EXISTS "Admins can delete any tablero" ON tableros;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear tableros" ON tableros;
DROP POLICY IF EXISTS "Usuarios pueden actualizar tableros" ON tableros;

CREATE POLICY "Usuarios autenticados pueden ver tableros"
  ON tableros FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear tableros"
  ON tableros FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE auth_id = auth.uid() AND id = creado_por_id
    )
  );

CREATE POLICY "Usuarios pueden actualizar tableros"
  ON tableros FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Solo administradores pueden eliminar tableros"
  ON tableros FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE auth_id = auth.uid() AND rol = 'administrador' AND activo = true
    )
  );

-- Políticas para listas
DROP POLICY IF EXISTS "Usuarios pueden ver listas de sus tableros" ON listas;
DROP POLICY IF EXISTS "Usuarios pueden gestionar listas de sus tableros" ON listas;
DROP POLICY IF EXISTS "Admin can delete lists" ON listas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver listas" ON listas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear listas" ON listas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar listas" ON listas;
DROP POLICY IF EXISTS "Solo administradores pueden eliminar listas" ON listas;

CREATE POLICY "Usuarios autenticados pueden ver listas"
  ON listas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear listas"
  ON listas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar listas"
  ON listas FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Solo administradores pueden eliminar listas"
  ON listas FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE auth_id = auth.uid() AND rol = 'administrador' AND activo = true
    )
  );

-- Políticas para tarjetas
DROP POLICY IF EXISTS "Usuarios pueden ver tarjetas de sus tableros" ON tarjetas;
DROP POLICY IF EXISTS "Usuarios pueden crear tarjetas en sus tableros" ON tarjetas;
DROP POLICY IF EXISTS "Usuarios pueden actualizar tarjetas de sus tableros" ON tarjetas;
DROP POLICY IF EXISTS "Admin can delete cards" ON tarjetas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver tarjetas" ON tarjetas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear tarjetas" ON tarjetas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar tarjetas" ON tarjetas;
DROP POLICY IF EXISTS "Solo administradores pueden eliminar tarjetas" ON tarjetas;

CREATE POLICY "Usuarios autenticados pueden ver tarjetas"
  ON tarjetas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear tarjetas"
  ON tarjetas FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE auth_id = auth.uid() AND id = creado_por_id
    )
  );

CREATE POLICY "Usuarios autenticados pueden actualizar tarjetas"
  ON tarjetas FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Solo administradores pueden eliminar tarjetas"
  ON tarjetas FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE auth_id = auth.uid() AND rol = 'administrador' AND activo = true
    )
  );

-- Políticas para tarjeta_comentarios
DROP POLICY IF EXISTS "Usuarios pueden ver comentarios de tarjetas" ON tarjeta_comentarios;
DROP POLICY IF EXISTS "Usuarios pueden crear comentarios en tarjetas" ON tarjeta_comentarios;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver comentarios" ON tarjeta_comentarios;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear comentarios" ON tarjeta_comentarios;

CREATE POLICY "Usuarios autenticados pueden ver comentarios"
  ON tarjeta_comentarios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear comentarios"
  ON tarjeta_comentarios FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE auth_id = auth.uid() AND id = usuario_id
    )
  );

-- Políticas para tarjeta_adjuntos
DROP POLICY IF EXISTS "Usuarios pueden ver adjuntos de tarjetas" ON tarjeta_adjuntos;
DROP POLICY IF EXISTS "Usuarios pueden subir adjuntos a tarjetas" ON tarjeta_adjuntos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver adjuntos" ON tarjeta_adjuntos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden subir adjuntos" ON tarjeta_adjuntos;

CREATE POLICY "Usuarios autenticados pueden ver adjuntos"
  ON tarjeta_adjuntos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden subir adjuntos"
  ON tarjeta_adjuntos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE auth_id = auth.uid() AND id = usuario_id
    )
  );

-- Políticas para tarjeta_actividad
DROP POLICY IF EXISTS "Usuarios pueden ver actividad de tarjetas" ON tarjeta_actividad;
DROP POLICY IF EXISTS "Sistema puede crear actividad" ON tarjeta_actividad;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver actividad" ON tarjeta_actividad;

CREATE POLICY "Usuarios autenticados pueden ver actividad"
  ON tarjeta_actividad FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Sistema puede crear actividad"
  ON tarjeta_actividad FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Políticas para tarjeta_asignados
DROP POLICY IF EXISTS "Usuarios pueden ver asignados de tarjetas" ON tarjeta_asignados;
DROP POLICY IF EXISTS "Usuarios pueden gestionar asignados de tarjetas" ON tarjeta_asignados;

CREATE POLICY "Usuarios autenticados pueden ver asignados"
  ON tarjeta_asignados FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden gestionar asignados"
  ON tarjeta_asignados FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
