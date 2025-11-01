-- Create report_comments table
CREATE TABLE IF NOT EXISTS public.report_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Add RLS policies for report comments
ALTER TABLE public.report_comments ENABLE ROW LEVEL SECURITY;

-- Everyone can read comments on reports
CREATE POLICY "Comments are viewable by everyone" ON public.report_comments
    FOR SELECT USING (true);

-- Authenticated users can insert comments
CREATE POLICY "Users can insert comments" ON public.report_comments
    FOR INSERT WITH CHECK (
        -- Allow authenticated users or anonymous comments
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
CREATE OR REPLACE TRIGGER report_comments_handle_updated_at
    BEFORE UPDATE ON public.report_comments
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

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