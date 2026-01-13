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
  const [timeRange, setTimeRange] = useState<TimeRange>('7days');
  const filters = { timeRange };

  const { data: summary, isLoading: summaryLoading } = useTelemetrySummary(filters);
  const { data: topCategories, isLoading: categoriesLoading } = useTopCategories(filters);
  const { data: topProducts, isLoading: productsLoading } = useTopProducts(filters);
  const { data: funnel, isLoading: funnelLoading } = useConversionFunnel(filters);
  const { data: search, isLoading: searchLoading } = useSearchAnalytics(filters);
  const { data: utility, isLoading: utilityLoading } = useUtilityUsage(filters);
  const { data: hero, isLoading: heroLoading } = useHeroAnalytics(filters);

  const timeRangeLabels: Record<TimeRange, string> = {
    today: 'Today',
    '7days': 'Last 7 Days',
    '30days': 'Last 30 Days',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              UX Insights
            </h1>
            <p className="text-muted-foreground">
              Monitor user behavior and navigation effectiveness
            </p>
          </div>
          
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <MousePointerClick className="h-4 w-4" />
                Total Events
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
                Unique Sessions
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
                Conversion Events
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
              <CardDescription>Device Split</CardDescription>
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

        {/* Main Content Tabs */}
        <Tabs defaultValue="navigation" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="conversion">Conversion</TabsTrigger>
            <TabsTrigger value="utility">Utility</TabsTrigger>
          </TabsList>

          {/* Navigation Tab */}
          <TabsContent value="navigation" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Hero Slider */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Hero Slider Performance
                  </CardTitle>
                  <CardDescription>Views and clicks per slide</CardDescription>
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
                          <span className="text-sm font-medium">Slide {slide.slide + 1}</span>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">
                              {slide.views} views
                            </span>
                            <Badge variant="secondary">
                              {slide.clicks} clicks
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No data available</p>
                  )}
                </CardContent>
              </Card>

              {/* Top Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    Top Categories
                  </CardTitle>
                  <CardDescription>Most interacted categories</CardDescription>
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
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Clicks</TableHead>
                          <TableHead className="text-right">Hovers</TableHead>
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
                    <p className="text-sm text-muted-foreground">No data available</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Search Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search Analytics
                </CardTitle>
                <CardDescription>
                  {searchLoading ? (
                    <Skeleton className="h-4 w-48" />
                  ) : (
                    `${search?.totalSearches || 0} total searches • ${search?.categorySearchCount || 0} category-aware`
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
                  <p className="text-sm text-muted-foreground">No search data available</p>
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
                  Top Clicked Products
                </CardTitle>
                <CardDescription>Most viewed products from cards and mega menu</CardDescription>
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
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Views</TableHead>
                        <TableHead className="text-right">Add to Cart</TableHead>
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
                  <p className="text-sm text-muted-foreground">No product data available</p>
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
                    Conversion Funnel
                  </CardTitle>
                  <CardDescription>From cart to completion</CardDescription>
                </CardHeader>
                <CardContent>
                  {funnelLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-8 w-full" />)}
                    </div>
                  ) : funnel ? (
                    <div className="space-y-4">
                      <FunnelStep 
                        label="Add to Cart" 
                        count={funnel.addToCart} 
                        maxCount={Math.max(funnel.addToCart, funnel.checkoutStart, funnel.orderComplete, 1)} 
                      />
                      <FunnelStep 
                        label="Buy Now Clicks" 
                        count={funnel.buyNow} 
                        maxCount={Math.max(funnel.addToCart, funnel.checkoutStart, funnel.orderComplete, 1)} 
                      />
                      <FunnelStep 
                        label="Checkout Started" 
                        count={funnel.checkoutStart} 
                        maxCount={Math.max(funnel.addToCart, funnel.checkoutStart, funnel.orderComplete, 1)} 
                      />
                      <FunnelStep 
                        label="Orders Completed" 
                        count={funnel.orderComplete} 
                        maxCount={Math.max(funnel.addToCart, funnel.checkoutStart, funnel.orderComplete, 1)} 
                        highlight 
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No conversion data</p>
                  )}
                </CardContent>
              </Card>

              {/* RFQ vs Direct */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">RFQ vs Direct Purchase</CardTitle>
                  <CardDescription>Quote requests compared to direct orders</CardDescription>
                </CardHeader>
                <CardContent>
                  {funnelLoading ? (
                    <Skeleton className="h-24 w-full" />
                  ) : funnel ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">RFQ Submissions</span>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {funnel.rfqSubmit}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Direct Orders</span>
                        <Badge className="text-lg px-3 py-1">
                          {funnel.orderComplete}
                        </Badge>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          {funnel.rfqSubmit > funnel.orderComplete 
                            ? "B2B focused: More quote requests than direct purchases"
                            : funnel.orderComplete > funnel.rfqSubmit
                            ? "B2C focused: More direct purchases than quote requests"
                            : "Balanced between B2B and B2C channels"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No data available</p>
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
                    Back to Top
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {utilityLoading ? (
                    <Skeleton className="h-12 w-full" />
                  ) : (
                    <div className="text-center">
                      <p className="text-3xl font-bold">{utility?.backToTop || 0}</p>
                      <p className="text-sm text-muted-foreground">button clicks</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Language Switch */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Language Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {utilityLoading ? (
                    <Skeleton className="h-12 w-full" />
                  ) : (
                    <div className="flex items-center justify-center gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{utility?.languageSwitch.en || 0}</p>
                        <p className="text-xs text-muted-foreground">→ English</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{utility?.languageSwitch.bn || 0}</p>
                        <p className="text-xs text-muted-foreground">→ বাংলা</p>
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
                    Grid Density
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {utilityLoading ? (
                    <Skeleton className="h-12 w-full" />
                  ) : (
                    <div className="flex items-center justify-center gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{utility?.gridDensity.comfortable || 0}</p>
                        <p className="text-xs text-muted-foreground">Comfortable</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{utility?.gridDensity.compact || 0}</p>
                        <p className="text-xs text-muted-foreground">Compact</p>
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
