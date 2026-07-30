/*
  # Eliminar campo leido_por de tabla novedades

  1. Cambios en tabla novedades
    - Eliminar columna `leido_por_id` (ya no se usa)
    - Eliminar columna `fecha_lectura` (ya no se usa)
    - La información de lecturas ahora está en la tabla `lecturas`

  2. Justificación
    - El campo `leido_por_id` solo podía almacenar UNA lectura
    - La tabla `lecturas` permite múltiples lecturas por novedad
    - Elimina redundancia y mejora la consistencia de datos
*/

-- Eliminar columnas que ya no se usan
DO $$
BEGIN
  -- Eliminar columna leido_por_id si existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'novedades' AND column_name = 'leido_por_id'
  ) THEN
    ALTER TABLE novedades DROP COLUMN leido_por_id;
  END IF;

  -- Eliminar columna fecha_lectura si existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'novedades' AND column_name = 'fecha_lectura'
  ) THEN
    ALTER TABLE novedades DROP COLUMN fecha_lectura;
  END IF;
END $$;