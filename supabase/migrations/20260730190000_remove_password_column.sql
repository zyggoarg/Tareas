/*
  # Eliminar columna de contraseña de la tabla pública de usuarios

  ## Descripción
  Esta migración elimina el campo `contraseña` de la tabla `usuarios` ya que
  las contraseñas deben ser gestionadas exclusivamente por Supabase Auth (auth.users).

  ## Cambios realizados
  1. Se elimina la columna `contraseña` de la tabla `usuarios`
  2. Se actualiza la política de acceso anónimo para que no permita UPDATE
     (el vínculo auth_id se gestiona ahora desde el edge function con service role)

  ## Pre-requisito
  Antes de ejecutar esta migración, todos los usuarios activos deben tener
  una cuenta en auth.users (campo auth_id NOT NULL). Los usuarios sin auth_id
  quedaron en estado de "contraseña pendiente de restablecimiento" y deben
  ser gestionados por un administrador desde el panel de usuarios.

  ## Seguridad
  - Las contraseñas dejan de estar en la tabla pública
  - La autenticación pasa a depender exclusivamente de Supabase Auth
  - Los edge functions usan SUPABASE_SERVICE_ROLE_KEY para operaciones admin
*/

-- Eliminar la columna de contraseña de la tabla pública
ALTER TABLE usuarios DROP COLUMN IF EXISTS contraseña;

-- Eliminar la política permisiva que permitía UPDATE anónimo para vincular auth_id
-- (esto ya no es necesario: la vinculación se hace en el edge function crear-usuario)
DROP POLICY IF EXISTS "Permitir vincular auth_id" ON usuarios;

-- La nueva política de SELECT para anon sólo sirve para mostrar la pantalla de login
-- (no necesita UPDATE, el auth_id se asigna solo por edge functions con service role)
