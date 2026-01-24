import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  DEFAULT_OG_IMAGE as OG_DEFAULT,
  ensureAbsoluteUrl,
  BASE_URL as OG_BASE_URL,
  isPreviewDomain
} from "@/lib/ogImageUtils";

interface SEOConfig {
  title: { en: string; bn: string };
  description: { en: string; bn: string };
  keywords?: { en: string; bn: string };
  ogImage?: string;
  ogType?: string;
}

// SEO configurations for each page - Standardized B2B-focused titles (max 55-60 chars)
const seoConfigs: Record<string, SEOConfig> = {
  "/": {
    title: {
      en: "ST International | Scientific & Industrial Equipment Supplier in Bangladesh",
      bn: "ST International | বাংলাদেশে বৈজ্ঞানিক ও শিল্প যন্ত্রপাতি সরবরাহকারী",
    },
    description: {
      en: "Trusted supplier of scientific, laboratory, industrial, and educational equipment in Bangladesh. Serving institutions with quality products, documentation, and support.",
      bn: "বাংলাদেশে বৈজ্ঞানিক, ল্যাবরেটরি, শিল্প এবং শিক্ষামূলক যন্ত্রপাতির বিশ্বস্ত সরবরাহকারী। মানসম্পন্ন পণ্য, ডকুমেন্টেশন এবং সহায়তা সহ প্রতিষ্ঠানগুলিকে সেবা প্রদান।",
    },
    keywords: {
      en: "scientific equipment Bangladesh, laboratory instruments, industrial equipment supplier, ST International",
      bn: "বৈজ্ঞানিক যন্ত্রপাতি বাংলাদেশ, ল্যাবরেটরি যন্ত্র, শিল্প যন্ত্রপাতি সরবরাহকারী, ST International",
    },
    ogType: "website",
  },
  "/products": {
    title: {
      en: "Products | ST International – Laboratory & Industrial Equipment",
      bn: "পণ্য | ST International – ল্যাবরেটরি ও শিল্প যন্ত্রপাতি",
    },
    description: {
      en: "Browse scientific, laboratory, and industrial equipment from ST International. Quality instruments for research institutions and industries in Bangladesh.",
      bn: "ST International থেকে বৈজ্ঞানিক, ল্যাবরেটরি এবং শিল্প যন্ত্রপাতি ব্রাউজ করুন। বাংলাদেশে গবেষণা প্রতিষ্ঠান ও শিল্পের জন্য মানসম্পন্ন যন্ত্র।",
    },
    ogType: "website",
  },
  "/categories": {
    title: {
      en: "Categories | ST International – Equipment Categories",
      bn: "ক্যাটাগরি | ST International – যন্ত্রপাতি ক্যাটাগরি",
    },
    description: {
      en: "Explore product categories including laboratory, measurement, and industrial equipment from ST International Bangladesh.",
      bn: "ST International বাংলাদেশ থেকে ল্যাবরেটরি, পরিমাপ এবং শিল্প যন্ত্রপাতি সহ পণ্য ক্যাটাগরি অন্বেষণ করুন।",
    },
    ogType: "website",
  },
  "/about": {
    title: {
      en: "About ST International | Trusted Scientific Equipment Supplier",
      bn: "ST International সম্পর্কে | বিশ্বস্ত বৈজ্ঞানিক যন্ত্রপাতি সরবরাহকারী",
    },
    description: {
      en: "ST International is Bangladesh's trusted supplier of scientific and industrial equipment, serving institutions with quality products and professional support.",
      bn: "ST International বাংলাদেশের বিশ্বস্ত বৈজ্ঞানিক ও শিল্প যন্ত্রপাতি সরবরাহকারী, মানসম্পন্ন পণ্য এবং পেশাদার সহায়তা সহ প্রতিষ্ঠানগুলিকে সেবা প্রদান করে।",
    },
    ogType: "website",
  },
  "/contact": {
    title: {
      en: "Contact ST International | Laboratory & Industrial Solutions",
      bn: "ST International-এ যোগাযোগ | ল্যাবরেটরি ও শিল্প সমাধান",
    },
    description: {
      en: "Contact ST International for scientific and industrial equipment inquiries. Professional support for institutions across Bangladesh.",
      bn: "বৈজ্ঞানিক এবং শিল্প যন্ত্রপাতি সম্পর্কে জানতে ST International-এ যোগাযোগ করুন। বাংলাদেশ জুড়ে প্রতিষ্ঠানগুলির জন্য পেশাদার সহায়তা।",
    },
    ogType: "website",
  },
  "/request-quote": {
    title: {
      en: "Request a Quote - Bulk Orders & Institutional Pricing | ST International",
      bn: "মূল্য জানতে চান - বাল্ক অর্ডার ও প্রাতিষ্ঠানিক মূল্য | ST International",
    },
    description: {
      en: "Get personalized pricing for bulk orders and institutional purchases. Submit your requirements and receive a quote within 24 hours.",
      bn: "বাল্ক অর্ডার এবং প্রাতিষ্ঠানিক ক্রয়ের জন্য ব্যক্তিগত মূল্য পান। আপনার প্রয়োজনীয়তা জমা দিন এবং ২৪ ঘন্টার মধ্যে কোটেশন পান।",
    },
    ogType: "website",
  },
  "/cart": {
    title: {
      en: "Shopping Cart - ST International",
      bn: "শপিং কার্ট - ST International",
    },
    description: {
      en: "Review your shopping cart and proceed to checkout. Free delivery on orders over ৳10,000.",
      bn: "আপনার শপিং কার্ট পর্যালোচনা করুন এবং চেকআউটে যান। ৳১০,০০০ এর উপরে অর্ডারে ফ্রি ডেলিভারি।",
    },
    ogType: "website",
  },
  "/checkout": {
    title: {
      en: "Checkout - Complete Your Order | ST International",
      bn: "চেকআউট - আপনার অর্ডার সম্পন্ন করুন | ST International",
    },
    description: {
      en: "Complete your order with secure checkout. Cash on delivery and bank transfer payment options available.",
      bn: "নিরাপদ চেকআউটের মাধ্যমে আপনার অর্ডার সম্পন্ন করুন। ক্যাশ অন ডেলিভারি এবং ব্যাংক ট্রান্সফার পেমেন্ট অপশন উপলব্ধ।",
    },
    ogType: "website",
  },
  "/wishlist": {
    title: {
      en: "My Wishlist - Saved Products | ST International",
      bn: "আমার উইশলিস্ট - সংরক্ষিত পণ্য | ST International",
    },
    description: {
      en: "View your saved products and add them to cart when you're ready to purchase.",
      bn: "আপনার সংরক্ষিত পণ্য দেখুন এবং কেনার জন্য প্রস্তুত হলে কার্টে যোগ করুন।",
    },
    ogType: "website",
  },
  "/account": {
    title: {
      en: "My Account - ST International",
      bn: "আমার অ্যাকাউন্ট - ST International",
    },
    description: {
      en: "Manage your account, view order history, and update your profile information.",
      bn: "আপনার অ্যাকাউন্ট পরিচালনা করুন, অর্ডার ইতিহাস দেখুন এবং আপনার প্রোফাইল তথ্য আপডেট করুন।",
    },
    ogType: "website",
  },
  "/orders": {
    title: {
      en: "My Orders - Order History | ST International",
      bn: "আমার অর্ডার - অর্ডার ইতিহাস | ST International",
    },
    description: {
      en: "View and track your order history. Check order status and delivery updates.",
      bn: "আপনার অর্ডার ইতিহাস দেখুন এবং ট্র্যাক করুন। অর্ডার স্ট্যাটাস এবং ডেলিভারি আপডেট চেক করুন।",
    },
    ogType: "website",
  },
  "/privacy-policy": {
    title: {
      en: "Privacy Policy - ST International",
      bn: "গোপনীয়তা নীতি - ST International",
    },
    description: {
      en: "Read our privacy policy to understand how we collect, use, and protect your personal information.",
      bn: "আমরা কীভাবে আপনার ব্যক্তিগত তথ্য সংগ্রহ, ব্যবহার এবং সুরক্ষা করি তা বুঝতে আমাদের গোপনীয়তা নীতি পড়ুন।",
    },
    ogType: "website",
  },
  "/terms-conditions": {
    title: {
      en: "Terms & Conditions - ST International",
      bn: "শর্তাবলী - ST International",
    },
    description: {
      en: "Read our terms and conditions for using ST International's website and services.",
      bn: "ST International-এর ওয়েবসাইট এবং সেবা ব্যবহারের জন্য আমাদের শর্তাবলী পড়ুন।",
    },
    ogType: "website",
  },
  "/refund-policy": {
    title: {
      en: "Refund Policy - ST International",
      bn: "ফেরত নীতি - ST International",
    },
    description: {
      en: "Learn about our refund and return policy for product purchases.",
      bn: "পণ্য ক্রয়ের জন্য আমাদের ফেরত এবং রিটার্ন নীতি সম্পর্কে জানুন।",
    },
    ogType: "website",
  },
};

