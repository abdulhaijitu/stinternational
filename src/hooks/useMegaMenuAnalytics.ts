import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// Get or create session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem("mega_menu_session_id");
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem("mega_menu_session_id", sessionId);
  }
  return sessionId;
};

export interface MegaMenuClickEvent {
  productId: string;
  productSlug: string;
  categoryName?: string;
}

export const useMegaMenuAnalytics = () => {
  const trackFeaturedProductClick = useCallback(async (event: MegaMenuClickEvent) => {
    try {
      await supabase.from("cta_analytics").insert({
        event_type: "mega_menu_featured_click",
        cta_variant: `product:${event.productSlug}`,
        session_id: getSessionId(),
        user_agent: navigator.userAgent,
        referrer: event.categoryName || null,
        page_url: window.location.href,
      });
    } catch (error) {
      // Silent fail - analytics should not break UX
      console.error("Mega menu analytics error:", error);
    }
  }, []);

  return {
    trackFeaturedProductClick,
  };
};
