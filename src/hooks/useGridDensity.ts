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
  const [deviceType, setDeviceType] = useState<DeviceType>(getDeviceType);
  
  const [densities, setDensities] = useState<Record<DeviceType, GridDensity>>(() => {
    if (typeof window === 'undefined') {
      return { desktop: 'comfortable', mobile: 'comfortable' };
    }
    
    const desktopStored = localStorage.getItem(getStorageKey('desktop'));
    const mobileStored = localStorage.getItem(getStorageKey('mobile'));
    
    return {
      desktop: (desktopStored === 'compact' ? 'compact' : 'comfortable') as GridDensity,
      mobile: (mobileStored === 'compact' ? 'compact' : 'comfortable') as GridDensity,
    };
  });

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

  // Persist to localStorage when densities change
  useEffect(() => {
    localStorage.setItem(getStorageKey('desktop'), densities.desktop);
    localStorage.setItem(getStorageKey('mobile'), densities.mobile);
  }, [densities]);

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
