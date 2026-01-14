-- Add parent_id column to categories table for parent/sub category hierarchy
ALTER TABLE public.categories 
ADD COLUMN parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;

-- Add index for better query performance on parent_id
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);

-- Add is_parent column to easily identify parent categories
ALTER TABLE public.categories 
ADD COLUMN is_parent boolean DEFAULT false;

-- Update existing categories to be parent categories (backward compatibility)
UPDATE public.categories SET is_parent = true WHERE parent_id IS NULL;

-- Create a function to prevent circular references
CREATE OR REPLACE FUNCTION public.prevent_category_circular_reference()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Prevent setting a category as its own parent
  IF NEW.parent_id = NEW.id THEN
    RAISE EXCEPTION 'A category cannot be its own parent';
  END IF;
  
  -- Prevent circular references (parent's parent cannot be this category)
  IF NEW.parent_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.categories 
      WHERE id = NEW.parent_id AND parent_id = NEW.id
    ) THEN
      RAISE EXCEPTION 'Circular category reference detected';
    END IF;
  END IF;
  
  -- If this category has a parent, it's not a parent category itself
  IF NEW.parent_id IS NOT NULL THEN
    NEW.is_parent := false;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to enforce category hierarchy rules
CREATE TRIGGER enforce_category_hierarchy
BEFORE INSERT OR UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.prevent_category_circular_reference();

-- Create a function to check if category can be deleted (has no sub-categories)
CREATE OR REPLACE FUNCTION public.check_category_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Check if category has sub-categories
  IF EXISTS (SELECT 1 FROM public.categories WHERE parent_id = OLD.id) THEN
    RAISE EXCEPTION 'Cannot delete category with sub-categories. Delete sub-categories first.';
  END IF;
  
  RETURN OLD;
END;
$$;

-- Create trigger to prevent deletion of parent categories with children
CREATE TRIGGER prevent_parent_category_delete
BEFORE DELETE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.check_category_delete();