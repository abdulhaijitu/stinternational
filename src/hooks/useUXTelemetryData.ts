import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type TimeRange = 'today' | '7days' | '30days';

interface TelemetryFilters {
  timeRange: TimeRange;
}

const getDateFilter = (timeRange: TimeRange): string => {
  const now = new Date();
  switch (timeRange) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    case '7days':
      const week = new Date(now);
      week.setDate(week.getDate() - 7);
      return week.toISOString();
    case '30days':
      const month = new Date(now);
      month.setDate(month.getDate() - 30);
      return month.toISOString();
    default:
      return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  }
};

// Summary metrics
export const useTelemetrySummary = (filters: TelemetryFilters) => {
  return useQuery({
    queryKey: ['telemetry', 'summary', filters.timeRange],
    queryFn: async () => {
      const dateFilter = getDateFilter(filters.timeRange);
      
      // Get total events
      const { count: totalEvents } = await supabase
        .from('ux_telemetry_events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', dateFilter);
      
      // Get unique sessions
      const { data: sessionData } = await supabase
        .from('ux_telemetry_events')
        .select('session_id')
        .gte('created_at', dateFilter);
      
      const uniqueSessions = new Set(sessionData?.map(e => e.session_id)).size;
      
      // Get conversion events
      const { count: conversions } = await supabase
        .from('ux_telemetry_events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', dateFilter)
        .eq('event_category', 'conversion');
      
      // Get device breakdown
      const { data: deviceData } = await supabase
        .from('ux_telemetry_events')
        .select('device_type, session_id')
        .gte('created_at', dateFilter);
      
      const deviceSessions: Record<string, Set<string>> = {};
      deviceData?.forEach(e => {
        if (!deviceSessions[e.device_type || 'unknown']) {
          deviceSessions[e.device_type || 'unknown'] = new Set();
        }
        deviceSessions[e.device_type || 'unknown'].add(e.session_id || '');
      });
      
      return {
        totalEvents: totalEvents || 0,
        uniqueSessions,
        conversions: conversions || 0,
        deviceBreakdown: {
          desktop: deviceSessions['desktop']?.size || 0,
          mobile: deviceSessions['mobile']?.size || 0,
          tablet: deviceSessions['tablet']?.size || 0,
        },
      };
    },
    staleTime: 60 * 1000, // 1 minute
  });
};

