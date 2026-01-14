import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, ShoppingCart, FileText, LogIn, UserPlus, User } from "lucide-react";

interface CheckoutLoginStepProps {
  onSuccess: () => void;
  onRequestQuote: () => void;
  onGuestCheckout: () => void;
}

const CheckoutLoginStep = ({ onSuccess, onRequestQuote, onGuestCheckout }: CheckoutLoginStepProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const { t, language } = useLanguage();
  const fontClass = language === "bn" ? "font-siliguri" : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success(language === "bn" ? "সফলভাবে লগইন হয়েছে!" : "Logged in successfully!");
          onSuccess();
        }
      } else {
        if (!fullName.trim()) {
          toast.error(language === "bn" ? "অনুগ্রহ করে আপনার নাম দিন" : "Please enter your name");
          setLoading(false);
          return;
        }
        const { error, linkedOrdersCount } = await signUp(email, password, fullName);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success(language === "bn" ? "অ্যাকাউন্ট তৈরি হয়েছে!" : "Account created successfully!");
          
          // Show additional toast if guest orders were linked
          if (linkedOrdersCount && linkedOrdersCount > 0) {
            setTimeout(() => {
              toast.success(
                language === "bn" 
                  ? `${linkedOrdersCount}টি অতীত অর্ডার আপনার অ্যাকাউন্টে যুক্ত হয়েছে!`
                  : `${linkedOrdersCount} previous order${linkedOrdersCount > 1 ? 's' : ''} linked to your account!`,
                { duration: 5000 }
              );
            }, 1000);
          }
          
          onSuccess();
        }
      }
    } catch (err) {
      toast.error(language === "bn" ? "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।" : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-2xl mx-auto ${fontClass}`}>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{t.checkout.loginToComplete}</h2>
        <p className="text-muted-foreground">{t.checkout.loginToTrack}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            {isLogin ? <LogIn className="h-5 w-5 text-primary" /> : <UserPlus className="h-5 w-5 text-primary" />}
            <h3 className="font-semibold text-lg">
              {isLogin ? t.nav.login : (language === "bn" ? "অ্যাকাউন্ট তৈরি করুন" : "Create Account")}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">{t.checkout.fullName}</Label>
                <Input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required={!isLogin} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{t.checkout.email}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{language === "bn" ? "পাসওয়ার্ড" : "Password"}</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isLogin ? <LogIn className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
              {loading ? (language === "bn" ? "অপেক্ষা করুন..." : "Please wait...") : isLogin ? t.nav.login : (language === "bn" ? "অ্যাকাউন্ট তৈরি করুন" : "Create Account")}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? (language === "bn" ? "অ্যাকাউন্ট নেই?" : "Don't have an account?") : (language === "bn" ? "ইতিমধ্যে অ্যাকাউন্ট আছে?" : "Already have an account?")}{" "}
              <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary font-medium hover:underline">
                {isLogin ? (language === "bn" ? "তৈরি করুন" : "Sign up") : t.nav.login}
              </button>
            </p>
          </div>

          {/* Guest Checkout Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                {t.checkout.or}
              </span>
            </div>
          </div>

          {/* Guest Checkout Button */}
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={onGuestCheckout}
          >
            <User className="mr-2 h-4 w-4" />
            {t.checkout.guestCheckout}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">{t.checkout.b2bPurchase}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{t.checkout.b2bDescription}</p>
            <Button variant="outline" className="w-full" onClick={onRequestQuote}>
              <FileText className="mr-2 h-4 w-4" />
              {t.checkout.requestQuote}
            </Button>
          </div>

          <div className="bg-muted/50 rounded-lg p-6">
            <h4 className="font-medium mb-3">{t.checkout.accountBenefits}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-primary">✓</span>{t.checkout.trackOrders}</li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span>{t.checkout.fasterCheckout}</li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span>{t.checkout.viewOrderHistory}</li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span>{t.checkout.saveWishlist}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="text-center mt-6">
        <Link to="/cart" className="text-sm text-muted-foreground hover:text-primary transition-colors">
          ← {t.checkout.backToCart}
        </Link>
      </div>
    </div>
  );
};

export default CheckoutLoginStep;
