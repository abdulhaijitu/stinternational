-- Add RLS policy to allow admins to view ALL products (including inactive ones)
-- This fixes the issue where admins couldn't edit inactive products

CREATE POLICY "Admins can view all products"
ON public.products
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));