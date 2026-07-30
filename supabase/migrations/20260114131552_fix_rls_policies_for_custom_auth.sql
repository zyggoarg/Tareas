/*
  # Ajustar políticas RLS para autenticación personalizada

  1. Problema Identificado
    - El sistema usa autenticación personalizada (tabla usuarios)
    - No usa Supabase Auth (auth.users)
    - Las políticas RLS con `auth.uid()` siempre devuelven NULL
    - Esto causa errores 401 en todas las consultas

  2. Solución
    - Mantener RLS habilitado para seguridad básica
    - Usar políticas que permitan acceso a usuarios autenticados via anon key
    - La seguridad se maneja en la capa de aplicación

  NOTA: Para mayor seguridad, se recomienda migrar a Supabase Auth en el futuro
*/

-- ===== TABLEROS =====
DROP POLICY IF EXISTS "Usuarios pueden ver tableros de sus proyectos" ON tableros;
DROP POLICY IF EXISTS "Usuarios pueden crear tableros en sus proyectos" ON tableros;
DROP POLICY IF EXISTS "Creadores pueden actualizar sus tableros" ON tableros;
DROP POLICY IF EXISTS "Creadores pueden eliminar sus tableros" ON tableros;

CREATE POLICY "Permitir lectura de tableros"
  ON tableros FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Permitir inserción de tableros"
  ON tableros FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir actualización de tableros"
  ON tableros FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación de tableros"
  ON tableros FOR DELETE
  TO authenticated
  USING (true);

-- ===== LISTAS =====
DROP POLICY IF EXISTS "Usuarios pueden ver listas de tableros con acceso" ON listas;
DROP POLICY IF EXISTS "Usuarios pueden crear listas en tableros con acceso" ON listas;
DROP POLICY IF EXISTS "Usuarios pueden actualizar listas" ON listas;
DROP POLICY IF EXISTS "Usuarios pueden eliminar listas" ON listas;

CREATE POLICY "Permitir lectura de listas"
  ON listas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Permitir inserción de listas"
  ON listas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir actualización de listas"
  ON listas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación de listas"
  ON listas FOR DELETE
  TO authenticated
  USING (true);

-- ===== TARJETAS =====
DROP POLICY IF EXISTS "Usuarios pueden ver tarjetas" ON tarjetas;
DROP POLICY IF EXISTS "Usuarios pueden crear tarjetas" ON tarjetas;
DROP POLICY IF EXISTS "Usuarios pueden actualizar tarjetas" ON tarjetas;
DROP POLICY IF EXISTS "Usuarios pueden eliminar tarjetas" ON tarjetas;

CREATE POLICY "Permitir lectura de tarjetas"
  ON tarjetas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Permitir inserción de tarjetas"
  ON tarjetas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir actualización de tarjetas"
  ON tarjetas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación de tarjetas"
  ON tarjetas FOR DELETE
  TO authenticated
  USING (true);

-- ===== TARJETA_ASIGNADOS =====
DROP POLICY IF EXISTS "Usuarios pueden ver asignaciones" ON tarjeta_asignados;
DROP POLICY IF EXISTS "Usuarios pueden crear asignaciones" ON tarjeta_asignados;
DROP POLICY IF EXISTS "Usuarios pueden eliminar asignaciones" ON tarjeta_asignados;

CREATE POLICY "Permitir lectura de asignaciones"
  ON tarjeta_asignados FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Permitir inserción de asignaciones"
  ON tarjeta_asignados FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación de asignaciones"
  ON tarjeta_asignados FOR DELETE
  TO authenticated
  USING (true);

-- ===== ETIQUETAS =====
DROP POLICY IF EXISTS "Usuarios pueden ver etiquetas" ON etiquetas;
DROP POLICY IF EXISTS "Usuarios pueden crear etiquetas" ON etiquetas;
DROP POLICY IF EXISTS "Usuarios pueden actualizar etiquetas" ON etiquetas;
DROP POLICY IF EXISTS "Usuarios pueden eliminar etiquetas" ON etiquetas;

CREATE POLICY "Permitir lectura de etiquetas"
  ON etiquetas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Permitir inserción de etiquetas"
  ON etiquetas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir actualización de etiquetas"
  ON etiquetas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación de etiquetas"
  ON etiquetas FOR DELETE
  TO authenticated
  USING (true);

