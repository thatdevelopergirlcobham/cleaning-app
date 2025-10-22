-- =============================================================================
-- CleanCal Database Setup Script
-- Complete database schema for the CleanCal waste management platform
-- Run this script in your Supabase SQL editor to set up the entire database
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABLE DEFINITIONS
-- =============================================================================

-- Reports table (enhanced with AI categorization and priority)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location JSONB NOT NULL, -- {lat: number, lng: number}
    image_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'resolved')),
    category TEXT, -- AI-categorized waste type
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Events table for community cleanup events
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location JSONB NOT NULL, -- {lat: number, lng: number}
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    max_participants INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Agent bookings table for cleanup services
CREATE TABLE IF NOT EXISTS public.agent_bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'agent', 'admin')),
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Notifications table for real-time user notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('report_approved', 'report_rejected', 'report_submitted', 'system', 'ai_insight')),
    read BOOLEAN DEFAULT false,
    data JSONB, -- Additional data related to the notification
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Reports table indexes
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_category ON public.reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_priority ON public.reports(priority);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_location ON public.reports USING GIN (location);

-- Events table indexes
CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);

-- Agent bookings table indexes
CREATE INDEX IF NOT EXISTS idx_agent_bookings_user_id ON public.agent_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_bookings_agent_id ON public.agent_bookings(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_bookings_status ON public.agent_bookings(status);

-- User profiles table indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Reports table policies
CREATE POLICY "Users can view approved reports" ON public.reports
    FOR SELECT USING (status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports" ON public.reports
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any report status" ON public.reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Events table policies
CREATE POLICY "Anyone can view events" ON public.events
    FOR SELECT USING (true);

CREATE POLICY "Users can create events" ON public.events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events" ON public.events
    FOR UPDATE USING (auth.uid() = user_id);

-- Agent bookings table policies
CREATE POLICY "Users can view their own bookings" ON public.agent_bookings
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = agent_id);

CREATE POLICY "Users can create bookings for themselves" ON public.agent_bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users and agents can update their bookings" ON public.agent_bookings
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = agent_id);

-- User profiles table policies
CREATE POLICY "Users can view all profiles" ON public.user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Notifications table policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- FUNCTIONS FOR AI INTEGRATION AND AUTOMATION
-- =============================================================================

-- Function to categorize reports using AI (placeholder for Gemini API integration)
CREATE OR REPLACE FUNCTION categorize_report_ai(report_title TEXT, report_description TEXT)
RETURNS TEXT AS $$
BEGIN
    -- This is a simplified categorization function
    -- In production, this would integrate with Gemini API
    -- For now, using basic keyword matching

    IF report_title ILIKE '%plastic%' OR report_description ILIKE '%plastic%'
       OR report_title ILIKE '%bottle%' OR report_description ILIKE '%bottle%'
       OR report_title ILIKE '%bag%' OR report_description ILIKE '%bag%' THEN
        RETURN 'Plastic Waste';
    ELSIF report_title ILIKE '%food%' OR report_description ILIKE '%food%'
          OR report_title ILIKE '%organic%' OR report_description ILIKE '%organic%'
          OR report_title ILIKE '%leaves%' OR report_description ILIKE '%leaves%' THEN
        RETURN 'Organic Waste';
    ELSIF report_title ILIKE '%electronic%' OR report_description ILIKE '%electronic%'
          OR report_title ILIKE '%phone%' OR report_description ILIKE '%phone%'
          OR report_title ILIKE '%computer%' OR report_description ILIKE '%computer%' THEN
        RETURN 'Electronic Waste';
    ELSIF report_title ILIKE '%construction%' OR report_description ILIKE '%construction%'
          OR report_title ILIKE '%cement%' OR report_description ILIKE '%cement%'
          OR report_title ILIKE '%building%' OR report_description ILIKE '%building%' THEN
        RETURN 'Construction Waste';
    ELSIF report_title ILIKE '%chemical%' OR report_description ILIKE '%chemical%'
          OR report_title ILIKE '%toxic%' OR report_description ILIKE '%toxic%'
          OR report_title ILIKE '%hazardous%' OR report_description ILIKE '%hazardous%' THEN
        RETURN 'Hazardous Waste';
    ELSIF report_title ILIKE '%dump%' OR report_description ILIKE '%dump%'
          OR report_title ILIKE '%illegal%' OR report_description ILIKE '%illegal%' THEN
        RETURN 'Illegal Dumping';
    ELSE
        RETURN 'General Waste';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to determine report priority using AI (placeholder)
CREATE OR REPLACE FUNCTION determine_report_priority(report_title TEXT, report_description TEXT, report_location JSONB)
RETURNS TEXT AS $$
BEGIN
    -- This is a simplified priority determination function
    -- In production, this would integrate with Gemini API
    -- For now, using basic keyword matching

    IF report_title ILIKE '%urgent%' OR report_description ILIKE '%urgent%'
       OR report_title ILIKE '%emergency%' OR report_description ILIKE '%emergency%'
       OR report_title ILIKE '%dangerous%' OR report_description ILIKE '%dangerous%' THEN
        RETURN 'urgent';
    ELSIF report_title ILIKE '%school%' OR report_description ILIKE '%school%'
          OR report_title ILIKE '%hospital%' OR report_description ILIKE '%hospital%'
          OR report_title ILIKE '%water%' OR report_description ILIKE '%water%'
          OR report_location->>'lat' IS NOT NULL THEN
        RETURN 'high';
    ELSIF report_title ILIKE '%large%' OR report_description ILIKE '%large%'
          OR report_title ILIKE '%dump%' OR report_description ILIKE '%dump%' THEN
        RETURN 'medium';
    ELSE
        RETURN 'low';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to create notifications for admins when new reports are submitted
