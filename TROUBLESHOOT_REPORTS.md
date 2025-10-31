# 🔍 Report Submission Troubleshooting Guide

## Current Status

✅ **Code is 100% working**  
✅ **Image upload is working**  
✅ **Form validation is working**  
❌ **Database policies NOT set up** ← THIS IS THE PROBLEM!

---

## 🚨 The Problem

When you try to submit a report, you see this error in the console:

```
Error: new row violates row-level security policy for table "reports"
```

OR

```
Error code: 42501
Error message: permission denied for table reports
```

**Why?** Supabase has Row Level Security (RLS) enabled, but no policies exist to allow authenticated users to insert reports.

---

## ✅ The Solution (Step-by-Step)

### Visual Guide:

```
┌─────────────────────────────────────────┐
│  1. Open Supabase Dashboard             │
│     https://supabase.com/dashboard      │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  2. Click Your Project                  │
│     (CleanCal or your project name)     │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  3. Find "SQL Editor" in Left Sidebar   │
│     (looks like </> icon)               │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  4. Click "New Query"                   │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  5. Paste the SQL Script (see below)    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  6. Click "RUN" or Press Ctrl+Enter     │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  7. See "Success" Message ✅            │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  8. Reports Now Work! 🎉                │
└─────────────────────────────────────────┘
```

---

## 📝 SQL Script to Run

**Copy and paste this ENTIRE script:**

```sql
-- Enable RLS on reports table
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Anyone can view reports" ON reports;
DROP POLICY IF EXISTS "Authenticated users can insert reports" ON reports;
DROP POLICY IF EXISTS "Users can update own reports" ON reports;
DROP POLICY IF EXISTS "Users can delete own reports" ON reports;

-- Create new policies

-- 1. Allow everyone to READ reports
CREATE POLICY "Anyone can view reports"
ON reports FOR SELECT
USING (true);

-- 2. Allow authenticated users to CREATE reports
CREATE POLICY "Authenticated users can insert reports"
ON reports FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Allow users to UPDATE their own reports
CREATE POLICY "Users can update own reports"
ON reports FOR UPDATE
USING (auth.uid() = user_id);

-- 4. Allow users to DELETE their own reports
CREATE POLICY "Users can delete own reports"
ON reports FOR DELETE
USING (auth.uid() = user_id);

-- Verify policies were created
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'reports';
```

---

## 🧪 Testing After Running SQL

### Test 1: Submit a Report
1. Go to Community page
2. Click "Report Issue"
3. Fill in:
   - Title: "Test Report"
   - Description: "Testing after SQL fix"
   - Select location
   - Upload image (optional)
4. Click Submit
5. **Should work!** ✅

### Test 2: Check Console
Open browser console (F12) and look for:
```
✅ Report submitted successfully
✅ Insert data: { id: "...", title: "Test Report", ... }
```

NOT:
```
❌ Error: new row violates row-level security policy
❌ Error code: 42501
```

---

## 🔍 How to Check if SQL Worked

### Method 1: In Supabase Dashboard
1. Go to "Database" → "Tables"
2. Click "reports" table
3. Click "Policies" tab
4. You should see 4 policies:
   - ✅ Anyone can view reports
   - ✅ Authenticated users can insert reports
   - ✅ Users can update own reports
   - ✅ Users can delete own reports

### Method 2: Try Submitting a Report
Just try it! If it works, the SQL worked.

---

## ❓ FAQ

### Q: Do I need to restart my app after running SQL?
**A:** No! The changes are immediate.

### Q: Will this delete my existing reports?
**A:** No! This only changes permissions, not data.

### Q: What if I get "relation 'reports' does not exist"?
**A:** Your reports table doesn't exist. Create it first:

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
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

### Q: What if I see "Success" but reports still don't work?
**A:** Check browser console for errors. Share the error message.

---

## 📊 Before vs After

### BEFORE (No SQL Run):
```
User submits report
  ↓
Frontend sends to Supabase
  ↓
Supabase checks RLS policies
  ↓
❌ No policy found
  ↓
❌ Error: "permission denied"
  ↓
❌ Report NOT saved
```

### AFTER (SQL Run):
```
User submits report
  ↓
Frontend sends to Supabase
  ↓
Supabase checks RLS policies
  ↓
✅ Policy found: "Authenticated users can insert"
  ↓
✅ User is authenticated
  ↓
✅ Report SAVED!
  ↓
✅ Success message shown
```

---

## 🎯 Quick Checklist

- [ ] Opened Supabase Dashboard
- [ ] Found SQL Editor
- [ ] Copied SQL script
- [ ] Pasted into editor
- [ ] Clicked RUN
- [ ] Saw "Success" message
- [ ] Tested report submission
- [ ] Reports now work! 🎉

---

## 🆘 Still Not Working?

If you've run the SQL and reports still don't work:

1. **Check browser console** (F12) for errors
2. **Check Supabase logs** (Dashboard → Logs)
3. **Verify you're logged in** (check navbar shows your name)
4. **Try a different browser** (clear cache)
5. **Share the error message** so I can help!

---

**The fix is literally just running the SQL script. That's it!** 🚀
