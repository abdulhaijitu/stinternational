import { useEffect, useState } from "react";
import { Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/formatPrice";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
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
        .select("id, total, status, order_number, customer_name, created_at")
        .order("created_at", { ascending: false });

      const orders = ordersData || [];
      const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
      const pendingOrders = orders.filter(o => o.status === "pending_payment").length;

      setStats({
        totalProducts: productsCount || 0,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: "মোট পণ্য", value: stats.totalProducts, icon: Package, color: "text-blue-600" },
    { label: "মোট অর্ডার", value: stats.totalOrders, icon: ShoppingCart, color: "text-green-600" },
    { label: "মোট রেভিনিউ", value: formatPrice(stats.totalRevenue), icon: DollarSign, color: "text-amber-600" },
    { label: "পেন্ডিং অর্ডার", value: stats.pendingOrders, icon: TrendingUp, color: "text-red-600" },
  ];

  const statusLabels: Record<string, string> = {
    pending_payment: "পেমেন্ট বাকি",
    paid: "পেমেন্ট সম্পন্ন",
    processing: "প্রসেসিং",
    shipped: "শিপিং হয়েছে",
    delivered: "ডেলিভারি সম্পন্ন",
    cancelled: "বাতিল",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">ড্যাশবোর্ড</h1>
          <p className="text-muted-foreground">স্বাগতম, এখানে আপনার ব্যবসার সারসংক্ষেপ দেখুন</p>
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
                <div className={`p-3 bg-muted rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-card border border-border rounded-lg">
          <div className="p-6 border-b border-border">
            <h2 className="font-semibold">সাম্প্রতিক অর্ডার</h2>
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
                    <th className="text-left p-4 text-sm font-medium">অর্ডার নম্বর</th>
                    <th className="text-left p-4 text-sm font-medium">গ্রাহক</th>
                    <th className="text-left p-4 text-sm font-medium">মোট</th>
                    <th className="text-left p-4 text-sm font-medium">স্ট্যাটাস</th>
                    <th className="text-left p-4 text-sm font-medium">তারিখ</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-t border-border">
                      <td className="p-4 text-sm font-medium">{order.order_number}</td>
                      <td className="p-4 text-sm">{order.customer_name}</td>
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
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("bn-BD")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
