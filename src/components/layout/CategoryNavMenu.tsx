import { Link } from "react-router-dom";
import { ChevronRight, ChevronDown, Menu } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useActiveCategoriesByGroup, DBCategory } from "@/hooks/useCategories";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import CategoryQuickViewPopover from "@/components/products/CategoryQuickViewPopover";

interface CategoryNavMenuProps {
  isCompact?: boolean;
  onCategoryClick?: () => void;
}

const CategoryNavMenu = ({ isCompact = false, onCategoryClick }: CategoryNavMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(-1);
  const [hoveredCategory, setHoveredCategory] = useState<{ slug: string; name: string } | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const popoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const categoryRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  
  const { groups, isLoading } = useActiveCategoriesByGroup();

  // Flatten all categories for the simple list view
  const allCategories = groups.flatMap(g => g.categories);

  // Keyboard navigation for groups
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
        setHoveredCategory(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (popoverTimeoutRef.current) clearTimeout(popoverTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setHoveredCategory(null);
    }, 150);
  };

  const handleCategorySelect = () => {
    setIsOpen(false);
    setHoveredCategory(null);
    onCategoryClick?.();
  };

  const handleCategoryHover = useCallback((category: { slug: string; name: string; id: string }, event: React.MouseEvent) => {
    if (popoverTimeoutRef.current) clearTimeout(popoverTimeoutRef.current);
    
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setPopoverPosition({
      top: rect.top,
      left: rect.right + 8,
    });
    
    popoverTimeoutRef.current = setTimeout(() => {
      setHoveredCategory({ slug: category.slug, name: category.name });
    }, 300);
  }, []);

  const handleCategoryLeave = useCallback(() => {
    if (popoverTimeoutRef.current) clearTimeout(popoverTimeoutRef.current);
    popoverTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 150);
  }, []);

  const handlePopoverEnter = () => {
    if (popoverTimeoutRef.current) clearTimeout(popoverTimeoutRef.current);
  };

  const handlePopoverLeave = () => {
    popoverTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 150);
  };

  return (
    <div 
      className="relative" 
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button - Solid Primary Style */}
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
        <Menu className={cn(
          isCompact ? "h-4 w-4" : "h-5 w-5"
        )} />
        <span className="uppercase tracking-wide">Browse Categories</span>
        <ChevronDown className={cn(
          "transition-transform duration-200 ml-1",
          isOpen && "rotate-180",
          isCompact ? "h-4 w-4" : "h-5 w-5"
        )} />
      </button>

      {/* Dropdown Menu - Clean List Style */}
      {isOpen && !isLoading && allCategories.length > 0 && (
        <div 
          className="absolute top-full left-0 mt-1 z-50 animate-fade-in"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          role="menu"
          aria-label="Category navigation"
        >
          <div className="bg-background border border-border rounded-lg shadow-xl overflow-hidden w-[280px]">
            <ScrollArea className="max-h-[420px]">
              <div className="py-1">
                {allCategories.map((category, index) => (
                  <Link
                    key={category.id}
                    ref={(el) => {
                      if (el) categoryRefs.current.set(category.id, el);
                    }}
                    to={`/category/${category.slug}`}
                    onClick={handleCategorySelect}
                    onMouseEnter={(e) => {
                      setActiveCategoryIndex(index);
                      handleCategoryHover(category, e);
                    }}
                    onMouseLeave={handleCategoryLeave}
                    role="menuitem"
                    tabIndex={activeCategoryIndex === index ? 0 : -1}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 text-sm transition-all duration-150",
                      "border-b border-border/50 last:border-b-0",
                      "focus:outline-none",
                      activeCategoryIndex === index
                        ? "bg-muted/60 text-foreground"
                        : "text-foreground/80 hover:bg-muted/40 hover:text-foreground"
                    )}
                  >
                    <span className="font-medium">{category.name}</span>
                    <ChevronRight className={cn(
                      "h-4 w-4 transition-all duration-150",
                      activeCategoryIndex === index 
                        ? "text-primary opacity-100" 
                        : "text-muted-foreground/50 opacity-70"
                    )} />
                  </Link>
                ))}
              </div>
            </ScrollArea>
            
            {/* View More Footer */}
            <div className="border-t border-border bg-muted/30">
              <Link
                to="/categories"
                onClick={handleCategorySelect}
                className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-primary hover:text-primary/80 hover:bg-muted/50 transition-colors duration-150"
              >
                <ChevronDown className="h-4 w-4" />
                <span>View All Categories</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Popover */}
      {hoveredCategory && isOpen && (
        <div
          className="fixed z-[60]"
          style={{ top: popoverPosition.top, left: popoverPosition.left }}
          onMouseEnter={handlePopoverEnter}
          onMouseLeave={handlePopoverLeave}
        >
          <CategoryQuickViewPopover
            categorySlug={hoveredCategory.slug}
            categoryName={hoveredCategory.name}
            onProductClick={handleCategorySelect}
          />
        </div>
      )}
    </div>
  );
};

export default CategoryNavMenu;
