import { DBProduct } from "@/hooks/useProducts";
import DBProductCard from "./DBProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";
import { useLanguage } from "@/contexts/LanguageContext";

interface RelatedProductsProps {
  products: DBProduct[];
  isLoading?: boolean;
  maxItems?: number;
  title?: string;
}

const RelatedProducts = ({ 
  products, 
  isLoading = false, 
  maxItems = 4,
  title 
}: RelatedProductsProps) => {
  const { t } = useLanguage();
  
  const displayProducts = products.slice(0, maxItems);
  const sectionTitle = title || t.products.relatedProducts;

  if (!isLoading && displayProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 border-t border-border">
      <div className="container-premium">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground">
            {sectionTitle}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t.products.youMayAlsoLike || "Products you may also be interested in"}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoading ? (
            // Skeleton loading state
            Array.from({ length: maxItems }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))
          ) : (
            displayProducts.map((product) => (
              <DBProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default RelatedProducts;