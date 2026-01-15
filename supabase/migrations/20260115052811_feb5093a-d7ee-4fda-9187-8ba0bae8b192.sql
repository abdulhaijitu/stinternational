-- Add SEO fields to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_title_bn TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS seo_description_bn TEXT,
ADD COLUMN IF NOT EXISTS seo_keywords TEXT,
ADD COLUMN IF NOT EXISTS seo_keywords_bn TEXT,
ADD COLUMN IF NOT EXISTS og_image TEXT;

-- Add SEO fields to categories table
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_title_bn TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS seo_description_bn TEXT,
ADD COLUMN IF NOT EXISTS seo_keywords TEXT,
ADD COLUMN IF NOT EXISTS seo_keywords_bn TEXT,
ADD COLUMN IF NOT EXISTS og_image TEXT;

-- Add index for faster SEO lookups
CREATE INDEX IF NOT EXISTS idx_products_seo ON public.products(seo_title, seo_description);
CREATE INDEX IF NOT EXISTS idx_categories_seo ON public.categories(seo_title, seo_description);