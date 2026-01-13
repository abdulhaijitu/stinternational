import { Link } from "react-router-dom";
import { ShoppingCart, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DBProduct } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/formatPrice";
import { toast } from "sonner";
import WishlistButton from "./WishlistButton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DBProductCardProps {
  product: DBProduct;
  onQuickView?: (product: DBProduct) => void;
}

const DBProductCard = ({ product, onQuickView }: DBProductCardProps) => {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image_url: product.image_url || (product.images?.[0] || null),
      sku: product.sku,
    });
    toast.success(`${product.name} কার্টে যোগ হয়েছে!`);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  const imageUrl = product.image_url || product.images?.[0] || "/placeholder.svg";

  return (
    <div className="group bg-card border border-border rounded-lg overflow-hidden card-hover">
      {/* Image */}
      <div className="relative aspect-square bg-muted/50 overflow-hidden">
        {/* Wishlist Button */}
        <div className="absolute top-3 right-3 z-10">
          <WishlistButton productId={product.id} />
        </div>
        
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.compare_price && (
          <div className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-semibold px-2 py-1 rounded">
            {Math.round((1 - product.price / product.compare_price) * 100)}% OFF
          </div>
        )}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <span className="text-muted-foreground font-medium">স্টক নেই</span>
          </div>
        )}
        {/* Quick Actions */}
        <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
          {onQuickView ? (
            <Button variant="secondary" size="sm" className="flex-1" onClick={handleQuickView}>
              <Eye className="h-4 w-4" />
              দেখুন
            </Button>
          ) : (
            <Button variant="secondary" size="sm" className="flex-1" asChild>
              <Link to={`/product/${product.slug}`}>
                <Eye className="h-4 w-4" />
                দেখুন
              </Link>
            </Button>
          )}
          <Button 
            variant="accent" 
            size="sm" 
            className="flex-1" 
            disabled={!product.in_stock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            কিনুন
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="shrink-0 bg-background/90"
                asChild
              >
                <Link to={`/request-quote?product=${encodeURIComponent(product.name)}`}>
                  <FileText className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>কোটেশন নিন</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {product.category && (
          <Link
            to={`/category/${product.category.slug}`}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            {product.category.name}
          </Link>
        )}
        <h3 className="font-semibold text-foreground mt-1 mb-2 line-clamp-2 leading-snug">
          <Link to={`/product/${product.slug}`} className="hover:text-primary transition-colors">
            {product.name}
          </Link>
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-foreground">
            {formatPrice(product.price)}
          </span>
          {product.compare_price && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.compare_price)}
            </span>
          )}
        </div>
        <div className="mt-2">
          {product.in_stock ? (
            <span className="text-xs text-green-600 font-medium">স্টকে আছে</span>
          ) : (
            <span className="text-xs text-destructive font-medium">স্টক নেই</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DBProductCard;
