import { useParams, Link } from "react-router-dom";
import { ChevronRight, FolderOpen } from "lucide-react";
import Layout from "@/components/layout/Layout";
import DBProductCard from "@/components/products/DBProductCard";
import ProductCardSkeleton from "@/components/products/ProductCardSkeleton";
import ProductCompareBar from "@/components/products/ProductCompareBar";
import ProductCompareModal from "@/components/products/ProductCompareModal";
import GridDensityToggle from "@/components/products/GridDensityToggle";
import StickyCategorySidebar from "@/components/products/StickyCategorySidebar";
import CategorySEO from "@/components/seo/CategorySEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBilingualContent } from "@/hooks/useBilingualContent";
import { useGridDensity } from "@/hooks/useGridDensity";
import { useProductCompare } from "@/hooks/useProductCompare";
import { useProductsByCategory } from "@/hooks/useCategoryProducts";
import { useCategoryBySlug, useParentCategoryWithSubs, useSubCategoryBySlug } from "@/hooks/useCategories";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { getCategoryHeroImage } from "@/lib/productFallbackImages";
import { cn } from "@/lib/utils";

const CategoryPage = () => {
  const { slug, parentSlug, subSlug } = useParams<{ slug?: string; parentSlug?: string; subSlug?: string }>();
  const { t, language } = useLanguage();
  const { getCategoryFields } = useBilingualContent();
  const { density, setDensity } = useGridDensity();

  const fontClass = language === "bn" ? "font-siliguri" : "";
  
  // Determine if this is a hierarchical URL or flat URL
  const isHierarchical = !!parentSlug && !!subSlug;

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

  // Fetch category data based on URL structure
  const { data: parentWithSubs, isLoading: parentLoading } = useParentCategoryWithSubs(
    isHierarchical ? parentSlug! : ''
  );
  
  const { data: subCategoryData, isLoading: subLoading } = useSubCategoryBySlug(
    isHierarchical ? parentSlug! : '',
    isHierarchical ? subSlug! : ''
  );

  // For flat URLs, use the original hook
  const { data: flatCategory, isLoading: flatCategoryLoading } = useCategoryBySlug(
    !isHierarchical ? (slug || '') : ''
  );

  // Determine the active category and its parent
  const activeCategory = isHierarchical ? subCategoryData?.subCategory : flatCategory;
  const parentCategory = isHierarchical ? subCategoryData?.parent : (
    flatCategory?.parent_id ? null : flatCategory // If flat URL points to a parent, it's the parent
  );

  // Check if flat URL points to a parent category (show sub-categories instead of products)
  const isParentCategoryPage = !isHierarchical && flatCategory && !flatCategory.parent_id;

  // For parent category pages, fetch using parent's slug for sub-categories listing
  const { data: parentSubsData, isLoading: parentSubsLoading } = useParentCategoryWithSubs(
    isParentCategoryPage ? (slug || '') : ''
  );

  // Determine if we're loading
  const isLoading = isHierarchical 
    ? (parentLoading || subLoading)
    : (flatCategoryLoading || (isParentCategoryPage && parentSubsLoading));

  // Fetch products for the active category
  const { data: products = [], isLoading: productsLoading } = useProductsByCategory(
    isParentCategoryPage ? '' : (activeCategory?.id || '')
  );

  // Get bilingual category fields
  const categoryFields = activeCategory ? getCategoryFields({
    name: activeCategory.name,
    name_bn: activeCategory.name_bn,
    description: activeCategory.description,
    description_bn: activeCategory.description_bn,
  }) : null;

  const parentFields = parentCategory ? getCategoryFields({
    name: parentCategory.name,
    name_bn: parentCategory.name_bn,
  }) : null;

  // Get category icon
  const CategoryIcon = activeCategory?.icon_name ? getCategoryIcon(activeCategory.icon_name) : null;

  // Handle not found
  if (!isLoading && !activeCategory && !isParentCategoryPage) {
    return (
      <Layout>
        <div className={`container-premium py-16 text-center ${fontClass}`}>
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

  // Render sub-categories for parent category pages
  const renderSubCategories = () => {
    const subs = parentSubsData?.subCategories || [];
    const parentData = parentSubsData?.parent || flatCategory;
    
    if (!parentData) return null;

    const parentCatFields = getCategoryFields({
      name: parentData.name,
      name_bn: parentData.name_bn,
      description: parentData.description,
      description_bn: parentData.description_bn,
    });

    const ParentIcon = getCategoryIcon(parentData.icon_name);

    return (
      <>
        {/* Category SEO */}
        <CategorySEO
          category={parentData}
          productCount={subs.length}
          language={language}
        />
        
        {/* Breadcrumb */}
        <div className="bg-muted/50 border-b border-border">
          <div className={`container-premium py-4 ${fontClass}`}>
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
                {parentCatFields.name}
              </span>
            </nav>
          </div>
        </div>

        {/* Page Header with Hero Image */}
        <section className="relative border-b border-border overflow-hidden">
          {/* Hero Background Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src={getCategoryHeroImage(parentData.slug, parentData.name, parentData.parent_group)} 
              alt=""
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
          </div>
          
          <div className={`container-premium py-10 md:py-16 relative z-10 ${fontClass}`}>
            <div className="flex items-start gap-4">
              {ParentIcon && (
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-lg flex items-center justify-center shrink-0 shadow-lg">
                  <ParentIcon className="h-8 w-8" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold">
                    {parentCatFields.name}
                  </h1>
                  <Badge variant="outline" className="text-xs bg-background/50 backdrop-blur-sm">
                    <FolderOpen className="h-3 w-3 mr-1" />
                    Parent Category
                  </Badge>
                </div>
                {parentCatFields.description && (
                  <p className="text-muted-foreground max-w-2xl">{parentCatFields.description}</p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  {subs.length} sub-categories
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sub-Categories with Sidebar Layout */}
        <section className="py-8 md:py-12">
          <div className={`container-premium ${fontClass}`}>
            <div className="flex gap-8">
              {/* Sticky Category Sidebar - Desktop Only */}
              <aside className="hidden lg:block w-64 shrink-0">
                <StickyCategorySidebar />
              </aside>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold mb-6">Browse Sub-Categories</h2>
                {subs.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground mb-4">
                      No sub-categories found in this category.
                    </p>
                    <Button variant="outline" asChild>
                      <Link to="/categories">{t.categories.browseAll}</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {subs.map((sub) => {
                      const SubIcon = getCategoryIcon(sub.icon_name);
                      const subFields = getCategoryFields({
                        name: sub.name,
                        name_bn: sub.name_bn,
                        description: sub.description,
                        description_bn: sub.description_bn,
                      });

                      return (
                        <Link
                          key={sub.id}
                          to={`/category/${parentData.slug}/${sub.slug}`}
                          className="group"
                        >
                          <Card className="h-full hover:shadow-md transition-shadow border-border">
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                  <SubIcon className="h-6 w-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                    {subFields.name}
                                  </h3>
                                  {subFields.description && (
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                      {subFields.description}
                                    </p>
                                  )}
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </>
    );
  };

  // If this is a parent category page, show sub-categories
  if (isParentCategoryPage) {
    return (
      <Layout>
        {renderSubCategories()}
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Category SEO */}
      {activeCategory && (
        <CategorySEO
          category={activeCategory}
          parentCategory={parentCategory || undefined}
          productCount={products.length}
          language={language}
        />
      )}
      
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
        <div className={`container-premium py-4 ${fontClass}`}>
          <nav className="flex items-center gap-2 text-sm flex-wrap">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              {t.nav.home}
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Link to="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
              {t.nav.categories}
            </Link>
            {/* Parent category breadcrumb */}
            {parentCategory && (
              <>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <Link 
                  to={`/category/${parentCategory.slug}`} 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {parentFields?.name || parentCategory.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium">
              {categoryFields?.name || activeCategory?.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Page Header with Hero Image */}
      <section className="relative border-b border-border overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={getCategoryHeroImage(activeCategory?.slug, activeCategory?.name, activeCategory?.parent_group)} 
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
        </div>
        
        <div className={`container-premium py-10 md:py-16 relative z-10 ${fontClass}`}>
          <div className="flex items-start gap-4">
            {CategoryIcon && (
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-lg flex items-center justify-center shrink-0 shadow-lg">
                <CategoryIcon className="h-8 w-8" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                {parentCategory && (
                  <span className="text-sm text-muted-foreground">
                    {parentFields?.name} /
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {categoryFields?.name || activeCategory?.name}
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

      {/* Products Grid with Sidebar */}
      <section className="py-8 md:py-12">
        <div className={`container-premium ${fontClass}`}>
          <div className="flex gap-8">
            {/* Sticky Category Sidebar - Desktop Only */}
            <aside className="hidden lg:block w-64 shrink-0">
              <StickyCategorySidebar />
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
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
                  <select className="h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option>{t.products.sortNewest}</option>
                    <option>{t.products.sortPriceAsc}</option>
                    <option>{t.products.sortPriceDesc}</option>
                    <option>{t.products.sortNameAsc}</option>
                  </select>
                </div>
              </div>

              {/* Products */}
              {isLoading || productsLoading ? (
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
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CategoryPage;
