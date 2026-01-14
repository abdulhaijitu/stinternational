-- Remove the sub-category validation trigger since sub-category is now optional
DROP TRIGGER IF EXISTS validate_product_category_trigger ON public.products;
DROP FUNCTION IF EXISTS public.validate_product_category();