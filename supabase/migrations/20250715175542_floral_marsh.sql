/*
  # Corregir políticas RLS para permitir creación inicial de usuarios

  1. Políticas actualizadas
    - Permitir SELECT a rol anon para verificar si existen usuarios
    - Permitir INSERT a rol anon solo cuando la tabla está vacía
    - Mantener políticas existentes para usuarios autenticados

  2. Seguridad
    - Solo permite inserción inicial cuando no hay usuarios
    - Después del primer usuario, solo administradores pueden crear usuarios
*/

-- Eliminar políticas existentes que puedan estar causando conflictos
DROP POLICY IF EXISTS "Allow initial user creation when table is empty" ON usuarios;
DROP POLICY IF EXISTS "Usuarios pueden ver todos los usuarios activos" ON usuarios;

-- Política para permitir SELECT a usuarios anónimos (necesario para verificar si la tabla está vacía)
CREATE POLICY "Allow anon to check if users exist"
  ON usuarios
  FOR SELECT
  TO anon
  USING (true);

-- Política para permitir SELECT a usuarios autenticados
CREATE POLICY "Allow authenticated users to view active users"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (activo = true);

-- Política para permitir INSERT a usuarios anónimos solo cuando la tabla está vacía
CREATE POLICY "Allow anon to insert first user when table is empty"
  ON usuarios
  FOR INSERT
  TO anon
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM usuarios LIMIT 1
    )
  );

-- Mantener política existente para que administradores puedan insertar usuarios
-- (esta debería existir ya, pero la recreamos por si acaso)
DROP POLICY IF EXISTS "Solo administradores pueden insertar usuarios" ON usuarios;
CREATE POLICY "Allow admins to insert users"
  ON usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND rol = 'administrador' 
      AND activo = true
    )
  );