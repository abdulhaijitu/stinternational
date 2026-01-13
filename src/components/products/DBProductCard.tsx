import { Link } from "react-router-dom";
import { ShoppingCart, ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DBProduct } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/formatPrice";
import { toast } from "sonner";
import WishlistButton from "./WishlistButton";
import { useBilingualContent } from "@/hooks/useBilingualContent";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface DBProductCardProps {
  product: DBProduct;
  onQuickView?: (product: DBProduct) => void;
  variant?: "default" | "compact";
}

const DBProductCard = ({ product, onQuickView, variant = "default" }: DBProductCardProps) => {
  const { addItem } = useCart();
  const { getProductFields, getCategoryFields } = useBilingualContent();
  const { t } = useLanguage();

  // Get bilingual fields
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

  const imageUrl = product.image_url || product.images?.[0] || "/placeholder.svg";
  const discountPercent = product.compare_price 
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : 0;

  const isCompact = variant === "compact";

  return (
    <article 
      className={cn(
        "group relative bg-card rounded-lg border border-border overflow-hidden",
        "transition-all duration-200 ease-out",
        "hover:shadow-lg hover:shadow-foreground/5 hover:-translate-y-0.5"
      )}
    >
      {/* Image Container */}
      <div 
        className={cn(
          "relative bg-muted/30 overflow-hidden",
          isCompact ? "aspect-[4/3]" : "aspect-square"
        )}
      >
        {/* Wishlist Button - Top Right */}
        <div className={cn(
          "absolute z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          isCompact ? "top-1.5 right-1.5" : "top-2.5 right-2.5"
        )}>
          <WishlistButton productId={product.id} size={isCompact ? "sm" : "default"} />
        </div>
        
        {/* Discount Badge - Top Left */}
        {discountPercent > 0 && (
          <Badge 
            variant="default" 
            className={cn(
              "absolute z-10 bg-accent text-accent-foreground font-semibold",
              isCompact 
                ? "top-1.5 left-1.5 text-[10px] px-1.5 py-0" 
                : "top-2.5 left-2.5 text-xs px-2 py-0.5"
            )}
          >
            -{discountPercent}%
          </Badge>
        )}

        {/* Product Image */}
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={imageUrl}
            alt={productFields.name}
            className={cn(
              "w-full h-full object-cover",
              "transition-transform duration-300 ease-out",
              "group-hover:scale-[1.03]"
            )}
            loading="lazy"
          />
        </Link>

        {/* Out of Stock Overlay */}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] flex items-center justify-center">
            <span className={cn(
              "text-muted-foreground font-medium",
              isCompact ? "text-xs" : "text-sm"
            )}>
              {t.products.outOfStock}
            </span>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className={cn("flex flex-col", isCompact ? "p-2.5" : "p-4")}>
        {/* Category Tag */}
        {categoryFields && !isCompact && (
          <Link
            to={`/category/${product.category!.slug}`}
            className="text-xs text-muted-foreground hover:text-primary transition-colors duration-150 mb-1.5"
          >
            {categoryFields.name}
          </Link>
        )}

        {/* Product Name */}
        <h3 className={cn(
          "font-medium text-foreground leading-snug",
          isCompact 
            ? "text-xs line-clamp-2 min-h-[2rem]" 
            : "text-[15px] line-clamp-2 min-h-[2.5rem]"
        )}>
          <Link 
            to={`/product/${product.slug}`} 
            className="hover:text-primary transition-colors duration-150"
          >
            {productFields.name}
          </Link>
        </h3>

        {/* SKU or Short Spec - Only for default variant */}
        {product.sku && !isCompact && (
          <p className="text-xs text-muted-foreground mt-1">
            SKU: {product.sku}
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price Section */}
        <div className={cn(isCompact ? "mt-2" : "mt-3")}>
          <div className={cn(
            "flex items-baseline",
            isCompact ? "gap-1" : "gap-2"
          )}>
            <span className={cn(
              "font-bold text-foreground",
              isCompact ? "text-sm" : "text-lg"
            )}>
              {formatPrice(product.price)}
            </span>
            {product.compare_price && !isCompact && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          {!isCompact && (
            <div className="mt-1.5">
              {product.in_stock ? (
                <span className="text-xs text-green-600 dark:text-green-500 font-medium">
                  {t.products.inStock}
                </span>
              ) : (
                <span className="text-xs text-destructive font-medium">
                  {t.products.outOfStock}
                </span>
              )}
            </div>
          )}
        </div>

        {/* CTA Buttons - Show on hover for default, simpler for compact */}
        {isCompact ? (
          <Button
            variant="default"
            size="sm"
            className="mt-2 w-full h-7 text-xs font-medium active:scale-[0.97] transition-transform"
            asChild
          >
            <Link to={`/product/${product.slug}`}>
              {t.products.view}
            </Link>
          </Button>
        ) : (
          <div className={cn(
            "mt-4 flex gap-2",
            "opacity-100 lg:opacity-0 lg:group-hover:opacity-100",
            "transition-opacity duration-200"
          )}>
            <Button
              variant="default"
              size="sm"
              className="flex-1 h-9 text-sm font-medium active:scale-[0.97] transition-transform"
              asChild
            >
              <Link to={`/product/${product.slug}`}>
                {t.products.view}
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Link>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 active:scale-[0.97] transition-transform"
              disabled={!product.in_stock}
              onClick={handleAddToCart}
              title={t.common.addToCart}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* RFQ Link - Subtle, always visible (default only) */}
        {!isCompact && (
          <Link
            to={`/request-quote?product=${encodeURIComponent(product.name)}`}
            className={cn(
              "mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground",
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
