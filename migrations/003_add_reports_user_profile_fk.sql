-- Add foreign key from reports to user_profiles
ALTER TABLE reports
ADD COLUMN profile_id UUID REFERENCES user_profiles(id);

-- Update existing reports to link to correct user_profiles
UPDATE reports r
SET profile_id = up.id
FROM user_profiles up
WHERE r.user_id = up.id;

-- Add index on the foreign key column for better performance
CREATE INDEX idx_reports_profile_id ON reports(profile_id);