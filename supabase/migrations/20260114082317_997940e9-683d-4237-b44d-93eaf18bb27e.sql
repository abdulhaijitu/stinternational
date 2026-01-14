-- Drop the existing INSERT policy for orders
DROP POLICY IF EXISTS "Users and guests can create orders" ON public.orders;

-- Create a more robust INSERT policy that handles both authenticated and anonymous users
CREATE POLICY "Users and guests can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (
  -- Guest checkout (user_id is null) - allowed for everyone
  (user_id IS NULL)
  OR 
  -- Authenticated users can only create orders with their own user_id
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
);