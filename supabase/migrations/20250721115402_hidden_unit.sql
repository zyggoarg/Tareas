/*
  # Fix RLS policies for lecturas table

  1. Security Changes
    - Drop existing restrictive policies
    - Create new policies that allow authenticated users to insert and read lecturas
    - Ensure users can only insert their own lecturas but can read all lecturas

  2. Policies
    - INSERT: Allow authenticated users to insert their own lecturas
    - SELECT: Allow authenticated users to read all lecturas
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own lecturas" ON lecturas;
DROP POLICY IF EXISTS "Users can read all lecturas" ON lecturas;

-- Create new INSERT policy for authenticated users
CREATE POLICY "Allow authenticated users to insert lecturas"
  ON lecturas
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create new SELECT policy for authenticated users  
CREATE POLICY "Allow authenticated users to read lecturas"
  ON lecturas
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);