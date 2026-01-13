-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  designation TEXT,
  quote TEXT NOT NULL,
  avatar_url TEXT,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Public can view active testimonials
CREATE POLICY "Public can view active testimonials"
  ON public.testimonials
  FOR SELECT
  USING (is_active = true);

-- Admins can manage testimonials
CREATE POLICY "Admins can manage testimonials"
  ON public.testimonials
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add some sample testimonials
INSERT INTO public.testimonials (client_name, company_name, designation, quote, rating, display_order) VALUES
('Dr. Mohammad Rahman', 'Dhaka Medical College', 'Head of Laboratory', 'ST International has been our trusted partner for laboratory equipment for over 5 years. Their quality products and excellent after-sales service have been invaluable to our research.', 5, 1),
('Prof. Fatima Begum', 'Bangladesh University of Engineering', 'Department Chair', 'The scientific instruments we procured from ST International are of exceptional quality. Their team understands our academic requirements perfectly.', 5, 2),
('Ahmed Hossain', 'Square Pharmaceuticals Ltd.', 'Procurement Manager', 'Reliable delivery, competitive pricing, and genuine products. ST International is our go-to supplier for industrial equipment.', 5, 3);