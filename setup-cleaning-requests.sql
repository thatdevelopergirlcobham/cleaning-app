-- Create cleaning requests table
CREATE TABLE IF NOT EXISTS public.cleaning_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    description TEXT NOT NULL,
    service_date DATE NOT NULL,
    service_time TIME NOT NULL,
    space_size TEXT NOT NULL CHECK (space_size IN ('small', 'medium', 'large')),
    contact_phone TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    notes TEXT,
    location JSONB,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cleaning_requests_user_id ON public.cleaning_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_requests_status ON public.cleaning_requests(status);
CREATE INDEX IF NOT EXISTS idx_cleaning_requests_service_date ON public.cleaning_requests(service_date);
CREATE INDEX IF NOT EXISTS idx_cleaning_requests_space_size ON public.cleaning_requests(space_size);

-- Enable Row Level Security
ALTER TABLE public.cleaning_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own cleaning requests"
ON public.cleaning_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create cleaning requests"
ON public.cleaning_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cleaning requests"
ON public.cleaning_requests FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cleaning requests"
ON public.cleaning_requests FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger function for updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language plpgsql;

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.cleaning_requests
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cleaning_requests TO authenticated;

-- Create notification function for new cleaning requests
CREATE OR REPLACE FUNCTION notify_on_cleaning_request()
RETURNS TRIGGER AS $$
BEGIN
    -- Notify admins about new cleaning request
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        data
    )
    SELECT
        id,
        'New Cleaning Request',
        'A new cleaning request has been submitted by ' || NEW.name || ' for ' || NEW.service_date::text,
        'system',
        jsonb_build_object(
            'request_id', NEW.id,
            'space_size', NEW.space_size,
            'service_date', NEW.service_date
        )
    FROM public.user_profiles
    WHERE role = 'admin';

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for cleaning request notifications
CREATE TRIGGER on_cleaning_request_created
    AFTER INSERT ON public.cleaning_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_cleaning_request();