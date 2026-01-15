import { useEffect, useState, useMemo } from "react";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Image, 
  FileText, 
  Type,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface SEOIssue {
  id: string;
  type: "error" | "warning" | "info";
  category: "title" | "description" | "image" | "duplicate";
  entity: "product" | "category" | "page";
  entityName: string;
  entitySlug: string;
  message: string;
  messageBn: string;
}

interface SEOStats {
  totalProducts: number;
  totalCategories: number;
  totalPages: number;
  productsWithSEO: number;
  categoriesWithSEO: number;
  pagesWithSEO: number;
  productsWithImages: number;
  categoriesWithImages: number;
  duplicateTitles: number;
}

const AdminSEOHealth = () => {
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<SEOIssue[]>([]);
  const [stats, setStats] = useState<SEOStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalPages: 0,
    productsWithSEO: 0,
    categoriesWithSEO: 0,
    pagesWithSEO: 0,
    productsWithImages: 0,
    categoriesWithImages: 0,
    duplicateTitles: 0,
  });
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    errors: true,
    warnings: true,
    info: false,
  });
  const { language } = useAdminLanguage();

  const getTextClass = () => cn(language === "bn" && "font-siliguri");

  const runSEOAudit = async () => {
    setLoading(true);
    const foundIssues: SEOIssue[] = [];
    
    try {
      // Fetch products
      const { data: products } = await supabase
        .from("products")
        .select("id, name, name_bn, slug, seo_title, seo_title_bn, seo_description, seo_description_bn, image_url, images, is_active")
        .eq("is_active", true);

      // Fetch categories
      const { data: categories } = await supabase
        .from("categories")
        .select("id, name, name_bn, slug, seo_title, seo_title_bn, seo_description, seo_description_bn, image_url, is_active")
        .eq("is_active", true);

      // Fetch pages
      const { data: pages } = await supabase
        .from("page_seo")
        .select("id, page_name, page_slug, seo_title, seo_title_bn, seo_description, seo_description_bn, og_image, is_active")
        .eq("is_active", true);

      const productsList = products || [];
      const categoriesList = categories || [];
      const pagesList = pages || [];

      // Track titles for duplicates
      const allTitles: { title: string; entity: string; slug: string }[] = [];

      // Analyze products
      let productsWithSEO = 0;
      let productsWithImages = 0;

      for (const product of productsList) {
        const hasImages = product.image_url || (product.images && product.images.length > 0);
        if (hasImages) productsWithImages++;

        if (product.seo_title || product.seo_description) {
          productsWithSEO++;
        }

        // Check for missing meta description
        if (!product.seo_description && !product.seo_description_bn) {
          foundIssues.push({
            id: `product-desc-${product.id}`,
            type: "warning",
            category: "description",
            entity: "product",
            entityName: product.name,
            entitySlug: product.slug,
            message: "Missing meta description",
            messageBn: "মেটা বর্ণনা নেই",
          });
        }

        // Check for missing image
        if (!hasImages) {
          foundIssues.push({
            id: `product-img-${product.id}`,
            type: "error",
            category: "image",
            entity: "product",
            entityName: product.name,
            entitySlug: product.slug,
            message: "No product image",
            messageBn: "কোনো পণ্যের ছবি নেই",
          });
        }

        // Track title for duplicates
        const title = product.seo_title || product.name;
        allTitles.push({ title, entity: "product", slug: product.slug });
      }

      // Analyze categories
      let categoriesWithSEO = 0;
      let categoriesWithImages = 0;

      for (const category of categoriesList) {
        if (category.image_url) categoriesWithImages++;

        if (category.seo_title || category.seo_description) {
          categoriesWithSEO++;
        }

        // Check for missing meta description
        if (!category.seo_description && !category.seo_description_bn) {
          foundIssues.push({
            id: `category-desc-${category.id}`,
            type: "warning",
            category: "description",
            entity: "category",
            entityName: category.name,
            entitySlug: category.slug,
            message: "Missing meta description",
            messageBn: "মেটা বর্ণনা নেই",
          });
        }

        // Check for missing image
        if (!category.image_url) {
          foundIssues.push({
            id: `category-img-${category.id}`,
            type: "info",
            category: "image",
            entity: "category",
            entityName: category.name,
            entitySlug: category.slug,
            message: "No category image",
            messageBn: "কোনো ক্যাটাগরি ছবি নেই",
          });
        }

        // Track title for duplicates
        const title = category.seo_title || category.name;
        allTitles.push({ title, entity: "category", slug: category.slug });
      }

      // Analyze pages
      let pagesWithSEO = 0;

      for (const page of pagesList) {
        if (page.seo_title && page.seo_description) {
          pagesWithSEO++;
        }

        // Check for missing SEO
        if (!page.seo_title) {
          foundIssues.push({
            id: `page-title-${page.id}`,
            type: "warning",
            category: "title",
            entity: "page",
            entityName: page.page_name,
            entitySlug: page.page_slug,
            message: "Missing SEO title",
            messageBn: "SEO শিরোনাম নেই",
          });
        }

        if (!page.seo_description) {
          foundIssues.push({
            id: `page-desc-${page.id}`,
            type: "warning",
            category: "description",
            entity: "page",
            entityName: page.page_name,
            entitySlug: page.page_slug,
            message: "Missing meta description",
            messageBn: "মেটা বর্ণনা নেই",
          });
        }

        // Track title for duplicates
        if (page.seo_title) {
          allTitles.push({ title: page.seo_title, entity: "page", slug: page.page_slug });
        }
      }

      // Find duplicate titles
      const titleCounts: Record<string, { title: string; items: { entity: string; slug: string }[] }> = {};
      for (const item of allTitles) {
        const normalizedTitle = item.title.toLowerCase().trim();
        if (!titleCounts[normalizedTitle]) {
          titleCounts[normalizedTitle] = { title: item.title, items: [] };
        }
        titleCounts[normalizedTitle].items.push({ entity: item.entity, slug: item.slug });
      }

      let duplicateTitlesCount = 0;
      for (const [, data] of Object.entries(titleCounts)) {
        if (data.items.length > 1) {
          duplicateTitlesCount++;
          for (const item of data.items) {
            foundIssues.push({
              id: `duplicate-${item.entity}-${item.slug}`,
              type: "error",
              category: "duplicate",
              entity: item.entity as "product" | "category" | "page",
              entityName: data.title,
              entitySlug: item.slug,
              message: `Duplicate title with ${data.items.length - 1} other item(s)`,
              messageBn: `${data.items.length - 1} টি অন্য আইটেমের সাথে শিরোনাম মিলে যাচ্ছে`,
            });
          }
        }
      }

      setStats({
        totalProducts: productsList.length,
        totalCategories: categoriesList.length,
        totalPages: pagesList.length,
        productsWithSEO,
        categoriesWithSEO,
        pagesWithSEO,
        productsWithImages,
        categoriesWithImages,
        duplicateTitles: duplicateTitlesCount,
      });

      setIssues(foundIssues);
    } catch (error) {
      console.error("Error running SEO audit:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSEOAudit();
  }, []);

  const { errors, warnings, info } = useMemo(() => {
    return {
      errors: issues.filter(i => i.type === "error"),
      warnings: issues.filter(i => i.type === "warning"),
      info: issues.filter(i => i.type === "info"),
    };
  }, [issues]);

  const overallScore = useMemo(() => {
    const total = stats.totalProducts + stats.totalCategories + stats.totalPages;
    if (total === 0) return 100;
    
    const withSEO = stats.productsWithSEO + stats.categoriesWithSEO + stats.pagesWithSEO;
    const withImages = stats.productsWithImages + stats.categoriesWithImages;
    const imageTotal = stats.totalProducts + stats.totalCategories;
    
    const seoScore = (withSEO / total) * 50;
    const imageScore = imageTotal > 0 ? (withImages / imageTotal) * 30 : 30;
    const duplicatePenalty = Math.min(stats.duplicateTitles * 5, 20);
    
    return Math.round(Math.max(0, seoScore + imageScore + 20 - duplicatePenalty));
  }, [stats]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getEditLink = (issue: SEOIssue) => {
    switch (issue.entity) {
      case "product":
        return `/admin/products/${issue.entitySlug}`;
      case "category":
        return `/admin/categories`;
      case "page":
        return `/admin/page-seo`;
      default:
        return "#";
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const IssueList = ({ issues, type }: { issues: SEOIssue[]; type: "error" | "warning" | "info" }) => {
    const isExpanded = expandedSections[type === "error" ? "errors" : type === "warning" ? "warnings" : "info"];
    const sectionKey = type === "error" ? "errors" : type === "warning" ? "warnings" : "info";
    
    const Icon = type === "error" ? XCircle : type === "warning" ? AlertTriangle : CheckCircle;
    const iconColor = type === "error" ? "text-red-500" : type === "warning" ? "text-yellow-500" : "text-blue-500";
    const title = type === "error" 
      ? (language === "bn" ? "গুরুতর সমস্যা" : "Critical Issues")
      : type === "warning"
      ? (language === "bn" ? "সতর্কতা" : "Warnings")
      : (language === "bn" ? "তথ্য" : "Info");

    if (issues.length === 0) return null;

    return (
      <Collapsible open={isExpanded} onOpenChange={() => toggleSection(sectionKey)}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className={cn("h-5 w-5", iconColor)} />
                  <CardTitle className={cn("text-lg", getTextClass())}>{title}</CardTitle>
                  <Badge variant={type === "error" ? "destructive" : type === "warning" ? "default" : "secondary"}>
                    {issues.length}
                  </Badge>
                </div>
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {issue.category === "image" && <Image className="h-4 w-4 text-muted-foreground" />}
                      {issue.category === "description" && <FileText className="h-4 w-4 text-muted-foreground" />}
                      {issue.category === "title" && <Type className="h-4 w-4 text-muted-foreground" />}
                      {issue.category === "duplicate" && <AlertTriangle className="h-4 w-4 text-muted-foreground" />}
                      <div>
                        <span className="font-medium">{issue.entityName}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({issue.entity === "product" ? (language === "bn" ? "পণ্য" : "Product") :
                            issue.entity === "category" ? (language === "bn" ? "ক্যাটাগরি" : "Category") :
                            (language === "bn" ? "পেজ" : "Page")})
                        </span>
                        <p className={cn("text-sm text-muted-foreground", getTextClass())}>
                          {language === "bn" ? issue.messageBn : issue.message}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={getEditLink(issue)}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  };

  return (
    <AdminLayout>
      <div className={cn("space-y-6", getTextClass())}>
        <AdminPageHeader
          title={language === "bn" ? "SEO স্বাস্থ্য" : "SEO Health"}
          subtitle={language === "bn" ? "আপনার সাইটের SEO স্বাস্থ্য পরীক্ষা করুন" : "Check your site's SEO health"}
        >
          <Button onClick={runSEOAudit} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            {language === "bn" ? "পুনরায় স্ক্যান" : "Rescan"}
          </Button>
        </AdminPageHeader>

        {/* Overall Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              {language === "bn" ? "সামগ্রিক SEO স্কোর" : "Overall SEO Score"}
            </CardTitle>
            <CardDescription>
              {language === "bn" ? "আপনার সাইটের SEO অবস্থার সারাংশ" : "Summary of your site's SEO status"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className={cn("text-6xl font-bold", getScoreColor(overallScore))}>
                {overallScore}%
              </div>
              <div className="flex-1">
                <Progress value={overallScore} className="h-4" />
                <p className="text-sm text-muted-foreground mt-2">
                  {overallScore >= 80 
                    ? (language === "bn" ? "দারুণ! আপনার SEO ভালো অবস্থায় আছে।" : "Great! Your SEO is in good shape.")
                    : overallScore >= 60
                    ? (language === "bn" ? "ভালো, কিন্তু উন্নতির সুযোগ আছে।" : "Good, but there's room for improvement.")
                    : (language === "bn" ? "SEO উন্নত করতে নিচের সমস্যাগুলো সমাধান করুন।" : "Fix the issues below to improve SEO.")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === "bn" ? "পণ্য SEO কভারেজ" : "Product SEO Coverage"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.productsWithSEO}/{stats.totalProducts}
              </div>
              <Progress value={stats.totalProducts ? (stats.productsWithSEO / stats.totalProducts) * 100 : 0} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === "bn" ? "ক্যাটাগরি SEO কভারেজ" : "Category SEO Coverage"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.categoriesWithSEO}/{stats.totalCategories}
              </div>
              <Progress value={stats.totalCategories ? (stats.categoriesWithSEO / stats.totalCategories) * 100 : 0} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === "bn" ? "পেজ SEO কভারেজ" : "Page SEO Coverage"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.pagesWithSEO}/{stats.totalPages}
              </div>
              <Progress value={stats.totalPages ? (stats.pagesWithSEO / stats.totalPages) * 100 : 0} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Issues */}
        <div className="space-y-4">
          <IssueList issues={errors} type="error" />
          <IssueList issues={warnings} type="warning" />
          <IssueList issues={info} type="info" />
        </div>

        {issues.length === 0 && !loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className={cn("text-lg font-semibold", getTextClass())}>
                {language === "bn" ? "কোনো সমস্যা পাওয়া যায়নি!" : "No issues found!"}
              </h3>
              <p className={cn("text-muted-foreground", getTextClass())}>
                {language === "bn" ? "আপনার SEO দারুণ অবস্থায় আছে।" : "Your SEO is in great shape."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSEOHealth;
