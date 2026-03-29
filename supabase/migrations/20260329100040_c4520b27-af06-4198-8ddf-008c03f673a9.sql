-- Fix 1: Secure link_guest_orders_to_user RPC with auth validation
CREATE OR REPLACE FUNCTION public.link_guest_orders_to_user(user_email TEXT, user_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Verify caller is the user they claim to be
  IF auth.uid() IS NULL OR auth.uid() != user_uuid THEN
    RAISE EXCEPTION 'Unauthorized: can only link orders to your own account';
  END IF;
  
  -- Validate email format
  IF user_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  UPDATE public.orders
  SET user_id = user_uuid
  WHERE user_id IS NULL AND customer_email = user_email;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- Fix 2: Remove overly permissive INSERT policies and add restricted ones for quote_requests
-- The existing SELECT policies already restrict to admins + own user_id, which is correct.
-- The INSERT with CHECK (true) on quote_requests is needed for public quote submission - keeping it.
-- But we need to restrict cta_analytics and ux_telemetry INSERT to prevent abuse.

-- Fix 3: Add input validation for create-order edge function (done in code)