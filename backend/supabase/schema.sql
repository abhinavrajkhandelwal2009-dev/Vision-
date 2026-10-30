-- ==============================================================
-- VisionIntelligence AI - Supabase Production Schema & Policies
-- Copy and paste into: Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Custom Enumerations
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('operator', 'inspector', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inspection_status') THEN
        CREATE TYPE inspection_status AS ENUM ('pending', 'passed', 'failed', 'flagged_for_review');
    END IF;
END $$;

-- 3. Users Table (Application Identity & RBAC)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role DEFAULT 'operator',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Inspections Table (Audit Records & JSONB Vision Intelligence)
CREATE TABLE IF NOT EXISTS public.inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    domain VARCHAR(100) NOT NULL,
    image_url TEXT NOT NULL,
    status inspection_status DEFAULT 'pending',
    confidence_score NUMERIC(5,2),
    raw_ai_output JSONB NOT NULL,
    operator_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. High-Performance Query Indexes
CREATE INDEX IF NOT EXISTS idx_inspections_user_id ON public.inspections(user_id);
CREATE INDEX IF NOT EXISTS idx_inspections_created_at ON public.inspections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON public.inspections(status);
CREATE INDEX IF NOT EXISTS idx_inspections_domain ON public.inspections(domain);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

-- 7. Supabase RLS Policies for Inspections
-- Service Role has unrestricted access for background workers
CREATE POLICY "Service Role Full Access" 
ON public.inspections 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Authenticated Users Can Read Inspections
CREATE POLICY "Allow authenticated read inspections" 
ON public.inspections 
FOR SELECT 
TO authenticated, anon 
USING (true);

-- Authenticated Users Can Insert Inspections
CREATE POLICY "Allow insert inspections" 
ON public.inspections 
FOR INSERT 
TO authenticated, anon 
WITH CHECK (true);

-- Allow Updating Inspections (Status Override & Notes)
CREATE POLICY "Allow update inspections" 
ON public.inspections 
FOR UPDATE 
TO authenticated, anon 
USING (true)
WITH CHECK (true);

-- 8. Supabase Storage: Create 'inspection-assets' Bucket & Security
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'inspection-assets', 
    'inspection-assets', 
    true, 
    20971520, -- 20MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 20971520,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Public Read Policy for Inspection Assets CDN
CREATE POLICY "Public Access for Inspection Assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'inspection-assets');

-- Upload Policy for Assets
CREATE POLICY "Allow Uploads to Inspection Assets"
ON storage.objects FOR INSERT
TO public, authenticated, service_role
WITH CHECK (bucket_id = 'inspection-assets');

