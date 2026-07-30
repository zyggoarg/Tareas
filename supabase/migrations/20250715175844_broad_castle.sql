/*
  # Crear sectores por defecto y ajustar políticas RLS

  1. Sectores por defecto
    - Operacional
    - Mantenimiento  
    - Seguridad
    - Personal
    - Sistemas
    - Calidad

  2. Políticas RLS
    - Permitir SELECT a usuarios anónimos para sectores activos
    - Mantener restricciones para INSERT/UPDATE/DELETE solo para administradores
*/

-- Crear sectores por defecto si no existen
INSERT INTO sectores (nombre, descripcion, activo) VALUES
  ('Operacional', 'Novedades relacionadas con operaciones diarias', true),
  ('Mantenimiento', 'Novedades sobre mantenimiento de equipos e instalaciones', true),
  ('Seguridad', 'Novedades relacionadas con seguridad laboral y protocolos', true),
  ('Personal', 'Novedades sobre recursos humanos y personal', true),
  ('Sistemas', 'Novedades sobre sistemas informáticos y tecnología', true),
  ('Calidad', 'Novedades relacionadas con control de calidad', true)
ON CONFLICT (nombre) DO NOTHING;

-- Eliminar política existente que puede estar causando problemas
DROP POLICY IF EXISTS "Todos pueden ver sectores activos" ON sectores;

-- Crear nueva política que permita a usuarios anónimos ver sectores activos
CREATE POLICY "Allow anon to read active sectors"
  ON sectores
  FOR SELECT
  TO anon, authenticated
  USING (activo = true);

-- Mantener política para administradores
CREATE POLICY "Only admins can manage sectors"
  ON sectores
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.rol = 'administrador' 
      AND usuarios.activo = true
    )
  );