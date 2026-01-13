import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminNotificationCounts {
  pendingOrders: number;
  pendingQuotes: number;
  loading: boolean;
}

export const useAdminNotifications = () => {
  const [counts, setCounts] = useState<AdminNotificationCounts>({
    pendingOrders: 0,
    pendingQuotes: 0,
    loading: true,
  });

  useEffect(() => {
    fetchCounts();
    
    // Set up realtime subscription for orders
    const ordersChannel = supabase
      .channel('admin-orders-count')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchCounts()
      )
      .subscribe();

    // Set up realtime subscription for quotes
    const quotesChannel = supabase
      .channel('admin-quotes-count')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quote_requests' },
        () => fetchCounts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(quotesChannel);
    };
  }, []);

  const fetchCounts = async () => {
    try {
      // Fetch pending orders count
      const { count: ordersCount, error: ordersError } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .in("status", ["pending_payment", "paid", "processing"]);

      // Fetch pending quotes count
      const { count: quotesCount, error: quotesError } = await supabase
        .from("quote_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      if (ordersError) console.error("Error fetching orders count:", ordersError);
      if (quotesError) console.error("Error fetching quotes count:", quotesError);

      setCounts({
        pendingOrders: ordersCount || 0,
        pendingQuotes: quotesCount || 0,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching notification counts:", error);
      setCounts(prev => ({ ...prev, loading: false }));
    }
  };

  return counts;
};