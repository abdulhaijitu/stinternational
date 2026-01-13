import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, ChevronDown, ChevronLeft, ChevronRight, Loader2, LayoutGrid, Filter } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useGridDensity, GridDensity } from "@/hooks/useGridDensity";
import GridDensityToggle from "@/components/products/GridDensityToggle";
import Layout from "@/components/layout/Layout";
import PageTransition from "@/components/layout/PageTransition";
import PullToRefresh from "@/components/layout/PullToRefresh";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import DBProductCard from "@/components/products/DBProductCard";
import ProductCardSkeleton from "@/components/products/ProductCardSkeleton";
import ProductQuickView from "@/components/products/ProductQuickView";
import ProductCompareBar from "@/components/products/ProductCompareBar";
import ProductCompareModal from "@/components/products/ProductCompareModal";
import { useAllProducts, useCategories, DBProduct } from "@/hooks/useProducts";
import { useActiveCategoriesByGroup } from "@/hooks/useCategories";
import { useProductCompare } from "@/hooks/useProductCompare";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBilingualContent } from "@/hooks/useBilingualContent";
import { cn } from "@/lib/utils";

type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

const PER_PAGE_OPTIONS = [12, 24, 48, 96];
const INFINITE_SCROLL_BATCH = 12;

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: allProducts, isLoading: productsLoading } = useAllProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { groups, isLoading: groupsLoading } = useActiveCategoriesByGroup();
  const { t } = useLanguage();
  const { getCategoryFields } = useBilingualContent();
  const { density, setDensity } = useGridDensity();
  const queryClient = useQueryClient();
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

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['all-products'] });
    await queryClient.invalidateQueries({ queryKey: ['categories'] });
  }, [queryClient]);

  // Filter state
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("categories")?.split(",").filter(Boolean) || []
  );
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get("minPrice") || "",
    max: searchParams.get("maxPrice") || "",
  });
  const [inStockOnly, setInStockOnly] = useState(searchParams.get("inStock") === "true");
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "newest"
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );
  const [perPage, setPerPage] = useState(
    parseInt(searchParams.get("perPage") || "12", 10)
  );
  const [infiniteScroll, setInfiniteScroll] = useState(
    searchParams.get("scroll") === "infinite"
  );
  const [visibleCount, setVisibleCount] = useState(INFINITE_SCROLL_BATCH);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  // Quick view state
  const [quickViewProduct, setQuickViewProduct] = useState<DBProduct | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  // Infinite scroll ref
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Expand groups that have selected categories
  useEffect(() => {
    if (groups.length > 0 && expandedGroups.length === 0) {
      const groupsWithSelection = groups
        .filter(g => g.categories.some(c => selectedCategories.includes(c.slug)))
        .map(g => g.slug);
      setExpandedGroups(groupsWithSelection.length > 0 ? groupsWithSelection : [groups[0]?.slug].filter(Boolean));
    }
  }, [groups, selectedCategories]);

  // Apply filters and sorting
  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];

    let filtered = [...allProducts];

    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.short_description?.toLowerCase().includes(searchLower) ||
          p.sku?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(
        (p) => p.category && selectedCategories.includes(p.category.slug)
      );
    }

    // Price range filter
    if (priceRange.min) {
      filtered = filtered.filter((p) => p.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter((p) => p.price <= parseFloat(priceRange.max));
    }

    // In stock filter
    if (inStockOnly) {
      filtered = filtered.filter((p) => p.in_stock);
    }

    // Sorting
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
      default:
        break;
    }

    return filtered;
  }, [allProducts, search, selectedCategories, priceRange, inStockOnly, sortBy]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(INFINITE_SCROLL_BATCH);
  }, [search, selectedCategories, priceRange, inStockOnly, sortBy]);

  // Pagination / Infinite scroll products
  const displayedProducts = useMemo(() => {
    if (infiniteScroll) {
      return filteredProducts.slice(0, visibleCount);
    }
    const startIndex = (currentPage - 1) * perPage;
    return filteredProducts.slice(startIndex, startIndex + perPage);
  }, [filteredProducts, currentPage, perPage, infiniteScroll, visibleCount]);

  const totalPages = Math.ceil(filteredProducts.length / perPage);
  const hasMore = infiniteScroll && visibleCount < filteredProducts.length;

  // Infinite scroll observer
  useEffect(() => {
    if (!infiniteScroll) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setVisibleCount((prev) => Math.min(prev + INFINITE_SCROLL_BATCH, filteredProducts.length));
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [infiniteScroll, hasMore, filteredProducts.length]);

  // Reset to page 1 when filters change
  const updateSearchParams = (resetPage = true) => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (selectedCategories.length > 0) params.set("categories", selectedCategories.join(","));
    if (priceRange.min) params.set("minPrice", priceRange.min);
    if (priceRange.max) params.set("maxPrice", priceRange.max);
    if (inStockOnly) params.set("inStock", "true");
    if (sortBy !== "newest") params.set("sort", sortBy);
    if (perPage !== 12) params.set("perPage", perPage.toString());
    if (infiniteScroll) params.set("scroll", "infinite");
    if (!resetPage && currentPage > 1) params.set("page", currentPage.toString());
    setSearchParams(params);
    if (resetPage) setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams(searchParams);
    if (page > 1) {
      params.set("page", page.toString());
    } else {
      params.delete("page");
    }
    setSearchParams(params);
  };

  const handlePerPageChange = (value: string) => {
    const newPerPage = parseInt(value, 10);
    setPerPage(newPerPage);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams);
    if (newPerPage !== 12) {
      params.set("perPage", value);
    } else {
      params.delete("perPage");
    }
    params.delete("page");
    setSearchParams(params);
  };

  const handleInfiniteScrollToggle = (enabled: boolean) => {
    setInfiniteScroll(enabled);
    setVisibleCount(INFINITE_SCROLL_BATCH);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams);
    if (enabled) {
      params.set("scroll", "infinite");
      params.delete("page");
    } else {
      params.delete("scroll");
    }
    setSearchParams(params);
  };

  const handleCategoryToggle = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const toggleGroup = (slug: string) => {
    setExpandedGroups((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleQuickView = useCallback((product: DBProduct) => {
    setQuickViewProduct(product);
    setQuickViewOpen(true);
  }, []);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setPriceRange({ min: "", max: "" });
    setInStockOnly(false);
    setSortBy("newest");
    setCurrentPage(1);
    setVisibleCount(INFINITE_SCROLL_BATCH);
    setSearchParams({});
  };

  const hasActiveFilters =
    search || selectedCategories.length > 0 || priceRange.min || priceRange.max || inStockOnly;

  const isLoading = productsLoading || categoriesLoading;

  // Sidebar Filter Component
  const FilterSidebar = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">{t.products.price}</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="minPrice" className="text-xs text-muted-foreground mb-1.5 block">
              {t.products.minPrice}
            </Label>
            <Input
              id="minPrice"
              type="number"
              placeholder="৳০"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              className="h-9"
            />
          </div>
          <div>
            <Label htmlFor="maxPrice" className="text-xs text-muted-foreground mb-1.5 block">
              {t.products.maxPrice}
            </Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="৳..."
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              className="h-9"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Stock Filter */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Availability</h4>
        <label className="flex items-center gap-3 cursor-pointer group">
          <Checkbox
            checked={inStockOnly}
            onCheckedChange={(checked) => setInStockOnly(checked === true)}
            className="h-5 w-5"
          />
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            {t.products.inStockOnly}
          </span>
        </label>
      </div>

      <Separator />

      {/* Scroll Mode */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Display Mode</h4>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-muted-foreground">{t.products.infiniteScroll}</span>
          <Switch
            checked={infiniteScroll}
            onCheckedChange={handleInfiniteScrollToggle}
          />
        </label>
      </div>

      <Separator />

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button onClick={() => { updateSearchParams(true); if (isMobile) setMobileFiltersOpen(false); }} className="w-full">
          {t.products.applyFilters}
        </Button>
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters} className="w-full">
            <X className="h-4 w-4 mr-2" />
            {t.products.clearFilters}
          </Button>
        )}
      </div>
    </div>
  );

  // Category Sidebar Component
  const CategorySidebar = () => (
    <Card className="border-border overflow-hidden">
      <CardHeader className="py-3 px-4 border-b bg-muted/40">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">{t.nav.categories}</h3>
        </div>
      </CardHeader>
      <ScrollArea className="h-[400px]">
        <CardContent className="p-0">
          {groupsLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <>
              {groups.map((group) => (
                <Collapsible
                  key={group.slug}
                  open={expandedGroups.includes(group.slug)}
                  onOpenChange={() => toggleGroup(group.slug)}
                >
                  <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-muted/50 transition-colors border-b border-border/50">
                    <span className="text-foreground">{group.name}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform duration-200",
                        expandedGroups.includes(group.slug) && "rotate-180"
                      )}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="bg-muted/20">
                    <div className="py-2 px-2">
                      {group.categories.map((category) => {
                        const isSelected = selectedCategories.includes(category.slug);
                        return (
                          <button
                            key={category.id}
                            onClick={() => handleCategoryToggle(category.slug)}
                            className={cn(
                              "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all text-left",
                              isSelected
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                            )}
                          >
                            <span
                              className={cn(
                                "w-2 h-2 rounded-full shrink-0 transition-colors",
                                isSelected ? "bg-primary" : "bg-border"
                              )}
                            />
                            <span className="truncate">{category.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
              
              {/* View All Categories Link */}
              <div className="p-3 border-t">
                <Link
                  to="/categories"
                  className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Browse All Categories
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  );

  return (
    <Layout>
      <PullToRefresh onRefresh={handleRefresh}>
        <PageTransition>
          {/* Quick View Modal */}
          <ProductQuickView
            product={quickViewProduct}
            open={quickViewOpen}
            onOpenChange={setQuickViewOpen}
          />

          {/* Compare Modal */}
          <ProductCompareModal
            products={compareProducts}
            open={isCompareOpen}
            onOpenChange={closeCompareModal}
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

      {/* Page Header */}
      <section className="bg-muted/40 border-b">
        <div className="container-premium py-8 md:py-10">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">{t.products.allProducts}</h1>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.products.searchProducts}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 bg-background"
              />
            </div>
            <Button type="submit" size="lg" className="h-11">
              {t.products.searchButton}
            </Button>
          </form>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-10">
        <div className="container-premium">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 shrink-0 space-y-6">
              {/* Filters Card */}
              <Card className="border-border sticky top-24">
                <CardHeader className="py-3 px-4 border-b bg-muted/40">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold">{t.products.filters}</h3>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <FilterSidebar />
                </CardContent>
              </Card>

              {/* Categories Card */}
              <div className="sticky top-[440px]">
                <CategorySidebar />
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-card border border-border rounded-lg p-3">
                <div className="flex items-center gap-3">
                  {/* Mobile Filter Button */}
                  <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        {t.products.filters}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 overflow-y-auto">
                      <SheetHeader className="mb-6">
                        <SheetTitle className="flex items-center gap-2">
                          <SlidersHorizontal className="h-5 w-5" />
                          {t.products.filters}
                        </SheetTitle>
                      </SheetHeader>
                      
                      {/* Mobile Category List */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold mb-3">{t.nav.categories}</h4>
                        <div className="space-y-1">
                          {categories?.map((category) => {
                            const categoryFields = getCategoryFields(category);
                            const isSelected = selectedCategories.includes(category.slug);
                            return (
                              <label
                                key={category.id}
                                className="flex items-center gap-2 py-2 cursor-pointer"
                              >
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => handleCategoryToggle(category.slug)}
                                />
                                <span className={cn("text-sm", isSelected && "font-medium text-primary")}>
                                  {categoryFields.name}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                      
                      <Separator className="mb-6" />
                      
                      <FilterSidebar isMobile />
                    </SheetContent>
                  </Sheet>

                  {/* Results Count */}
                  <span className="text-sm text-muted-foreground">
                    {t.products.productsCount.replace('{count}', String(filteredProducts.length))}
                    {infiniteScroll && filteredProducts.length > 0 && visibleCount < filteredProducts.length && (
                      <span className="ml-1 text-xs">
                        ({t.products.showingCount.replace('{count}', String(Math.min(visibleCount, filteredProducts.length)))})
                      </span>
                    )}
                  </span>

                  {/* Active Filter Tags */}
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs h-7 text-destructive hover:text-destructive"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Grid Density Toggle */}
                  <GridDensityToggle 
                    density={density}
                    onDensityChange={setDensity}
                    className="hidden md:flex"
                  />

                  {/* Per Page Selector */}
                  {!infiniteScroll && (
                    <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
                      <SelectTrigger className="w-20 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PER_PAGE_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option.toString()}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Sort Dropdown */}
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger className="w-40 h-9">
                      <SelectValue placeholder={t.products.sortBy} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">{t.products.sortNewest}</SelectItem>
                      <SelectItem value="price-asc">{t.products.sortPriceAsc}</SelectItem>
                      <SelectItem value="price-desc">{t.products.sortPriceDesc}</SelectItem>
                      <SelectItem value="name-asc">{t.products.sortNameAsc}</SelectItem>
                      <SelectItem value="name-desc">{t.products.sortNameDesc}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Selected Categories Pills */}
              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedCategories.map((slug) => {
                    const category = categories?.find(c => c.slug === slug);
                    if (!category) return null;
                    const categoryFields = getCategoryFields(category);
                    return (
                      <button
                        key={slug}
                        onClick={() => handleCategoryToggle(slug)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full hover:bg-primary/20 transition-colors"
                      >
                        {categoryFields.name}
                        <X className="h-3.5 w-3.5" />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Products */}
              {isLoading ? (
                <div className={cn(
                  "grid gap-4 md:gap-5",
                  density === 'compact' 
                    ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-2 sm:grid-cols-2 xl:grid-cols-3"
                )}>
                  {Array.from({ length: perPage }).map((_, index) => (
                    <ProductCardSkeleton key={index} variant={density === 'compact' ? 'compact' : 'default'} />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-card border border-border rounded-xl">
                  <div className="max-w-sm mx-auto">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No products found</h3>
                    <p className="text-muted-foreground mb-6">
                      {hasActiveFilters
                        ? t.products.noProductsMessage
                        : t.products.noProducts}
                    </p>
                    {hasActiveFilters && (
                      <Button variant="outline" onClick={clearFilters}>
                        <X className="h-4 w-4 mr-2" />
                        {t.products.clearFilters}
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className={cn(
                    "grid gap-4 md:gap-5 transition-all duration-200",
                    density === 'compact' 
                      ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-2 sm:grid-cols-2 xl:grid-cols-3"
                  )}>
                    {displayedProducts.map((product) => (
                      <DBProductCard
                        key={product.id}
                        product={product}
                        onQuickView={handleQuickView}
                        variant={density === 'compact' ? 'compact' : 'default'}
                        isInCompare={isInCompare(product.id)}
                        onToggleCompare={toggleCompare}
                        canAddToCompare={canAddMore}
                      />
                    ))}
                  </div>

                  {/* Infinite Scroll Loader */}
                  {infiniteScroll && (
                    <div ref={loadMoreRef} className="flex items-center justify-center py-10">
                      {hasMore ? (
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>{t.products.loadingMore}</span>
                        </div>
                      ) : filteredProducts.length > INFINITE_SCROLL_BATCH && (
                        <span className="text-sm text-muted-foreground">
                          {t.products.allProductsShown}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Pagination */}
                  {!infiniteScroll && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <div className="flex items-center gap-1">
                        {currentPage > 3 && (
                          <>
                            <Button
                              variant={currentPage === 1 ? "default" : "outline"}
                              size="icon"
                              onClick={() => handlePageChange(1)}
                            >
                              1
                            </Button>
                            {currentPage > 4 && (
                              <span className="px-2 text-muted-foreground">...</span>
                            )}
                          </>
                        )}

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(
                            (page) =>
                              page >= currentPage - 2 &&
                              page <= currentPage + 2 &&
                              page >= 1 &&
                              page <= totalPages
                          )
                          .map((page) => (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="icon"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </Button>
                          ))}

                        {currentPage < totalPages - 2 && (
                          <>
                            {currentPage < totalPages - 3 && (
                              <span className="px-2 text-muted-foreground">...</span>
                            )}
                            <Button
                              variant={currentPage === totalPages ? "default" : "outline"}
                              size="icon"
                              onClick={() => handlePageChange(totalPages)}
                            >
                              {totalPages}
                            </Button>
                          </>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>

                      <span className="text-sm text-muted-foreground ml-4">
                        {t.products.pageOf.replace('{current}', String(currentPage)).replace('{total}', String(totalPages))}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
            </div>
          </div>
        </section>
        </PageTransition>
      </PullToRefresh>
    </Layout>
  );
};

export default Products;
