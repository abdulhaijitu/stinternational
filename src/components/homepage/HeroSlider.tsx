import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, ChevronLeft, ChevronRight, CheckCircle, FlaskConical, Gauge, HardHat, Building2, Play, Pause } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUXTelemetry } from "@/hooks/useUXTelemetry";
import FloatingParticles from "./FloatingParticles";
import MorphingBlobs from "./MorphingBlobs";

// Import hero images
import heroLaboratory from "@/assets/hero/hero-laboratory.jpg";
import heroMeasurement from "@/assets/hero/hero-measurement.jpg";
import heroEngineering from "@/assets/hero/hero-engineering.jpg";
import heroInstitution from "@/assets/hero/hero-institution.jpg";

// Hero image map by visual type
const heroImageMap: Record<string, string> = {
  laboratory: heroLaboratory,
  measurement: heroMeasurement,
  engineering: heroEngineering,
  general: heroInstitution,
};

// Slide animation types for each industry
type SlideAnimation = "fade-up" | "fade-right" | "zoom-in" | "fade-left";

// Slide gradient themes for visual variety - Premium multi-layer design
interface SlideTheme {
  gradient: string;
  overlayColor: string;
  accentGlow: string;
  secondaryGlow: string;
  imageOverlay: string;
  statBg: string;
  trustBadgeGlow: string;
}

const slideThemes: SlideTheme[] = [
  {
    // Slide 1: Deep navy with amber/gold accent
    gradient: "from-[hsl(220,55%,8%)] via-[hsl(225,50%,14%)] to-[hsl(235,45%,18%)]",
    overlayColor: "bg-[radial-gradient(ellipse_120%_80%_at_80%_20%,hsl(38,90%,50%,0.08),transparent_60%),radial-gradient(ellipse_100%_100%_at_20%_80%,hsl(220,80%,50%,0.12),transparent_50%)]",
    accentGlow: "bg-amber-500/25",
    secondaryGlow: "bg-indigo-600/20",
    imageOverlay: "bg-gradient-to-br from-amber-900/30 via-transparent to-indigo-950/40",
    statBg: "bg-gradient-to-br from-amber-500/15 to-amber-600/10",
    trustBadgeGlow: "shadow-[0_0_20px_hsl(38,90%,50%,0.2)]",
  },
  {
    // Slide 2: Teal/Cyan scientific with blue undertone
    gradient: "from-[hsl(200,55%,8%)] via-[hsl(210,50%,12%)] to-[hsl(220,45%,16%)]",
    overlayColor: "bg-[radial-gradient(ellipse_100%_80%_at_70%_30%,hsl(185,80%,45%,0.10),transparent_55%),radial-gradient(ellipse_80%_100%_at_10%_90%,hsl(230,70%,50%,0.12),transparent_50%)]",
    accentGlow: "bg-cyan-500/25",
    secondaryGlow: "bg-blue-600/20",
    imageOverlay: "bg-gradient-to-br from-teal-900/30 via-transparent to-blue-950/40",
    statBg: "bg-gradient-to-br from-cyan-500/15 to-teal-600/10",
    trustBadgeGlow: "shadow-[0_0_20px_hsl(185,80%,45%,0.2)]",
  },
  {
    // Slide 3: Indigo/Purple innovation with electric blue
    gradient: "from-[hsl(250,50%,10%)] via-[hsl(260,45%,14%)] to-[hsl(240,50%,18%)]",
    overlayColor: "bg-[radial-gradient(ellipse_100%_80%_at_75%_25%,hsl(270,70%,55%,0.10),transparent_55%),radial-gradient(ellipse_90%_90%_at_15%_85%,hsl(220,90%,55%,0.12),transparent_50%)]",
    accentGlow: "bg-violet-500/25",
    secondaryGlow: "bg-blue-500/20",
    imageOverlay: "bg-gradient-to-br from-purple-900/30 via-transparent to-indigo-950/40",
    statBg: "bg-gradient-to-br from-violet-500/15 to-indigo-600/10",
    trustBadgeGlow: "shadow-[0_0_20px_hsl(270,70%,55%,0.2)]",
  },
  {
    // Slide 4: Deep navy with warm orange accent
    gradient: "from-[hsl(215,55%,8%)] via-[hsl(220,52%,12%)] to-[hsl(230,48%,16%)]",
    overlayColor: "bg-[radial-gradient(ellipse_110%_80%_at_80%_30%,hsl(25,90%,50%,0.08),transparent_55%),radial-gradient(ellipse_80%_90%_at_15%_85%,hsl(210,80%,50%,0.10),transparent_50%)]",
    accentGlow: "bg-orange-500/25",
    secondaryGlow: "bg-sky-600/20",
    imageOverlay: "bg-gradient-to-br from-orange-900/25 via-transparent to-slate-950/40",
    statBg: "bg-gradient-to-br from-orange-500/15 to-amber-600/10",
    trustBadgeGlow: "shadow-[0_0_20px_hsl(25,90%,50%,0.2)]",
  },
];

