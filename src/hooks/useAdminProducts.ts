import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  sku: string | null;
  in_stock: boolean;
  stock_quantity: number;
  is_active: boolean;
  image_url: string | null;
  category: { id: string; name: string } | null;
  created_by: string | null;
  creator: { full_name: string | null } | null;
}

export const ADMIN_PRODUCTS_QUERY_KEY = ["admin", "products"];

export const useAdminProducts = (showRealtimeToasts = true) => {
  const queryClient = useQueryClient();
  const initialLoadDone = useRef(false);

  // Set up realtime subscription for products table
  useEffect(() => {
    const channel = supabase
      .channel('admin-products-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'products',
        },
        (payload) => {
          console.log('Product realtime update:', payload.eventType, payload);
          
          // Show toast notification for new products (only after initial load)
          if (showRealtimeToasts && initialLoadDone.current && payload.eventType === 'INSERT') {
            const newProduct = payload.new as { name?: string };
            toast.info(`New product added`, {
              description: newProduct.name || 'A new product was added',
              duration: 5000,
            });
          }
          
          // Invalidate and refetch on any change
          queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_QUERY_KEY });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, showRealtimeToasts]);

  return useQuery({
    queryKey: ADMIN_PRODUCTS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id, name, slug, price, sku, in_stock, stock_quantity, is_active, image_url, created_by,
          category:categories(id, name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Fetch creator profiles for products that have created_by
      const creatorIds = [...new Set(data?.filter(p => p.created_by).map(p => p.created_by) || [])];
      let creatorMap = new Map<string, { full_name: string | null }>();
      
      if (creatorIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", creatorIds);
        
        profiles?.forEach(p => {
          creatorMap.set(p.user_id, { full_name: p.full_name });
        });
      }
      
      // Attach creator info to products
      const productsWithCreators = (data || []).map(p => ({
        ...p,
        creator: p.created_by ? creatorMap.get(p.created_by) || null : null,
      }));
      
      initialLoadDone.current = true;
      return productsWithCreators as AdminProduct[];
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return {
    mutateAsync: async (productId: string) => {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);
      
      if (error) throw error;
      
      // Invalidate and refetch to ensure UI is in sync with database
      // Do NOT use optimistic update - wait for backend confirmation
      await queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      
      return productId;
    },
  };
};

export const useInvalidateProducts = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };
};