// Default SEO for pages not explicitly configured
const defaultSEO: SEOConfig = {
  title: {
    en: "ST International | Scientific & Industrial Equipment Supplier",
    bn: "ST International | বৈজ্ঞানিক ও শিল্প যন্ত্রপাতি সরবরাহকারী",
  },
  description: {
    en: "Trusted supplier of scientific, laboratory, and industrial equipment in Bangladesh. Serving institutions with quality products and support.",
    bn: "বাংলাদেশে বৈজ্ঞানিক, ল্যাবরেটরি এবং শিল্প যন্ত্রপাতির বিশ্বস্ত সরবরাহকারী। মানসম্পন্ন পণ্য এবং সহায়তা সহ প্রতিষ্ঠানগুলিকে সেবা প্রদান।",
  },
  ogType: "website",
};

export const BASE_URL = OG_BASE_URL;
export const DEFAULT_OG_IMAGE = OG_DEFAULT;

interface BilingualSEOProps {
  customTitle?: { en: string; bn: string };
  customDescription?: { en: string; bn: string };
  customKeywords?: { en: string; bn: string };
  customOgImage?: string;
  ogType?: "website" | "product" | "article";
  noIndex?: boolean;
  canonicalUrl?: string;
  productData?: {
    name: string;
    description: string;
    price: number;
    currency?: string;
    availability?: "in_stock" | "out_of_stock";
    image?: string;
    sku?: string;
    brand?: string;
    category?: string;
  };
}

