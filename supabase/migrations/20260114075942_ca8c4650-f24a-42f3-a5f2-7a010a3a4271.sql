-- Create a function to link guest orders to a user by matching email
-- This is called after a user signs up to associate their previous guest orders
CREATE OR REPLACE FUNCTION public.link_guest_orders_to_user(user_email TEXT, user_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Update orders where user_id is null and email matches
  UPDATE public.orders
  SET user_id = user_uuid
  WHERE user_id IS NULL
    AND customer_email = user_email;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.link_guest_orders_to_user(TEXT, UUID) TO authenticated;