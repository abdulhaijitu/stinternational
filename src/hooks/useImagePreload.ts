import { useEffect, useRef } from "react";

// Global cache to track preloaded images across component instances
const preloadedImages = new Set<string>();

/**
 * Preloads images for faster rendering when they appear on screen
 * Particularly useful for above-the-fold product images
 */
export const useImagePreload = (imageUrls: (string | null | undefined)[]) => {
  const linksRef = useRef<HTMLLinkElement[]>([]);

  useEffect(() => {
    const validUrls = imageUrls.filter((url): url is string => 
      Boolean(url) && typeof url === "string" && url.trim().length > 0
    );

    // Track new links added in this effect
    const newLinks: HTMLLinkElement[] = [];

    validUrls.forEach((url) => {
      // Skip if already preloaded globally
      if (preloadedImages.has(url)) return;

      // Use link preload for high priority images
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = url;
      document.head.appendChild(link);

      preloadedImages.add(url);
      newLinks.push(link);
    });

    linksRef.current = newLinks;

    // Cleanup on unmount
    return () => {
      linksRef.current.forEach((link) => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });
      linksRef.current = [];
    };
  }, [imageUrls.join(",")]); // Use stable dependency
};

/**
 * Preloads product images - extracts image URLs from products
 * Preloads the first N products' images for above-the-fold rendering
 */
export const useProductImagePreload = <T extends { 
  image_url?: string | null; 
  images?: string[] | null 
}>(
  products: T[] | undefined,
  count: number = 4 // Default to first 4 products (above-the-fold on most screens)
) => {
  const imageUrls = products?.slice(0, count).map((product) => 
    product.image_url || product.images?.[0]
  ) ?? [];

  useImagePreload(imageUrls);
};

/**
 * Preloads a single high-priority image (e.g., hero images)
 */
export const preloadImage = (url: string | null | undefined): void => {
  if (!url || preloadedImages.has(url)) return;
  
  const img = new Image();
  img.src = url;
  preloadedImages.add(url);
};

/**
 * Preloads critical images immediately (for hero/LCP images)
 */
export const preloadCriticalImage = (url: string | null | undefined): void => {
  if (!url || preloadedImages.has(url)) return;
  
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = url;
  link.fetchPriority = "high";
  document.head.appendChild(link);
  preloadedImages.add(url);
};

export default useImagePreload;
