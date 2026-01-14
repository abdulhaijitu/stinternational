import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, ChevronRight, Loader2, ArrowLeft, Calendar } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/formatPrice";
import { useLanguage } from "@/contexts/LanguageContext";

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  total: number;
  created_at: string;
  customer_name: string;
}

const Orders = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fontClass = language === "bn" ? "font-siliguri" : "";

  const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending_payment: { label: t.orders.paymentPending, variant: "secondary" },
    paid: { label: t.orders.paid, variant: "default" },
    processing: { label: t.orders.processing, variant: "default" },
    shipped: { label: t.orders.shipped, variant: "default" },
    delivered: { label: t.orders.delivered, variant: "default" },
    cancelled: { label: t.orders.cancelled, variant: "destructive" },
  };

  const paymentLabels: Record<string, string> = {
    cash_on_delivery: t.orders.cashOnDelivery,
    bank_transfer: t.orders.bankTransfer,
    online_payment: t.orders.onlinePayment,
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchOrders();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, status, payment_method, total, created_at, customer_name")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === "bn" ? "bn-BD" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  return (
    <Layout>
      <section className="bg-muted/50 border-b border-border">
        <div className={`container-premium py-6 md:py-8 ${fontClass}`}>
          <Link to="/account" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="h-4 w-4" />
            {t.orders.backToAccount}
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">{t.orders.title}</h1>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className={`container-premium ${fontClass}`}>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">{t.orders.noOrders}</h2>
              <p className="text-muted-foreground mb-6">{t.orders.noOrdersMessage}</p>
              <Button onClick={() => navigate("/categories")}>{t.orders.browseProducts}</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusInfo = statusLabels[order.status] || { label: order.status, variant: "outline" as const };
                const paymentLabel = paymentLabels[order.payment_method] || order.payment_method;
                return (
                  <Link
                    key={order.id}
                    to={`/orders/${order.id}`}
                    className="block bg-card border border-border rounded-lg p-4 md:p-6 card-hover"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center shrink-0">
                          <Package className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{order.order_number}</h3>
                            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(order.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-lg">{formatPrice(order.total)}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {paymentLabel}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Orders;
