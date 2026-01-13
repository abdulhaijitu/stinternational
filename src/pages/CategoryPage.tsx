import { useParams, Link } from "react-router-dom";
import { ChevronRight, SlidersHorizontal } from "lucide-react";
import Layout from "@/components/layout/Layout";
import DBProductCard from "@/components/products/DBProductCard";
import ProductCardSkeleton from "@/components/products/ProductCardSkeleton";
import ProductCompareBar from "@/components/products/ProductCompareBar";
import ProductCompareModal from "@/components/products/ProductCompareModal";
import GridDensityToggle from "@/components/products/GridDensityToggle";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBilingualContent } from "@/hooks/useBilingualContent";
import { useGridDensity } from "@/hooks/useGridDensity";
import { useProductCompare } from "@/hooks/useProductCompare";
import { useProductsByCategory } from "@/hooks/useCategoryProducts";
import { useCategoryBySlug } from "@/hooks/useCategories";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { cn } from "@/lib/utils";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLanguage();
  const { getCategoryFields } = useBilingualContent();
  const { density, setDensity } = useGridDensity();
  
  // Product comparison
  const {
    compareProducts,
    isCompareOpen,
    maxItems,
    toggleCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
    canAddMore,
    openCompareModal,
    closeCompareModal,
  } = useProductCompare();

  // Fetch category data
  const { data: category, isLoading: categoryLoading } = useCategoryBySlug(slug || '');
  
  // Fetch products for this category
  const { data: products = [], isLoading: productsLoading } = useProductsByCategory(category?.id);

  const isLoading = categoryLoading || productsLoading;

  // Get bilingual category fields
  const categoryFields = category ? getCategoryFields({
    name: category.name,
    name_bn: category.name_bn,
    description: category.description,
    description_bn: category.description_bn,
  }) : null;

  // Get category icon
  const CategoryIcon = category?.icon_name ? getCategoryIcon(category.icon_name) : null;

  if (!categoryLoading && !category) {
    return (
      <Layout>
        <div className="container-premium py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">{t.categories.notFound}</h1>
          <p className="text-muted-foreground mb-8">
            {t.categories.notFoundDesc}
          </p>
          <Button asChild>
            <Link to="/categories">{t.categories.browseAll}</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  // Grid classes based on density
  const gridClasses = cn(
    "grid gap-4 md:gap-6",
    density === 'compact'
      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  );

  return (
    <Layout>
      {/* Compare Modal */}
      <ProductCompareModal
        products={compareProducts}
        open={isCompareOpen}
        onOpenChange={(open) => open ? openCompareModal() : closeCompareModal()}
        onRemove={removeFromCompare}
      />

      {/* Compare Bar */}
      <ProductCompareBar
        products={compareProducts}
        onRemove={removeFromCompare}
        onClear={clearCompare}
        onCompare={openCompareModal}
        maxItems={maxItems}
      />

      {/* Breadcrumb */}
      <div className="bg-muted/50 border-b border-border">
        <div className="container-premium py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              {t.nav.home}
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Link to="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
              {t.nav.categories}
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium">
              {categoryFields?.name || category?.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Page Header */}
      <section className="bg-muted/30 border-b border-border">
        <div className="container-premium py-8 md:py-12">
          <div className="flex items-start gap-4">
            {CategoryIcon && (
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-lg flex items-center justify-center shrink-0">
                <CategoryIcon className="h-8 w-8" />
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {categoryFields?.name || category?.name}
              </h1>
              {categoryFields?.description && (
                <p className="text-muted-foreground max-w-2xl">{categoryFields.description}</p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                {products.length} {t.products.allProducts.toLowerCase()}
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
              {t.products.productsCount.replace('{count}', String(products.length))}
            </p>
            <div className="flex items-center gap-4">
              <GridDensityToggle
                density={density}
                onDensityChange={setDensity}
                className="hidden sm:flex"
              />
              <Button variant="ghost" size="sm" className="hidden md:flex">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                {t.products.filters}
              </Button>
              <select className="h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option>{t.products.sortNewest}</option>
                <option>{t.products.sortPriceAsc}</option>
                <option>{t.products.sortPriceDesc}</option>
                <option>{t.products.sortNameAsc}</option>
              </select>
            </div>
          </div>

          {/* Products */}
          {isLoading ? (
            <div className={gridClasses}>
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className={gridClasses}>
              {products.map((product) => (
                <DBProductCard
                  key={product.id}
                  product={product}
                  variant={density === 'compact' ? 'compact' : 'default'}
                  isInCompare={isInCompare(product.id)}
                  onToggleCompare={() => toggleCompare(product)}
                  canAddToCompare={canAddMore}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">
                {t.products.noProducts}
              </p>
              <Button variant="outline" asChild>
                <Link to="/categories">{t.categories.browseAll}</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default CategoryPage;
