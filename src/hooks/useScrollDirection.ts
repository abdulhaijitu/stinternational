import { useState, useEffect, useRef, useCallback } from 'react';

interface ScrollDirectionState {
  isVisible: boolean;
  scrollY: number;
  scrollDirection: 'up' | 'down' | 'none';
}

export function useScrollDirection(threshold: number = 10) {
  const [state, setState] = useState<ScrollDirectionState>({
    isVisible: true,
    scrollY: 0,
    scrollDirection: 'none',
  });

  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const updateState = useCallback(() => {
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
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(updateState);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [updateState]);

  return state;
}
