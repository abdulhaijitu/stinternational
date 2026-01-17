-- Add created_by column to products table for audit trail
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Create index for efficient querying by creator
CREATE INDEX IF NOT EXISTS idx_products_created_by ON public.products(created_by);

-- Comment for documentation
COMMENT ON COLUMN public.products.created_by IS 'User ID of the admin who created this product';