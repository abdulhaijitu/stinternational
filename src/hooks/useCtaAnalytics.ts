import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type CtaVariant = "browse_products" | "request_quote";
type EventType = "click" | "rfq_submit";

// Generate a simple session ID for tracking
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem("cta_session_id");
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem("cta_session_id", sessionId);
  }
  return sessionId;
};

// Randomly select CTA variant (50/50 split)
const selectVariant = (): CtaVariant => {
  const stored = sessionStorage.getItem("cta_variant");
  if (stored === "browse_products" || stored === "request_quote") {
    return stored;
  }
  const variant: CtaVariant = Math.random() < 0.5 ? "browse_products" : "request_quote";
  sessionStorage.setItem("cta_variant", variant);
  return variant;
};

export const useCtaAnalytics = () => {
  const [variant, setVariant] = useState<CtaVariant>("browse_products");

  useEffect(() => {
    setVariant(selectVariant());
  }, []);

  const trackEvent = useCallback(async (eventType: EventType, ctaVariant: CtaVariant) => {
    try {
      await supabase.from("cta_analytics").insert({
        event_type: eventType,
        cta_variant: ctaVariant,
        session_id: getSessionId(),
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
        page_url: window.location.href,
      });
    } catch (error) {
      // Silent fail - analytics should not break UX
      console.error("Analytics tracking error:", error);
    }
  }, []);

  const trackClick = useCallback((ctaVariant: CtaVariant) => {
    trackEvent("click", ctaVariant);
  }, [trackEvent]);

  const trackRfqSubmit = useCallback(() => {
    trackEvent("rfq_submit", "request_quote");
  }, [trackEvent]);

  return {
    variant,
    trackClick,
    trackRfqSubmit,
  };
};
