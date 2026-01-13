import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
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
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="hero"
          size="xl"
          asChild
          className="active:scale-95 transition-transform duration-200"
          onClick={handleQuoteClick}
        >
          <Link to="/request-quote">
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
          <Link to="/categories">Browse Products</Link>
        </Button>
      </div>
    );
  }

  // Default: Variant A - Browse Products primary
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button
        variant="hero"
        size="xl"
        asChild
        className="active:scale-95 transition-transform duration-200"
        onClick={handleBrowseClick}
      >
        <Link to="/categories">
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
        <Link to="/request-quote">Request a Quote</Link>
      </Button>
    </div>
  );
};

export default HeroCta;
