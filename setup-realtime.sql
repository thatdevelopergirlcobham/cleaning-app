-- setup-realtime.sql
-- SQL to enable RLS and create sensible policies for user_profiles and reports.
-- Run this in your Supabase SQL editor (or psql) as a database owner.

-- Ensure user_profiles has a full_name column (if not already)
ALTER TABLE IF EXISTS public.user_profiles
  ADD COLUMN IF NOT EXISTS full_name text;

-- Enable row level security
ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reports ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
-- Allow a user to select their own profile
DROP POLICY IF EXISTS "Users can select own profile" ON public.user_profiles;
CREATE POLICY "Users can select own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow authenticated users to insert their profile (with id = auth.uid())
DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON public.user_profiles;
CREATE POLICY "Authenticated users can insert profiles" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Policies for reports
-- Allow anyone to view reports (public)
DROP POLICY IF EXISTS "Anyone can view reports" ON public.reports;
CREATE POLICY "Anyone can view reports" ON public.reports
  FOR SELECT USING (true);

-- Allow authenticated users to insert reports when user_id matches their auth id
DROP POLICY IF EXISTS "Authenticated users can insert reports" ON public.reports;
CREATE POLICY "Authenticated users can insert reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own reports
DROP POLICY IF EXISTS "Users can update own reports" ON public.reports;
CREATE POLICY "Users can update own reports" ON public.reports
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own reports
DROP POLICY IF EXISTS "Users can delete own reports" ON public.reports;
CREATE POLICY "Users can delete own reports" ON public.reports
  FOR DELETE USING (auth.uid() = user_id);

-- If you need realtime replication for an external Postgres replica, ensure
-- a publication exists. Supabase usually manages this, but here's an example:
-- CREATE PUBLICATION IF NOT EXISTS supabase_realtime FOR TABLE public.reports, public.user_profiles;

-- Notes:
-- 1) Apply these policies carefully in production. If you want admins to
--    bypass RLS, create additional policies that allow admin emails/user ids.
-- 2) After applying, test by logging in as a user and verifying selects/inserts/updates/deletes.
