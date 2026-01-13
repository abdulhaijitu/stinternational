-- Add is_active and created_by columns to profiles for user management
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Add dark_mode to admin_preferences for dark mode toggle
ALTER TABLE public.admin_preferences 
ADD COLUMN IF NOT EXISTS dark_mode boolean DEFAULT false;

-- Create RLS policy for super_admin to view all profiles
CREATE POLICY "Super admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Allow super_admin to update any profile
CREATE POLICY "Super admins can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Allow admins to view profiles for user listing
CREATE POLICY "Admins can view profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow super_admins to manage user_roles
CREATE POLICY "Super admins can manage user_roles" 
ON public.user_roles 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Add users permission module
INSERT INTO public.permissions (module, action, description) 
VALUES 
  ('users', 'view', 'View user list'),
  ('users', 'create', 'Create new users'),
  ('users', 'update', 'Update user details'),
  ('users', 'delete', 'Deactivate users')
ON CONFLICT DO NOTHING;