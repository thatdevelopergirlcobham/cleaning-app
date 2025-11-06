# 🔄 Reset & Setup User Reports System

## 📋 Current Issue
All users deleted from Supabase auth → no authentication → reports can't be tracked

## 🎯 Solution Steps

### 1. **Create Test User Account**
First, we need to create a user account to test with.

### 2. **Verify Database Schema**
Make sure the reports table has the correct user reference

### 3. **Test the Complete Flow**
Create user → Login → Create report → Verify tracking

---

## 🚀 Quick Setup Commands

### Step 1: Create Test User (via SQL)
```sql
-- Create a test user in Supabase auth
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
) VALUES (
  gen_random_uuid(),
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  false,
  'authenticated',
  'authenticated'
);

-- Create corresponding user profile
INSERT INTO user_profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'test@example.com'),
  'test@example.com',
  'Test User',
  'user',
  NOW(),
  NOW()
);
```

### Step 2: Verify Reports Table Structure
```sql
-- Check if reports table has user_id column
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'reports' 
AND column_name IN ('user_id', 'profile_id');

-- Check existing reports
SELECT id, user_id, profile_id, title, created_at 
FROM reports 
ORDER BY created_at DESC 
LIMIT 5;
```

### Step 3: Test via Debug Page
1. Open `debug-reports.html`
2. Login with: `test@example.com` / `password123`
3. Create a test report
4. Verify it appears in the list

---

## 🔧 Alternative: Use Supabase Dashboard

### Create User via Dashboard
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Create user"
3. Email: `test@example.com`
4. Password: `password123`
5. Save

### Create Profile via SQL Editor
```sql
INSERT INTO user_profiles (id, email, full_name, role)
VALUES (
  'your-user-id-from-dashboard',
  'test@example.com',
  'Test User',
  'user'
);
```

---

## 📊 Verify System Works

### Check User-Report Relationship
```sql
-- Verify reports are linked to users
SELECT 
  r.id as report_id,
  r.title,
  r.user_id,
  u.email as user_email,
  up.full_name as user_name,
  r.created_at
FROM reports r
LEFT JOIN auth.users u ON r.user_id = u.id
LEFT JOIN user_profiles up ON r.user_id = up.id
ORDER BY r.created_at DESC;
```

### Test RLS Policies
```sql
-- Test if RLS is working
SELECT * FROM reports WHERE user_id = 'your-user-id';

-- This should only return reports for the authenticated user
```

---

## 🎯 Expected Results

After setup, you should see:
```
✅ User authenticated: test@example.com
🆔 User ID: [uuid]
📊 Reports Summary:
📈 Total: 1 (after creating)
⏳ Pending: 1
```

---

## 🚨 Important Notes

1. **Never delete all users** in production
2. **Always create user profiles** when creating auth users
3. **Test the complete flow** before deploying
4. **Keep backup of important data**

---

## 🔄 Next Steps

1. ✅ Create test user account
2. ✅ Verify database schema
3. ✅ Test authentication flow
4. ✅ Create test report
5. ✅ Verify tracking works
6. ✅ Update production deployment

---

## 📞 If Issues Persist

Check these:
- Supabase auth configuration
- RLS policies on reports table
- CORS settings for local development
- Environment variables in .env file
