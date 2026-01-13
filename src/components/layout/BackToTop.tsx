import { useState, useEffect, useCallback } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUXTelemetry } from "@/hooks/useUXTelemetry";
import { useIsMobile } from "@/hooks/use-mobile";

const SCROLL_THRESHOLD = 400;
const BOTTOM_NAV_HEIGHT = 64; // Must match MobileBottomNav height

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { trackUtility } = useUXTelemetry();
  const isMobile = useIsMobile();

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    // Calculate scroll progress (0-100)
    const progress = docHeight > 0 ? Math.min((scrollY / docHeight) * 100, 100) : 0;
    
    setScrollProgress(progress);
    setIsVisible(scrollY > SCROLL_THRESHOLD);
  }, []);

  useEffect(() => {
    // Throttled scroll handler using RAF
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // Initial calculation
    handleScroll();
    
    return () => window.removeEventListener("scroll", onScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    trackUtility('back_to_top');
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Calculate circle properties for progress ring
  const size = 44;
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  // Position above bottom nav on mobile
  const bottomPosition = isMobile ? BOTTOM_NAV_HEIGHT + 16 : 24;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      style={{ bottom: bottomPosition }}
      className={cn(
        "fixed right-4 sm:right-6 z-40",
        "h-11 w-11 rounded-full",
        "bg-background/95 backdrop-blur-sm border border-border",
        "shadow-lg hover:shadow-xl",
        "flex items-center justify-center",
        "text-muted-foreground hover:text-foreground",
        "transition-all duration-200 ease-out",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "touch-manipulation",
        isVisible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      {/* Progress Ring SVG */}
      <svg
        className="absolute inset-0 -rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-primary transition-all duration-150 ease-out"
        />
      </svg>
      
      {/* Arrow Icon */}
      <ArrowUp className="h-4.5 w-4.5 relative z-10" />
    </button>
  );
};

export default BackToTop;
