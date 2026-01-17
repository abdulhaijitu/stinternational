import { useEffect, useRef } from "react";

/**
 * Preloads images for faster rendering when they appear on screen
 * Particularly useful for above-the-fold product images
 */
export const useImagePreload = (imageUrls: (string | null | undefined)[]) => {
  const preloadedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const validUrls = imageUrls.filter((url): url is string => 
      Boolean(url) && typeof url === "string" && url.trim().length > 0
    );

    validUrls.forEach((url) => {
      // Skip if already preloaded
      if (preloadedRef.current.has(url)) return;

      // Use link preload for high priority images
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = url;
      document.head.appendChild(link);

      preloadedRef.current.add(url);

      // Cleanup on unmount
      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    });
  }, [imageUrls]);
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
  if (!url) return;
  
  const img = new Image();
  img.src = url;
};

export default useImagePreload;
