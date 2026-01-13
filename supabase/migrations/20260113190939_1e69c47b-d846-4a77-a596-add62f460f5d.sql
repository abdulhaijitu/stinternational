-- Add is_active column to categories for visibility control
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Update existing categories to be active
UPDATE public.categories SET is_active = true WHERE is_active IS NULL;