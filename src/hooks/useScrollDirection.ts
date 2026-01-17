import { useState, useEffect, useRef, useCallback } from 'react';

interface ScrollDirectionState {
  isVisible: boolean;
  scrollY: number;
  scrollDirection: 'up' | 'down' | 'none';
}

/**
 * SSR-safe scroll direction hook
 * Returns safe defaults during SSR, updates after client mount
 */
export function useScrollDirection(threshold: number = 10) {
  const [hasMounted, setHasMounted] = useState(false);
  const [state, setState] = useState<ScrollDirectionState>({
    isVisible: true,
    scrollY: 0,
    scrollDirection: 'none',
  });

  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // Mark as mounted after first render
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const updateState = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - lastScrollY.current;
    
    // Determine scroll direction
    let direction: 'up' | 'down' | 'none' = 'none';
    if (Math.abs(scrollDelta) > threshold) {
      direction = scrollDelta > 0 ? 'down' : 'up';
    }

    // Show on scroll up, hide on scroll down (but always show at top)
    const shouldBeVisible = currentScrollY < 50 || direction === 'up' || direction === 'none';

    setState({
      isVisible: shouldBeVisible,
      scrollY: currentScrollY,
      scrollDirection: direction,
    });

    lastScrollY.current = currentScrollY;
    ticking.current = false;
  }, [threshold]);

  useEffect(() => {
    // Only attach listeners after mount
    if (!hasMounted) return;
    
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(updateState);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [updateState, hasMounted]);

  return state;
}
