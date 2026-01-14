import { useEffect, useState } from "react";
import { Shield, Users, CheckCircle, Info } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Permission {
  id: string;
  module: string;
  action: string;
  description: string;
}

interface RolePermission {
  role: string;
  permission_id: string;
}

type AppRole = "super_admin" | "admin" | "accounts" | "sales" | "user" | "moderator";

const ROLES: AppRole[] = ["super_admin", "admin", "accounts", "sales"];

const AdminRoles = () => {
  const { t, language } = useAdminLanguage();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [permRes, rolePermRes] = await Promise.all([
        supabase.from("permissions").select("*").order("module", { ascending: true }),
        supabase.from("role_permissions").select("*"),
      ]);

      if (permRes.data) setPermissions(permRes.data);
      if (rolePermRes.data) setRolePermissions(rolePermRes.data);
    } catch (error) {
      console.error("Error fetching permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (role: AppRole, permissionId: string) => {
    if (role === "super_admin") return true;
    return rolePermissions.some(rp => rp.role === role && rp.permission_id === permissionId);
  };

  const togglePermission = async (role: AppRole, permissionId: string) => {
    if (role === "super_admin") {
      toast.info(t.roles.superAdminInfo);
      return;
    }

    const exists = rolePermissions.some(
      rp => rp.role === role && rp.permission_id === permissionId
    );

    try {
      if (exists) {
        await supabase
          .from("role_permissions")
          .delete()
          .eq("role", role)
          .eq("permission_id", permissionId);

        setRolePermissions(prev => 
          prev.filter(rp => !(rp.role === role && rp.permission_id === permissionId))
        );
      } else {
        const { error } = await supabase
          .from("role_permissions")
          .insert({ role, permission_id: permissionId });

        if (error) throw error;

        setRolePermissions(prev => [...prev, { role, permission_id: permissionId }]);
      }

      toast.success(t.roles.noPermissionChanges);
    } catch (error) {
      console.error("Error updating permission:", error);
      toast.error(t.common.error);
    }
  };

  const getRoleLabel = (role: AppRole) => {
    const labels: Record<AppRole, string> = {
      super_admin: t.roles.superAdmin,
      admin: t.roles.admin,
      accounts: t.roles.accounts,
      sales: t.roles.sales,
      user: t.roles.user,
      moderator: t.roles.moderator,
    };
    return labels[role];
  };

  const getRoleDescription = (role: AppRole) => {
    const descriptions = t.roles.roleDescriptions;
    return descriptions[role as keyof typeof descriptions] || "";
  };

  const getRoleBadgeColor = (role: AppRole) => {
    switch (role) {
      case "super_admin": return "bg-red-100 text-red-700 border-red-200";
      case "admin": return "bg-blue-100 text-blue-700 border-blue-200";
      case "accounts": return "bg-green-100 text-green-700 border-green-200";
      case "sales": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const modules = Object.keys(groupedPermissions).sort();

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={cn("space-y-6", language === "bn" && "font-siliguri")}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6" />
              {t.roles.title}
            </h1>
            <p className="text-muted-foreground">{t.roles.subtitle}</p>
          </div>
        </div>

        <Tabs defaultValue="matrix" className="space-y-6">
          <TabsList>
            <TabsTrigger value="matrix">{t.roles.permissionMatrix}</TabsTrigger>
            <TabsTrigger value="roles">{t.roles.rolesOverview}</TabsTrigger>
          </TabsList>

          {/* Permission Matrix Tab */}
          <TabsContent value="matrix" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t.roles.permissionMatrix}</CardTitle>
                <CardDescription>
                  {t.roles.fullAccess}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="min-w-[800px]">
                    {/* Table Header */}
                    <div className="grid grid-cols-[200px_repeat(4,1fr)] border-b border-border bg-muted/50 sticky top-0 z-10">
                      <div className="p-4 font-semibold text-sm">{t.roles.module}</div>
                      {ROLES.map(role => (
                        <div key={role} className="p-4 text-center">
                          <Badge className={cn("text-xs", getRoleBadgeColor(role))}>
                            {getRoleLabel(role)}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    {/* Table Body */}
                    {modules.map(module => (
                      <div key={module} className="border-b border-border last:border-b-0">
                        {/* Module Header */}
                        <div className="grid grid-cols-[200px_repeat(4,1fr)] bg-muted/30">
                          <div className="p-4 font-semibold capitalize text-sm">
                            {module.replace(/_/g, " ")}
                          </div>
                          {ROLES.map(role => (
                            <div key={role} className="p-4" />
                          ))}
                        </div>

                        {/* Permission Rows */}
                        {groupedPermissions[module].map(permission => (
                          <div 
                            key={permission.id} 
                            className="grid grid-cols-[200px_repeat(4,1fr)] hover:bg-muted/20 transition-colors"
                          >
                            <div className="p-4 pl-8 text-sm">
                              <div className="font-medium capitalize">
                                {permission.action.replace(/_/g, " ")}
                              </div>
                              {permission.description && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {permission.description}
                                </div>
                              )}
                            </div>
                            {ROLES.map(role => (
                              <div key={role} className="p-4 flex justify-center items-center">
                                {role === "super_admin" ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <Checkbox
                                    checked={hasPermission(role, permission.id)}
                                    onCheckedChange={() => togglePermission(role, permission.id)}
                                    className="h-5 w-5"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles Overview Tab */}
          <TabsContent value="roles" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {ROLES.map(role => (
                <Card key={role}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {getRoleLabel(role)}
                    </CardTitle>
                    <CardDescription>
                      {getRoleDescription(role)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground mb-3">
                        {t.roles.modules}:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {role === "super_admin" ? (
                          <Badge variant="default" className="bg-green-600">
                            {t.roles.fullAccess}
                          </Badge>
                        ) : (
                          modules.map(module => {
                            const modulePerms = groupedPermissions[module];
                            const hasAny = modulePerms.some(p => hasPermission(role, p.id));
                            const hasAll = modulePerms.every(p => hasPermission(role, p.id));
                            
                            if (!hasAny) return null;
                            
                            return (
                              <Badge 
                                key={module} 
                                variant="outline"
                                className={cn(
                                  "capitalize",
                                  hasAll ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"
                                )}
                              >
                                {module.replace(/_/g, " ")}
                                {!hasAll && ` (${t.roles.partial})`}
                              </Badge>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">{t.roles.permissionManagement}</p>
                  <p className="text-blue-700">
                    {t.roles.permissionManagementInfo}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminRoles;