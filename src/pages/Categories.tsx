import { Link } from "react-router-dom";
import { ArrowRight, Loader2, ChevronRight, FolderOpen } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useActiveCategories, DBCategory } from "@/hooks/useCategories";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { getCategoryHeroImage } from "@/lib/productFallbackImages";
import { useBilingualContent } from "@/hooks/useBilingualContent";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import heroDefault from "@/assets/fallbacks/hero-default.jpg";

interface ParentWithSubs extends DBCategory {
  subCategories: DBCategory[];
}

const Categories = () => {
  const { data: categories, isLoading, error } = useActiveCategories();
  const { getCategoryFields } = useBilingualContent();
  const { t, language } = useLanguage();
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());

  const fontClass = language === "bn" ? "font-siliguri" : "";

  // Organize categories into hierarchy
  const hierarchy = useMemo(() => {
    if (!categories) return [];

    const parentMap: Record<string, ParentWithSubs> = {};
    const subCategories: DBCategory[] = [];

    // First pass: identify parents and subs
    categories.forEach(cat => {
      if (!cat.parent_id) {
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

    // Sort and return
    return Object.values(parentMap)
      .sort((a, b) => a.display_order - b.display_order)
      .map(parent => ({
        ...parent,
        subCategories: parent.subCategories.sort((a, b) => a.display_order - b.display_order),
      }));
  }, [categories]);

  // Auto-expand all parents on initial load
  useMemo(() => {
    if (hierarchy.length > 0 && expandedParents.size === 0) {
      setExpandedParents(new Set(hierarchy.map(p => p.id)));
    }
  }, [hierarchy]);

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

  const getCategoryDescription = (category: DBCategory) => {
    return getCategoryFields(category).description;
  };

  return (
    <Layout>
      {/* Page Header with Hero Image */}
      <section className="relative border-b border-border overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroDefault}
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/70" />
        </div>
        
        <div className={`container-premium py-12 md:py-16 relative z-10 ${fontClass}`}>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {language === "bn" ? "পণ্য ক্যাটাগরি" : "Product Categories"}
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            {language === "bn" 
              ? "বৈজ্ঞানিক, শিল্প এবং শিক্ষামূলক যন্ত্রপাতির সম্পূর্ণ সংগ্রহ। প্রতিটি ক্যাটাগরিতে বিশ্বস্ত ব্র্যান্ডের প্রিমিয়াম পণ্য রয়েছে।"
              : "Complete collection of scientific, industrial, and educational equipment. Each category features premium products from trusted brands."}
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 md:py-16">
        <div className={`container-premium ${fontClass}`}>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-16 text-muted-foreground">
              {language === "bn" ? "ক্যাটাগরি লোড করতে সমস্যা হয়েছে" : "Failed to load categories"}
            </div>
          ) : hierarchy.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              {language === "bn" ? "কোনো ক্যাটাগরি নেই" : "No categories found"}
            </div>
          ) : (
            <div className="space-y-8">
              {hierarchy.map((parent) => {
                const ParentIcon = getCategoryIcon(parent.icon_name);
                const isExpanded = expandedParents.has(parent.id);
                const hasSubCategories = parent.subCategories.length > 0;

                return (
                  <div key={parent.id} className="bg-card border border-border rounded-lg overflow-hidden">
                    {/* Parent Category Header with Background */}
                    <Collapsible open={isExpanded} onOpenChange={() => toggleParent(parent.id)}>
                      <CollapsibleTrigger className="w-full">
                        <div className="relative flex items-center justify-between p-6 hover:bg-muted/50 transition-colors cursor-pointer overflow-hidden">
                          {/* Subtle background image */}
                          <div className="absolute inset-0 z-0 opacity-10">
                            <img 
                              src={getCategoryHeroImage(parent.slug, parent.name, parent.parent_group)} 
                              alt=""
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className="relative z-10 flex items-center gap-4">
                            <div className="w-14 h-14 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                              <ParentIcon className="h-7 w-7" />
                            </div>
                            <div className="text-left">
                              <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-xl font-bold">{getCategoryName(parent)}</h2>
                                <Badge variant="outline" className="text-xs">
                                  <FolderOpen className="h-3 w-3 mr-1" />
                                  {language === "bn" ? "প্যারেন্ট" : "Parent"}
                                </Badge>
                              </div>
                              {getCategoryDescription(parent) && (
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {getCategoryDescription(parent)}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                {parent.subCategories.length} {language === "bn" ? "সাব-ক্যাটাগরি" : "sub-categories"}
                              </p>
                            </div>
                          </div>
                          <div className="relative z-10 flex items-center gap-3">
                            {!hasSubCategories && (
                              <Link
                                to={`/category/${parent.slug}`}
                                onClick={(e) => e.stopPropagation()}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                              >
                                {language === "bn" ? "পণ্য দেখুন" : "View Products"}
                              </Link>
                            )}
                            <ChevronRight className={cn(
                              "h-5 w-5 text-muted-foreground transition-transform duration-200",
                              isExpanded && "rotate-90"
                            )} />
                          </div>
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        {hasSubCategories && (
                          <div className="border-t border-border bg-muted/20 p-6">
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                              {parent.subCategories.map((sub) => {
                                const SubIcon = getCategoryIcon(sub.icon_name);
                                return (
                                  <Link
                                    key={sub.id}
                                    to={`/category/${parent.slug}/${sub.slug}`}
                                    className="group bg-background border border-border rounded-lg p-4 card-hover"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                                        <SubIcon className="h-5 w-5" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                                          {getCategoryName(sub)}
                                        </h3>
                                        {getCategoryDescription(sub) && (
                                          <p className="text-xs text-muted-foreground line-clamp-2">
                                            {getCategoryDescription(sub)}
                                          </p>
                                        )}
                                      </div>
                                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Categories;
