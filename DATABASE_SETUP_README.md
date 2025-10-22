# =============================================================================
# CleanCal Database Setup Instructions
# =============================================================================

This directory contains the complete database setup for the CleanCal platform.

## Files:
- `snippets.sql` - Complete database schema and setup script
- `database_migration.sql` - Incremental migration script (if needed)

## Setup Instructions:

### 1. Supabase Setup
1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `snippets.sql`
4. Execute the SQL script

### 2. Environment Configuration
Ensure your `.env` file contains:
```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Application Setup
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Build for production: `npm run build`

## What the Database Setup Includes:

### Tables Created:
- ✅ `reports` - Enhanced with AI category and priority fields
- ✅ `events` - Community cleanup events
- ✅ `agent_bookings` - Cleanup service bookings
- ✅ `user_profiles` - Extended user information
- ✅ `notifications` - Real-time user notifications

### Features Enabled:
- ✅ Row Level Security (RLS) policies
- ✅ Real-time subscriptions
- ✅ AI categorization functions
- ✅ Automatic admin notifications
- ✅ User notification triggers
- ✅ Performance indexes
- ✅ Analytics views

### AI Integration:
- ✅ Gemini API integration for categorization
- ✅ Priority assessment functions
- ✅ Real-time AI processing

## Troubleshooting:

### If you encounter errors:
1. Check that all tables are created properly
2. Verify RLS policies are enabled
3. Ensure indexes are created
4. Check function definitions

### Common Issues:
- **Authentication errors**: Ensure RLS policies are correct
- **Permission errors**: Check grants at the end of the SQL script
- **Function errors**: Verify PostgreSQL extensions are enabled

## Post-Setup Verification:

1. Check that all tables exist in your Supabase dashboard
2. Verify that the application can connect to Supabase
3. Test user registration (should auto-create user_profiles)
4. Test report submission (should trigger AI categorization and admin notifications)
5. Verify real-time notifications are working

## Support:

If you encounter any issues during setup, check:
1. Supabase logs for SQL errors
2. Application console for connection errors
3. Database permissions in Supabase dashboard

The database is now fully configured for the CleanCal platform with all features working!
