import { useCallback, useRef } from 'react';

interface SwipeConfig {
  onSwipeDown?: () => void;
  onSwipeUp?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number; // Minimum distance to trigger swipe
  velocityThreshold?: number; // Minimum velocity for quick swipes
}

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

/**
 * Hook for detecting swipe gestures on touch devices
 */
export function useSwipeGesture(config: SwipeConfig): SwipeHandlers {
  const {
    onSwipeDown,
    onSwipeUp,
    onSwipeLeft,
    onSwipeRight,
    threshold = 50,
    velocityThreshold = 0.3,
  } = config;

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchCurrentRef = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    touchCurrentRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = e.touches[0];
    touchCurrentRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || !touchCurrentRef.current) {
      touchStartRef.current = null;
      touchCurrentRef.current = null;
      return;
    }

    const deltaX = touchCurrentRef.current.x - touchStartRef.current.x;
    const deltaY = touchCurrentRef.current.y - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;
    
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    
    // Calculate velocity (pixels per millisecond)
    const velocityX = absX / deltaTime;
    const velocityY = absY / deltaTime;

    // Determine if swipe is horizontal or vertical
    const isHorizontal = absX > absY;
    const isVertical = absY > absX;

    // Check for swipe gestures
    if (isVertical && (absY >= threshold || velocityY >= velocityThreshold)) {
      if (deltaY > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (deltaY < 0 && onSwipeUp) {
        onSwipeUp();
      }
    } else if (isHorizontal && (absX >= threshold || velocityX >= velocityThreshold)) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    // Reset refs
    touchStartRef.current = null;
    touchCurrentRef.current = null;
  }, [onSwipeDown, onSwipeUp, onSwipeLeft, onSwipeRight, threshold, velocityThreshold]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
