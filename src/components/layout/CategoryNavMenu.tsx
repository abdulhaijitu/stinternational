import { Link } from "react-router-dom";
import { ChevronRight, LayoutGrid } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useActiveCategoriesByGroup } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CategoryNavMenuProps {
  isCompact?: boolean;
  onCategoryClick?: () => void;
}

const CategoryNavMenu = ({ isCompact = false, onCategoryClick }: CategoryNavMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { groups, isLoading } = useActiveCategoriesByGroup();

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
    onCategoryClick?.();
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
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 font-medium rounded-lg border transition-all duration-200",
          "bg-background hover:bg-muted/50 border-border text-foreground",
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
                  <div className="py-1">
                    {groups.map((group, index) => (
                      <button
                        key={group.slug}
                        onMouseEnter={() => setActiveGroupIndex(index)}
                        onClick={() => setActiveGroupIndex(index)}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-3 text-left text-sm transition-all duration-150 relative",
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
                    className="flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium text-primary hover:text-primary/80 hover:bg-primary/5 rounded-md transition-colors duration-150"
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
                        <div className="py-2 px-2">
                          {groups[activeGroupIndex].categories.map((category) => (
                            <Link
                              key={category.id}
                              to={`/category/${category.slug}`}
                              onClick={handleCategorySelect}
                              className={cn(
                                "flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-all duration-150 group",
                                "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              )}
                            >
                              <span className="flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-muted-foreground/40 group-hover:bg-primary transition-colors duration-150" />
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
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors duration-150"
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
    </div>
  );
};

export default CategoryNavMenu;
