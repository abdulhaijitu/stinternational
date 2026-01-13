import { useState, useCallback, useMemo } from 'react';
import { DBProduct } from '@/hooks/useProducts';

const MAX_COMPARE_ITEMS = 3;

export interface CompareState {
  products: DBProduct[];
  isOpen: boolean;
}

export const useProductCompare = () => {
  const [compareProducts, setCompareProducts] = useState<DBProduct[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const addToCompare = useCallback((product: DBProduct) => {
    setCompareProducts(prev => {
      // Don't add if already in compare
      if (prev.some(p => p.id === product.id)) {
        return prev;
      }
      // Don't add if at max
      if (prev.length >= MAX_COMPARE_ITEMS) {
        return prev;
      }
      return [...prev, product];
    });
  }, []);

  const removeFromCompare = useCallback((productId: string) => {
    setCompareProducts(prev => prev.filter(p => p.id !== productId));
  }, []);

  const toggleCompare = useCallback((product: DBProduct) => {
    setCompareProducts(prev => {
      const isInCompare = prev.some(p => p.id === product.id);
      if (isInCompare) {
        return prev.filter(p => p.id !== product.id);
      }
      if (prev.length >= MAX_COMPARE_ITEMS) {
        return prev;
      }
      return [...prev, product];
    });
  }, []);

  const clearCompare = useCallback(() => {
    setCompareProducts([]);
    setIsCompareOpen(false);
  }, []);

  const isInCompare = useCallback((productId: string) => {
    return compareProducts.some(p => p.id === productId);
  }, [compareProducts]);

  const canAddMore = useMemo(() => {
    return compareProducts.length < MAX_COMPARE_ITEMS;
  }, [compareProducts.length]);

  const openCompareModal = useCallback(() => {
    if (compareProducts.length >= 2) {
      setIsCompareOpen(true);
    }
  }, [compareProducts.length]);

  const closeCompareModal = useCallback(() => {
    setIsCompareOpen(false);
  }, []);

  return {
    compareProducts,
    compareCount: compareProducts.length,
    isCompareOpen,
    maxItems: MAX_COMPARE_ITEMS,
    addToCompare,
    removeFromCompare,
    toggleCompare,
    clearCompare,
    isInCompare,
    canAddMore,
    openCompareModal,
    closeCompareModal,
  };
};
