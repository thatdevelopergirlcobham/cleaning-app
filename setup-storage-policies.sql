-- Supabase Storage Setup Script
-- Run this in Supabase Dashboard → SQL Editor

-- Step 1: Ensure the images bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Step 2: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- Step 3: Create new policies

-- Allow anyone to view/download images (public read)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'images' );

-- Allow ANYONE (authenticated or not) to upload images
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'images' );

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING ( 
  bucket_id = 'images' AND 
  auth.role() = 'authenticated' 
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING ( 
  bucket_id = 'images' AND 
  auth.role() = 'authenticated' 
);

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'objects';
