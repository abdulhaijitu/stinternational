-- Create wishlist table
CREATE TABLE public.wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Users can view their own wishlist
CREATE POLICY "Users can view their own wishlist"
ON public.wishlists
FOR SELECT
USING (auth.uid() = user_id);

-- Users can add to their own wishlist
CREATE POLICY "Users can add to their own wishlist"
ON public.wishlists
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can remove from their own wishlist
CREATE POLICY "Users can remove from their own wishlist"
ON public.wishlists
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX idx_wishlists_product_id ON public.wishlists(product_id);