-- Add 'create' permission for orders module (for Super Admin manual order creation)
INSERT INTO public.permissions (module, action, description)
VALUES ('orders', 'create', 'Create new orders manually')
ON CONFLICT DO NOTHING;

-- Assign orders:create permission to super_admin role
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'super_admin', p.id
FROM public.permissions p
WHERE p.module = 'orders' AND p.action = 'create'
ON CONFLICT DO NOTHING;