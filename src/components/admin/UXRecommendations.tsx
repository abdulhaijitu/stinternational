import { useMemo } from "react";
import { 
  Lightbulb, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp,
  MousePointerClick,
  LayoutGrid,
  Globe,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";

interface RecommendationData {
  summary?: {
    totalEvents: number;
    uniqueSessions: number;
    conversions: number;
    deviceBreakdown: {
      desktop: number;
      mobile: number;
      tablet: number;
    };
  };
  topCategories?: Array<{
    slug: string;
    name: string;
    clicks: number;
    hovers: number;
  }>;
  topProducts?: Array<{
    slug: string;
    name: string;
    views: number;
    carts: number;
  }>;
  funnel?: {
    addToCart: number;
    buyNow: number;
    checkoutStart: number;
    orderComplete: number;
    rfqSubmit: number;
  };
  hero?: Array<{
    slide: number;
    views: number;
    clicks: number;
  }>;
  utility?: {
    backToTop: number;
    languageSwitch: { en: number; bn: number };
    gridDensity: { compact: number; comfortable: number };
  };
}

interface UXRecommendation {
  id: string;
  type: 'warning' | 'insight' | 'opportunity' | 'success';
  category: string;
  title: string;
  description: string;
  metric?: string;
  action?: string;
}

interface UXRecommendationsProps {
  data: RecommendationData;
  isLoading?: boolean;
}

const UXRecommendations = ({ data, isLoading = false }: UXRecommendationsProps) => {
  const { t, language } = useAdminLanguage();
  const rec = t.uxRecommendations;

  // Helper to get category label
  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      'Data': rec?.categoryData || 'Data',
      'Hero Slider': rec?.categoryHeroSlider || 'Hero Slider',
      'Navigation': rec?.categoryNavigation || 'Navigation',
      'Conversion': rec?.categoryConversion || 'Conversion',
      'Audience': rec?.categoryAudience || 'Audience',
      'Device': rec?.categoryDevice || 'Device',
      'Localization': rec?.categoryLocalization || 'Localization',
      'UX Preference': rec?.categoryUxPreference || 'UX Preference',
      'Products': rec?.categoryProducts || 'Products',
      'Overall': rec?.categoryOverall || 'Overall',
    };
    return categoryMap[category] || category;
  };

  // Generate AI-style recommendations based on telemetry data
  const recommendations = useMemo((): UXRecommendation[] => {
    const results: UXRecommendation[] = [];

    if (!data.summary || data.summary.totalEvents === 0) {
      return [{
        id: 'no-data',
        type: 'insight',
        category: 'Data',
        title: rec?.noDataTitle || 'Not enough data yet',
        description: rec?.noDataDescription || 'Continue collecting user interactions to generate meaningful insights.',
      }];
    }

    // 1. Hero Slider Analysis
    if (data.hero && data.hero.length > 0) {
      const totalHeroViews = data.hero.reduce((acc, s) => acc + s.views, 0);
      const totalHeroClicks = data.hero.reduce((acc, s) => acc + s.clicks, 0);
      
      // Find low-performing slides
      const avgClickRate = totalHeroClicks / Math.max(totalHeroViews, 1);
      const lowPerformingSlides = data.hero.filter(slide => {
        const slideClickRate = slide.clicks / Math.max(slide.views, 1);
        return slideClickRate < avgClickRate * 0.5 && slide.views > 10;
      });

      if (lowPerformingSlides.length > 0) {
        const slidesStr = lowPerformingSlides.map(s => s.slide + 1).join(', ');
        results.push({
          id: 'hero-low-engagement',
          type: 'warning',
          category: 'Hero Slider',
          title: rec?.heroLowEngagementTitle || 'Low engagement on some slides',
          description: (rec?.heroLowEngagementDesc || 'Slide {slides} has significantly lower click rates than average. Consider updating the CTA or visual content.').replace('{slides}', slidesStr),
          metric: (rec?.avgCtr || '{rate}% avg CTR').replace('{rate}', (avgClickRate * 100).toFixed(1)),
          action: rec?.heroLowEngagementAction || 'Review slide content and CTAs',
        });
      }

      if (totalHeroClicks === 0 && totalHeroViews > 50) {
        results.push({
          id: 'hero-no-clicks',
          type: 'warning',
          category: 'Hero Slider',
          title: rec?.heroNoClicksTitle || 'No CTA clicks detected',
          description: rec?.heroNoClicksDesc || 'Users are viewing the hero slider but not clicking any CTAs. The call-to-action may need to be more compelling or visible.',
          action: rec?.heroNoClicksAction || 'Strengthen CTA messaging',
        });
      }
    }

    // 2. Category Analysis
    if (data.topCategories && data.topCategories.length > 0) {
      const highHoverLowClick = data.topCategories.filter(cat => 
        cat.hovers > 10 && cat.clicks < cat.hovers * 0.1
      );

      if (highHoverLowClick.length > 0) {
        results.push({
          id: 'category-hover-drop',
          type: 'opportunity',
          category: 'Navigation',
          title: rec?.categoryHoverDropTitle || 'Category interest not converting',
          description: (rec?.categoryHoverDropDesc || '"{name}" receives high hover attention but few clicks. Users may be curious but not finding what they expect.').replace('{name}', highHoverLowClick[0].name),
          metric: (rec?.hoversClicks || '{hovers} hovers, {clicks} clicks').replace('{hovers}', String(highHoverLowClick[0].hovers)).replace('{clicks}', String(highHoverLowClick[0].clicks)),
          action: rec?.categoryHoverDropAction || 'Improve category previews',
        });
      }
    }

    // 3. Conversion Funnel Analysis
    if (data.funnel) {
      const { addToCart, checkoutStart, orderComplete } = data.funnel;
      
      // Cart to checkout drop-off
      if (addToCart > 5) {
        const cartToCheckoutRate = checkoutStart / addToCart;
        if (cartToCheckoutRate < 0.3) {
          results.push({
            id: 'cart-abandonment',
            type: 'warning',
            category: 'Conversion',
            title: rec?.cartAbandonmentTitle || 'High cart abandonment detected',
            description: (rec?.cartAbandonmentDesc || 'Only {rate}% of add-to-cart events lead to checkout. Users may be abandoning carts due to pricing, shipping, or friction.').replace('{rate}', (cartToCheckoutRate * 100).toFixed(0)),
            metric: (rec?.cartsToCheckouts || '{carts} carts → {checkouts} checkouts').replace('{carts}', String(addToCart)).replace('{checkouts}', String(checkoutStart)),
            action: rec?.cartAbandonmentAction || 'Simplify checkout flow',
          });
        }
      }

      // Checkout to order completion
      if (checkoutStart > 3) {
        const checkoutCompletionRate = orderComplete / checkoutStart;
        if (checkoutCompletionRate < 0.5) {
          results.push({
            id: 'checkout-dropout',
            type: 'warning',
            category: 'Conversion',
            title: rec?.checkoutDropoutTitle || 'Checkout completion is low',
            description: (rec?.checkoutDropoutDesc || 'Only {rate}% of started checkouts are completed. Payment options or form complexity may be causing drop-offs.').replace('{rate}', (checkoutCompletionRate * 100).toFixed(0)),
            metric: (rec?.startsToOrders || '{starts} starts → {orders} orders').replace('{starts}', String(checkoutStart)).replace('{orders}', String(orderComplete)),
            action: rec?.checkoutDropoutAction || 'Review checkout UX',
          });
        }
      }

      // B2B vs B2C ratio insight
      const rfqSubmit = data.funnel.rfqSubmit || 0;
      if (rfqSubmit > 0 || orderComplete > 0) {
        const b2bRatio = rfqSubmit / Math.max(rfqSubmit + orderComplete, 1);
        if (b2bRatio > 0.7) {
          results.push({
            id: 'b2b-dominant',
            type: 'insight',
            category: 'Audience',
            title: rec?.b2bDominantTitle || 'B2B traffic is dominant',
            description: (rec?.b2bDominantDesc || '{ratio}% of conversions are RFQ submissions. Your audience prefers bulk/institutional purchasing over direct checkout.').replace('{ratio}', (b2bRatio * 100).toFixed(0)),
            metric: (rec?.rfqsVsOrders || '{rfqs} RFQs vs {orders} orders').replace('{rfqs}', String(rfqSubmit)).replace('{orders}', String(orderComplete)),
          });
        } else if (b2bRatio < 0.2 && rfqSubmit + orderComplete > 5) {
          results.push({
            id: 'b2c-dominant',
            type: 'insight',
            category: 'Audience',
            title: rec?.b2cDominantTitle || 'B2C traffic is dominant',
            description: rec?.b2cDominantDesc || 'Direct purchases dominate your conversions. Consider optimizing the B2C checkout experience and promoting the RFQ option for larger orders.',
            metric: (rec?.ordersVsRfqs || '{orders} orders vs {rfqs} RFQs').replace('{orders}', String(orderComplete)).replace('{rfqs}', String(rfqSubmit)),
          });
        }
      }
    }

    // 4. Device Usage Analysis
    if (data.summary) {
      const { desktop, mobile, tablet } = data.summary.deviceBreakdown;
      const totalDeviceSessions = desktop + mobile + tablet;
      
      if (totalDeviceSessions > 10) {
        const mobileRatio = mobile / totalDeviceSessions;
        if (mobileRatio > 0.5) {
          results.push({
            id: 'mobile-heavy',
            type: 'insight',
            category: 'Device',
            title: rec?.mobileHeavyTitle || 'Mobile traffic is significant',
            description: (rec?.mobileHeavyDesc || '{ratio}% of sessions are from mobile devices. Ensure mobile UX is optimized and touch targets are accessible.').replace('{ratio}', (mobileRatio * 100).toFixed(0)),
            metric: (rec?.mobileSessions || '{count} mobile sessions').replace('{count}', String(mobile)),
          });
        }
      }
    }

    // 5. Utility Usage Analysis
    if (data.utility) {
      // Language preference
      const { en, bn } = data.utility.languageSwitch;
      if (en + bn > 5) {
        if (bn > en * 2) {
          results.push({
            id: 'bangla-preferred',
            type: 'insight',
            category: 'Localization',
            title: rec?.banglaPreferredTitle || 'Bangla language is preferred',
            description: rec?.banglaPreferredDesc || 'Users are switching to Bangla more frequently. Ensure all Bangla translations are complete and natural.',
            metric: (rec?.switchesToBangla || '{count} switches to Bangla').replace('{count}', String(bn)),
          });
        }
      }

      // Grid density preference
      const { compact, comfortable } = data.utility.gridDensity;
      if (compact + comfortable > 5) {
        if (compact > comfortable * 2) {
          results.push({
            id: 'compact-preferred',
            type: 'success',
            category: 'UX Preference',
            title: rec?.compactPreferredTitle || 'Users prefer compact view',
            description: rec?.compactPreferredDesc || 'Desktop users favor the compact product grid. This suggests power users who want to browse efficiently.',
            metric: (rec?.compactVsComfortable || '{compact} compact vs {comfortable} comfortable').replace('{compact}', String(compact)).replace('{comfortable}', String(comfortable)),
          });
        }
      }
    }

    // 6. Product Discovery
    if (data.topProducts && data.topProducts.length > 0) {
      const viewsWithNoCart = data.topProducts.filter(p => p.views > 10 && p.carts === 0);
      if (viewsWithNoCart.length > 0) {
        results.push({
          id: 'product-interest-no-conversion',
          type: 'opportunity',
          category: 'Products',
          title: rec?.productInterestNoConversionTitle || 'Popular products not converting',
          description: (rec?.productInterestNoConversionDesc || '"{name}" has {views} views but no cart additions. Check pricing, stock status, or product information quality.')
            .replace('{name}', viewsWithNoCart[0].name)
            .replace('{views}', String(viewsWithNoCart[0].views)),
          action: rec?.productInterestNoConversionAction || 'Review product page',
        });
      }
    }

    // Add a success message if things look good
    if (results.length === 0 && data.summary.totalEvents > 100) {
      results.push({
        id: 'metrics-healthy',
        type: 'success',
        category: 'Overall',
        title: rec?.metricsHealthyTitle || 'Metrics are looking healthy',
        description: rec?.metricsHealthyDescription || 'No significant UX issues detected. Continue monitoring for trends and opportunities.',
      });
    }

    return results;
  }, [data, rec]);

  const getTypeIcon = (type: UXRecommendation['type']) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'opportunity': return TrendingUp;
      case 'success': return TrendingUp;
      default: return Lightbulb;
    }
  };

  const getTypeBadge = (type: UXRecommendation['type']) => {
    switch (type) {
      case 'warning': return { variant: 'destructive' as const, label: rec?.badgeIssue || 'Issue' };
      case 'opportunity': return { variant: 'default' as const, label: rec?.badgeOpportunity || 'Opportunity' };
      case 'success': return { variant: 'secondary' as const, label: rec?.badgePositive || 'Positive' };
      default: return { variant: 'outline' as const, label: rec?.badgeInsight || 'Insight' };
    }
  };

  if (isLoading) {
    return (
      <Card className={cn(language === "bn" && "font-siliguri")}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            {rec?.title || "AI Recommendations"}
          </CardTitle>
          <CardDescription>{rec?.analyzing || "Analyzing your UX data..."}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(language === "bn" && "font-siliguri")}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          {rec?.title || "AI-Powered UX Insights"}
        </CardTitle>
        <CardDescription>
          {(rec?.recommendationsCount || "{count} recommendations based on your telemetry data").replace('{count}', String(recommendations.length))}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            {rec?.collecting || "Collecting more data to generate insights..."}
          </p>
        ) : (
          <div className="space-y-3">
            {recommendations.map((item) => {
              const Icon = getTypeIcon(item.type);
              const badge = getTypeBadge(item.type);
              
              return (
                <div
                  key={item.id}
                  className={cn(
                    "border rounded-lg p-4 transition-colors",
                    item.type === 'warning' && "border-destructive/30 bg-destructive/5",
                    item.type === 'opportunity' && "border-primary/30 bg-primary/5",
                    item.type === 'success' && "border-green-500/30 bg-green-500/5",
                    item.type === 'insight' && "border-border bg-muted/30"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-1.5 rounded-md shrink-0",
                      item.type === 'warning' && "bg-destructive/10 text-destructive",
                      item.type === 'opportunity' && "bg-primary/10 text-primary",
                      item.type === 'success' && "bg-green-500/10 text-green-600",
                      item.type === 'insight' && "bg-muted text-muted-foreground"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-sm">{item.title}</span>
                        <Badge variant={badge.variant} className="text-[10px] h-5">
                          {badge.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {getCategoryLabel(item.category)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        {item.metric && (
                          <span className="text-xs font-medium bg-background px-2 py-1 rounded border">
                            {item.metric}
                          </span>
                        )}
                        {item.action && (
                          <span className="text-xs text-primary flex items-center gap-1">
                            <ArrowRight className="h-3 w-3" />
                            {item.action}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UXRecommendations;