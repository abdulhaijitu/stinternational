-- Create page_seo table for static page SEO management
CREATE TABLE public.page_seo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug TEXT NOT NULL UNIQUE,
  page_name TEXT NOT NULL,
  seo_title TEXT,
  seo_title_bn TEXT,
  seo_description TEXT,
  seo_description_bn TEXT,
  seo_keywords TEXT,
  seo_keywords_bn TEXT,
  og_image TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_seo ENABLE ROW LEVEL SECURITY;

-- Public can view active page SEO
CREATE POLICY "Public can view active page SEO"
ON public.page_seo
FOR SELECT
USING (is_active = true);

-- Admins can manage page SEO
CREATE POLICY "Admins can manage page SEO"
ON public.page_seo
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_page_seo_updated_at
BEFORE UPDATE ON public.page_seo
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default pages
INSERT INTO public.page_seo (page_slug, page_name, seo_title, seo_title_bn, seo_description, seo_description_bn) VALUES
('home', 'Homepage', 'ST International - Industrial Equipment Supplier in Bangladesh', 'এসটি ইন্টারন্যাশনাল - বাংলাদেশে শিল্প সরঞ্জাম সরবরাহকারী', 'Leading supplier of industrial equipment, laboratory instruments, and safety products in Bangladesh. Quality products for hospitals, universities, and industries.', 'বাংলাদেশের শীর্ষস্থানীয় শিল্প সরঞ্জাম, ল্যাবরেটরি যন্ত্রপাতি এবং নিরাপত্তা পণ্য সরবরাহকারী।'),
('about', 'About Us', 'About ST International - Your Trusted Industrial Partner', 'এসটি ইন্টারন্যাশনাল সম্পর্কে', 'Learn about ST International, our mission, values, and commitment to providing quality industrial equipment in Bangladesh.', 'এসটি ইন্টারন্যাশনাল সম্পর্কে জানুন - আমাদের মিশন, মূল্যবোধ এবং মানসম্মত শিল্প সরঞ্জাম সরবরাহের প্রতিশ্রুতি।'),
('contact', 'Contact Us', 'Contact ST International - Get in Touch', 'যোগাযোগ করুন - এসটি ইন্টারন্যাশনাল', 'Contact ST International for inquiries about industrial equipment, laboratory instruments, and bulk orders.', 'শিল্প সরঞ্জাম, ল্যাবরেটরি যন্ত্রপাতি এবং বাল্ক অর্ডার সম্পর্কে জিজ্ঞাসার জন্য যোগাযোগ করুন।'),
('products', 'All Products', 'Industrial Products & Equipment - ST International', 'শিল্প পণ্য ও সরঞ্জাম - এসটি ইন্টারন্যাশনাল', 'Browse our complete catalog of industrial equipment, laboratory instruments, safety gear, and more.', 'আমাদের শিল্প সরঞ্জাম, ল্যাবরেটরি যন্ত্রপাতি, নিরাপত্তা সরঞ্জাম এবং আরও অনেক কিছুর সম্পূর্ণ ক্যাটালগ দেখুন।'),
('categories', 'Categories', 'Product Categories - ST International', 'পণ্য বিভাগ - এসটি ইন্টারন্যাশনাল', 'Explore our product categories including laboratory equipment, industrial supplies, safety gear, and more.', 'ল্যাবরেটরি সরঞ্জাম, শিল্প সরবরাহ, নিরাপত্তা সরঞ্জাম সহ আমাদের পণ্য বিভাগ অন্বেষণ করুন।'),
('request-quote', 'Request Quote', 'Request a Quote - ST International', 'কোটেশন অনুরোধ - এসটি ইন্টারন্যাশনাল', 'Request a custom quote for bulk orders, institutional purchases, or special requirements.', 'বাল্ক অর্ডার, প্রাতিষ্ঠানিক ক্রয় বা বিশেষ প্রয়োজনের জন্য কাস্টম কোটেশন অনুরোধ করুন।'),
('privacy-policy', 'Privacy Policy', 'Privacy Policy - ST International', 'গোপনীয়তা নীতি - এসটি ইন্টারন্যাশনাল', 'Read our privacy policy to understand how we collect, use, and protect your personal information.', 'আমরা কীভাবে আপনার ব্যক্তিগত তথ্য সংগ্রহ, ব্যবহার এবং সুরক্ষিত করি তা বোঝার জন্য আমাদের গোপনীয়তা নীতি পড়ুন।'),
('terms-conditions', 'Terms & Conditions', 'Terms and Conditions - ST International', 'শর্তাবলী - এসটি ইন্টারন্যাশনাল', 'Read our terms and conditions for using our services and purchasing products.', 'আমাদের পরিষেবা ব্যবহার এবং পণ্য ক্রয়ের জন্য আমাদের শর্তাবলী পড়ুন।'),
('refund-policy', 'Refund Policy', 'Refund Policy - ST International', 'ফেরত নীতি - এসটি ইন্টারন্যাশনাল', 'Learn about our refund and return policy for products purchased from ST International.', 'এসটি ইন্টারন্যাশনাল থেকে কেনা পণ্যের জন্য আমাদের ফেরত এবং রিটার্ন নীতি সম্পর্কে জানুন।');