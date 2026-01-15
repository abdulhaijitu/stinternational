import { useParams, Link } from "react-router-dom";
import { 
  ShoppingCart, 
  Truck, 
  Shield, 
  Phone, 
  Minus, 
  Plus, 
  Check, 
  Package,
  FileText,
  Home
} from "lucide-react";
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useProduct, useFeaturedProducts } from "@/hooks/useProducts";
import RelatedProducts from "@/components/products/RelatedProducts";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import RecentlyViewedProducts from "@/components/products/RecentlyViewedProducts";
import RichTextContent from "@/components/products/RichTextContent";
import ProductSEO from "@/components/seo/ProductSEO";
import { useCart } from "@/contexts/CartContext";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { formatPrice } from "@/lib/formatPrice";
import { toast } from "sonner";
import { useBilingualContent } from "@/hooks/useBilingualContent";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { useActiveCategories } from "@/hooks/useCategories";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Product Page Skeleton
const ProductPageSkeleton = () => (
  <div className="container-premium py-8 md:py-12">
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Image Skeleton */}
      <div className="space-y-4">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="w-20 h-20 rounded-lg" />
          ))}
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-20" />
        <Separator />
        <div className="space-y-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-20 w-full" />
        <div className="flex gap-4">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 flex-1" />
        </div>
      </div>
    </div>
  </div>
);

