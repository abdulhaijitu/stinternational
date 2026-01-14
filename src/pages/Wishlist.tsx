import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPrice } from "@/lib/formatPrice";
import { toast } from "sonner";

const Wishlist = () => {
  const { user } = useAuth();
  const { wishlist, isLoading, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();
  const { t, language } = useLanguage();

  const wl = t.wishlist;
  const fontClass = language === "bn" ? "font-siliguri" : "";

  const handleAddToCart = (item: typeof wishlist[0]) => {
    if (!item.product) return;
    
    addItem({
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      price: item.product.price,
      image_url: item.product.image_url || (item.product.images?.[0] || null),
      sku: null,
    });
    toast.success(wl?.addedToCart?.replace("{name}", item.product.name) || `${item.product.name} added to cart!`);
  };

  const handleMoveToCart = (item: typeof wishlist[0]) => {
    handleAddToCart(item);
    removeFromWishlist(item.product_id);
  };

  if (!user) {
    return (
      <Layout>
        <section className={`py-16 md:py-24 ${fontClass}`}>
          <div className="container-premium text-center">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-2xl md:text-3xl font-bold mb-4">{wl?.title || "Wishlist"}</h1>
            <p className="text-muted-foreground mb-6">
              {wl?.loginToView || "Please login to view your wishlist"}
            </p>
            <Button asChild>
              <Link to="/account">{wl?.login || "Login"}</Link>
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <section className="py-16 md:py-24">
          <div className="container-premium flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Page Header */}
      <section className={`bg-muted/50 border-b border-border ${fontClass}`}>
        <div className="container-premium py-8 md:py-12">
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold">{wl?.myWishlist || "My Wishlist"}</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            {wl?.itemsSaved?.replace("{count}", String(wishlist.length)) || `${wishlist.length} products saved`}
          </p>
        </div>
      </section>

      {/* Wishlist Content */}
      <section className={`py-8 md:py-12 ${fontClass}`}>
        <div className="container-premium">
          {wishlist.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-lg">
              <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
              <h2 className="text-xl font-semibold mb-2">{wl?.empty || "Your wishlist is empty"}</h2>
              <p className="text-muted-foreground mb-6">
                {wl?.emptyMessage || "Add products you like to your wishlist"}
              </p>
              <Button asChild>
                <Link to="/products">{wl?.browseProducts || "Browse Products"}</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {wishlist.map((item) => {
                const product = item.product;
                if (!product) return null;

                const imageUrl = product.image_url || product.images?.[0] || "/placeholder.svg";
                const discount = product.compare_price
                  ? Math.round((1 - product.price / product.compare_price) * 100)
                  : 0;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row gap-4 p-4 bg-card border border-border rounded-lg"
                  >
                    {/* Image */}
                    <Link to={`/product/${product.slug}`} className="shrink-0">
                      <div className="relative w-full sm:w-32 h-32 rounded-md overflow-hidden bg-muted">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        {discount > 0 && (
                          <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs font-semibold px-2 py-0.5 rounded">
                            {discount}% {t.products.off}
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Details */}
                    <div className="flex-1 flex flex-col">
                      {product.category && (
                        <Link
                          to={`/category/${product.category.slug}`}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          {product.category.name}
                        </Link>
                      )}
                      <Link
                        to={`/product/${product.slug}`}
                        className="font-semibold text-lg hover:text-primary transition-colors mt-1"
                      >
                        {product.name}
                      </Link>

                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-xl font-bold text-primary">
                          {formatPrice(product.price)}
                        </span>
                        {product.compare_price && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.compare_price)}
                          </span>
                        )}
                      </div>

                      <div className="mt-2">
                        {product.in_stock ? (
                          <span className="text-xs text-green-600 font-medium">{wl?.inStock || "In Stock"}</span>
                        ) : (
                          <span className="text-xs text-destructive font-medium">{wl?.outOfStock || "Out of Stock"}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col gap-2 sm:justify-center">
                      <Button
                        onClick={() => handleMoveToCart(item)}
                        disabled={!product.in_stock}
                        className="flex-1 sm:flex-none"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {wl?.moveToCart || "Move to Cart"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => removeFromWishlist(item.product_id)}
                        className="flex-1 sm:flex-none text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {wl?.remove || "Remove"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Wishlist;
