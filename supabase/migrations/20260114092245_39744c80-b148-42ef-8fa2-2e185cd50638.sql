-- Add source_page and language columns to quote_requests for activity tracking
ALTER TABLE public.quote_requests 
ADD COLUMN IF NOT EXISTS source_page TEXT DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';