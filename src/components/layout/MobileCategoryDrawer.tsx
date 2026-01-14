import { Link, useLocation } from "react-router-dom";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useCategoryHierarchy, ParentCategory, DBCategory } from "@/hooks/useCategories";
import { useBilingualContent } from "@/hooks/useBilingualContent";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCategoryIcon } from "@/lib/categoryIcons";

interface MobileCategoryDrawerProps {
  onCategoryClick?: () => void;
}

const MobileCategoryDrawer = ({ onCategoryClick }: MobileCategoryDrawerProps) => {
  const location = useLocation();
  const { parentCategories, isLoading } = useCategoryHierarchy();
  const { getCategoryFields } = useBilingualContent();
  const { t } = useLanguage();
  
  // Track expanded parent - only one at a time (accordion behavior)
  const [expandedParentId, setExpandedParentId] = useState<string | null>(null);

  // Parse current URL to determine active category
  const pathParts = location.pathname.split('/').filter(Boolean);
  const isOnCategoryPage = pathParts[0] === 'category';
  const currentParentSlug = isOnCategoryPage ? pathParts[1] : null;
  const currentSubSlug = isOnCategoryPage && pathParts.length > 2 ? pathParts[2] : null;

  // Auto-expand parent that contains active category
  useEffect(() => {
    if (parentCategories.length > 0 && currentParentSlug) {
      const activeParent = parentCategories.find(
        p => p.slug === currentParentSlug
      );
      if (activeParent) {
        setExpandedParentId(activeParent.id);
      }
    }
  }, [parentCategories, currentParentSlug]);

  const toggleParent = useCallback((parentId: string) => {
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

  if (isLoading) {
    return (
      <div className="py-4 px-4 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="py-2">
      {/* All Categories Link */}
      <Link 
        to="/categories" 
        onClick={onCategoryClick}
        className={cn(
          "flex items-center justify-between py-3.5 px-4 mx-2 mb-2 text-sm font-medium rounded-lg transition-colors duration-150",
          location.pathname === '/categories'
            ? "bg-primary/10 text-primary"
            : "bg-muted/50 hover:bg-muted"
        )}
      >
        <span>{t.nav.viewAllCategories}</span>
        <ChevronRight className="h-4 w-4" />
      </Link>

      <ScrollArea className="h-[calc(100vh-280px)]">
        <nav className="space-y-0.5 px-2" role="navigation" aria-label="Category navigation">
          {parentCategories?.map((parent) => {
            const isExpanded = expandedParentId === parent.id;
            const hasChildren = parent.subCategories && parent.subCategories.length > 0;
            const ParentIcon = getCategoryIcon(parent.icon_name);
            const parentName = getCategoryFields(parent).name;
            const isActive = isParentActive(parent);
            const hasActive = hasActiveChild(parent);
            
            // If parent has no sub-categories, show as simple link
            if (!hasChildren) {
              return (
                <Link
                  key={parent.id}
                  to={`/category/${parent.slug}`}
                  onClick={onCategoryClick}
                  className={cn(
                    "w-full flex items-center gap-3 py-3.5 px-4 rounded-lg transition-colors duration-150",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "hover:bg-muted/40 text-foreground"
                  )}
                >
                  <ParentIcon className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className="text-sm font-medium flex-1">{parentName}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              );
            }
            
            return (
              <Collapsible
                key={parent.id}
                open={isExpanded}
                onOpenChange={() => toggleParent(parent.id)}
              >
                <div className="flex items-center">
                  {/* Parent Category Link */}
                  <Link
                    to={`/category/${parent.slug}`}
                    onClick={onCategoryClick}
                    className={cn(
                      "flex-1 flex items-center gap-3 py-3.5 pl-4 pr-2 rounded-l-lg transition-colors duration-150",
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : hasActive
                          ? "bg-muted/50 text-foreground font-medium"
                          : "hover:bg-muted/40 text-foreground"
                    )}
                  >
                    <ParentIcon className={cn(
                      "h-4 w-4 shrink-0",
                      isActive || hasActive ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className="text-sm font-medium">{parentName}</span>
                  </Link>

                  {/* Expand/Collapse Toggle */}
                  <CollapsibleTrigger
                    className={cn(
                      "p-3.5 rounded-r-lg hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20",
                      isExpanded && "bg-muted/30",
                      hasActive && "bg-muted/30"
                    )}
                    aria-label={isExpanded ? `Collapse ${parentName}` : `Expand ${parentName}`}
                  >
                    <ChevronDown className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform duration-200",
                      isExpanded && "rotate-180"
                    )} />
                  </CollapsibleTrigger>
                </div>
                
                <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                  <div className="py-1 pl-4 pr-2 space-y-0.5">
                    {/* Sub-categories */}
                    {parent.subCategories?.map((sub) => {
                      const SubIcon = getCategoryIcon(sub.icon_name);
                      const subName = getCategoryFields(sub).name;
                      const isSubItemActive = isSubActive(parent, sub);

                      return (
                        <Link
                          key={sub.id}
                          to={`/category/${parent.slug}/${sub.slug}`}
                          onClick={onCategoryClick}
                          className={cn(
                            "flex items-center gap-3 py-3 pl-7 pr-3 rounded-md text-sm transition-colors duration-150",
                            isSubItemActive
                              ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          )}
                        >
                          <SubIcon className={cn(
                            "h-4 w-4 shrink-0",
                            isSubItemActive && "text-primary"
                          )} />
                          <span className="flex-1">{subName}</span>
                          {isSubItemActive && (
                            <ChevronRight className="h-4 w-4 text-primary" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Quick Links */}
      <div className="border-t border-border mt-4 pt-4 px-2 space-y-1">
        <Link 
          to="/request-quote" 
          onClick={onCategoryClick}
          className="flex items-center justify-between py-3 px-4 text-sm font-medium rounded-lg hover:bg-muted/40 transition-colors duration-150"
        >
          <span>{t.nav.requestQuote}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
        <Link 
          to="/about" 
          onClick={onCategoryClick}
          className="flex items-center justify-between py-3 px-4 text-sm text-muted-foreground rounded-lg hover:bg-muted/40 hover:text-foreground transition-colors duration-150"
        >
          <span>{t.nav.about}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
        <Link 
          to="/contact" 
          onClick={onCategoryClick}
          className="flex items-center justify-between py-3 px-4 text-sm text-muted-foreground rounded-lg hover:bg-muted/40 hover:text-foreground transition-colors duration-150"
        >
          <span>{t.nav.contact}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
};

export default MobileCategoryDrawer;
