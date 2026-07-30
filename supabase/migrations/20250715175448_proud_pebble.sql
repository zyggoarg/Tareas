/*
  # Fix initial user creation policy

  1. Changes
    - Add policy to allow initial user creation when no users exist
    - This allows the system to create the first administrator user

  2. Security
    - Policy only allows insertion when the usuarios table is empty
    - Maintains security after the first user is created
*/

-- Create a policy that allows inserting the first user when the table is empty
CREATE POLICY "Allow initial user creation when table is empty"
  ON usuarios
  FOR INSERT
  TO anon
  WITH CHECK (
    NOT EXISTS (SELECT 1 FROM usuarios LIMIT 1)
  );