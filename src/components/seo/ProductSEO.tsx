import { BilingualSEO, BASE_URL } from "./BilingualSEO";
import { getProductOgImage } from "@/lib/ogImageUtils";

interface ProductSEOProps {
  product: {
    name: string;
    name_bn?: string | null;
    slug: string;
    short_description?: string | null;
    short_description_bn?: string | null;
    description?: string | null;
    description_bn?: string | null;
    price: number;
    image_url?: string | null;
    images?: string[] | null;
    sku?: string | null;
    in_stock?: boolean | null;
    // SEO fields
    seo_title?: string | null;
    seo_title_bn?: string | null;
    seo_description?: string | null;
    seo_description_bn?: string | null;
    seo_keywords?: string | null;
    seo_keywords_bn?: string | null;
    og_image?: string | null;
  };
  category?: {
    name: string;
    name_bn?: string | null;
    slug: string;
    og_image?: string | null;
    image_url?: string | null;
  } | null;
  language: "en" | "bn";
}

export const ProductSEO = ({ product, category, language }: ProductSEOProps) => {
  // Build SEO title - Product Title Format: "{{Product Name}} | ST International Bangladesh"
  const getTitle = () => {
    if (language === "bn") {
      if (product.seo_title_bn) return product.seo_title_bn;
      const productName = product.name_bn || product.name;
      // Truncate product name if needed to keep under 60 chars
      const maxNameLength = 35; // "| ST International বাংলাদেশ" takes ~25 chars
      const truncatedName = productName.length > maxNameLength 
        ? productName.substring(0, maxNameLength - 3) + "..."
        : productName;
      return `${truncatedName} | ST International বাংলাদেশ`;
    }
    if (product.seo_title) return product.seo_title;
    // Truncate product name if needed to keep under 60 chars
    const maxNameLength = 35; // " | ST International Bangladesh" takes ~30 chars
    const truncatedName = product.name.length > maxNameLength 
      ? product.name.substring(0, maxNameLength - 3) + "..."
      : product.name;
    return `${truncatedName} | ST International Bangladesh`;
  };

  // Build meta description - use custom SEO description or short description
  const getDescription = () => {
    if (language === "bn") {
      if (product.seo_description_bn) return product.seo_description_bn;
      return product.short_description_bn || product.description_bn || 
        `${product.name_bn || product.name} - ST International থেকে উন্নত মানের পণ্য`;
    }
    if (product.seo_description) return product.seo_description;
    return product.short_description || product.description || 
      `${product.name} - High quality products from ST International`;
  };

  // Get keywords
  const getKeywords = () => {
    if (language === "bn") {
      return product.seo_keywords_bn || "";
    }
    return product.seo_keywords || "";
  };

  // Get OG image with full fallback chain
  // Priority: product og_image > product image_url > product images[0] > category image > homepage OG
  const ogImage = getProductOgImage(product, category);

  const title = getTitle();
  const description = getDescription();
  const keywords = getKeywords();

  // Truncate description to 160 chars for meta tag
  const truncatedDescription = description.length > 160 
    ? description.substring(0, 157) + "..."
    : description;

  return (
    <BilingualSEO
      customTitle={{
        en: language === "en" ? title : getTitle(),
        bn: language === "bn" ? title : (product.seo_title_bn || product.name_bn || product.name),
      }}
      customDescription={{
        en: language === "en" ? truncatedDescription : (product.seo_description || product.short_description || ""),
        bn: language === "bn" ? truncatedDescription : (product.seo_description_bn || product.short_description_bn || ""),
      }}
      customKeywords={keywords ? {
        en: product.seo_keywords || "",
        bn: product.seo_keywords_bn || "",
      } : undefined}
      customOgImage={ogImage}
      ogType="product"
      canonicalUrl={`${BASE_URL}/product/${product.slug}`}
      productData={{
        name: language === "bn" ? (product.name_bn || product.name) : product.name,
        description: truncatedDescription,
        price: product.price,
        currency: "BDT",
        availability: product.in_stock ? "in_stock" : "out_of_stock",
        image: ogImage,
        sku: product.sku || undefined,
        brand: "ST International",
        category: category ? (language === "bn" ? (category.name_bn || category.name) : category.name) : undefined,
      }}
    />
  );
};

export default ProductSEO;
