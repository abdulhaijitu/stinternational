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
  FileDown
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  
  const { hasPermission, isSuperAdmin } = useAdmin();
  const { t, language } = useAdminLanguage();
  
  const canUpdateStatus = isSuperAdmin || hasPermission("orders", "update");

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
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus as any })
        .eq("id", order.id);

      if (error) throw error;

      setOrder({ ...order, status: newStatus });
      toast.success(t.orders.updateSuccess);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(t.orders.updateError);
    } finally {
      setUpdatingStatus(false);
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
                    <span>{formatPrice(order.shipping_cost || 0, language)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>{t.orders.total}</span>
                    <span className="text-primary">{formatPrice(order.total, language)}</span>
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
                <div className="text-sm space-y-1">
                  <p>{order.shipping_address}</p>
                  <p>{order.shipping_city}</p>
                  {order.shipping_postal_code && (
                    <p>{order.shipping_postal_code}</p>
                  )}
                </div>
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
            {order.notes && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" />
                    {t.orders.notes}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

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