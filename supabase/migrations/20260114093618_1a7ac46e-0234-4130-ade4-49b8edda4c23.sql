-- Add DELETE policy for orders table - Super Admin only
CREATE POLICY "Super admins can delete orders"
ON public.orders
FOR DELETE
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Add DELETE policy for order_items table - Super Admin only
CREATE POLICY "Super admins can delete order items"
ON public.order_items
FOR DELETE
USING (has_role(auth.uid(), 'super_admin'::app_role));