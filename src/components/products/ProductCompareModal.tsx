import { X, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DBProduct } from "@/hooks/useProducts";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBilingualContent } from "@/hooks/useBilingualContent";
import { formatPrice } from "@/lib/formatPrice";
import { cn } from "@/lib/utils";

interface ProductCompareModalProps {
  products: DBProduct[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemove: (productId: string) => void;
}

const ProductCompareModal = ({
  products,
  open,
  onOpenChange,
  onRemove,
}: ProductCompareModalProps) => {
  const { t } = useLanguage();
  const { getProductFields, getCategoryFields } = useBilingualContent();

  // Collect all unique specification keys
  const allSpecKeys = new Set<string>();
  products.forEach(product => {
    if (product.specifications && typeof product.specifications === 'object') {
      Object.keys(product.specifications as Record<string, unknown>).forEach(key => allSpecKeys.add(key));
    }
  });

  const specKeys = Array.from(allSpecKeys);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            {t.products.compareProducts}
            <span className="text-muted-foreground font-normal text-base">
              ({products.length} {t.products.items})
            </span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className="p-6 pt-4">
            {/* Product Headers */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `150px repeat(${products.length}, 1fr)` }}>
              <div /> {/* Empty corner cell */}
              {products.map((product) => {
                const fields = getProductFields(product);
                const categoryFields = product.category ? getCategoryFields(product.category) : null;
                
                return (
                  <div key={product.id} className="relative">
                    <button
                      onClick={() => onRemove(product.id)}
                      className={cn(
                        "absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full",
                        "bg-muted hover:bg-destructive text-muted-foreground hover:text-destructive-foreground",
                        "flex items-center justify-center transition-colors"
                      )}
                      aria-label={`Remove ${product.name}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    
                    <div className="text-center">
                      <div className="aspect-square w-full max-w-[160px] mx-auto mb-3 rounded-lg border border-border bg-muted/30 overflow-hidden">
                        <img
                          src={product.image_url || product.images?.[0] || "/placeholder.svg"}
                          alt={fields.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {categoryFields && (
                        <p className="text-xs text-muted-foreground mb-1">
                          {categoryFields.name}
                        </p>
                      )}
                      
                      <h3 className="font-medium text-sm line-clamp-2 mb-2">
                        {fields.name}
                      </h3>
                      
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link to={`/product/${product.slug}`}>
                          {t.products.view}
                          <ExternalLink className="h-3 w-3 ml-1.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Comparison Rows */}
            <div className="mt-6 border-t border-border">
              {/* Price Row */}
              <div 
                className="grid gap-4 py-3 border-b border-border"
                style={{ gridTemplateColumns: `150px repeat(${products.length}, 1fr)` }}
              >
                <div className="font-medium text-sm text-muted-foreground">
                  {t.products.price}
                </div>
                {products.map((product) => (
                  <div key={product.id} className="text-center">
                    <span className="font-bold text-lg">{formatPrice(product.price)}</span>
                    {product.compare_price && (
                      <span className="ml-2 text-sm text-muted-foreground line-through">
                        {formatPrice(product.compare_price)}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Availability Row */}
              <div 
                className="grid gap-4 py-3 border-b border-border"
                style={{ gridTemplateColumns: `150px repeat(${products.length}, 1fr)` }}
              >
                <div className="font-medium text-sm text-muted-foreground">
                  {t.products.availability}
                </div>
                {products.map((product) => (
                  <div key={product.id} className="text-center">
                    {product.in_stock ? (
                      <span className="text-sm text-green-600 dark:text-green-500 font-medium">
                        {t.products.inStock}
                      </span>
                    ) : (
                      <span className="text-sm text-destructive font-medium">
                        {t.products.outOfStock}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* SKU Row */}
              <div 
                className="grid gap-4 py-3 border-b border-border"
                style={{ gridTemplateColumns: `150px repeat(${products.length}, 1fr)` }}
              >
                <div className="font-medium text-sm text-muted-foreground">
                  SKU
                </div>
                {products.map((product) => (
                  <div key={product.id} className="text-center text-sm text-muted-foreground">
                    {product.sku || '—'}
                  </div>
                ))}
              </div>

              {/* Specification Rows */}
              {specKeys.map((key) => (
                <div 
                  key={key}
                  className="grid gap-4 py-3 border-b border-border"
                  style={{ gridTemplateColumns: `150px repeat(${products.length}, 1fr)` }}
                >
                  <div className="font-medium text-sm text-muted-foreground capitalize">
                    {key.replace(/_/g, ' ')}
                  </div>
                  {products.map((product) => {
                    const specs = product.specifications as Record<string, unknown> | null;
                    const value = specs?.[key];
                    
                    return (
                      <div key={product.id} className="text-center text-sm">
                        {value !== undefined && value !== null ? String(value) : '—'}
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Description Row */}
              <div 
                className="grid gap-4 py-3"
                style={{ gridTemplateColumns: `150px repeat(${products.length}, 1fr)` }}
              >
                <div className="font-medium text-sm text-muted-foreground">
                  {t.products.description}
                </div>
                {products.map((product) => {
                  const fields = getProductFields(product);
                  return (
                    <div key={product.id} className="text-sm text-muted-foreground line-clamp-4">
                      {fields.shortDescription || fields.description || '—'}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ProductCompareModal;
