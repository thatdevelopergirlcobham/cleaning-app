-- =============================================================================
-- Complete CleanCal Database Setup
-- Run this script in your Supabase SQL editor to set up the entire database
-- =============================================================================

-- Start with base schema
\i database_migration.sql

-- Storage setup
\i setup-storage-policies.sql

-- Reports policies setup
\i setup-reports-policies.sql

-- Add cleaning requests
\i setup-cleaning-requests.sql

-- Final fixes and verifications
\i FINAL-FIX.sql

-- Verify setup
SELECT 
    table_name, 
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = table_name) as policy_count
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- List all policies for review
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname IN ('public', 'storage')
ORDER BY schemaname, tablename;