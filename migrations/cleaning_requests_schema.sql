-- Create cleaning_requests table
CREATE TABLE IF NOT EXISTS public.cleaning_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    description TEXT NOT NULL,
    service_date DATE NOT NULL,
    service_time TIME NOT NULL,
    location JSONB, -- Stores lat/lng like reports
    space_size TEXT CHECK (space_size IN ('small', 'medium', 'large')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
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

-- Add RLS policies
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

-- Create indexes
CREATE INDEX cleaning_requests_user_id_idx ON public.cleaning_requests(user_id);
CREATE INDEX cleaning_requests_status_idx ON public.cleaning_requests(status);
CREATE INDEX cleaning_requests_service_date_idx ON public.cleaning_requests(service_date);

-- Add trigger for updated_at
CREATE OR REPLACE TRIGGER cleaning_requests_handle_updated_at
    BEFORE UPDATE ON public.cleaning_requests
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();