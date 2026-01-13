import { Link } from "react-router-dom";
import { ChevronRight, Package } from "lucide-react";
import { useTopProductsByCategory } from "@/hooks/useCategoryProducts";
import { formatPrice } from "@/lib/formatPrice";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CategoryQuickViewPopoverProps {
  categorySlug: string;
  categoryName: string;
  onProductClick?: () => void;
}

const CategoryQuickViewPopover = ({
  categorySlug,
  categoryName,
  onProductClick,
}: CategoryQuickViewPopoverProps) => {
  const { data: products, isLoading } = useTopProductsByCategory(categorySlug, 4);

  return (
    <div className="w-[280px] p-3 bg-popover border border-border rounded-lg shadow-lg animate-fade-in">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/50">
        <h4 className="text-sm font-semibold text-foreground">{categoryName}</h4>
        <Link
          to={`/category/${categorySlug}`}
          onClick={onProductClick}
          className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
        >
          View All
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-md shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <div className="space-y-2">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.slug}`}
              onClick={onProductClick}
              className={cn(
                "flex items-center gap-3 p-2 rounded-md transition-all duration-150",
                "hover:bg-muted/50 group"
              )}
            >
              <div className="h-12 w-12 rounded-md bg-muted/50 border border-border/50 overflow-hidden shrink-0">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Package className="h-5 w-5 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {product.name}
                </p>
                <p className="text-xs text-primary font-semibold">
                  {formatPrice(product.price)}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-4 text-center text-sm text-muted-foreground">
          No products in this category yet
        </div>
      )}
    </div>
  );
};

export default CategoryQuickViewPopover;
