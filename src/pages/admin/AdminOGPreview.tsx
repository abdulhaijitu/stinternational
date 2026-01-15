import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getProductOgImage, getCategoryOgImage, getPageOgImage, BASE_URL, DEFAULT_OG_IMAGE } from "@/lib/ogImageUtils";
import { Facebook, Twitter, Linkedin, ExternalLink, Image, Search, Bug } from "lucide-react";
import { toast } from "sonner";

const translations = {
  en: {
    title: "OG Preview Testing",
    subtitle: "Preview how content appears when shared on social media",
    products: "Products",
    categories: "Categories",
    pages: "Pages",
    search: "Search...",
    noImage: "No custom image",
    hasImage: "Custom OG image",
    preview: "Social Preview",
    facebook: "Facebook",
    twitter: "Twitter/X",
    linkedin: "LinkedIn",
    openDebugger: "Open Debugger",
    facebookDebugger: "Facebook Debugger",
    twitterValidator: "Twitter Validator",
    linkedinInspector: "LinkedIn Inspector",
    copyUrl: "Copy URL",
    urlCopied: "URL copied to clipboard!",
    debugTools: "Debug Tools",
    noResults: "No results found",
  },
  bn: {
    title: "OG প্রিভিউ টেস্টিং",
    subtitle: "সোশ্যাল মিডিয়ায় শেয়ার করলে কন্টেন্ট কেমন দেখাবে তা প্রিভিউ করুন",
    products: "পণ্য",
    categories: "ক্যাটাগরি",
    pages: "পেজ",
    search: "অনুসন্ধান...",
    noImage: "কাস্টম ছবি নেই",
    hasImage: "কাস্টম OG ছবি",
    preview: "সোশ্যাল প্রিভিউ",
    facebook: "ফেসবুক",
    twitter: "টুইটার/X",
    linkedin: "লিংকডইন",
    openDebugger: "ডিবাগার খুলুন",
    facebookDebugger: "ফেসবুক ডিবাগার",
    twitterValidator: "টুইটার ভ্যালিডেটর",
    linkedinInspector: "লিংকডইন ইন্সপেক্টর",
    copyUrl: "URL কপি করুন",
    urlCopied: "URL ক্লিপবোর্ডে কপি হয়েছে!",
    debugTools: "ডিবাগ টুলস",
    noResults: "কোন ফলাফল পাওয়া যায়নি",
  },
};

interface SocialPreviewCardProps {
  title: string;
  description: string;
  imageUrl: string;
  pageUrl: string;
  platform: "facebook" | "twitter" | "linkedin";
}

const SocialPreviewCard = ({ title, description, imageUrl, pageUrl, platform }: SocialPreviewCardProps) => {
  const truncatedTitle = title.length > 60 ? title.substring(0, 57) + "..." : title;
  const truncatedDesc = description.length > 160 ? description.substring(0, 157) + "..." : description;
  const domain = new URL(pageUrl).hostname;

  if (platform === "facebook") {
    return (
      <div className="border rounded-lg overflow-hidden bg-white max-w-[500px]">
        <div className="aspect-[1.91/1] bg-muted relative">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = DEFAULT_OG_IMAGE; }} />
        </div>
        <div className="p-3 border-t">
          <p className="text-xs text-gray-500 uppercase">{domain}</p>
          <p className="font-semibold text-sm text-gray-900 line-clamp-2">{truncatedTitle}</p>
          <p className="text-xs text-gray-500 line-clamp-2">{truncatedDesc}</p>
        </div>
      </div>
    );
  }

  if (platform === "twitter") {
    return (
      <div className="border rounded-2xl overflow-hidden bg-white max-w-[500px]">
        <div className="aspect-[2/1] bg-muted relative">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = DEFAULT_OG_IMAGE; }} />
        </div>
        <div className="p-3 border-t">
          <p className="font-medium text-sm text-gray-900 line-clamp-2">{truncatedTitle}</p>
          <p className="text-xs text-gray-500 line-clamp-2">{truncatedDesc}</p>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <ExternalLink className="h-3 w-3" /> {domain}
          </p>
        </div>
      </div>
    );
  }

  // LinkedIn
  return (
    <div className="border rounded-lg overflow-hidden bg-white max-w-[500px]">
      <div className="aspect-[1.91/1] bg-muted relative">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = DEFAULT_OG_IMAGE; }} />
      </div>
      <div className="p-3 bg-gray-50 border-t">
        <p className="font-semibold text-sm text-gray-900 line-clamp-2">{truncatedTitle}</p>
        <p className="text-xs text-gray-500">{domain}</p>
      </div>
    </div>
  );
};

// Debugger URL generators
const getFacebookDebuggerUrl = (url: string) => 
  `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(url)}`;

const getTwitterValidatorUrl = (url: string) => 
  `https://cards-dev.twitter.com/validator?url=${encodeURIComponent(url)}`;

const getLinkedInInspectorUrl = (url: string) => 
  `https://www.linkedin.com/post-inspector/inspect/${encodeURIComponent(url)}`;

interface DebuggerButtonsProps {
  pageUrl: string;
  t: typeof translations.en;
}

