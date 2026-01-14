import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface SEOConfig {
  title: { en: string; bn: string };
  description: { en: string; bn: string };
  keywords?: { en: string; bn: string };
  ogImage?: string;
}

// SEO configurations for each page
const seoConfigs: Record<string, SEOConfig> = {
  "/": {
    title: {
      en: "ST International - Scientific & Industrial Equipment in Bangladesh",
      bn: "ST International - বাংলাদেশে বৈজ্ঞানিক ও শিল্প যন্ত্রপাতি",
    },
    description: {
      en: "Your trusted partner for scientific, laboratory, industrial, and educational equipment in Bangladesh. Quality products with expert support since 2005.",
      bn: "বাংলাদেশে বৈজ্ঞানিক, ল্যাবরেটরি, শিল্প এবং শিক্ষামূলক যন্ত্রপাতির আপনার বিশ্বস্ত অংশীদার। ২০০৫ সাল থেকে বিশেষজ্ঞ সহায়তা সহ মানসম্পন্ন পণ্য।",
    },
    keywords: {
      en: "scientific equipment, laboratory instruments, industrial equipment, Bangladesh, ST International",
      bn: "বৈজ্ঞানিক যন্ত্রপাতি, ল্যাবরেটরি যন্ত্র, শিল্প যন্ত্রপাতি, বাংলাদেশ, ST International",
    },
  },
  "/products": {
    title: {
      en: "All Products - Scientific & Industrial Equipment | ST International",
      bn: "সকল পণ্য - বৈজ্ঞানিক ও শিল্প যন্ত্রপাতি | ST International",
    },
    description: {
      en: "Browse our complete range of scientific, laboratory, and industrial equipment. Quality instruments for research, education, and industry.",
      bn: "আমাদের বৈজ্ঞানিক, ল্যাবরেটরি এবং শিল্প যন্ত্রপাতির সম্পূর্ণ পরিসর দেখুন। গবেষণা, শিক্ষা এবং শিল্পের জন্য মানসম্পন্ন যন্ত্র।",
    },
  },
  "/categories": {
    title: {
      en: "Product Categories - Laboratory & Industrial Equipment | ST International",
      bn: "পণ্য ক্যাটাগরি - ল্যাবরেটরি ও শিল্প যন্ত্রপাতি | ST International",
    },
    description: {
      en: "Explore our product categories including laboratory equipment, measurement instruments, industrial machinery, and educational supplies.",
      bn: "ল্যাবরেটরি যন্ত্রপাতি, পরিমাপ যন্ত্র, শিল্প যন্ত্রপাতি এবং শিক্ষামূলক সরবরাহ সহ আমাদের পণ্য ক্যাটাগরি অন্বেষণ করুন।",
    },
  },
  "/about": {
    title: {
      en: "About Us - ST International | Scientific Equipment Supplier Since 2005",
      bn: "আমাদের সম্পর্কে - ST International | ২০০৫ সাল থেকে বৈজ্ঞানিক যন্ত্রপাতি সরবরাহকারী",
    },
    description: {
      en: "Learn about ST International's 19+ years of experience as Bangladesh's trusted supplier of scientific and industrial equipment. Our mission, vision, and values.",
      bn: "বাংলাদেশের বিশ্বস্ত বৈজ্ঞানিক ও শিল্প যন্ত্রপাতি সরবরাহকারী হিসেবে ST International-এর ১৯+ বছরের অভিজ্ঞতা সম্পর্কে জানুন। আমাদের মিশন, ভিশন এবং মূল্যবোধ।",
    },
  },
  "/contact": {
    title: {
      en: "Contact Us - ST International | Get in Touch for Equipment Inquiries",
      bn: "যোগাযোগ করুন - ST International | যন্ত্রপাতি সম্পর্কে জানতে যোগাযোগ করুন",
    },
    description: {
      en: "Contact ST International for scientific and industrial equipment inquiries. Visit our Dhaka office or reach us via phone and email.",
      bn: "বৈজ্ঞানিক এবং শিল্প যন্ত্রপাতি সম্পর্কে জানতে ST International-এ যোগাযোগ করুন। আমাদের ঢাকা অফিসে আসুন বা ফোন ও ইমেইলে যোগাযোগ করুন।",
    },
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
  },
};

// Default SEO for pages not explicitly configured
const defaultSEO: SEOConfig = {
  title: {
    en: "ST International - Scientific & Industrial Equipment",
    bn: "ST International - বৈজ্ঞানিক ও শিল্প যন্ত্রপাতি",
  },
  description: {
    en: "Your trusted partner for scientific, industrial, and educational equipment in Bangladesh.",
    bn: "বাংলাদেশে বৈজ্ঞানিক, শিল্প এবং শিক্ষামূলক যন্ত্রপাতির আপনার বিশ্বস্ত অংশীদার।",
  },
};

const BASE_URL = "https://stinternational.lovable.app";

interface BilingualSEOProps {
  customTitle?: { en: string; bn: string };
  customDescription?: { en: string; bn: string };
  customOgImage?: string;
  noIndex?: boolean;
}

export const BilingualSEO = ({
  customTitle,
  customDescription,
  customOgImage,
  noIndex = false,
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
    const ogImage = customOgImage || config.ogImage || `${BASE_URL}/og-image.png`;

    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (selector: string, content: string, isProperty = false) => {
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

    // Update meta description
    updateMetaTag('meta[name="description"]', description);

    // Update Open Graph tags
    updateMetaTag('meta[property="og:title"]', title, true);
    updateMetaTag('meta[property="og:description"]', description, true);
    updateMetaTag('meta[property="og:url"]', `${BASE_URL}${pathname}`, true);
    updateMetaTag('meta[property="og:image"]', ogImage, true);
    updateMetaTag('meta[property="og:locale"]', language === "bn" ? "bn_BD" : "en_US", true);
    updateMetaTag('meta[property="og:locale:alternate"]', language === "bn" ? "en_US" : "bn_BD", true);

    // Update Twitter tags
    updateMetaTag('meta[name="twitter:title"]', title);
    updateMetaTag('meta[name="twitter:description"]', description);
    updateMetaTag('meta[name="twitter:image"]', ogImage);

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
    updateHreflangTag("en", `${BASE_URL}${pathname}`);
    updateHreflangTag("bn", `${BASE_URL}${pathname}`);
    updateHreflangTag("x-default", `${BASE_URL}${pathname}`);

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${BASE_URL}${pathname}`;

    // Handle noindex
    let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
    if (noIndex) {
      if (!robots) {
        robots = document.createElement("meta");
        robots.name = "robots";
        document.head.appendChild(robots);
      }
      robots.content = "noindex, nofollow";
    } else if (robots) {
      robots.remove();
    }

  }, [language, pathname, customTitle, customDescription, customOgImage, noIndex]);

  return null;
};

export default BilingualSEO;
