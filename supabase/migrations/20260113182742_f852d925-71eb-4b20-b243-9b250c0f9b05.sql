-- Create quote_requests table for B2B lead capture
CREATE TABLE public.quote_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Step 1: Company Information
  company_name TEXT NOT NULL,
  company_type TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  
  -- Step 2: Product Requirements
  product_category TEXT NOT NULL,
  product_details TEXT NOT NULL,
  quantity TEXT NOT NULL,
  budget_range TEXT,
  
  -- Step 3: Delivery Preferences
  delivery_address TEXT NOT NULL,
  delivery_city TEXT NOT NULL,
  delivery_urgency TEXT NOT NULL,
  preferred_payment TEXT,
  additional_notes TEXT,
  
  -- Metadata
  status TEXT NOT NULL DEFAULT 'pending',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit a quote request (for non-logged in users too)
CREATE POLICY "Anyone can create quote requests" 
ON public.quote_requests 
FOR INSERT 
WITH CHECK (true);

-- Users can view their own quote requests
CREATE POLICY "Users can view their own quote requests" 
ON public.quote_requests 
FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can view all quote requests
CREATE POLICY "Admins can view all quote requests" 
ON public.quote_requests 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can update quote requests
CREATE POLICY "Admins can update quote requests" 
ON public.quote_requests 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_quote_requests_updated_at
BEFORE UPDATE ON public.quote_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();