-- ===== TARJETA_ETIQUETAS =====
DROP POLICY IF EXISTS "Usuarios pueden ver etiquetas de tarjetas" ON tarjeta_etiquetas;
DROP POLICY IF EXISTS "Usuarios pueden asignar etiquetas" ON tarjeta_etiquetas;
DROP POLICY IF EXISTS "Usuarios pueden eliminar etiquetas de tarjetas" ON tarjeta_etiquetas;

CREATE POLICY "Permitir lectura de tarjeta_etiquetas"
  ON tarjeta_etiquetas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Permitir inserción de tarjeta_etiquetas"
  ON tarjeta_etiquetas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación de tarjeta_etiquetas"
  ON tarjeta_etiquetas FOR DELETE
  TO authenticated
  USING (true);

-- ===== TARJETA_CHECKLIST =====
DROP POLICY IF EXISTS "Usuarios pueden ver checklist" ON tarjeta_checklist;
DROP POLICY IF EXISTS "Usuarios pueden crear items de checklist" ON tarjeta_checklist;
DROP POLICY IF EXISTS "Usuarios pueden actualizar items de checklist" ON tarjeta_checklist;
DROP POLICY IF EXISTS "Usuarios pueden eliminar items de checklist" ON tarjeta_checklist;

CREATE POLICY "Permitir lectura de checklist"
  ON tarjeta_checklist FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Permitir inserción de checklist"
  ON tarjeta_checklist FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir actualización de checklist"
  ON tarjeta_checklist FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación de checklist"
  ON tarjeta_checklist FOR DELETE
  TO authenticated
  USING (true);

-- ===== TARJETA_COMENTARIOS =====
DROP POLICY IF EXISTS "Usuarios pueden ver comentarios" ON tarjeta_comentarios;
DROP POLICY IF EXISTS "Usuarios pueden crear comentarios" ON tarjeta_comentarios;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus comentarios" ON tarjeta_comentarios;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus comentarios" ON tarjeta_comentarios;

CREATE POLICY "Permitir lectura de comentarios"
  ON tarjeta_comentarios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Permitir inserción de comentarios"
  ON tarjeta_comentarios FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir actualización de comentarios"
  ON tarjeta_comentarios FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación de comentarios"
  ON tarjeta_comentarios FOR DELETE
  TO authenticated
  USING (true);

-- ===== TARJETA_ACTIVIDAD =====
DROP POLICY IF EXISTS "Usuarios pueden ver actividad" ON tarjeta_actividad;
DROP POLICY IF EXISTS "Usuarios pueden registrar actividad" ON tarjeta_actividad;

CREATE POLICY "Permitir lectura de actividad"
  ON tarjeta_actividad FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Permitir inserción de actividad"
  ON tarjeta_actividad FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ===== TARJETA_ADJUNTOS =====
DROP POLICY IF EXISTS "Usuarios pueden ver adjuntos" ON tarjeta_adjuntos;
DROP POLICY IF EXISTS "Usuarios pueden subir adjuntos" ON tarjeta_adjuntos;
DROP POLICY IF EXISTS "Usuarios pueden eliminar adjuntos" ON tarjeta_adjuntos;

CREATE POLICY "Permitir lectura de adjuntos"
  ON tarjeta_adjuntos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Permitir inserción de adjuntos"
  ON tarjeta_adjuntos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación de adjuntos"
  ON tarjeta_adjuntos FOR DELETE
  TO authenticated
  USING (true);

-- ===== NOVEDAD_TARJETAS =====
DROP POLICY IF EXISTS "Usuarios pueden ver vinculaciones" ON novedad_tarjetas;
DROP POLICY IF EXISTS "Usuarios pueden vincular novedades" ON novedad_tarjetas;
DROP POLICY IF EXISTS "Usuarios pueden desvincular novedades" ON novedad_tarjetas;

CREATE POLICY "Permitir lectura de novedad_tarjetas"
  ON novedad_tarjetas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Permitir inserción de novedad_tarjetas"
  ON novedad_tarjetas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación de novedad_tarjetas"
  ON novedad_tarjetas FOR DELETE
  TO authenticated
  USING (true);