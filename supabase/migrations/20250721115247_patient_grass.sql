/*
  # Fix RLS policy for lecturas table

  1. Security Changes
    - Drop existing restrictive INSERT policy
    - Create new INSERT policy allowing users to insert their own readings
    - Ensure users can only insert records with their own usuario_id

  2. Policy Details
    - INSERT policy: Users can insert lecturas where usuario_id matches their auth.uid()
    - This allows authenticated users to mark novedades as read
*/

-- Drop existing restrictive INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert their own lecturas" ON lecturas;

-- Create new INSERT policy that allows users to insert their own readings
CREATE POLICY "Users can insert their own lecturas"
  ON lecturas
  FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

-- Ensure the SELECT policy exists for reading lecturas
DROP POLICY IF EXISTS "Users can read all lecturas" ON lecturas;
CREATE POLICY "Users can read all lecturas"
  ON lecturas
  FOR SELECT
  TO authenticated
  USING (true);