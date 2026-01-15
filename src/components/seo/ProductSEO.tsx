import { useEffect } from "react";
import { BilingualSEO, BASE_URL, DEFAULT_OG_IMAGE } from "./BilingualSEO";

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
  } | null;
  language: "en" | "bn";
}

export const ProductSEO = ({ product, category, language }: ProductSEOProps) => {
  // Build SEO title - use custom SEO title or generate from product name
  const getTitle = () => {
    if (language === "bn") {
      if (product.seo_title_bn) return product.seo_title_bn;
      const productName = product.name_bn || product.name;
      const categoryName = category?.name_bn || category?.name || "";
      return categoryName 
        ? `${productName} - ${categoryName} | ST International`
        : `${productName} | ST International`;
    }
    if (product.seo_title) return product.seo_title;
    const categoryName = category?.name || "";
    return categoryName 
      ? `${product.name} - ${categoryName} | ST International`
      : `${product.name} | ST International`;
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

  // Get OG image - use product og_image, first product image, or default
  const getOgImage = () => {
    if (product.og_image) return product.og_image;
    if (product.image_url) return product.image_url;
    if (product.images && product.images.length > 0) return product.images[0];
    return DEFAULT_OG_IMAGE;
  };

  const title = getTitle();
  const description = getDescription();
  const keywords = getKeywords();
  const ogImage = getOgImage();

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
