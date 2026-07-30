/*
  # Corrección de políticas RLS para colaboración en tarjetas

  1. Problema identificado
    - Las políticas RLS usaban sintaxis compleja innecesaria
    - auth.uid() devuelve directamente el ID de la tabla usuarios
    - Las políticas estaban usando subconsultas innecesarias

  2. Solución
    - Reemplazar políticas con sintaxis simplificada
    - Usar auth.uid() directamente sin subconsultas
    - Mantener la misma lógica de seguridad
*/

-- Eliminar políticas antiguas de tarjeta_comentarios
DROP POLICY IF EXISTS "Usuarios ven comentarios de tarjetas accesibles" ON tarjeta_comentarios;
DROP POLICY IF EXISTS "Usuarios crean comentarios en tarjetas accesibles" ON tarjeta_comentarios;
DROP POLICY IF EXISTS "Usuarios actualizan sus comentarios" ON tarjeta_comentarios;
DROP POLICY IF EXISTS "Usuarios eliminan sus comentarios" ON tarjeta_comentarios;

-- Crear políticas correctas para tarjeta_comentarios
CREATE POLICY "Ver comentarios de tarjetas accesibles"
  ON tarjeta_comentarios FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tarjetas t
      JOIN listas l ON l.id = t.lista_id
      JOIN tableros tb ON tb.id = l.tablero_id
      JOIN usuario_proyectos up ON up.proyecto_id = tb.proyecto_id
      WHERE t.id = tarjeta_comentarios.tarjeta_id
      AND up.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Crear comentarios en tarjetas accesibles"
  ON tarjeta_comentarios FOR INSERT
  TO authenticated
  WITH CHECK (
    usuario_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM tarjetas t
      JOIN listas l ON l.id = t.lista_id
      JOIN tableros tb ON tb.id = l.tablero_id
      JOIN usuario_proyectos up ON up.proyecto_id = tb.proyecto_id
      WHERE t.id = tarjeta_id
      AND up.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Actualizar comentarios propios"
  ON tarjeta_comentarios FOR UPDATE
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Eliminar comentarios propios"
  ON tarjeta_comentarios FOR DELETE
  TO authenticated
  USING (usuario_id = auth.uid());

-- Eliminar políticas antiguas de tarjeta_actividad
DROP POLICY IF EXISTS "Ver actividad de tarjetas accesibles" ON tarjeta_actividad;
DROP POLICY IF EXISTS "Crear registros de actividad" ON tarjeta_actividad;

-- Crear políticas correctas para tarjeta_actividad
CREATE POLICY "Ver actividad de tarjetas accesibles"
  ON tarjeta_actividad FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tarjetas t
      JOIN listas l ON l.id = t.lista_id
      JOIN tableros tb ON tb.id = l.tablero_id
      JOIN usuario_proyectos up ON up.proyecto_id = tb.proyecto_id
      WHERE t.id = tarjeta_actividad.tarjeta_id
      AND up.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Registrar actividad en tarjetas accesibles"
  ON tarjeta_actividad FOR INSERT
  TO authenticated
  WITH CHECK (
    usuario_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM tarjetas t
      JOIN listas l ON l.id = t.lista_id
      JOIN tableros tb ON tb.id = l.tablero_id
      JOIN usuario_proyectos up ON up.proyecto_id = tb.proyecto_id
      WHERE t.id = tarjeta_id
      AND up.usuario_id = auth.uid()
    )
  );

-- Eliminar políticas antiguas de tarjeta_adjuntos
DROP POLICY IF EXISTS "Ver adjuntos de tarjetas accesibles" ON tarjeta_adjuntos;
DROP POLICY IF EXISTS "Subir adjuntos a tarjetas accesibles" ON tarjeta_adjuntos;
DROP POLICY IF EXISTS "Eliminar adjuntos propios" ON tarjeta_adjuntos;

-- Crear políticas correctas para tarjeta_adjuntos
CREATE POLICY "Ver adjuntos de tarjetas accesibles"
  ON tarjeta_adjuntos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tarjetas t
      JOIN listas l ON l.id = t.lista_id
      JOIN tableros tb ON tb.id = l.tablero_id
      JOIN usuario_proyectos up ON up.proyecto_id = tb.proyecto_id
      WHERE t.id = tarjeta_adjuntos.tarjeta_id
      AND up.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Subir adjuntos a tarjetas accesibles"
  ON tarjeta_adjuntos FOR INSERT
  TO authenticated
  WITH CHECK (
    usuario_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM tarjetas t
      JOIN listas l ON l.id = t.lista_id
      JOIN tableros tb ON tb.id = l.tablero_id
      JOIN usuario_proyectos up ON up.proyecto_id = tb.proyecto_id
      WHERE t.id = tarjeta_id
      AND up.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Eliminar adjuntos propios"
  ON tarjeta_adjuntos FOR DELETE
  TO authenticated
  USING (usuario_id = auth.uid());

-- Eliminar políticas antiguas de novedad_tarjetas
DROP POLICY IF EXISTS "Ver vinculaciones accesibles" ON novedad_tarjetas;
DROP POLICY IF EXISTS "Crear vinculaciones" ON novedad_tarjetas;
DROP POLICY IF EXISTS "Eliminar vinculaciones propias" ON novedad_tarjetas;

-- Crear políticas correctas para novedad_tarjetas
CREATE POLICY "Ver vinculaciones accesibles"
  ON novedad_tarjetas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM novedades n
      JOIN proyectos p ON p.id = n.proyecto_id
      JOIN usuario_proyectos up ON up.proyecto_id = p.id
      WHERE n.id = novedad_tarjetas.novedad_id
      AND up.usuario_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM tarjetas t
      JOIN listas l ON l.id = t.lista_id
      JOIN tableros tb ON tb.id = l.tablero_id
      JOIN usuario_proyectos up ON up.proyecto_id = tb.proyecto_id
      WHERE t.id = novedad_tarjetas.tarjeta_id
      AND up.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Crear vinculaciones"
  ON novedad_tarjetas FOR INSERT
  TO authenticated
  WITH CHECK (
    creado_por_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM novedades n
      JOIN proyectos p ON p.id = n.proyecto_id
      JOIN usuario_proyectos up ON up.proyecto_id = p.id
      WHERE n.id = novedad_id
      AND up.usuario_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM tarjetas t
      JOIN listas l ON l.id = t.lista_id
      JOIN tableros tb ON tb.id = l.tablero_id
      JOIN usuario_proyectos up ON up.proyecto_id = tb.proyecto_id
      WHERE t.id = tarjeta_id
      AND up.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Eliminar vinculaciones propias"
  ON novedad_tarjetas FOR DELETE
  TO authenticated
  USING (creado_por_id = auth.uid());