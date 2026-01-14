-- Drop the existing restrictive insert policy for orders
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;

-- Create a new policy that allows both authenticated users and guest orders
-- Authenticated users: user_id must match their auth.uid()
-- Guest orders: user_id is null (anyone can insert)
CREATE POLICY "Users and guests can create orders"
ON public.orders
FOR INSERT
WITH CHECK (
  (user_id IS NULL) OR (auth.uid() = user_id)
);

-- Also need to update order_items insert policy to allow guest order items
DROP POLICY IF EXISTS "Users can insert order items" ON public.order_items;

CREATE POLICY "Users and guests can insert order items"
ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND ((orders.user_id IS NULL) OR (orders.user_id = auth.uid()))
  )
);