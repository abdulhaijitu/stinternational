-- Create table for CTA analytics tracking
CREATE TABLE public.cta_analytics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL, -- 'click', 'rfq_submit'
    cta_variant TEXT NOT NULL, -- 'browse_products', 'request_quote'
    session_id TEXT, -- Optional session tracking
    user_agent TEXT,
    referrer TEXT,
    page_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cta_analytics ENABLE ROW LEVEL SECURITY;

-- Allow public inserts for analytics (anonymous tracking)
CREATE POLICY "Allow public insert for analytics" 
ON public.cta_analytics 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view analytics
CREATE POLICY "Admins can view analytics" 
ON public.cta_analytics 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Create table for institution logos (future admin management)
CREATE TABLE public.institution_logos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.institution_logos ENABLE ROW LEVEL SECURITY;

-- Public can view active logos
CREATE POLICY "Public can view active logos" 
ON public.institution_logos 
FOR SELECT 
USING (is_active = true);

-- Admins can manage logos
CREATE POLICY "Admins can manage logos" 
ON public.institution_logos 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_institution_logos_updated_at
BEFORE UPDATE ON public.institution_logos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample institution logos for demonstration
INSERT INTO public.institution_logos (name, logo_url, display_order) VALUES
('Dhaka University', '/placeholder.svg', 1),
('BUET', '/placeholder.svg', 2),
('Bangladesh Council of Scientific and Industrial Research', '/placeholder.svg', 3),
('Square Pharmaceuticals', '/placeholder.svg', 4),
('Beximco Pharmaceuticals', '/placeholder.svg', 5),
('Atomic Energy Commission', '/placeholder.svg', 6);