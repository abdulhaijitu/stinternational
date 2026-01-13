import { useEffect, useState } from "react";
import { Eye, Loader2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/formatPrice";
import { toast } from "sonner";

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  total: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_city: string;
  created_at: string;
}

const statusOptions = [
  { value: "pending_payment", label: "পেমেন্ট বাকি" },
  { value: "paid", label: "পেমেন্ট সম্পন্ন" },
  { value: "processing", label: "প্রসেসিং" },
  { value: "shipped", label: "শিপিং হয়েছে" },
  { value: "delivered", label: "ডেলিভারি সম্পন্ন" },
  { value: "cancelled", label: "বাতিল" },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("অর্ডার লোড করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus as any })
        .eq("id", orderId);

      if (error) throw error;

      setOrders(orders.map((o) =>
        o.id === orderId ? { ...o, status: newStatus } : o
      ));
      toast.success("স্ট্যাটাস আপডেট হয়েছে");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("আপডেট করতে সমস্যা হয়েছে");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filteredOrders = statusFilter === "all"
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  const paymentMethodLabels: Record<string, string> = {
    cash_on_delivery: "ক্যাশ অন ডেলিভারি",
    bank_transfer: "ব্যাংক ট্রান্সফার",
    online_payment: "অনলাইন পেমেন্ট",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">অর্ডার</h1>
            <p className="text-muted-foreground">সব অর্ডার দেখুন ও ম্যানেজ করুন</p>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="সব অর্ডার" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব অর্ডার</SelectItem>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Orders Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              কোনো অর্ডার নেই
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium">অর্ডার নম্বর</th>
                    <th className="text-left p-4 text-sm font-medium">গ্রাহক</th>
                    <th className="text-left p-4 text-sm font-medium">শহর</th>
                    <th className="text-left p-4 text-sm font-medium">মোট</th>
                    <th className="text-left p-4 text-sm font-medium">পেমেন্ট</th>
                    <th className="text-left p-4 text-sm font-medium">স্ট্যাটাস</th>
                    <th className="text-left p-4 text-sm font-medium">তারিখ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-t border-border">
                      <td className="p-4 text-sm font-medium">{order.order_number}</td>
                      <td className="p-4">
                        <p className="text-sm font-medium">{order.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                      </td>
                      <td className="p-4 text-sm">{order.shipping_city}</td>
                      <td className="p-4 text-sm font-medium">{formatPrice(order.total)}</td>
                      <td className="p-4 text-sm">
                        {paymentMethodLabels[order.payment_method] || order.payment_method}
                      </td>
                      <td className="p-4">
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value)}
                          disabled={updatingStatus === order.id}
                        >
                          <SelectTrigger className="w-40 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("bn-BD")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
