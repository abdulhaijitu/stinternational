import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, Search, Globe } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import ImageUpload from "./ImageUpload";

interface SEOFieldsSectionProps {
  seoTitle: string;
  seoTitleBn: string;
  seoDescription: string;
  seoDescriptionBn: string;
  seoKeywords: string;
  seoKeywordsBn: string;
  ogImage: string;
  onSeoTitleChange: (value: string) => void;
  onSeoTitleBnChange: (value: string) => void;
  onSeoDescriptionChange: (value: string) => void;
  onSeoDescriptionBnChange: (value: string) => void;
  onSeoKeywordsChange: (value: string) => void;
  onSeoKeywordsBnChange: (value: string) => void;
  onOgImageChange: (value: string) => void;
  language: "en" | "bn";
  entityType: "product" | "category";
}

const translations = {
  en: {
    seoSettings: "SEO Settings",
    seoDescription: "Customize how this appears in search engines and social media",
    seoTitleEn: "SEO Title (English)",
    seoTitleBn: "SEO Title (Bangla)",
    seoTitlePlaceholder: "Leave empty to use default title",
    seoDescEn: "Meta Description (English)",
    seoDescBn: "Meta Description (Bangla)",
    seoDescPlaceholder: "Leave empty to use short description",
    seoKeywordsEn: "Keywords (English)",
    seoKeywordsBn: "Keywords (Bangla)",
    seoKeywordsPlaceholder: "Comma-separated keywords",
    ogImage: "Social Share Image (OG Image)",
    ogImageDesc: "Image shown when shared on Facebook, WhatsApp, LinkedIn",
    recommendedSize: "Recommended: 1200x630 pixels",
    charactersRemaining: "characters",
    titleTip: "Keep under 60 characters for best display",
    descTip: "Keep under 160 characters for best display",
  },
  bn: {
    seoSettings: "SEO সেটিংস",
    seoDescription: "সার্চ ইঞ্জিন এবং সোশ্যাল মিডিয়ায় কীভাবে দেখাবে তা কাস্টমাইজ করুন",
    seoTitleEn: "SEO শিরোনাম (ইংরেজি)",
    seoTitleBn: "SEO শিরোনাম (বাংলা)",
    seoTitlePlaceholder: "ডিফল্ট শিরোনাম ব্যবহার করতে খালি রাখুন",
    seoDescEn: "মেটা বর্ণনা (ইংরেজি)",
    seoDescBn: "মেটা বর্ণনা (বাংলা)",
    seoDescPlaceholder: "সংক্ষিপ্ত বর্ণনা ব্যবহার করতে খালি রাখুন",
    seoKeywordsEn: "কীওয়ার্ড (ইংরেজি)",
    seoKeywordsBn: "কীওয়ার্ড (বাংলা)",
    seoKeywordsPlaceholder: "কমা দিয়ে আলাদা করা কীওয়ার্ড",
    ogImage: "সোশ্যাল শেয়ার ইমেজ (OG Image)",
    ogImageDesc: "Facebook, WhatsApp, LinkedIn এ শেয়ার করলে এই ছবি দেখাবে",
    recommendedSize: "প্রস্তাবিত: ১২০০x৬৩০ পিক্সেল",
    charactersRemaining: "অক্ষর",
    titleTip: "সেরা প্রদর্শনের জন্য ৬০ অক্ষরের নিচে রাখুন",
    descTip: "সেরা প্রদর্শনের জন্য ১৬০ অক্ষরের নিচে রাখুন",
  },
};

