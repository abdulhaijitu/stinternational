import { Link } from "react-router-dom";
import { ChevronRight, LayoutGrid } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useActiveCategoriesByGroup } from "@/hooks/useCategories";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

  // Keyboard navigation for groups
  useKeyboardNavigation({
    isOpen,
    onClose: () => {
      setIsOpen(false);
      buttonRef.current?.focus();
    },
    itemCount: groups.length,
    activeIndex: activeGroupIndex,
    onActiveIndexChange: (index) => {
      setActiveGroupIndex(index);
      setActiveCategoryIndex(-1);
    },
    onSelect: (index) => {
      // When selecting a group, focus on first category
      if (groups[index]?.categories.length > 0) {
        setActiveCategoryIndex(0);
      }
    },
    orientation: "vertical",
  });

  // Handle category keyboard navigation
  useEffect(() => {
    if (!isOpen || activeCategoryIndex < 0) return;

    const handleCategoryKeyDown = (event: KeyboardEvent) => {
      const currentGroup = groups[activeGroupIndex];
      if (!currentGroup) return;

      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          if (activeCategoryIndex > 0) {
            setActiveCategoryIndex(activeCategoryIndex - 1);
          } else {
            // Go back to group navigation
            setActiveCategoryIndex(-1);
          }
          break;
        case "ArrowDown":
          event.preventDefault();
          if (activeCategoryIndex < currentGroup.categories.length - 1) {
            setActiveCategoryIndex(activeCategoryIndex + 1);
          }
          break;
        case "ArrowLeft":
          event.preventDefault();
          setActiveCategoryIndex(-1);
          break;
        case "ArrowRight":
        case "Enter":
        case " ":
          event.preventDefault();
          const category = currentGroup.categories[activeCategoryIndex];
          if (category) {
            const ref = categoryRefs.current.get(category.id);
            ref?.click();
          }
          break;
        case "Escape":
          event.preventDefault();
          setIsOpen(false);
          buttonRef.current?.focus();
          break;
      }
    };

    document.addEventListener("keydown", handleCategoryKeyDown);
    return () => document.removeEventListener("keydown", handleCategoryKeyDown);
  }, [isOpen, activeGroupIndex, activeCategoryIndex, groups]);

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
    }, 300); // 300ms delay before showing popover
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
      {/* Trigger Button - Clean, enterprise style */}
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
          "flex items-center gap-2 font-medium rounded-lg border transition-all duration-200",
          "bg-background hover:bg-muted/50 border-border text-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          isOpen && "bg-muted/50 border-primary/20",
          isCompact ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm"
        )}
      >
        <LayoutGrid className={cn(
          "text-muted-foreground",
          isCompact ? "h-3.5 w-3.5" : "h-4 w-4"
        )} />
        <span>Browse Categories</span>
        <ChevronRight className={cn(
          "text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-90",
          isCompact ? "h-3.5 w-3.5" : "h-4 w-4"
        )} />
      </button>

      {/* Dropdown Menu - Shadcn Card Style */}
      {isOpen && !isLoading && groups.length > 0 && (
        <div 
          className="absolute top-full left-0 mt-2 z-50 animate-fade-in"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          role="menu"
          aria-label="Category navigation"
        >
          <Card className="shadow-lg border-border/50 overflow-hidden w-[580px]">
            <div className="flex">
              {/* Left Panel - Category Groups */}
              <div className="w-[220px] bg-muted/20 border-r border-border/50">
                <CardHeader className="py-3 px-4 border-b border-border/50">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Categories
                  </h3>
                </CardHeader>
                <ScrollArea className="h-[320px]">
                  <div className="py-1" role="menubar" aria-label="Category groups">
                    {groups.map((group, index) => (
                      <button
                        key={group.slug}
                        onMouseEnter={() => {
                          setActiveGroupIndex(index);
                          setActiveCategoryIndex(-1);
                        }}
                        onClick={() => {
                          setActiveGroupIndex(index);
                          setActiveCategoryIndex(-1);
                        }}
                        onFocus={() => setActiveGroupIndex(index)}
                        role="menuitem"
                        tabIndex={activeGroupIndex === index && activeCategoryIndex < 0 ? 0 : -1}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-3 text-left text-sm transition-all duration-150 relative",
                          "focus:outline-none focus:bg-background",
                          activeGroupIndex === index
                            ? "bg-background text-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                        )}
                      >
                        {/* Active indicator bar */}
                        <span className={cn(
                          "absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-primary transition-opacity duration-150",
                          activeGroupIndex === index ? "opacity-100" : "opacity-0"
                        )} />
                        <span className="truncate">{group.name}</span>
                        <ChevronRight className={cn(
                          "h-4 w-4 shrink-0 transition-colors duration-150",
                          activeGroupIndex === index ? "text-primary" : "text-muted-foreground/50"
                        )} />
                      </button>
                    ))}
                  </div>
                </ScrollArea>
                
                {/* View All Link */}
                <div className="border-t border-border/50 p-3">
                  <Link
                    to="/categories"
                    onClick={handleCategorySelect}
                    className="flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium text-primary hover:text-primary/80 hover:bg-primary/5 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    View All Categories
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Right Panel - Subcategories */}
              <div className="flex-1 bg-background">
                {groups[activeGroupIndex] && (
                  <>
                    <CardHeader className="py-3 px-5 border-b border-border/50">
                      <h3 className="text-sm font-semibold text-foreground">
                        {groups[activeGroupIndex].name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {groups[activeGroupIndex].categories.length} categories
                      </p>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                      <ScrollArea className="h-[280px]">
                        <div className="py-2 px-2" role="menu" aria-label={`${groups[activeGroupIndex].name} subcategories`}>
                          {groups[activeGroupIndex].categories.map((category, catIndex) => (
                            <Link
                              key={category.id}
                              ref={(el) => {
                                if (el) categoryRefs.current.set(category.id, el);
                              }}
                              to={`/category/${category.slug}`}
                              onClick={handleCategorySelect}
                              onMouseEnter={(e) => handleCategoryHover({ ...category }, e)}
                              onMouseLeave={handleCategoryLeave}
                              role="menuitem"
                              tabIndex={activeCategoryIndex === catIndex ? 0 : -1}
                              className={cn(
                                "flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-all duration-150 group",
                                "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                                "focus:outline-none focus:bg-muted/50 focus:text-foreground",
                                activeCategoryIndex === catIndex && "bg-muted/50 text-foreground"
                              )}
                            >
                              <span className="flex items-center gap-2">
                                <span className={cn(
                                  "w-1 h-1 rounded-full transition-colors duration-150",
                                  activeCategoryIndex === catIndex ? "bg-primary" : "bg-muted-foreground/40 group-hover:bg-primary"
                                )} />
                                <span>{category.name}</span>
                              </span>
                              <ChevronRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 text-primary" />
                            </Link>
                          ))}
                        </div>
                      </ScrollArea>
                      
                      {/* Browse Group CTA */}
                      <Separator className="opacity-50" />
                      <div className="p-3">
                        <Link
                          to={`/categories#${groups[activeGroupIndex].slug}`}
                          onClick={handleCategorySelect}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors duration-150 focus:outline-none focus:text-primary"
                        >
                          Browse all in {groups[activeGroupIndex].name}
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </CardContent>
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Quick View Popover - Portal to avoid clipping */}
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
