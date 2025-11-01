-- Create extension for gen_random_uuid if not present (required for default uuid generation)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  image_url text NULL,
  location jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  votes integer NULL DEFAULT 0,
  comments_count integer NULL DEFAULT 0,
  is_resolved boolean NULL DEFAULT false,
  resolved_at timestamptz NULL,
  type text NULL,
  severity text NULL,
  area text NULL,
  tags text[] NULL DEFAULT '{}'::text[],
  category text NULL,
  priority text NULL,
  is_anonymous boolean NULL DEFAULT false,
  resolution_status text NULL,
  resolved_by uuid NULL,
  resolution_notes text NULL,
  CONSTRAINT reports_pkey PRIMARY KEY (id),
  CONSTRAINT reports_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES auth.users (id),
  CONSTRAINT reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id),
  CONSTRAINT reports_priority_check CHECK ( priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]) ),
  CONSTRAINT reports_severity_check CHECK ( severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]) ),
  CONSTRAINT reports_status_check CHECK ( status = ANY (ARRAY['pending'::text,'approved'::text,'rejected'::text,'resolved'::text]) )
);

-- Create or replace function to update updated_at timestamp on update
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger to call the function
DROP TRIGGER IF EXISTS update_reports_updated_at ON public.reports;
CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Policies
-- Allow anyone (including anon) to SELECT reports (useful for public listing). Change to stricter policy if needed.
CREATE POLICY "Reports are viewable by everyone" ON public.reports
  FOR SELECT USING (true);

-- Allow authenticated users to INSERT reports where auth.uid() matches user_id
CREATE POLICY "Users can create their own reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own reports
CREATE POLICY "Users can update their own reports" ON public.reports
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow authenticated users to delete their own reports
CREATE POLICY "Users can delete their own reports" ON public.reports
  FOR DELETE USING (auth.uid() = user_id);

-- Storage policies for the images bucket (run these in the storage context)
-- Note: storage policies are managed in the storage schema. Example policies below can be adapted
-- in Supabase Storage > Policies section. They are included here for reference.
-- Allow authenticated users to upload to the 'images' bucket
-- CREATE POLICY "Anyone can upload an image" ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'images' AND (request.jwt.claims ->> 'sub')::text IS NOT NULL);

-- Allow public read access to objects in the images bucket (for public image URLs)
-- CREATE POLICY "Images are publicly accessible" ON storage.objects FOR SELECT
-- USING (bucket_id = 'images');

-- Helpful: grant select on reports to anon role if you are not using RLS policies above
-- GRANT SELECT ON public.reports TO anon;

-- End of file