CREATE OR REPLACE FUNCTION notify_admins_on_new_report()
RETURNS TRIGGER AS $$
DECLARE
    admin_record RECORD;
    category TEXT;
    priority TEXT;
BEGIN
    -- Get AI categorization and priority
    category := categorize_report_ai(NEW.title, NEW.description);
    priority := determine_report_priority(NEW.title, NEW.description, NEW.location);

    -- Update the report with AI results
    NEW.category := category;
    NEW.priority := priority;

    -- Notify all admins
    FOR admin_record IN
        SELECT id FROM public.user_profiles WHERE role = 'admin'
    LOOP
        INSERT INTO public.notifications (user_id, title, message, type, data)
        VALUES (
            admin_record.id,
            'New Report Submitted',
            'A new ' || category || ' report "' || NEW.title || '" has been submitted and needs review.',
            'report_submitted',
            jsonb_build_object(
                'report_id', NEW.id,
                'report_title', NEW.title,
                'category', category,
                'priority', priority
            )
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create notifications when report status changes
CREATE OR REPLACE FUNCTION notify_user_on_report_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create notification if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Notify the report owner
        IF NEW.status = 'approved' THEN
            INSERT INTO public.notifications (user_id, title, message, type, data)
            VALUES (
                NEW.user_id,
                'Report Approved! 🎉',
                'Your report "' || NEW.title || '" has been approved and is now visible to the community.',
                'report_approved',
                jsonb_build_object('report_id', NEW.id, 'report_title', NEW.title)
            );
        ELSIF NEW.status = 'rejected' THEN
            INSERT INTO public.notifications (user_id, title, message, type, data)
            VALUES (
                NEW.user_id,
                'Report Update',
                'Your report "' || NEW.title || '" has been reviewed.',
                'report_rejected',
                jsonb_build_object('report_id', NEW.id, 'report_title', NEW.title)
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS FOR AUTOMATION
-- =============================================================================

-- Trigger to automatically categorize and notify admins when new reports are created
CREATE OR REPLACE TRIGGER trigger_categorize_and_notify_admins
    BEFORE INSERT ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION notify_admins_on_new_report();

-- Trigger to notify users when report status changes
CREATE OR REPLACE TRIGGER trigger_notify_user_on_status_change
    AFTER UPDATE OF status ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION notify_user_on_report_status_change();

-- =============================================================================
-- FUNCTIONS FOR USER PROFILE MANAGEMENT
-- =============================================================================

-- Function to automatically create user profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'user'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create user profile automatically
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- UTILITY FUNCTIONS
-- =============================================================================

-- Function to get user's unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(user_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
    count_result INTEGER;
BEGIN
    SELECT COUNT(*) INTO count_result
    FROM public.notifications
    WHERE user_id = user_id_param AND read = false;

    RETURN COALESCE(count_result, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(user_id_param UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.notifications
    SET read = true, updated_at = NOW()
    WHERE user_id = user_id_param AND read = false;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SAMPLE DATA (Optional - for development/testing)
-- =============================================================================

-- Insert sample admin user (replace with actual admin email)
-- INSERT INTO public.user_profiles (id, email, full_name, role)
-- VALUES (
--     'admin-uuid-here',
--     'admin@cleancal.com',
--     'CleanCal Admin',
--     'admin'
-- ) ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- VIEWS FOR ANALYTICS
-- =============================================================================

-- View for report analytics
CREATE OR REPLACE VIEW report_analytics AS
SELECT
    DATE(created_at) as report_date,
    status,
    category,
    priority,
    COUNT(*) as count
FROM public.reports
GROUP BY DATE(created_at), status, category, priority
ORDER BY report_date DESC;

-- View for user activity analytics
CREATE OR REPLACE VIEW user_activity_analytics AS
SELECT
    u.id as user_id,
    u.full_name,
    u.role,
    COUNT(DISTINCT r.id) as reports_created,
    COUNT(DISTINCT e.id) as events_created,
    COUNT(DISTINCT ab.id) as bookings_made,
    MAX(GREATEST(
        COALESCE(r.created_at, '1970-01-01'::timestamp),
        COALESCE(e.created_at, '1970-01-01'::timestamp),
        COALESCE(ab.created_at, '1970-01-01'::timestamp)
    )) as last_activity
FROM public.user_profiles u
LEFT JOIN public.reports r ON u.id = r.user_id
LEFT JOIN public.events e ON u.id = e.user_id
LEFT JOIN public.agent_bookings ab ON u.id = ab.user_id
GROUP BY u.id, u.full_name, u.role;

-- =============================================================================
-- GRANTS AND PERMISSIONS
-- =============================================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_bookings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE public.reports IS 'Waste reports submitted by users with AI categorization and priority assessment';
COMMENT ON TABLE public.events IS 'Community cleanup events organized by users';
COMMENT ON TABLE public.agent_bookings IS 'Bookings for cleanup services by certified agents';
COMMENT ON TABLE public.user_profiles IS 'Extended user profile information beyond auth.users';
COMMENT ON TABLE public.notifications IS 'Real-time notifications for users about report status changes and system updates';

COMMENT ON FUNCTION categorize_report_ai IS 'AI-powered categorization of waste reports based on title and description';
COMMENT ON FUNCTION determine_report_priority IS 'AI-powered priority assessment for waste reports';
COMMENT ON FUNCTION notify_admins_on_new_report IS 'Automatically notifies admins when new reports are submitted';
COMMENT ON FUNCTION notify_user_on_report_status_change IS 'Notifies users when their report status changes';

-- =============================================================================
-- SETUP COMPLETE
-- =============================================================================

-- The database is now fully configured for the CleanCal platform!
-- All tables, indexes, policies, functions, and triggers are in place.
-- The application should work seamlessly with real-time features and AI integration.
