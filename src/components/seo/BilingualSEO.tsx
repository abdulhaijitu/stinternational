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

// SEO configurations for each page - Production-ready B2B-focused titles (50-60 chars) and descriptions (140-160 chars)
const seoConfigs: Record<string, SEOConfig> = {
  // ===== HOMEPAGE =====
  "/": {
    title: {
      en: "ST International | Scientific Equipment Supplier Bangladesh",
      bn: "ST International | বাংলাদেশে বৈজ্ঞানিক যন্ত্রপাতি সরবরাহকারী",
    },
    description: {
      en: "Trusted supplier of scientific, laboratory, and industrial equipment in Bangladesh. Serving universities, research labs, and industries with certified products.",
      bn: "বাংলাদেশে বিশ্ববিদ্যালয়, গবেষণা ল্যাব এবং শিল্প প্রতিষ্ঠানে বৈজ্ঞানিক, ল্যাবরেটরি ও শিল্প যন্ত্রপাতির বিশ্বস্ত সরবরাহকারী।",
    },
    keywords: {
      en: "scientific equipment Bangladesh, laboratory instruments, industrial equipment supplier, ST International",
      bn: "বৈজ্ঞানিক যন্ত্রপাতি বাংলাদেশ, ল্যাবরেটরি যন্ত্র, শিল্প যন্ত্রপাতি সরবরাহকারী",
    },
    ogType: "website",
  },
  // ===== ALL PRODUCTS =====
  "/products": {
    title: {
      en: "Products | ST International – Lab & Industrial Equipment",
      bn: "পণ্য | ST International – ল্যাবরেটরি ও শিল্প যন্ত্রপাতি",
    },
    description: {
      en: "Browse laboratory, measurement, and industrial equipment from ST International. Certified instruments for research institutions and industries in Bangladesh.",
      bn: "ST International থেকে ল্যাবরেটরি, পরিমাপ ও শিল্প যন্ত্রপাতি ব্রাউজ করুন। বাংলাদেশে গবেষণা প্রতিষ্ঠান ও শিল্পের জন্য সার্টিফাইড যন্ত্র।",
    },
    ogType: "website",
  },
  // ===== CATEGORIES =====
  "/categories": {
    title: {
      en: "Equipment Categories | ST International Bangladesh",
      bn: "যন্ত্রপাতি ক্যাটাগরি | ST International বাংলাদেশ",
    },
    description: {
      en: "Explore scientific and industrial equipment categories. Laboratory, measurement, textile, and safety equipment for institutions across Bangladesh.",
      bn: "বৈজ্ঞানিক ও শিল্প যন্ত্রপাতি ক্যাটাগরি অন্বেষণ করুন। বাংলাদেশে প্রতিষ্ঠানগুলির জন্য ল্যাবরেটরি, পরিমাপ, টেক্সটাইল ও সেফটি যন্ত্রপাতি।",
    },
    ogType: "website",
  },
  // ===== REQUEST A QUOTE =====
  "/request-quote": {
    title: {
      en: "Request a Quote | ST International Bangladesh",
      bn: "মূল্য জানুন | ST International বাংলাদেশ",
    },
    description: {
      en: "Submit a quote request for bulk orders and institutional purchases. Receive customized pricing within 24 hours from ST International.",
      bn: "বাল্ক অর্ডার ও প্রাতিষ্ঠানিক ক্রয়ের জন্য কোটেশন জমা দিন। ST International থেকে ২৪ ঘন্টায় কাস্টমাইজড মূল্য পান।",
    },
    ogType: "website",
  },
  // ===== ABOUT US =====
  "/about": {
    title: {
      en: "About Us | ST International – Equipment Supplier",
      bn: "আমাদের সম্পর্কে | ST International – যন্ত্রপাতি সরবরাহকারী",
    },
    description: {
      en: "ST International supplies scientific and industrial equipment to universities, labs, and industries in Bangladesh. Professional support and documentation included.",
      bn: "ST International বাংলাদেশে বিশ্ববিদ্যালয়, ল্যাব ও শিল্পে বৈজ্ঞানিক ও শিল্প যন্ত্রপাতি সরবরাহ করে। পেশাদার সহায়তা ও ডকুমেন্টেশন অন্তর্ভুক্ত।",
    },
    ogType: "website",
  },
  // ===== CONTACT US =====
  "/contact": {
    title: {
      en: "Contact Us | ST International Bangladesh",
      bn: "যোগাযোগ করুন | ST International বাংলাদেশ",
    },
    description: {
      en: "Reach ST International for equipment inquiries, technical support, and institutional orders. Located in Dhaka, serving all of Bangladesh.",
      bn: "যন্ত্রপাতি সংক্রান্ত প্রশ্ন, প্রযুক্তিগত সহায়তা ও প্রাতিষ্ঠানিক অর্ডারের জন্য ST International-এ যোগাযোগ করুন। ঢাকায় অবস্থিত, সারা বাংলাদেশে সেবা।",
    },
    ogType: "website",
  },
  // ===== LOGIN =====
  "/login": {
    title: {
      en: "Login | ST International Account",
      bn: "লগইন | ST International অ্যাকাউন্ট",
    },
    description: {
      en: "Sign in to your ST International account to track orders, view purchase history, and manage your institutional profile.",
      bn: "অর্ডার ট্র্যাক করতে, ক্রয়ের ইতিহাস দেখতে এবং প্রাতিষ্ঠানিক প্রোফাইল পরিচালনা করতে ST International অ্যাকাউন্টে সাইন ইন করুন।",
    },
    ogType: "website",
  },
  // ===== REGISTER =====
  "/register": {
    title: {
      en: "Register | Create ST International Account",
      bn: "নিবন্ধন | ST International অ্যাকাউন্ট তৈরি করুন",
    },
    description: {
      en: "Create an ST International account to place orders, request quotes, and access order tracking for your institution.",
      bn: "অর্ডার দিতে, কোটেশন অনুরোধ করতে এবং আপনার প্রতিষ্ঠানের জন্য অর্ডার ট্র্যাকিং অ্যাক্সেস করতে ST International অ্যাকাউন্ট তৈরি করুন।",
    },
    ogType: "website",
  },
  // ===== WISHLIST =====
  "/wishlist": {
    title: {
      en: "Wishlist | ST International – Saved Products",
      bn: "পছন্দের তালিকা | ST International – সংরক্ষিত পণ্য",
    },
    description: {
      en: "View and manage your saved products. Add items to cart or request quotes for institutional purchases from ST International.",
      bn: "সংরক্ষিত পণ্য দেখুন ও পরিচালনা করুন। ST International থেকে প্রাতিষ্ঠানিক ক্রয়ের জন্য কার্টে যোগ করুন বা কোটেশন অনুরোধ করুন।",
    },
    ogType: "website",
  },
  // ===== CART =====
  "/cart": {
    title: {
      en: "Shopping Cart | ST International",
      bn: "শপিং কার্ট | ST International",
    },
    description: {
      en: "Review items in your cart and proceed to checkout. Free delivery on orders above ৳10,000 within Bangladesh.",
      bn: "কার্টে আইটেম পর্যালোচনা করুন এবং চেকআউটে যান। বাংলাদেশে ৳১০,০০০ এর উপরে অর্ডারে বিনামূল্যে ডেলিভারি।",
    },
    ogType: "website",
  },
  // ===== CHECKOUT =====
  "/checkout": {
    title: {
      en: "Checkout | ST International – Complete Order",
      bn: "চেকআউট | ST International – অর্ডার সম্পন্ন করুন",
    },
    description: {
      en: "Complete your order securely. Payment options include cash on delivery and bank transfer for institutional buyers.",
      bn: "নিরাপদে অর্ডার সম্পন্ন করুন। প্রাতিষ্ঠানিক ক্রেতাদের জন্য ক্যাশ অন ডেলিভারি ও ব্যাংক ট্রান্সফার পেমেন্ট অপশন আছে।",
    },
    ogType: "website",
  },
  // ===== PRIVACY POLICY =====
  "/privacy-policy": {
    title: {
      en: "Privacy Policy | ST International",
      bn: "গোপনীয়তা নীতি | ST International",
    },
    description: {
      en: "Read how ST International collects, uses, and protects your data. Our commitment to privacy for all institutional and individual clients.",
      bn: "ST International কীভাবে আপনার ডেটা সংগ্রহ, ব্যবহার ও সুরক্ষা করে তা পড়ুন। সকল প্রাতিষ্ঠানিক ও ব্যক্তিগত ক্লায়েন্টের জন্য গোপনীয়তার প্রতিশ্রুতি।",
    },
    ogType: "website",
  },
  // ===== TERMS & CONDITIONS =====
  "/terms-conditions": {
    title: {
      en: "Terms & Conditions | ST International",
      bn: "শর্তাবলী | ST International",
    },
    description: {
      en: "Review the terms and conditions for using ST International website, placing orders, and institutional purchasing agreements.",
      bn: "ST International ওয়েবসাইট ব্যবহার, অর্ডার প্রদান এবং প্রাতিষ্ঠানিক ক্রয় চুক্তির শর্তাবলী পর্যালোচনা করুন।",
    },
    ogType: "website",
  },
  // ===== RETURN & REFUND POLICY =====
  "/refund-policy": {
    title: {
      en: "Refund & Return Policy | ST International",
      bn: "ফেরত ও রিটার্ন নীতি | ST International",
    },
    description: {
      en: "Understand ST International's refund and return policy for equipment purchases. Clear guidelines for institutional and individual buyers.",
      bn: "যন্ত্রপাতি ক্রয়ের জন্য ST International-এর ফেরত ও রিটার্ন নীতি বুঝুন। প্রাতিষ্ঠানিক ও ব্যক্তিগত ক্রেতাদের জন্য স্পষ্ট নির্দেশিকা।",
    },
    ogType: "website",
  },
  // ===== MY ACCOUNT =====
  "/account": {
    title: {
      en: "My Account | ST International",
      bn: "আমার অ্যাকাউন্ট | ST International",
    },
    description: {
      en: "Manage your ST International account. View orders, update profile details, and access your institutional purchase history.",
      bn: "ST International অ্যাকাউন্ট পরিচালনা করুন। অর্ডার দেখুন, প্রোফাইল আপডেট করুন এবং প্রাতিষ্ঠানিক ক্রয়ের ইতিহাস অ্যাক্সেস করুন।",
    },
    ogType: "website",
  },
  // ===== MY ORDERS =====
  "/orders": {
    title: {
      en: "My Orders | ST International – Order History",
      bn: "আমার অর্ডার | ST International – অর্ডার ইতিহাস",
    },
    description: {
      en: "Track and view your order history with ST International. Monitor delivery status and access purchase documentation.",
      bn: "ST International-এ অর্ডার ইতিহাস ট্র্যাক করুন ও দেখুন। ডেলিভারি স্ট্যাটাস মনিটর করুন এবং ক্রয় ডকুমেন্টেশন অ্যাক্সেস করুন।",
    },
    ogType: "website",
  },
  // ===== TRACK ORDER =====
  "/track-order": {
    title: {
      en: "Track Order | ST International",
      bn: "অর্ডার ট্র্যাক করুন | ST International",
    },
    description: {
      en: "Track your order status with ST International. Enter your order number to view real-time delivery updates.",
      bn: "ST International-এ অর্ডার স্ট্যাটাস ট্র্যাক করুন। রিয়েল-টাইম ডেলিভারি আপডেট দেখতে অর্ডার নম্বর দিন।",
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
