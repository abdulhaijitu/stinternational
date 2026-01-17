import { useState, useEffect, useRef, memo } from "react";
import { cn } from "@/lib/utils";

interface ProgressiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  containerClassName?: string;
  placeholderColor?: string;
  priority?: boolean;
  onLoad?: () => void;
}

/**
 * Progressive image component with blur-up loading effect.
 * Shows a low-quality blurred placeholder that transitions smoothly to full resolution.
 * Memoized for performance.
 */
const ProgressiveImage = memo(({
  src,
  alt,
  width,
  height,
  className,
  containerClassName,
  placeholderColor = "bg-muted/50",
  priority = false,
  onLoad,
}: ProgressiveImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset state when src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  // Check if image is already cached/loaded
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img?.naturalWidth > 0) {
      setIsLoaded(true);
      onLoad?.();
    }
  }, [src, onLoad]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
  };

  return (
    <div 
      className={cn(
        "relative overflow-hidden",
        containerClassName
      )}
    >
      {/* Placeholder - shows while image is loading */}
      {!isLoaded && !hasError && (
        <div 
          className={cn(
            "absolute inset-0",
            placeholderColor
          )}
          aria-hidden="true"
        >
          {/* Shimmer effect */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"
          />
        </div>
      )}

      {/* Main Image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300 ease-out",
          isLoaded ? "opacity-100" : "opacity-0",
          hasError && "hidden",
          className
        )}
      />

      {/* Error fallback */}
      {hasError && (
        <div 
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            placeholderColor
          )}
        >
          <span className="text-xs text-muted-foreground">Image unavailable</span>
        </div>
      )}
    </div>
  );
});

ProgressiveImage.displayName = "ProgressiveImage";

export default ProgressiveImage;
