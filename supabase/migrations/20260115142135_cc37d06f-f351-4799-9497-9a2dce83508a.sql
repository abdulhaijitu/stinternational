-- Add 'employee' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'employee';

-- Add missing permissions for modules mentioned in requirements
INSERT INTO public.permissions (module, action, description)
SELECT * FROM (VALUES
  ('institution_logos', 'view', 'View institution logos'),
  ('institution_logos', 'manage', 'Manage institution logos'),
  ('ux_insights', 'view', 'View UX insights')
) AS new_perms(module, action, description)
WHERE NOT EXISTS (
  SELECT 1 FROM public.permissions 
  WHERE module = new_perms.module AND action = new_perms.action
);