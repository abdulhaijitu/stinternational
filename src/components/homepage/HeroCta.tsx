import { Link } from "react-router-dom";
import { ArrowRight, FileText, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useCtaAnalytics } from "@/hooks/useCtaAnalytics";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

// Animated gradient border button wrapper with enhanced accessibility
const AnimatedGradientButton = ({ 
  children, 
  variant = "primary",
  className 
}: { 
  children: React.ReactNode; 
  variant?: "primary" | "secondary";
  className?: string;
}) => {
  const isPrimary = variant === "primary";
  
  return (
    <motion.div
      className={cn(
        "relative group",
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Animated gradient border - smoother transition */}
      <div className={cn(
        "absolute -inset-[2px] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out blur-[1px]",
        isPrimary 
          ? "bg-gradient-to-r from-primary via-primary/80 to-primary animate-gradient-x" 
          : "bg-gradient-to-r from-white/40 via-white/60 to-white/40 animate-gradient-x"
      )} />
      
      {/* Glow effect on hover - smoother */}
      <div className={cn(
        "absolute -inset-[2px] rounded-lg opacity-0 group-hover:opacity-50 transition-all duration-500 ease-out blur-lg",
        isPrimary 
          ? "bg-primary" 
          : "bg-white/30"
      )} />
      
      {/* Button content wrapper */}
      <div className="relative">
        {children}
      </div>
      
      {/* Shine effect on hover - smoother */}
      <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
        <div className={cn(
          "absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out",
          "bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12"
        )} />
      </div>
    </motion.div>
  );
};

// Enhanced CTA Button component with accessibility
const CTAButton = ({
  to,
  variant,
  onClick,
  icon: Icon,
  label,
  ariaLabel,
  showArrow = false
}: {
  to: string;
  variant: "primary" | "secondary";
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  ariaLabel?: string;
  showArrow?: boolean;
}) => {
  const isPrimary = variant === "primary";
  
  return (
    <AnimatedGradientButton variant={variant}>
      <Link
        to={to}
        onClick={onClick}
        aria-label={ariaLabel || label}
        className={cn(
          "relative flex items-center justify-center gap-2.5 h-14 px-8 md:px-10 rounded-lg text-lg font-semibold",
          "transition-all duration-300 ease-out",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          isPrimary
            ? "bg-primary text-primary-contrast shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:bg-primary/95 hover:text-primary-foreground"
            : "bg-white/10 text-white border border-white/20 backdrop-blur-sm hover:bg-white/20 hover:border-white/30"
        )}
      >
        <motion.span
          className="flex items-center gap-2.5"
          initial={false}
        >
          <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
          <span>{label}</span>
          {showArrow && (
            <motion.span
              className="inline-flex"
              initial={{ x: 0 }}
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </motion.span>
          )}
        </motion.span>
      </Link>
    </AnimatedGradientButton>
  );
};

const HeroCta = () => {
  const { variant, trackClick } = useCtaAnalytics();
  const { t } = useLanguage();

  const handleBrowseClick = () => {
    trackClick("browse_products");
  };

  const handleQuoteClick = () => {
    trackClick("request_quote");
  };

  // Variant A: Browse Products primary
  // Variant B: Request Quote primary
  if (variant === "request_quote") {
    return (
      <div className="space-y-6" role="navigation" aria-label="Hero actions">
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <CTAButton
            to="/request-quote"
            variant="primary"
            onClick={handleQuoteClick}
            icon={FileText}
            label={t.hero.requestQuote}
            ariaLabel={t.hero.requestQuote}
            showArrow
          />
          <CTAButton
            to="/categories"
            variant="secondary"
            onClick={handleBrowseClick}
            icon={ShoppingBag}
            label={t.hero.browseProducts}
            ariaLabel={t.hero.browseProducts}
          />
        </div>
        {/* B2B/B2C messaging with enhanced styling */}
        <motion.div 
          className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start text-sm text-primary-foreground/70"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          aria-label="Benefits"
        >
          <div className="flex items-center gap-2 group">
            <motion.span 
              className="w-2 h-2 bg-primary rounded-full shadow-sm shadow-primary/50"
              whileHover={{ scale: 1.3 }}
              transition={{ type: "spring", stiffness: 400 }}
              aria-hidden="true"
            />
            <span className="group-hover:text-primary-foreground/90 transition-colors duration-300">{t.hero.directPurchase}</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-gradient-to-b from-transparent via-primary-foreground/30 to-transparent" aria-hidden="true" />
          <div className="flex items-center gap-2 group">
            <motion.span 
              className="w-2 h-2 bg-primary rounded-full shadow-sm shadow-primary/50"
              whileHover={{ scale: 1.3 }}
              transition={{ type: "spring", stiffness: 400 }}
              aria-hidden="true"
            />
            <span className="group-hover:text-primary-foreground/90 transition-colors duration-300">{t.hero.bulkPricing}</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // Default: Variant A - Browse Products primary
  return (
    <div className="space-y-6" role="navigation" aria-label="Hero actions">
      <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
        <CTAButton
          to="/categories"
          variant="primary"
          onClick={handleBrowseClick}
          icon={ShoppingBag}
          label={t.hero.browseProducts}
          ariaLabel={t.hero.browseProducts}
          showArrow
        />
        <CTAButton
          to="/request-quote"
          variant="secondary"
          onClick={handleQuoteClick}
          icon={FileText}
          label={t.hero.requestQuote}
          ariaLabel={t.hero.requestQuote}
        />
      </div>
      {/* B2B/B2C messaging with enhanced styling */}
      <motion.div 
        className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start text-sm text-primary-foreground/70"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        aria-label="Benefits"
      >
        <div className="flex items-center gap-2 group">
          <motion.span 
            className="w-2 h-2 bg-primary rounded-full shadow-sm shadow-primary/50"
            whileHover={{ scale: 1.3 }}
            transition={{ type: "spring", stiffness: 400 }}
            aria-hidden="true"
          />
          <span className="group-hover:text-primary-foreground/90 transition-colors duration-300">{t.hero.directPurchase}</span>
        </div>
        <div className="hidden sm:block w-px h-4 bg-gradient-to-b from-transparent via-primary-foreground/30 to-transparent" aria-hidden="true" />
        <div className="flex items-center gap-2 group">
          <motion.span 
            className="w-2 h-2 bg-primary rounded-full shadow-sm shadow-primary/50"
            whileHover={{ scale: 1.3 }}
            transition={{ type: "spring", stiffness: 400 }}
            aria-hidden="true"
          />
          <span className="group-hover:text-primary-foreground/90 transition-colors duration-300">{t.hero.bulkPricing}</span>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroCta;
