-- ==========================================================================
-- MONEY SOLUTIONS: SUPABASE SCHEMA FOR LEADS
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==========================================================================

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.leads (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    loan_type TEXT DEFAULT 'Personal Loan',
    loan_amount TEXT DEFAULT '',
    source_url TEXT DEFAULT '',
    utm_source TEXT DEFAULT '',
    utm_medium TEXT DEFAULT '',
    utm_campaign TEXT DEFAULT '',
    utm_content TEXT DEFAULT '',
    utm_term TEXT DEFAULT '',
    ip_address TEXT DEFAULT '',
    user_agent TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index on mobile and created_at for fast query performance
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_mobile ON public.leads (mobile);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 4. Allow anon and service_role to insert new leads
CREATE POLICY "Allow public insert on leads" 
ON public.leads 
FOR INSERT 
TO anon, authenticated, service_role 
WITH CHECK (true);

-- 5. Allow read access for leads
CREATE POLICY "Allow select on leads" 
ON public.leads 
FOR SELECT 
TO anon, authenticated, service_role 
USING (true);
