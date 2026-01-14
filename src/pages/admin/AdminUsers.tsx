import { useEffect, useState } from "react";
import { 
  UserPlus, 
  Users, 
  Search, 
  MoreHorizontal, 
  Edit, 
  UserX, 
  UserCheck,
  Shield,
  Loader2,
  Lock
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { useAdmin } from "@/contexts/AdminContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type AppRole = "super_admin" | "admin" | "accounts" | "sales";

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  is_active: boolean;
  created_at: string;
  role: AppRole | null;
}

const ADMIN_ROLES: AppRole[] = ["super_admin", "admin", "accounts", "sales"];

const addUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["super_admin", "admin", "accounts", "sales"]),
});

type AddUserFormData = z.infer<typeof addUserSchema>;

const AdminUsers = () => {
  const { t, language } = useAdminLanguage();
  const { isSuperAdmin } = useAdmin();
  
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [confirmAction, setConfirmAction] = useState<"activate" | "deactivate" | null>(null);
  const [processing, setProcessing] = useState(false);
  const [editRole, setEditRole] = useState<AppRole | null>(null);

  const form = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      email: "",
      full_name: "",
      password: "",
      role: "admin",
    },
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch profiles with user roles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, is_active, created_at")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Create a map of user roles
      const roleMap = new Map<string, AppRole>();
      roles?.forEach(r => {
        if (ADMIN_ROLES.includes(r.role as AppRole)) {
          roleMap.set(r.user_id, r.role as AppRole);
        }
      });

      // Only show users with admin roles
      const adminUsers: UserWithRole[] = [];
      profiles?.forEach(profile => {
        const role = roleMap.get(profile.user_id);
        if (role) {
          adminUsers.push({
            id: profile.id,
            user_id: profile.user_id,
            full_name: profile.full_name,
            email: "",
            is_active: profile.is_active ?? true,
            created_at: profile.created_at,
            role,
          });
        }
      });

      setUsers(adminUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(t.users.loadError);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: AppRole | null) => {
    if (!role) return "-";
    const labels: Record<AppRole, string> = {
      super_admin: t.roles.superAdmin,
      admin: t.roles.admin,
      accounts: t.roles.accounts,
      sales: t.roles.sales,
    };
    return labels[role] || role;
  };

  const getRoleBadgeColor = (role: AppRole | null) => {
    switch (role) {
      case "super_admin": return "bg-destructive/10 text-destructive border-destructive/20";
      case "admin": return "bg-primary/10 text-primary border-primary/20";
      case "accounts": return "bg-success/10 text-success border-success/20";
      case "sales": return "bg-accent/10 text-accent-foreground border-accent/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const handleAddUser = async (data: AddUserFormData) => {
    if (!isSuperAdmin) {
      toast.error(t.users.onlySuperAdmin);
      return;
    }

    setProcessing(true);
    try {
      toast.info(t.users.addUserInfo);
      setAddDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error(t.users.addUserError);
    } finally {
      setProcessing(false);
    }
  };

  const handleEditRole = async () => {
    if (!selectedUser || !editRole || !isSuperAdmin) return;

    setProcessing(true);
    try {
      // Remove existing admin role
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", selectedUser.user_id)
        .in("role", ADMIN_ROLES);

      // Add new role
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: selectedUser.user_id, role: editRole });

      if (error) throw error;

      toast.success(t.users.roleUpdated);
      setEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error(t.users.roleUpdateError);
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedUser || !isSuperAdmin) return;

    setProcessing(true);
    try {
      const newStatus = confirmAction === "activate";
      
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: newStatus })
        .eq("user_id", selectedUser.user_id);

      if (error) throw error;

      toast.success(newStatus ? t.users.userActivated : t.users.userDeactivated);
      setConfirmDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error(t.users.statusUpdateError);
    } finally {
      setProcessing(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(searchLower) ||
      user.user_id.toLowerCase().includes(searchLower)
    );
  });

  if (!isSuperAdmin) {
    return (
      <AdminLayout>
        <div className={cn(
          "flex flex-col items-center justify-center min-h-[400px] text-center",
          language === "bn" && "font-siliguri"
        )}>
          <Lock className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {t.users.accessDenied}
          </h2>
          <p className="text-muted-foreground">
            {t.users.superAdminOnly}
          </p>
        </div>
      </AdminLayout>
    );
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <AdminPageHeader title={t.users.title} subtitle={t.users.subtitle} />
          <AdminTableSkeleton columns={5} rows={5} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={cn("space-y-6", language === "bn" && "font-siliguri")}>
        {/* Header */}
        <AdminPageHeader 
          title={t.users.title} 
          subtitle={t.users.subtitle}
        >
          <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            {t.users.addUser}
          </Button>
        </AdminPageHeader>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ADMIN_ROLES.map(role => {
            const count = users.filter(u => u.role === role).length;
            return (
              <div key={role} className="admin-stats-card">
                <p className="text-sm text-muted-foreground mb-1">
                  {getRoleLabel(role)}
                </p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.users.searchUsers}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Users Table */}
        <div className="admin-table-wrapper">
          {filteredUsers.length === 0 ? (
            <AdminEmptyState
              icon={Users}
              title={t.users.noUsers}
              description={t.users.subtitle}
            />
          ) : (
            <table className="admin-table">
              <thead className="sticky top-0 z-10 bg-muted/50">
                <tr>
                  <th>{t.users.name}</th>
                  <th>{t.users.role}</th>
                  <th>{t.users.status}</th>
                  <th>{t.users.joined}</th>
                  <th className="w-[80px]">{t.users.actions}</th>
                </tr>
              </thead>
              <tbody>
                {
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <Shield className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{user.full_name || "-"}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {user.user_id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        <Badge className={cn("text-xs", getRoleBadgeColor(user.role))}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm">
                        <Badge 
                          variant="outline"
                          className={cn(
                            "text-xs",
                            user.is_active 
                              ? "bg-success/10 text-success border-success/20" 
                              : "bg-destructive/10 text-destructive border-destructive/20"
                          )}
                        >
                          {user.is_active ? t.users.active : t.users.inactive}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString(language === "bn" ? "bn-BD" : "en-US")}
                      </td>
                      <td className="p-4 text-sm">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setEditRole(user.role);
                                setEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              {t.users.changeRole}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.is_active ? (
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setConfirmAction("deactivate");
                                  setConfirmDialogOpen(true);
                                }}
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                {t.users.deactivate}
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="text-green-600"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setConfirmAction("activate");
                                  setConfirmDialogOpen(true);
                                }}
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                {t.users.activate}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          )}
        </div>

        {/* Add User Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                {t.users.newUser}
              </DialogTitle>
              <DialogDescription>
                {t.users.newUserDescription}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddUser)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.users.fullName}</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.users.email}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="user@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.users.password}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.users.role}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ADMIN_ROLES.map(role => (
                            <SelectItem key={role} value={role}>
                              {getRoleLabel(role)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                    {t.common.cancel}
                  </Button>
                  <Button type="submit" disabled={processing}>
                    {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {t.users.addUser}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Role Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>
                {t.users.changeRole}
              </DialogTitle>
              <DialogDescription>
                {selectedUser?.full_name || selectedUser?.user_id}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t.users.newRole}</Label>
                <Select 
                  value={editRole || undefined} 
                  onValueChange={(value) => setEditRole(value as AppRole)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMIN_ROLES.map(role => (
                      <SelectItem key={role} value={role}>
                        {getRoleLabel(role)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button onClick={handleEditRole} disabled={processing || !editRole}>
                {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t.common.save}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirm Status Change Dialog */}
        <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmAction === "activate" ? t.users.activateUser : t.users.deactivateUser}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmAction === "activate" ? t.users.activateDescription : t.users.deactivateDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {t.common.cancel}
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleToggleStatus}
                className={confirmAction === "deactivate" ? "bg-red-600 hover:bg-red-700" : ""}
              >
                {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {confirmAction === "activate" ? t.users.activate : t.users.deactivate}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;