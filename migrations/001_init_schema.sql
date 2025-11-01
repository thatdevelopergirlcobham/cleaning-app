-- Create shared functions for all tables
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the handle_updated_at function that will be used by multiple tables
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create report comments table
CREATE TABLE IF NOT EXISTS public.report_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS policies for report comments
ALTER TABLE public.report_comments ENABLE ROW LEVEL SECURITY;

-- Everyone can read comments on reports
CREATE POLICY "Comments are viewable by everyone" ON public.report_comments
    FOR SELECT USING (true);

-- Authenticated users can insert comments
CREATE POLICY "Users can insert comments" ON public.report_comments
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' 
        OR 
        (is_anonymous = true AND auth.role() = 'anon')
    );

-- Users can update their own comments
CREATE POLICY "Users can update own comments" ON public.report_comments
    FOR UPDATE USING (
        auth.uid() = user_id
    );

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments" ON public.report_comments
    FOR DELETE USING (
        auth.uid() = user_id
    );

-- Create indexes for performance
CREATE INDEX report_comments_report_id_idx ON public.report_comments(report_id);
CREATE INDEX report_comments_user_id_idx ON public.report_comments(user_id);
CREATE INDEX report_comments_created_at_idx ON public.report_comments(created_at);

-- Add trigger for updated_at timestamp
CREATE TRIGGER report_comments_handle_updated_at
    BEFORE UPDATE ON public.report_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Add comment count to reports
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- Create function to update comment count
CREATE OR REPLACE FUNCTION public.update_report_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.reports
        SET comments_count = comments_count + 1
        WHERE id = NEW.report_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.reports
        SET comments_count = comments_count - 1
        WHERE id = OLD.report_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger to maintain comment count
CREATE TRIGGER report_comments_count_trigger
    AFTER INSERT OR DELETE ON public.report_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_report_comment_count();

-- Create cleaning requests table
CREATE TABLE IF NOT EXISTS public.cleaning_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    description TEXT NOT NULL,
    service_date DATE NOT NULL,
    service_time TIME NOT NULL,
    location JSONB,
    space_size TEXT CHECK (space_size IN ('small', 'medium', 'large')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    contact_phone TEXT,
    contact_email TEXT,
    notes TEXT,
    amount_due DECIMAL(10,2) GENERATED ALWAYS AS (
        CASE
            WHEN space_size = 'small' THEN 2500
            WHEN space_size = 'medium' THEN 5000
            WHEN space_size = 'large' THEN 8000
            ELSE 0
        END
    ) STORED
);

-- Add RLS policies for cleaning requests
ALTER TABLE public.cleaning_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own requests" ON public.cleaning_requests
    FOR SELECT USING (
        auth.uid() = user_id
    );

-- Admins can view all requests
CREATE POLICY "Admins can view all requests" ON public.cleaning_requests
    FOR SELECT USING (
        auth.role() = 'authenticated' AND EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND role = 'admin'
        )
    );

-- Users can insert requests
CREATE POLICY "Users can insert requests" ON public.cleaning_requests
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated'
    );

-- Users can update their own requests (only if not completed/cancelled)
CREATE POLICY "Users can update own pending requests" ON public.cleaning_requests
    FOR UPDATE USING (
        auth.uid() = user_id 
        AND status NOT IN ('completed', 'cancelled')
    );

-- Create indexes for cleaning requests
CREATE INDEX cleaning_requests_user_id_idx ON public.cleaning_requests(user_id);
CREATE INDEX cleaning_requests_status_idx ON public.cleaning_requests(status);
CREATE INDEX cleaning_requests_service_date_idx ON public.cleaning_requests(service_date);

-- Add trigger for updated_at timestamp
CREATE TRIGGER cleaning_requests_handle_updated_at
    BEFORE UPDATE ON public.cleaning_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();