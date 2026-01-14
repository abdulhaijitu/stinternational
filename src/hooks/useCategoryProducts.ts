import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DBProduct } from "@/hooks/useProducts";

export const useTopProductsByCategory = (categorySlug: string, limit: number = 4) => {
  return useQuery({
    queryKey: ["products", "top", categorySlug, limit],
    queryFn: async () => {
      // First get category ID
      const { data: category } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", categorySlug)
        .single();

      if (!category) return [];

      const { data: products, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          slug,
          price,
          image_url,
          in_stock,
          category:categories(id, name, slug, parent_id)
        `)
        .eq("category_id", category.id)
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return products as Pick<DBProduct, 'id' | 'name' | 'slug' | 'price' | 'image_url' | 'in_stock' | 'category'>[];
    },
    enabled: !!categorySlug,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// Fetch all products by category ID
export const useProductsByCategory = (categoryId: string | undefined) => {
  return useQuery({
    queryKey: ["products", "category", categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      
      const { data: products, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(id, name, name_bn, slug, description, description_bn, parent_id)
        `)
        .eq("category_id", categoryId)
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return products as DBProduct[];
    },
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
  });
};
