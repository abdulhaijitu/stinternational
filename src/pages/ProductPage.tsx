import { useParams, Link } from "react-router-dom";
import { ChevronRight, ShoppingCart, Truck, Shield, Phone, Minus, Plus, Check, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useProduct, useFeaturedProducts } from "@/hooks/useProducts";
import DBProductCard from "@/components/products/DBProductCard";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import RecentlyViewedProducts from "@/components/products/RecentlyViewedProducts";
import { useCart } from "@/contexts/CartContext";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { formatPrice } from "@/lib/formatPrice";
import { toast } from "sonner";

const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProduct(slug || "");
  const { data: featuredProducts } = useFeaturedProducts();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specifications">("specifications");
  const { addItem } = useCart();
  const { addProduct: addToRecentlyViewed } = useRecentlyViewed();

  // Track product view
  useEffect(() => {
    if (product) {
      addToRecentlyViewed({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        compare_price: product.compare_price,
        image_url: product.image_url || product.images?.[0] || null,
        in_stock: product.in_stock,
        category: product.category,
      });
    }
  }, [product, addToRecentlyViewed]);

  const relatedProducts = featuredProducts?.filter(p => p.id !== product?.id).slice(0, 4) || [];

  if (isLoading) {
    return (
      <Layout>
        <div className="container-premium py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container-premium py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">পণ্য পাওয়া যায়নি</h1>
          <p className="text-muted-foreground mb-8">
            আপনি যে পণ্যটি খুঁজছেন সেটি পাওয়া যায়নি।
          </p>
          <Button asChild>
            <Link to="/categories">পণ্য দেখুন</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image_url: product.image_url || product.images?.[0] || null,
      sku: product.sku,
    }, quantity);
    toast.success(`${product.name} কার্টে যোগ হয়েছে!`);
  };

  const imageUrl = product.image_url || product.images?.[0] || "/placeholder.svg";
  const specifications = product.specifications || {};
  const features = product.features || [];

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-muted/50 border-b border-border">
        <div className="container-premium py-4">
          <nav className="flex items-center gap-2 text-sm flex-wrap">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              হোম
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Link to="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
              পণ্য
            </Link>
            {product.category && (
              <>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <Link 
                  to={`/category/${product.category.slug}`} 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Details */}
      <section className="py-8 md:py-12">
        <div className="container-premium">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <ProductImageGallery
              images={product.images || []}
              mainImage={product.image_url}
              productName={product.name}
            />

            {/* Product Info */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                {product.category && (
                  <Link
                    to={`/category/${product.category.slug}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {product.category.name}
                  </Link>
                )}
                <h1 className="text-2xl md:text-3xl font-bold mt-2 mb-3">{product.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {product.sku && <span>SKU: {product.sku}</span>}
                </div>
              </div>

              {/* Price */}
              <div className="py-4 border-y border-border">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-foreground">
                    {formatPrice(product.price)}
                  </span>
                  {product.compare_price && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">
                        {formatPrice(product.compare_price)}
                      </span>
                      <span className="bg-accent text-accent-foreground text-sm font-semibold px-2 py-1 rounded">
                        {Math.round((1 - product.price / product.compare_price) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>
                <div className="mt-2">
                  {product.in_stock ? (
                    <span className="inline-flex items-center gap-1.5 text-green-600 font-medium">
                      <Check className="h-4 w-4" />
                      স্টকে আছে ({product.stock_quantity}টি)
                    </span>
                  ) : (
                    <span className="text-destructive font-medium">স্টক নেই</span>
                  )}
                </div>
              </div>

              {/* Short Description */}
              {product.short_description && (
                <p className="text-muted-foreground leading-relaxed">
                  {product.short_description}
                </p>
              )}

              {/* Quantity & Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">পরিমাণ:</span>
                  <div className="flex items-center border border-border rounded-md">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-10 w-10 flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="h-10 w-12 flex items-center justify-center border-x border-border font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-10 w-10 flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              <div className="flex gap-4">
                  <Button
                    variant="accent"
                    size="lg"
                    className="flex-1"
                    disabled={!product.in_stock}
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    কার্টে যোগ করুন
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="flex-1"
                    asChild
                  >
                    <Link to={`/request-quote?product=${encodeURIComponent(product.name)}&category=${product.category?.slug || ''}`}>
                      কোটেশন নিন
                    </Link>
                  </Button>
                </div>
                
                {/* B2B Message */}
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">প্রাতিষ্ঠানিক ক্রয়ের জন্য?</strong>{" "}
                    বাল্ক অর্ডার ও বিশেষ মূল্যের জন্য{" "}
                    <Link to="/request-quote" className="text-primary hover:underline font-medium">
                      কোটেশন রিকোয়েস্ট করুন
                    </Link>
                  </p>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 py-4 border-t border-border">
                <div className="text-center">
                  <Truck className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">সারাদেশে ডেলিভারি</span>
                </div>
                <div className="text-center">
                  <Shield className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">ওয়ারেন্টি</span>
                </div>
                <div className="text-center">
                  <Phone className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">বিশেষজ্ঞ সাপোর্ট</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs: Description & Specifications */}
      <section className="py-8 md:py-12 bg-muted/30">
        <div className="container-premium">
          {/* Tab Headers */}
          <div className="flex border-b border-border mb-8">
            <button
              onClick={() => setActiveTab("specifications")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "specifications"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              স্পেসিফিকেশন
            </button>
            <button
              onClick={() => setActiveTab("description")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "description"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              বিবরণ
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "specifications" && (
            <div className="grid md:grid-cols-2 gap-8">
              {Object.keys(specifications).length > 0 && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold mb-4">প্রযুক্তিগত স্পেসিফিকেশন</h3>
                  <table className="spec-table">
                    <tbody>
                      {Object.entries(specifications).map(([key, value]) => (
                        <tr key={key}>
                          <td>{key}</td>
                          <td className="font-medium text-foreground">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {features.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold mb-4">মূল বৈশিষ্ট্য</h3>
                  <ul className="space-y-3">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === "description" && (
            <div className="bg-card border border-border rounded-lg p-6 max-w-3xl">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description || "কোনো বিবরণ নেই"}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container-premium">
            <h2 className="text-2xl font-bold mb-8">সম্পর্কিত পণ্য</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <DBProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        </section>
      )}
      {/* Recently Viewed Products */}
      <RecentlyViewedProducts excludeProductId={product.id} maxItems={6} />
    </Layout>
  );
};

export default ProductPage;
