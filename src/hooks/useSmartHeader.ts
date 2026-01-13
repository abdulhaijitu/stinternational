import { useState, useEffect, useCallback, useRef } from 'react';

interface SmartHeaderState {
  isScrolled: boolean;
  isCompact: boolean;
  isVisible: boolean;
}

export const useSmartHeader = (threshold: number = 100) => {
  const [state, setState] = useState<SmartHeaderState>({
    isScrolled: false,
    isCompact: false,
    isVisible: true,
  });
  
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const updateState = useCallback(() => {
    const currentScrollY = window.scrollY;
    const scrollingDown = currentScrollY > lastScrollY.current;
    const scrollingUp = currentScrollY < lastScrollY.current;
    
    setState(prev => {
      const isScrolled = currentScrollY > 20;
      
      // Compact mode: scrolled past threshold
      const isCompact = currentScrollY > threshold;
      
      // Visibility: always visible, but can be used for hide-on-scroll-down patterns
      // For now, we keep it always visible but track scroll direction
      const isVisible = true;
      
      // Only update if something changed
      if (prev.isScrolled === isScrolled && 
          prev.isCompact === isCompact && 
          prev.isVisible === isVisible) {
        return prev;
      }
      
      return { isScrolled, isCompact, isVisible };
    });
    
    lastScrollY.current = currentScrollY;
    ticking.current = false;
  }, [threshold]);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateState);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    updateState();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [updateState]);

  return state;
};
