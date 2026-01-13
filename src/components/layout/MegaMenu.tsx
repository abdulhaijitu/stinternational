import { Link } from "react-router-dom";
import { ChevronRight, ChevronDown, Menu, Package, Sparkles } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useActiveCategoriesByGroup, DBCategory } from "@/hooks/useCategories";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { useMegaMenuAnalytics } from "@/hooks/useMegaMenuAnalytics";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBilingualContent } from "@/hooks/useBilingualContent";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { formatPrice } from "@/lib/formatPrice";

interface MegaMenuProps {
  isCompact?: boolean;
  onCategoryClick?: () => void;
}

const MegaMenu = ({ isCompact = false, onCategoryClick }: MegaMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(-1);
  const [activeFeaturedIndex, setActiveFeaturedIndex] = useState(-1);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const categoryRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const featuredRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  
  const { groups, isLoading } = useActiveCategoriesByGroup();
  const { data: featuredProducts, isLoading: featuredLoading } = useFeaturedProducts();
  const { getCategoryFields, getProductFields } = useBilingualContent();
  const { t } = useLanguage();
  const { trackFeaturedProductClick } = useMegaMenuAnalytics();

  // Flatten all categories for navigation
  const allCategories = groups.flatMap(g => g.categories);

  // Get bilingual names
  const getCategoryName = useCallback((category: DBCategory) => {
    return getCategoryFields(category).name;
  }, [getCategoryFields]);

  // Keyboard navigation
  useKeyboardNavigation({
    isOpen,
    onClose: () => {
      setIsOpen(false);
      buttonRef.current?.focus();
    },
    itemCount: allCategories.length,
    activeIndex: activeCategoryIndex,
    onActiveIndexChange: setActiveCategoryIndex,
    onSelect: (index) => {
      const category = allCategories[index];
      if (category) {
        const ref = categoryRefs.current.get(category.id);
        ref?.click();
      }
    },
    orientation: "vertical",
  });

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleCategorySelect = () => {
    setIsOpen(false);
    setActiveFeaturedIndex(-1);
    onCategoryClick?.();
  };

  // Handle featured product click with analytics
  const handleFeaturedProductClick = useCallback((product: { id: string; slug: string; category?: { name: string } | null }) => {
    trackFeaturedProductClick({
      productId: product.id,
      productSlug: product.slug,
      categoryName: product.category?.name,
    });
    handleCategorySelect();
  }, [trackFeaturedProductClick]);

  // Show only 4 featured products
  const displayedProducts = featuredProducts?.slice(0, 4) || [];

  return (
    <div 
      className="relative" 
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button */}
      <button 
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          } else if (e.key === "ArrowDown" && !isOpen) {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={cn(
          "flex items-center gap-3 font-semibold rounded-lg transition-all duration-200",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          isCompact ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm"
        )}
      >
        <Menu className={cn(isCompact ? "h-4 w-4" : "h-5 w-5")} />
        <span className="uppercase tracking-wide">{t.nav.browseCategories}</span>
        <ChevronDown className={cn(
          "transition-transform duration-200 ml-1",
          isOpen && "rotate-180",
          isCompact ? "h-4 w-4" : "h-5 w-5"
        )} />
      </button>

      {/* Mega Menu Dropdown */}
      {isOpen && !isLoading && allCategories.length > 0 && (
        <div 
          className="absolute top-full left-0 mt-1 z-50 animate-fade-in"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          role="menu"
          aria-label="Category navigation"
        >
          <div className="bg-background border border-border rounded-lg shadow-xl overflow-hidden flex">
            {/* Categories Column */}
            <div className="w-[280px] border-r border-border">
              <ScrollArea className="max-h-[420px]">
                <div className="py-1">
                  {allCategories.map((category, index) => {
                    const IconComponent = getCategoryIcon(category.icon_name);
                    return (
                      <Link
                        key={category.id}
                        ref={(el) => {
                          if (el) categoryRefs.current.set(category.id, el);
                        }}
                        to={`/category/${category.slug}`}
                        onClick={handleCategorySelect}
                        onMouseEnter={() => setActiveCategoryIndex(index)}
                        role="menuitem"
                        tabIndex={activeCategoryIndex === index ? 0 : -1}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 text-sm transition-all duration-150",
                          "border-b border-border/30 last:border-b-0",
                          "focus:outline-none",
                          activeCategoryIndex === index
                            ? "bg-muted/60 text-foreground"
                            : "text-foreground/80 hover:bg-muted/40 hover:text-foreground"
                        )}
                      >
                        <IconComponent className={cn(
                          "h-4 w-4 shrink-0 transition-colors duration-150",
                          activeCategoryIndex === index
                            ? "text-primary"
                            : "text-muted-foreground"
                        )} />
                        <span className="font-medium flex-1">{getCategoryName(category)}</span>
                        <ChevronRight className={cn(
                          "h-4 w-4 transition-all duration-150",
                          activeCategoryIndex === index 
                            ? "text-primary opacity-100" 
                            : "text-muted-foreground/50 opacity-70"
                        )} />
                      </Link>
                    );
                  })}
                </div>
              </ScrollArea>
              
              {/* View All Footer */}
              <div className="border-t border-border bg-muted/30">
                <Link
                  to="/categories"
                  onClick={handleCategorySelect}
                  className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-primary hover:text-primary/80 hover:bg-muted/50 transition-colors duration-150"
                >
                  <ChevronDown className="h-4 w-4" />
                  <span>{t.nav.viewAllCategories}</span>
                </Link>
              </div>
            </div>

            {/* Featured Products Column */}
            <div className="w-[320px] bg-muted/20">
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>{t.products?.featuredProducts || "Featured Products"}</span>
                </div>
              </div>
              
              <div className="p-3">
                {featuredLoading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                        <div className="h-14 w-14 rounded-md bg-muted shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-3/4 bg-muted rounded" />
                          <div className="h-3 w-1/2 bg-muted rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : displayedProducts.length > 0 ? (
                  <div className="space-y-1">
                    {displayedProducts.map((product, index) => {
                      const { name: productName } = getProductFields(product);
                      return (
                        <Link
                          key={product.id}
                          ref={(el) => {
                            if (el) featuredRefs.current.set(product.id, el);
                          }}
                          to={`/product/${product.slug}`}
                          onClick={() => handleFeaturedProductClick(product)}
                          onMouseEnter={() => setActiveFeaturedIndex(index)}
                          onMouseLeave={() => setActiveFeaturedIndex(-1)}
                          className={cn(
                            "flex items-center gap-3 p-2 rounded-lg transition-all duration-150",
                            "hover:bg-background group",
                            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset",
                            activeFeaturedIndex === index && "bg-background"
                          )}
                        >
                          <div className="h-14 w-14 rounded-md bg-background border border-border/50 overflow-hidden shrink-0">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={productName}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Package className="h-5 w-5 text-muted-foreground/50" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                              {productName}
                            </p>
                            {product.category?.name && (
                              <p className="text-xs text-muted-foreground truncate">
                                {product.category.name}
                              </p>
                            )}
                            <p className="text-xs text-primary font-semibold mt-0.5">
                              {formatPrice(product.price)}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No featured products yet
                  </div>
                )}
              </div>

              {/* View All Products Link */}
              <div className="border-t border-border/50 p-3">
                <Link
                  to="/products"
                  onClick={handleCategorySelect}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors duration-150"
                >
                  <span>{t.nav.products || "All Products"}</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MegaMenu;
