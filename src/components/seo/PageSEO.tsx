import { useEffect } from "react";
import { BilingualSEO } from "./BilingualSEO";
import { usePageSEO, PageSEOData } from "@/hooks/usePageSEO";
import { getPageOgImage } from "@/lib/ogImageUtils";
import { useLanguage } from "@/contexts/LanguageContext";

interface PageSEOProps {
  pageSlug: string;
  fallbackTitle?: { en: string; bn: string };
  fallbackDescription?: { en: string; bn: string };
}

/**
 * PageSEO Component
 * Fetches SEO settings from page_seo table and applies them
 * Falls back to provided defaults if no database entry exists
 */
export const PageSEO = ({ pageSlug, fallbackTitle, fallbackDescription }: PageSEOProps) => {
  const { data: pageSeo, isLoading } = usePageSEO(pageSlug);
  const { language } = useLanguage();

  // If loading, don't render anything (meta tags will be set by useEffect)
  if (isLoading) return null;

  // Build title from database or fallback
  const getTitle = (): { en: string; bn: string } => {
    if (pageSeo) {
      return {
        en: pageSeo.seo_title || fallbackTitle?.en || "ST International",
        bn: pageSeo.seo_title_bn || fallbackTitle?.bn || "ST International",
      };
    }
    return fallbackTitle || { en: "ST International", bn: "ST International" };
  };

  // Build description from database or fallback
  const getDescription = (): { en: string; bn: string } => {
    if (pageSeo) {
      return {
        en: pageSeo.seo_description || fallbackDescription?.en || "",
        bn: pageSeo.seo_description_bn || fallbackDescription?.bn || "",
      };
    }
    return fallbackDescription || { en: "", bn: "" };
  };

  // Build keywords from database
  const getKeywords = (): { en: string; bn: string } | undefined => {
    if (pageSeo && (pageSeo.seo_keywords || pageSeo.seo_keywords_bn)) {
      return {
        en: pageSeo.seo_keywords || "",
        bn: pageSeo.seo_keywords_bn || "",
      };
    }
    return undefined;
  };

  // Get OG image from database or default
  const ogImage = getPageOgImage(pageSeo);

  return (
    <BilingualSEO
      customTitle={getTitle()}
      customDescription={getDescription()}
      customKeywords={getKeywords()}
      customOgImage={ogImage}
      ogType="website"
    />
  );
};

export default PageSEO;
