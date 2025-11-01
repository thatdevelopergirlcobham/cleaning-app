-- Migration: rename reporter_id to user_id on reports table
-- Run this in your Supabase SQL editor or via psql against the project.

-- WARNING: test in a dev environment first.

ALTER TABLE public.reports
  RENAME COLUMN reporter_id TO user_id;

-- If you want to allow anonymous inserts, make user_id nullable:
-- ALTER TABLE public.reports ALTER COLUMN user_id DROP NOT NULL;

-- Example RLS policy (hybrid): allow anonymous SELECT but only allow INSERT when user_id IS NULL (anon) or equals auth.uid():
-- ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "Insert for anon or auth"
--   ON public.reports FOR INSERT
--   USING (true)
--   WITH CHECK (
--     user_id IS NULL
--     OR user_id = auth.uid()
--   );
