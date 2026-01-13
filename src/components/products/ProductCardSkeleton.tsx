import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ProductCardSkeletonProps {
  variant?: "default" | "compact";
}

const ProductCardSkeleton = ({ variant = "default" }: ProductCardSkeletonProps) => {
  const isCompact = variant === "compact";

  if (isCompact) {
    return (
      <div className="flex flex-row bg-card rounded-lg border border-border overflow-hidden">
        <Skeleton className="w-24 h-24 shrink-0 rounded-none" />
        <div className="flex-1 p-3 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-5 w-20 mt-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Image skeleton */}
      <Skeleton className="aspect-square w-full rounded-none" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <Skeleton className="h-3 w-16" />
        
        {/* Title */}
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        
        {/* SKU */}
        <Skeleton className="h-3 w-20" />
        
        {/* Price */}
        <div className="pt-1">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-3 w-14 mt-1.5" />
        </div>
        
        {/* Buttons */}
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-9" />
        </div>
        
        {/* RFQ link */}
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;