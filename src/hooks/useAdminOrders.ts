import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminOrder {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  total: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_city: string;
  shipping_address: string;
  company_name: string | null;
  subtotal: number;
  shipping_cost: number | null;
  notes: string | null;
  created_at: string;
}

export const ADMIN_ORDERS_QUERY_KEY = ["admin", "orders"];

export const useAdminOrders = (showRealtimeToasts = true) => {
  const queryClient = useQueryClient();
  const initialLoadDone = useRef(false);

  // Set up realtime subscription for orders table
  useEffect(() => {
    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('Order realtime update:', payload.eventType, payload);
          
          // Show toast notification for new orders (only after initial load)
          if (showRealtimeToasts && initialLoadDone.current && payload.eventType === 'INSERT') {
            const newOrder = payload.new as AdminOrder;
            toast.info(`New order received: ${newOrder.order_number}`, {
              description: `From ${newOrder.customer_name}`,
              duration: 5000,
            });
          }
          
          // Invalidate and refetch on any change
          queryClient.invalidateQueries({ queryKey: ADMIN_ORDERS_QUERY_KEY });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, showRealtimeToasts]);

  const query = useQuery({
    queryKey: ADMIN_ORDERS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      initialLoadDone.current = true;
      return (data || []) as AdminOrder[];
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return query;
};

export const useInvalidateOrders = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_ORDERS_QUERY_KEY });
  };
};