// Top categories
export const useTopCategories = (filters: TelemetryFilters) => {
  return useQuery({
    queryKey: ['telemetry', 'categories', filters.timeRange],
    queryFn: async () => {
      const dateFilter = getDateFilter(filters.timeRange);
      
      const { data } = await supabase
        .from('ux_telemetry_events')
        .select('event_label, event_value, event_type')
        .gte('created_at', dateFilter)
        .in('event_type', ['category_click', 'category_hover']);
      
      const categoryStats: Record<string, { clicks: number; hovers: number; name: string }> = {};
      
      data?.forEach(event => {
        const slug = event.event_value || 'unknown';
        if (!categoryStats[slug]) {
          categoryStats[slug] = { clicks: 0, hovers: 0, name: event.event_label || slug };
        }
        if (event.event_type === 'category_click') {
          categoryStats[slug].clicks++;
        } else {
          categoryStats[slug].hovers++;
        }
      });
      
      return Object.entries(categoryStats)
        .map(([slug, stats]) => ({ slug, ...stats }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 10);
    },
    staleTime: 60 * 1000,
  });
};

// Top products
export const useTopProducts = (filters: TelemetryFilters) => {
  return useQuery({
    queryKey: ['telemetry', 'products', filters.timeRange],
    queryFn: async () => {
      const dateFilter = getDateFilter(filters.timeRange);
      
      const { data } = await supabase
        .from('ux_telemetry_events')
        .select('event_label, event_value, event_type')
        .gte('created_at', dateFilter)
        .in('event_type', ['product_view_click', 'mega_menu_product_click', 'add_to_cart', 'buy_now_click']);
      
      const productStats: Record<string, { views: number; carts: number; name: string }> = {};
      
      data?.forEach(event => {
        const slug = event.event_value || 'unknown';
        if (!productStats[slug]) {
          productStats[slug] = { views: 0, carts: 0, name: event.event_label || slug };
        }
        if (event.event_type === 'add_to_cart' || event.event_type === 'buy_now_click') {
          productStats[slug].carts++;
        } else {
          productStats[slug].views++;
        }
      });
      
      return Object.entries(productStats)
        .map(([slug, stats]) => ({ slug, ...stats }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);
    },
    staleTime: 60 * 1000,
  });
};

// Conversion funnel
export const useConversionFunnel = (filters: TelemetryFilters) => {
  return useQuery({
    queryKey: ['telemetry', 'funnel', filters.timeRange],
    queryFn: async () => {
      const dateFilter = getDateFilter(filters.timeRange);
      
      const { data } = await supabase
        .from('ux_telemetry_events')
        .select('event_type')
        .gte('created_at', dateFilter)
        .eq('event_category', 'conversion');
      
      const counts = {
        addToCart: 0,
        buyNow: 0,
        checkoutStart: 0,
        orderComplete: 0,
        rfqSubmit: 0,
      };
      
      data?.forEach(event => {
        switch (event.event_type) {
          case 'add_to_cart': counts.addToCart++; break;
          case 'buy_now_click': counts.buyNow++; break;
          case 'checkout_start': counts.checkoutStart++; break;
          case 'order_complete': counts.orderComplete++; break;
          case 'rfq_submit': counts.rfqSubmit++; break;
        }
      });
      
      return counts;
    },
    staleTime: 60 * 1000,
  });
};

// Search analytics
export const useSearchAnalytics = (filters: TelemetryFilters) => {
  return useQuery({
    queryKey: ['telemetry', 'search', filters.timeRange],
    queryFn: async () => {
      const dateFilter = getDateFilter(filters.timeRange);
      
      const { data } = await supabase
        .from('ux_telemetry_events')
        .select('event_label, event_type')
        .gte('created_at', dateFilter)
        .in('event_type', ['search_query', 'category_search']);
      
      const searchTerms: Record<string, number> = {};
      let categorySearchCount = 0;
      let generalSearchCount = 0;
      
      data?.forEach(event => {
        const term = event.event_label?.toLowerCase() || '';
        if (term) {
          searchTerms[term] = (searchTerms[term] || 0) + 1;
        }
        if (event.event_type === 'category_search') {
          categorySearchCount++;
        } else {
          generalSearchCount++;
        }
      });
      
      const topTerms = Object.entries(searchTerms)
        .map(([term, count]) => ({ term, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      return {
        topTerms,
        categorySearchCount,
        generalSearchCount,
        totalSearches: data?.length || 0,
      };
    },
    staleTime: 60 * 1000,
  });
};

// Utility usage
export const useUtilityUsage = (filters: TelemetryFilters) => {
  return useQuery({
    queryKey: ['telemetry', 'utility', filters.timeRange],
    queryFn: async () => {
      const dateFilter = getDateFilter(filters.timeRange);
      
      const { data } = await supabase
        .from('ux_telemetry_events')
        .select('event_type, event_value')
        .gte('created_at', dateFilter)
        .eq('event_category', 'utility');
      
      const usage = {
        backToTop: 0,
        languageSwitch: { en: 0, bn: 0 },
        gridDensity: { compact: 0, comfortable: 0 },
      };
      
      data?.forEach(event => {
        switch (event.event_type) {
          case 'back_to_top_click':
            usage.backToTop++;
            break;
          case 'language_switch':
            if (event.event_value === 'bn') usage.languageSwitch.bn++;
            else usage.languageSwitch.en++;
            break;
          case 'grid_density_change':
            if (event.event_value === 'compact') usage.gridDensity.compact++;
            else usage.gridDensity.comfortable++;
            break;
        }
      });
      
      return usage;
    },
    staleTime: 60 * 1000,
  });
};

// Hero slider analytics
export const useHeroAnalytics = (filters: TelemetryFilters) => {
  return useQuery({
    queryKey: ['telemetry', 'hero', filters.timeRange],
    queryFn: async () => {
      const dateFilter = getDateFilter(filters.timeRange);
      
      const { data } = await supabase
        .from('ux_telemetry_events')
        .select('event_type, event_value')
        .gte('created_at', dateFilter)
        .in('event_type', ['hero_slide_view', 'hero_slide_click']);
      
      const slides: Record<string, { views: number; clicks: number }> = {};
      
      data?.forEach(event => {
        const slide = event.event_value || '0';
        if (!slides[slide]) {
          slides[slide] = { views: 0, clicks: 0 };
        }
        if (event.event_type === 'hero_slide_click') {
          slides[slide].clicks++;
        } else {
          slides[slide].views++;
        }
      });
      
      return Object.entries(slides)
        .map(([slide, stats]) => ({ slide: parseInt(slide), ...stats }))
        .sort((a, b) => a.slide - b.slide);
    },
    staleTime: 60 * 1000,
  });
};
