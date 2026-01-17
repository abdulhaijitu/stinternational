import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUXTelemetry } from "@/hooks/useUXTelemetry";
import { useIsMobile } from "@/hooks/use-mobile";

const SCROLL_THRESHOLD = 400;

/**
 * Back to Top Button
 *
 * Critical fix: STATIC render only (no framer-motion / AnimatePresence)
 * so preview boot can never be blocked by animations.
 */
const BackToTop = () => {
  const [hasMounted, setHasMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { trackUtility } = useUXTelemetry();
  const isMobile = useIsMobile();
  const tickingRef = useRef(false);

  // Client-only mount guard
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    const progress = docHeight > 0 ? Math.min((scrollY / docHeight) * 100, 100) : 0;

    setScrollProgress(progress);
    setIsVisible(scrollY > SCROLL_THRESHOLD);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    const onScroll = () => {
      if (!tickingRef.current) {
        window.requestAnimationFrame(() => {
          handleScroll();
          tickingRef.current = false;
        });
        tickingRef.current = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, [handleScroll, hasMounted]);

  const scrollToTop = useCallback(() => {
    trackUtility("back_to_top");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [trackUtility]);

  // Don't render until client is ready
  if (!hasMounted || !isVisible) {
    return null;
  }

  // Circle properties for progress ring
  const size = isMobile ? 40 : 44;
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  // Smart positioning: ABOVE WhatsApp button
  // Mobile: WhatsApp at 128px + button height (48px) + gap (16px) = 192px
  // Desktop: WhatsApp at 24px + button height (56px) + gap (20px) = 100px
  const whatsappButtonHeight = isMobile ? 48 : 56;
  const gap = isMobile ? 16 : 20;
  const whatsappBottom = isMobile ? 128 : 24;
  const bottomPosition = whatsappBottom + whatsappButtonHeight + gap;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      style={{
        bottom: bottomPosition,
        width: size,
        height: size,
      }}
      className={cn(
        "fixed right-4 md:right-6 z-[44]",
        "rounded-full",
        "bg-background/95 backdrop-blur-sm border border-border",
        "shadow-md hover:shadow-lg",
        "flex items-center justify-center",
        "text-muted-foreground hover:text-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "touch-manipulation cursor-pointer"
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
          className="text-primary transition-[stroke-dashoffset] duration-150 ease-out"
        />
      </svg>

      {/* Arrow Icon */}
      <ArrowUp
        className={cn("relative z-10", isMobile ? "h-4 w-4" : "h-4.5 w-4.5")}
      />
    </button>
  );
};

export default BackToTop;

