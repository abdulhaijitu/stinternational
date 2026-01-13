import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ProductCardSkeletonProps {
  variant?: "default" | "compact";
}

const ProductCardSkeleton = ({ variant = "default" }: ProductCardSkeletonProps) => {
  const isCompact = variant === "compact";

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Image skeleton */}
      <Skeleton className={cn(
        "w-full rounded-none",
        isCompact ? "aspect-[4/3]" : "aspect-square"
      )} />
      
      {/* Content skeleton */}
      <div className={cn(
        "space-y-2",
        isCompact ? "p-2.5" : "p-4 space-y-3"
      )}>
        {/* Category - only for default */}
        {!isCompact && <Skeleton className="h-3 w-16" />}
        
        {/* Title */}
        <div className="space-y-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className={cn("w-3/4", isCompact ? "h-3" : "h-4")} />
        </div>
        
        {/* SKU - only for default */}
        {!isCompact && <Skeleton className="h-3 w-20" />}
        
        {/* Price */}
        <div className={isCompact ? "pt-1" : "pt-1"}>
          <Skeleton className={cn(isCompact ? "h-5 w-16" : "h-6 w-24")} />
          {!isCompact && <Skeleton className="h-3 w-14 mt-1.5" />}
        </div>
        
        {/* Button */}
        <Skeleton className={cn(isCompact ? "h-7 w-full" : "h-9 w-full")} />
        
        {/* RFQ link - only for default */}
        {!isCompact && <Skeleton className="h-3 w-28" />}
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
