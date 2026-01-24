/**
 * OG Image Utility Functions
 * Handles resolution and fallback logic for Open Graph images
 * 
 * Fallback Chain:
 * - Homepage: og-home.jpg (static)
 * - Category: category image > homepage OG
 * - Sub-category: sub-category image > parent category image > homepage OG
 * - Product: product image > category image > homepage OG
 * - Static pages: homepage OG
 */

// Primary production domain - all canonical URLs point here
export const BASE_URL = "https://stinternationalbd.com";

// Homepage OG image - static, high-quality 1200x630
export const HOMEPAGE_OG_IMAGE = `${BASE_URL}/og-home.jpg`;

// Default fallback (same as homepage for consistency)
export const DEFAULT_OG_IMAGE = HOMEPAGE_OG_IMAGE;

// Preview domains that should NOT be indexed
export const PREVIEW_DOMAINS = [
  "stinternational.lovable.app",
  "lovable.app",
  "preview--",
  "localhost",
  "id-preview--"
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
export const OG_IMAGE_TYPE = "image/jpeg";

/**
 * Ensures an image URL is absolute (starts with http/https)
 * If relative, prepends the base URL
 */
export const ensureAbsoluteUrl = (url: string | null | undefined): string => {
  if (!url) return DEFAULT_OG_IMAGE;
  
  // Trim whitespace
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return DEFAULT_OG_IMAGE;
  
  // Already absolute URL
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    return trimmedUrl;
  }
  
  // Handle Supabase storage URLs (they start with the project URL)
  if (trimmedUrl.includes('supabase.co')) {
    return trimmedUrl;
  }
  
  // Relative URL - prepend base URL
  return `${BASE_URL}${trimmedUrl.startsWith('/') ? '' : '/'}${trimmedUrl}`;
};

/**
 * Check if an image URL is valid (not null, undefined, or empty string)
 */
export const isValidImageUrl = (url: string | null | undefined): boolean => {
  return Boolean(url && url.trim().length > 0);
};

/**
 * Get OG image for a product with full fallback chain
 * Priority: og_image > image_url > first image in images array > category image > homepage OG
 */
export const getProductOgImage = (
  product: {
    og_image?: string | null;
    image_url?: string | null;
    images?: string[] | null;
  },
  category?: {
    og_image?: string | null;
    image_url?: string | null;
  } | null
): string => {
  // 1. Product-specific OG image
  if (isValidImageUrl(product.og_image)) {
    return ensureAbsoluteUrl(product.og_image);
  }
  
  // 2. Product main image
  if (isValidImageUrl(product.image_url)) {
    return ensureAbsoluteUrl(product.image_url);
  }
  
  // 3. First image from gallery
  if (product.images && product.images.length > 0 && isValidImageUrl(product.images[0])) {
    return ensureAbsoluteUrl(product.images[0]);
  }
  
  // 4. Category image fallback
  if (category) {
    if (isValidImageUrl(category.og_image)) {
      return ensureAbsoluteUrl(category.og_image);
    }
    if (isValidImageUrl(category.image_url)) {
      return ensureAbsoluteUrl(category.image_url);
    }
  }
  
  // 5. Homepage OG (final fallback)
  return HOMEPAGE_OG_IMAGE;
};

/**
 * Get OG image for a category with full fallback chain
 * Priority: og_image > image_url > parent category image > homepage OG
 */
export const getCategoryOgImage = (
  category: {
    og_image?: string | null;
    image_url?: string | null;
  },
  parentCategory?: {
    og_image?: string | null;
    image_url?: string | null;
  } | null
): string => {
  // 1. Category-specific OG image
  if (isValidImageUrl(category.og_image)) {
    return ensureAbsoluteUrl(category.og_image);
  }
  
  // 2. Category main image
  if (isValidImageUrl(category.image_url)) {
    return ensureAbsoluteUrl(category.image_url);
  }
  
  // 3. Parent category image fallback (for sub-categories)
  if (parentCategory) {
    if (isValidImageUrl(parentCategory.og_image)) {
      return ensureAbsoluteUrl(parentCategory.og_image);
    }
    if (isValidImageUrl(parentCategory.image_url)) {
      return ensureAbsoluteUrl(parentCategory.image_url);
    }
  }
  
  // 4. Homepage OG (final fallback)
  return HOMEPAGE_OG_IMAGE;
};

/**
 * Get OG image for a static page
 * Priority: og_image from page_seo > homepage OG
 */
export const getPageOgImage = (pageSeo: {
  og_image?: string | null;
} | null): string => {
  if (pageSeo && isValidImageUrl(pageSeo.og_image)) {
    return ensureAbsoluteUrl(pageSeo.og_image);
  }
  // Static pages always fall back to homepage OG
  return HOMEPAGE_OG_IMAGE;
};

/**
 * Get the homepage OG image (always static)
 */
export const getHomepageOgImage = (): string => {
  return HOMEPAGE_OG_IMAGE;
};
