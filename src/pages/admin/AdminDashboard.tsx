import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingCart, DollarSign, FileText, Building2, User, TrendingUp } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import CtaAnalyticsWidget from "@/components/admin/CtaAnalyticsWidget";
import DashboardSkeleton from "@/components/admin/DashboardSkeleton";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/formatPrice";
import { Badge } from "@/components/ui/badge";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { cn } from "@/lib/utils";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  totalQuotes: number;
  pendingQuotes: number;
  b2bOrders: number;
  b2cOrders: number;
}

const AdminDashboard = () => {
  const { t, language } = useAdminLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalQuotes: 0,
    pendingQuotes: 0,
    b2bOrders: 0,
    b2cOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentQuotes, setRecentQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch products count
      const { count: productsCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      // Fetch orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select("id, total, status, order_number, customer_name, company_name, created_at")
        .order("created_at", { ascending: false });

      // Fetch quote requests
      const { data: quotesData } = await supabase
        .from("quote_requests")
        .select("id, company_name, contact_person, status, created_at, product_category")
        .order("created_at", { ascending: false });

      const orders = ordersData || [];
      const quotes = quotesData || [];
      const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
      const pendingOrders = orders.filter(o => o.status === "pending_payment").length;
      const pendingQuotes = quotes.filter(q => q.status === "pending").length;
      
      // Identify B2B (has company name) vs B2C orders
      const b2bOrders = orders.filter(o => o.company_name && o.company_name.trim() !== "").length;
      const b2cOrders = orders.length - b2bOrders;

      setStats({
        totalProducts: productsCount || 0,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
        totalQuotes: quotes.length,
        pendingQuotes,
        b2bOrders,
        b2cOrders,
      });

      setRecentOrders(orders.slice(0, 5));
      setRecentQuotes(quotes.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Using semantic color tokens only - no arbitrary hex values
  const statCards = [
    { label: t.dashboard.totalProducts, value: stats.totalProducts, icon: Package, color: "text-info", bgColor: "bg-info/10" },
    { label: t.dashboard.totalOrders, value: stats.totalOrders, icon: ShoppingCart, color: "text-success", bgColor: "bg-success/10" },
    { label: t.dashboard.quoteRequests, value: stats.totalQuotes, icon: FileText, color: "text-primary", bgColor: "bg-primary/10" },
    { label: t.dashboard.totalRevenue, value: formatPrice(stats.totalRevenue), icon: DollarSign, color: "text-warning", bgColor: "bg-warning/10" },
  ];

  const getStatusLabel = (status: string) => {
    return t.status[status as keyof typeof t.status] || status;
  };

  if (loading) {
    return (
      <AdminLayout>
        <DashboardSkeleton />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={cn(language === "bn" && "font-siliguri")} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <AdminPageHeader 
          title={t.dashboard.title} 
          subtitle={t.dashboard.subtitle}
        />

        {/* Stats Cards - Using token spacing */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4" style={{ gap: 'var(--space-4)' }}>
          {statCards.map((stat, index) => (
            <div key={index} className="admin-stats-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold" style={{ marginTop: 'var(--space-1)' }}>{stat.value}</p>
                </div>
                <div className={cn("flex items-center justify-center", stat.bgColor, stat.color)} style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)' }}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* B2B vs B2C Summary - Using semantic colors */}
        <div className="grid md:grid-cols-2" style={{ gap: 'var(--space-4)' }}>
          <div className="admin-stats-card">
            <div className="flex items-center" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <div className="bg-info/10" style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-lg)' }}>
                <User className="h-5 w-5 text-info" />
              </div>
              <div>
                <h3 className="font-semibold">{t.dashboard.b2cDirect}</h3>
                <p className="text-sm text-muted-foreground">{t.dashboard.b2cDescription}</p>
              </div>
            </div>
            <div className="grid grid-cols-2" style={{ gap: 'var(--space-4)' }}>
              <div className="bg-muted/50 text-center" style={{ borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
                <p className="text-2xl font-bold text-success">{stats.b2cOrders}</p>
                <p className="text-xs text-muted-foreground">{t.dashboard.totalOrders2}</p>
              </div>
              <div className="bg-muted/50 text-center" style={{ borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
                <p className="text-2xl font-bold text-warning">{stats.pendingOrders}</p>
                <p className="text-xs text-muted-foreground">{t.dashboard.pending}</p>
              </div>
            </div>
          </div>

          <div className="admin-stats-card">
            <div className="flex items-center" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <div className="bg-primary/10" style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-lg)' }}>
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{t.dashboard.b2bInstitutional}</h3>
                <p className="text-sm text-muted-foreground">{t.dashboard.b2bDescription}</p>
              </div>
            </div>
            <div className="grid grid-cols-2" style={{ gap: 'var(--space-4)' }}>
              <div className="bg-muted/50 text-center" style={{ borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
                <p className="text-2xl font-bold text-primary">{stats.totalQuotes}</p>
                <p className="text-xs text-muted-foreground">{t.dashboard.totalQuotes}</p>
              </div>
              <div className="bg-muted/50 text-center" style={{ borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
                <p className="text-2xl font-bold text-warning">{stats.pendingQuotes}</p>
                <p className="text-xs text-muted-foreground">{t.dashboard.pending}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout for Recent Activity */}
        <div className="grid lg:grid-cols-2" style={{ gap: 'var(--space-6)' }}>
          {/* Recent Orders (B2C) */}
          <div className="admin-table-wrapper">
            <div className="flex items-center justify-between border-b border-border" style={{ padding: 'var(--space-4)' }}>
              <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                <ShoppingCart className="h-5 w-5 text-success" />
                <h2 className="font-semibold">{t.dashboard.recentOrders}</h2>
              </div>
              <Link to="/admin/orders" className="text-sm text-primary hover:underline">
                {t.common.viewAll}
              </Link>
            </div>
            <div className="overflow-x-auto">
              {recentOrders.length === 0 ? (
                <div className="text-center text-muted-foreground" style={{ padding: 'var(--space-8)' }}>{t.dashboard.noOrders}</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{t.dashboard.order}</th>
                      <th>{t.dashboard.customer}</th>
                      <th>{t.dashboard.total}</th>
                      <th>{t.common.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="font-medium">{order.order_number}</td>
                        <td>
                          <div>
                            {order.customer_name}
                            {order.company_name && (
                              <Badge variant="outline" className="ml-2 text-xs">B2B</Badge>
                            )}
                          </div>
                        </td>
                        <td className="font-medium">{formatPrice(order.total)}</td>
                        <td>
                          <span className={cn(
                            "text-xs px-2 py-1",
                            order.status === "pending_payment" && "admin-badge-warning",
                            order.status === "paid" && "admin-badge-success",
                            order.status === "cancelled" && "admin-badge-danger",
                            !["pending_payment", "paid", "cancelled"].includes(order.status) && "admin-badge-info"
                          )} style={{ borderRadius: 'var(--radius-full)' }}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Recent Quotes (B2B) */}
          <div className="admin-table-wrapper">
            <div className="flex items-center justify-between border-b border-border" style={{ padding: 'var(--space-4)' }}>
              <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">{t.dashboard.recentQuotes}</h2>
              </div>
              <Link to="/admin/quotes" className="text-sm text-primary hover:underline">
                {t.common.viewAll}
              </Link>
            </div>
            <div className="overflow-x-auto">
              {recentQuotes.length === 0 ? (
                <div className="text-center text-muted-foreground" style={{ padding: 'var(--space-8)' }}>{t.dashboard.noQuotes}</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{t.dashboard.institution}</th>
                      <th>{t.dashboard.category}</th>
                      <th>{t.common.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentQuotes.map((quote) => (
                      <tr key={quote.id}>
                        <td>
                          <div className="font-medium">{quote.company_name}</div>
                          <div className="text-xs text-muted-foreground">{quote.contact_person}</div>
                        </td>
                        <td className="capitalize">{quote.product_category}</td>
                        <td>
                          <span className={cn(
                            "text-xs px-2 py-1",
                            quote.status === "pending" && "admin-badge-warning",
                            quote.status === "quoted" && "admin-badge-success",
                            quote.status === "reviewed" && "admin-badge-info",
                            !["pending", "quoted", "reviewed"].includes(quote.status) && "admin-badge-neutral"
                          )} style={{ borderRadius: 'var(--radius-full)' }}>
                            {getStatusLabel(quote.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* CTA Analytics Widget */}
        <CtaAnalyticsWidget />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;