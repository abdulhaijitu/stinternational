import { useEffect, useState, useMemo } from "react";
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
  Lock,
  Eye,
  Trash2,
  Filter,
  Mail,
  Info
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { useAdmin } from "@/contexts/AdminContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

const AdminUsers = () => {
  const { t, language } = useAdminLanguage();
  const { isSuperAdmin } = useAdmin();
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [confirmAction, setConfirmAction] = useState<"activate" | "deactivate" | null>(null);
  const [processing, setProcessing] = useState(false);
  const [editRole, setEditRole] = useState<AppRole | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

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

  // Compute role counts from actual user data
  const roleCounts = useMemo(() => {
    const counts: Record<AppRole, number> = {
      super_admin: 0,
      admin: 0,
      accounts: 0,
      sales: 0,
    };
    users.forEach(user => {
      if (user.role && counts[user.role] !== undefined) {
        counts[user.role]++;
      }
    });
    return counts;
  }, [users]);

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

  // Fixed badge colors - Super Admin is NOT red anymore
  const getRoleBadgeColor = (role: AppRole | null) => {
    switch (role) {
      case "super_admin": return "bg-primary/10 text-primary border-primary/20";
      case "admin": return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "accounts": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "sales": return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  // Status badge - only inactive/suspended uses red
  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive 
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
      : "bg-muted text-muted-foreground border-border";
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

  const handleDeleteUser = async () => {
    if (!selectedUser || !isSuperAdmin) return;
    if (deleteConfirmText !== "DELETE") return;

    // Prevent self-deletion
    if (currentUser?.id === selectedUser.user_id) {
      toast.error(t.users.cannotDeleteSelf);
      return;
    }

    setProcessing(true);
    try {
      // Remove user role first
      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", selectedUser.user_id);

      if (roleError) throw roleError;

      // Deactivate the user (we can't delete auth users from client)
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: false })
        .eq("user_id", selectedUser.user_id);

      if (error) throw error;

      toast.success(t.users.userDeleted);
      setDeleteDialogOpen(false);
      setDeleteConfirmText("");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(t.users.deleteError);
    } finally {
      setProcessing(false);
    }
  };

  // Filter users based on search, role, and status
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        user.full_name?.toLowerCase().includes(searchLower) ||
        user.user_id.toLowerCase().includes(searchLower);
      
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && user.is_active) ||
        (statusFilter === "inactive" && !user.is_active);
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Check if current user can perform actions on a target user
  const canPerformAction = (targetUser: UserWithRole, action: "view" | "edit" | "delete" | "status") => {
    if (!isSuperAdmin) return false;
    
    // Super admin cannot delete themselves
    if (action === "delete" && currentUser?.id === targetUser.user_id) {
      return false;
    }
    
    return true;
  };

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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button disabled className="gap-2 cursor-not-allowed opacity-60">
                    <UserPlus className="h-4 w-4" />
                    {t.users.addUser}
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{t.users.inviteViaEmail}</span>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </AdminPageHeader>

        {/* Stats Cards - Real data binding */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ADMIN_ROLES.map(role => (
            <div key={role} className="admin-stats-card">
              <p className="text-sm text-muted-foreground mb-1">
                {getRoleLabel(role)}
              </p>
              <p className="text-2xl font-bold">{roleCounts[role]}</p>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.users.searchUsers}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={t.users.filterByRole} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.users.allRoles}</SelectItem>
              {ADMIN_ROLES.map(role => (
                <SelectItem key={role} value={role}>
                  {getRoleLabel(role)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={t.users.filterByStatus} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.users.allStatuses}</SelectItem>
              <SelectItem value="active">{t.users.active}</SelectItem>
              <SelectItem value="inactive">{t.users.inactive}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <div className="admin-table-wrapper">
          {filteredUsers.length === 0 ? (
            <AdminEmptyState
              icon={Users}
              title={searchQuery || roleFilter !== "all" || statusFilter !== "all" 
                ? t.users.noUsersFound 
                : t.users.noUsers}
              description={searchQuery || roleFilter !== "all" || statusFilter !== "all"
                ? t.users.tryDifferentFilters
                : t.users.subtitle}
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
                {filteredUsers.map((user) => (
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
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs font-medium", getRoleBadgeColor(user.role))}
                      >
                        {getRoleLabel(user.role)}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm">
                      <Badge 
                        variant="outline"
                        className={cn("text-xs font-medium", getStatusBadgeColor(user.is_active))}
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
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>{t.users.actions}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          {/* View User */}
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {t.users.viewUser}
                          </DropdownMenuItem>
                          
                          {/* Edit Role - Only for Super Admin */}
                          {canPerformAction(user, "edit") && (
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
                          )}
                          
                          <DropdownMenuSeparator />
                          
                          {/* Activate/Deactivate */}
                          {canPerformAction(user, "status") && (
                            user.is_active ? (
                              <DropdownMenuItem
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
                                onClick={() => {
                                  setSelectedUser(user);
                                  setConfirmAction("activate");
                                  setConfirmDialogOpen(true);
                                }}
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                {t.users.activate}
                              </DropdownMenuItem>
                            )
                          )}
                          
                          {/* Delete User - Only if not self */}
                          {canPerformAction(user, "delete") && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t.users.deleteUser}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* View User Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {t.users.userDetails}
              </DialogTitle>
            </DialogHeader>
            
            {selectedUser && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedUser.full_name || "-"}</h3>
                    <p className="text-sm text-muted-foreground">{getRoleLabel(selectedUser.role)}</p>
                  </div>
                </div>
                
                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.users.status}:</span>
                    <Badge 
                      variant="outline"
                      className={cn("text-xs", getStatusBadgeColor(selectedUser.is_active))}
                    >
                      {selectedUser.is_active ? t.users.active : t.users.inactive}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.users.joined}:</span>
                    <span>{new Date(selectedUser.created_at).toLocaleDateString(language === "bn" ? "bn-BD" : "en-US")}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-muted-foreground">ID:</span>
                    <span className="text-xs font-mono break-all max-w-[200px] text-right">{selectedUser.user_id}</span>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                {t.common.cancel}
              </Button>
            </DialogFooter>
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
                className={confirmAction === "deactivate" ? "bg-destructive hover:bg-destructive/90" : ""}
              >
                {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {confirmAction === "activate" ? t.users.activate : t.users.deactivate}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete User Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setDeleteConfirmText("");
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-destructive flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                {t.users.deleteUserTitle}
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>{t.users.deleteUserDescription}</p>
                <p className="font-medium">{selectedUser?.full_name || selectedUser?.user_id}</p>
                <div className="pt-2">
                  <Label className="text-sm">{t.users.typeDeleteToConfirm}</Label>
                  <Input
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="mt-2"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {t.common.cancel}
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteUser}
                disabled={deleteConfirmText !== "DELETE" || processing}
                className="bg-destructive hover:bg-destructive/90"
              >
                {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t.users.deleteUser}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
