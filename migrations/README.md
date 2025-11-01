# Database Migrations

This folder contains SQL migrations for setting up the database schema in Supabase.

## How to Run Migrations

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste each migration file's contents into the editor
4. Run them in this order:
   - `comments_schema.sql` (creates comments table and policies)
   - `cleaning_requests_schema.sql` (creates cleaning requests table and policies)

## Schema Overview

### Comments Table
- Allows users to comment on reports
- Supports anonymous comments
- Row Level Security (RLS) policies:
  - Everyone can read comments
  - Authenticated users can create comments
  - Users can only update/delete their own comments

### Cleaning Requests Table
- Stores cleaning service bookings
- Automatically calculates pricing based on space size
- Row Level Security (RLS) policies:
  - Users can only see their own requests
  - Admins can see all requests
  - Users can only update pending requests

## Validation

After running migrations, verify the setup:

1. Check tables exist:
```sql
SELECT * FROM pg_tables WHERE schemaname = 'public';
```

2. Verify RLS is enabled:
```sql
SELECT tablename, hasrls 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('comments', 'cleaning_requests');
```

3. Check policies:
```sql
SELECT * FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('comments', 'cleaning_requests');
```