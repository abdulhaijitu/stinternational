import { Link } from "react-router-dom";
import { ShoppingCart, ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DBProduct } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/formatPrice";
import { toast } from "sonner";
import WishlistButton from "./WishlistButton";
import CompareCheckbox from "./CompareCheckbox";
import { useBilingualContent } from "@/hooks/useBilingualContent";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { useUXTelemetry } from "@/hooks/useUXTelemetry";
import { getProductImageWithFallback } from "@/lib/productFallbackImages";
import ProgressiveImage from "@/components/ui/ProgressiveImage";

interface DBProductCardProps {
  product: DBProduct;
  onQuickView?: (product: DBProduct) => void;
  variant?: "default" | "compact";
  isInCompare?: boolean;
  onToggleCompare?: (product: DBProduct) => void;
  canAddToCompare?: boolean;
}

const DBProductCard = ({ 
  product, 
  onQuickView, 
  variant = "default",
  isInCompare = false,
  onToggleCompare,
  canAddToCompare = true,
}: DBProductCardProps) => {
  const { addItem } = useCart();
  const { getProductFields, getCategoryFields } = useBilingualContent();
  const { t } = useLanguage();
  const { trackProductClick } = useUXTelemetry();

  const productFields = getProductFields(product);
  const categoryFields = product.category ? getCategoryFields(product.category) : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image_url: product.image_url || (product.images?.[0] || null),
      sku: product.sku,
    });
    toast.success(t.products.addedToCart.replace('{name}', productFields.name));
  };

  const handleToggleCompare = () => {
    if (onToggleCompare) {
      onToggleCompare(product);
    }
  };

  const imageUrl = getProductImageWithFallback(
    product.image_url,
    product.images,
    product.category?.slug,
    product.category?.name
  );
  const discountPercent = product.compare_price 
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : 0;

  const isCompact = variant === "compact";
  const showCompareCheckbox = !!onToggleCompare;

  return (
    <article 
      className={cn(
        "group relative bg-card rounded-lg border border-border overflow-hidden",
        "transition-shadow duration-200",
        "hover:shadow-md",
        isInCompare && "ring-2 ring-primary",
        "min-w-0 h-full flex flex-col"
      )}
    >
      {/* Image Container */}
      <div 
        className={cn(
          "relative bg-muted/30 overflow-hidden",
          isCompact ? "aspect-[4/3]" : "aspect-[4/3] sm:aspect-square"
        )}
      >
        {/* Top Actions Row */}
        <div className={cn(
          "absolute top-0 left-0 right-0 z-10 flex items-start justify-between",
          isCompact ? "p-1.5" : "p-2 sm:p-2.5"
        )}>
          <div className="shrink-0">
            {discountPercent > 0 && (
              <Badge 
                variant="default" 
                className={cn(
                  "bg-primary text-primary-foreground font-semibold whitespace-nowrap",
                  isCompact 
                    ? "text-[10px] px-1.5 py-0" 
                    : "text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 sm:py-0.5"
                )}
              >
                -{discountPercent}%
              </Badge>
            )}
          </div>
          
          <div className={cn(
            "flex items-center gap-1",
            "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200"
          )}>
            {showCompareCheckbox && (
              <CompareCheckbox
                isSelected={isInCompare}
                onToggle={handleToggleCompare}
                disabled={!canAddToCompare && !isInCompare}
                size="sm"
              />
            )}
            <WishlistButton productId={product.id} size="sm" />
          </div>
        </div>

        {/* Product Image */}
        <Link 
          to={`/product/${product.slug}`} 
          className="block w-full h-full"
          onClick={() => trackProductClick(product.slug, productFields.name, 'card')}
        >
          <ProgressiveImage
            src={imageUrl}
            alt={productFields.name}
            width={400}
            height={400}
            containerClassName="w-full h-full"
            className={cn(
              "w-full h-full object-cover",
              "transition-transform duration-300 ease-out",
              "group-hover:scale-105"
            )}
          />
        </Link>

        {/* Out of Stock Overlay */}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] flex items-center justify-center">
            <span className={cn(
              "text-muted-foreground font-medium",
              isCompact ? "text-xs" : "text-xs sm:text-sm"
            )}>
              {t.products.outOfStock}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={cn(
        "flex flex-col flex-1",
        isCompact ? "p-2.5" : "p-3 sm:p-4"
      )}>
        {/* Category */}
        {categoryFields && !isCompact && (
          <Link
            to={`/category/${product.category!.slug}`}
            className="text-[10px] sm:text-xs text-muted-foreground hover:text-primary transition-colors duration-150 mb-1 truncate"
          >
            {categoryFields.name}
          </Link>
        )}

        {/* Product Name */}
        <h3 className={cn(
          "font-medium text-foreground leading-snug",
          isCompact 
            ? "text-xs line-clamp-2 min-h-[2rem]" 
            : "text-[13px] sm:text-[15px] line-clamp-2 min-h-[2.25rem] sm:min-h-[2.5rem]"
        )}>
          <Link 
            to={`/product/${product.slug}`} 
            className="hover:text-primary transition-colors duration-150"
            onClick={() => trackProductClick(product.slug, productFields.name, 'card')}
          >
            {productFields.name}
          </Link>
        </h3>

        {/* SKU */}
        {product.sku && !isCompact && (
          <p className="hidden sm:block text-xs text-muted-foreground mt-1">
            SKU: {product.sku}
          </p>
        )}

        <div className="flex-1" />

        {/* Price */}
        <div className={cn(isCompact ? "mt-2" : "mt-2 sm:mt-3")}>
          <div className={cn(
            "flex flex-wrap items-baseline",
            isCompact ? "gap-1" : "gap-1 sm:gap-2"
          )}>
            <span className={cn(
              "font-bold text-foreground whitespace-nowrap",
              isCompact ? "text-sm" : "text-base sm:text-lg"
            )}>
              {formatPrice(product.price)}
            </span>
            {product.compare_price && (
              <span className={cn(
                "text-muted-foreground line-through whitespace-nowrap",
                isCompact ? "hidden" : "text-xs sm:text-sm"
              )}>
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          {!isCompact && (
            <div className="mt-1 sm:mt-1.5">
              {product.in_stock ? (
                <span className="text-[10px] sm:text-xs text-green-600 dark:text-green-500 font-medium">
                  {t.products.inStock}
                </span>
              ) : (
                <span className="text-[10px] sm:text-xs text-destructive font-medium">
                  {t.products.outOfStock}
                </span>
              )}
            </div>
          )}
        </div>

        {/* CTA Buttons — Unified */}
        <div className={cn("flex gap-2", isCompact ? "mt-2" : "mt-3")}>
          <Button
            variant="default"
            size="sm"
            className={cn(
              "flex-1",
              isCompact ? "h-7 text-xs" : "h-8 sm:h-9 text-xs sm:text-sm"
            )}
            asChild
          >
            <Link to={`/product/${product.slug}`}>
              {t.products.view}
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
          
          {!isCompact && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 sm:h-9 px-2.5"
              disabled={!product.in_stock}
              onClick={handleAddToCart}
              title={t.common.addToCart}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* RFQ Link */}
        {!isCompact && (
          <Link
            to={`/request-quote?product=${encodeURIComponent(product.name)}`}
            className={cn(
              "mt-3 hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground",
              "hover:text-primary transition-colors duration-150"
            )}
          >
            <FileText className="h-3 w-3" />
            {t.products.getQuote}
          </Link>
        )}
      </div>
    </article>
  );
};

export default DBProductCard;
