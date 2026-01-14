import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminQuote {
  id: string;
  company_name: string;
  company_type: string;
  contact_person: string;
  email: string;
  phone: string;
  product_category: string;
  product_details: string;
  quantity: string;
  budget_range: string | null;
  delivery_address: string;
  delivery_city: string;
  delivery_urgency: string;
  preferred_payment: string | null;
  additional_notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  source_page?: string | null;
  language?: string | null;
}

export const ADMIN_QUOTES_QUERY_KEY = ["admin", "quotes"];

export const useAdminQuotes = (filterStatus: string = "all", showRealtimeToasts = true) => {
  const queryClient = useQueryClient();
  const initialLoadDone = useRef(false);

  // Set up realtime subscription for quote_requests table
  useEffect(() => {
    const channel = supabase
      .channel('admin-quotes-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quote_requests',
        },
        (payload) => {
          console.log('Quote realtime update:', payload.eventType, payload);
          
          // Show toast notification for new quotes (only after initial load)
          if (showRealtimeToasts && initialLoadDone.current && payload.eventType === 'INSERT') {
            const newQuote = payload.new as AdminQuote;
            toast.info(`New quote request received`, {
              description: `From ${newQuote.company_name} - ${newQuote.contact_person}`,
              duration: 5000,
            });
          }
          
          // Invalidate and refetch on any change
          queryClient.invalidateQueries({ queryKey: ADMIN_QUOTES_QUERY_KEY });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, showRealtimeToasts]);

  return useQuery({
    queryKey: [...ADMIN_QUOTES_QUERY_KEY, filterStatus],
    queryFn: async () => {
      let query = supabase
        .from("quote_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      initialLoadDone.current = true;
      return (data || []) as AdminQuote[];
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

export const useInvalidateQuotes = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_QUOTES_QUERY_KEY });
  };
};
