import { useState, useEffect, useCallback } from 'react';

export type GridDensity = 'comfortable' | 'compact';

const STORAGE_KEY = 'product-grid-density';

export const useGridDensity = () => {
  const [density, setDensityState] = useState<GridDensity>(() => {
    if (typeof window === 'undefined') return 'comfortable';
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored === 'compact' ? 'compact' : 'comfortable') as GridDensity;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, density);
  }, [density]);

  const setDensity = useCallback((newDensity: GridDensity) => {
    setDensityState(newDensity);
  }, []);

  const toggleDensity = useCallback(() => {
    setDensityState(prev => prev === 'comfortable' ? 'compact' : 'comfortable');
  }, []);

  return {
    density,
    setDensity,
    toggleDensity,
    isCompact: density === 'compact',
    isComfortable: density === 'comfortable',
  };
};
