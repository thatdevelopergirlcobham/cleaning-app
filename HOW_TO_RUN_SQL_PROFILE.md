# 🚨 YOU MUST RUN THIS SQL IN SUPABASE NOW! 🚨

## The Error You're Seeing

```
Could not find a relationship between 'reports' and 'user_profiles'
```

**This means:** We need to add a foreign key from reports to user_profiles. Let's fix this!

---

## Step-by-Step Instructions

### Step 1: Open Supabase Dashboard
1. Go to: **https://supabase.com/dashboard**
2. Sign in if needed
3. Click on your project: **hajgpcqbfougojrpaprr**

### Step 2: Open SQL Editor
1. Look at the left sidebar
2. Click: **SQL Editor** (looks like a document icon)
3. Click: **New Query** button (top right)

### Step 3: Copy the SQL
Open the file: `migrations/003_add_reports_user_profile_fk.sql`

Or copy this:

```sql
-- Add foreign key from reports to user_profiles
ALTER TABLE reports
ADD COLUMN profile_id UUID REFERENCES user_profiles(id);

-- Update existing reports to link to correct user_profiles
UPDATE reports r
SET profile_id = up.id
FROM user_profiles up
WHERE r.user_id = up.user_id;

-- Add index on the foreign key column for better performance
CREATE INDEX idx_reports_profile_id ON reports(profile_id);
```

### Step 4: Paste and Run
1. **Paste** the SQL into the editor
2. Click: **RUN** button (or press Ctrl+Enter)
3. Wait for: **"Success. No rows returned"** message

### Step 5: Verify It Worked
1. In Supabase, click: **Table Editor**
2. Find: **reports** table
3. You should see the new **profile_id** column
4. Check a few rows - they should have profile_ids linked

### Step 6: Test Your App
1. Go back to your app
2. Refresh the page
3. The Profile page should now work correctly!

---

## Why This Is Necessary

We've added a direct relationship between the `reports` and `user_profiles` tables by adding a foreign key. This allows us to:
1. Join reports with user_profiles directly
2. Query profile data for each report efficiently
3. Ensure referential integrity with the profiles table

---

## Common Issues

### "Table 'user_profiles' does not exist"
**Solution:** Create the user_profiles table first:
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### "Success. No rows returned"
**This is GOOD!** It means the SQL ran successfully.

### "Reports table has no rows updated"
**Check that:**
1. You have reports in the table
2. You have corresponding user_profiles