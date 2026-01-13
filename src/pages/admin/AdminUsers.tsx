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
  Mail,
  Lock
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
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
            email: "", // Will be fetched from auth or displayed as user_id
            is_active: profile.is_active ?? true,
            created_at: profile.created_at,
            role,
          });
        }
      });

      setUsers(adminUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(language === "bn" ? "ব্যবহারকারী লোড করতে সমস্যা" : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: AppRole | null) => {
    if (!role) return "-";
    const labels: Record<AppRole, { en: string; bn: string }> = {
      super_admin: { en: "Super Admin", bn: "সুপার অ্যাডমিন" },
      admin: { en: "Admin", bn: "অ্যাডমিন" },
      accounts: { en: "Accounts", bn: "অ্যাকাউন্টস" },
      sales: { en: "Sales", bn: "সেলস" },
    };
    return labels[role]?.[language] || role;
  };

  const getRoleBadgeColor = (role: AppRole | null) => {
    // Using semantic colors that work in both light and dark modes
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
      toast.error(language === "bn" ? "শুধুমাত্র সুপার অ্যাডমিন ব্যবহারকারী যোগ করতে পারেন" : "Only Super Admin can add users");
      return;
    }

    setProcessing(true);
    try {
      // Note: In a real app, you'd call an edge function to create the user
      // For now, we'll show a message about this limitation
      toast.info(
        language === "bn" 
          ? "নতুন ব্যবহারকারী তৈরি করতে ইমেইল ইনভাইট পাঠানো হবে"
          : "New user creation requires server-side implementation. User will be invited via email."
      );
      
      setAddDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error(language === "bn" ? "ব্যবহারকারী যোগ করতে সমস্যা" : "Failed to add user");
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

      toast.success(language === "bn" ? "রোল আপডেট হয়েছে" : "Role updated successfully");
      setEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error(language === "bn" ? "রোল আপডেট করতে সমস্যা" : "Failed to update role");
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

      toast.success(
        newStatus 
          ? (language === "bn" ? "ব্যবহারকারী সক্রিয় করা হয়েছে" : "User activated")
          : (language === "bn" ? "ব্যবহারকারী নিষ্ক্রিয় করা হয়েছে" : "User deactivated")
      );
      setConfirmDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error(language === "bn" ? "স্ট্যাটাস আপডেট করতে সমস্যা" : "Failed to update status");
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
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <Lock className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {language === "bn" ? "অ্যাক্সেস নেই" : "Access Denied"}
          </h2>
          <p className="text-muted-foreground">
            {language === "bn" 
              ? "শুধুমাত্র সুপার অ্যাডমিন এই পেজে অ্যাক্সেস করতে পারেন"
              : "Only Super Admins can access this page"}
          </p>
        </div>
      </AdminLayout>
    );
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={cn("space-y-6", language === "bn" && "font-siliguri")}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6" />
              {language === "bn" ? "ব্যবহারকারী ব্যবস্থাপনা" : "User Management"}
            </h1>
            <p className="text-muted-foreground">
              {language === "bn" 
                ? "অ্যাডমিন ব্যবহারকারী এবং তাদের রোল পরিচালনা করুন"
                : "Manage admin users and their roles"}
            </p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            {language === "bn" ? "ব্যবহারকারী যোগ করুন" : "Add User"}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ADMIN_ROLES.map(role => {
            const count = users.filter(u => u.role === role).length;
            return (
              <Card key={role}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {getRoleLabel(role)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{count}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={language === "bn" ? "ব্যবহারকারী খুঁজুন..." : "Search users..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === "bn" ? "নাম" : "Name"}</TableHead>
                  <TableHead>{language === "bn" ? "রোল" : "Role"}</TableHead>
                  <TableHead>{language === "bn" ? "স্ট্যাটাস" : "Status"}</TableHead>
                  <TableHead>{language === "bn" ? "যোগদান" : "Joined"}</TableHead>
                  <TableHead className="w-[80px]">{language === "bn" ? "অ্যাকশন" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {language === "bn" ? "কোনো ব্যবহারকারী পাওয়া যায়নি" : "No users found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", getRoleBadgeColor(user.role))}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={cn(
                            "text-xs",
                            user.is_active 
                              ? "bg-success/10 text-success border-success/20" 
                              : "bg-destructive/10 text-destructive border-destructive/20"
                          )}
                        >
                          {user.is_active 
                            ? (language === "bn" ? "সক্রিয়" : "Active")
                            : (language === "bn" ? "নিষ্ক্রিয়" : "Inactive")
                          }
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString(language === "bn" ? "bn-BD" : "en-US")}
                      </TableCell>
                      <TableCell>
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
                              {language === "bn" ? "রোল পরিবর্তন" : "Change Role"}
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
                                {language === "bn" ? "নিষ্ক্রিয় করুন" : "Deactivate"}
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
                                {language === "bn" ? "সক্রিয় করুন" : "Activate"}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add User Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                {language === "bn" ? "নতুন ব্যবহারকারী" : "Add New User"}
              </DialogTitle>
              <DialogDescription>
                {language === "bn" 
                  ? "নতুন অ্যাডমিন ব্যবহারকারী তৈরি করুন এবং তাদের রোল নির্ধারণ করুন"
                  : "Create a new admin user and assign their role"}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddUser)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === "bn" ? "পুরো নাম" : "Full Name"}</FormLabel>
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
                      <FormLabel>{language === "bn" ? "ইমেইল" : "Email"}</FormLabel>
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
                      <FormLabel>{language === "bn" ? "পাসওয়ার্ড" : "Password"}</FormLabel>
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
                      <FormLabel>{language === "bn" ? "রোল" : "Role"}</FormLabel>
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
                    {language === "bn" ? "বাতিল" : "Cancel"}
                  </Button>
                  <Button type="submit" disabled={processing}>
                    {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {language === "bn" ? "যোগ করুন" : "Add User"}
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
                {language === "bn" ? "রোল পরিবর্তন" : "Change Role"}
              </DialogTitle>
              <DialogDescription>
                {selectedUser?.full_name || selectedUser?.user_id}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{language === "bn" ? "নতুন রোল" : "New Role"}</Label>
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
                {language === "bn" ? "বাতিল" : "Cancel"}
              </Button>
              <Button onClick={handleEditRole} disabled={processing || !editRole}>
                {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {language === "bn" ? "সংরক্ষণ" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirm Status Change Dialog */}
        <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmAction === "activate"
                  ? (language === "bn" ? "ব্যবহারকারী সক্রিয় করুন?" : "Activate User?")
                  : (language === "bn" ? "ব্যবহারকারী নিষ্ক্রিয় করুন?" : "Deactivate User?")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmAction === "activate"
                  ? (language === "bn" 
                      ? "এই ব্যবহারকারী আবার অ্যাডমিন প্যানেলে লগইন করতে পারবেন।"
                      : "This user will be able to login to the admin panel again.")
                  : (language === "bn"
                      ? "এই ব্যবহারকারী আর অ্যাডমিন প্যানেলে লগইন করতে পারবেন না।"
                      : "This user will no longer be able to login to the admin panel.")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {language === "bn" ? "বাতিল" : "Cancel"}
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleToggleStatus}
                className={confirmAction === "deactivate" ? "bg-red-600 hover:bg-red-700" : ""}
              >
                {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {confirmAction === "activate"
                  ? (language === "bn" ? "সক্রিয় করুন" : "Activate")
                  : (language === "bn" ? "নিষ্ক্রিয় করুন" : "Deactivate")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
