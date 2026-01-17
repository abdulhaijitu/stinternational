import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ProductGridSkeletonProps {
  count?: number;
  variant?: "default" | "compact";
  className?: string;
}

/**
 * Reusable skeleton grid for product loading states
 * Matches ProductCard dimensions to prevent CLS
 */
const ProductGridSkeleton = ({ 
  count = 8, 
  variant = "default",
  className 
}: ProductGridSkeletonProps) => {
  const isCompact = variant === "compact";

  // Grid classes matching the product grid
  const gridClasses = cn(
    "grid gap-4 md:gap-6",
    isCompact
      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    className
  );

  return (
    <div className={gridClasses}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} variant={variant} />
      ))}
    </div>
  );
};

/**
 * Individual product card skeleton
 * Matches exact dimensions of DBProductCard
 */
const ProductCardSkeleton = ({ variant = "default" }: { variant?: "default" | "compact" }) => {
  const isCompact = variant === "compact";

  return (
    <div 
      className={cn(
        "bg-card rounded-lg border border-border overflow-hidden",
        "min-w-0 h-full flex flex-col"
      )}
    >
      {/* Image skeleton - matches aspect ratio */}
      <Skeleton 
        className={cn(
          "w-full rounded-none",
          isCompact ? "aspect-[4/3]" : "aspect-[4/3] sm:aspect-square"
        )} 
      />
      
      {/* Content skeleton */}
      <div className={cn(
        "flex flex-col flex-1",
        isCompact ? "p-2.5 space-y-2" : "p-3 sm:p-4 space-y-3"
      )}>
        {/* Category - only for default */}
        {!isCompact && <Skeleton className="h-3 w-20" />}
        
        {/* Title - min-height matching ProductCard */}
        <div className={cn(
          "space-y-1",
          isCompact ? "min-h-[2rem]" : "min-h-[2.25rem] sm:min-h-[2.5rem]"
        )}>
          <Skeleton className="h-4 w-full" />
          <Skeleton className={cn("w-3/4", isCompact ? "h-3" : "h-4")} />
        </div>
        
        {/* SKU - only for default, hidden on mobile */}
        {!isCompact && <Skeleton className="hidden sm:block h-3 w-24" />}
        
        {/* Spacer */}
        <div className="flex-1" />
        
        {/* Price section */}
        <div className={cn(isCompact ? "mt-2" : "mt-2 sm:mt-3")}>
          <div className="flex items-baseline gap-2">
            <Skeleton className={cn(isCompact ? "h-5 w-16" : "h-6 w-24")} />
            {!isCompact && <Skeleton className="h-4 w-16" />}
          </div>
          {!isCompact && <Skeleton className="h-3 w-14 mt-1.5" />}
        </div>
        
        {/* CTA Button */}
        {isCompact ? (
          <Skeleton className="h-7 w-full mt-2" />
        ) : (
          <>
            {/* Mobile button */}
            <div className="mt-3 sm:hidden space-y-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
            {/* Desktop buttons */}
            <div className="mt-4 hidden sm:flex gap-2">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 w-11" />
            </div>
          </>
        )}
        
        {/* RFQ link - only for default, hidden on mobile */}
        {!isCompact && <Skeleton className="hidden sm:block h-3 w-28 mt-3" />}
      </div>
    </div>
  );
};

export { ProductGridSkeleton, ProductCardSkeleton };
export default ProductGridSkeleton;
