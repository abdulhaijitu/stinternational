import { Link } from "react-router-dom";
import { ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product, formatPrice } from "@/lib/products";
import { getCategoryBySlug, getAllCategories } from "@/lib/categories";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const category = getAllCategories().find(c => c.id === product.categoryId);

  return (
    <div className="group bg-card border border-border rounded-lg overflow-hidden card-hover">
      {/* Image */}
      <div className="relative aspect-square bg-muted/50 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.comparePrice && (
          <div className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-semibold px-2 py-1 rounded">
            {Math.round((1 - product.price / product.comparePrice) * 100)}% OFF
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <span className="text-muted-foreground font-medium">Out of Stock</span>
          </div>
        )}
        {/* Quick Actions */}
        <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
          <Button variant="secondary" size="sm" className="flex-1" asChild>
            <Link to={`/product/${product.slug}`}>
              <Eye className="h-4 w-4" />
              View
            </Link>
          </Button>
          <Button variant="accent" size="sm" className="flex-1" disabled={!product.inStock}>
            <ShoppingCart className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {category && (
          <Link
            to={`/category/${category.slug}`}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            {category.name}
          </Link>
        )}
        <h3 className="font-semibold text-foreground mt-1 mb-2 line-clamp-2 leading-snug">
          <Link to={`/product/${product.slug}`} className="hover:text-primary transition-colors">
            {product.name}
          </Link>
        </h3>
        {product.brand && (
          <p className="text-xs text-muted-foreground mb-2">Brand: {product.brand}</p>
        )}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-foreground">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
        <div className="mt-2">
          {product.inStock ? (
            <span className="text-xs text-success font-medium">In Stock</span>
          ) : (
            <span className="text-xs text-destructive font-medium">Out of Stock</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
