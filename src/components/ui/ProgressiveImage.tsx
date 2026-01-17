import { useState, useEffect, useRef } from "react";
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
 */
const ProgressiveImage = ({
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
    if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
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
      <div 
        className={cn(
          "absolute inset-0 transition-opacity duration-500 ease-out",
          placeholderColor,
          isLoaded ? "opacity-0" : "opacity-100"
        )}
        aria-hidden="true"
      >
        {/* Shimmer effect */}
        <div 
          className={cn(
            "absolute inset-0",
            "bg-gradient-to-r from-transparent via-foreground/5 to-transparent",
            "-translate-x-full animate-[shimmer_2s_infinite]",
            isLoaded && "hidden"
          )}
        />
      </div>

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
          "transition-all duration-500 ease-out",
          isLoaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-sm scale-[1.02]",
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
};

export default ProgressiveImage;
