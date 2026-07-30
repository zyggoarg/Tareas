/*
  # Add photo URL to users table

  1. Changes
    - Add `photo_url` column to `usuarios` table for profile pictures
    - Column is optional (nullable) and stores the URL/path to the user's profile photo

  2. Notes
    - Existing users will have NULL photo_url by default
    - No default value set to allow users without photos
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'photo_url'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN photo_url text;
  END IF;
END $$;
