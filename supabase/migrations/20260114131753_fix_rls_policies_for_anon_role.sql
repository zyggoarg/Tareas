/*
  # Corregir políticas RLS para rol anon

  1. Problema
    - El cliente usa ANON KEY sin Supabase Auth
    - Las políticas usan "TO authenticated" pero el rol es "anon"
    - Esto causa errores 401

  2. Solución
    - Cambiar todas las políticas a "TO anon" o "TO public"
    - Esto permite acceso con el ANON KEY
    - La seguridad se maneja en la capa de aplicación
*/

-- ===== TABLEROS =====
DROP POLICY IF EXISTS "Permitir lectura de tableros" ON tableros;
DROP POLICY IF EXISTS "Permitir inserción de tableros" ON tableros;
DROP POLICY IF EXISTS "Permitir actualización de tableros" ON tableros;
DROP POLICY IF EXISTS "Permitir eliminación de tableros" ON tableros;

CREATE POLICY "Permitir lectura de tableros"
  ON tableros FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserción de tableros"
  ON tableros FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir actualización de tableros"
  ON tableros FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación de tableros"
  ON tableros FOR DELETE
  USING (true);

-- ===== LISTAS =====
DROP POLICY IF EXISTS "Permitir lectura de listas" ON listas;
DROP POLICY IF EXISTS "Permitir inserción de listas" ON listas;
DROP POLICY IF EXISTS "Permitir actualización de listas" ON listas;
DROP POLICY IF EXISTS "Permitir eliminación de listas" ON listas;

CREATE POLICY "Permitir lectura de listas"
  ON listas FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserción de listas"
  ON listas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir actualización de listas"
  ON listas FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación de listas"
  ON listas FOR DELETE
  USING (true);

-- ===== TARJETAS =====
DROP POLICY IF EXISTS "Permitir lectura de tarjetas" ON tarjetas;
DROP POLICY IF EXISTS "Permitir inserción de tarjetas" ON tarjetas;
DROP POLICY IF EXISTS "Permitir actualización de tarjetas" ON tarjetas;
DROP POLICY IF EXISTS "Permitir eliminación de tarjetas" ON tarjetas;

CREATE POLICY "Permitir lectura de tarjetas"
  ON tarjetas FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserción de tarjetas"
  ON tarjetas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir actualización de tarjetas"
  ON tarjetas FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación de tarjetas"
  ON tarjetas FOR DELETE
  USING (true);

-- ===== TARJETA_ASIGNADOS =====
DROP POLICY IF EXISTS "Permitir lectura de asignaciones" ON tarjeta_asignados;
DROP POLICY IF EXISTS "Permitir inserción de asignaciones" ON tarjeta_asignados;
DROP POLICY IF EXISTS "Permitir eliminación de asignaciones" ON tarjeta_asignados;

CREATE POLICY "Permitir lectura de asignaciones"
  ON tarjeta_asignados FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserción de asignaciones"
  ON tarjeta_asignados FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación de asignaciones"
  ON tarjeta_asignados FOR DELETE
  USING (true);

-- ===== ETIQUETAS =====
DROP POLICY IF EXISTS "Permitir lectura de etiquetas" ON etiquetas;
DROP POLICY IF EXISTS "Permitir inserción de etiquetas" ON etiquetas;
DROP POLICY IF EXISTS "Permitir actualización de etiquetas" ON etiquetas;
DROP POLICY IF EXISTS "Permitir eliminación de etiquetas" ON etiquetas;

CREATE POLICY "Permitir lectura de etiquetas"
  ON etiquetas FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserción de etiquetas"
  ON etiquetas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir actualización de etiquetas"
  ON etiquetas FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación de etiquetas"
  ON etiquetas FOR DELETE
  USING (true);

