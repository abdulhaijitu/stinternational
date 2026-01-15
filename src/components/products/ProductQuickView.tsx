import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, ExternalLink, Minus, Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DBProduct } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/formatPrice";
import { toast } from "sonner";
import { getProductImageWithFallback } from "@/lib/productFallbackImages";

interface ProductQuickViewProps {
  product: DBProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductQuickView = ({ product, open, onOpenChange }: ProductQuickViewProps) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) return null;

  const fallbackImage = getProductImageWithFallback(
    product.image_url,
    product.images,
    product.category?.slug,
    product.category?.name
  );
  
  const images = product.images?.length > 0 
    ? product.images.filter(img => img && !img.includes('placeholder'))
    : product.image_url && !product.image_url.includes('placeholder')
      ? [product.image_url] 
      : [fallbackImage];

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image_url: product.image_url || (product.images?.[0] || null),
        sku: product.sku,
      });
    }
    toast.success(`${quantity}টি ${product.name} কার্টে যোগ হয়েছে!`);
    setQuantity(1);
    onOpenChange(false);
  };

  const discount = product.compare_price 
    ? Math.round((1 - product.price / product.compare_price) * 100) 
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="relative bg-muted/50 p-6">
            <div className="aspect-square relative rounded-lg overflow-hidden bg-background">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {discount > 0 && (
                <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
                  {discount}% OFF
                </Badge>
              )}
              {!product.in_stock && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <span className="text-muted-foreground font-medium text-lg">স্টক নেই</span>
                </div>
              )}
            </div>
            
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-4 justify-center">
                {images.slice(0, 5).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                      selectedImage === idx ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="p-6 flex flex-col">
            {product.category && (
              <Link
                to={`/category/${product.category.slug}`}
                onClick={() => onOpenChange(false)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors mb-2"
              >
                {product.category.name}
              </Link>
            )}

            <h2 className="text-2xl font-bold text-foreground mb-3">{product.name}</h2>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.compare_price && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.compare_price)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-4">
              {product.in_stock ? (
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  স্টকে আছে
                </Badge>
              ) : (
                <Badge variant="destructive">স্টক নেই</Badge>
              )}
              {product.sku && (
                <span className="ml-3 text-sm text-muted-foreground">SKU: {product.sku}</span>
              )}
            </div>

            {/* Description */}
            {product.short_description && (
              <p className="text-muted-foreground mb-6 line-clamp-3">
                {product.short_description}
              </p>
            )}

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-2 text-sm">বৈশিষ্ট্য:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {product.features.slice(0, 4).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="mt-auto space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">পরিমাণ:</span>
                <div className="flex items-center gap-2 border border-border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={!product.in_stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  size="lg"
                  disabled={!product.in_stock}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  কার্টে যোগ করুন
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  onClick={() => onOpenChange(false)}
                >
                  <Link to={`/product/${product.slug}`}>
                    <ExternalLink className="h-5 w-5 mr-2" />
                    বিস্তারিত
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductQuickView;