const DebuggerButtons = ({ pageUrl, t }: DebuggerButtonsProps) => {
  const copyUrl = () => {
    navigator.clipboard.writeText(pageUrl);
    toast.success(t.urlCopied);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.open(getFacebookDebuggerUrl(pageUrl), '_blank')}
        className="text-xs"
      >
        <Facebook className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
        {t.facebookDebugger}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.open(getTwitterValidatorUrl(pageUrl), '_blank')}
        className="text-xs"
      >
        <Twitter className="h-3.5 w-3.5 mr-1.5" />
        {t.twitterValidator}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.open(getLinkedInInspectorUrl(pageUrl), '_blank')}
        className="text-xs"
      >
        <Linkedin className="h-3.5 w-3.5 mr-1.5 text-blue-700" />
        {t.linkedinInspector}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={copyUrl}
        className="text-xs"
      >
        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
        {t.copyUrl}
      </Button>
    </div>
  );
};

interface PreviewItemProps {
  title: string;
  titleBn?: string;
  description: string;
  descriptionBn?: string;
  imageUrl: string;
  pageUrl: string;
  hasCustomOg: boolean;
  language: "en" | "bn";
  t: typeof translations.en;
}

const PreviewItem = ({ title, titleBn, description, descriptionBn, imageUrl, pageUrl, hasCustomOg, language, t }: PreviewItemProps) => {
  const displayTitle = language === "bn" && titleBn ? titleBn : title;
  const displayDesc = language === "bn" && descriptionBn ? descriptionBn : description;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{displayTitle}</CardTitle>
            <p className="text-sm text-muted-foreground truncate mt-1">{pageUrl}</p>
          </div>
          <Badge variant={hasCustomOg ? "default" : "secondary"} className="shrink-0">
            <Image className="h-3 w-3 mr-1" />
            {hasCustomOg ? t.hasImage : t.noImage}
          </Badge>
        </div>
        {/* Debug Tools */}
        <div className="mt-4 pt-3 border-t">
          <div className="flex items-center gap-2 mb-2">
            <Bug className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">{t.debugTools}</span>
          </div>
          <DebuggerButtons pageUrl={pageUrl} t={t} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Facebook className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">{t.facebook}</span>
            </div>
            <SocialPreviewCard title={displayTitle} description={displayDesc} imageUrl={imageUrl} pageUrl={pageUrl} platform="facebook" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Twitter className="h-4 w-4" />
              <span className="text-sm font-medium">{t.twitter}</span>
            </div>
            <SocialPreviewCard title={displayTitle} description={displayDesc} imageUrl={imageUrl} pageUrl={pageUrl} platform="twitter" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Linkedin className="h-4 w-4 text-blue-700" />
              <span className="text-sm font-medium">{t.linkedin}</span>
            </div>
            <SocialPreviewCard title={displayTitle} description={displayDesc} imageUrl={imageUrl} pageUrl={pageUrl} platform="linkedin" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AdminOGPreview = () => {
  const { language } = useAdminLanguage();
  const t = translations[language];
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("products");

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["admin-products-og"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, name_bn, slug, short_description, short_description_bn, image_url, images, og_image, seo_title, seo_title_bn, seo_description, seo_description_bn")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["admin-categories-og"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, name_bn, slug, description, description_bn, image_url, og_image, seo_title, seo_title_bn, seo_description, seo_description_bn, parent_id")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: pages, isLoading: pagesLoading } = useQuery({
    queryKey: ["admin-pages-og"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_seo")
        .select("*")
        .order("page_name", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const filteredProducts = products?.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.name_bn?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCategories = categories?.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.name_bn?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPages = pages?.filter((p) =>
    p.page_name.toLowerCase().includes(search.toLowerCase()) ||
    p.page_slug.toLowerCase().includes(search.toLowerCase())
  );

  const renderSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((j) => (
                <div key={j}>
                  <Skeleton className="h-4 w-20 mb-3" />
                  <Skeleton className="aspect-[1.91/1] rounded-lg" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <AdminLayout>
      <AdminPageHeader title={t.title} subtitle={t.subtitle} />

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="products">
            {t.products} ({products?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="categories">
            {t.categories} ({categories?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="pages">
            {t.pages} ({pages?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          {productsLoading ? (
            renderSkeleton()
          ) : filteredProducts?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t.noResults}</p>
          ) : (
            filteredProducts?.map((product) => (
              <PreviewItem
                key={product.id}
                title={product.seo_title || product.name}
                titleBn={product.seo_title_bn || product.name_bn}
                description={product.seo_description || product.short_description || ""}
                descriptionBn={product.seo_description_bn || product.short_description_bn}
                imageUrl={getProductOgImage(product)}
                pageUrl={`${BASE_URL}/product/${product.slug}`}
                hasCustomOg={!!product.og_image}
                language={language}
                t={t}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          {categoriesLoading ? (
            renderSkeleton()
          ) : filteredCategories?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t.noResults}</p>
          ) : (
            filteredCategories?.map((category) => (
              <PreviewItem
                key={category.id}
                title={category.seo_title || category.name}
                titleBn={category.seo_title_bn || category.name_bn}
                description={category.seo_description || category.description || ""}
                descriptionBn={category.seo_description_bn || category.description_bn}
                imageUrl={getCategoryOgImage(category)}
                pageUrl={`${BASE_URL}/category/${category.slug}`}
                hasCustomOg={!!category.og_image}
                language={language}
                t={t}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          {pagesLoading ? (
            renderSkeleton()
          ) : filteredPages?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t.noResults}</p>
          ) : (
            filteredPages?.map((page) => (
              <PreviewItem
                key={page.id}
                title={page.seo_title || page.page_name}
                titleBn={page.seo_title_bn}
                description={page.seo_description || ""}
                descriptionBn={page.seo_description_bn}
                imageUrl={getPageOgImage(page)}
                pageUrl={`${BASE_URL}/${page.page_slug}`}
                hasCustomOg={!!page.og_image}
                language={language}
                t={t}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminOGPreview;
