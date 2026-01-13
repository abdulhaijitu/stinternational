import { useState, useEffect, useCallback, useRef } from 'react';

interface SmartHeaderState {
  isScrolled: boolean;
  isCompact: boolean;
  isVisible: boolean;
  scrollDirection: 'up' | 'down' | 'none';
}

const SCROLL_THRESHOLD = 10; // Minimum scroll distance to trigger direction change
const HIDE_THRESHOLD = 200; // Minimum scroll position before header can hide

export const useSmartHeader = (compactThreshold: number = 100) => {
  const [state, setState] = useState<SmartHeaderState>({
    isScrolled: false,
    isCompact: false,
    isVisible: true,
    scrollDirection: 'none',
  });
  
  const lastScrollY = useRef(0);
  const lastDirectionChangeY = useRef(0);
  const ticking = useRef(false);

  const updateState = useCallback(() => {
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - lastScrollY.current;
    const isAtTop = currentScrollY < 20;
    
    setState(prev => {
      const isScrolled = currentScrollY > 20;
      const isCompact = currentScrollY > compactThreshold;
      
      // Determine scroll direction with hysteresis
      let scrollDirection = prev.scrollDirection;
      let isVisible = prev.isVisible;
      
      if (Math.abs(scrollDelta) > SCROLL_THRESHOLD) {
        scrollDirection = scrollDelta > 0 ? 'down' : 'up';
        lastDirectionChangeY.current = currentScrollY;
      }
      
      // Visibility logic:
      // - Always visible at top
      // - Hide when scrolling down past threshold
      // - Show when scrolling up
      if (isAtTop) {
        isVisible = true;
        scrollDirection = 'none';
      } else if (currentScrollY > HIDE_THRESHOLD) {
        if (scrollDirection === 'down' && scrollDelta > SCROLL_THRESHOLD) {
          isVisible = false;
        } else if (scrollDirection === 'up' && scrollDelta < -SCROLL_THRESHOLD) {
          isVisible = true;
        }
      } else {
        // Below top but above hide threshold - always visible
        isVisible = true;
      }
      
      // Only update if something changed
      if (prev.isScrolled === isScrolled && 
          prev.isCompact === isCompact && 
          prev.isVisible === isVisible &&
          prev.scrollDirection === scrollDirection) {
        return prev;
      }
      
      return { isScrolled, isCompact, isVisible, scrollDirection };
    });
    
    lastScrollY.current = currentScrollY;
    ticking.current = false;
  }, [compactThreshold]);

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
