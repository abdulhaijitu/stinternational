import { X, GitCompare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DBProduct } from "@/hooks/useProducts";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { getProductImageWithFallback } from "@/lib/productFallbackImages";

interface ProductCompareBarProps {
  products: DBProduct[];
  onRemove: (productId: string) => void;
  onClear: () => void;
  onCompare: () => void;
  maxItems: number;
}

const ProductCompareBar = ({
  products,
  onRemove,
  onClear,
  onCompare,
  maxItems,
}: ProductCompareBarProps) => {
  const { t } = useLanguage();

  if (products.length === 0) return null;

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-40",
      "bg-background/95 backdrop-blur-md border-t border-border",
      "shadow-lg shadow-foreground/5",
      "animate-fade-in"
    )}>
      <div className="container-premium py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Product Thumbnails */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground shrink-0">
              <GitCompare className="h-4 w-4" />
              <span className="hidden sm:inline">{t.products.compare}</span>
              <span className="text-foreground">{products.length}/{maxItems}</span>
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="relative group shrink-0"
                >
                  <div className="w-12 h-12 rounded-md border border-border bg-muted/30 overflow-hidden">
                    <img
                      src={getProductImageWithFallback(
                        product.image_url,
                        product.images,
                        product.category?.slug,
                        product.category?.name
                      )}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => onRemove(product.id)}
                    className={cn(
                      "absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full",
                      "bg-destructive text-destructive-foreground",
                      "flex items-center justify-center",
                      "opacity-0 group-hover:opacity-100 transition-opacity",
                      "hover:scale-110 active:scale-95"
                    )}
                    aria-label={`Remove ${product.name} from compare`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              
              {/* Empty slots */}
              {Array.from({ length: maxItems - products.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="w-12 h-12 rounded-md border border-dashed border-border bg-muted/10 shrink-0"
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline ml-1.5">{t.common.clear}</span>
            </Button>
            
            <Button
              size="sm"
              onClick={onCompare}
              disabled={products.length < 2}
              className="active:scale-[0.97] transition-transform"
            >
              <GitCompare className="h-4 w-4 mr-1.5" />
              {t.products.compareNow}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCompareBar;