export const BilingualSEO = ({
  customTitle,
  customDescription,
  customKeywords,
  customOgImage,
  ogType = "website",
  noIndex = false,
  canonicalUrl,
  productData,
}: BilingualSEOProps) => {
  const { language } = useLanguage();
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    // Get SEO config for current path
    const config = seoConfigs[pathname] || defaultSEO;
    
    // Use custom values if provided, otherwise use config
    const title = customTitle?.[language] || config.title[language];
    const description = customDescription?.[language] || config.description[language];
    const keywords = customKeywords?.[language] || config.keywords?.[language] || "";
    const ogImage = customOgImage || config.ogImage || DEFAULT_OG_IMAGE;
    const finalCanonicalUrl = canonicalUrl || `${BASE_URL}${pathname}`;

    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (selector: string, content: string, isProperty = false) => {
      if (!content) return;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement("meta");
        if (isProperty) {
          meta.setAttribute("property", selector.replace(/\[property="(.*)"\]/, "$1"));
        } else {
          meta.setAttribute("name", selector.replace(/\[name="(.*)"\]/, "$1"));
        }
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Remove meta tag if exists
    const removeMetaTag = (selector: string) => {
      const meta = document.querySelector(selector);
      if (meta) meta.remove();
    };

    // Update meta description
    updateMetaTag('meta[name="description"]', description);

    // Update keywords if provided
    if (keywords) {
      updateMetaTag('meta[name="keywords"]', keywords);
    } else {
      removeMetaTag('meta[name="keywords"]');
    }

    // Update Open Graph tags
    updateMetaTag('meta[property="og:title"]', title, true);
    updateMetaTag('meta[property="og:description"]', description, true);
    updateMetaTag('meta[property="og:url"]', finalCanonicalUrl, true);
    updateMetaTag('meta[property="og:image"]', ogImage, true);
    updateMetaTag('meta[property="og:image:width"]', "1200", true);
    updateMetaTag('meta[property="og:image:height"]', "630", true);
    updateMetaTag('meta[property="og:image:alt"]', title, true);
    updateMetaTag('meta[property="og:type"]', ogType === "product" ? "product" : "website", true);
    updateMetaTag('meta[property="og:site_name"]', "ST International", true);
    updateMetaTag('meta[property="og:locale"]', language === "bn" ? "bn_BD" : "en_US", true);
    updateMetaTag('meta[property="og:locale:alternate"]', language === "bn" ? "en_US" : "bn_BD", true);

    // Update Twitter tags
    updateMetaTag('meta[name="twitter:card"]', "summary_large_image");
    updateMetaTag('meta[name="twitter:title"]', title);
    updateMetaTag('meta[name="twitter:description"]', description);
    updateMetaTag('meta[name="twitter:image"]', ogImage);
    updateMetaTag('meta[name="twitter:image:alt"]', title);
    updateMetaTag('meta[name="twitter:site"]', "@STInternational");

    // Update HTML lang attribute
    document.documentElement.lang = language === "bn" ? "bn" : "en";
    document.documentElement.className = language === "bn" ? "font-bangla" : "font-english";

    // Update hreflang tags
    const updateHreflangTag = (lang: string, href: string) => {
      const selector = `link[rel="alternate"][hreflang="${lang}"]`;
      let link = document.querySelector(selector) as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "alternate";
        link.hreflang = lang;
        document.head.appendChild(link);
      }
      link.href = href;
    };

    // Set hreflang for both languages
    updateHreflangTag("en", finalCanonicalUrl);
    updateHreflangTag("bn", finalCanonicalUrl);
    updateHreflangTag("x-default", finalCanonicalUrl);

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = finalCanonicalUrl;

    // Handle noindex for admin pages, preview domains, or as specified
    const isAdminPage = pathname.startsWith("/admin");
    const isPreview = isPreviewDomain();
    let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
    
    // Always noindex preview/staging domains and admin pages
    if (noIndex || isAdminPage || isPreview) {
      if (!robots) {
        robots = document.createElement("meta");
        robots.name = "robots";
        document.head.appendChild(robots);
      }
      robots.content = "noindex, nofollow";
    } else {
      if (!robots) {
        robots = document.createElement("meta");
        robots.name = "robots";
        document.head.appendChild(robots);
      }
      robots.content = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
    }

    // Add product structured data if product data is provided
    if (productData) {
      const existingScript = document.querySelector('script[type="application/ld+json"][data-type="product"]');
      if (existingScript) existingScript.remove();

      const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: productData.name,
        description: productData.description,
        image: productData.image || ogImage,
        sku: productData.sku,
        brand: {
          "@type": "Brand",
          name: productData.brand || "ST International",
        },
        category: productData.category,
        offers: {
          "@type": "Offer",
          price: productData.price,
          priceCurrency: productData.currency || "BDT",
          availability: productData.availability === "out_of_stock" 
            ? "https://schema.org/OutOfStock" 
            : "https://schema.org/InStock",
          seller: {
            "@type": "Organization",
            name: "ST International",
          },
        },
      };

      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-type", "product");
      script.textContent = JSON.stringify(productSchema);
      document.head.appendChild(script);
    } else {
      // Remove product schema if exists
      const existingScript = document.querySelector('script[type="application/ld+json"][data-type="product"]');
      if (existingScript) existingScript.remove();
    }

    // Cleanup function
    return () => {
      // Cleanup product schema on unmount
      const productScript = document.querySelector('script[type="application/ld+json"][data-type="product"]');
      if (productScript) productScript.remove();
    };
  }, [language, pathname, customTitle, customDescription, customKeywords, customOgImage, ogType, noIndex, canonicalUrl, productData]);

  return null;
};

export default BilingualSEO;
