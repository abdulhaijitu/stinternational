import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Hook to detect mobile viewport
 * Returns false by default (SSR-safe) to prevent hydration mismatches
 * Updates to actual value after client mount
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Mark as mounted
    setHasMounted(true);
    
    // Set initial value
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    checkMobile();
    
    // Listen for resize changes
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => checkMobile();
    
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Return false during SSR/initial render to prevent hydration issues
  return hasMounted ? isMobile : false;
}

/**
 * Hook to check if client has mounted
 * Useful for conditional rendering of client-only components
 */
export function useHasMounted(): boolean {
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  return hasMounted;
}
