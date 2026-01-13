import { useEffect, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
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
import { useAdmin } from "@/contexts/AdminContext";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  
  const { hasPermission, isSuperAdmin } = useAdmin();
  const { t, language } = useAdminLanguage();
  
  // Permission checks
  const canUpdateStatus = isSuperAdmin || hasPermission("orders", "update");

  // Status options with translations
  const statusOptions = [
    { value: "pending_payment", label: t.status.pending_payment },
    { value: "paid", label: t.status.paid },
    { value: "processing", label: t.status.processing },
    { value: "shipped", label: t.status.shipped },
    { value: "delivered", label: t.status.delivered },
    { value: "cancelled", label: t.status.cancelled },
  ];

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
      toast.error(t.orders.loadError);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!canUpdateStatus) {
      toast.error(t.orders.noPermission);
      return;
    }
    
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
      toast.success(t.orders.updateSuccess);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(t.orders.updateError);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filteredOrders = statusFilter === "all"
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  const getPaymentMethodLabel = (method: string) => {
    const methods = t.orders.paymentMethods as Record<string, string>;
    return methods[method] || method;
  };

  const getStatusLabel = (status: string) => {
    return statusOptions.find(s => s.value === status)?.label || status;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(language === "bn" ? "bn-BD" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AdminLayout>
      <TooltipProvider>
        <div className={cn("space-y-6", language === "bn" && "font-siliguri")}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{t.orders.title}</h1>
              <p className="text-muted-foreground">{t.orders.subtitle}</p>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t.orders.allOrders} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.orders.allOrders}</SelectItem>
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
                {t.orders.noOrders}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium">{t.orders.orderNumber}</th>
                      <th className="text-left p-4 text-sm font-medium">{t.orders.customer}</th>
                      <th className="text-left p-4 text-sm font-medium">{t.orders.city}</th>
                      <th className="text-left p-4 text-sm font-medium">{t.orders.total}</th>
                      <th className="text-left p-4 text-sm font-medium">{t.orders.paymentMethod}</th>
                      <th className="text-left p-4 text-sm font-medium">{t.orders.status}</th>
                      <th className="text-left p-4 text-sm font-medium">{t.orders.date}</th>
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
                          {getPaymentMethodLabel(order.payment_method)}
                        </td>
                        <td className="p-4">
                          {canUpdateStatus ? (
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
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 text-xs px-2 py-1 bg-muted rounded cursor-not-allowed">
                                  <Lock className="h-3 w-3" />
                                  {getStatusLabel(order.status)}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t.orders.noStatusPermission}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {formatDate(order.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </TooltipProvider>
    </AdminLayout>
  );
};

export default AdminOrders;