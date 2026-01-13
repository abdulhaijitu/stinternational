import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingCart, DollarSign, FileText, Building2, User } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import CtaAnalyticsWidget from "@/components/admin/CtaAnalyticsWidget";
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

  const statCards = [
    { label: t.dashboard.totalProducts, value: stats.totalProducts, icon: Package, color: "text-blue-600", bgColor: "bg-blue-50" },
    { label: t.dashboard.totalOrders, value: stats.totalOrders, icon: ShoppingCart, color: "text-green-600", bgColor: "bg-green-50" },
    { label: t.dashboard.quoteRequests, value: stats.totalQuotes, icon: FileText, color: "text-purple-600", bgColor: "bg-purple-50" },
    { label: t.dashboard.totalRevenue, value: formatPrice(stats.totalRevenue), icon: DollarSign, color: "text-amber-600", bgColor: "bg-amber-50" },
  ];

  const getStatusLabel = (status: string) => {
    return t.status[status as keyof typeof t.status] || status;
  };

  return (
    <AdminLayout>
      <div className={cn("space-y-6", language === "bn" && "font-siliguri")}>
        <div>
          <h1 className="text-2xl font-bold">{t.dashboard.title}</h1>
          <p className="text-muted-foreground">{t.dashboard.subtitle}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 ${stat.bgColor} rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* B2B vs B2C Summary */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">{t.dashboard.b2cDirect}</h3>
                <p className="text-sm text-muted-foreground">{t.dashboard.b2cDescription}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{stats.b2cOrders}</p>
                <p className="text-xs text-muted-foreground">{t.dashboard.totalOrders2}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">{stats.pendingOrders}</p>
                <p className="text-xs text-muted-foreground">{t.dashboard.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">{t.dashboard.b2bInstitutional}</h3>
                <p className="text-sm text-muted-foreground">{t.dashboard.b2bDescription}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.totalQuotes}</p>
                <p className="text-xs text-muted-foreground">{t.dashboard.totalQuotes}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">{stats.pendingQuotes}</p>
                <p className="text-xs text-muted-foreground">{t.dashboard.pending}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout for Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Orders (B2C) */}
          <div className="bg-card border border-border rounded-lg">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-green-600" />
                <h2 className="font-semibold">{t.dashboard.recentOrders}</h2>
              </div>
              <Link to="/admin/orders" className="text-sm text-primary hover:underline">
                {t.common.viewAll}
              </Link>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">{t.common.loading}</div>
              ) : recentOrders.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">{t.dashboard.noOrders}</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium">{t.dashboard.order}</th>
                      <th className="text-left p-4 text-sm font-medium">{t.dashboard.customer}</th>
                      <th className="text-left p-4 text-sm font-medium">{t.dashboard.total}</th>
                      <th className="text-left p-4 text-sm font-medium">{t.common.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-t border-border">
                        <td className="p-4 text-sm font-medium">{order.order_number}</td>
                        <td className="p-4 text-sm">
                          <div>
                            {order.customer_name}
                            {order.company_name && (
                              <Badge variant="outline" className="ml-2 text-xs">B2B</Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-sm font-medium">{formatPrice(order.total)}</td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            order.status === "pending_payment" ? "bg-amber-100 text-amber-700" :
                            order.status === "paid" ? "bg-green-100 text-green-700" :
                            order.status === "cancelled" ? "bg-red-100 text-red-700" :
                            "bg-blue-100 text-blue-700"
                          }`}>
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
          <div className="bg-card border border-border rounded-lg">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <h2 className="font-semibold">{t.dashboard.recentQuotes}</h2>
              </div>
              <Link to="/admin/quotes" className="text-sm text-primary hover:underline">
                {t.common.viewAll}
              </Link>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">{t.common.loading}</div>
              ) : recentQuotes.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">{t.dashboard.noQuotes}</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium">{t.dashboard.institution}</th>
                      <th className="text-left p-4 text-sm font-medium">{t.dashboard.category}</th>
                      <th className="text-left p-4 text-sm font-medium">{t.common.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentQuotes.map((quote) => (
                      <tr key={quote.id} className="border-t border-border">
                        <td className="p-4 text-sm">
                          <div className="font-medium">{quote.company_name}</div>
                          <div className="text-xs text-muted-foreground">{quote.contact_person}</div>
                        </td>
                        <td className="p-4 text-sm capitalize">{quote.product_category}</td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            quote.status === "pending" ? "bg-amber-100 text-amber-700" :
                            quote.status === "quoted" ? "bg-green-100 text-green-700" :
                            quote.status === "reviewed" ? "bg-blue-100 text-blue-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
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