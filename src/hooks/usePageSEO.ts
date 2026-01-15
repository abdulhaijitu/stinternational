import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";

export interface PageSEOData {
  id: string;
  page_slug: string;
  page_name: string;
  seo_title: string | null;
  seo_title_bn: string | null;
  seo_description: string | null;
  seo_description_bn: string | null;
  seo_keywords: string | null;
  seo_keywords_bn: string | null;
  og_image: string | null;
  is_active: boolean | null;
}

export const usePageSEO = (pageSlug?: string) => {
  const location = useLocation();
  const slug = pageSlug || location.pathname;

  return useQuery({
    queryKey: ["page-seo", slug],
    queryFn: async (): Promise<PageSEOData | null> => {
      const { data, error } = await supabase
        .from("page_seo")
        .select("*")
        .eq("page_slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error("Error fetching page SEO:", error);
        return null;
      }

      return data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export default usePageSEO;
