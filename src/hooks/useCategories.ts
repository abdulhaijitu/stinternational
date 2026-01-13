import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DBCategory {
  id: string;
  name: string;
  name_bn: string | null;
  slug: string;
  description: string | null;
  description_bn: string | null;
  image_url: string | null;
  parent_group: string | null;
  icon_name: string | null;
  display_order: number;
  is_active: boolean;
}

export interface CategoryGroup {
  name: string;
  slug: string;
  categories: DBCategory[];
}

// Fetch only active categories (for public use)
export const useActiveCategories = () => {
  return useQuery({
    queryKey: ["categories", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as DBCategory[];
    },
  });
};

// Fetch all categories (for admin use)
export const useAllCategories = () => {
  return useQuery({
    queryKey: ["categories", "all"],
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

// Group active categories by parent_group
export const useActiveCategoriesByGroup = () => {
  const { data: categories, isLoading, error } = useActiveCategories();

  const grouped = categories?.reduce((acc, cat) => {
    const group = cat.parent_group || "Other";
    if (!acc[group]) {
      acc[group] = {
        name: group,
        slug: group.toLowerCase().replace(/\s+/g, "-").replace(/[&]/g, "and"),
        categories: [],
      };
    }
    acc[group].categories.push(cat);
    return acc;
  }, {} as Record<string, CategoryGroup>);

  return {
    groups: grouped ? Object.values(grouped) : [],
    isLoading,
    error,
  };
};

// Update category order
export const useUpdateCategoryOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { id: string; display_order: number }[]) => {
      // Update each category's display_order
      for (const update of updates) {
        const { error } = await supabase
          .from("categories")
          .update({ display_order: update.display_order })
          .eq("id", update.id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category order updated");
    },
    onError: (error) => {
      console.error("Error updating order:", error);
      toast.error("Failed to update category order");
    },
  });
};

// Toggle category visibility
export const useToggleCategoryVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("categories")
        .update({ is_active })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category visibility updated");
    },
    onError: (error) => {
      console.error("Error toggling visibility:", error);
      toast.error("Failed to update category visibility");
    },
  });
};

// Get category by slug
export const useCategoryBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return data as DBCategory;
    },
    enabled: !!slug,
  });
};

// Determine industry type from category or parent group
export const getIndustryFromCategory = (category?: DBCategory | null): 'laboratory' | 'engineering' | 'measurement' | 'default' => {
  if (!category) return 'default';
  
  const parentGroup = category.parent_group?.toLowerCase() || '';
  const categoryName = category.name.toLowerCase();
  
  if (parentGroup.includes('lab') || parentGroup.includes('education') || 
      categoryName.includes('lab') || categoryName.includes('microscope') || 
      categoryName.includes('glass') || categoryName.includes('flask') ||
      categoryName.includes('bioflog') || categoryName.includes('test kit')) {
    return 'laboratory';
  }
  
  if (parentGroup.includes('engineering') || parentGroup.includes('industrial') ||
      categoryName.includes('construction') || categoryName.includes('civil') ||
      categoryName.includes('safety') || categoryName.includes('hard hat')) {
    return 'engineering';
  }
  
  if (parentGroup.includes('measurement') || parentGroup.includes('instrument') ||
      categoryName.includes('balance') || categoryName.includes('scale') ||
      categoryName.includes('gsm') || categoryName.includes('stopwatch') ||
      categoryName.includes('gauge')) {
    return 'measurement';
  }
  
  return 'default';
};