export const SEOFieldsSection = ({
  seoTitle,
  seoTitleBn,
  seoDescription,
  seoDescriptionBn,
  seoKeywords,
  seoKeywordsBn,
  ogImage,
  onSeoTitleChange,
  onSeoTitleBnChange,
  onSeoDescriptionChange,
  onSeoDescriptionBnChange,
  onSeoKeywordsChange,
  onSeoKeywordsBnChange,
  onOgImageChange,
  language,
  entityType,
}: SEOFieldsSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const t = translations[language];
  const textClass = cn(language === "bn" && "font-siliguri");

  const getTitleCharColor = (length: number) => {
    if (length === 0) return "text-muted-foreground";
    if (length <= 60) return "text-green-600";
    if (length <= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getDescCharColor = (length: number) => {
    if (length === 0) return "text-muted-foreground";
    if (length <= 160) return "text-green-600";
    if (length <= 180) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          type="button"
          className={cn("w-full justify-between", textClass)}
        >
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span>{t.seoSettings}</span>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </div>
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 pt-4">
        <p className={cn("text-sm text-muted-foreground", textClass)}>
          {t.seoDescription}
        </p>

        {/* SEO Titles */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className={textClass}>{t.seoTitleEn}</Label>
            <Input
              value={seoTitle}
              onChange={(e) => onSeoTitleChange(e.target.value)}
              placeholder={t.seoTitlePlaceholder}
              maxLength={100}
            />
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{t.titleTip}</span>
              <span className={getTitleCharColor(seoTitle.length)}>
                {seoTitle.length}/60 {t.charactersRemaining}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label className={cn(textClass, "font-siliguri")}>{t.seoTitleBn}</Label>
            <Input
              value={seoTitleBn}
              onChange={(e) => onSeoTitleBnChange(e.target.value)}
              placeholder={t.seoTitlePlaceholder}
              maxLength={100}
              className="font-siliguri"
            />
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{t.titleTip}</span>
              <span className={getTitleCharColor(seoTitleBn.length)}>
                {seoTitleBn.length}/60 {t.charactersRemaining}
              </span>
            </div>
          </div>
        </div>

        {/* SEO Descriptions */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className={textClass}>{t.seoDescEn}</Label>
            <Textarea
              value={seoDescription}
              onChange={(e) => onSeoDescriptionChange(e.target.value)}
              placeholder={t.seoDescPlaceholder}
              maxLength={200}
              rows={3}
            />
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{t.descTip}</span>
              <span className={getDescCharColor(seoDescription.length)}>
                {seoDescription.length}/160 {t.charactersRemaining}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label className={cn(textClass, "font-siliguri")}>{t.seoDescBn}</Label>
            <Textarea
              value={seoDescriptionBn}
              onChange={(e) => onSeoDescriptionBnChange(e.target.value)}
              placeholder={t.seoDescPlaceholder}
              maxLength={200}
              rows={3}
              className="font-siliguri"
            />
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{t.descTip}</span>
              <span className={getDescCharColor(seoDescriptionBn.length)}>
                {seoDescriptionBn.length}/160 {t.charactersRemaining}
              </span>
            </div>
          </div>
        </div>

        {/* SEO Keywords */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className={textClass}>{t.seoKeywordsEn}</Label>
            <Input
              value={seoKeywords}
              onChange={(e) => onSeoKeywordsChange(e.target.value)}
              placeholder={t.seoKeywordsPlaceholder}
            />
          </div>
          <div className="space-y-2">
            <Label className={cn(textClass, "font-siliguri")}>{t.seoKeywordsBn}</Label>
            <Input
              value={seoKeywordsBn}
              onChange={(e) => onSeoKeywordsBnChange(e.target.value)}
              placeholder={t.seoKeywordsPlaceholder}
              className="font-siliguri"
            />
          </div>
        </div>

        {/* OG Image */}
        <div className="space-y-2">
          <Label className={textClass}>{t.ogImage}</Label>
          <p className={cn("text-sm text-muted-foreground", textClass)}>
            {t.ogImageDesc}
          </p>
          <ImageUpload
            value={ogImage}
            onChange={onOgImageChange}
            bucket="product-images"
            folder={`seo/${entityType}`}
          />
          <p className="text-xs text-muted-foreground">{t.recommendedSize}</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default SEOFieldsSection;
