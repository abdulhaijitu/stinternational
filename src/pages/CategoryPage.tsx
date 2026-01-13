import { useParams, Link } from "react-router-dom";
import { ChevronRight, SlidersHorizontal } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/products/ProductCard";
import { getCategoryBySlug, categoryGroups } from "@/lib/categories";
import { getProductsByCategory, sampleProducts } from "@/lib/products";
import { Button } from "@/components/ui/button";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const category = slug ? getCategoryBySlug(slug) : undefined;
  
  // Get products for this category (using sample data for now)
  const products = category 
    ? getProductsByCategory(category.id) 
    : sampleProducts.slice(0, 6);

  // Find parent group
  const parentGroup = categoryGroups.find(g => 
    g.categories.some(c => c.slug === slug)
  );

  if (!category) {
    return (
      <Layout>
        <div className="container-premium py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The category you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link to="/categories">Browse All Categories</Link>
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
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Link to="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
              Categories
            </Link>
            {parentGroup && (
              <>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <Link 
                  to={`/categories#${parentGroup.slug}`} 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {parentGroup.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium">{category.name}</span>
          </nav>
        </div>
      </div>

      {/* Page Header */}
      <section className="bg-muted/30 border-b border-border">
        <div className="container-premium py-8 md:py-12">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-lg flex items-center justify-center shrink-0">
              <category.icon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{category.name}</h1>
              <p className="text-muted-foreground max-w-2xl">{category.description}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {category.productCount} products available
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-8 md:py-12">
        <div className="container-premium">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
            <p className="text-sm text-muted-foreground">
              Showing {products.length} products
            </p>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="hidden md:flex">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <select className="h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Sort: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest First</option>
              </select>
            </div>
          </div>

          {/* Products */}
          {products.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">
                No products found in this category yet.
              </p>
              <Button variant="outline" asChild>
                <Link to="/categories">Browse Other Categories</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default CategoryPage;
