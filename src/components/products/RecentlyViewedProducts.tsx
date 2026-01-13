import { Link } from "react-router-dom";
import { Clock, X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecentlyViewed, RecentlyViewedProduct } from "@/hooks/useRecentlyViewed";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/formatPrice";
import { toast } from "sonner";
import WishlistButton from "./WishlistButton";

interface RecentlyViewedProductsProps {
  excludeProductId?: string;
  maxItems?: number;
  title?: string;
}

const RecentlyViewedProducts = ({
  excludeProductId,
  maxItems = 6,
  title = "সম্প্রতি দেখা পণ্য",
}: RecentlyViewedProductsProps) => {
  const { getProductsExcluding, clearHistory } = useRecentlyViewed();
  const { addItem } = useCart();

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
    toast.success(`${product.name} কার্টে যোগ হয়েছে!`);
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-12">
      <div className="container-premium">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-primary" />
            <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4 mr-1" />
            মুছুন
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.map((product) => {
            const imageUrl = product.image_url || "/placeholder.svg";
            const discount = product.compare_price
              ? Math.round((1 - product.price / product.compare_price) * 100)
              : 0;

            return (
              <div
                key={product.id}
                className="group bg-card border border-border rounded-lg overflow-hidden card-hover"
              >
                {/* Image */}
                <div className="relative aspect-square bg-muted/50 overflow-hidden">
                  {/* Wishlist Button */}
                  <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <WishlistButton productId={product.id} />
                  </div>

                  <Link to={`/product/${product.slug}`}>
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>

                  {discount > 0 && (
                    <div className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs font-semibold px-1.5 py-0.5 rounded">
                      -{discount}%
                    </div>
                  )}

                  {!product.in_stock && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <span className="text-muted-foreground text-sm font-medium">স্টক নেই</span>
                    </div>
                  )}

                  {/* Quick Add Button */}
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    disabled={!product.in_stock}
                    className="absolute bottom-2 left-2 right-2 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                  >
                    <ShoppingCart className="h-3 w-3" />
                    কার্টে যোগ করুন
                  </button>
                </div>

                {/* Content */}
                <div className="p-3">
                  {product.category && (
                    <Link
                      to={`/category/${product.category.slug}`}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      {product.category.name}
                    </Link>
                  )}
                  <h3 className="font-medium text-sm text-foreground mt-1 line-clamp-2 leading-snug min-h-[2.5rem]">
                    <Link
                      to={`/product/${product.slug}`}
                      className="hover:text-primary transition-colors"
                    >
                      {product.name}
                    </Link>
                  </h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-sm font-bold text-foreground">
                      {formatPrice(product.price)}
                    </span>
                    {product.compare_price && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatPrice(product.compare_price)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewedProducts;