interface SlideData {
  id: number;
  trustBadgeKey: 'trustedSupplier' | 'certifiedQuality' | 'industrialGrade' | 'institutionsTrust';
  headlineKey: 'slide1Headline' | 'slide2Headline' | 'slide3Headline' | 'slide4Headline';
  accentKey: 'slide1Accent' | 'slide2Accent' | 'slide3Accent' | 'slide4Accent';
  descriptionKey: 'slide1Description' | 'slide2Description' | 'slide3Description' | 'slide4Description';
  visual: string;
  icon: typeof FlaskConical;
  animation: SlideAnimation;
  theme: SlideTheme;
}

// Slide configuration - references translation keys
const slideConfig: SlideData[] = [
  {
    id: 1,
    trustBadgeKey: 'trustedSupplier',
    headlineKey: 'slide1Headline',
    accentKey: 'slide1Accent',
    descriptionKey: 'slide1Description',
    visual: "laboratory",
    icon: FlaskConical,
    animation: "fade-up",
    theme: slideThemes[0],
  },
  {
    id: 2,
    trustBadgeKey: 'certifiedQuality',
    headlineKey: 'slide2Headline',
    accentKey: 'slide2Accent',
    descriptionKey: 'slide2Description',
    visual: "measurement",
    icon: Gauge,
    animation: "fade-right",
    theme: slideThemes[1],
  },
  {
    id: 3,
    trustBadgeKey: 'industrialGrade',
    headlineKey: 'slide3Headline',
    accentKey: 'slide3Accent',
    descriptionKey: 'slide3Description',
    visual: "engineering",
    icon: HardHat,
    animation: "zoom-in",
    theme: slideThemes[2],
  },
  {
    id: 4,
    trustBadgeKey: 'institutionsTrust',
    headlineKey: 'slide4Headline',
    accentKey: 'slide4Accent',
    descriptionKey: 'slide4Description',
    visual: "general",
    icon: Building2,
    animation: "fade-left",
    theme: slideThemes[3],
  },
];

// Animation classes for different slide effects
const getSlideAnimationClasses = (animation: SlideAnimation, isActive: boolean) => {
  const baseClasses = "transition-all duration-[400ms] ease-out";
  
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
  const { t } = useLanguage();
  const { trackHeroSlide } = useUXTelemetry();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const sliderRef = useRef<HTMLElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const lastTrackedSlideRef = useRef<number>(-1);

  // Mouse follow glow effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const glowX = useSpring(mouseX, springConfig);
  const glowY = useSpring(mouseY, springConfig);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }, [mouseX, mouseY]);

  // Generate translated slide data
  const heroSlides = useMemo(() => slideConfig.map(slide => ({
    ...slide,
    trustBadge: t.hero[slide.trustBadgeKey],
    headline: t.hero[slide.headlineKey],
    headlineAccent: t.hero[slide.accentKey],
    description: t.hero[slide.descriptionKey],
    primaryCta: { label: t.hero.browseProducts, href: "/products" },
    secondaryCta: { label: t.hero.requestQuote, href: "/request-quote" },
  })), [t]);

  // Computed pause state (either hover or manual)
  const effectivePaused = isPaused || isManuallyPaused;

  // Parallax scroll effect for background elements
  const { scrollY } = useScroll();
  
  // Primary glow - moves faster (parallax factor 0.15)
  const parallaxPrimary = useTransform(scrollY, [0, 500], [0, 75]);
  const parallaxPrimaryY = useTransform(scrollY, [0, 500], [0, 50]);
  
  // Secondary glow - moves slower (parallax factor 0.08)
  const parallaxSecondary = useTransform(scrollY, [0, 500], [0, -40]);
  const parallaxSecondaryY = useTransform(scrollY, [0, 500], [0, -30]);
  
  // Center glow - subtle movement (parallax factor 0.05)
  const parallaxCenter = useTransform(scrollY, [0, 500], [0, 25]);
  const parallaxCenterY = useTransform(scrollY, [0, 500], [0, 35]);

  const toggleAutoplay = useCallback(() => {
    setIsManuallyPaused(prev => !prev);
  }, []);

  const SLIDE_INTERVAL = 5000; // 5 seconds
  const TRANSITION_DURATION = 400; // 400ms
  const PROGRESS_UPDATE_INTERVAL = 50; // Update progress every 50ms

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setProgress(0); // Reset progress on slide change
    
    // Track slide view
    if (lastTrackedSlideRef.current !== index) {
      trackHeroSlide(index, 'view');
      lastTrackedSlideRef.current = index;
    }
    
    setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
  }, [isTransitioning, trackHeroSlide]);

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

  // Get current slide theme
  const currentTheme = heroSlides[currentSlide]?.theme || slideThemes[0];

  return (
    <section 
      ref={sliderRef}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Hero slider - Use arrow keys to navigate"
      className="relative overflow-hidden min-h-[600px] md:min-h-[650px] touch-pan-y focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary text-primary-foreground"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onMouseMove={handleMouseMove}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Dynamic Slide Background Gradients - Premium Multi-layer */}
      {heroSlides.map((slide, index) => (
        <div
          key={`bg-${slide.id}`}
          className={cn(
            "absolute inset-0 bg-gradient-to-br transition-opacity duration-[600ms] ease-out",
            slide.theme.gradient,
            currentSlide === index ? "opacity-100" : "opacity-0"
          )}
        />
      ))}

      {/* Premium Color Overlay Layer - Soft multi-color wash */}
      {heroSlides.map((slide, index) => (
        <div
          key={`overlay-${slide.id}`}
          className={cn(
            "absolute inset-0 transition-opacity duration-[600ms] ease-out",
            slide.theme.overlayColor,
            currentSlide === index ? "opacity-100" : "opacity-0"
          )}
        />
      ))}

      {/* Progress Bar - Enhanced with gradient glow */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-primary-foreground/10 z-20">
        <div 
          className="h-full bg-gradient-to-r from-accent via-accent to-amber-400 transition-all duration-100 ease-linear shadow-[0_0_12px_hsl(38,90%,50%,0.4)]"
          style={{ width: `${effectivePaused ? progress : progress}%` }}
        />
      </div>

      {/* Enhanced Background Effects - Premium glow system with parallax */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary accent glow - Large radial with parallax */}
        <motion.div 
          className={cn(
            "absolute top-0 right-0 w-[700px] h-[700px] md:w-[900px] md:h-[900px] rounded-full blur-[150px] md:blur-[180px] transition-colors duration-700",
            currentTheme.accentGlow
          )}
          style={{ 
            x: parallaxPrimary,
            y: parallaxPrimaryY,
            translateX: "33%",
            translateY: "-25%"
          }}
        />
        {/* Secondary glow - Bottom left with parallax (slower) */}
        <motion.div 
          className={cn(
            "absolute bottom-0 left-0 w-[500px] h-[500px] md:w-[600px] md:h-[600px] rounded-full blur-[120px] md:blur-[150px] transition-colors duration-700",
            currentTheme.secondaryGlow
          )}
          style={{ 
            x: parallaxSecondary,
            y: parallaxSecondaryY,
            translateX: "-25%",
            translateY: "25%"
          }}
        />
        {/* Center ambient glow with subtle parallax */}
        <motion.div 
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-primary-foreground/[0.03] rounded-full blur-[100px]"
          style={{ 
            x: parallaxCenter,
            y: parallaxCenterY,
            translateX: "-50%",
            translateY: "-50%"
          }}
        />
        {/* Subtle noise texture overlay for premium feel */}
        <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />
      </div>

      {/* Floating Particles Effect - Subtle animated shapes */}
      <FloatingParticles count={12} />

      {/* Mouse-follow glow effect - Interactive depth */}
      <motion.div
        className="absolute pointer-events-none hidden md:block"
        style={{
          x: glowX,
          y: glowY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        {/* Primary glow - follows cursor */}
        <div className={cn(
          "w-[300px] h-[300px] rounded-full blur-[80px] opacity-20 transition-colors duration-500",
          currentTheme.accentGlow
        )} />
        {/* Secondary inner glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[150px] h-[150px] rounded-full bg-primary-foreground/10 blur-[40px]" />
        </div>
      </motion.div>

      {/* Morphing Blobs - Organic fluid background */}
      <MorphingBlobs />
      
      {/* Gradient fade divider at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/20 via-transparent to-transparent pointer-events-none z-10" />

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
                {/* Trust Badge - Enhanced with soft glow and tinted border */}
                <motion.div 
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 backdrop-blur-md rounded-full text-sm mb-6 md:mb-8 border border-accent/30 transition-shadow duration-500",
                    currentSlide === index && slide.theme.trustBadgeGlow
                  )}
                  initial={{ opacity: 0, y: -20 }}
                  animate={currentSlide === index ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <motion.div
                    animate={currentSlide === index ? { rotate: [0, 360] } : {}}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <CheckCircle className="h-4 w-4 text-accent drop-shadow-[0_0_4px_hsl(38,90%,50%,0.5)]" />
                  </motion.div>
                  <span className="font-medium text-primary-foreground/95">{slide.trustBadge}</span>
                </motion.div>
                
                {/* Headline - Two-tone color design with tighter typography */}
                <motion.h1 
                  className="text-balance mb-4 md:mb-6 leading-[1.1] tracking-[-0.02em]"
                  initial={{ opacity: 0, y: 30 }}
                  animate={currentSlide === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <span className="text-primary-foreground/95">{slide.headline}</span>{" "}
                  <motion.span 
                    className="text-accent relative inline-block drop-shadow-[0_0_20px_hsl(38,90%,50%,0.3)]"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={currentSlide === index ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    {slide.headlineAccent}
                    <motion.span 
                      className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-accent via-accent/80 to-transparent rounded-full shadow-[0_0_8px_hsl(38,90%,50%,0.4)]"
                      initial={{ scaleX: 0 }}
                      animate={currentSlide === index ? { scaleX: 1 } : { scaleX: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      style={{ originX: 0 }}
                    />
                  </motion.span>
                </motion.h1>
                
                {/* Description */}
                <motion.p 
                  className="text-base md:text-lg text-primary-foreground/80 max-w-xl mb-8 md:mb-10 leading-relaxed mx-auto lg:mx-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={currentSlide === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {slide.description}
                </motion.p>
                
                {/* CTAs - Enhanced with better hover states */}
                <motion.div 
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={currentSlide === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button 
                      asChild 
                      size="lg" 
                      className="bg-gradient-to-r from-accent to-amber-500 hover:from-accent/90 hover:to-amber-400 text-accent-foreground shadow-lg hover:shadow-xl hover:shadow-accent/20 transition-all duration-300 group relative overflow-hidden"
                      onClick={() => trackHeroSlide(index, 'click')}
                    >
                      <Link to={slide.primaryCta.href}>
                        <motion.span
                          className="absolute inset-0 bg-white/20"
                          animate={{
                            x: ["-100%", "100%"]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 3,
                            ease: "easeInOut"
                          }}
                        />
                        <span className="relative">{slide.primaryCta.label}</span>
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200 relative" />
                      </Link>
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button 
                      asChild 
                      variant="outline" 
                      size="lg" 
                      className="border-primary-foreground/30 text-primary-foreground hover:bg-accent/20 hover:border-accent/50 hover:text-accent transition-all duration-300 group"
                      onClick={() => trackHeroSlide(index, 'click')}
                    >
                      <Link to={slide.secondaryCta.href}>
                        <FileText className="mr-2 h-4 w-4 group-hover:text-accent transition-colors" />
                        <span>{slide.secondaryCta.label}</span>
                      </Link>
                    </Button>
                  </motion.div>
                </motion.div>

                {/* B2B+B2C indicators */}
                <motion.div 
                  className="flex flex-wrap items-center gap-4 md:gap-6 mt-8 justify-center lg:justify-start text-sm text-primary-foreground/70"
                  initial={{ opacity: 0 }}
                  animate={currentSlide === index ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <div className="flex items-center gap-2">
                    <motion.span 
                      className="w-2 h-2 rounded-full bg-accent"
                      animate={currentSlide === index ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span>{t.hero.directPurchase}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.span 
                      className="w-2 h-2 rounded-full bg-primary-foreground/50"
                      animate={currentSlide === index ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                    />
                    <span>{t.hero.bulkPricing}</span>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>

          {/* Right Column / Mobile Bottom - Image Container */}
          <div className="relative h-[200px] sm:h-[250px] lg:h-[400px] mt-8 lg:mt-0" aria-hidden="true">
            {/* Image container with rounded corners, premium border and color overlay */}
            <div className="relative w-full h-full rounded-xl lg:rounded-2xl overflow-hidden border border-primary-foreground/20 shadow-2xl shadow-black/30">
              {heroSlides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={cn(
                    "absolute inset-0 transition-all duration-[500ms] ease-out",
                    currentSlide === index 
                      ? "opacity-100 translate-x-0 scale-100" 
                      : "opacity-0 translate-x-3 scale-[1.02]"
                  )}
                >
                  <img
                    src={heroImageMap[slide.visual]}
                    alt=""
                    loading={index === 0 ? "eager" : "lazy"}
                    className="absolute inset-0 w-full h-full object-cover object-center lg:object-right"
                  />
                  {/* Premium color overlay matching slide theme */}
                  <div className={cn(
                    "absolute inset-0 transition-opacity duration-500",
                    slide.theme.imageOverlay,
                    currentSlide === index ? "opacity-100" : "opacity-0"
                  )} />
                  {/* Soft edge fade for natural blending */}
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[hsl(220,50%,10%,0.4)] md:to-[hsl(220,50%,10%,0.3)]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220,50%,10%,0.3)] via-transparent to-transparent" />
                </div>
              ))}
              
              {/* Premium inner shadow for depth */}
              <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.4)] pointer-events-none" />
              {/* Subtle inner glow at edges */}
              <div className="absolute inset-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] pointer-events-none rounded-xl lg:rounded-2xl" />
            </div>
            
            {/* Stats card - Products count with enhanced tinted background */}
            <motion.div 
              className={cn(
                "absolute -top-2 -right-2 lg:-right-4 backdrop-blur-md rounded-lg p-3 lg:p-4 shadow-xl border border-primary-foreground/20 z-10",
                currentTheme.statBg,
                "bg-background/85"
              )}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <motion.div 
                className="text-xl lg:text-2xl font-bold text-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                5000+
              </motion.div>
              <div className="text-[10px] lg:text-xs text-muted-foreground font-medium">{t.hero.productsCount}</div>
              {/* Subtle gradient border glow */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary-foreground/10 to-transparent opacity-50 pointer-events-none" />
            </motion.div>
            
            {/* Experience card with enhanced tinted background */}
            <motion.div 
              className={cn(
                "absolute -bottom-2 -left-2 lg:-left-4 backdrop-blur-md rounded-lg p-3 lg:p-4 shadow-xl border border-primary-foreground/20 z-10",
                currentTheme.statBg,
                "bg-background/85"
              )}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.05, y: 5 }}
            >
              <motion.div 
                className="text-xl lg:text-2xl font-bold text-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                10+
              </motion.div>
              <div className="text-[10px] lg:text-xs text-muted-foreground font-medium">{t.hero.yearsExperience}</div>
              {/* Subtle gradient border glow */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary-foreground/10 to-transparent opacity-50 pointer-events-none" />
            </motion.div>
          </div>
        </div>

        {/* Gradient divider line instead of solid */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-20 w-24 h-px bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent" />

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
                    aria-label={isManuallyPaused ? t.hero.resumeAutoplay : t.hero.pauseAutoplay}
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
                  <p className="text-sm">{isManuallyPaused ? t.hero.resumeAutoplay : t.hero.pauseAutoplay}</p>
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
          <span>{t.hero.swipe}</span>
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
