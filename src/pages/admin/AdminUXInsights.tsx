import { useState } from "react";
import { 
  BarChart3, 
  MousePointerClick, 
  Users, 
  ShoppingCart,
  Search,
  Monitor,
  Smartphone,
  Tablet,
  ArrowUpCircle,
  Globe,
  LayoutGrid,
  TrendingUp,
  Package,
  Layers
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import UXRecommendations from "@/components/admin/UXRecommendations";
import { cn } from "@/lib/utils";
import {
  useTelemetrySummary,
  useTopCategories,
  useTopProducts,
  useConversionFunnel,
  useSearchAnalytics,
  useUtilityUsage,
  useHeroAnalytics,
  TimeRange,
} from "@/hooks/useUXTelemetryData";

const AdminUXInsights = () => {
  const { t, language } = useAdminLanguage();
  const [timeRange, setTimeRange] = useState<TimeRange>('7days');
  const filters = { timeRange };

  const { data: summary, isLoading: summaryLoading } = useTelemetrySummary(filters);
  const { data: topCategories, isLoading: categoriesLoading } = useTopCategories(filters);
  const { data: topProducts, isLoading: productsLoading } = useTopProducts(filters);
  const { data: funnel, isLoading: funnelLoading } = useConversionFunnel(filters);
  const { data: search, isLoading: searchLoading } = useSearchAnalytics(filters);
  const { data: utility, isLoading: utilityLoading } = useUtilityUsage(filters);
  const { data: hero, isLoading: heroLoading } = useHeroAnalytics(filters);

  const timeRangeOptions = [
    { value: "today", label: t.uxInsights.today },
    { value: "7days", label: t.uxInsights.last7Days },
    { value: "30days", label: t.uxInsights.last30Days },
  ];

  return (
    <AdminLayout>
      <div className={cn("space-y-6", language === "bn" && "font-siliguri")}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              {t.uxInsights.title}
            </h1>
            <p className="text-muted-foreground">
              {t.uxInsights.subtitle}
            </p>
          </div>
          
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRangeOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <MousePointerClick className="h-4 w-4" />
                {t.uxInsights.totalEvents}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold">{summary?.totalEvents.toLocaleString()}</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {t.uxInsights.uniqueSessions}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold">{summary?.uniqueSessions.toLocaleString()}</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <ShoppingCart className="h-4 w-4" />
                {t.uxInsights.conversionEvents}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold">{summary?.conversions.toLocaleString()}</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t.uxInsights.deviceSplit}</CardDescription>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <Skeleton className="h-8 w-full" />
              ) : (
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    {summary?.deviceBreakdown.desktop}
                  </span>
                  <span className="flex items-center gap-1">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    {summary?.deviceBreakdown.mobile}
                  </span>
                  <span className="flex items-center gap-1">
                    <Tablet className="h-4 w-4 text-muted-foreground" />
                    {summary?.deviceBreakdown.tablet}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendations Section */}
        <UXRecommendations 
          data={{
            summary,
            topCategories,
            topProducts,
            funnel,
            hero,
            utility,
          }}
          isLoading={summaryLoading}
        />

        {/* Main Content Tabs */}
        <Tabs defaultValue="navigation" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="navigation">{t.uxInsights.navigation}</TabsTrigger>
            <TabsTrigger value="products">{t.uxInsights.products}</TabsTrigger>
            <TabsTrigger value="conversion">{t.uxInsights.conversion}</TabsTrigger>
            <TabsTrigger value="utility">{t.uxInsights.utility}</TabsTrigger>
          </TabsList>

          {/* Navigation Tab */}
          <TabsContent value="navigation" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Hero Slider */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    {t.uxInsights.heroSlider}
                  </CardTitle>
                  <CardDescription>{t.uxInsights.viewsAndClicks}</CardDescription>
                </CardHeader>
                <CardContent>
                  {heroLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                    </div>
                  ) : hero && hero.length > 0 ? (
                    <div className="space-y-3">
                      {hero.map((slide) => (
                        <div key={slide.slide} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{t.uxInsights.slide} {slide.slide + 1}</span>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">
                              {slide.views} {t.uxInsights.views}
                            </span>
                            <Badge variant="secondary">
                              {slide.clicks} {t.uxInsights.clicks}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t.uxInsights.noDataAvailable}</p>
                  )}
                </CardContent>
              </Card>

              {/* Top Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    {t.uxInsights.topCategories}
                  </CardTitle>
                  <CardDescription>{t.uxInsights.mostInteracted}</CardDescription>
                </CardHeader>
                <CardContent>
                  {categoriesLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-8 w-full" />)}
                    </div>
                  ) : topCategories && topCategories.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t.uxInsights.category}</TableHead>
                          <TableHead className="text-right">{t.uxInsights.clicks}</TableHead>
                          <TableHead className="text-right">{t.uxInsights.hovers}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topCategories.slice(0, 5).map((cat) => (
                          <TableRow key={cat.slug}>
                            <TableCell className="font-medium">{cat.name}</TableCell>
                            <TableCell className="text-right">{cat.clicks}</TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {cat.hovers}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t.uxInsights.noDataAvailable}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Search Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  {t.uxInsights.searchAnalytics}
                </CardTitle>
                <CardDescription>
                  {searchLoading ? (
                    <Skeleton className="h-4 w-48" />
                  ) : (
                    `${search?.totalSearches || 0} ${t.uxInsights.totalSearches} • ${search?.categorySearchCount || 0} ${t.uxInsights.categoryAware}`
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {searchLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-8 w-full" />)}
                  </div>
                ) : search?.topTerms && search.topTerms.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {search.topTerms.map((item) => (
                      <Badge key={item.term} variant="outline" className="text-sm">
                        {item.term}
                        <span className="ml-1.5 text-muted-foreground">({item.count})</span>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t.uxInsights.noSearchData}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {t.uxInsights.topClickedProducts}
                </CardTitle>
                <CardDescription>{t.uxInsights.productViews}</CardDescription>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : topProducts && topProducts.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.uxInsights.product}</TableHead>
                        <TableHead className="text-right">{t.uxInsights.views}</TableHead>
                        <TableHead className="text-right">{t.uxInsights.addToCart}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topProducts.map((product) => (
                        <TableRow key={product.slug}>
                          <TableCell className="font-medium max-w-[200px] truncate">
                            {product.name}
                          </TableCell>
                          <TableCell className="text-right">{product.views}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={product.carts > 0 ? "default" : "secondary"}>
                              {product.carts}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">{t.uxInsights.noProductData}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conversion Tab */}
          <TabsContent value="conversion" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Conversion Funnel */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    {t.uxInsights.conversionFunnel}
                  </CardTitle>
                  <CardDescription>{t.uxInsights.cartToCompletion}</CardDescription>
                </CardHeader>
                <CardContent>
                  {funnelLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-8 w-full" />)}
                    </div>
                  ) : funnel ? (
                    <div className="space-y-4">
                      <FunnelStep 
                        label={t.uxInsights.addToCart} 
                        count={funnel.addToCart} 
                        maxCount={Math.max(funnel.addToCart, funnel.checkoutStart, funnel.orderComplete, 1)} 
                      />
                      <FunnelStep 
                        label={t.uxInsights.buyNowClicks} 
                        count={funnel.buyNow} 
                        maxCount={Math.max(funnel.addToCart, funnel.checkoutStart, funnel.orderComplete, 1)} 
                      />
                      <FunnelStep 
                        label={t.uxInsights.checkoutStarted} 
                        count={funnel.checkoutStart} 
                        maxCount={Math.max(funnel.addToCart, funnel.checkoutStart, funnel.orderComplete, 1)} 
                      />
                      <FunnelStep 
                        label={t.uxInsights.ordersCompleted} 
                        count={funnel.orderComplete} 
                        maxCount={Math.max(funnel.addToCart, funnel.checkoutStart, funnel.orderComplete, 1)} 
                        highlight 
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t.uxInsights.noConversionData}</p>
                  )}
                </CardContent>
              </Card>

              {/* RFQ vs Direct */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t.uxInsights.rfqVsDirect}</CardTitle>
                  <CardDescription>{t.uxInsights.quoteVsOrders}</CardDescription>
                </CardHeader>
                <CardContent>
                  {funnelLoading ? (
                    <Skeleton className="h-24 w-full" />
                  ) : funnel ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{t.uxInsights.rfqSubmissions}</span>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {funnel.rfqSubmit}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{t.uxInsights.directOrders}</span>
                        <Badge className="text-lg px-3 py-1">
                          {funnel.orderComplete}
                        </Badge>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          {funnel.rfqSubmit > funnel.orderComplete 
                            ? t.uxInsights.b2bFocused
                            : funnel.orderComplete > funnel.rfqSubmit
                            ? t.uxInsights.b2cFocused
                            : t.uxInsights.balanced}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t.uxInsights.noDataAvailable}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Utility Tab */}
          <TabsContent value="utility" className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Back to Top */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ArrowUpCircle className="h-4 w-4" />
                    {t.uxInsights.backToTop}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {utilityLoading ? (
                    <Skeleton className="h-12 w-full" />
                  ) : (
                    <div className="text-center">
                      <p className="text-3xl font-bold">{utility?.backToTop || 0}</p>
                      <p className="text-sm text-muted-foreground">{t.uxInsights.buttonClicks}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Language Switch */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {t.uxInsights.languageUsage}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {utilityLoading ? (
                    <Skeleton className="h-12 w-full" />
                  ) : (
                    <div className="flex items-center justify-center gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{utility?.languageSwitch.en || 0}</p>
                        <p className="text-xs text-muted-foreground">{t.uxInsights.toEnglish}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{utility?.languageSwitch.bn || 0}</p>
                        <p className="text-xs text-muted-foreground">{t.uxInsights.toBangla}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Grid Density */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    {t.uxInsights.gridDensity}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {utilityLoading ? (
                    <Skeleton className="h-12 w-full" />
                  ) : (
                    <div className="flex items-center justify-center gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{utility?.gridDensity.comfortable || 0}</p>
                        <p className="text-xs text-muted-foreground">{t.uxInsights.comfortable}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{utility?.gridDensity.compact || 0}</p>
                        <p className="text-xs text-muted-foreground">{t.uxInsights.compact}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

// Helper component for funnel visualization
const FunnelStep = ({ 
  label, 
  count, 
  maxCount, 
  highlight = false 
}: { 
  label: string; 
  count: number; 
  maxCount: number; 
  highlight?: boolean;
}) => {
  const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className={highlight ? "font-medium" : ""}>{label}</span>
        <span className={highlight ? "font-bold" : "text-muted-foreground"}>{count}</span>
      </div>
      <Progress value={percentage} className={highlight ? "h-2" : "h-1.5"} />
    </div>
  );
};

export default AdminUXInsights;