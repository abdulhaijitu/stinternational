import { BilingualSEO, BASE_URL } from "./BilingualSEO";
import { getCategoryOgImage } from "@/lib/ogImageUtils";

interface CategorySEOProps {
  category: {
    name: string;
    name_bn?: string | null;
    slug: string;
    description?: string | null;
    description_bn?: string | null;
    image_url?: string | null;
    // SEO fields
    seo_title?: string | null;
    seo_title_bn?: string | null;
    seo_description?: string | null;
    seo_description_bn?: string | null;
    seo_keywords?: string | null;
    seo_keywords_bn?: string | null;
    og_image?: string | null;
  };
  parentCategory?: {
    name: string;
    name_bn?: string | null;
    slug: string;
  } | null;
  productCount?: number;
  language: "en" | "bn";
}

export const CategorySEO = ({ category, parentCategory, productCount, language }: CategorySEOProps) => {
  // Build SEO title
  const getTitle = () => {
    if (language === "bn") {
      if (category.seo_title_bn) return category.seo_title_bn;
      const categoryName = category.name_bn || category.name;
      const parentName = parentCategory?.name_bn || parentCategory?.name;
      if (parentName) {
        return `${categoryName} - ${parentName} | ST International`;
      }
      return `${categoryName} - পণ্য ক্যাটাগরি | ST International`;
    }
    if (category.seo_title) return category.seo_title;
    const parentName = parentCategory?.name;
    if (parentName) {
      return `${category.name} - ${parentName} | ST International`;
    }
    return `${category.name} - Product Category | ST International`;
  };

  // Build meta description
  const getDescription = () => {
    if (language === "bn") {
      if (category.seo_description_bn) return category.seo_description_bn;
      if (category.description_bn) return category.description_bn;
      const categoryName = category.name_bn || category.name;
      const countText = productCount ? `${productCount}টি পণ্য` : "পণ্য";
      return `${categoryName} - ST International থেকে ${countText} ব্রাউজ করুন। বাংলাদেশে সেরা মানের বৈজ্ঞানিক ও শিল্প যন্ত্রপাতি।`;
    }
    if (category.seo_description) return category.seo_description;
    if (category.description) return category.description;
    const countText = productCount ? `${productCount} products` : "products";
    return `Browse ${category.name} - ${countText} from ST International. Quality scientific and industrial equipment in Bangladesh.`;
  };

  // Get keywords
  const getKeywords = () => {
    if (language === "bn") {
      return category.seo_keywords_bn || "";
    }
    return category.seo_keywords || "";
  };

  // Get OG image using utility function - prioritizes og_image > image_url > default
  const ogImage = getCategoryOgImage(category);

  const title = getTitle();
  const description = getDescription();
  const keywords = getKeywords();

  // Truncate description to 160 chars for meta tag
  const truncatedDescription = description.length > 160 
    ? description.substring(0, 157) + "..."
    : description;

  // Build canonical URL
  const getCanonicalUrl = () => {
    if (parentCategory) {
      return `${BASE_URL}/category/${parentCategory.slug}/${category.slug}`;
    }
    return `${BASE_URL}/category/${category.slug}`;
  };

  return (
    <BilingualSEO
      customTitle={{
        en: language === "en" ? title : (category.seo_title || category.name),
        bn: language === "bn" ? title : (category.seo_title_bn || category.name_bn || category.name),
      }}
      customDescription={{
        en: language === "en" ? truncatedDescription : (category.seo_description || category.description || ""),
        bn: language === "bn" ? truncatedDescription : (category.seo_description_bn || category.description_bn || ""),
      }}
      customKeywords={keywords ? {
        en: category.seo_keywords || "",
        bn: category.seo_keywords_bn || "",
      } : undefined}
      customOgImage={ogImage}
      ogType="website"
      canonicalUrl={getCanonicalUrl()}
    />
  );
};

export default CategorySEO;
