import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, ChevronLeft, ChevronRight, CheckCircle, FlaskConical, Gauge, HardHat, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Slide data - professional B2B+B2C messaging
const heroSlides = [
  {
    id: 1,
    trustBadge: "Trusted Supplier Since 2005",
    headline: "Scientific & Laboratory Equipment",
    headlineAccent: "for Research Excellence",
    description: "Precision instruments for universities, research laboratories, and educational institutions. Certified quality with complete documentation and after-sales support.",
    primaryCta: { label: "Browse Products", href: "/products" },
    secondaryCta: { label: "Request a Quote", href: "/request-quote" },
    visual: "laboratory",
    icon: FlaskConical,
  },
  {
    id: 2,
    trustBadge: "Certified Quality Assurance",
    headline: "Measurement & Precision Instruments",
    headlineAccent: "for Accurate Results",
    description: "High-accuracy measuring equipment for quality control, testing laboratories, and industrial applications. Traceable calibration and technical support included.",
    primaryCta: { label: "Browse Products", href: "/products" },
    secondaryCta: { label: "Request a Quote", href: "/request-quote" },
    visual: "measurement",
    icon: Gauge,
  },
  {
    id: 3,
    trustBadge: "Industrial Grade Standards",
    headline: "Engineering & Industrial Equipment",
    headlineAccent: "Built for Performance",
    description: "Heavy-duty equipment for manufacturing, construction, and industrial operations. Bulk supply available with competitive institutional pricing.",
    primaryCta: { label: "Browse Products", href: "/products" },
    secondaryCta: { label: "Request a Quote", href: "/request-quote" },
    visual: "engineering",
    icon: HardHat,
  },
  {
    id: 4,
    trustBadge: "2000+ Institutions Trust Us",
    headline: "Your Complete Equipment Partner",
    headlineAccent: "Nationwide Delivery",
    description: "From individual professionals to large institutions — we provide certified equipment, technical guidance, and reliable after-sales service across Bangladesh.",
    primaryCta: { label: "Browse Products", href: "/products" },
    secondaryCta: { label: "Request a Quote", href: "/request-quote" },
    visual: "general",
    icon: Building2,
  },
];

