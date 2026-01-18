-- Add SEO module permissions
INSERT INTO public.permissions (module, action, description)
VALUES 
  ('seo', 'view', 'View SEO settings and previews'),
  ('seo', 'edit', 'Edit SEO settings')
ON CONFLICT DO NOTHING;

-- Give admin role SEO permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin', id FROM public.permissions WHERE module = 'seo'
ON CONFLICT DO NOTHING;