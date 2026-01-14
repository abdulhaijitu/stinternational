import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Package, 
  ChevronRight, 
  Loader2, 
  ArrowLeft, 
  Calendar,
  MapPin,
  Phone,
  Mail,
  Building,
  CreditCard,
  FileText,
  Truck,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/formatPrice";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import OrderStatusTimeline from "@/components/orders/OrderStatusTimeline";

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
  shipping_cost: number;
  total: number;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  company_name: string | null;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string | null;
  notes: string | null;
}

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fontClass = language === "bn" ? "font-siliguri" : "";

  const statusConfig: Record<string, { 
    label: string; 
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }> = {
    pending_payment: { 
      label: t.orders.paymentPending, 
      variant: "secondary",
      icon: Clock,
      color: "text-yellow-600"
    },
    paid: { 
      label: t.orders.paid, 
      variant: "default",
      icon: CheckCircle2,
      color: "text-green-600"
    },
    processing: { 
      label: t.orders.processing, 
      variant: "default",
      icon: Package,
      color: "text-blue-600"
    },
    shipped: { 
      label: t.orders.shipped, 
      variant: "default",
      icon: Truck,
      color: "text-purple-600"
    },
    delivered: { 
      label: t.orders.delivered, 
      variant: "default",
      icon: CheckCircle2,
      color: "text-green-600"
    },
    cancelled: { 
      label: t.orders.cancelled, 
      variant: "destructive",
      icon: XCircle,
      color: "text-red-600"
    },
  };

  const paymentLabels: Record<string, string> = {
    cash_on_delivery: t.orders.cashOnDelivery,
    bank_transfer: t.orders.bankTransfer,
    online_payment: t.orders.onlinePayment,
  };

  // Order detail specific translations
  const orderDetailT = {
    en: {
      orderDetails: "Order Details",
      orderItems: "Order Items",
      product: "Product",
      sku: "SKU",
      quantity: "Qty",
      unitPrice: "Unit Price",
      total: "Total",
      shippingInfo: "Shipping Information",
      paymentInfo: "Payment Information",
      paymentMethod: "Payment Method",
      orderNotes: "Order Notes",
      subtotal: "Subtotal",
      shipping: "Shipping",
      orderTotal: "Order Total",
      orderStatus: "Order Status",
      orderPlaced: "Order placed on",
      backToOrders: "Back to Orders",
      orderNotFound: "Order Not Found",
      orderNotFoundMessage: "The order you're looking for doesn't exist or you don't have access to it.",
      trackingInfo: "Tracking Information",
      estimatedDelivery: "Estimated Delivery",
      trackingNumber: "Tracking Number",
      statusPendingPayment: "Awaiting payment confirmation",
      statusPaid: "Payment received, preparing your order",
      statusProcessing: "Your order is being prepared",
      statusShipped: "Your order is on the way",
      statusDelivered: "Your order has been delivered",
      statusCancelled: "This order has been cancelled",
      contactSupport: "Contact Support",
      needHelp: "Need help with this order?",
    },
    bn: {
      orderDetails: "অর্ডার বিবরণ",
      orderItems: "অর্ডারের পণ্য",
      product: "পণ্য",
      sku: "এসকেইউ",
      quantity: "পরিমাণ",
      unitPrice: "একক মূল্য",
      total: "মোট",
      shippingInfo: "শিপিং তথ্য",
      paymentInfo: "পেমেন্ট তথ্য",
      paymentMethod: "পেমেন্ট পদ্ধতি",
      orderNotes: "অর্ডার নোট",
      subtotal: "উপমোট",
      shipping: "শিপিং",
      orderTotal: "অর্ডার মোট",
      orderStatus: "অর্ডার স্ট্যাটাস",
      orderPlaced: "অর্ডার করা হয়েছে",
      backToOrders: "অর্ডারে ফিরে যান",
      orderNotFound: "অর্ডার পাওয়া যায়নি",
      orderNotFoundMessage: "আপনি যে অর্ডারটি খুঁজছেন সেটি বিদ্যমান নেই বা আপনার এটি দেখার অনুমতি নেই।",
      trackingInfo: "ট্র্যাকিং তথ্য",
      estimatedDelivery: "আনুমানিক ডেলিভারি",
      trackingNumber: "ট্র্যাকিং নম্বর",
      statusPendingPayment: "পেমেন্ট নিশ্চিতকরণের অপেক্ষায়",
      statusPaid: "পেমেন্ট পাওয়া গেছে, অর্ডার প্রস্তুত হচ্ছে",
      statusProcessing: "আপনার অর্ডার প্রস্তুত হচ্ছে",
      statusShipped: "আপনার অর্ডার পথে আছে",
      statusDelivered: "আপনার অর্ডার ডেলিভারি হয়েছে",
      statusCancelled: "এই অর্ডারটি বাতিল করা হয়েছে",
      contactSupport: "সাপোর্টে যোগাযোগ করুন",
      needHelp: "এই অর্ডার নিয়ে সাহায্য দরকার?",
    }
  };

  const dt = orderDetailT[language as keyof typeof orderDetailT] || orderDetailT.en;

  useEffect(() => {
    if (!authLoading && user && id) {
      fetchOrderDetails();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading, id]);

  const fetchOrderDetails = async () => {
    try {
      // Fetch order details
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
      console.error("Error fetching order details:", error);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === "bn" ? "bn-BD" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusMessage = (status: string): string => {
    const messages: Record<string, string> = {
      pending_payment: dt.statusPendingPayment,
      paid: dt.statusPaid,
      processing: dt.statusProcessing,
      shipped: dt.statusShipped,
      delivered: dt.statusDelivered,
      cancelled: dt.statusCancelled,
    };
    return messages[status] || "";
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container-premium py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className={`container-premium py-16 text-center ${fontClass}`}>
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">{t.orders.login}</h1>
          <p className="text-muted-foreground mb-6">{t.orders.loginRequired}</p>
          <Button onClick={() => navigate("/account")}>{t.orders.login}</Button>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className={`container-premium py-16 text-center ${fontClass}`}>
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">{dt.orderNotFound}</h1>
          <p className="text-muted-foreground mb-6">{dt.orderNotFoundMessage}</p>
          <Button onClick={() => navigate("/orders")}>{dt.backToOrders}</Button>
        </div>
      </Layout>
    );
  }

  const statusInfo = statusConfig[order.status] || { 
    label: order.status, 
    variant: "outline" as const,
    icon: Package,
    color: "text-muted-foreground"
  };
  const StatusIcon = statusInfo.icon;

  return (
    <Layout>
      {/* Header */}
      <section className="bg-muted/50 border-b border-border">
        <div className={`container-premium py-6 md:py-8 ${fontClass}`}>
          <Link 
            to="/orders" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            {dt.backToOrders}
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{order.order_number}</h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {dt.orderPlaced} {formatDate(order.created_at)}
              </p>
            </div>
            <Badge variant={statusInfo.variant} className="text-base px-4 py-2 w-fit">
              <StatusIcon className={`h-4 w-4 mr-2 ${statusInfo.color}`} />
              {statusInfo.label}
            </Badge>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className={`container-premium ${fontClass}`}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Status Timeline Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
                    {dt.orderStatus}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <OrderStatusTimeline 
                    currentStatus={order.status} 
                    language={language as "en" | "bn"} 
                  />
                  <p className="text-muted-foreground text-sm text-center md:text-left pt-2 border-t">
                    {getStatusMessage(order.status)}
                  </p>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {dt.orderItems}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{dt.product}</TableHead>
                          <TableHead className="text-center">{dt.quantity}</TableHead>
                          <TableHead className="text-right">{dt.unitPrice}</TableHead>
                          <TableHead className="text-right">{dt.total}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.product_name}</p>
                                {item.product_sku && (
                                  <p className="text-xs text-muted-foreground">
                                    {dt.sku}: {item.product_sku}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">{formatPrice(item.unit_price)}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatPrice(item.total_price)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <Separator className="my-4" />

                  {/* Order Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{dt.subtotal}</span>
                      <span>{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{dt.shipping}</span>
                      <span>{order.shipping_cost === 0 ? t.checkout.freeShipping : formatPrice(order.shipping_cost)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>{dt.orderTotal}</span>
                      <span>{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Notes */}
              {order.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {dt.orderNotes}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{order.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {dt.shippingInfo}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium">{order.customer_name}</p>
                    {order.company_name && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Building className="h-3.5 w-3.5" />
                        {order.company_name}
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>{order.shipping_address}</p>
                    <p>{order.shipping_city}{order.shipping_postal_code && `, ${order.shipping_postal_code}`}</p>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {order.customer_phone}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {order.customer_email}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    {dt.paymentInfo}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{dt.paymentMethod}:</span>
                    <span className="font-medium">
                      {paymentLabels[order.payment_method] || order.payment_method}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Need Help */}
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-3">{dt.needHelp}</p>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/contact")}>
                    {dt.contactSupport}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default OrderDetail;
