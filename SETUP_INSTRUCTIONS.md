# CleanCal Setup Instructions

## ✅ What's Been Fixed

### 1. AI Chat System
- ✅ Removed all mock responses
- ✅ Only uses real Gemini API
- ✅ Shows intro message: "Hi! I'm EcoBot..."
- ✅ Network errors shown clearly
- ✅ All TypeScript errors fixed

### 2. Image Upload
- ✅ Working with Supabase Storage
- ✅ Public upload enabled
- ✅ Proper error handling

### 3. Code Quality
- ✅ All TypeScript errors resolved
- ✅ Proper type safety
- ✅ Clean error messages

---

## 🚨 CRITICAL: Run These SQL Scripts in Supabase

### Step 1: Storage Policies (Already Done ✅)
Your storage is working! Skip this.

### Step 2: Reports Table Policies (MUST DO NOW!)

**Go to Supabase Dashboard → SQL Editor and run this:**

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

---

## 🧪 Testing

### Test AI Chat:
1. Click chat button (bottom right)
2. You'll see: "Hi! I'm EcoBot..."
3. Ask: "How do I recycle plastic?"
4. Should get real AI response
5. If error: Shows "Network error. Please check your connection."

### Test Report Submission:
1. **AFTER running the SQL above**
2. Go to Community → Report Issue
3. Fill in title, description, location
4. Upload image (optional)
5. Click Submit
6. Should work! ✅

---

## 📱 Navigation Issues

You mentioned fixing mobile nav to match main nav. Let me check what needs to be done...

