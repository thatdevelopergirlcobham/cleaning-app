-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Add RLS policies for comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Everyone can read comments
CREATE POLICY "Comments are viewable by everyone" ON public.comments
    FOR SELECT USING (true);

-- Authenticated users can insert comments
CREATE POLICY "Authenticated users can insert comments" ON public.comments
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated'
        OR 
        (is_anonymous = true AND auth.role() = 'anon')
    );

-- Users can update their own comments
CREATE POLICY "Users can update own comments" ON public.comments
    FOR UPDATE USING (
        auth.uid() = user_id
    );

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments" ON public.comments
    FOR DELETE USING (
        auth.uid() = user_id
    );

-- Create indexes for performance
CREATE INDEX comments_report_id_idx ON public.comments(report_id);
CREATE INDEX comments_user_id_idx ON public.comments(user_id);
CREATE INDEX comments_created_at_idx ON public.comments(created_at);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER comments_handle_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();