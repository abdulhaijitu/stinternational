import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, ChevronDown, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import DBProductCard from "@/components/products/DBProductCard";
import { useAllProducts, useCategories } from "@/hooks/useProducts";

type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

const PER_PAGE_OPTIONS = [12, 24, 48, 96];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: allProducts, isLoading: productsLoading } = useAllProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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
        // Already sorted by created_at desc from the API
        break;
    }

    return filtered;
  }, [allProducts, search, selectedCategories, priceRange, inStockOnly, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / perPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * perPage;
    return filteredProducts.slice(startIndex, startIndex + perPage);
  }, [filteredProducts, currentPage, perPage]);

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
    // Scroll to top of products
    window.scrollTo({ top: 300, behavior: "smooth" });
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

  const handleCategoryToggle = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setPriceRange({ min: "", max: "" });
    setInStockOnly(false);
    setSortBy("newest");
    setCurrentPage(1);
    setSearchParams({});
  };

  const hasActiveFilters =
    search || selectedCategories.length > 0 || priceRange.min || priceRange.max || inStockOnly;

  const isLoading = productsLoading || categoriesLoading;

  // Filter sidebar content
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold">
          ক্যাটাগরি
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          {categories?.map((category) => (
            <label
              key={category.id}
              className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
            >
              <Checkbox
                checked={selectedCategories.includes(category.slug)}
                onCheckedChange={() => handleCategoryToggle(category.slug)}
              />
              <span className="text-sm">{category.name}</span>
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Price Range */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold">
          দাম
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="minPrice" className="text-xs text-muted-foreground">
                সর্বনিম্ন
              </Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="৳০"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="maxPrice" className="text-xs text-muted-foreground">
                সর্বোচ্চ
              </Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="৳..."
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Stock Filter */}
      <div className="py-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={inStockOnly}
            onCheckedChange={(checked) => setInStockOnly(checked === true)}
          />
          <span className="text-sm font-medium">শুধু স্টকে আছে</span>
        </label>
      </div>

      {/* Apply/Clear Buttons */}
      <div className="space-y-2 pt-4 border-t border-border">
        <Button onClick={() => updateSearchParams(true)} className="w-full">
          ফিল্টার প্রয়োগ করুন
        </Button>
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters} className="w-full">
            ফিল্টার মুছুন
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Layout>
      {/* Page Header */}
      <section className="bg-muted/50 border-b border-border">
        <div className="container-premium py-8 md:py-12">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">সকল পণ্য</h1>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="পণ্য খুঁজুন..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">খুঁজুন</Button>
          </form>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-12">
        <div className="container-premium">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24 bg-card border border-border rounded-lg p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  ফিল্টার
                </h3>
                <FilterContent />
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  {/* Mobile Filter Button */}
                  <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden">
                        <SlidersHorizontal className="h-4 w-4" />
                        ফিল্টার
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80">
                      <SheetHeader>
                        <SheetTitle>ফিল্টার</SheetTitle>
                      </SheetHeader>
                      <div className="mt-4">
                        <FilterContent />
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Results Count */}
                  <span className="text-sm text-muted-foreground">
                    {filteredProducts.length}টি পণ্য
                  </span>

                  {/* Active Filter Tags */}
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs h-7"
                    >
                      <X className="h-3 w-3" />
                      ফিল্টার মুছুন
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Per Page Selector */}
                  <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PER_PAGE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option.toString()}>
                          {option}টি
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Sort Dropdown */}
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="সর্ট করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">নতুন প্রথমে</SelectItem>
                      <SelectItem value="price-asc">দাম: কম থেকে বেশি</SelectItem>
                      <SelectItem value="price-desc">দাম: বেশি থেকে কম</SelectItem>
                      <SelectItem value="name-asc">নাম: A-Z</SelectItem>
                      <SelectItem value="name-desc">নাম: Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Products */}
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-card border border-border rounded-lg">
                  <p className="text-muted-foreground mb-4">
                    {hasActiveFilters
                      ? "কোনো পণ্য পাওয়া যায়নি। ফিল্টার পরিবর্তন করে দেখুন।"
                      : "কোনো পণ্য নেই"}
                  </p>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters}>
                      ফিল্টার মুছুন
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paginatedProducts.map((product) => (
                      <DBProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <div className="flex items-center gap-1">
                        {/* First page */}
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

                        {/* Page numbers around current */}
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

                        {/* Last page */}
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
                        পৃষ্ঠা {currentPage} / {totalPages}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Products;
