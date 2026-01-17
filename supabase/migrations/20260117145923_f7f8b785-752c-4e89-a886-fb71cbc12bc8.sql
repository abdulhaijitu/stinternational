-- Clear existing permissions and role_permissions to set fresh structure
DELETE FROM role_permissions;
DELETE FROM permissions;

-- Insert permissions with proper module structure and display_order
-- 1. Dashboard
INSERT INTO permissions (module, action, description) VALUES
('dashboard', 'view', 'View dashboard statistics');

-- 2. Catalog - Products
INSERT INTO permissions (module, action, description) VALUES
('products', 'view', 'View products'),
('products', 'create', 'Create products'),
('products', 'edit', 'Edit products'),
('products', 'delete', 'Delete products'),
('products', 'reorder', 'Reorder products');

-- 2. Catalog - Categories
INSERT INTO permissions (module, action, description) VALUES
('categories', 'view', 'View categories'),
('categories', 'create', 'Create categories'),
('categories', 'edit', 'Edit categories'),
('categories', 'delete', 'Delete categories'),
('categories', 'reorder', 'Reorder categories');

-- 3. Sales - Orders
INSERT INTO permissions (module, action, description) VALUES
('orders', 'view', 'View orders'),
('orders', 'create', 'Create orders'),
('orders', 'edit', 'Edit orders'),
('orders', 'delete', 'Delete orders');

-- 3. Sales - Quote Requests
INSERT INTO permissions (module, action, description) VALUES
('quotes', 'view', 'View quote requests'),
('quotes', 'create', 'Create quote requests'),
('quotes', 'edit', 'Edit quote requests'),
('quotes', 'delete', 'Delete quote requests');

-- 4. Content - Institution Logos
INSERT INTO permissions (module, action, description) VALUES
('logos', 'view', 'View institution logos'),
('logos', 'create', 'Create institution logos'),
('logos', 'edit', 'Edit institution logos'),
('logos', 'delete', 'Delete institution logos'),
('logos', 'reorder', 'Reorder institution logos');

-- 4. Content - Testimonials
INSERT INTO permissions (module, action, description) VALUES
('testimonials', 'view', 'View testimonials'),
('testimonials', 'create', 'Create testimonials'),
('testimonials', 'edit', 'Edit testimonials'),
('testimonials', 'delete', 'Delete testimonials'),
('testimonials', 'reorder', 'Reorder testimonials');

-- 5. Analytics - UX Insights
INSERT INTO permissions (module, action, description) VALUES
('ux_insights', 'view', 'View UX insights'),
('ux_insights', 'delete', 'Delete UX telemetry data');

-- 6. Settings - Roles & Permissions
INSERT INTO permissions (module, action, description) VALUES
('roles', 'view', 'View roles and permissions'),
('roles', 'edit', 'Edit role permissions');

-- Add default permissions for admin role
INSERT INTO role_permissions (role, permission_id)
SELECT 'admin', id FROM permissions WHERE module IN ('dashboard', 'products', 'categories', 'orders', 'quotes', 'logos', 'testimonials', 'ux_insights');

-- Add permissions for accounts role
INSERT INTO role_permissions (role, permission_id)
SELECT 'accounts', id FROM permissions WHERE module IN ('dashboard', 'orders') AND action IN ('view', 'edit');

-- Add permissions for sales role
INSERT INTO role_permissions (role, permission_id)
SELECT 'sales', id FROM permissions WHERE module IN ('dashboard', 'products', 'quotes') AND action IN ('view', 'edit', 'create');