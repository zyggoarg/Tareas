/*
  # Agregar ID secuencial a novedades

  1. Cambios en la tabla
    - Agregar columna `numero_id` (integer, auto-incremento)
    - Crear secuencia para generar números consecutivos
    - Actualizar novedades existentes con números secuenciales

  2. Funcionalidad
    - Cada novedad tendrá un número único y consecutivo
    - Se mostrará en el formato "1. Título de la novedad"
    - Los números se asignan automáticamente al crear nuevas novedades
*/

-- Crear secuencia para los números de novedad
CREATE SEQUENCE IF NOT EXISTS novedad_numero_seq START 1;

-- Agregar columna numero_id a la tabla novedades
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'novedades' AND column_name = 'numero_id'
  ) THEN
    ALTER TABLE novedades ADD COLUMN numero_id integer;
  END IF;
END $$;

-- Asignar números secuenciales a las novedades existentes (ordenadas por fecha de creación)
DO $$
DECLARE
  novedad_record RECORD;
  contador integer := 1;
BEGIN
  FOR novedad_record IN 
    SELECT id FROM novedades ORDER BY created_at ASC
  LOOP
    UPDATE novedades 
    SET numero_id = contador 
    WHERE id = novedad_record.id;
    contador := contador + 1;
  END LOOP;
  
  -- Actualizar la secuencia para que continúe desde el siguiente número
  PERFORM setval('novedad_numero_seq', contador);
END $$;

-- Hacer que numero_id sea NOT NULL y tenga un valor por defecto
ALTER TABLE novedades ALTER COLUMN numero_id SET NOT NULL;
ALTER TABLE novedades ALTER COLUMN numero_id SET DEFAULT nextval('novedad_numero_seq');

-- Crear índice para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_novedades_numero_id ON novedades(numero_id);