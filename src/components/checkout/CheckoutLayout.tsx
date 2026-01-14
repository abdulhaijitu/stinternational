import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import CheckoutStepIndicator, { CheckoutStep } from "./CheckoutStepIndicator";

interface CheckoutLayoutProps {
  children: React.ReactNode;
  currentStep: CheckoutStep;
  isLoggedIn: boolean;
  showBackToCart?: boolean;
}

const CheckoutLayout = ({ 
  children, 
  currentStep, 
  isLoggedIn,
  showBackToCart = true 
}: CheckoutLayoutProps) => {
  const { language } = useLanguage();
  const fontClass = language === "bn" ? "font-siliguri" : "";

  return (
    <div className={`min-h-screen bg-background ${fontClass}`}>
      {/* Minimal Header */}
      <header className="bg-card border-b border-border">
        <div className="container-premium py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/favicon.png" 
                alt="ST International" 
                className="h-8 w-8"
              />
              <span className="font-bold text-lg hidden sm:inline">
                ST International
              </span>
            </Link>
            
            <div className="text-sm text-muted-foreground">
              {language === "bn" ? "নিরাপদ চেকআউট" : "Secure Checkout"}
            </div>
          </div>
        </div>
      </header>

      {/* Step Indicator */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container-premium">
          <CheckoutStepIndicator 
            currentStep={currentStep} 
            isLoggedIn={isLoggedIn} 
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="container-premium py-8 md:py-12">
        {showBackToCart && currentStep !== "confirmation" && (
          <Link 
            to="/cart" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {language === "bn" ? "কার্টে ফিরে যান" : "Back to Cart"}
          </Link>
        )}
        {children}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-border bg-muted/30 py-6">
        <div className="container-premium">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2024 ST International. {language === "bn" ? "সর্বস্বত্ব সংরক্ষিত।" : "All rights reserved."}</p>
            <div className="flex items-center gap-6">
              <Link to="/terms" className="hover:text-primary transition-colors">
                {language === "bn" ? "শর্তাবলী" : "Terms"}
              </Link>
              <Link to="/privacy" className="hover:text-primary transition-colors">
                {language === "bn" ? "গোপনীয়তা" : "Privacy"}
              </Link>
              <Link to="/contact" className="hover:text-primary transition-colors">
                {language === "bn" ? "সাহায্য" : "Help"}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CheckoutLayout;
