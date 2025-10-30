-- ========================================
-- FINAL FIX - Run this in Supabase SQL Editor
-- ========================================

-- First, check if bucket exists
DO $$
BEGIN
    -- Create bucket if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'images') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('images', 'images', true, 52428800, ARRAY['image/*']);
        RAISE NOTICE 'Created images bucket';
    ELSE
        -- Update existing bucket to be public
        UPDATE storage.buckets 
        SET public = true 
        WHERE id = 'images';
        RAISE NOTICE 'Updated images bucket to public';
    END IF;
END $$;

-- Drop ALL existing policies on storage.objects
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON storage.objects';
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- Create fresh policies
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'images' );

CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'images' );

CREATE POLICY "Allow authenticated users to update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'images' );

CREATE POLICY "Allow authenticated users to delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'images' );

-- Verify setup
SELECT 
    'Bucket exists: ' || CASE WHEN EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'images') THEN 'YES ✓' ELSE 'NO ✗' END as bucket_status,
    'Bucket is public: ' || CASE WHEN EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'images' AND public = true) THEN 'YES ✓' ELSE 'NO ✗' END as public_status;

SELECT 
    'Policy count: ' || COUNT(*)::text as policy_count
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects' 
AND policyname LIKE '%Allow%';

-- List all policies
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
ORDER BY cmd;
