/*
  # Agregar permisos de eliminación para administradores
  
  1. Cambios en políticas
    - Actualizar políticas de UPDATE y DELETE para tableros, listas y tarjetas
    - Permitir que administradores puedan actualizar y eliminar cualquier tablero, lista o tarjeta
    - Mantener permisos existentes para creadores
  
  2. Seguridad
    - Solo usuarios con rol 'administrador' pueden eliminar/actualizar elementos de otros usuarios
    - Los creadores mantienen su capacidad de actualizar/eliminar sus propios elementos
*/

-- Drop y recrear políticas para tableros
DROP POLICY IF EXISTS "Creadores pueden actualizar sus tableros" ON tableros;
DROP POLICY IF EXISTS "Creadores pueden eliminar sus tableros" ON tableros;

-- Política UPDATE para tableros: creadores o administradores
CREATE POLICY "Creadores y administradores pueden actualizar tableros"
  ON tableros FOR UPDATE
  TO authenticated
  USING (
    creado_por_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.rol = 'administrador' 
      AND usuarios.activo = true
    )
  )
  WITH CHECK (
    creado_por_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.rol = 'administrador' 
      AND usuarios.activo = true
    )
  );

-- Política DELETE para tableros: creadores o administradores
CREATE POLICY "Creadores y administradores pueden eliminar tableros"
  ON tableros FOR DELETE
  TO authenticated
  USING (
    creado_por_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.rol = 'administrador' 
      AND usuarios.activo = true
    )
  );

-- Drop y recrear políticas para listas
DROP POLICY IF EXISTS "Usuarios pueden actualizar listas de tableros accesibles" ON listas;
DROP POLICY IF EXISTS "Creadores pueden eliminar sus listas" ON listas;

-- Política UPDATE para listas: usuarios del proyecto o administradores
CREATE POLICY "Usuarios y administradores pueden actualizar listas"
  ON listas FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tableros
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE tableros.id = listas.tablero_id
      AND tableros.activo = true
      AND usuario_proyectos.usuario_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.rol = 'administrador' 
      AND usuarios.activo = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tableros
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE tableros.id = listas.tablero_id
      AND tableros.activo = true
      AND usuario_proyectos.usuario_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.rol = 'administrador' 
      AND usuarios.activo = true
    )
  );

-- Política DELETE para listas: usuarios del proyecto o administradores
CREATE POLICY "Usuarios y administradores pueden eliminar listas"
  ON listas FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tableros
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE tableros.id = listas.tablero_id
      AND tableros.activo = true
      AND usuario_proyectos.usuario_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.rol = 'administrador' 
      AND usuarios.activo = true
    )
  );

-- Drop y recrear políticas para tarjetas
DROP POLICY IF EXISTS "Usuarios pueden actualizar tarjetas de tableros accesibles" ON tarjetas;
DROP POLICY IF EXISTS "Creadores pueden eliminar sus tarjetas" ON tarjetas;

-- Política UPDATE para tarjetas: usuarios del proyecto o administradores
CREATE POLICY "Usuarios y administradores pueden actualizar tarjetas"
  ON tarjetas FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listas
      JOIN tableros ON tableros.id = listas.tablero_id
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE listas.id = tarjetas.lista_id
      AND tableros.activo = true
      AND usuario_proyectos.usuario_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.rol = 'administrador' 
      AND usuarios.activo = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listas
      JOIN tableros ON tableros.id = listas.tablero_id
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE listas.id = tarjetas.lista_id
      AND tableros.activo = true
      AND usuario_proyectos.usuario_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.rol = 'administrador' 
      AND usuarios.activo = true
    )
  );

-- Política DELETE para tarjetas: creadores o administradores
CREATE POLICY "Creadores y administradores pueden eliminar tarjetas"
  ON tarjetas FOR DELETE
  TO authenticated
  USING (
    creado_por_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.rol = 'administrador' 
      AND usuarios.activo = true
    )
  );