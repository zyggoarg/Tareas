/*
  # Corregir política de INSERT de tableros

  1. Problema identificado
    - La política de INSERT para tableros tiene un error en la comparación
    - Compara `usuario_proyectos.proyecto_id = usuario_proyectos.proyecto_id`
    - Debería comparar con el proyecto_id del tablero que se está insertando

  2. Solución
    - Eliminar la política incorrecta
    - Crear una nueva política con la comparación correcta
*/

-- Eliminar política incorrecta
DROP POLICY IF EXISTS "Usuarios pueden crear tableros en sus proyectos" ON tableros;

-- Crear política correcta
CREATE POLICY "Usuarios pueden crear tableros en sus proyectos"
  ON tableros FOR INSERT
  TO authenticated
  WITH CHECK (
    creado_por_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM usuario_proyectos
      WHERE usuario_proyectos.usuario_id = auth.uid()
      AND usuario_proyectos.proyecto_id = tableros.proyecto_id
    )
  );