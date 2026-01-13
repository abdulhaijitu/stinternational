import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "recently_viewed_products";
const MAX_ITEMS = 10;

export interface RecentlyViewedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_price: number | null;
  image_url: string | null;
  in_stock: boolean;
  category?: { name: string; slug: string } | null;
  viewedAt: number;
}

export const useRecentlyViewed = () => {
  const [products, setProducts] = useState<RecentlyViewedProduct[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RecentlyViewedProduct[];
        // Sort by viewedAt descending
        parsed.sort((a, b) => b.viewedAt - a.viewedAt);
        setProducts(parsed);
      }
    } catch (error) {
      console.error("Error loading recently viewed products:", error);
    }
  }, []);

  const addProduct = useCallback((product: Omit<RecentlyViewedProduct, "viewedAt">) => {
    setProducts((prev) => {
      // Remove if already exists
      const filtered = prev.filter((p) => p.id !== product.id);
      
      // Add to beginning with timestamp
      const updated = [
        { ...product, viewedAt: Date.now() },
        ...filtered,
      ].slice(0, MAX_ITEMS);

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Error saving recently viewed products:", error);
      }

      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setProducts([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing recently viewed products:", error);
    }
  }, []);

  const getProductsExcluding = useCallback(
    (excludeId?: string) => {
      return products.filter((p) => p.id !== excludeId);
    },
    [products]
  );

  return {
    products,
    addProduct,
    clearHistory,
    getProductsExcluding,
  };
};
