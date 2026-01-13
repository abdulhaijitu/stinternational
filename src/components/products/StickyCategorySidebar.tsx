import { Link, useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronRight, LayoutGrid } from "lucide-react";
import { useState } from "react";
import { useActiveCategoriesByGroup, DBCategory } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";

interface StickyCategorySidebarProps {
  selectedCategories: string[];
  onCategoryToggle: (slug: string) => void;
}

const StickyCategorySidebar = ({
  selectedCategories,
  onCategoryToggle,
}: StickyCategorySidebarProps) => {
  const { groups, isLoading } = useActiveCategoriesByGroup();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    groups.map((g) => g.slug)
  );

  const toggleGroup = (slug: string) => {
    setExpandedGroups((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  if (isLoading) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="py-3 px-4 border-b border-border/50">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden sticky top-24 max-h-[calc(100vh-120px)]">
      <CardHeader className="py-3 px-4 border-b border-border/50 bg-muted/30">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Categories</h3>
        </div>
      </CardHeader>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <CardContent className="p-0">
          {groups.map((group) => (
            <Collapsible
              key={group.slug}
              open={expandedGroups.includes(group.slug)}
              onOpenChange={() => toggleGroup(group.slug)}
            >
              <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted/30 transition-colors border-b border-border/30">
                <span>{group.name}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    expandedGroups.includes(group.slug) && "rotate-180"
                  )}
                />
              </CollapsibleTrigger>

              <CollapsibleContent className="bg-muted/10">
                <div className="py-1 px-2">
                  {group.categories.map((category) => (
                    <CategoryItem
                      key={category.id}
                      category={category}
                      isSelected={selectedCategories.includes(category.slug)}
                      onToggle={() => onCategoryToggle(category.slug)}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}

          {/* View All Link */}
          <div className="p-3 border-t border-border/50">
            <Link
              to="/categories"
              className="flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium text-primary hover:text-primary/80 hover:bg-primary/5 rounded-md transition-colors duration-150"
            >
              Browse All Categories
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
};

interface CategoryItemProps {
  category: DBCategory;
  isSelected: boolean;
  onToggle: () => void;
}

const CategoryItem = ({ category, isSelected, onToggle }: CategoryItemProps) => {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-150 text-left",
        isSelected
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full shrink-0 transition-colors",
          isSelected ? "bg-primary" : "bg-muted-foreground/30"
        )}
      />
      <span className="truncate">{category.name}</span>
      {isSelected && (
        <ChevronRight className="h-3.5 w-3.5 ml-auto text-primary" />
      )}
    </button>
  );
};

export default StickyCategorySidebar;
