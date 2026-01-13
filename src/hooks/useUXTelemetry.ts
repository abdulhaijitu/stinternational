import { useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type TelemetryEventType = 
  | 'hero_slide_view'
  | 'hero_slide_click'
  | 'category_hover'
  | 'category_click'
  | 'mega_menu_product_click'
  | 'product_view_click'
  | 'product_compare_select'
  | 'grid_density_change'
  | 'search_query'
  | 'category_search'
  | 'add_to_cart'
  | 'buy_now_click'
  | 'rfq_submit'
  | 'checkout_start'
  | 'order_complete'
  | 'back_to_top_click'
  | 'language_switch'
  | 'wishlist_add'
  | 'wishlist_remove'
  | 'quick_view_open';

export type TelemetryCategory = 
  | 'navigation'
  | 'product_discovery'
  | 'conversion'
  | 'utility'
  | 'engagement';

interface TelemetryEvent {
  event_type: TelemetryEventType;
  event_category: TelemetryCategory;
  event_action?: string;
  event_label?: string;
  event_value?: string;
}

// Generate or retrieve session ID
const getSessionId = (): string => {
  if (typeof window === 'undefined') return 'server';
  
  let sessionId = sessionStorage.getItem('ux_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('ux_session_id', sessionId);
  }
  return sessionId;
};

// Detect device type
const getDeviceType = (): 'desktop' | 'mobile' | 'tablet' => {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// Batch queue for events
let eventQueue: Array<{
  event_type: string;
  event_category: string;
  event_action: string | null;
  event_label: string | null;
  event_value: string | null;
  page_url: string;
  device_type: string;
  session_id: string;
}> = [];

let flushTimeout: NodeJS.Timeout | null = null;

const flushEvents = async () => {
  if (eventQueue.length === 0) return;
  
  const eventsToSend = [...eventQueue];
  eventQueue = [];
  
  try {
    await supabase.from('ux_telemetry_events').insert(eventsToSend);
  } catch (error) {
    // Silently fail - telemetry should not affect UX
    console.debug('Telemetry flush failed:', error);
  }
};

const scheduleFlush = () => {
  if (flushTimeout) return;
  
  flushTimeout = setTimeout(() => {
    flushTimeout = null;
    flushEvents();
  }, 2000); // Batch events every 2 seconds
};

// Hook for tracking UX events
export const useUXTelemetry = () => {
  const sessionIdRef = useRef<string>('');
  
  useEffect(() => {
    sessionIdRef.current = getSessionId();
    
    // Flush events on page unload
    const handleUnload = () => {
      flushEvents();
    };
    
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);
  
  const trackEvent = useCallback((event: TelemetryEvent) => {
    const eventData = {
      event_type: event.event_type,
      event_category: event.event_category,
      event_action: event.event_action || null,
      event_label: event.event_label || null,
      event_value: event.event_value || null,
      page_url: typeof window !== 'undefined' ? window.location.pathname : '',
      device_type: getDeviceType(),
      session_id: sessionIdRef.current || getSessionId(),
    };
    
    eventQueue.push(eventData);
    scheduleFlush();
  }, []);
  
  // Convenience methods for common events
  const trackHeroSlide = useCallback((slideIndex: number, action: 'view' | 'click') => {
    trackEvent({
      event_type: action === 'view' ? 'hero_slide_view' : 'hero_slide_click',
      event_category: 'navigation',
      event_action: action,
      event_label: `slide_${slideIndex}`,
      event_value: String(slideIndex),
    });
  }, [trackEvent]);
  
  const trackCategoryInteraction = useCallback((
    categorySlug: string, 
    categoryName: string, 
    action: 'hover' | 'click'
  ) => {
    trackEvent({
      event_type: action === 'hover' ? 'category_hover' : 'category_click',
      event_category: 'navigation',
      event_action: action,
      event_label: categoryName,
      event_value: categorySlug,
    });
  }, [trackEvent]);
  
  const trackProductClick = useCallback((
    productSlug: string, 
    productName: string, 
    source: 'card' | 'mega_menu' | 'quick_view'
  ) => {
    trackEvent({
      event_type: source === 'mega_menu' ? 'mega_menu_product_click' : 'product_view_click',
      event_category: 'product_discovery',
      event_action: 'click',
      event_label: productName,
      event_value: productSlug,
    });
  }, [trackEvent]);
  
  const trackCompareSelect = useCallback((productSlug: string, productName: string) => {
    trackEvent({
      event_type: 'product_compare_select',
      event_category: 'product_discovery',
      event_action: 'select',
      event_label: productName,
      event_value: productSlug,
    });
  }, [trackEvent]);
  
  const trackGridDensity = useCallback((density: 'compact' | 'comfortable') => {
    trackEvent({
      event_type: 'grid_density_change',
      event_category: 'utility',
      event_action: 'change',
      event_label: density,
    });
  }, [trackEvent]);
  
  const trackSearch = useCallback((query: string, categoryContext?: string) => {
    trackEvent({
      event_type: categoryContext ? 'category_search' : 'search_query',
      event_category: 'product_discovery',
      event_action: 'search',
      event_label: query,
      event_value: categoryContext,
    });
  }, [trackEvent]);
  
  const trackConversion = useCallback((
    type: 'add_to_cart' | 'buy_now' | 'rfq_submit' | 'checkout_start' | 'order_complete',
    productSlug?: string,
    value?: string
  ) => {
    trackEvent({
      event_type: type === 'rfq_submit' ? 'rfq_submit' : 
                  type === 'checkout_start' ? 'checkout_start' :
                  type === 'order_complete' ? 'order_complete' :
                  type === 'buy_now' ? 'buy_now_click' : 'add_to_cart',
      event_category: 'conversion',
      event_action: type,
      event_label: productSlug,
      event_value: value,
    });
  }, [trackEvent]);
  
  const trackUtility = useCallback((type: 'back_to_top' | 'language_switch', value?: string) => {
    trackEvent({
      event_type: type === 'back_to_top' ? 'back_to_top_click' : 'language_switch',
      event_category: 'utility',
      event_action: type,
      event_value: value,
    });
  }, [trackEvent]);
  
  const trackWishlist = useCallback((action: 'add' | 'remove', productSlug: string) => {
    trackEvent({
      event_type: action === 'add' ? 'wishlist_add' : 'wishlist_remove',
      event_category: 'engagement',
      event_action: action,
      event_value: productSlug,
    });
  }, [trackEvent]);
  
  const trackQuickView = useCallback((productSlug: string) => {
    trackEvent({
      event_type: 'quick_view_open',
      event_category: 'product_discovery',
      event_action: 'open',
      event_value: productSlug,
    });
  }, [trackEvent]);
  
  return {
    trackEvent,
    trackHeroSlide,
    trackCategoryInteraction,
    trackProductClick,
    trackCompareSelect,
    trackGridDensity,
    trackSearch,
    trackConversion,
    trackUtility,
    trackWishlist,
    trackQuickView,
  };
};

// Singleton instance for non-component usage
let singletonTracker: ReturnType<typeof useUXTelemetry> | null = null;

export const getUXTelemetry = () => {
  if (!singletonTracker) {
    // Create a simple tracker for non-component usage
    const sessionId = getSessionId();
    
    singletonTracker = {
      trackEvent: (event: TelemetryEvent) => {
        eventQueue.push({
          event_type: event.event_type,
          event_category: event.event_category,
          event_action: event.event_action || null,
          event_label: event.event_label || null,
          event_value: event.event_value || null,
          page_url: typeof window !== 'undefined' ? window.location.pathname : '',
          device_type: getDeviceType(),
          session_id: sessionId,
        });
        scheduleFlush();
      },
      trackHeroSlide: () => {},
      trackCategoryInteraction: () => {},
      trackProductClick: () => {},
      trackCompareSelect: () => {},
      trackGridDensity: () => {},
      trackSearch: () => {},
      trackConversion: () => {},
      trackUtility: () => {},
      trackWishlist: () => {},
      trackQuickView: () => {},
    };
  }
  return singletonTracker;
};
