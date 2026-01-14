-- Ensure category_id is required for products
-- This prevents orphan products without a sub-category

-- First, let's add a CHECK constraint to ensure category_id is not null for new products
-- We'll use a trigger to validate on INSERT and UPDATE

CREATE OR REPLACE FUNCTION public.validate_product_category()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure category_id (sub-category) is provided and not null
  IF NEW.category_id IS NULL THEN
    RAISE EXCEPTION 'Sub-category is required to create or update a product.';
  END IF;
  
  -- Verify the category_id exists and is a valid sub-category (has a parent_id)
  IF NOT EXISTS (
    SELECT 1 FROM public.categories 
    WHERE id = NEW.category_id 
    AND parent_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Invalid sub-category. The selected category must be a valid sub-category.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS validate_product_category_trigger ON public.products;

-- Create trigger for INSERT and UPDATE
CREATE TRIGGER validate_product_category_trigger
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_product_category();