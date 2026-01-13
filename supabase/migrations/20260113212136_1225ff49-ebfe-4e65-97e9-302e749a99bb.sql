-- Create permissions table for granular access control
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(module, action)
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(role, permission_id)
);

-- Create admin_preferences table for storing admin language preference
CREATE TABLE IF NOT EXISTS public.admin_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_preferences ENABLE ROW LEVEL SECURITY;

-- Permissions table - readable by all authenticated admins
CREATE POLICY "Admins can view permissions" ON public.permissions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'accounts') OR public.has_role(auth.uid(), 'sales'));

-- Role permissions - readable by admins, modifiable by super_admin only
CREATE POLICY "Admins can view role_permissions" ON public.role_permissions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'accounts') OR public.has_role(auth.uid(), 'sales'));

CREATE POLICY "Super admins can insert role_permissions" ON public.role_permissions
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update role_permissions" ON public.role_permissions
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete role_permissions" ON public.role_permissions
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Admin preferences - users can manage their own preferences
CREATE POLICY "Users can view their own admin preferences" ON public.admin_preferences
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own admin preferences" ON public.admin_preferences
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own admin preferences" ON public.admin_preferences
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Insert default permissions for all modules
INSERT INTO public.permissions (module, action, description) VALUES
  ('dashboard', 'view', 'View dashboard statistics'),
  ('products', 'view', 'View products'),
  ('products', 'create', 'Create products'),
  ('products', 'edit', 'Edit products'),
  ('products', 'delete', 'Delete products'),
  ('categories', 'view', 'View categories'),
  ('categories', 'create', 'Create categories'),
  ('categories', 'edit', 'Edit categories'),
  ('categories', 'delete', 'Delete categories'),
  ('orders', 'view', 'View orders'),
  ('orders', 'edit', 'Update order status'),
  ('orders', 'delete', 'Delete orders'),
  ('rfq', 'view', 'View quote requests'),
  ('rfq', 'respond', 'Respond to quote requests'),
  ('rfq', 'delete', 'Delete quote requests'),
  ('payments', 'view', 'View payment information'),
  ('payments', 'update', 'Update payment status'),
  ('reports', 'view', 'View reports and analytics'),
  ('reports', 'export', 'Export reports'),
  ('users', 'view', 'View user list'),
  ('users', 'edit', 'Edit user information'),
  ('roles', 'view', 'View roles and permissions'),
  ('roles', 'manage', 'Manage roles and permissions'),
  ('settings', 'view', 'View system settings'),
  ('settings', 'edit', 'Edit system settings'),
  ('logos', 'view', 'View institution logos'),
  ('logos', 'manage', 'Manage institution logos'),
  ('testimonials', 'view', 'View testimonials'),
  ('testimonials', 'manage', 'Manage testimonials'),
  ('ux_insights', 'view', 'View UX insights and analytics')
ON CONFLICT (module, action) DO NOTHING;

-- Create function to check user permission
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _module TEXT, _action TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role = rp.role
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = _user_id
      AND p.module = _module
      AND p.action = _action
  )
  OR EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = 'super_admin'
  )
$$;

-- Function to check if user has any admin-level role
CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role IN ('admin', 'super_admin', 'accounts', 'sales', 'moderator')
  )
$$;

-- Assign default permissions to roles
-- Admin role permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin', p.id FROM public.permissions p
WHERE p.module IN ('dashboard', 'products', 'categories', 'orders', 'rfq', 'reports', 'logos', 'testimonials', 'ux_insights')
ON CONFLICT (role, permission_id) DO NOTHING;

-- Accounts role permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'accounts', p.id FROM public.permissions p
WHERE (p.module = 'dashboard' AND p.action = 'view')
   OR (p.module = 'orders' AND p.action = 'view')
   OR (p.module = 'payments')
   OR (p.module = 'reports' AND p.action = 'view')
ON CONFLICT (role, permission_id) DO NOTHING;

-- Sales role permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'sales', p.id FROM public.permissions p
WHERE (p.module = 'dashboard' AND p.action = 'view')
   OR (p.module = 'products' AND p.action = 'view')
   OR (p.module = 'orders' AND p.action = 'view')
   OR (p.module = 'rfq' AND p.action IN ('view', 'respond'))
ON CONFLICT (role, permission_id) DO NOTHING;

-- Trigger for admin_preferences updated_at
CREATE TRIGGER update_admin_preferences_updated_at
  BEFORE UPDATE ON public.admin_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();