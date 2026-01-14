import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useCategoryHierarchy, ParentCategory, DBCategory } from "@/hooks/useCategories";
import { useBilingualContent } from "@/hooks/useBilingualContent";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryIcon } from "@/lib/categoryIcons";

interface StickyCategorySidebarProps {
  className?: string;
}

const StickyCategorySidebar = ({ className }: StickyCategorySidebarProps) => {
  const location = useLocation();
  const { parentCategories, isLoading } = useCategoryHierarchy();
  const { getCategoryFields } = useBilingualContent();
  const { t } = useLanguage();
  
  // Track expanded parent - only one at a time
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
      <CardHeader className="py-3.5 px-4 border-b border-border/50 bg-muted/30">
        <h3 className="text-sm font-semibold text-foreground">
          {t.nav.categories}
        </h3>
      </CardHeader>

      <ScrollArea className="max-h-[calc(100vh-180px)]">
        <CardContent className="p-0">
          <nav role="navigation" aria-label="Category navigation">
            {parentCategories.map((parent) => {
              const isExpanded = expandedParentId === parent.id;
              const hasChildren = parent.subCategories.length > 0;
              const isActive = isParentActive(parent);
              const hasActive = hasActiveChild(parent);
              const ParentIcon = getCategoryIcon(parent.icon_name);
              const parentName = getCategoryFields(parent).name;

              return (
                <div key={parent.id} className="border-b border-border/30 last:border-b-0">
                  {hasChildren ? (
                    <Collapsible open={isExpanded}>
                      <div className="flex items-center">
                        {/* Parent Category Link */}
                        <Link
                          to={`/category/${parent.slug}`}
                          className={cn(
                            "flex-1 flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150",
                            isActive
                              ? "bg-primary/10 text-primary font-semibold"
                              : hasActive
                                ? "text-foreground font-medium"
                                : "text-foreground hover:bg-muted/40"
                          )}
                        >
                          <ParentIcon className={cn(
                            "h-4 w-4 shrink-0",
                            isActive || hasActive ? "text-primary" : "text-muted-foreground"
                          )} />
                          <span className="flex-1 truncate">{parentName}</span>
                        </Link>

                        {/* Expand/Collapse Toggle */}
                        <CollapsibleTrigger asChild>
                          <button
                            onClick={(e) => toggleParent(parent.id, e)}
                            className={cn(
                              "p-3 hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-inset",
                              isExpanded && "bg-muted/30"
                            )}
                            aria-label={isExpanded ? `Collapse ${parentName}` : `Expand ${parentName}`}
                          >
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                                isExpanded && "rotate-180"
                              )}
                            />
                          </button>
                        </CollapsibleTrigger>
                      </div>

                      <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                        <div className="bg-muted/20 py-1">
                          {parent.subCategories.map((sub) => {
                            const isSubItemActive = isSubActive(parent, sub);
                            const SubIcon = getCategoryIcon(sub.icon_name);
                            const subName = getCategoryFields(sub).name;

                            return (
                              <Link
                                key={sub.id}
                                to={`/category/${parent.slug}/${sub.slug}`}
                                className={cn(
                                  "flex items-center gap-3 pl-11 pr-4 py-2.5 text-sm transition-colors duration-150",
                                  isSubItemActive
                                    ? "bg-primary/10 text-primary font-medium border-l-2 border-primary ml-0"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                                )}
                              >
                                <SubIcon className={cn(
                                  "h-3.5 w-3.5 shrink-0",
                                  isSubItemActive && "text-primary"
                                )} />
                                <span className="truncate">{subName}</span>
                                {isSubItemActive && (
                                  <ChevronRight className="h-3.5 w-3.5 ml-auto text-primary shrink-0" />
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    // Parent without children - simple link
                    <Link
                      to={`/category/${parent.slug}`}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150",
                        isActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-foreground hover:bg-muted/40"
                      )}
                    >
                      <ParentIcon className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )} />
                      <span className="flex-1 truncate">{parentName}</span>
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
                "flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-md transition-colors duration-150",
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
      </ScrollArea>
    </Card>
  );
};

export default StickyCategorySidebar;