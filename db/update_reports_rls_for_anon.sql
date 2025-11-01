-- First, drop ALL existing policies
DROP POLICY IF EXISTS "Users can create their own reports" ON public.reports;
DROP POLICY IF EXISTS "Anyone can create reports" ON public.reports;
DROP POLICY IF EXISTS "Reports are viewable by everyone" ON public.reports;
DROP POLICY IF EXISTS "Users can update their own reports" ON public.reports;
DROP POLICY IF EXISTS "Authenticated users can insert reports" ON public.reports;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.reports;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.reports;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.reports;
DROP POLICY IF EXISTS "Users can delete own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can update own reports" ON public.reports;

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 1. READ policy - Anyone can view reports
CREATE POLICY "read_reports" ON public.reports
  FOR SELECT USING (true);

-- 2. CREATE policy - Both authenticated and anonymous users can create
CREATE POLICY "create_reports" ON public.reports
  FOR INSERT 
  WITH CHECK (
    -- For authenticated users - must match their ID
    (auth.role() = 'authenticated' AND auth.uid()::text = user_id::text)
    OR
    -- For anonymous users - just need basic validation
    (auth.role() = 'anon' AND user_id IS NOT NULL)
  );
  FOR INSERT WITH CHECK (
    -- For authenticated users: user_id should match their auth.uid()
    (auth.role() = 'authenticated' AND auth.uid()::text = user_id::text)
    OR
    -- For anonymous/public users: just require valid UUID and pending status
    (
      auth.role() = 'anon' 
      AND user_id IS NOT NULL
      AND status = 'pending'
      AND resolved_by IS NULL
    )
  );

-- Function to handle report creation
CREATE OR REPLACE FUNCTION public.handle_report_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- For anonymous users or if no user_id provided
  IF NEW.user_id IS NULL THEN
    NEW.user_id := gen_random_uuid();
    NEW.is_anonymous := true;
  END IF;
  
  -- Set default status if not provided
  IF NEW.status IS NULL THEN
    NEW.status := 'pending';
  END IF;
  
  -- Set timestamps
  NEW.created_at := CURRENT_TIMESTAMP;
  NEW.updated_at := CURRENT_TIMESTAMP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS handle_report_creation_trigger ON public.reports;
CREATE TRIGGER handle_report_creation_trigger
  BEFORE INSERT ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_report_creation();

-- Grant permissions to anonymous users
GRANT SELECT ON public.reports TO anon;
GRANT INSERT ON public.reports TO anon;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant permissions to authenticated users
GRANT SELECT ON public.reports TO authenticated;
GRANT INSERT ON public.reports TO authenticated;
GRANT UPDATE ON public.reports TO authenticated;

-- 3. UPDATE policy - Only authenticated users can update their own reports
CREATE POLICY "update_reports" ON public.reports
  FOR UPDATE
  USING (auth.role() = 'authenticated' AND auth.uid()::text = user_id::text)
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid()::text = user_id::text);

-- 4. DELETE policy - Only authenticated users can delete their own reports
CREATE POLICY "delete_reports" ON public.reports
  FOR DELETE
  USING (auth.role() = 'authenticated' AND auth.uid()::text = user_id::text);

-- Grant necessary permissions
GRANT SELECT ON public.reports TO anon;
GRANT INSERT ON public.reports TO anon;
GRANT SELECT ON public.reports TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reports TO authenticated;

-- Verify the new policies
SELECT * FROM pg_policies WHERE tablename = 'reports';