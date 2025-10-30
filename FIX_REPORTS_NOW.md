# 🚨 URGENT: Fix Report Submission NOW

## Why Reports Are Not Working

**The code is 100% ready ✅**  
**BUT: You need to run the SQL script in Supabase! ⚠️**

Your database has Row Level Security (RLS) enabled, which is blocking report submissions because the policies haven't been set up yet.

---

## 🔧 Fix It Now (5 Minutes)

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Click on your project
3. Look for **"SQL Editor"** in the left sidebar
4. Click it

### Step 2: Copy This SQL Script

```sql
-- Enable RLS on reports table
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view reports" ON reports;
DROP POLICY IF EXISTS "Authenticated users can insert reports" ON reports;
DROP POLICY IF EXISTS "Users can update own reports" ON reports;
DROP POLICY IF EXISTS "Users can delete own reports" ON reports;

-- Allow anyone to view all reports
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
```

### Step 3: Run the Script
1. Paste the SQL above into the SQL Editor
2. Click **"RUN"** button (or press Ctrl+Enter)
3. Wait for "Success" message
4. Done! ✅

---

## 🧪 Test Report Submission

### After Running the SQL:

1. **Go to your app**
2. **Navigate to Community → Report Issue**
3. **Fill in the form:**
   - Title: "Test Report"
   - Description: "Testing report submission"
   - Select location on map
   - Upload image (optional)
4. **Click Submit**
5. **Should work!** ✅

---

## 🔍 What Was Blocking Reports?

### Before (Without SQL):
```
User tries to submit report
  ↓
Supabase checks RLS policies
  ↓
❌ No policy found for INSERT
  ↓
❌ Error: "new row violates row-level security policy"
  ↓
❌ Report NOT saved
```

### After (With SQL):
```
User tries to submit report
  ↓
Supabase checks RLS policies
  ↓
✅ Policy found: "Authenticated users can insert reports"
  ↓
✅ User is authenticated
  ↓
✅ Report SAVED successfully!
```

---

## 📋 Checklist

- [ ] Open Supabase Dashboard
- [ ] Go to SQL Editor
- [ ] Copy the SQL script above
- [ ] Paste into SQL Editor
- [ ] Click RUN
- [ ] See "Success" message
- [ ] Test report submission in app
- [ ] Reports now work! 🎉

---

## ⚠️ Common Issues

### Issue: "relation 'reports' does not exist"
**Solution:** Your reports table isn't created yet. Create it first:

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  status TEXT DEFAULT 'pending',
  image_url TEXT,
  location JSONB,
  latitude DECIMAL,
  longitude DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

Then run the RLS policies script.

### Issue: "permission denied for table reports"
**Solution:** You're not logged in as the database owner. Make sure you're using the Supabase dashboard with the correct project.

---

## 🎯 Summary

**Problem:** Reports not submitting  
**Cause:** Missing RLS policies in database  
**Solution:** Run the SQL script in Supabase  
**Time:** 5 minutes  
**Status:** Ready to fix NOW! 🚀

**Just run the SQL and reports will work immediately!**
