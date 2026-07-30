/*
  # Add duracion field to tarjetas

  1. Changes
    - Add `duracion` column to `tarjetas` table
    - Duration in days (integer)
    - Optional field (nullable)
    - Useful for planning and Gantt view calculations

  2. Notes
    - If duration is set, can be used to calculate end date
    - Helps in resource planning and time estimation
*/

-- Add duracion column to tarjetas table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tarjetas' AND column_name = 'duracion'
  ) THEN
    ALTER TABLE tarjetas ADD COLUMN duracion integer;
  END IF;
END $$;
