import { Link } from "react-router-dom";
import { ChevronRight, ChevronDown, FolderOpen } from "lucide-react";
import { useState } from "react";
import { useCategoryHierarchy } from "@/hooks/useCategories";
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
  const [openParents, setOpenParents] = useState<string[]>([]);
  const { parentCategories, isLoading } = useCategoryHierarchy();
  const { getCategoryFields } = useBilingualContent();
  const { t } = useLanguage();

  const toggleParent = (id: string) => {
    setOpenParents(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  if (isLoading) {
    return (
      <div className="py-4 px-4 space-y-3">
        {[1, 2, 3].map((i) => (
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
        className="flex items-center justify-between py-3.5 px-4 mx-2 mb-2 text-sm font-medium bg-muted/50 rounded-lg hover:bg-muted transition-colors duration-150"
      >
        <span>{t.nav.viewAllCategories}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Link>

      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="space-y-1 px-2">
          {parentCategories?.map((parent) => {
            const isOpen = openParents.includes(parent.id);
            const hasChildren = parent.subCategories && parent.subCategories.length > 0;
            const ParentIcon = getCategoryIcon(parent.icon_name);
            const { name: parentName } = getCategoryFields(parent);
            
            // If parent has no sub-categories, just show as link
            if (!hasChildren) {
              return (
                <Link
                  key={parent.id}
                  to={`/category/${parent.slug}`}
                  onClick={onCategoryClick}
                  className={cn(
                    "w-full flex items-center gap-3 py-3.5 px-4 rounded-lg transition-all duration-150",
                    "hover:bg-muted/40 text-foreground"
                  )}
                >
                  <ParentIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm font-medium">{parentName}</span>
                </Link>
              );
            }
            
            return (
              <Collapsible
                key={parent.id}
                open={isOpen}
                onOpenChange={() => toggleParent(parent.id)}
              >
                <CollapsibleTrigger className={cn(
                  "w-full flex items-center justify-between py-3.5 px-4 rounded-lg transition-all duration-150",
                  isOpen 
                    ? "bg-muted/70 text-foreground" 
                    : "hover:bg-muted/40 text-foreground"
                )}>
                  <div className="flex items-center gap-3">
                    <ParentIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm font-medium">{parentName}</span>
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    isOpen && "rotate-180"
                  )} />
                </CollapsibleTrigger>
                
                <CollapsibleContent className="animate-accordion-down">
                  <div className="py-1 pl-4 pr-2 space-y-0.5">
                    {/* View all in parent category link */}
                    <Link
                      to={`/category/${parent.slug}`}
                      onClick={onCategoryClick}
                      className={cn(
                        "flex items-center gap-3 py-3 px-3 rounded-md text-sm transition-colors duration-150",
                        "text-primary hover:text-primary hover:bg-primary/5 font-medium"
                      )}
                    >
                      <FolderOpen className="h-4 w-4 shrink-0" />
                      <span>{t.common.viewAll} {parentName}</span>
                    </Link>
                    
                    {/* Sub-categories */}
                    {parent.subCategories?.map((subCategory) => {
                      const SubIcon = getCategoryIcon(subCategory.icon_name);
                      const { name: subName } = getCategoryFields(subCategory);
                      return (
                        <Link
                          key={subCategory.id}
                          to={`/category/${parent.slug}/${subCategory.slug}`}
                          onClick={onCategoryClick}
                          className={cn(
                            "flex items-center gap-3 py-3 px-3 rounded-md text-sm transition-colors duration-150",
                            "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          )}
                        >
                          <SubIcon className="h-4 w-4 shrink-0" />
                          <span>{subName}</span>
                        </Link>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
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
