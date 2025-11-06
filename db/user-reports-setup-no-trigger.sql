-- ============================================
-- USER REPORTS CRUD SETUP (WITHOUT TRIGGER RECREATION)
-- Use this if the trigger already exists
-- ============================================

-- ============================================
-- 1. UPDATE TRIGGER FUNCTION (if needed)
-- ============================================

-- Create or replace the handle_report_timestamps function
CREATE OR REPLACE FUNCTION handle_report_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Set updated_at to current timestamp
  NEW.updated_at = NOW();
  
  -- If this is an insert and created_at is not set, set it
  IF TG_OP = 'INSERT' AND NEW.created_at IS NULL THEN
    NEW.created_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: Skipping trigger creation since it already exists
-- The function update above will be used by the existing trigger

-- ============================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on reports table
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own reports" ON reports;
DROP POLICY IF EXISTS "Users can insert own reports" ON reports;
DROP POLICY IF EXISTS "Users can update own reports" ON reports;
DROP POLICY IF EXISTS "Users can delete own reports" ON reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON reports;
DROP POLICY IF EXISTS "Admins can manage all reports" ON reports;

-- Policy: Users can view their own reports
CREATE POLICY "Users can view own reports"
ON reports FOR SELECT
USING (profile_id = auth.uid());

-- Policy: Users can insert their own reports
CREATE POLICY "Users can insert own reports"
ON reports FOR INSERT
WITH CHECK (profile_id = auth.uid());

-- Policy: Users can update their own reports (only non-resolved ones)
CREATE POLICY "Users can update own reports"
ON reports FOR UPDATE
USING (profile_id = auth.uid() AND is_resolved = false)
WITH CHECK (profile_id = auth.uid());

-- Policy: Users can delete their own reports (only pending ones)
CREATE POLICY "Users can delete own reports"
ON reports FOR DELETE
USING (profile_id = auth.uid() AND status = 'pending');

-- Policy: Admins can view all reports
CREATE POLICY "Admins can view all reports"
ON reports FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Admins can manage all reports
CREATE POLICY "Admins can manage all reports"
ON reports FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- 3. DATABASE FUNCTIONS FOR CRUD OPERATIONS
-- ============================================

