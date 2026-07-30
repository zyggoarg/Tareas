/*
  # Add fecha_inicio to tarjetas for Gantt view

  1. Changes
    - Add `fecha_inicio` column to `tarjetas` table
    - This allows tasks to have a start date separate from creation date
    - Useful for Gantt chart timeline visualization

  2. Notes
    - fecha_inicio is optional (can be NULL)
    - If not set, fecha_creacion will be used as start date in Gantt view
*/

-- Add fecha_inicio column to tarjetas table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tarjetas' AND column_name = 'fecha_inicio'
  ) THEN
    ALTER TABLE tarjetas ADD COLUMN fecha_inicio timestamptz;
  END IF;
END $$;
