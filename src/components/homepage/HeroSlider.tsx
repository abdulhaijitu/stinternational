import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, ChevronLeft, ChevronRight, CheckCircle, FlaskConical, Gauge, HardHat, Building2, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Slide animation types for each industry
type SlideAnimation = "fade-up" | "fade-right" | "zoom-in" | "fade-left";

// Slide data - professional B2B+B2C messaging with unique animations
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
    animation: "fade-up" as SlideAnimation,
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
    animation: "fade-right" as SlideAnimation,
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
    animation: "zoom-in" as SlideAnimation,
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
    animation: "fade-left" as SlideAnimation,
  },
];

// Animation classes for different slide effects
const getSlideAnimationClasses = (animation: SlideAnimation, isActive: boolean) => {
  const baseClasses = "transition-all duration-500 ease-out";
  
  if (isActive) {
    return cn(baseClasses, "opacity-100 translate-x-0 translate-y-0 scale-100 relative");
  }
  
  // Exit states based on animation type
  switch (animation) {
    case "fade-up":
      return cn(baseClasses, "opacity-0 translate-y-6 absolute inset-0 pointer-events-none");
    case "fade-right":
      return cn(baseClasses, "opacity-0 translate-x-6 absolute inset-0 pointer-events-none");
    case "fade-left":
      return cn(baseClasses, "opacity-0 -translate-x-6 absolute inset-0 pointer-events-none");
    case "zoom-in":
      return cn(baseClasses, "opacity-0 scale-95 absolute inset-0 pointer-events-none");
    default:
      return cn(baseClasses, "opacity-0 translate-y-4 absolute inset-0 pointer-events-none");
  }
};

// Visual animation classes based on slide type
const getVisualAnimationClasses = (animation: SlideAnimation, isActive: boolean) => {
  const baseClasses = "absolute inset-0 transition-all duration-700 ease-out";
  
  if (isActive) {
    return cn(baseClasses, "opacity-100 translate-x-0 translate-y-0 scale-100");
  }
  
  switch (animation) {
    case "fade-up":
      return cn(baseClasses, "opacity-0 translate-y-8");
    case "fade-right":
      return cn(baseClasses, "opacity-0 translate-x-8");
    case "fade-left":
      return cn(baseClasses, "opacity-0 -translate-x-8");
    case "zoom-in":
      return cn(baseClasses, "opacity-0 scale-90");
    default:
      return cn(baseClasses, "opacity-0");
  }
};

// Abstract visual components for each industry
const SlideVisual = ({ type, isActive, animation }: { type: string; isActive: boolean; animation: SlideAnimation }) => {
  const visualClasses = getVisualAnimationClasses(animation, isActive);

  const iconMap: Record<string, typeof FlaskConical> = {
    laboratory: FlaskConical,
    measurement: Gauge,
    engineering: HardHat,
    general: Building2,
  };

  const Icon = iconMap[type] || Building2;

  return (
    <div className={visualClasses}>
      {/* Abstract geometric shapes */}
      <div className="relative w-full h-full">
        {/* Main floating card */}
        <div className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary-foreground/10 rounded-2xl backdrop-blur-sm border border-primary-foreground/20 shadow-2xl flex items-center justify-center transition-transform duration-700 delay-100",
          isActive ? "rotate-0" : "rotate-3"
        )}>
          <Icon className={cn(
            "h-24 w-24 text-primary-foreground/40 transition-all duration-500 delay-200",
            isActive ? "scale-100 opacity-100" : "scale-90 opacity-0"
          )} strokeWidth={1} />
        </div>
        
        {/* Floating accent elements with staggered animations */}
        <div className={cn(
          "absolute top-1/4 right-1/4 w-20 h-20 bg-accent/30 rounded-xl backdrop-blur-sm transition-all duration-500 delay-150",
          isActive ? "rotate-12 opacity-100 translate-y-0" : "rotate-0 opacity-0 translate-y-4"
        )} />
        <div className={cn(
          "absolute bottom-1/3 left-1/4 w-16 h-16 bg-primary-foreground/15 rounded-lg transition-all duration-500 delay-200",
          isActive ? "-rotate-6 opacity-100 translate-x-0" : "rotate-0 opacity-0 -translate-x-4"
        )} />
        <div className={cn(
          "absolute top-1/3 left-1/3 w-12 h-12 bg-accent/20 rounded-full transition-all duration-500 delay-250",
          isActive ? "opacity-100 scale-100" : "opacity-0 scale-75"
        )} />
        
        {/* Stats card */}
        <div className={cn(
          "absolute top-16 right-8 bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-border transition-all duration-500 delay-300",
          isActive ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        )}>
          <div className="text-2xl font-bold text-foreground">5000+</div>
          <div className="text-xs text-muted-foreground">Products</div>
        </div>
        
        {/* Experience card */}
        <div className={cn(
          "absolute bottom-16 left-8 bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-border transition-all duration-500 delay-350",
          isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <div className="text-2xl font-bold text-foreground">19+</div>
          <div className="text-xs text-muted-foreground">Years Experience</div>
        </div>
      </div>
    </div>
  );
};

// Custom hook for swipe gestures
const useSwipeGesture = (onSwipeLeft: () => void, onSwipeRight: () => void, threshold = 50) => {
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(() => {
    if (touchStartX.current === null || touchEndX.current === null) return;

    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        onSwipeLeft();
      } else {
        onSwipeRight();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  }, [onSwipeLeft, onSwipeRight, threshold]);

  return { onTouchStart, onTouchMove, onTouchEnd };
};

