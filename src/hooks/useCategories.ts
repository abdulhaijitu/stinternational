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
  parent_id: string | null;
  is_parent: boolean;
}

export interface CategoryGroup {
  name: string;
  slug: string;
  categories: DBCategory[];
}

export interface ParentCategory extends DBCategory {
  subCategories: DBCategory[];
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

// Fetch only parent categories (for admin dropdowns)
export const useParentCategories = () => {
  return useQuery({
    queryKey: ["categories", "parents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .is("parent_id", null)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as DBCategory[];
    },
  });
};

// Fetch only sub-categories (for product assignment)
export const useSubCategories = () => {
  return useQuery({
    queryKey: ["categories", "subcategories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .not("parent_id", "is", null)
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as DBCategory[];
    },
  });
};

// Fetch categories with hierarchy structure
export const useCategoryHierarchy = () => {
  const { data: categories, isLoading, error } = useActiveCategories();

  const hierarchy = categories?.reduce((acc, cat) => {
    if (!cat.parent_id) {
      // This is a parent category
      if (!acc[cat.id]) {
        acc[cat.id] = { ...cat, subCategories: [] };
      } else {
        acc[cat.id] = { ...acc[cat.id], ...cat };
      }
    } else {
      // This is a sub-category
      if (!acc[cat.parent_id]) {
        acc[cat.parent_id] = { subCategories: [cat] } as ParentCategory;
      } else {
        acc[cat.parent_id].subCategories.push(cat);
      }
    }
    return acc;
  }, {} as Record<string, ParentCategory>);

  // Filter out incomplete entries and sort sub-categories
  const parentCategories = hierarchy
    ? Object.values(hierarchy)
        .filter(cat => cat.id && cat.name)
        .map(cat => ({
          ...cat,
          subCategories: cat.subCategories.sort((a, b) => a.display_order - b.display_order)
        }))
    : [];

  return {
    parentCategories,
    isLoading,
    error,
  };
};

// Group active categories by parent_group (legacy support)
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
      // Update each category's display_order and validate response
      for (const update of updates) {
        const { data, error } = await supabase
          .from("categories")
          .update({ display_order: update.display_order })
          .eq("id", update.id)
          .select()
          .single();

        if (error) throw error;
        if (!data) throw new Error("No data returned from update");
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
      const { data, error } = await supabase
        .from("categories")
        .update({ is_active })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("No data returned from update");
      return data;
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

// Get parent category with its sub-categories
export const useParentCategoryWithSubs = (parentSlug: string) => {
  return useQuery({
    queryKey: ["category", "parent-with-subs", parentSlug],
    queryFn: async () => {
      // First get the parent category
      const { data: parent, error: parentError } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", parentSlug)
        .is("parent_id", null)
        .eq("is_active", true)
        .single();

      if (parentError) throw parentError;

      // Then get all sub-categories
      const { data: subCategories, error: subError } = await supabase
        .from("categories")
        .select("*")
        .eq("parent_id", parent.id)
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (subError) throw subError;

      return {
        parent: parent as DBCategory,
        subCategories: subCategories as DBCategory[],
      };
    },
    enabled: !!parentSlug,
  });
};

// Get sub-category by slug with parent info
export const useSubCategoryBySlug = (parentSlug: string, subSlug: string) => {
  return useQuery({
    queryKey: ["category", "sub", parentSlug, subSlug],
    queryFn: async () => {
      // First get the parent category
      const { data: parent, error: parentError } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", parentSlug)
        .is("parent_id", null)
        .eq("is_active", true)
        .single();

      if (parentError) throw parentError;

      // Then get the sub-category
      const { data: subCategory, error: subError } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", subSlug)
        .eq("parent_id", parent.id)
        .eq("is_active", true)
        .single();

      if (subError) throw subError;

      return {
        parent: parent as DBCategory,
        subCategory: subCategory as DBCategory,
      };
    },
    enabled: !!parentSlug && !!subSlug,
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
