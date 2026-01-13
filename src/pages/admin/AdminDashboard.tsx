import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingCart, DollarSign, FileText, Building2, User } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import CtaAnalyticsWidget from "@/components/admin/CtaAnalyticsWidget";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/formatPrice";
import { Badge } from "@/components/ui/badge";

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
    { label: "মোট পণ্য", value: stats.totalProducts, icon: Package, color: "text-blue-600", bgColor: "bg-blue-50" },
    { label: "মোট অর্ডার (B2C)", value: stats.totalOrders, icon: ShoppingCart, color: "text-green-600", bgColor: "bg-green-50" },
    { label: "কোটেশন রিকোয়েস্ট (B2B)", value: stats.totalQuotes, icon: FileText, color: "text-purple-600", bgColor: "bg-purple-50" },
    { label: "মোট রেভিনিউ", value: formatPrice(stats.totalRevenue), icon: DollarSign, color: "text-amber-600", bgColor: "bg-amber-50" },
  ];

  const statusLabels: Record<string, string> = {
    pending_payment: "পেমেন্ট বাকি",
    paid: "পেমেন্ট সম্পন্ন",
    processing: "প্রসেসিং",
    shipped: "শিপিং হয়েছে",
    delivered: "ডেলিভারি সম্পন্ন",
    cancelled: "বাতিল",
  };

  const quoteStatusLabels: Record<string, string> = {
    pending: "পেন্ডিং",
    reviewed: "রিভিউড",
    quoted: "কোটেড",
    closed: "ক্লোজড",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">ড্যাশবোর্ড</h1>
          <p className="text-muted-foreground">B2B ও B2C উভয় ব্যবসার সারসংক্ষেপ</p>
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
                <h3 className="font-semibold">B2C - সরাসরি অর্ডার</h3>
                <p className="text-sm text-muted-foreground">ব্যক্তিগত ক্রেতাদের অর্ডার</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{stats.b2cOrders}</p>
                <p className="text-xs text-muted-foreground">মোট অর্ডার</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">{stats.pendingOrders}</p>
                <p className="text-xs text-muted-foreground">পেন্ডিং</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">B2B - প্রাতিষ্ঠানিক</h3>
                <p className="text-sm text-muted-foreground">কোটেশন রিকোয়েস্ট ও প্রাতিষ্ঠানিক অর্ডার</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.totalQuotes}</p>
                <p className="text-xs text-muted-foreground">মোট কোটেশন</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">{stats.pendingQuotes}</p>
                <p className="text-xs text-muted-foreground">পেন্ডিং</p>
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
                <h2 className="font-semibold">সাম্প্রতিক অর্ডার</h2>
              </div>
              <Link to="/admin/orders" className="text-sm text-primary hover:underline">
                সব দেখুন
              </Link>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">লোড হচ্ছে...</div>
              ) : recentOrders.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">কোনো অর্ডার নেই</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium">অর্ডার</th>
                      <th className="text-left p-4 text-sm font-medium">গ্রাহক</th>
                      <th className="text-left p-4 text-sm font-medium">মোট</th>
                      <th className="text-left p-4 text-sm font-medium">স্ট্যাটাস</th>
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
                            {statusLabels[order.status] || order.status}
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
                <h2 className="font-semibold">সাম্প্রতিক কোটেশন রিকোয়েস্ট</h2>
              </div>
              <Link to="/admin/quotes" className="text-sm text-primary hover:underline">
                সব দেখুন
              </Link>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">লোড হচ্ছে...</div>
              ) : recentQuotes.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">কোনো কোটেশন রিকোয়েস্ট নেই</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium">প্রতিষ্ঠান</th>
                      <th className="text-left p-4 text-sm font-medium">ক্যাটাগরি</th>
                      <th className="text-left p-4 text-sm font-medium">স্ট্যাটাস</th>
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
                            {quoteStatusLabels[quote.status] || quote.status}
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
