import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  CreditCard, 
  Truck, 
  Building2, 
  ArrowLeft,
  Loader2,
  ShieldCheck,
  CheckCircle,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/formatPrice";
import { toast } from "sonner";
import CheckoutLayout from "@/components/checkout/CheckoutLayout";
import CheckoutLoginStep from "@/components/checkout/CheckoutLoginStep";
import { CheckoutStep } from "@/components/checkout/CheckoutStepIndicator";
import { cn } from "@/lib/utils";

type PaymentMethod = "cash_on_delivery" | "bank_transfer";

interface FormErrors {
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  shipping_address?: string;
  shipping_city?: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getSubtotal, clearCart } = useCart();
  const { user, profile, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Determine current step
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("login");

  const fontClass = language === "bn" ? "font-siliguri" : "";

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    company_name: "",
    shipping_address: "",
    shipping_city: "",
    shipping_postal_code: "",
    notes: "",
    payment_method: "cash_on_delivery" as PaymentMethod,
  });

  // Validation functions
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "customer_name":
        if (!value.trim()) {
          return language === "bn" ? "নাম আবশ্যক" : "Name is required";
        }
        if (value.trim().length < 2) {
          return language === "bn" ? "নাম কমপক্ষে ২ অক্ষরের হতে হবে" : "Name must be at least 2 characters";
        }
        break;
      case "customer_email":
        if (!value.trim()) {
          return language === "bn" ? "ইমেইল আবশ্যক" : "Email is required";
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return language === "bn" ? "সঠিক ইমেইল দিন" : "Please enter a valid email";
        }
        break;
      case "customer_phone":
        if (!value.trim()) {
          return language === "bn" ? "ফোন নম্বর আবশ্যক" : "Phone number is required";
        }
        if (!/^[+]?[\d\s-]{10,}$/.test(value.replace(/\s/g, ''))) {
          return language === "bn" ? "সঠিক ফোন নম্বর দিন" : "Please enter a valid phone number";
        }
        break;
      case "shipping_address":
        if (!value.trim()) {
          return language === "bn" ? "ঠিকানা আবশ্যক" : "Address is required";
        }
        if (value.trim().length < 10) {
          return language === "bn" ? "সম্পূর্ণ ঠিকানা দিন" : "Please enter a complete address";
        }
        break;
      case "shipping_city":
        if (!value.trim()) {
          return language === "bn" ? "শহর আবশ্যক" : "City is required";
        }
        break;
    }
    return undefined;
  };

  // Handle field blur for validation
  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name as keyof typeof formData] as string);
    setFormErrors(prev => ({ ...prev, [name]: error }));
  };

  // Handle field change with real-time validation
  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Only validate if field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setFormErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    const fieldsToValidate = ['customer_name', 'customer_email', 'customer_phone', 'shipping_address', 'shipping_city'];
    
    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData] as string);
      if (error) {
        errors[field as keyof FormErrors] = error;
      }
    });

    setFormErrors(errors);
    setTouched({
      customer_name: true,
      customer_email: true,
      customer_phone: true,
      shipping_address: true,
      shipping_city: true,
    });

    return Object.keys(errors).length === 0;
  };

  // Update form data when profile loads
  useEffect(() => {
    if (profile || user) {
      setFormData(prev => ({
        ...prev,
        customer_name: profile?.full_name || prev.customer_name,
        customer_email: user?.email || prev.customer_email,
        customer_phone: profile?.phone || prev.customer_phone,
        company_name: profile?.company_name || prev.company_name,
        shipping_address: profile?.shipping_address || prev.shipping_address,
        shipping_city: profile?.shipping_city || prev.shipping_city,
        shipping_postal_code: profile?.shipping_postal_code || prev.shipping_postal_code,
      }));
    }
  }, [profile, user]);

  // Update current step based on auth state and order state
  useEffect(() => {
    if (orderPlaced) {
      setCurrentStep("confirmation");
    } else if (!authLoading && (user || isGuestCheckout)) {
      setCurrentStep("shipping");
    } else if (!authLoading) {
      setCurrentStep("login");
    }
  }, [user, authLoading, orderPlaced, isGuestCheckout]);

  const subtotal = getSubtotal();
  const shippingCost = subtotal >= 10000 ? 0 : 150;
  const total = subtotal + shippingCost;

  const handleLoginSuccess = () => {
    setCurrentStep("shipping");
  };

  const handleRequestQuote = () => {
    navigate("/request-quote");
  };

  const handleGuestCheckout = () => {
    setIsGuestCheckout(true);
    setCurrentStep("shipping");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For guest checkout, user may not be logged in but we still allow order
    if (!user && !isGuestCheckout) {
      toast.error(t.checkout.loginRequired);
      setCurrentStep("login");
      return;
    }

    // Validate form before submission
    if (!validateForm()) {
      toast.error(language === "bn" ? "অনুগ্রহ করে সব প্রয়োজনীয় তথ্য সঠিকভাবে পূরণ করুন" : "Please fill in all required fields correctly");
      return;
    }

    if (items.length === 0) {
      toast.error(t.checkout.cartEmpty);
      return;
    }

    setLoading(true);

    try {
      // Create order + items via backend function so guest checkout works with RLS
      const orderPayload = {
        order: {
          status: "pending_payment" as const,
          payment_method: formData.payment_method as "cash_on_delivery" | "bank_transfer" | "online_payment",
          subtotal,
          shipping_cost: shippingCost,
          total,
          customer_name: formData.customer_name.trim(),
          customer_email: formData.customer_email.trim(),
          customer_phone: formData.customer_phone.trim(),
          company_name: formData.company_name.trim() || null,
          shipping_address: formData.shipping_address.trim(),
          shipping_city: formData.shipping_city.trim(),
          shipping_postal_code: formData.shipping_postal_code.trim() || null,
          notes: formData.notes.trim() || null,
        },
        items: items.map((item) => ({
          product_id: item.id,
          product_name: item.name,
          product_sku: item.sku,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
        })),
      };

      const { data, error } = await supabase.functions.invoke("create-order", {
        body: orderPayload,
      });

      if (error) throw error;

      setOrderNumber(data?.orderNumber || "");
      setOrderPlaced(true);
      setCurrentStep("confirmation");
      clearCart();
      toast.success(t.checkout.orderSuccess);
    } catch (error: any) {
      console.error("Order error:", error);
      toast.error(error?.message || t.checkout.orderError);
    } finally {
      setLoading(false);
    }
  };

  // Redirect to cart if empty (unless order just placed)
  if (items.length === 0 && !orderPlaced) {
    return (
      <CheckoutLayout currentStep="cart" isLoggedIn={!!user} showBackToCart={false}>
        <div className={`py-8 text-center ${fontClass}`}>
          <h1 className="text-2xl font-bold mb-4">{t.cart.cartEmpty}</h1>
          <p className="text-muted-foreground mb-6">{t.checkout.addProductsToCheckout}</p>
          <Button onClick={() => navigate("/categories")}>{t.checkout.browseProducts}</Button>
        </div>
      </CheckoutLayout>
    );
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <CheckoutLayout currentStep="login" isLoggedIn={false}>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CheckoutLayout>
    );
  }

  // Order Confirmation Step
  if (orderPlaced) {
    return (
      <CheckoutLayout currentStep="confirmation" isLoggedIn={!!user} showBackToCart={false}>
        <div className={`max-w-lg mx-auto text-center py-8 ${fontClass}`}>
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-4">{t.checkout.orderSuccessTitle}</h1>
          <p className="text-muted-foreground mb-2">
            {t.checkout.orderNumber}:
          </p>
          <p className="text-xl font-bold text-primary mb-6">{orderNumber}</p>
          <p className="text-muted-foreground mb-6">
            {t.checkout.orderConfirmationMessage}
          </p>
          <p className="text-xs text-muted-foreground mb-8">
            Operated by ST International, Dhaka, Bangladesh
          </p>

          {/* Create Account Prompt for Guest Users */}
          {isGuestCheckout && !user && (
            <div className="bg-muted/50 border border-border rounded-lg p-6 mb-8 text-left">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <UserPlus className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{t.checkout.createAccountPromptTitle}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t.checkout.createAccountPromptMessage}
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                    <li>✓ {t.checkout.benefitTrackOrders}</li>
                    <li>✓ {t.checkout.benefitFasterCheckout}</li>
                    <li>✓ {t.checkout.benefitOrderHistory}</li>
                  </ul>
                  <Button 
                    onClick={() => navigate("/account?signup=true&email=" + encodeURIComponent(formData.customer_email))}
                    className="w-full sm:w-auto"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {t.checkout.createAccountButton}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button onClick={() => navigate("/account")}>
                {t.checkout.viewOrders}
              </Button>
            ) : (
              <Button variant="outline" onClick={() => navigate("/")}>
                {t.nav.home}
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate("/categories")}>
              {t.checkout.continueShopping}
            </Button>
          </div>
        </div>
      </CheckoutLayout>
    );
  }

  // Login Step - Show when not authenticated and not guest checkout
  if (!user && !isGuestCheckout) {
    return (
      <CheckoutLayout currentStep="login" isLoggedIn={false}>
        <CheckoutLoginStep 
          onSuccess={handleLoginSuccess}
          onRequestQuote={handleRequestQuote}
          onGuestCheckout={handleGuestCheckout}
        />
      </CheckoutLayout>
    );
  }

  // Shipping & Payment Steps (combined for simplicity)
  return (
    <CheckoutLayout currentStep="shipping" isLoggedIn={true}>
      <div className={fontClass}>
        <h1 className="text-2xl md:text-3xl font-bold mb-8">{t.checkout.checkout}</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Contact Info */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="font-semibold text-lg mb-4">{t.checkout.contactInformation}</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="customer_name">{t.checkout.fullName} <span className="text-destructive">*</span></Label>
                    <Input
                      id="customer_name"
                      value={formData.customer_name}
                      onChange={(e) => handleFieldChange("customer_name", e.target.value)}
                      onBlur={() => handleBlur("customer_name")}
                      className={cn(formErrors.customer_name && touched.customer_name && "border-destructive focus-visible:ring-destructive")}
                      required
                    />
                    {formErrors.customer_name && touched.customer_name && (
                      <p className="text-xs font-medium text-destructive">{formErrors.customer_name}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="company_name">{t.checkout.companyOptional} <span className="text-muted-foreground text-xs font-normal">({language === "bn" ? "ঐচ্ছিক" : "Optional"})</span></Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => handleFieldChange("company_name", e.target.value)}
                      placeholder={t.checkout.leaveBlankForPersonal}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="customer_email">{t.checkout.email} <span className="text-destructive">*</span></Label>
                    <Input
                      id="customer_email"
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) => handleFieldChange("customer_email", e.target.value)}
                      onBlur={() => handleBlur("customer_email")}
                      className={cn(formErrors.customer_email && touched.customer_email && "border-destructive focus-visible:ring-destructive")}
                      required
                    />
                    {formErrors.customer_email && touched.customer_email && (
                      <p className="text-xs font-medium text-destructive">{formErrors.customer_email}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="customer_phone">{t.checkout.phone} <span className="text-destructive">*</span></Label>
                    <Input
                      id="customer_phone"
                      value={formData.customer_phone}
                      onChange={(e) => handleFieldChange("customer_phone", e.target.value)}
                      onBlur={() => handleBlur("customer_phone")}
                      placeholder="+880"
                      className={cn(formErrors.customer_phone && touched.customer_phone && "border-destructive focus-visible:ring-destructive")}
                      required
                    />
                    {formErrors.customer_phone && touched.customer_phone && (
                      <p className="text-xs font-medium text-destructive">{formErrors.customer_phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  {t.checkout.deliveryAddress}
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-1.5">
                    <Label htmlFor="shipping_address">{t.checkout.address} <span className="text-destructive">*</span></Label>
                    <Input
                      id="shipping_address"
                      value={formData.shipping_address}
                      onChange={(e) => handleFieldChange("shipping_address", e.target.value)}
                      onBlur={() => handleBlur("shipping_address")}
                      placeholder={t.checkout.addressPlaceholder}
                      className={cn(formErrors.shipping_address && touched.shipping_address && "border-destructive focus-visible:ring-destructive")}
                      required
                    />
                    {formErrors.shipping_address && touched.shipping_address && (
                      <p className="text-xs font-medium text-destructive">{formErrors.shipping_address}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="shipping_city">{t.checkout.city} <span className="text-destructive">*</span></Label>
                    <Input
                      id="shipping_city"
                      value={formData.shipping_city}
                      onChange={(e) => handleFieldChange("shipping_city", e.target.value)}
                      onBlur={() => handleBlur("shipping_city")}
                      placeholder={t.checkout.cityPlaceholder}
                      className={cn(formErrors.shipping_city && touched.shipping_city && "border-destructive focus-visible:ring-destructive")}
                      required
                    />
                    {formErrors.shipping_city && touched.shipping_city && (
                      <p className="text-xs font-medium text-destructive">{formErrors.shipping_city}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="shipping_postal_code">{t.checkout.postalCode} <span className="text-muted-foreground text-xs font-normal">({language === "bn" ? "ঐচ্ছিক" : "Optional"})</span></Label>
                    <Input
                      id="shipping_postal_code"
                      value={formData.shipping_postal_code}
                      onChange={(e) => handleFieldChange("shipping_postal_code", e.target.value)}
                      placeholder="1000"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {t.checkout.paymentMethod}
                </h2>
                <RadioGroup
                  value={formData.payment_method}
                  onValueChange={(value) => setFormData({ ...formData, payment_method: value as PaymentMethod })}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 border border-border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="cash_on_delivery" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{t.checkout.cashOnDelivery}</p>
                          <p className="text-sm text-muted-foreground">{t.checkout.cashOnDeliveryDesc}</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border border-border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="bank_transfer" id="bank" />
                    <Label htmlFor="bank" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{t.checkout.bankTransfer}</p>
                          <p className="text-sm text-muted-foreground">{t.checkout.bankTransferDesc}</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {formData.payment_method === "bank_transfer" && (
                  <div className="mt-4 p-4 bg-muted rounded-lg text-sm">
                    <p className="font-medium mb-2">{t.checkout.bankInfo}:</p>
                    <p>{t.checkout.bankName}: Dutch-Bangla Bank Limited</p>
                    <p>{t.checkout.accountName}: ST International</p>
                    <p>{t.checkout.accountNumber}: 1234567890</p>
                    <p>{t.checkout.branch}: Bangla Motor, Dhaka</p>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="font-semibold text-lg mb-4">{t.checkout.additionalNotes} <span className="text-muted-foreground text-xs font-normal">({language === "bn" ? "ঐচ্ছিক" : "Optional"})</span></h2>
                <div className="space-y-1.5">
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={t.checkout.notesPlaceholder}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-6 sticky top-4">
                <h2 className="font-semibold text-lg mb-4">{t.checkout.orderSummary}</h2>

                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 text-sm">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-muted-foreground">
                          {item.quantity} × {formatPrice(item.price, language)}
                        </p>
                      </div>
                      <p className="font-medium whitespace-nowrap">
                        {formatPrice(item.price * item.quantity, language)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{language === "bn" ? "সাবটোটাল" : "Subtotal"}</span>
                    <span>{formatPrice(subtotal, language)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{language === "bn" ? "ডেলিভারি" : "Shipping"}</span>
                    <span>
                      {shippingCost === 0 ? (
                        <span className="text-green-600 font-medium">{language === "bn" ? "বিনামূল্যে" : "Free"}</span>
                      ) : (
                        formatPrice(shippingCost, language)
                      )}
                    </span>
                  </div>
                  {subtotal < 10000 && (
                    <p className="text-xs text-muted-foreground">
                      {language === "bn" 
                        ? `আরো ${formatPrice(10000 - subtotal, language)} কিনলে ফ্রি ডেলিভারি`
                        : `Add ${formatPrice(10000 - subtotal, language)} more for free delivery`
                      }
                    </p>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                    <span>{language === "bn" ? "মোট" : "Total"}</span>
                    <span className="text-primary">{formatPrice(total, language)}</span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full mt-6" 
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 mr-2" />
                  )}
                  {loading ? t.checkout.processing : t.checkout.placeOrder}
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  {t.checkout.secureCheckout}
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </CheckoutLayout>
  );
};

export default Checkout;