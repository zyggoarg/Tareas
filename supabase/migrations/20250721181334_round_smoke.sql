/*
  # Add archived state to novedades

  1. Changes
    - Update novedades table constraint to include 'archivada' state
    - Archived news will not count in any dashboard cards
    - Only administrators can archive news

  2. Security
    - No changes to RLS policies needed
    - Archive functionality will be controlled at application level
*/

-- Update the constraint to include 'archivada' state
ALTER TABLE novedades DROP CONSTRAINT IF EXISTS novedades_estado_check;

ALTER TABLE novedades ADD CONSTRAINT novedades_estado_check 
CHECK ((estado = ANY (ARRAY['nueva'::text, 'leida'::text, 'respondida'::text, 'archivada'::text])));