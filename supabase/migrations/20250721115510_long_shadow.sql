/*
  # Fix RLS policies for lecturas table

  1. Security Changes
    - Drop existing restrictive policies
    - Create new policies allowing anon role access
    - Enable INSERT and SELECT for anon users
    
  2. Policy Details
    - INSERT policy: Allow anon users to insert lecturas
    - SELECT policy: Allow anon users to read lecturas
    - Uses 'true' condition for maximum compatibility
*/

-- Drop existing policies that are causing issues
DROP POLICY IF EXISTS "Allow authenticated users to insert lecturas" ON lecturas;
DROP POLICY IF EXISTS "Allow authenticated users to read lecturas" ON lecturas;

-- Create new policies for anon role
CREATE POLICY "Allow anon users to insert lecturas"
  ON lecturas
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon users to read lecturas"
  ON lecturas
  FOR SELECT
  TO anon
  USING (true);

-- Also allow authenticated users
CREATE POLICY "Allow authenticated users to insert lecturas"
  ON lecturas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read lecturas"
  ON lecturas
  FOR SELECT
  TO authenticated
  USING (true);