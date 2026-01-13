import { useParams, Link } from "react-router-dom";
import { ChevronRight, ShoppingCart, Truck, Shield, Phone, Minus, Plus, Check } from "lucide-react";
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { getProductBySlug, formatPrice, getFeaturedProducts } from "@/lib/products";
import { getAllCategories } from "@/lib/categories";
import ProductCard from "@/components/products/ProductCard";

const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? getProductBySlug(slug) : undefined;
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specifications">("specifications");

  const category = product 
    ? getAllCategories().find(c => c.id === product.categoryId)
    : undefined;

  const relatedProducts = getFeaturedProducts().filter(p => p.id !== product?.id).slice(0, 4);

  if (!product) {
    return (
      <Layout>
        <div className="container-premium py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/categories">Browse Products</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-muted/50 border-b border-border">
        <div className="container-premium py-4">
          <nav className="flex items-center gap-2 text-sm flex-wrap">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Link to="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
              Products
            </Link>
            {category && (
              <>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <Link 
                  to={`/category/${category.slug}`} 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {category.name}
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
            <div className="space-y-4">
              <div className="aspect-square bg-muted/50 rounded-lg border border-border overflow-hidden">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.images.slice(0, 4).map((image, index) => (
                    <button
                      key={index}
                      className="aspect-square bg-muted/50 rounded-lg border border-border overflow-hidden hover:border-primary transition-colors"
                    >
                      <img src={image} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                {category && (
                  <Link
                    to={`/category/${category.slug}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {category.name}
                  </Link>
                )}
                <h1 className="text-2xl md:text-3xl font-bold mt-2 mb-3">{product.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span>SKU: {product.sku}</span>
                  {product.brand && <span>Brand: <strong className="text-foreground">{product.brand}</strong></span>}
                  {product.model && <span>Model: {product.model}</span>}
                </div>
              </div>

              {/* Price */}
              <div className="py-4 border-y border-border">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-foreground">
                    {formatPrice(product.price)}
                  </span>
                  {product.comparePrice && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">
                        {formatPrice(product.comparePrice)}
                      </span>
                      <span className="bg-accent text-accent-foreground text-sm font-semibold px-2 py-1 rounded">
                        {Math.round((1 - product.price / product.comparePrice) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>
                <div className="mt-2">
                  {product.inStock ? (
                    <span className="inline-flex items-center gap-1.5 text-success font-medium">
                      <Check className="h-4 w-4" />
                      In Stock ({product.stockQuantity} available)
                    </span>
                  ) : (
                    <span className="text-destructive font-medium">Out of Stock</span>
                  )}
                </div>
              </div>

              {/* Short Description */}
              <p className="text-muted-foreground leading-relaxed">
                {product.shortDescription}
              </p>

              {/* Quantity & Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Quantity:</span>
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
                  <Button variant="accent" size="lg" className="flex-1" disabled={!product.inStock}>
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" size="lg" className="flex-1">
                    Request Quote
                  </Button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 py-4 border-t border-border">
                <div className="text-center">
                  <Truck className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Nationwide Delivery</span>
                </div>
                <div className="text-center">
                  <Shield className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">{product.warranty || "Warranty"}</span>
                </div>
                <div className="text-center">
                  <Phone className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Expert Support</span>
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
              Specifications
            </button>
            <button
              onClick={() => setActiveTab("description")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "description"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Description
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "specifications" && (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold mb-4">Technical Specifications</h3>
                <table className="spec-table">
                  <tbody>
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <tr key={key}>
                        <td>{key}</td>
                        <td className="font-medium text-foreground">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold mb-4">Key Features</h3>
                <ul className="space-y-3">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === "description" && (
            <div className="bg-card border border-border rounded-lg p-6 max-w-3xl">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container-premium">
            <h2 className="text-2xl font-bold mb-8">Related Products</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default ProductPage;
