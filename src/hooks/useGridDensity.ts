import { useState, useEffect, useCallback, useMemo } from 'react';

export type GridDensity = 'comfortable' | 'compact';
type DeviceType = 'desktop' | 'mobile';

const STORAGE_KEY_PREFIX = 'product-grid-density';
const MOBILE_BREAKPOINT = 768;

const getDeviceType = (): DeviceType => {
  if (typeof window === 'undefined') return 'desktop';
  return window.innerWidth < MOBILE_BREAKPOINT ? 'mobile' : 'desktop';
};

const getStorageKey = (device: DeviceType): string => {
  return `${STORAGE_KEY_PREFIX}-${device}`;
};

export const useGridDensity = () => {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  
  // Default values, hydrate from localStorage in useEffect
  const [densities, setDensities] = useState<Record<DeviceType, GridDensity>>({
    desktop: 'comfortable',
    mobile: 'comfortable',
  });
  
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount (client-only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    setDeviceType(getDeviceType());
    
    const desktopStored = localStorage.getItem(getStorageKey('desktop'));
    const mobileStored = localStorage.getItem(getStorageKey('mobile'));
    
    setDensities({
      desktop: (desktopStored === 'compact' ? 'compact' : 'comfortable') as GridDensity,
      mobile: (mobileStored === 'compact' ? 'compact' : 'comfortable') as GridDensity,
    });
    
    setIsHydrated(true);
  }, []);

  // Track device type changes
  useEffect(() => {
    const handleResize = () => {
      const newDeviceType = getDeviceType();
      if (newDeviceType !== deviceType) {
        setDeviceType(newDeviceType);
      }
    };

    // Throttled resize handler
    let timeout: NodeJS.Timeout;
    const throttledResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', throttledResize, { passive: true });
    return () => {
      window.removeEventListener('resize', throttledResize);
      clearTimeout(timeout);
    };
  }, [deviceType]);

  // Persist to localStorage when densities change (only after hydration)
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(getStorageKey('desktop'), densities.desktop);
    localStorage.setItem(getStorageKey('mobile'), densities.mobile);
  }, [densities, isHydrated]);

  // Current density based on device type
  const density = useMemo(() => densities[deviceType], [densities, deviceType]);

  const setDensity = useCallback((newDensity: GridDensity) => {
    setDensities(prev => ({
      ...prev,
      [deviceType]: newDensity,
    }));
  }, [deviceType]);

  const toggleDensity = useCallback(() => {
    setDensities(prev => ({
      ...prev,
      [deviceType]: prev[deviceType] === 'comfortable' ? 'compact' : 'comfortable',
    }));
  }, [deviceType]);

  // Set density for a specific device type (useful for syncing with user account)
  const setDeviceDensity = useCallback((device: DeviceType, newDensity: GridDensity) => {
    setDensities(prev => ({
      ...prev,
      [device]: newDensity,
    }));
  }, []);

  return {
    density,
    densities,
    deviceType,
    setDensity,
    toggleDensity,
    setDeviceDensity,
    isCompact: density === 'compact',
    isComfortable: density === 'comfortable',
    isMobile: deviceType === 'mobile',
  };
};
