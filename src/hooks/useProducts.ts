import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DBCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_group: string | null;
  icon_name: string | null;
  display_order: number;
}

export interface DBProduct {
  id: string;
  name: string;
  name_bn?: string | null;
  slug: string;
  description: string | null;
  description_bn?: string | null;
  short_description: string | null;
  short_description_bn?: string | null;
  price: number;
  compare_price: number | null;
  sku: string | null;
  category_id: string | null;
  image_url: string | null;
  images: string[];
  specifications: Record<string, string>;
  features: string[];
  in_stock: boolean;
  stock_quantity: number;
  is_featured: boolean;
  is_active: boolean;
  // SEO fields
  seo_title?: string | null;
  seo_title_bn?: string | null;
  seo_description?: string | null;
  seo_description_bn?: string | null;
  seo_keywords?: string | null;
  seo_keywords_bn?: string | null;
  og_image?: string | null;
  category?: { 
    id: string; 
    name: string; 
    name_bn?: string | null; 
    slug: string; 
    description?: string | null; 
    description_bn?: string | null; 
    parent_id: string | null;
    // SEO fields on category
    seo_title?: string | null;
    seo_title_bn?: string | null;
    seo_description?: string | null;
    seo_description_bn?: string | null;
  } | null;
}

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as DBCategory[];
    },
  });
};

export const useCategoriesByGroup = () => {
  const { data: categories, isLoading, error } = useCategories();

  const grouped = categories?.reduce((acc, cat) => {
    const group = cat.parent_group || "অন্যান্য";
    if (!acc[group]) {
      acc[group] = {
        name: group,
        slug: group.toLowerCase().replace(/\s+/g, "-").replace(/[&]/g, "and"),
        categories: [],
      };
    }
    acc[group].categories.push(cat);
    return acc;
  }, {} as Record<string, { name: string; slug: string; categories: DBCategory[] }>);

  return {
    groups: grouped ? Object.values(grouped) : [],
    isLoading,
    error,
  };
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(id, name, slug, parent_id)
        `)
        .eq("is_featured", true)
        .eq("is_active", true)
        .limit(8);

      if (error) throw error;
      return data as DBProduct[];
    },
  });
};

export const useProductsByCategory = (categorySlug: string) => {
  return useQuery({
    queryKey: ["products", "category", categorySlug],
    queryFn: async () => {
      // First get category ID
      const { data: category } = await supabase
        .from("categories")
        .select("id, name, description")
        .eq("slug", categorySlug)
        .single();

      if (!category) return { products: [], category: null };

      const { data: products, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(id, name, slug, parent_id)
        `)
        .eq("category_id", category.id)
        .eq("is_active", true);

      if (error) throw error;
      return { products: products as DBProduct[], category };
    },
    enabled: !!categorySlug,
  });
};

export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(id, name, slug, parent_id)
        `)
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return data as DBProduct;
    },
    enabled: !!slug,
  });
};

export const useAllProducts = () => {
  return useQuery({
    queryKey: ["products", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(id, name, slug, parent_id)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DBProduct[];
    },
  });
};
