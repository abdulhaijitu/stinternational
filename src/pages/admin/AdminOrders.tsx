import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Lock, Eye, Plus, Trash2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { OrderDeleteDialog } from "@/components/admin/OrderDeleteDialog";

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
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  
  const { hasPermission, isSuperAdmin } = useAdmin();
  const { t, language } = useAdminLanguage();
  
  // Permission checks - Super Admin has full control
  const canCreate = isSuperAdmin;
  const canDelete = isSuperAdmin;
  const canUpdateStatus = isSuperAdmin || hasPermission("orders", "edit");

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

  const handleDeleteClick = (order: Order) => {
    if (!canDelete) {
      toast.error(t.orders.noPermission);
      return;
    }
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete || !canDelete) return;

    try {
      // First delete order items
      const { error: itemsError } = await supabase
        .from("order_items")
        .delete()
        .eq("order_id", orderToDelete.id);

      if (itemsError) throw itemsError;

      // Then delete the order
      const { error: orderError } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderToDelete.id);

      if (orderError) throw orderError;

      setOrders(orders.filter((o) => o.id !== orderToDelete.id));
      toast.success(t.orders.deleteSuccess);
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error(t.orders.deleteError);
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
            <div className="flex items-center gap-3">
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
              
              {/* Only show Create button for Super Admin */}
              {canCreate && (
                <Button onClick={() => navigate("/admin/orders/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t.orders.createOrder}
                </Button>
              )}
            </div>
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
                      <th className="text-left p-4 text-sm font-medium">{t.common.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="p-4 text-sm font-medium">{order.order_number}</td>
                        <td className="p-4">
                          <p className="text-sm font-medium">{order.customer_name}</p>
                          <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                        </td>
                        <td className="p-4 text-sm">{order.shipping_city}</td>
                        <td className="p-4 text-sm font-medium">{formatPrice(order.total, language)}</td>
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
                                <Badge variant="secondary" className="cursor-not-allowed">
                                  <Lock className="h-3 w-3 mr-1" />
                                  {getStatusLabel(order.status)}
                                </Badge>
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
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/admin/orders/${order.id}`)}
                              className="h-8"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              {t.orders.viewDetails}
                            </Button>
                            
                            {/* Only show Delete button for Super Admin */}
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(order)}
                                className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {orderToDelete && (
          <OrderDeleteDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            orderNumber={orderToDelete.order_number}
            onConfirm={handleDeleteConfirm}
            translations={{
              title: t.orders.deleteTitle,
              description: t.orders.deleteDescription,
              typeToConfirm: t.orders.typeToConfirm,
              confirmWord: t.orders.deleteConfirmWord,
              cancel: t.common.cancel,
              delete: t.common.delete,
              deleting: t.orders.deleting,
            }}
            language={language}
          />
        )}
      </TooltipProvider>
    </AdminLayout>
  );
};

export default AdminOrders;