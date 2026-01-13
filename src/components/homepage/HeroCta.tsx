import { Link } from "react-router-dom";
import { ArrowRight, FileText, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCtaAnalytics } from "@/hooks/useCtaAnalytics";

const HeroCta = () => {
  const { variant, trackClick } = useCtaAnalytics();

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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <Button
            variant="hero"
            size="xl"
            asChild
            className="active:scale-95 transition-transform duration-200"
            onClick={handleQuoteClick}
          >
            <Link to="/request-quote">
              <FileText className="h-5 w-5" />
              Request a Quote
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            variant="hero-secondary"
            size="xl"
            asChild
            className="active:scale-95 transition-transform duration-200"
            onClick={handleBrowseClick}
          >
            <Link to="/categories">
              <ShoppingBag className="h-5 w-5" />
              Browse Products
            </Link>
          </Button>
        </div>
        {/* B2B/B2C messaging */}
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start text-sm text-primary-foreground/70">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-accent rounded-full" />
            <span>Direct purchase available</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-primary-foreground/30" />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-accent rounded-full" />
            <span>Bulk pricing for institutions</span>
          </div>
        </div>
      </div>
    );
  }

  // Default: Variant A - Browse Products primary
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
        <Button
          variant="hero"
          size="xl"
          asChild
          className="active:scale-95 transition-transform duration-200"
          onClick={handleBrowseClick}
        >
          <Link to="/categories">
            <ShoppingBag className="h-5 w-5" />
            Browse Products
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
        <Button
          variant="hero-secondary"
          size="xl"
          asChild
          className="active:scale-95 transition-transform duration-200"
          onClick={handleQuoteClick}
        >
          <Link to="/request-quote">
            <FileText className="h-5 w-5" />
            Request a Quote
          </Link>
        </Button>
      </div>
      {/* B2B/B2C messaging */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start text-sm text-primary-foreground/70">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-accent rounded-full" />
          <span>Direct purchase available</span>
        </div>
        <div className="hidden sm:block w-px h-4 bg-primary-foreground/30" />
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-accent rounded-full" />
          <span>Bulk pricing for institutions</span>
        </div>
      </div>
    </div>
  );
};

export default HeroCta;
