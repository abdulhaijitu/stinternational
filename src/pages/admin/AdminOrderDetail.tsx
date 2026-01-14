import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  Package, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  Building2,
  CreditCard,
  FileText,
  Loader2,
  Lock,
  FileDown,
  Edit,
  Trash2,
  Save,
  X
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/formatPrice";
import { downloadInvoice } from "@/lib/invoice-generator";
import { toast } from "sonner";
import { useAdmin } from "@/contexts/AdminContext";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { cn } from "@/lib/utils";
import { OrderDeleteDialog } from "@/components/admin/OrderDeleteDialog";

interface OrderItem {
  id: string;
  product_name: string;
  product_sku: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface OrderDetails {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  subtotal: number;
  shipping_cost: number | null;
  total: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  company_name: string | null;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const AdminOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    company_name: "",
    shipping_address: "",
    shipping_city: "",
    shipping_postal_code: "",
    notes: "",
    shipping_cost: 0,
  });
  
  const { hasPermission, isSuperAdmin } = useAdmin();
  const { t, language } = useAdminLanguage();
  
  // Permission checks - Super Admin has full control
  const canEdit = isSuperAdmin;
  const canDelete = isSuperAdmin;
  const canUpdateStatus = isSuperAdmin || hasPermission("orders", "edit");

  const statusOptions = [
    { value: "pending_payment", label: t.status.pending_payment, color: "bg-yellow-500" },
    { value: "paid", label: t.status.paid, color: "bg-blue-500" },
    { value: "processing", label: t.status.processing, color: "bg-purple-500" },
    { value: "shipped", label: t.status.shipped, color: "bg-indigo-500" },
    { value: "delivered", label: t.status.delivered, color: "bg-green-500" },
    { value: "cancelled", label: t.status.cancelled, color: "bg-red-500" },
  ];

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (orderError) throw orderError;
      setOrder(orderData);
      
      // Initialize edit form
      setEditForm({
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone,
        company_name: orderData.company_name || "",
        shipping_address: orderData.shipping_address,
        shipping_city: orderData.shipping_city,
        shipping_postal_code: orderData.shipping_postal_code || "",
        notes: orderData.notes || "",
        shipping_cost: orderData.shipping_cost || 0,
      });

      // Fetch order items
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", id);

      if (itemsError) throw itemsError;
      setItems(itemsData || []);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error(t.orders.loadError);
      navigate("/admin/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!canUpdateStatus || !order) return;
    
    setUpdatingStatus(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({ status: newStatus as any })
        .eq("id", order.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("No data returned from update");

      // Update local state only after backend confirmation
      setOrder({ ...order, status: data.status });
      toast.success(t.orders.updateSuccess);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(t.orders.updateError);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!order || !canEdit) return;
    
    setSaving(true);
    try {
      const newTotal = order.subtotal + editForm.shipping_cost;
      
      const { data, error } = await supabase
        .from("orders")
        .update({
          customer_name: editForm.customer_name,
          customer_email: editForm.customer_email,
          customer_phone: editForm.customer_phone,
          company_name: editForm.company_name || null,
          shipping_address: editForm.shipping_address,
          shipping_city: editForm.shipping_city,
          shipping_postal_code: editForm.shipping_postal_code || null,
          notes: editForm.notes || null,
          shipping_cost: editForm.shipping_cost,
          total: newTotal,
        })
        .eq("id", order.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("No data returned from update");

      // Update local state only after backend confirmation with returned data
      setOrder({
        ...order,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        company_name: data.company_name,
        shipping_address: data.shipping_address,
        shipping_city: data.shipping_city,
        shipping_postal_code: data.shipping_postal_code,
        notes: data.notes,
        shipping_cost: data.shipping_cost,
        total: data.total,
      });
      
      setIsEditing(false);
      toast.success(t.orders.editSuccess);
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error(t.orders.editError);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!order || !canDelete) return;

    try {
      // First delete order items
      const { error: itemsError } = await supabase
        .from("order_items")
        .delete()
        .eq("order_id", order.id);

      if (itemsError) throw itemsError;

      // Then delete the order
      const { error: orderError } = await supabase
        .from("orders")
        .delete()
        .eq("id", order.id);

      if (orderError) throw orderError;

      toast.success(t.orders.deleteSuccess);
      navigate("/admin/orders");
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error(t.orders.deleteError);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    if (!order) return;
    
    const exportData = {
      order: {
        ...order,
        items: items,
      },
      exported_at: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `order-${order.order_number}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t.orders.exportedSuccess);
  };

  const handleDownloadInvoice = () => {
    if (!order) return;
    
    downloadInvoice({
      orderNumber: order.order_number,
      orderDate: order.created_at,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      companyName: order.company_name,
      shippingAddress: order.shipping_address,
      shippingCity: order.shipping_city,
      shippingPostalCode: order.shipping_postal_code,
      items: items.map(item => ({
        name: item.product_name,
        sku: item.product_sku,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price,
      })),
      subtotal: order.subtotal,
      shippingCost: order.shipping_cost || 0,
      total: order.total,
      paymentMethod: order.payment_method,
      language,
    });
    
    toast.success(t.orders.invoiceDownloaded);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(language === "bn" ? "bn-BD" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods = t.orders.paymentMethods as Record<string, string>;
    return methods?.[method] || method;
  };

  const getStatusInfo = (status: string) => {
    return statusOptions.find(s => s.value === status) || { label: status, color: "bg-gray-500" };
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className={cn("text-center py-12", language === "bn" && "font-siliguri")}>
          <p className="text-muted-foreground">
            {t.orders.orderNotFound}
          </p>
        </div>
      </AdminLayout>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <AdminLayout>
      <div className={cn("space-y-6", language === "bn" && "font-siliguri")}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/admin/orders")}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">
                  {t.orders.order} #{order.order_number}
                </h1>
                <Badge className={cn("text-white", statusInfo.color)}>
                  {statusInfo.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDate(order.created_at)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 print:hidden">
            {/* Super Admin Edit/Delete buttons */}
            {canEdit && !isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                {t.common.edit}
              </Button>
            )}
            {isEditing && (
              <>
                <Button variant="default" size="sm" onClick={handleSaveEdit} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {t.common.save}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={saving}>
                  <X className="h-4 w-4 mr-2" />
                  {t.common.cancel}
                </Button>
              </>
            )}
            {canDelete && !isEditing && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDeleteDialogOpen(true)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t.common.delete}
              </Button>
            )}
            <Button variant="default" size="sm" onClick={handleDownloadInvoice}>
              <FileDown className="h-4 w-4 mr-2" />
              {t.orders.invoice}
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              {t.orders.print}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              {t.orders.export}
            </Button>
          </div>
        </div>

        <div ref={printRef} className="grid gap-6 lg:grid-cols-3">
          {/* Order Items */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5" />
                {t.orders.items}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      {item.product_sku && (
                        <p className="text-xs text-muted-foreground">
                          SKU: {item.product_sku}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.unit_price, language)} × {item.quantity}
                      </p>
                      <p className="font-semibold">
                        {formatPrice(item.total_price, language)}
                      </p>
                    </div>
                  </div>
                ))}

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.orders.subtotal}</span>
                    <span>{formatPrice(order.subtotal, language)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.orders.shipping}</span>
                    {isEditing ? (
                      <Input
                        type="number"
                        min={0}
                        value={editForm.shipping_cost}
                        onChange={(e) => setEditForm({ ...editForm, shipping_cost: parseFloat(e.target.value) || 0 })}
                        className="w-28 h-7 text-right"
                      />
                    ) : (
                      <span>{formatPrice(order.shipping_cost || 0, language)}</span>
                    )}
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>{t.orders.total}</span>
                    <span className="text-primary">
                      {formatPrice(isEditing ? order.subtotal + editForm.shipping_cost : order.total, language)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer & Order Info */}
          <div className="space-y-6">
            {/* Status Update */}
            <Card className="print:hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {t.orders.updateStatus}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {canUpdateStatus ? (
                  <Select
                    value={order.status}
                    onValueChange={handleStatusChange}
                    disabled={updatingStatus}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", opt.color)} />
                            {opt.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    {t.orders.noStatusPermission}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  {t.orders.contactInfo}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">{t.orders.customerName}</Label>
                      <Input
                        value={editForm.customer_name}
                        onChange={(e) => setEditForm({ ...editForm, customer_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t.orders.companyNameLabel}</Label>
                      <Input
                        value={editForm.company_name}
                        onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t.orders.customerPhone}</Label>
                      <Input
                        value={editForm.customer_phone}
                        onChange={(e) => setEditForm({ ...editForm, customer_phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t.orders.customerEmail}</Label>
                      <Input
                        value={editForm.customer_email}
                        onChange={(e) => setEditForm({ ...editForm, customer_email: e.target.value })}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        {order.company_name && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {order.company_name}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{order.customer_phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{order.customer_email}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Shipping Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5" />
                  {t.orders.shippingAddress}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">{t.orders.address}</Label>
                      <Textarea
                        value={editForm.shipping_address}
                        onChange={(e) => setEditForm({ ...editForm, shipping_address: e.target.value })}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t.orders.city}</Label>
                      <Input
                        value={editForm.shipping_city}
                        onChange={(e) => setEditForm({ ...editForm, shipping_city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t.orders.postalCode}</Label>
                      <Input
                        value={editForm.shipping_postal_code}
                        onChange={(e) => setEditForm({ ...editForm, shipping_postal_code: e.target.value })}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-sm space-y-1">
                    <p>{order.shipping_address}</p>
                    <p>{order.shipping_city}</p>
                    {order.shipping_postal_code && (
                      <p>{order.shipping_postal_code}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5" />
                  {t.orders.paymentMethod}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">
                  {getPaymentMethodLabel(order.payment_method)}
                </Badge>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  {t.orders.notes}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {order.notes || "-"}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <OrderDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        orderNumber={order.order_number}
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

      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:hidden { display: none !important; }
          #root { visibility: visible; position: absolute; left: 0; top: 0; }
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminOrderDetail;