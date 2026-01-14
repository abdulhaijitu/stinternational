import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);
      
      if (error) throw error;
      return productId;
    },
    onSuccess: (deletedId) => {
      // Optimistically update the cache
      queryClient.setQueryData<AdminProduct[]>(ADMIN_PRODUCTS_QUERY_KEY, (old) => 
        old?.filter((p) => p.id !== deletedId) ?? []
      );
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_QUERY_KEY });
    },
  });
};

export const useInvalidateProducts = () => {
  const queryClient = useQueryClient();
  
  return () => {
    // Invalidate all product-related queries
    queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };
};
