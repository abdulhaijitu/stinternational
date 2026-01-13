import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compare_price: number | null;
    image_url: string | null;
    images: string[];
    in_stock: boolean;
    category: { name: string; slug: string } | null;
  };
}

export const useWishlist = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const wishlistQuery = useQuery({
    queryKey: ["wishlist", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("wishlists")
        .select(`
          *,
          product:products(
            id,
            name,
            slug,
            price,
            compare_price,
            image_url,
            images,
            in_stock,
            category:categories(name, slug)
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as WishlistItem[];
    },
    enabled: !!user,
  });

  const addToWishlist = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("wishlists")
        .insert({ user_id: user.id, product_id: productId })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("Already in wishlist");
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("উইশলিস্টে যোগ হয়েছে!");
    },
    onError: (error: Error) => {
      if (error.message === "Already in wishlist") {
        toast.info("এটি ইতিমধ্যে উইশলিস্টে আছে");
      } else {
        toast.error("উইশলিস্টে যোগ করতে সমস্যা হয়েছে");
      }
    },
  });

  const removeFromWishlist = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("উইশলিস্ট থেকে সরানো হয়েছে");
    },
    onError: () => {
      toast.error("উইশলিস্ট থেকে সরাতে সমস্যা হয়েছে");
    },
  });

  const isInWishlist = (productId: string) => {
    return wishlistQuery.data?.some((item) => item.product_id === productId) ?? false;
  };

  const toggleWishlist = (productId: string) => {
    if (isInWishlist(productId)) {
      removeFromWishlist.mutate(productId);
    } else {
      addToWishlist.mutate(productId);
    }
  };

  return {
    wishlist: wishlistQuery.data ?? [],
    isLoading: wishlistQuery.isLoading,
    isInWishlist,
    addToWishlist: addToWishlist.mutate,
    removeFromWishlist: removeFromWishlist.mutate,
    toggleWishlist,
    isToggling: addToWishlist.isPending || removeFromWishlist.isPending,
  };
};
