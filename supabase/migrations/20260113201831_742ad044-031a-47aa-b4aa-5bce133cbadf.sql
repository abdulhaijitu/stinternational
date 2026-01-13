-- Add Bangla (bn) translation fields to products table for bilingual support
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS name_bn text,
ADD COLUMN IF NOT EXISTS description_bn text,
ADD COLUMN IF NOT EXISTS short_description_bn text;

-- Add Bangla translation fields to categories table
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS name_bn text,
ADD COLUMN IF NOT EXISTS description_bn text;

-- Add comments to document the fields
COMMENT ON COLUMN public.products.name_bn IS 'Product name in Bangla (optional - falls back to English name)';
COMMENT ON COLUMN public.products.description_bn IS 'Product description in Bangla (optional - falls back to English description)';
COMMENT ON COLUMN public.products.short_description_bn IS 'Short description in Bangla (optional - falls back to English)';
COMMENT ON COLUMN public.categories.name_bn IS 'Category name in Bangla (optional - falls back to English name)';
COMMENT ON COLUMN public.categories.description_bn IS 'Category description in Bangla (optional - falls back to English description)';