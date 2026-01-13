import { Link } from "react-router-dom";
import { User, Package, MapPin, LogIn, ArrowRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

const Account = () => {
  // For now, show login prompt (auth will be added with Cloud)
  const isLoggedIn = false;

  if (!isLoggedIn) {
    return (
      <Layout>
        <div className="container-premium py-16 md:py-24">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Sign In to Your Account</h1>
            <p className="text-muted-foreground mb-8">
              Access your orders, manage your profile, and track deliveries. 
              Create an account or sign in to continue.
            </p>
            <div className="space-y-4">
              <Button variant="accent" size="lg" className="w-full">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
              <Button variant="outline" size="lg" className="w-full">
                Create Account
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-8">
              By signing in, you agree to our{" "}
              <Link to="/terms-conditions" className="text-primary hover:underline">
                Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link to="/privacy-policy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // Logged in state (placeholder for future implementation)
  return (
    <Layout>
      <section className="bg-muted/50 border-b border-border">
        <div className="container-premium py-8 md:py-12">
          <h1 className="text-2xl md:text-3xl font-bold">My Account</h1>
          <p className="text-muted-foreground mt-2">Manage your profile and orders</p>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container-premium">
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              to="/account/orders"
              className="bg-card border border-border rounded-lg p-6 card-hover"
            >
              <Package className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">My Orders</h3>
              <p className="text-sm text-muted-foreground">View and track your orders</p>
            </Link>
            <Link
              to="/account/addresses"
              className="bg-card border border-border rounded-lg p-6 card-hover"
            >
              <MapPin className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Addresses</h3>
              <p className="text-sm text-muted-foreground">Manage delivery addresses</p>
            </Link>
            <Link
              to="/account/profile"
              className="bg-card border border-border rounded-lg p-6 card-hover"
            >
              <User className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Profile</h3>
              <p className="text-sm text-muted-foreground">Update your information</p>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Account;
