/**
 * OG Image Utility Functions
 * Handles resolution and fallback logic for Open Graph images
 */

// Primary production domain - all canonical URLs point here
export const BASE_URL = "https://stinternationalbd.com";
export const DEFAULT_OG_IMAGE = `${BASE_URL}/og-default.png`;

// Preview domains that should NOT be indexed
export const PREVIEW_DOMAINS = [
  "stinternational.lovable.app",
  "lovable.app",
  "preview--",
  "localhost"
];

/**
 * Check if the current URL is a preview/staging domain
 */
export const isPreviewDomain = (): boolean => {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  return PREVIEW_DOMAINS.some(domain => hostname.includes(domain));
};

// OG image dimensions (standard for social sharing)
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/**
 * Ensures an image URL is absolute (starts with http/https)
 * If relative, prepends the base URL
 */
export const ensureAbsoluteUrl = (url: string | null | undefined): string => {
  if (!url) return DEFAULT_OG_IMAGE;
  
  // Already absolute URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Handle Supabase storage URLs
  if (url.includes('supabase.co')) {
    return url;
  }
  
  // Relative URL - prepend base URL
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

/**
 * Get OG image for a product
 * Priority: og_image > image_url > first image in images array > default
 */
export const getProductOgImage = (product: {
  og_image?: string | null;
  image_url?: string | null;
  images?: string[] | null;
}): string => {
  if (product.og_image) {
    return ensureAbsoluteUrl(product.og_image);
  }
  if (product.image_url) {
    return ensureAbsoluteUrl(product.image_url);
  }
  if (product.images && product.images.length > 0) {
    return ensureAbsoluteUrl(product.images[0]);
  }
  return DEFAULT_OG_IMAGE;
};

/**
 * Get OG image for a category
 * Priority: og_image > image_url > default
 */
export const getCategoryOgImage = (category: {
  og_image?: string | null;
  image_url?: string | null;
}): string => {
  if (category.og_image) {
    return ensureAbsoluteUrl(category.og_image);
  }
  if (category.image_url) {
    return ensureAbsoluteUrl(category.image_url);
  }
  return DEFAULT_OG_IMAGE;
};

/**
 * Get OG image for a static page
 * Priority: og_image from page_seo > default
 */
export const getPageOgImage = (pageSeo: {
  og_image?: string | null;
} | null): string => {
  if (pageSeo?.og_image) {
    return ensureAbsoluteUrl(pageSeo.og_image);
  }
  return DEFAULT_OG_IMAGE;
};

/**
 * Check if an image URL is valid (not null, undefined, or empty string)
 */
export const isValidImageUrl = (url: string | null | undefined): boolean => {
  return Boolean(url && url.trim().length > 0);
};