-- ===== TARJETA_ETIQUETAS =====
DROP POLICY IF EXISTS "Permitir lectura de tarjeta_etiquetas" ON tarjeta_etiquetas;
DROP POLICY IF EXISTS "Permitir inserción de tarjeta_etiquetas" ON tarjeta_etiquetas;
DROP POLICY IF EXISTS "Permitir eliminación de tarjeta_etiquetas" ON tarjeta_etiquetas;

CREATE POLICY "Permitir lectura de tarjeta_etiquetas"
  ON tarjeta_etiquetas FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserción de tarjeta_etiquetas"
  ON tarjeta_etiquetas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación de tarjeta_etiquetas"
  ON tarjeta_etiquetas FOR DELETE
  USING (true);

-- ===== TARJETA_CHECKLIST =====
DROP POLICY IF EXISTS "Permitir lectura de checklist" ON tarjeta_checklist;
DROP POLICY IF EXISTS "Permitir inserción de checklist" ON tarjeta_checklist;
DROP POLICY IF EXISTS "Permitir actualización de checklist" ON tarjeta_checklist;
DROP POLICY IF EXISTS "Permitir eliminación de checklist" ON tarjeta_checklist;

CREATE POLICY "Permitir lectura de checklist"
  ON tarjeta_checklist FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserción de checklist"
  ON tarjeta_checklist FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir actualización de checklist"
  ON tarjeta_checklist FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación de checklist"
  ON tarjeta_checklist FOR DELETE
  USING (true);

-- ===== TARJETA_COMENTARIOS =====
DROP POLICY IF EXISTS "Permitir lectura de comentarios" ON tarjeta_comentarios;
DROP POLICY IF EXISTS "Permitir inserción de comentarios" ON tarjeta_comentarios;
DROP POLICY IF EXISTS "Permitir actualización de comentarios" ON tarjeta_comentarios;
DROP POLICY IF EXISTS "Permitir eliminación de comentarios" ON tarjeta_comentarios;

CREATE POLICY "Permitir lectura de comentarios"
  ON tarjeta_comentarios FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserción de comentarios"
  ON tarjeta_comentarios FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir actualización de comentarios"
  ON tarjeta_comentarios FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación de comentarios"
  ON tarjeta_comentarios FOR DELETE
  USING (true);

-- ===== TARJETA_ACTIVIDAD =====
DROP POLICY IF EXISTS "Permitir lectura de actividad" ON tarjeta_actividad;
DROP POLICY IF EXISTS "Permitir inserción de actividad" ON tarjeta_actividad;

CREATE POLICY "Permitir lectura de actividad"
  ON tarjeta_actividad FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserción de actividad"
  ON tarjeta_actividad FOR INSERT
  WITH CHECK (true);

-- ===== TARJETA_ADJUNTOS =====
DROP POLICY IF EXISTS "Permitir lectura de adjuntos" ON tarjeta_adjuntos;
DROP POLICY IF EXISTS "Permitir inserción de adjuntos" ON tarjeta_adjuntos;
DROP POLICY IF EXISTS "Permitir eliminación de adjuntos" ON tarjeta_adjuntos;

CREATE POLICY "Permitir lectura de adjuntos"
  ON tarjeta_adjuntos FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserción de adjuntos"
  ON tarjeta_adjuntos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación de adjuntos"
  ON tarjeta_adjuntos FOR DELETE
  USING (true);

-- ===== NOVEDAD_TARJETAS =====
DROP POLICY IF EXISTS "Permitir lectura de novedad_tarjetas" ON novedad_tarjetas;
DROP POLICY IF EXISTS "Permitir inserción de novedad_tarjetas" ON novedad_tarjetas;
DROP POLICY IF EXISTS "Permitir eliminación de novedad_tarjetas" ON novedad_tarjetas;

CREATE POLICY "Permitir lectura de novedad_tarjetas"
  ON novedad_tarjetas FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserción de novedad_tarjetas"
  ON novedad_tarjetas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación de novedad_tarjetas"
  ON novedad_tarjetas FOR DELETE
  USING (true);