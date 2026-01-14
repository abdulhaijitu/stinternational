-- Create storage bucket for product description images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-content',
  'product-content',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload product content images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-content');

-- Allow public read access to product content images
CREATE POLICY "Public can view product content images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-content');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update product content images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'product-content');

-- Allow authenticated users to delete product content images
CREATE POLICY "Authenticated users can delete product content images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-content');