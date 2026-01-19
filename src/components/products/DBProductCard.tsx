import { Link } from "react-router-dom";
import { ShoppingCart, ArrowRight, FileText } from "lucide-react";
import { motion } from "framer-motion";
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
  // Compare feature props
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
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "group relative bg-card rounded-lg border border-border overflow-hidden",
        "transition-all duration-300 ease-out",
        "hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20",
        isInCompare && "ring-2 ring-primary",
        // Ensure consistent card height and minimum width
        "min-w-0 h-full flex flex-col"
      )}
    >
      {/* Gradient glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* Animated border glow */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-[-1px] rounded-lg bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-sm" />
      </div>
      {/* Image Container - Fixed aspect ratio for CLS optimization */}
      <div 
        className={cn(
          "relative bg-muted/30 overflow-hidden",
          // Reduced height on mobile for 2-col layout
          isCompact ? "aspect-[4/3]" : "aspect-[4/3] sm:aspect-square"
        )}
      >
        {/* Top Actions Row */}
        <div className={cn(
          "absolute top-0 left-0 right-0 z-10 flex items-start justify-between",
          isCompact ? "p-1.5" : "p-2 sm:p-2.5"
        )}>
          {/* Left: Discount Badge */}
          <div className="shrink-0">
            {discountPercent > 0 && (
              <Badge 
                variant="default" 
                className={cn(
                  "bg-accent text-accent-foreground font-semibold whitespace-nowrap",
                  isCompact 
                    ? "text-[10px] px-1.5 py-0" 
                    : "text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 sm:py-0.5"
                )}
              >
                -{discountPercent}%
              </Badge>
            )}
          </div>
          
          {/* Right: Wishlist & Compare - Always visible on mobile for touch */}
          <div className={cn(
            "flex items-center gap-1",
            // Always visible on mobile, hover reveal on desktop
            "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200"
          )}>
            {showCompareCheckbox && (
              <CompareCheckbox
                isSelected={isInCompare}
                onToggle={handleToggleCompare}
                disabled={!canAddToCompare && !isInCompare}
                size={isCompact ? "sm" : "sm"}
              />
            )}
            <WishlistButton productId={product.id} size="sm" />
          </div>
        </div>

        {/* Product Image with progressive loading */}
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
              "transition-all duration-500 ease-out",
              "group-hover:scale-105 group-hover:brightness-105"
            )}
          />
          {/* Image overlay shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
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

      {/* Content Container - flex-1 ensures equal height */}
      <div className={cn(
        "flex flex-col flex-1",
        isCompact ? "p-2.5" : "p-3 sm:p-4"
      )}>
        {/* Category Tag */}
        {categoryFields && !isCompact && (
          <Link
            to={`/category/${product.category!.slug}`}
            className="text-[10px] sm:text-xs text-muted-foreground hover:text-primary transition-colors duration-150 mb-1 truncate"
          >
            {categoryFields.name}
          </Link>
        )}

        {/* Product Name - Fixed min-height for CLS optimization */}
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

        {/* SKU - Only for default variant, hidden on mobile */}
        {product.sku && !isCompact && (
          <p className="hidden sm:block text-xs text-muted-foreground mt-1">
            SKU: {product.sku}
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price Section */}
        <div className={cn(isCompact ? "mt-2" : "mt-2 sm:mt-3")}>
          {/* Price - Stack vertically on very small screens if needed */}
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

        {/* CTA Buttons */}
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
          <>
            {/* Mobile: Full-width primary button */}
            <div className="mt-3 sm:hidden">
              <Button
                variant="default"
                size="sm"
                className="w-full h-9 text-sm font-medium active:scale-[0.97] transition-transform"
                asChild
              >
                <Link to={`/product/${product.slug}`}>
                  {t.products.view}
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Link>
              </Button>
              {/* Mobile: Cart as secondary action below */}
              {product.in_stock && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 mt-2 text-xs active:scale-[0.97] transition-transform"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                  {t.common.addToCart}
                </Button>
              )}
            </div>

            {/* Desktop: Side-by-side buttons - Always visible */}
            <div className="mt-4 hidden sm:flex gap-2">
              <motion.div 
                className="flex-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="default"
                  size="sm"
                  className="w-full h-9 text-sm font-medium relative overflow-hidden group/btn"
                  asChild
                >
                  <Link to={`/product/${product.slug}`}>
                    <span className="relative z-10 flex items-center">
                      {t.products.view}
                      <ArrowRight className="h-3.5 w-3.5 ml-1.5 transition-transform group-hover/btn:translate-x-0.5" />
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-accent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                  </Link>
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 relative overflow-hidden group/cart"
                  disabled={!product.in_stock}
                  onClick={handleAddToCart}
                  title={t.common.addToCart}
                >
                  <ShoppingCart className="h-4 w-4 transition-transform group-hover/cart:scale-110" />
                  <span className="absolute inset-0 bg-primary/10 opacity-0 group-hover/cart:opacity-100 transition-opacity duration-300" />
                </Button>
              </motion.div>
            </div>
          </>
        )}

        {/* RFQ Link - Hidden on mobile for cleaner layout */}
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
    </motion.article>
  );
};

export default DBProductCard;
