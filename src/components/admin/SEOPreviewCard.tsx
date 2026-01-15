import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe } from 'lucide-react';

interface SEOPreviewCardProps {
  title: string;
  description: string;
  url: string;
  language: 'en' | 'bn';
}

const translations = {
  en: {
    title: 'Google Search Preview',
    subtitle: 'How this page may appear in search results'
  },
  bn: {
    title: 'গুগল সার্চ প্রিভিউ',
    subtitle: 'অনুসন্ধান ফলাফলে এই পৃষ্ঠাটি কীভাবে প্রদর্শিত হতে পারে'
  }
};

export const SEOPreviewCard: React.FC<SEOPreviewCardProps> = ({
  title,
  description,
  url,
  language
}) => {
  const t = translations[language];
  
  // Truncate title at 60 characters like Google
  const displayTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;
  
  // Truncate description at 160 characters like Google
  const displayDescription = description.length > 160 
    ? description.substring(0, 157) + '...' 
    : description;

  // Format URL for display (remove protocol, show breadcrumb style)
  const formatUrl = (rawUrl: string) => {
    try {
      const urlObj = new URL(rawUrl);
      const path = urlObj.pathname.split('/').filter(Boolean);
      if (path.length === 0) {
        return urlObj.hostname;
      }
      return `${urlObj.hostname} › ${path.join(' › ')}`;
    } catch {
      return rawUrl;
    }
  };

  const displayUrl = formatUrl(url);

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <Globe className="h-4 w-4" />
          {t.title}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{t.subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="bg-background rounded-lg p-4 border">
          {/* Google-style search result preview */}
          <div className="space-y-1">
            {/* URL breadcrumb */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                <Globe className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                {displayUrl || 'stinternational.lovable.app'}
              </div>
            </div>
            
            {/* Title - blue link style */}
            <h3 className="text-lg text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-tight font-normal">
              {displayTitle || 'Page Title'}
            </h3>
            
            {/* Description - gray text */}
            <p className="text-sm text-muted-foreground leading-snug">
              {displayDescription || 'Add a meta description to see how it appears in search results...'}
            </p>
          </div>
        </div>
        
        {/* Character count indicators */}
        <div className="mt-3 flex gap-4 text-xs">
          <div className={`${title.length > 60 ? 'text-destructive' : 'text-muted-foreground'}`}>
            Title: {title.length}/60
          </div>
          <div className={`${description.length > 160 ? 'text-destructive' : 'text-muted-foreground'}`}>
            Description: {description.length}/160
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
