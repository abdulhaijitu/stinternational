import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface WishlistButtonProps {
  productId: string;
  variant?: "icon" | "button";
  className?: string;
}

const WishlistButton = ({ productId, variant = "icon", className }: WishlistButtonProps) => {
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist, isToggling } = useWishlist();
  
  const inWishlist = isInWishlist(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error("উইশলিস্টে যোগ করতে লগইন করুন");
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
        {inWishlist ? "উইশলিস্টে আছে" : "উইশলিস্টে যোগ করুন"}
      </Button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isToggling}
      className={cn(
        "p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-sm",
        "transition-all duration-200 hover:scale-110",
        inWishlist ? "text-red-500" : "text-muted-foreground hover:text-red-500",
        className
      )}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      {isToggling ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Heart className={cn("h-5 w-5", inWishlist && "fill-current")} />
      )}
    </button>
  );
};

export default WishlistButton;
