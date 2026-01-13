import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type AppRole = "admin" | "moderator" | "user" | "super_admin" | "accounts" | "sales";

interface Permission {
  id: string;
  module: string;
  action: string;
}

interface AdminContextType {
  isAdmin: boolean;
  loading: boolean;
  roles: AppRole[];
  permissions: Permission[];
  hasRole: (role: AppRole) => boolean;
  hasPermission: (module: string, action: string) => boolean;
  canAccessModule: (module: string) => boolean;
  isSuperAdmin: boolean;
  refreshPermissions: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Map navigation modules to permission modules
const MODULE_PERMISSION_MAP: Record<string, string> = {
  dashboard: "dashboard",
  products: "products",
  categories: "categories",
  orders: "orders",
  quotes: "quotes",
  logos: "content",
  testimonials: "content",
  "ux-insights": "reports",
  roles: "roles",
};

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const fetchPermissions = useCallback(async () => {
    if (!user) {
      setRoles([]);
      setPermissions([]);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      // Fetch user roles
      const { data: userRolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (rolesError) {
        console.error("Error fetching user roles:", rolesError);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const userRoles = (userRolesData || []).map(r => r.role as AppRole);
      setRoles(userRoles);

      // Check if user has any admin-level role
      const adminRoles: AppRole[] = ["admin", "super_admin", "accounts", "sales", "moderator"];
      const hasAdminRole = userRoles.some(role => adminRoles.includes(role));
      setIsAdmin(hasAdminRole);

      // If user is super_admin, they have all permissions
      if (userRoles.includes("super_admin")) {
        // Fetch all permissions for super_admin
        const { data: allPerms } = await supabase
          .from("permissions")
          .select("id, module, action");
        
        setPermissions(allPerms || []);
      } else if (hasAdminRole) {
        // Fetch permissions based on role_permissions
        const { data: rolePermsData } = await supabase
          .from("role_permissions")
          .select("permission_id, permissions(id, module, action)")
          .in("role", userRoles);

        const perms: Permission[] = [];
        rolePermsData?.forEach((rp: any) => {
          if (rp.permissions) {
            perms.push({
              id: rp.permissions.id,
              module: rp.permissions.module,
              action: rp.permissions.action,
            });
          }
        });

        // Remove duplicates
        const uniquePerms = perms.filter(
          (perm, index, self) =>
            index === self.findIndex(p => p.id === perm.id)
        );
        setPermissions(uniquePerms);
      } else {
        setPermissions([]);
      }
    } catch (err) {
      console.error("Error:", err);
      setIsAdmin(false);
      setRoles([]);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchPermissions();
    }
  }, [authLoading, fetchPermissions]);

  const hasRole = useCallback((role: AppRole): boolean => {
    return roles.includes(role) || roles.includes("super_admin");
  }, [roles]);

  const hasPermission = useCallback((module: string, action: string): boolean => {
    if (roles.includes("super_admin")) return true;
    return permissions.some(p => p.module === module && p.action === action);
  }, [roles, permissions]);

  const canAccessModule = useCallback((module: string): boolean => {
    if (roles.includes("super_admin")) return true;
    
    // Map the nav module to permission module
    const permModule = MODULE_PERMISSION_MAP[module] || module;
    
    // Check if user has any permission for this module
    return permissions.some(p => p.module === permModule);
  }, [roles, permissions]);

  const isSuperAdmin = roles.includes("super_admin");

  return (
    <AdminContext.Provider 
      value={{ 
        isAdmin, 
        loading: loading || authLoading,
        roles,
        permissions,
        hasRole,
        hasPermission,
        canAccessModule,
        isSuperAdmin,
        refreshPermissions: fetchPermissions,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