const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProduct(slug || "");
  const { data: featuredProducts, isLoading: featuredLoading } = useFeaturedProducts();
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { addProduct: addToRecentlyViewed } = useRecentlyViewed();
  const { getProductFields, getCategoryFields } = useBilingualContent();
  const { t, language } = useLanguage();
  const { data: allCategories } = useActiveCategories();

  // Get bilingual fields
  const productFields = product ? getProductFields(product) : null;
  const categoryFields = product?.category ? getCategoryFields(product.category) : null;
  
  // Find parent category if current category is a sub-category
  const parentCategory = product?.category?.parent_id 
    ? allCategories?.find(c => c.id === product.category?.parent_id) 
    : null;
  const parentCategoryFields = parentCategory ? getCategoryFields(parentCategory) : null;

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
        <ProductPageSkeleton />
      </Layout>
    );
  }

  // Render SEO component
  const renderSEO = () => {
    if (!product) return null;
    return (
      <ProductSEO
        product={product}
        category={product.category}
        language={language}
      />
    );
  };

  if (error || !product || !productFields) {
    return (
      <Layout>
        <div className="container-premium py-16 text-center">
          <div className="max-w-md mx-auto">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-semibold mb-2">{t.products.noProductsFound}</h1>
            <p className="text-muted-foreground mb-6">
              {t.errors.pageNotFoundMessage}
            </p>
            <Button asChild>
              <Link to="/products">{t.hero.browseProducts}</Link>
            </Button>
          </div>
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
    toast.success(t.products.addedToCart.replace('{name}', productFields.name));
  };

  const specifications = product.specifications || {};
  const features = product.features || [];
  const discountPercent = product.compare_price 
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : 0;

  return (
    <Layout>
      {/* SEO */}
      {renderSEO()}
      
      {/* Breadcrumb with full hierarchy */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container-premium py-3">
          <Breadcrumb>
            <BreadcrumbList>
              {/* Home */}
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="flex items-center gap-1">
                    <Home className="h-3.5 w-3.5" />
                    <span className="sr-only md:not-sr-only">{t.nav.home}</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />

              {/* Products */}
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/products">{t.nav.products}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>

              {/* Parent Category (if exists) */}
              {parentCategory && parentCategoryFields && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={`/category/${parentCategory.slug}`}>
                        {parentCategoryFields.name}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}

              {/* Current Category (Sub-Category or Parent if no parent) */}
              {categoryFields && product.category && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link 
                        to={parentCategory 
                          ? `/category/${parentCategory.slug}/${product.category.slug}` 
                          : `/category/${product.category.slug}`
                        }
                      >
                        {categoryFields.name}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}

              {/* Product Name */}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="truncate max-w-[200px]">
                  {productFields.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Product Details Section */}
      <section className="py-8 md:py-12">
        <div className="container-premium">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16">
            {/* Left: Image Gallery */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <ProductImageGallery
                images={product.images || []}
                mainImage={product.image_url}
                productName={productFields.name}
              />
            </div>

            {/* Right: Product Information */}
            <div className="space-y-6">
              {/* Category */}
              {categoryFields && product.category && (
                <Link
                  to={`/category/${product.category.slug}`}
                  className="inline-block text-sm text-primary hover:underline transition-colors"
                >
                  {categoryFields.name}
                </Link>
              )}

              {/* Title */}
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-foreground leading-tight">
                  {productFields.name}
                </h1>
                {product.sku && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {t.products.sku}: {product.sku}
                  </p>
                )}
              </div>

              <Separator />

              {/* Price Block */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-bold text-foreground">
                    {formatPrice(product.price)}
                  </span>
                  {product.compare_price && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">
                        {formatPrice(product.compare_price)}
                      </span>
                      <span className="bg-accent/10 text-accent-foreground text-sm font-semibold px-2.5 py-1 rounded-md border border-accent/20">
                        {discountPercent}% {t.products.off}
                      </span>
                    </>
                  )}
                </div>
                
                {/* Stock Status */}
                <div className="flex items-center gap-2">
                  {product.in_stock ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm text-green-600 dark:text-green-500 font-medium">
                        {t.products.inStock}
                        {product.stock_quantity && ` (${product.stock_quantity} ${t.common.available || 'available'})`}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-destructive" />
                      <span className="text-sm text-destructive font-medium">
                        {t.products.outOfStock}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Short Description - Render as rich text */}
              {productFields.shortDescription && (
                <RichTextContent 
                  content={productFields.shortDescription} 
                  className="text-muted-foreground"
                  isBangla={language === 'bn'}
                />
              )}

              <Separator />

              {/* Quantity Selector & Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-foreground">
                    {t.common.quantity}:
                  </label>
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className={cn(
                        "h-10 w-10 flex items-center justify-center",
                        "hover:bg-muted transition-colors",
                        "active:scale-95"
                      )}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="h-10 w-14 flex items-center justify-center border-x border-border font-medium tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className={cn(
                        "h-10 w-10 flex items-center justify-center",
                        "hover:bg-muted transition-colors",
                        "active:scale-95"
                      )}
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    className="flex-1 h-12 text-base font-medium active:scale-[0.98] transition-transform"
                    disabled={!product.in_stock}
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {t.common.addToCart}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="flex-1 h-12 text-base font-medium active:scale-[0.98] transition-transform"
                    asChild
                  >
                    <Link to={`/request-quote?product=${encodeURIComponent(product.name)}&category=${product.category?.slug || ''}`}>
                      <FileText className="h-5 w-5 mr-2" />
                      {t.common.getQuote}
                    </Link>
                  </Button>
                </div>
              </div>

              {/* B2B Message Box */}
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">{t.rfq.forInstitutional}</strong>{" "}
                  {t.rfq.bulkOrderMessage}{" "}
                  <Link to="/request-quote" className="text-primary hover:underline font-medium">
                    {t.nav.requestQuote}
                  </Link>
                </p>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/30">
                  <Truck className="h-5 w-5 text-muted-foreground mb-1.5" />
                  <span className="text-xs text-muted-foreground leading-tight">
                    {t.trustBadges.nationwide}
                  </span>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/30">
                  <Shield className="h-5 w-5 text-muted-foreground mb-1.5" />
                  <span className="text-xs text-muted-foreground leading-tight">
                    {t.trustBadges.warranty}
                  </span>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/30">
                  <Phone className="h-5 w-5 text-muted-foreground mb-1.5" />
                  <span className="text-xs text-muted-foreground leading-tight">
                    {t.trustBadges.expertSupport}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Details Tabs */}
      <section className="py-8 md:py-12 bg-muted/20 border-y border-border">
        <div className="container-premium">
          <Tabs defaultValue="specifications" className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none h-auto p-0 mb-8">
              <TabsTrigger 
                value="specifications" 
                className={cn(
                  "rounded-none border-b-2 border-transparent px-6 py-3",
                  "data-[state=active]:border-primary data-[state=active]:bg-transparent",
                  "data-[state=active]:shadow-none"
                )}
              >
                {t.products.specifications}
              </TabsTrigger>
              <TabsTrigger 
                value="description"
                className={cn(
                  "rounded-none border-b-2 border-transparent px-6 py-3",
                  "data-[state=active]:border-primary data-[state=active]:bg-transparent",
                  "data-[state=active]:shadow-none"
                )}
              >
                {t.products.description}
              </TabsTrigger>
            </TabsList>

            {/* Specifications Tab */}
            <TabsContent value="specifications" className="mt-0">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Technical Specifications */}
                {Object.keys(specifications).length > 0 && (
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="font-semibold text-foreground mb-4">
                      {t.products.technicalSpecs}
                    </h3>
                    <div className="divide-y divide-border">
                      {Object.entries(specifications).map(([key, value]) => (
                        <div 
                          key={key} 
                          className="flex justify-between py-3 text-sm"
                        >
                          <span className="text-muted-foreground">{key}</span>
                          <span className="font-medium text-foreground text-right max-w-[60%]">
                            {String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Features */}
                {features.length > 0 && (
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="font-semibold text-foreground mb-4">
                      {t.products.keyFeatures}
                    </h3>
                    <ul className="space-y-3">
                      {features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* No specifications message */}
                {Object.keys(specifications).length === 0 && features.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    {t.products.noSpecifications || "No specifications available for this product."}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Description Tab */}
            <TabsContent value="description" className="mt-0">
              <div className="bg-card border border-border rounded-xl p-6 max-w-3xl">
                {productFields.description ? (
                  <RichTextContent 
                    content={productFields.description} 
                    isBangla={language === 'bn'}
                  />
                ) : (
                  <p className="text-center py-4 text-muted-foreground">
                    {t.products.noDescription}
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Related Products */}
      <RelatedProducts 
        products={relatedProducts} 
        isLoading={featuredLoading}
        maxItems={4}
      />

      {/* Recently Viewed Products */}
      <RecentlyViewedProducts excludeProductId={product.id} maxItems={6} />
    </Layout>
  );
};

export default ProductPage;