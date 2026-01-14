import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, LayoutGrid, FolderOpen, Folder } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useActiveCategories, DBCategory } from "@/hooks/useCategories";
import { useBilingualContent } from "@/hooks/useBilingualContent";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface HierarchicalCategoryFilterProps {
  selectedCategories: string[];
  onCategoryToggle: (slug: string, parentSlug?: string) => void;
  className?: string;
}

interface ParentWithSubs extends DBCategory {
  subCategories: DBCategory[];
}

const HierarchicalCategoryFilter = ({
  selectedCategories,
  onCategoryToggle,
  className,
}: HierarchicalCategoryFilterProps) => {
  const { data: categories, isLoading } = useActiveCategories();
  const { getCategoryFields } = useBilingualContent();
  const { t } = useLanguage();
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());

  // Organize categories into hierarchy
  const hierarchy = useMemo(() => {
    if (!categories) return [];

    const parentMap: Record<string, ParentWithSubs> = {};
    const parentCategories: DBCategory[] = [];
    const subCategories: DBCategory[] = [];

    // First pass: separate parents and subs
    categories.forEach(cat => {
      if (!cat.parent_id) {
        parentCategories.push(cat);
        parentMap[cat.id] = { ...cat, subCategories: [] };
      } else {
        subCategories.push(cat);
      }
    });

    // Second pass: assign subs to parents
    subCategories.forEach(sub => {
      if (sub.parent_id && parentMap[sub.parent_id]) {
        parentMap[sub.parent_id].subCategories.push(sub);
      }
    });

    // Sort parents by display_order and sort their subs
    return Object.values(parentMap)
      .sort((a, b) => a.display_order - b.display_order)
      .map(parent => ({
        ...parent,
        subCategories: parent.subCategories.sort((a, b) => a.display_order - b.display_order),
      }));
  }, [categories]);

  // Auto-expand parents that have selected categories
  useEffect(() => {
    if (hierarchy.length > 0) {
      const parentsToExpand = new Set<string>();
      hierarchy.forEach(parent => {
        const hasSelectedChild = parent.subCategories.some(sub => 
          selectedCategories.includes(sub.slug)
        );
        if (hasSelectedChild || selectedCategories.includes(parent.slug)) {
          parentsToExpand.add(parent.id);
        }
      });
      // If nothing selected, expand first parent
      if (parentsToExpand.size === 0 && hierarchy.length > 0) {
        parentsToExpand.add(hierarchy[0].id);
      }
      setExpandedParents(parentsToExpand);
    }
  }, [hierarchy, selectedCategories]);

  const toggleParent = (parentId: string) => {
    setExpandedParents(prev => {
      const next = new Set(prev);
      if (next.has(parentId)) {
        next.delete(parentId);
      } else {
        next.add(parentId);
      }
      return next;
    });
  };

  const getCategoryName = (category: DBCategory) => {
    return getCategoryFields(category).name;
  };

  // Build category URL
  const getCategoryUrl = (category: DBCategory, parent?: DBCategory) => {
    if (parent) {
      return `/category/${parent.slug}/${category.slug}`;
    }
    return `/category/${category.slug}`;
  };

  if (isLoading) {
    return (
      <Card className={cn("border-border overflow-hidden", className)}>
        <CardHeader className="py-3 px-4 border-b bg-muted/40">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">{t.nav.categories}</h3>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-muted animate-pulse rounded" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-border overflow-hidden", className)}>
      <CardHeader className="py-3 px-4 border-b bg-muted/40">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">{t.nav.categories}</h3>
        </div>
      </CardHeader>
      <ScrollArea className="max-h-[500px]">
        <CardContent className="p-0">
          {hierarchy.map((parent) => {
            const isExpanded = expandedParents.has(parent.id);
            const ParentIcon = getCategoryIcon(parent.icon_name);
            const isParentSelected = selectedCategories.includes(parent.slug);
            const selectedSubCount = parent.subCategories.filter(sub => 
              selectedCategories.includes(sub.slug)
            ).length;

            return (
              <div key={parent.id} className="border-b border-border/50 last:border-b-0">
                {/* Parent Category */}
                <Collapsible open={isExpanded} onOpenChange={() => toggleParent(parent.id)}>
                  <div className="flex items-center">
                    <CollapsibleTrigger className="flex-1 flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors">
                      <ParentIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="flex-1 text-sm font-medium text-foreground">
                        {getCategoryName(parent)}
                      </span>
                      {selectedSubCount > 0 && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">
                          {selectedSubCount}
                        </Badge>
                      )}
                      {parent.subCategories.length > 0 ? (
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform duration-200",
                            isExpanded && "rotate-180"
                          )}
                        />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </CollapsibleTrigger>
                  </div>

                  <CollapsibleContent className="bg-muted/20">
                    {parent.subCategories.length > 0 ? (
                      <div className="py-1 px-2">
                        {parent.subCategories.map((sub) => {
                          const isSelected = selectedCategories.includes(sub.slug);
                          const SubIcon = getCategoryIcon(sub.icon_name);

                          return (
                            <button
                              key={sub.id}
                              onClick={() => onCategoryToggle(sub.slug, parent.slug)}
                              className={cn(
                                "w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm transition-all text-left",
                                isSelected
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                              )}
                            >
                              <Checkbox
                                checked={isSelected}
                                className="h-4 w-4 pointer-events-none"
                              />
                              <SubIcon className="h-3.5 w-3.5 shrink-0" />
                              <span className="flex-1 truncate">{getCategoryName(sub)}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-2 px-4">
                        <button
                          onClick={() => onCategoryToggle(parent.slug)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm transition-all text-left",
                            isParentSelected
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                          )}
                        >
                          <Checkbox
                            checked={isParentSelected}
                            className="h-4 w-4 pointer-events-none"
                          />
                          <span className="flex-1 truncate">
                            All {getCategoryName(parent)}
                          </span>
                        </button>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            );
          })}

          {/* View All Categories Link */}
          <div className="p-3 border-t">
            <Link
              to="/categories"
              className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
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

export default HierarchicalCategoryFilter;
