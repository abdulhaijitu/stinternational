import { useCallback, useRef, useState, type TouchEvent } from 'react';

interface SwipeConfig {
  onSwipeDown?: () => void;
  onSwipeUp?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onDrag?: (deltaY: number) => void; // Called during drag with current offset
  threshold?: number; // Minimum distance to trigger swipe
  velocityThreshold?: number; // Minimum velocity for quick swipes
  direction?: 'vertical' | 'horizontal' | 'both';
}

interface SwipeHandlers {
  onTouchStart: (e: TouchEvent) => void;
  onTouchMove: (e: TouchEvent) => void;
  onTouchEnd: (e: TouchEvent) => void;
}

interface SwipeState {
  isDragging: boolean;
  dragOffset: number;
}

/**
 * Hook for detecting swipe gestures on touch devices with drag tracking
 */
export function useSwipeGesture(config: SwipeConfig): SwipeHandlers & SwipeState {
  const {
    onSwipeDown,
    onSwipeUp,
    onSwipeLeft,
    onSwipeRight,
    onDrag,
    threshold = 50,
    velocityThreshold = 0.3,
    direction = 'vertical',
  } = config;

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchCurrentRef = useRef<{ x: number; y: number } | null>(null);
  const isActiveGestureRef = useRef(false);

  const onTouchStart = useCallback((e: TouchEvent) => {
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
    isActiveGestureRef.current = false;
    setIsDragging(true);
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.touches[0];
    touchCurrentRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };

    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Determine gesture direction on first significant movement
    if (!isActiveGestureRef.current && (absX > 10 || absY > 10)) {
      if (direction === 'vertical' && absY > absX) {
        isActiveGestureRef.current = true;
      } else if (direction === 'horizontal' && absX > absY) {
        isActiveGestureRef.current = true;
      } else if (direction === 'both') {
        isActiveGestureRef.current = true;
      }
    }

    // Only track drag for the intended direction
    if (isActiveGestureRef.current) {
      if (direction === 'vertical' || direction === 'both') {
        // Only allow positive drag (pulling down) for close gesture
        const clampedDeltaY = Math.max(0, deltaY);
        setDragOffset(clampedDeltaY);
        onDrag?.(clampedDeltaY);
      } else {
        setDragOffset(deltaX);
        onDrag?.(deltaX);
      }
    }
  }, [direction, onDrag]);

  const onTouchEnd = useCallback((e: TouchEvent) => {
    setIsDragging(false);
    setDragOffset(0);
    onDrag?.(0); // Reset drag offset

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
    isActiveGestureRef.current = false;
  }, [onSwipeDown, onSwipeUp, onSwipeLeft, onSwipeRight, onDrag, threshold, velocityThreshold]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    isDragging,
    dragOffset,
  };
}
