-- Reports Table RLS Policies Setup Script
-- Run this in Supabase Dashboard → SQL Editor

-- Step 1: Enable RLS on reports table (if not already enabled)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view reports" ON reports;
DROP POLICY IF EXISTS "Authenticated users can insert reports" ON reports;
DROP POLICY IF EXISTS "Users can update own reports" ON reports;
DROP POLICY IF EXISTS "Users can delete own reports" ON reports;

-- Step 3: Create new policies

-- Allow anyone to view all reports (public read)
CREATE POLICY "Anyone can view reports"
ON reports FOR SELECT
USING (true);

-- Allow authenticated users to insert reports
CREATE POLICY "Authenticated users can insert reports"
ON reports FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own reports
CREATE POLICY "Users can update own reports"
ON reports FOR UPDATE
USING (auth.uid() = user_id);

-- Allow users to delete their own reports
CREATE POLICY "Users can delete own reports"
ON reports FOR DELETE
USING (auth.uid() = user_id);

-- Step 4: Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'reports';
