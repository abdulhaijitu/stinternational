import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface WishlistButtonProps {
  productId: string;
  variant?: "icon" | "button";
  size?: "sm" | "default";
  className?: string;
}

const WishlistButton = ({ productId, variant = "icon", size = "default", className }: WishlistButtonProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { isInWishlist, toggleWishlist, isToggling } = useWishlist();
  
  const inWishlist = isInWishlist(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error(t.products.addToWishlist);
      return;
    }
    
    toggleWishlist(productId);
  };

  if (variant === "button") {
    return (
      <Button
        variant={inWishlist ? "default" : "outline"}
        size="lg"
        onClick={handleClick}
        disabled={isToggling}
        className={className}
      >
        {isToggling ? (
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
        ) : (
          <Heart className={cn("h-5 w-5 mr-2", inWishlist && "fill-current")} />
        )}
        {inWishlist ? t.products.removeFromWishlist : t.products.addToWishlist}
      </Button>
    );
  }

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const padding = size === "sm" ? "p-1.5" : "p-2";

  return (
    <button
      onClick={handleClick}
      disabled={isToggling}
      className={cn(
        "rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-sm",
        "transition-all duration-200 hover:scale-110",
        padding,
        inWishlist ? "text-red-500" : "text-muted-foreground hover:text-red-500",
        className
      )}
      aria-label={inWishlist ? t.products.removeFromWishlist : t.products.addToWishlist}
    >
      {isToggling ? (
        <Loader2 className={cn(iconSize, "animate-spin")} />
      ) : (
        <Heart className={cn(iconSize, inWishlist && "fill-current")} />
      )}
    </button>
  );
};

export default WishlistButton;
