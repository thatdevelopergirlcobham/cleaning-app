-- 🚨 RUN THIS IN SUPABASE SQL EDITOR NOW! 🚨
-- This fixes the loading issue by setting up proper RLS policies

-- Step 1: Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies
DROP POLICY IF EXISTS "Anyone can view reports" ON reports;
DROP POLICY IF EXISTS "Public can view reports" ON reports;
DROP POLICY IF EXISTS "Enable read access for all users" ON reports;
DROP POLICY IF EXISTS "Authenticated users can insert reports" ON reports;
DROP POLICY IF EXISTS "Users can update own reports" ON reports;
DROP POLICY IF EXISTS "Users can delete own reports" ON reports;

-- Step 3: Create NEW policies

-- CRITICAL: Allow EVERYONE to SELECT/READ reports (this fixes the loading issue!)
CREATE POLICY "Enable read access for all users"
ON reports FOR SELECT
USING (true);

-- Allow authenticated users to INSERT reports
CREATE POLICY "Authenticated users can insert reports"
ON reports FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to UPDATE their own reports
CREATE POLICY "Users can update own reports"
ON reports FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to DELETE their own reports
CREATE POLICY "Users can delete own reports"
ON reports FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Step 4: Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'reports'
ORDER BY policyname;

-- You should see 4 policies:
-- 1. Enable read access for all users (SELECT)
-- 2. Authenticated users can insert reports (INSERT)
-- 3. Users can update own reports (UPDATE)
-- 4. Users can delete own reports (DELETE)