// Abstract visual components for each industry
const SlideVisual = ({ type, isActive }: { type: string; isActive: boolean }) => {
  const baseClasses = cn(
    "absolute inset-0 transition-opacity duration-500",
    isActive ? "opacity-100" : "opacity-0"
  );

  const iconMap: Record<string, typeof FlaskConical> = {
    laboratory: FlaskConical,
    measurement: Gauge,
    engineering: HardHat,
    general: Building2,
  };

  const Icon = iconMap[type] || Building2;

  return (
    <div className={baseClasses}>
      {/* Abstract geometric shapes */}
      <div className="relative w-full h-full">
        {/* Main floating card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary-foreground/10 rounded-2xl backdrop-blur-sm border border-primary-foreground/20 shadow-2xl flex items-center justify-center">
          <Icon className="h-24 w-24 text-primary-foreground/40" strokeWidth={1} />
        </div>
        
        {/* Floating accent elements */}
        <div className="absolute top-1/4 right-1/4 w-20 h-20 bg-accent/30 rounded-xl rotate-12 backdrop-blur-sm" />
        <div className="absolute bottom-1/3 left-1/4 w-16 h-16 bg-primary-foreground/15 rounded-lg -rotate-6" />
        <div className="absolute top-1/3 left-1/3 w-12 h-12 bg-accent/20 rounded-full" />
        
        {/* Stats card */}
        <div className="absolute top-16 right-8 bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-border">
          <div className="text-2xl font-bold text-foreground">5000+</div>
          <div className="text-xs text-muted-foreground">Products</div>
        </div>
        
        {/* Experience card */}
        <div className="absolute bottom-16 left-8 bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-border">
          <div className="text-2xl font-bold text-foreground">19+</div>
          <div className="text-xs text-muted-foreground">Years Experience</div>
        </div>
      </div>
    </div>
  );
};

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const SLIDE_INTERVAL = 6000; // 6 seconds
  const TRANSITION_DURATION = 500; // 500ms

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % heroSlides.length);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length);
  }, [currentSlide, goToSlide]);

  // Auto-slide with pause on hover
  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(nextSlide, SLIDE_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, nextSlide]);

  const currentData = heroSlides[currentSlide];

  return (
    <section 
      className="hero-gradient text-primary-foreground relative overflow-hidden min-h-[600px] md:min-h-[650px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[120px] transform translate-x-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary-foreground/5 rounded-full blur-[80px]" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-y-0 right-0 w-1/2 opacity-[0.02]">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <defs>
              <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-grid)" />
          </svg>
        </div>
      </div>

      <div className="container-premium py-16 md:py-20 lg:py-24 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[400px]">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left relative z-10">
            {/* Slides Content */}
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={cn(
                  "transition-all duration-500 ease-out",
                  currentSlide === index
                    ? "opacity-100 translate-y-0 relative"
                    : "opacity-0 translate-y-4 absolute inset-0 pointer-events-none"
                )}
              >
                {/* Trust Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 rounded-full text-sm mb-6 md:mb-8">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  <span className="font-medium">{slide.trustBadge}</span>
                </div>
                
                {/* Headline */}
                <h1 className="text-balance mb-4 md:mb-6">
                  {slide.headline}{" "}
                  <span className="text-accent">{slide.headlineAccent}</span>
                </h1>
                
                {/* Description */}
                <p className="text-base md:text-lg text-primary-foreground/80 max-w-xl mb-8 md:mb-10 leading-relaxed mx-auto lg:mx-0">
                  {slide.description}
                </p>
                
                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button 
                    asChild 
                    size="lg" 
                    className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg hover:shadow-xl transition-all duration-200 group"
                  >
                    <Link to={slide.primaryCta.href}>
                      <span>{slide.primaryCta.label}</span>
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>
                  </Button>
                  
                  <Button 
                    asChild 
                    variant="outline" 
                    size="lg" 
                    className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/50 transition-all duration-200"
                  >
                    <Link to={slide.secondaryCta.href}>
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{slide.secondaryCta.label}</span>
                    </Link>
                  </Button>
                </div>

                {/* B2B+B2C indicators */}
                <div className="flex items-center gap-6 mt-8 justify-center lg:justify-start text-sm text-primary-foreground/70">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    <span>Direct purchase available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary-foreground/50" />
                    <span>Bulk pricing for institutions</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - Visual */}
          <div className="hidden lg:block relative h-[400px]">
            {heroSlides.map((slide, index) => (
              <SlideVisual 
                key={slide.id} 
                type={slide.visual} 
                isActive={currentSlide === index}
              />
            ))}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between mt-8 md:mt-12">
          {/* Dots Indicator */}
          <div className="flex items-center gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  currentSlide === index
                    ? "w-8 bg-accent"
                    : "w-2 bg-primary-foreground/30 hover:bg-primary-foreground/50"
                )}
              />
            ))}
          </div>

          {/* Arrow Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              disabled={isTransitioning}
              aria-label="Previous slide"
              className="w-10 h-10 rounded-full border border-primary-foreground/30 flex items-center justify-center text-primary-foreground/70 hover:bg-primary-foreground/10 hover:border-primary-foreground/50 transition-all duration-200 disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextSlide}
              disabled={isTransitioning}
              aria-label="Next slide"
              className="w-10 h-10 rounded-full border border-primary-foreground/30 flex items-center justify-center text-primary-foreground/70 hover:bg-primary-foreground/10 hover:border-primary-foreground/50 transition-all duration-200 disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Slide Counter */}
        <div className="absolute bottom-4 right-4 text-xs text-primary-foreground/50 font-mono">
          {String(currentSlide + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
