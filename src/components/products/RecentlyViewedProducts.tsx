import { Link } from "react-router-dom";
import { Clock, X, ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecentlyViewed, RecentlyViewedProduct } from "@/hooks/useRecentlyViewed";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/formatPrice";
import { toast } from "sonner";
import WishlistButton from "./WishlistButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBilingualContent } from "@/hooks/useBilingualContent";
import { cn } from "@/lib/utils";
import { getProductImageWithFallback } from "@/lib/productFallbackImages";

interface RecentlyViewedProductsProps {
  excludeProductId?: string;
  maxItems?: number;
  title?: string;
}

const RecentlyViewedProducts = ({
  excludeProductId,
  maxItems = 6,
}: RecentlyViewedProductsProps) => {
  const { getProductsExcluding, clearHistory } = useRecentlyViewed();
  const { addItem } = useCart();
  const { t } = useLanguage();
  const { getProductFields, getCategoryFields } = useBilingualContent();

  const products = getProductsExcluding(excludeProductId).slice(0, maxItems);

  const handleAddToCart = (product: RecentlyViewedProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image_url: product.image_url,
      sku: null,
    });
    toast.success(t.products.addedToCart.replace('{name}', product.name));
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-10 md:py-14 bg-muted/20">
      <div className="container-premium">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-lg md:text-xl font-semibold text-foreground">
              {t.products.recentlyViewed}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            {t.common.remove}
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {products.map((product) => {
            const imageUrl = getProductImageWithFallback(
              product.image_url,
              null,
              product.category?.slug,
              product.category?.name
            );
            const discount = product.compare_price
              ? Math.round((1 - product.price / product.compare_price) * 100)
              : 0;

            // Get bilingual fields
            const categoryFields = product.category ? getCategoryFields(product.category) : null;

            return (
              <article
                key={product.id}
                className={cn(
                  "group bg-card border border-border rounded-lg overflow-hidden",
                  "transition-all duration-200 ease-out",
                  "hover:shadow-md hover:-translate-y-0.5"
                )}
              >
                {/* Image */}
                <div className="relative aspect-square bg-muted/30 overflow-hidden">
                  {/* Wishlist Button */}
                  <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <WishlistButton productId={product.id} />
                  </div>

                  <Link to={`/product/${product.slug}`} className="block w-full h-full">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className={cn(
                        "w-full h-full object-cover",
                        "transition-transform duration-300 ease-out",
                        "group-hover:scale-[1.03]"
                      )}
                      loading="lazy"
                    />
                  </Link>

                  {/* Discount Badge */}
                  {discount > 0 && (
                    <div className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs font-semibold px-1.5 py-0.5 rounded">
                      -{discount}%
                    </div>
                  )}

                  {/* Out of Stock Overlay */}
                  {!product.in_stock && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <span className="text-muted-foreground text-xs font-medium">
                        {t.products.outOfStock}
                      </span>
                    </div>
                  )}

                  {/* Quick Add Button */}
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    disabled={!product.in_stock}
                    className={cn(
                      "absolute bottom-2 left-2 right-2 py-1.5",
                      "bg-primary text-primary-foreground text-xs font-medium rounded",
                      "flex items-center justify-center gap-1",
                      "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "active:scale-[0.97]"
                    )}
                  >
                    <ShoppingCart className="h-3 w-3" />
                    {t.common.addToCart}
                  </button>
                </div>

                {/* Content */}
                <div className="p-3">
                  {categoryFields && (
                    <Link
                      to={`/category/${product.category!.slug}`}
                      className="text-[10px] text-muted-foreground hover:text-primary transition-colors"
                    >
                      {categoryFields.name}
                    </Link>
                  )}
                  <h3 className="font-medium text-xs text-foreground mt-1 line-clamp-2 leading-snug min-h-[2rem]">
                    <Link
                      to={`/product/${product.slug}`}
                      className="hover:text-primary transition-colors"
                    >
                      {product.name}
                    </Link>
                  </h3>
                  <div className="flex items-baseline gap-1 mt-1.5">
                    <span className="text-sm font-bold text-foreground">
                      {formatPrice(product.price)}
                    </span>
                    {product.compare_price && (
                      <span className="text-[10px] text-muted-foreground line-through">
                        {formatPrice(product.compare_price)}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewedProducts;