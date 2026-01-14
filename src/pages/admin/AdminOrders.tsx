import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, Plus, Trash2, FileText, ShoppingCart } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useAuth } from "@/contexts/AuthContext";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { OrderDeleteDialog } from "@/components/admin/OrderDeleteDialog";
import { BulkOrderDeleteDialog } from "@/components/admin/BulkOrderDeleteDialog";
import { OrderDeletionLogDialog } from "@/components/admin/OrderDeletionLogDialog";

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
  shipping_address: string;
  company_name: string | null;
  subtotal: number;
  shipping_cost: number | null;
  notes: string | null;
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
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [deletionLogDialogOpen, setDeletionLogDialogOpen] = useState(false);
  
  const { hasPermission, isSuperAdmin } = useAdmin();
  const { user } = useAuth();
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
      setSelectedOrders(new Set()); // Clear selection on refresh
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

  const logDeletion = async (order: Order) => {
    if (!user?.id) return;
    
    try {
      await supabase.from("order_deletion_logs").insert([{
        order_id: order.id,
        order_number: order.order_number,
        order_data: JSON.parse(JSON.stringify(order)),
        deleted_by: user.id,
      }]);
    } catch (error) {
      console.error("Error logging deletion:", error);
    }
  };

  const deleteOrder = async (orderId: string): Promise<boolean> => {
    try {
      // First delete order items
      const { error: itemsError } = await supabase
        .from("order_items")
        .delete()
        .eq("order_id", orderId);

      if (itemsError) {
        console.error("Error deleting order items:", itemsError);
        throw itemsError;
      }

      // Then delete the order
      const { error: orderError } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderId);

      if (orderError) {
        console.error("Error deleting order:", orderError);
        throw orderError;
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete || !canDelete) return;

    // Log deletion first
    await logDeletion(orderToDelete);

    const success = await deleteOrder(orderToDelete.id);

    if (success) {
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
      toast.success(t.orders.deleteSuccess);
      await fetchOrders();
    } else {
      toast.error(t.orders.deleteError);
    }
  };

  const handleBulkDeleteClick = () => {
    if (!canDelete || selectedOrders.size === 0) {
      toast.error(t.orders.noPermission);
      return;
    }
    setBulkDeleteDialogOpen(true);
  };

  const handleBulkDeleteConfirm = async () => {
    if (!canDelete || selectedOrders.size === 0) return;

    const selectedOrdersList = orders.filter(o => selectedOrders.has(o.id));
    let successCount = 0;
    let failCount = 0;

    for (const order of selectedOrdersList) {
      // Log deletion first
      await logDeletion(order);

      const success = await deleteOrder(order.id);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    setBulkDeleteDialogOpen(false);
    setSelectedOrders(new Set());

    if (failCount === 0) {
      toast.success(t.orders.bulkDeleteSuccess.replace("{count}", String(successCount)));
    } else {
      toast.error(t.orders.bulkDeleteError);
    }

    await fetchOrders();
  };

  const toggleOrderSelection = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map(o => o.id)));
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

  if (loading) {
    return (
      <AdminLayout>
        <AdminTableSkeleton columns={9} rows={10} showSearch={false} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <TooltipProvider>
        <div className={cn("space-y-6", language === "bn" && "font-siliguri")}>
          {/* Page Header - Enterprise Standard */}
          <div className="admin-page-header">
            <div>
              <h1 className="admin-page-title">{t.orders.title}</h1>
              <p className="admin-page-subtitle">{t.orders.subtitle}</p>
            </div>
            <div className="admin-action-bar">
              {/* Bulk actions when items are selected */}
              {canDelete && selectedOrders.size > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {t.orders.selectedCount.replace("{count}", String(selectedOrders.size))}
                  </Badge>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDeleteClick}
                    className="gap-1.5"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">{t.orders.bulkDelete}</span>
                  </Button>
                </div>
              )}
              
              {/* Deletion Log button for Super Admin */}
              {canDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletionLogDialogOpen(true)}
                  className="gap-1.5"
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.orders.deletionLog}</span>
                </Button>
              )}
              
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 h-9">
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
                <Button onClick={() => navigate("/admin/orders/new")} className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.orders.createOrder}</span>
                </Button>
              )}
            </div>
          </div>

          {/* Orders Table - Enterprise Standard with Sticky Header */}
          <div className="admin-table-wrapper">
            {filteredOrders.length === 0 ? (
              <div className="admin-empty-state">
                <ShoppingCart className="admin-empty-state-icon" />
                <p className="admin-empty-state-text">{t.orders.noOrders}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="admin-table">
                  <thead>
                    <tr>
                      {canDelete && (
                        <th className="w-12">
                          <Checkbox
                            checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                            onCheckedChange={toggleSelectAll}
                            aria-label={t.orders.selectAll}
                          />
                        </th>
                      )}
                      <th>{t.orders.orderNumber}</th>
                      <th>{t.orders.customer}</th>
                      <th className="hidden md:table-cell">{t.orders.city}</th>
                      <th>{t.orders.total}</th>
                      <th className="hidden lg:table-cell">{t.orders.paymentMethod}</th>
                      <th>{t.orders.status}</th>
                      <th className="hidden sm:table-cell">{t.orders.date}</th>
                      <th className="text-right">{t.common.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id}>
                        {canDelete && (
                          <td>
                            <Checkbox
                              checked={selectedOrders.has(order.id)}
                              onCheckedChange={() => toggleOrderSelection(order.id)}
                              aria-label={`Select order ${order.order_number}`}
                            />
                          </td>
                        )}
                        <td>
                          <span className="font-medium">{order.order_number}</span>
                        </td>
                        <td>
                          <div>
                            <p className="font-medium text-sm">{order.customer_name}</p>
                            <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                          </div>
                        </td>
                        <td className="hidden md:table-cell">{order.shipping_city}</td>
                        <td>
                          <span className="font-medium">{formatPrice(order.total, language)}</span>
                        </td>
                        <td className="hidden lg:table-cell text-muted-foreground">
                          {getPaymentMethodLabel(order.payment_method)}
                        </td>
                        <td>
                          {canUpdateStatus ? (
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleStatusChange(order.id, value)}
                              disabled={updatingStatus === order.id}
                            >
                              <SelectTrigger className="w-32 h-8 text-xs">
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
                                <Badge variant="secondary" className="cursor-not-allowed text-xs">
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
                        <td className="hidden sm:table-cell text-muted-foreground text-xs">
                          {formatDate(order.created_at)}
                        </td>
                        <td>
                          <div className="admin-table-actions">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/admin/orders/${order.id}`)}
                              className="h-8 gap-1.5"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="hidden lg:inline">{t.orders.viewDetails}</span>
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

        {/* Single Delete Confirmation Dialog */}
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

        {/* Bulk Delete Confirmation Dialog */}
        <BulkOrderDeleteDialog
          open={bulkDeleteDialogOpen}
          onOpenChange={setBulkDeleteDialogOpen}
          orderCount={selectedOrders.size}
          onConfirm={handleBulkDeleteConfirm}
          translations={{
            title: t.orders.bulkDeleteTitle,
            description: t.orders.bulkDeleteDescription,
            typeToConfirm: t.orders.typeToConfirm,
            confirmWord: t.orders.deleteConfirmWord,
            cancel: t.common.cancel,
            delete: t.common.delete,
            deleting: t.orders.deleting,
          }}
          language={language}
        />

        {/* Deletion Log Dialog */}
        <OrderDeletionLogDialog
          open={deletionLogDialogOpen}
          onOpenChange={setDeletionLogDialogOpen}
          translations={{
            title: t.orders.deletionLog,
            description: t.orders.deletionLogDescription,
            deletedBy: t.orders.deletedBy,
            deletedAt: t.orders.deletedAt,
            originalData: t.orders.originalData,
            viewOriginalData: t.orders.viewOriginalData,
            noDeleteLogs: t.orders.noDeleteLogs,
          }}
          language={language}
        />
      </TooltipProvider>
    </AdminLayout>
  );
};

export default AdminOrders;