-- GET: Fetch all reports for a specific user
CREATE OR REPLACE FUNCTION get_user_reports(user_profile_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  status TEXT,
  image_url TEXT,
  location JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  votes INTEGER,
  comments_count INTEGER,
  is_resolved BOOLEAN,
  resolved_at TIMESTAMPTZ,
  type TEXT,
  severity TEXT,
  area TEXT,
  tags TEXT[],
  category TEXT,
  priority TEXT,
  is_anonymous BOOLEAN,
  resolution_status TEXT,
  resolved_by UUID,
  resolution_notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id, r.title, r.description, r.status, r.image_url, 
    r.location, r.created_at, r.updated_at, r.votes, 
    r.comments_count, r.is_resolved, r.resolved_at, 
    r.type, r.severity, r.area, r.tags, r.category, 
    r.priority, r.is_anonymous, r.resolution_status,
    r.resolved_by, r.resolution_notes
  FROM reports r
  WHERE r.profile_id = user_profile_id
  ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CREATE: Insert a new report for user
CREATE OR REPLACE FUNCTION create_user_report(
  p_profile_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_category TEXT DEFAULT NULL,
  p_type TEXT DEFAULT NULL,
  p_severity TEXT DEFAULT 'low',
  p_priority TEXT DEFAULT 'low',
  p_area TEXT DEFAULT NULL,
  p_image_url TEXT DEFAULT NULL,
  p_location JSONB DEFAULT NULL,
  p_tags TEXT[] DEFAULT '{}',
  p_is_anonymous BOOLEAN DEFAULT FALSE
)
RETURNS UUID AS $$
DECLARE
  new_report_id UUID;
BEGIN
  INSERT INTO reports (
    profile_id, title, description, category, type, 
    severity, priority, area, image_url, location, 
    tags, is_anonymous, status, votes, comments_count, is_resolved
  ) VALUES (
    p_profile_id, p_title, p_description, p_category, p_type,
    p_severity, p_priority, p_area, p_image_url, p_location,
    p_tags, p_is_anonymous, 'pending', 0, 0, false
  )
  RETURNING id INTO new_report_id;
  
  RETURN new_report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE: Update user's report
CREATE OR REPLACE FUNCTION update_user_report(
  p_report_id UUID,
  p_profile_id UUID,
  p_title TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_type TEXT DEFAULT NULL,
  p_severity TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT NULL,
  p_area TEXT DEFAULT NULL,
  p_image_url TEXT DEFAULT NULL,
  p_location JSONB DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  rows_affected INTEGER;
BEGIN
  -- Only allow updates if the report belongs to the user and is not resolved
  UPDATE reports
  SET
    title = COALESCE(p_title, title),
    description = COALESCE(p_description, description),
    category = COALESCE(p_category, category),
    type = COALESCE(p_type, type),
    severity = COALESCE(p_severity, severity),
    priority = COALESCE(p_priority, priority),
    area = COALESCE(p_area, area),
    image_url = COALESCE(p_image_url, image_url),
    location = COALESCE(p_location, location),
    tags = COALESCE(p_tags, tags),
    updated_at = NOW()
  WHERE id = p_report_id 
    AND profile_id = p_profile_id
    AND is_resolved = false;
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- DELETE: Delete user's report
CREATE OR REPLACE FUNCTION delete_user_report(
  p_report_id UUID,
  p_profile_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  rows_affected INTEGER;
BEGIN
  -- Only allow deletion if the report belongs to the user and is pending
  DELETE FROM reports
  WHERE id = p_report_id 
    AND profile_id = p_profile_id
    AND status = 'pending';
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- GET: Get single report by ID for user
CREATE OR REPLACE FUNCTION get_user_report_by_id(
  p_report_id UUID,
  p_profile_id UUID
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  status TEXT,
  image_url TEXT,
  location JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  votes INTEGER,
  comments_count INTEGER,
  is_resolved BOOLEAN,
  resolved_at TIMESTAMPTZ,
  type TEXT,
  severity TEXT,
  area TEXT,
  tags TEXT[],
  category TEXT,
  priority TEXT,
  is_anonymous BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id, r.title, r.description, r.status, r.image_url, 
    r.location, r.created_at, r.updated_at, r.votes, 
    r.comments_count, r.is_resolved, r.resolved_at, 
    r.type, r.severity, r.area, r.tags, r.category, 
    r.priority, r.is_anonymous
  FROM reports r
  WHERE r.id = p_report_id 
    AND r.profile_id = p_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- GET: Count user's reports by status
CREATE OR REPLACE FUNCTION get_user_reports_count(user_profile_id UUID)
RETURNS TABLE (
  total BIGINT,
  pending BIGINT,
  approved BIGINT,
  rejected BIGINT,
  resolved BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total,
    COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending,
    COUNT(*) FILTER (WHERE status = 'approved')::BIGINT as approved,
    COUNT(*) FILTER (WHERE status = 'rejected')::BIGINT as rejected,
    COUNT(*) FILTER (WHERE status = 'resolved')::BIGINT as resolved
  FROM reports
  WHERE profile_id = user_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. INDEXES FOR PERFORMANCE
-- ============================================

-- Ensure indexes exist for optimal query performance
CREATE INDEX IF NOT EXISTS idx_reports_profile_id_created 
ON reports(profile_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reports_profile_id_status 
ON reports(profile_id, status);

CREATE INDEX IF NOT EXISTS idx_reports_profile_id_resolved 
ON reports(profile_id, is_resolved);

-- ============================================
-- 5. GRANT PERMISSIONS
-- ============================================

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION get_user_reports(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_report(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT[], BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_report(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_report(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_report_by_id(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_reports_count(UUID) TO authenticated;

-- ============================================
-- 6. COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON FUNCTION get_user_reports(UUID) IS 'Fetch all reports for a specific user';
COMMENT ON FUNCTION create_user_report IS 'Create a new report for the authenticated user';
COMMENT ON FUNCTION update_user_report IS 'Update an existing report (only if it belongs to the user and is not resolved)';
COMMENT ON FUNCTION delete_user_report IS 'Delete a report (only if it belongs to the user and is pending)';
COMMENT ON FUNCTION get_user_report_by_id IS 'Get a single report by ID for the authenticated user';
COMMENT ON FUNCTION get_user_reports_count IS 'Get count of reports by status for a specific user';

-- ============================================
-- SETUP COMPLETE
-- ============================================

-- Verify the setup
SELECT 'User Reports CRUD setup completed successfully (trigger skipped)!' AS status;