// Custom hook for keyboard navigation
const useKeyboardNavigation = (onPrev: () => void, onNext: () => void, isEnabled: boolean) => {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          onPrev();
          break;
        case "ArrowRight":
          e.preventDefault();
          onNext();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onPrev, onNext, isEnabled]);
};

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const sliderRef = useRef<HTMLElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  // Computed pause state (either hover or manual)
  const effectivePaused = isPaused || isManuallyPaused;

  const toggleAutoplay = useCallback(() => {
    setIsManuallyPaused(prev => !prev);
  }, []);

  const SLIDE_INTERVAL = 6000; // 6 seconds
  const TRANSITION_DURATION = 500; // 500ms
  const PROGRESS_UPDATE_INTERVAL = 50; // Update progress every 50ms

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setProgress(0); // Reset progress on slide change
    setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % heroSlides.length);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length);
  }, [currentSlide, goToSlide]);

  // Swipe gesture support
  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipeGesture(nextSlide, prevSlide);

  // Keyboard navigation support
  useKeyboardNavigation(prevSlide, nextSlide, isFocused);

  // Auto-slide with pause on hover or manual toggle
  useEffect(() => {
    if (effectivePaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
      return;
    }

    // Reset progress when starting
    setProgress(0);

    // Progress bar animation
    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 / (SLIDE_INTERVAL / PROGRESS_UPDATE_INTERVAL));
        return Math.min(newProgress, 100);
      });
    }, PROGRESS_UPDATE_INTERVAL);

    // Auto-slide interval
    intervalRef.current = setInterval(nextSlide, SLIDE_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [effectivePaused, nextSlide, currentSlide]);

  return (
    <section 
      ref={sliderRef}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Hero slider - Use arrow keys to navigate"
      className="hero-gradient text-primary-foreground relative overflow-hidden min-h-[600px] md:min-h-[650px] touch-pan-y focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-primary-foreground/10 z-20">
        <div 
          className="h-full bg-accent transition-all duration-100 ease-linear"
          style={{ width: `${effectivePaused ? progress : progress}%` }}
        />
      </div>

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
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${heroSlides.length}: ${slide.headline}`}
                aria-hidden={currentSlide !== index}
                className={getSlideAnimationClasses(slide.animation, currentSlide === index)}
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
                <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-8 justify-center lg:justify-start text-sm text-primary-foreground/70">
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
          <div className="hidden lg:block relative h-[400px]" aria-hidden="true">
            {heroSlides.map((slide, index) => (
              <SlideVisual 
                key={slide.id} 
                type={slide.visual} 
                isActive={currentSlide === index}
                animation={slide.animation}
              />
            ))}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between mt-8 md:mt-12">
          {/* Dots Indicator with Progress and Tooltips */}
          <TooltipProvider delayDuration={200}>
            <div className="flex items-center gap-2">
              {heroSlides.map((slide, index) => (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => goToSlide(index)}
                      aria-label={`Go to slide ${index + 1}: ${slide.headline}`}
                      className="relative h-2 overflow-hidden rounded-full transition-all duration-300"
                      style={{ width: currentSlide === index ? '32px' : '8px' }}
                    >
                      <div className={cn(
                        "absolute inset-0 transition-colors duration-200",
                        currentSlide === index ? "bg-primary-foreground/30" : "bg-primary-foreground/30 hover:bg-primary-foreground/50"
                      )} />
                      {currentSlide === index && (
                        <div 
                          className="absolute inset-y-0 left-0 bg-accent transition-all duration-100 ease-linear"
                          style={{ width: `${progress}%` }}
                        />
                      )}
                      {currentSlide !== index && (
                        <div className="absolute inset-0 bg-primary-foreground/30 hover:bg-primary-foreground/50 transition-colors" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top" 
                    className="bg-background text-foreground border border-border shadow-lg"
                  >
                    <p className="font-medium text-sm">{slide.headline}</p>
                    <p className="text-xs text-muted-foreground">{slide.headlineAccent}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>

          {/* Arrow Controls with Autoplay Toggle */}
          <div className="flex items-center gap-2">
            {/* Autoplay Toggle Button */}
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleAutoplay}
                    aria-label={isManuallyPaused ? "Resume autoplay" : "Pause autoplay"}
                    className={cn(
                      "w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200",
                      isManuallyPaused 
                        ? "border-accent bg-accent/20 text-accent hover:bg-accent/30" 
                        : "border-primary-foreground/30 text-primary-foreground/70 hover:bg-primary-foreground/10 hover:border-primary-foreground/50"
                    )}
                  >
                    {isManuallyPaused ? (
                      <Play className="h-4 w-4 ml-0.5" />
                    ) : (
                      <Pause className="h-4 w-4" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent 
                  side="top"
                  className="bg-background text-foreground border border-border shadow-lg"
                >
                  <p className="text-sm">{isManuallyPaused ? "Resume autoplay" : "Pause autoplay"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="w-px h-6 bg-primary-foreground/20 mx-1" />

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

        {/* Swipe hint for mobile */}
        <div className="lg:hidden absolute bottom-4 left-4 text-xs text-primary-foreground/40 flex items-center gap-1">
          <ChevronLeft className="h-3 w-3" />
          <span>Swipe</span>
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
