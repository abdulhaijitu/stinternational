import { Link, useLocation, useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronRight, SlidersHorizontal, Clock, Package, X, Trash2 } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useCategoryHierarchy, ParentCategory, DBCategory } from "@/hooks/useCategories";
import { useAllProducts } from "@/hooks/useProducts";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useBilingualContent } from "@/hooks/useBilingualContent";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPrice } from "@/lib/formatPrice";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { getCategoryIcon } from "@/lib/categoryIcons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StickyCategorySidebarProps {
  className?: string;
  showFilters?: boolean;
  showRecentlyViewed?: boolean;
  onFilterChange?: (filters: SidebarFilters) => void;
}

export interface SidebarFilters {
  minPrice: string;
  maxPrice: string;
  inStockOnly: boolean;
  sortBy: string;
}

type SortOption = "newest" | "price_asc" | "price_desc" | "name_asc" | "name_desc";

const StickyCategorySidebar = ({ 
  className,
  showFilters = true,
  showRecentlyViewed = true,
  onFilterChange,
}: StickyCategorySidebarProps) => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { parentCategories, isLoading } = useCategoryHierarchy();
  const { data: products } = useAllProducts();
  const { products: recentlyViewedProducts, clearHistory } = useRecentlyViewed();
  const { getCategoryFields } = useBilingualContent();
  const { t } = useLanguage();
  
  // Track expanded sections
  const [expandedParentId, setExpandedParentId] = useState<string | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [recentlyViewedExpanded, setRecentlyViewedExpanded] = useState(true);
  
  // Filter state
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [inStockOnly, setInStockOnly] = useState(searchParams.get("inStock") === "true");
  const [sortBy, setSortBy] = useState<SortOption>((searchParams.get("sort") as SortOption) || "newest");
  
  // Parse current URL to determine active category
  const pathParts = location.pathname.split('/').filter(Boolean);
  const isOnCategoryPage = pathParts[0] === 'category';
  const currentParentSlug = isOnCategoryPage ? pathParts[1] : null;
  const currentSubSlug = isOnCategoryPage && pathParts.length > 2 ? pathParts[2] : null;

  // Get recently viewed (limit to 5)
  const recentProducts = useMemo(() => {
    return recentlyViewedProducts.slice(0, 5);
  }, [recentlyViewedProducts]);

  // Check if filters are active
  const hasActiveFilters = minPrice || maxPrice || inStockOnly || sortBy !== "newest";

  // Calculate product counts per category
  const productCounts = useMemo(() => {
    if (!products || !parentCategories.length) return {};
    
    const counts: Record<string, number> = {};
    
    parentCategories.forEach(parent => {
      let parentTotal = 0;
      
      parent.subCategories.forEach(sub => {
        const subCount = products.filter(p => p.category_id === sub.id).length;
        counts[sub.id] = subCount;
        parentTotal += subCount;
      });
      
      const directCount = products.filter(p => p.category_id === parent.id).length;
      parentTotal += directCount;
      counts[parent.id] = parentTotal;
    });
    
    return counts;
  }, [products, parentCategories]);

  // Auto-expand parent that contains active category
  useEffect(() => {
    if (parentCategories.length > 0 && currentParentSlug) {
      const activeParent = parentCategories.find(
        p => p.slug === currentParentSlug || 
             p.subCategories.some(sub => sub.slug === currentSubSlug && p.slug === currentParentSlug)
      );
      if (activeParent) {
        setExpandedParentId(activeParent.id);
      }
    }
  }, [parentCategories, currentParentSlug, currentSubSlug]);

  const toggleParent = useCallback((parentId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedParentId(prev => prev === parentId ? null : parentId);
  }, []);

  const isParentActive = (parent: ParentCategory) => {
    return parent.slug === currentParentSlug && !currentSubSlug;
  };

  const isSubActive = (parent: ParentCategory, sub: DBCategory) => {
    return parent.slug === currentParentSlug && sub.slug === currentSubSlug;
  };

  const hasActiveChild = (parent: ParentCategory) => {
    return parent.slug === currentParentSlug;
  };

  // Apply filters
  const applyFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    
    if (inStockOnly) params.set("inStock", "true");
    else params.delete("inStock");
    
    if (sortBy && sortBy !== "newest") params.set("sort", sortBy);
    else params.delete("sort");
    
    params.set("page", "1");
    setSearchParams(params);
    
    onFilterChange?.({ minPrice, maxPrice, inStockOnly, sortBy });
  }, [minPrice, maxPrice, inStockOnly, sortBy, searchParams, setSearchParams, onFilterChange]);

  const clearFilters = useCallback(() => {
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    setSortBy("newest");
    
    const params = new URLSearchParams(searchParams);
    params.delete("minPrice");
    params.delete("maxPrice");
    params.delete("inStock");
    params.delete("sort");
    params.set("page", "1");
    setSearchParams(params);
    
    onFilterChange?.({ minPrice: "", maxPrice: "", inStockOnly: false, sortBy: "newest" });
  }, [searchParams, setSearchParams, onFilterChange]);

  if (isLoading) {
    return (
      <Card className={cn("border-border/50 shadow-sm overflow-hidden", className)}>
        <CardHeader className="py-3.5 px-4 border-b border-border/50 bg-muted/30">
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-3 space-y-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "border-border/50 shadow-sm overflow-hidden sticky top-24",
      className
    )}>
      <ScrollArea className="max-h-[calc(100vh-120px)]">
        {/* Categories Section */}
        <div>
          <CardHeader className="py-3.5 px-4 border-b border-border/50 bg-muted/30">
            <h3 className="text-sm font-semibold text-foreground">
              {t.nav.categories}
            </h3>
          </CardHeader>

          <CardContent className="p-0">
            <nav role="navigation" aria-label="Category navigation">
              {parentCategories.map((parent) => {
                const isExpanded = expandedParentId === parent.id;
                const hasChildren = parent.subCategories.length > 0;
                const isActive = isParentActive(parent);
                const hasActive = hasActiveChild(parent);
                const ParentIcon = getCategoryIcon(parent.icon_name);
                const parentName = getCategoryFields(parent).name;
                const parentCount = productCounts[parent.id] || 0;

                return (
                  <div key={parent.id} className="border-b border-border/30 last:border-b-0">
                    {hasChildren ? (
                      <Collapsible open={isExpanded}>
                        <div className="flex items-center">
                          <Link
                            to={`/category/${parent.slug}`}
                            className={cn(
                              "flex-1 flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200",
                              isActive
                                ? "bg-primary/10 text-primary font-semibold"
                                : hasActive
                                  ? "text-foreground font-medium"
                                  : "text-foreground hover:bg-muted/40"
                            )}
                          >
                            <ParentIcon className={cn(
                              "h-4 w-4 shrink-0 transition-colors duration-200",
                              isActive || hasActive ? "text-primary" : "text-muted-foreground"
                            )} />
                            <span className="flex-1 truncate">{parentName}</span>
                            {parentCount > 0 && (
                              <Badge 
                                variant="secondary" 
                                className={cn(
                                  "text-xs px-1.5 py-0 h-5 min-w-[1.25rem] justify-center transition-colors duration-200",
                                  isActive || hasActive ? "bg-primary/20 text-primary" : ""
                                )}
                              >
                                {parentCount}
                              </Badge>
                            )}
                          </Link>

                          <CollapsibleTrigger asChild>
                            <button
                              onClick={(e) => toggleParent(parent.id, e)}
                              className={cn(
                                "p-3 hover:bg-muted/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-inset",
                                isExpanded && "bg-muted/30"
                              )}
                              aria-label={isExpanded ? `Collapse ${parentName}` : `Expand ${parentName}`}
                            >
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 text-muted-foreground transition-transform duration-300 ease-out",
                                  isExpanded && "rotate-180"
                                )}
                              />
                            </button>
                          </CollapsibleTrigger>
                        </div>

                        <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                          <div className="bg-muted/20 py-1">
                            {parent.subCategories.map((sub, index) => {
                              const isSubItemActive = isSubActive(parent, sub);
                              const SubIcon = getCategoryIcon(sub.icon_name);
                              const subName = getCategoryFields(sub).name;
                              const subCount = productCounts[sub.id] || 0;

                              return (
                                <Link
                                  key={sub.id}
                                  to={`/category/${parent.slug}/${sub.slug}`}
                                  className={cn(
                                    "flex items-center gap-3 pl-11 pr-4 py-2.5 text-sm transition-all duration-200",
                                    "animate-fade-in",
                                    isSubItemActive
                                      ? "bg-primary/10 text-primary font-medium border-l-2 border-primary ml-0"
                                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                                  )}
                                  style={{ animationDelay: `${index * 50}ms` }}
                                >
                                  <SubIcon className={cn(
                                    "h-3.5 w-3.5 shrink-0 transition-colors duration-200",
                                    isSubItemActive && "text-primary"
                                  )} />
                                  <span className="flex-1 truncate">{subName}</span>
                                  {subCount > 0 && (
                                    <Badge 
                                      variant="outline" 
                                      className={cn(
                                        "text-xs px-1.5 py-0 h-5 min-w-[1.25rem] justify-center transition-colors duration-200",
                                        isSubItemActive ? "border-primary/50 text-primary" : "border-border/50"
                                      )}
                                    >
                                      {subCount}
                                    </Badge>
                                  )}
                                  {isSubItemActive && (
                                    <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0" />
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <Link
                        to={`/category/${parent.slug}`}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200",
                          isActive
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-foreground hover:bg-muted/40"
                        )}
                      >
                        <ParentIcon className={cn(
                          "h-4 w-4 shrink-0 transition-colors duration-200",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )} />
                        <span className="flex-1 truncate">{parentName}</span>
                        {parentCount > 0 && (
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-xs px-1.5 py-0 h-5 min-w-[1.25rem] justify-center",
                              isActive ? "bg-primary/20 text-primary" : ""
                            )}
                          >
                            {parentCount}
                          </Badge>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Browse All Categories Link */}
            <div className="p-3 border-t border-border/50">
              <Link
                to="/categories"
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200 hover-scale",
                  location.pathname === '/categories'
                    ? "bg-primary/10 text-primary"
                    : "text-primary hover:bg-primary/5"
                )}
              >
                {t.nav.viewAllCategories}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="border-t border-border/50">
            <Collapsible open={filtersExpanded} onOpenChange={setFiltersExpanded}>
              <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3.5 bg-muted/30 hover:bg-muted/50 transition-colors duration-200">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{t.products.filters}</span>
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5 bg-primary/20 text-primary">
                      Active
                    </Badge>
                  )}
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-300 ease-out",
                  filtersExpanded && "rotate-180"
                )} />
              </CollapsibleTrigger>

              <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                <div className="p-4 space-y-4 bg-muted/10">
                  {/* Price Range */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t.products.priceRange}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="h-9 text-sm"
                        min={0}
                      />
                      <span className="text-muted-foreground">-</span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="h-9 text-sm"
                        min={0}
                      />
                    </div>
                  </div>

                  {/* In Stock Only */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="stock-filter" className="text-sm font-medium flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      {t.products.inStockOnly}
                    </Label>
                    <Switch
                      id="stock-filter"
                      checked={inStockOnly}
                      onCheckedChange={setInStockOnly}
                    />
                  </div>

                  <Separator />

                  {/* Sort By */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t.products.sortBy}</Label>
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder={t.products.sortBy} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">{t.products.sortNewest}</SelectItem>
                        <SelectItem value="price_asc">{t.products.sortPriceAsc}</SelectItem>
                        <SelectItem value="price_desc">{t.products.sortPriceDesc}</SelectItem>
                        <SelectItem value="name_asc">{t.products.sortNameAsc}</SelectItem>
                        <SelectItem value="name_desc">{t.products.sortNameDesc}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filter Actions */}
                  <div className="flex gap-2">
                    <Button 
                      onClick={applyFilters} 
                      size="sm" 
                      className="flex-1 h-9"
                    >
                      {t.products.applyFilters}
                    </Button>
                    {hasActiveFilters && (
                      <Button 
                        onClick={clearFilters} 
                        variant="outline" 
                        size="sm" 
                        className="h-9"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* Recently Viewed Section */}
        {showRecentlyViewed && recentProducts.length > 0 && (
          <div className="border-t border-border/50">
            <Collapsible open={recentlyViewedExpanded} onOpenChange={setRecentlyViewedExpanded}>
              <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3.5 bg-muted/30 hover:bg-muted/50 transition-colors duration-200">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{t.products.recentlyViewed}</span>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                    {recentProducts.length}
                  </Badge>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-300 ease-out",
                  recentlyViewedExpanded && "rotate-180"
                )} />
              </CollapsibleTrigger>

              <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                <div className="p-2 space-y-1">
                  {recentProducts.map((product, index) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.slug}`}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-all duration-200",
                        "animate-fade-in"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Product Image */}
                      <div className="w-12 h-12 rounded-md bg-muted overflow-hidden shrink-0">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-primary font-semibold">
                          {formatPrice(product.price)}
                        </p>
                      </div>

                      {/* Stock Badge */}
                      {!product.in_stock && (
                        <Badge variant="outline" className="text-xs shrink-0 border-destructive/50 text-destructive">
                          {t.common.outOfStock}
                        </Badge>
                      )}
                    </Link>
                  ))}
                  
                  {/* Clear History Button */}
                  <div className="pt-2 px-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearHistory}
                      className="w-full h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      {t.products.clearHistory}
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};

export default StickyCategorySidebar;