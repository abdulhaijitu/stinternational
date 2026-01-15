import { useState } from "react";
import { Loader2, UserPlus, Copy, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

type AppRole = "super_admin" | "admin" | "accounts" | "sales" | "employee";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserAdded: () => void;
}

const ADMIN_ROLES: AppRole[] = ["super_admin", "admin", "accounts", "sales", "employee"];

const generatePassword = (length = 12): string => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const AddUserDialog = ({ open, onOpenChange, onUserAdded }: AddUserDialogProps) => {
  const { t, language } = useAdminLanguage();
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<AppRole>("employee");
  const [isActive, setIsActive] = useState(true);
  const [password, setPassword] = useState("");
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [createdUser, setCreatedUser] = useState<{ email: string; password: string } | null>(null);

  const getRoleLabel = (roleKey: AppRole) => {
    const labels: Record<AppRole, string> = {
      super_admin: t.roles.superAdmin,
      admin: t.roles.admin,
      accounts: t.roles.accounts,
      sales: t.roles.sales,
      employee: t.users.employee || "Employee",
    };
    return labels[roleKey];
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setPassword(newPassword);
  };

  const handleCopyPassword = () => {
    if (password) {
      navigator.clipboard.writeText(password);
      toast.success(t.users.passwordCopied || "Password copied to clipboard");
    }
  };

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setRole("employee");
    setIsActive(true);
    setPassword("");
    setAutoGenerate(true);
    setShowPassword(false);
    setCreatedUser(null);
  };

  const handleSubmit = async () => {
    if (!fullName.trim() || !email.trim()) {
      toast.error(t.users.nameEmailRequired || "Name and email are required");
      return;
    }

    const finalPassword = autoGenerate ? generatePassword() : password;
    if (!finalPassword || finalPassword.length < 6) {
      toast.error(t.users.passwordTooShort || "Password must be at least 6 characters");
      return;
    }

    setProcessing(true);
    try {
      // Create user via Supabase Auth admin API through edge function
      const { data, error } = await supabase.functions.invoke("create-admin-user", {
        body: {
          email: email.trim(),
          password: finalPassword,
          fullName: fullName.trim(),
          phone: phone.trim() || null,
          role,
          isActive,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Show success with credentials
      setCreatedUser({ email: email.trim(), password: finalPassword });
      toast.success(t.users.userCreated || "User created successfully");
      onUserAdded();
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(error.message || t.users.addUserError);
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={cn("sm:max-w-[500px]", language === "bn" && "font-siliguri")}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {t.users.newUser}
          </DialogTitle>
          <DialogDescription>
            {t.users.newUserDescription}
          </DialogDescription>
        </DialogHeader>

        {createdUser ? (
          // Success state - show credentials
          <div className="space-y-4 py-4">
            <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg">
              <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-3">
                {t.users.userCreatedSuccess || "User created successfully! Share these credentials:"}
              </p>
              
              <div className="space-y-3 bg-background p-3 rounded border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t.users.email}:</span>
                  <span className="font-mono text-sm">{createdUser.email}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">{t.users.password}:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">
                      {showPassword ? createdUser.password : "••••••••••••"}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        navigator.clipboard.writeText(createdUser.password);
                        toast.success(t.users.passwordCopied || "Copied!");
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground mt-3">
                {t.users.shareCredentialsNote || "Share these credentials securely with the user. They can log in immediately."}
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { resetForm(); }}>
                {t.users.addAnother || "Add Another User"}
              </Button>
              <Button onClick={handleClose}>
                {t.common.cancel || "Close"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          // Form state
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="fullName">{t.users.fullName} *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.users.fullNamePlaceholder || "Enter full name"}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">{t.users.email} *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.users.emailPlaceholder || "user@example.com"}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">{t.users.phone || "Phone"}</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.users.phonePlaceholder || "+880..."}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.users.role} *</Label>
                <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMIN_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {getRoleLabel(r)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>{t.users.status}</Label>
                <div className="flex items-center gap-3 h-10">
                  <Switch
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <span className="text-sm">
                    {isActive ? t.users.active : t.users.inactive}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <Label>{t.users.passwordSetup || "Password Setup"}</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {t.users.autoGenerate || "Auto-generate"}
                  </span>
                  <Switch
                    checked={autoGenerate}
                    onCheckedChange={(checked) => {
                      setAutoGenerate(checked);
                      if (checked) setPassword("");
                    }}
                  />
                </div>
              </div>
              
              {autoGenerate ? (
                <p className="text-sm text-muted-foreground">
                  {t.users.autoGenerateInfo || "A secure password will be generated when you create the user."}
                </p>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t.users.enterPassword || "Enter password"}
                      className="pr-20"
                    />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleCopyPassword}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleGeneratePassword}
                    title={t.users.generatePassword || "Generate password"}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={handleClose}>
                {t.common.cancel}
              </Button>
              <Button onClick={handleSubmit} disabled={processing}>
                {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t.users.createUser || "Create User"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
