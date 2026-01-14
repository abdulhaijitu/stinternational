import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  category: { name: string } | null;
}

export const ADMIN_PRODUCTS_QUERY_KEY = ["admin", "products"];

export const useAdminProducts = () => {
  const queryClient = useQueryClient();

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
          
          // Invalidate and refetch on any change
          queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_QUERY_KEY });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ADMIN_PRODUCTS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id, name, slug, price, sku, in_stock, stock_quantity, is_active, image_url,
          category:categories(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as AdminProduct[];
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
      
      // Optimistically update cache
      queryClient.setQueryData<AdminProduct[]>(ADMIN_PRODUCTS_QUERY_KEY, (old) => 
        old?.filter((p) => p.id !== productId) ?? []
      );
      
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
