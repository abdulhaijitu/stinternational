import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthFormProps {
  onSuccess?: () => void;
}

const AuthForm = ({ onSuccess }: AuthFormProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string }>({});
  
  const { signIn, signUp } = useAuth();

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!email.trim()) {
      newErrors.email = "ইমেইল আবশ্যক";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "সঠিক ইমেইল দিন";
    }
    
    if (!password) {
      newErrors.password = "পাসওয়ার্ড আবশ্যক";
    } else if (password.length < 6) {
      newErrors.password = "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে";
    }
    
    if (!isLogin && !fullName.trim()) {
      newErrors.fullName = "নাম আবশ্যক";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("সফলভাবে লগইন হয়েছে!");
          onSuccess?.();
        }
      } else {
        const { error, linkedOrdersCount } = await signUp(email, password, fullName);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("অ্যাকাউন্ট তৈরি হয়েছে! আপনি এখন লগইন করতে পারবেন।");
          
          if (linkedOrdersCount && linkedOrdersCount > 0) {
            setTimeout(() => {
              toast.success(
                `${linkedOrdersCount}টি অতীত অর্ডার আপনার অ্যাকাউন্টে যুক্ত হয়েছে!`,
                { duration: 5000 }
              );
            }, 1000);
          }
          
          onSuccess?.();
        }
      }
    } catch (err) {
      toast.error("কিছু ভুল হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            {isLogin ? "লগইন করুন" : "অ্যাকাউন্ট তৈরি করুন"}
          </h2>
          <p className="text-muted-foreground mt-2">
            {isLogin
              ? "আপনার অ্যাকাউন্টে প্রবেশ করুন"
              : "নতুন অ্যাকাউন্ট তৈরি করুন"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name - Only for signup */}
          {!isLogin && (
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className={cn(errors.fullName && "text-destructive")}>
                পুরো নাম <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                }}
                placeholder="আপনার নাম"
                className={cn(errors.fullName && "border-destructive focus-visible:ring-destructive")}
              />
              {errors.fullName && (
                <p className="text-xs font-medium text-destructive">{errors.fullName}</p>
              )}
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className={cn(errors.email && "text-destructive")}>
              ইমেইল <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              placeholder="you@example.com"
              className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
            />
            {errors.email && (
              <p className="text-xs font-medium text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className={cn(errors.password && "text-destructive")}>
              পাসওয়ার্ড <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                placeholder="••••••••"
                className={cn(
                  "pr-10",
                  errors.password && "border-destructive focus-visible:ring-destructive"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs font-medium text-destructive">{errors.password}</p>
            )}
            {!isLogin && !errors.password && (
              <p className="text-xs text-muted-foreground">কমপক্ষে ৬ অক্ষর</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                অপেক্ষা করুন...
              </>
            ) : isLogin ? (
              "লগইন"
            ) : (
              "অ্যাকাউন্ট তৈরি করুন"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {isLogin ? "অ্যাকাউন্ট নেই?" : "ইতিমধ্যে অ্যাকাউন্ট আছে?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-primary font-medium hover:underline"
            >
              {isLogin ? "তৈরি করুন" : "লগইন করুন"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
