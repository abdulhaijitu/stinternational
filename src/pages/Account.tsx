import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  User, 
  Package, 
  MapPin, 
  LogOut, 
  Building2, 
  Phone, 
  Mail,
  Loader2,
  Save
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import AuthForm from "@/components/auth/AuthForm";
import { toast } from "sonner";

const Account = () => {
  const { user, profile, loading, signOut, updateProfile } = useAuth();
  const { t, language } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    company_name: profile?.company_name || "",
    phone: profile?.phone || "",
    shipping_address: profile?.shipping_address || "",
    shipping_city: profile?.shipping_city || "",
    shipping_postal_code: profile?.shipping_postal_code || "",
  });

  const acc = t.account;
  const fontClass = language === "bn" ? "font-siliguri" : "";

  // Update form data when profile changes
  if (profile && !isEditing && formData.full_name !== profile.full_name) {
    setFormData({
      full_name: profile.full_name || "",
      company_name: profile.company_name || "",
      phone: profile.phone || "",
      shipping_address: profile.shipping_address || "",
      shipping_city: profile.shipping_city || "",
      shipping_postal_code: profile.shipping_postal_code || "",
    });
  }

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await updateProfile(formData);
    if (error) {
      toast.error(acc?.profileUpdateError || "Failed to update profile");
    } else {
      toast.success(acc?.profileUpdateSuccess || "Profile updated!");
      setIsEditing(false);
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success(acc?.logoutSuccess || "Logged out successfully");
  };

  if (loading) {
    return (
      <Layout>
        <div className="container-premium py-16 md:py-24 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className={`container-premium py-16 md:py-24 ${fontClass}`}>
          <AuthForm />
          <p className="text-sm text-muted-foreground mt-8 text-center">
            {acc?.loginTerms || "By logging in, you agree to our"}{" "}
            <Link to="/terms-conditions" className="text-primary hover:underline">
              {acc?.termsAndConditions || "Terms & Conditions"}
            </Link>{" "}
            {acc?.and || "and"}{" "}
            <Link to="/privacy-policy" className="text-primary hover:underline">
              {acc?.privacyPolicy || "Privacy Policy"}
            </Link>
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className={`bg-muted/50 border-b border-border ${fontClass}`}>
        <div className="container-premium py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{acc?.myAccount || "My Account"}</h1>
              <p className="text-muted-foreground mt-2">
                {user.email}
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              {acc?.logout || "Logout"}
            </Button>
          </div>
        </div>
      </section>

      <section className={`py-8 md:py-12 ${fontClass}`}>
        <div className="container-premium">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="font-semibold text-lg mb-4">{acc?.quickAccess || "Quick Access"}</h2>
              <Link
                to="/account/orders"
                className="flex items-center gap-4 bg-card border border-border rounded-lg p-4 card-hover"
              >
                <Package className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-medium">{acc?.myOrders || "My Orders"}</h3>
                  <p className="text-sm text-muted-foreground">{acc?.viewTrackOrders || "View and track orders"}</p>
                </div>
              </Link>
              <div
                className="flex items-center gap-4 bg-card border border-border rounded-lg p-4 opacity-60 cursor-not-allowed"
              >
                <MapPin className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-medium">{acc?.addresses || "Addresses"}</h3>
                  <p className="text-sm text-muted-foreground">{acc?.comingSoon || "Coming soon"}</p>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold text-lg">{acc?.profileInfo || "Profile Information"}</h2>
                  {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      {acc?.edit || "Edit"}
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                        {t.common.cancel}
                      </Button>
                      <Button size="sm" onClick={handleSaveProfile} disabled={saving}>
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {acc?.save || "Save"}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {acc?.fullName || "Full Name"}
                    </Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_name" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {acc?.companyName || "Company Name"}
                    </Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {acc?.email || "Email"}
                    </Label>
                    <Input
                      id="email"
                      value={user.email || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {acc?.phone || "Phone Number"}
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      placeholder="+880"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="shipping_address" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {acc?.shippingAddress || "Shipping Address"}
                    </Label>
                    <Input
                      id="shipping_address"
                      value={formData.shipping_address}
                      onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                      disabled={!isEditing}
                      placeholder={acc?.streetAddress || "Street, house number"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shipping_city">{acc?.city || "City"}</Label>
                    <Input
                      id="shipping_city"
                      value={formData.shipping_city}
                      onChange={(e) => setFormData({ ...formData, shipping_city: e.target.value })}
                      disabled={!isEditing}
                      placeholder={language === "bn" ? "ঢাকা" : "Dhaka"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shipping_postal_code">{acc?.postalCode || "Postal Code"}</Label>
                    <Input
                      id="shipping_postal_code"
                      value={formData.shipping_postal_code}
                      onChange={(e) => setFormData({ ...formData, shipping_postal_code: e.target.value })}
                      disabled={!isEditing}
                      placeholder="1000"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Account;
