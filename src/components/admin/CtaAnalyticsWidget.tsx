import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, MousePointerClick, FileText, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface AnalyticsData {
  totalClicks: number;
  totalRfqSubmissions: number;
  conversionRate: number;
  variantPerformance: {
    variant: string;
    clicks: number;
    rfqSubmissions: number;
    conversionRate: number;
  }[];
  last7DaysClicks: number;
  last7DaysRfq: number;
}

const CtaAnalyticsWidget = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["cta-analytics"],
    queryFn: async () => {
      // Get all analytics data
      const { data: allData, error: allError } = await supabase
        .from("cta_analytics")
        .select("*");

      if (allError) throw allError;

      // Get data from last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentData, error: recentError } = await supabase
        .from("cta_analytics")
        .select("*")
        .gte("created_at", sevenDaysAgo.toISOString());

      if (recentError) throw recentError;

      // Calculate metrics
      const clicks = allData?.filter((d) => d.event_type === "cta_click") || [];
      const rfqSubmissions = allData?.filter((d) => d.event_type === "rfq_submission") || [];
      
      const totalClicks = clicks.length;
      const totalRfqSubmissions = rfqSubmissions.length;
      const conversionRate = totalClicks > 0 ? (totalRfqSubmissions / totalClicks) * 100 : 0;

      // Calculate by variant
      const variants = ["primary", "secondary"];
      const variantPerformance = variants.map((variant) => {
        const variantClicks = clicks.filter((d) => d.cta_variant === variant).length;
        const variantRfq = rfqSubmissions.filter((d) => d.cta_variant === variant).length;
        return {
          variant,
          clicks: variantClicks,
          rfqSubmissions: variantRfq,
          conversionRate: variantClicks > 0 ? (variantRfq / variantClicks) * 100 : 0,
        };
      });

      // Recent metrics
      const last7DaysClicks = recentData?.filter((d) => d.event_type === "cta_click").length || 0;
      const last7DaysRfq = recentData?.filter((d) => d.event_type === "rfq_submission").length || 0;

      return {
        totalClicks,
        totalRfqSubmissions,
        conversionRate,
        variantPerformance,
        last7DaysClicks,
        last7DaysRfq,
      } as AnalyticsData;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            CTA Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPerformanceIndicator = (variant: { conversionRate: number }, allVariants: { conversionRate: number }[]) => {
    const avgRate = allVariants.reduce((sum, v) => sum + v.conversionRate, 0) / allVariants.length;
    if (variant.conversionRate > avgRate) {
      return { icon: ArrowUpRight, color: "text-success", label: "Above avg" };
    }
    return { icon: ArrowDownRight, color: "text-muted-foreground", label: "Below avg" };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          CTA Analytics & A/B Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MousePointerClick className="h-4 w-4" />
              <span className="text-xs font-medium">Total Clicks</span>
            </div>
            <p className="text-2xl font-bold">{analytics?.totalClicks || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics?.last7DaysClicks || 0} last 7 days
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <FileText className="h-4 w-4" />
              <span className="text-xs font-medium">RFQ Submissions</span>
            </div>
            <p className="text-2xl font-bold">{analytics?.totalRfqSubmissions || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics?.last7DaysRfq || 0} last 7 days
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">Conversion Rate</span>
            </div>
            <p className="text-2xl font-bold">
              {analytics?.conversionRate.toFixed(1) || 0}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Click to RFQ
            </p>
          </div>

          <div className="bg-primary/10 rounded-lg p-4">
            <div className="flex items-center gap-2 text-primary mb-1">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs font-medium">Active Variants</span>
            </div>
            <p className="text-2xl font-bold">2</p>
            <p className="text-xs text-muted-foreground mt-1">
              A/B Testing
            </p>
          </div>
        </div>

        {/* A/B Test Performance Comparison */}
        <div>
          <h4 className="text-sm font-semibold mb-4">A/B Test Variant Performance</h4>
          <div className="grid md:grid-cols-2 gap-4">
            {analytics?.variantPerformance.map((variant) => {
              const indicator = getPerformanceIndicator(variant, analytics.variantPerformance);
              const IndicatorIcon = indicator.icon;
              
              return (
                <div
                  key={variant.variant}
                  className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium capitalize">
                      {variant.variant === "primary" ? "🅰️ Primary CTA" : "🅱️ Secondary CTA"}
                    </span>
                    <span className={`text-xs flex items-center gap-1 ${indicator.color}`}>
                      <IndicatorIcon className="h-3 w-3" />
                      {indicator.label}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-semibold">{variant.clicks}</p>
                      <p className="text-xs text-muted-foreground">Clicks</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{variant.rfqSubmissions}</p>
                      <p className="text-xs text-muted-foreground">RFQs</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-primary">
                        {variant.conversionRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">Rate</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(variant.conversionRate * 5, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insights */}
        {analytics && analytics.variantPerformance.length > 0 && (
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-2 text-accent-foreground">💡 Insights</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {analytics.variantPerformance[0].conversionRate > analytics.variantPerformance[1]?.conversionRate ? (
                <li>• Primary CTA is outperforming Secondary by {(analytics.variantPerformance[0].conversionRate - (analytics.variantPerformance[1]?.conversionRate || 0)).toFixed(1)}%</li>
              ) : (
                <li>• Secondary CTA is outperforming Primary by {((analytics.variantPerformance[1]?.conversionRate || 0) - analytics.variantPerformance[0].conversionRate).toFixed(1)}%</li>
              )}
              <li>• Total engagement: {analytics.totalClicks} clicks tracked</li>
              {analytics.conversionRate > 5 && (
                <li>• Great conversion rate! Industry average is 2-5%</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CtaAnalyticsWidget;
