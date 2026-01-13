import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";

interface ProductImageGalleryProps {
  images: string[];
  mainImage?: string | null;
  productName: string;
}

const ProductImageGallery = ({ images, mainImage, productName }: ProductImageGalleryProps) => {
  // Combine main image with gallery images, removing duplicates
  const allImages = mainImage 
    ? [mainImage, ...images.filter(img => img !== mainImage)]
    : images.length > 0 
      ? images 
      : ["/placeholder.svg"];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const currentImage = allImages[selectedIndex] || "/placeholder.svg";

  const goToPrevious = useCallback(() => {
    setSelectedIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    setIsImageLoaded(false);
  }, [allImages.length]);

  const goToNext = useCallback(() => {
    setSelectedIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    setIsImageLoaded(false);
  }, [allImages.length]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") goToPrevious();
    if (e.key === "ArrowRight") goToNext();
  }, [goToPrevious, goToNext]);

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
    setIsImageLoaded(false);
  };

  return (
    <div className="space-y-4">
      {/* Main Image Container */}
      <div 
        className={cn(
          "relative aspect-square bg-muted/30 rounded-xl border border-border overflow-hidden",
          "cursor-zoom-in group"
        )}
        onClick={() => setLightboxOpen(true)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label="Open image gallery"
      >
        {/* Main Image */}
        <img
          src={currentImage}
          alt={productName}
          className={cn(
            "w-full h-full object-contain p-4",
            "transition-all duration-300 ease-out",
            "group-hover:scale-[1.02]",
            !isImageLoaded && "opacity-0"
          )}
          onLoad={() => setIsImageLoaded(true)}
        />
        
        {/* Loading placeholder */}
        {!isImageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {/* Zoom Indicator */}
        <div className={cn(
          "absolute top-4 right-4 p-2.5 rounded-full",
          "bg-foreground/10 backdrop-blur-sm",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        )}>
          <ZoomIn className="h-4 w-4 text-foreground" />
        </div>

        {/* Navigation Arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2",
                "p-2 rounded-full bg-background/90 border border-border shadow-sm",
                "opacity-0 group-hover:opacity-100 transition-all duration-200",
                "hover:bg-background hover:scale-105 active:scale-95"
              )}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2",
                "p-2 rounded-full bg-background/90 border border-border shadow-sm",
                "opacity-0 group-hover:opacity-100 transition-all duration-200",
                "hover:bg-background hover:scale-105 active:scale-95"
              )}
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Image Counter Badge */}
        {allImages.length > 1 && (
          <div className={cn(
            "absolute bottom-4 left-1/2 -translate-x-1/2",
            "px-3 py-1.5 rounded-full text-xs font-medium",
            "bg-foreground/10 backdrop-blur-sm text-foreground"
          )}>
            {selectedIndex + 1} / {allImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails Row */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {allImages.map((image, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={cn(
                "shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg border-2 overflow-hidden",
                "transition-all duration-200",
                "hover:border-primary/50",
                selectedIndex === index
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border bg-muted/30"
              )}
              aria-label={`View image ${index + 1}`}
              aria-current={selectedIndex === index ? "true" : "false"}
            >
              <img
                src={image}
                alt={`${productName} - Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl p-0 bg-background/95 backdrop-blur-xl border-border">
          <VisuallyHidden>
            <DialogTitle>Product Image Gallery - {productName}</DialogTitle>
          </VisuallyHidden>
          
          <div 
            className="relative p-4 md:p-8"
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            {/* Lightbox Image */}
            <img
              src={currentImage}
              alt={productName}
              className="w-full h-auto max-h-[75vh] object-contain rounded-lg"
            />
            
            {/* Lightbox Navigation */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className={cn(
                    "absolute left-6 top-1/2 -translate-y-1/2",
                    "p-3 rounded-full bg-background border border-border shadow-lg",
                    "hover:bg-muted hover:scale-105 active:scale-95 transition-all duration-150"
                  )}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={goToNext}
                  className={cn(
                    "absolute right-6 top-1/2 -translate-y-1/2",
                    "p-3 rounded-full bg-background border border-border shadow-lg",
                    "hover:bg-muted hover:scale-105 active:scale-95 transition-all duration-150"
                  )}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Lightbox Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    className={cn(
                      "w-14 h-14 rounded-lg border-2 overflow-hidden transition-all duration-150",
                      selectedIndex === index
                        ? "border-primary ring-2 ring-primary/30 scale-105"
                        : "border-border opacity-60 hover:opacity-100 hover:border-primary/50"
                    )}
                  >
                    <img
                      src={image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductImageGallery;