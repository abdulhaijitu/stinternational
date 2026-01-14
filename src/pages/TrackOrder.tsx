import { useState } from "react";
import { Search, Package, Truck, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/formatPrice";
import { format } from "date-fns";
import OrderStatusTimeline from "@/components/orders/OrderStatusTimeline";

type OrderStatus = "pending_payment" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";

interface OrderData {
  id: string;
  order_number: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  total: number;
  subtotal: number;
  shipping_cost: number;
  payment_method: string;
  customer_name: string;
  shipping_address: string;
  shipping_city: string;
  order_items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

const TrackOrder = () => {
  const { t, language } = useLanguage();
  const fontClass = language === "bn" ? "font-siliguri" : "";
  
  const [orderNumber, setOrderNumber] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<OrderData | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrder(null);

    if (!orderNumber.trim() || !emailOrPhone.trim()) {
      setError(t.trackOrder.fillAllFields);
      return;
    }

    setLoading(true);

    try {
      // Query order by order_number and either email or phone
      const { data, error: fetchError } = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          status,
          created_at,
          updated_at,
          total,
          subtotal,
          shipping_cost,
          payment_method,
          customer_name,
          customer_email,
          customer_phone,
          shipping_address,
          shipping_city,
          order_items (
            id,
            product_name,
            quantity,
            unit_price,
            total_price
          )
        `)
        .eq("order_number", orderNumber.trim().toUpperCase())
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        setError(t.trackOrder.orderNotFound);
        return;
      }

      // Verify email or phone matches
      const inputLower = emailOrPhone.trim().toLowerCase();
      const emailMatch = data.customer_email?.toLowerCase() === inputLower;
      const phoneMatch = data.customer_phone?.replace(/\s/g, "") === emailOrPhone.trim().replace(/\s/g, "");

      if (!emailMatch && !phoneMatch) {
        setError(t.trackOrder.verificationFailed);
        return;
      }

      setOrder(data as OrderData);
    } catch (err: any) {
      console.error("Track order error:", err);
      setError(t.trackOrder.errorTracking);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "pending_payment":
        return <Clock className="h-5 w-5" />;
      case "paid":
      case "processing":
        return <Package className="h-5 w-5" />;
      case "shipped":
        return <Truck className="h-5 w-5" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5" />;
      case "cancelled":
        return <XCircle className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending_payment":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "paid":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "processing":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "shipped":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    const labels: Record<OrderStatus, string> = {
      pending_payment: language === "bn" ? "পেমেন্ট বাকি" : "Pending Payment",
      paid: language === "bn" ? "পেইড" : "Paid",
      processing: language === "bn" ? "প্রসেসিং" : "Processing",
      shipped: language === "bn" ? "শিপড" : "Shipped",
      delivered: language === "bn" ? "ডেলিভারড" : "Delivered",
      cancelled: language === "bn" ? "বাতিল" : "Cancelled",
    };
    return labels[status];
  };

  return (
    <Layout>
      <div className={`container mx-auto px-4 py-8 max-w-4xl ${fontClass}`}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {t.trackOrder.title}
          </h1>
          <p className="text-muted-foreground">
            {t.trackOrder.subtitle}
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              {t.trackOrder.searchTitle}
            </CardTitle>
            <CardDescription>
              {t.trackOrder.searchDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrack} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orderNumber">
                    {t.trackOrder.orderNumberLabel} *
                  </Label>
                  <Input
                    id="orderNumber"
                    placeholder="STI-20260114-1234"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailOrPhone">
                    {t.trackOrder.emailOrPhoneLabel} *
                  </Label>
                  <Input
                    id="emailOrPhone"
                    placeholder="your@email.com or 01XXXXXXXXX"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full md:w-auto" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t.trackOrder.searching}
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    {t.trackOrder.trackButton}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Order Header */}
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">{order.order_number}</CardTitle>
                    <CardDescription>
                      {t.trackOrder.orderedOn}{" "}
                      {format(new Date(order.created_at), "PPP")}
                    </CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 px-3 py-1`}>
                    {getStatusIcon(order.status)}
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <OrderStatusTimeline currentStatus={order.status} language={language as "en" | "bn"} />
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>{t.trackOrder.orderItems}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.order_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center py-3 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {t.trackOrder.quantity}: {item.quantity} × {formatPrice(item.unit_price)}
                        </p>
                      </div>
                      <p className="font-semibold">{formatPrice(item.total_price)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t mt-4 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t.common.subtotal}</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t.common.shipping}</span>
                    <span>
                      {order.shipping_cost === 0
                        ? (language === "bn" ? "ফ্রি" : "Free")
                        : formatPrice(order.shipping_cost || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>{t.common.total}</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Info */}
            <Card>
              <CardHeader>
                <CardTitle>{t.trackOrder.shippingInfo}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{order.customer_name}</p>
                  <p className="text-muted-foreground">{order.shipping_address}</p>
                  <p className="text-muted-foreground">{order.shipping_city}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TrackOrder;
