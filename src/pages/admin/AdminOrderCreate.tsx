import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Plus, Trash2, Search } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  name_bn?: string | null;
  sku?: string | null;
  price: number;
  in_stock: boolean;
}

interface OrderItem {
  product_id: string;
  product_name: string;
  product_sku: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

const AdminOrderCreate = () => {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAdmin();
  const { t, language } = useAdminLanguage();

  // Redirect if not super admin
  useEffect(() => {
    if (!isSuperAdmin) {
      toast.error(t.orders.noPermission);
      navigate("/admin/orders");
    }
  }, [isSuperAdmin, navigate, t]);

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showProductSearch, setShowProductSearch] = useState(false);

  // Order form state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash_on_delivery");
  const [orderStatus, setOrderStatus] = useState<string>("pending_payment");
  const [notes, setNotes] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [shippingCost, setShippingCost] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (productSearch.trim()) {
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
          p.name_bn?.toLowerCase().includes(productSearch.toLowerCase()) ||
          p.sku?.toLowerCase().includes(productSearch.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 10));
    } else {
      setSearchResults([]);
    }
  }, [productSearch, products]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, name_bn, sku, price, in_stock")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const addProduct = (product: Product) => {
    const existingIndex = orderItems.findIndex(
      (item) => item.product_id === product.id
    );

    if (existingIndex >= 0) {
      // Increase quantity
      const updated = [...orderItems];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].total_price =
        updated[existingIndex].quantity * updated[existingIndex].unit_price;
      setOrderItems(updated);
    } else {
      setOrderItems([
        ...orderItems,
        {
          product_id: product.id,
          product_name: language === "bn" && product.name_bn ? product.name_bn : product.name,
          product_sku: product.sku || null,
          quantity: 1,
          unit_price: product.price,
          total_price: product.price,
        },
      ]);
    }
    setProductSearch("");
    setShowProductSearch(false);
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;
    const updated = [...orderItems];
    updated[index].quantity = quantity;
    updated[index].total_price = quantity * updated[index].unit_price;
    setOrderItems(updated);
  };

  const updateItemPrice = (index: number, price: number) => {
    if (price < 0) return;
    const updated = [...orderItems];
    updated[index].unit_price = price;
    updated[index].total_price = updated[index].quantity * price;
    setOrderItems(updated);
  };

  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const subtotal = orderItems.reduce((sum, item) => sum + item.total_price, 0);
  const total = subtotal + shippingCost;

  const handleSubmit = async () => {
    if (!customerName || !customerEmail || !customerPhone) {
      toast.error(t.orders.customerRequired);
      return;
    }
    if (!shippingAddress || !shippingCity) {
      toast.error(t.orders.shippingRequired);
      return;
    }
    if (orderItems.length === 0) {
      toast.error(t.orders.itemsRequired);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        order: {
          status: orderStatus,
          payment_method: paymentMethod,
          subtotal,
          shipping_cost: shippingCost,
          total,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          company_name: companyName || null,
          shipping_address: shippingAddress,
          shipping_city: shippingCity,
          shipping_postal_code: shippingPostalCode || null,
          notes: notes || null,
        },
        items: orderItems,
      };

      const response = await supabase.functions.invoke("create-order", {
        body: payload,
      });

      if (response.error) throw response.error;

      toast.success(t.orders.createSuccess);
      navigate("/admin/orders");
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast.error(error.message || t.orders.createError);
    } finally {
      setLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className={cn("space-y-6", language === "bn" && "font-siliguri")}>
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/orders")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t.orders.createOrder}</h1>
            <p className="text-muted-foreground">{t.orders.createOrderSubtitle}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Customer & Shipping Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Details */}
            <Card>
              <CardHeader>
                <CardTitle>{t.orders.contactInfo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t.orders.customerName} *</Label>
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={t.orders.customerNamePlaceholder}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.orders.companyNameLabel}</Label>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder={t.orders.companyNamePlaceholder}
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t.orders.customerEmail} *</Label>
                    <Input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder={t.orders.customerEmailPlaceholder}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.orders.customerPhone} *</Label>
                    <Input
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder={t.orders.customerPhonePlaceholder}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Details */}
            <Card>
              <CardHeader>
                <CardTitle>{t.orders.shippingAddress}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t.orders.address} *</Label>
                  <Textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder={t.orders.addressPlaceholder}
                    rows={2}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t.orders.city} *</Label>
                    <Input
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      placeholder={t.orders.cityPlaceholder}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.orders.postalCode}</Label>
                    <Input
                      value={shippingPostalCode}
                      onChange={(e) => setShippingPostalCode(e.target.value)}
                      placeholder={t.orders.postalCodePlaceholder}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{t.orders.items}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Product Search */}
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={productSearch}
                        onChange={(e) => {
                          setProductSearch(e.target.value);
                          setShowProductSearch(true);
                        }}
                        onFocus={() => setShowProductSearch(true)}
                        placeholder={t.orders.searchProducts}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Search Results Dropdown */}
                  {showProductSearch && searchResults.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full bg-popover border rounded-lg shadow-lg max-h-60 overflow-auto">
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          className="w-full px-4 py-2 text-left hover:bg-muted flex items-center justify-between"
                          onClick={() => addProduct(product)}
                        >
                          <div>
                            <p className="font-medium">{product.name}</p>
                            {product.sku && (
                              <p className="text-xs text-muted-foreground">
                                SKU: {product.sku}
                              </p>
                            )}
                          </div>
                          <div className="text-sm font-medium">
                            {formatPrice(product.price, language)}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Items List */}
                {orderItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    {t.orders.noItemsAdded}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {orderItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.product_name}</p>
                          {item.product_sku && (
                            <p className="text-xs text-muted-foreground">
                              SKU: {item.product_sku}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateItemQuantity(index, parseInt(e.target.value) || 1)
                            }
                            className="w-20 text-center"
                          />
                          <span className="text-muted-foreground">×</span>
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            value={item.unit_price}
                            onChange={(e) =>
                              updateItemPrice(index, parseFloat(e.target.value) || 0)
                            }
                            className="w-28"
                          />
                        </div>
                        <div className="w-24 text-right font-semibold">
                          {formatPrice(item.total_price, language)}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>{t.orders.notes}</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.orders.notesPlaceholder}
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Payment & Status */}
            <Card>
              <CardHeader>
                <CardTitle>{t.orders.orderSettings}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t.orders.paymentMethod}</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash_on_delivery">
                        {t.orders.paymentMethods.cash_on_delivery}
                      </SelectItem>
                      <SelectItem value="bank_transfer">
                        {t.orders.paymentMethods.bank_transfer}
                      </SelectItem>
                      <SelectItem value="online_payment">
                        {t.orders.paymentMethods.online_payment}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t.orders.status}</Label>
                  <Select value={orderStatus} onValueChange={setOrderStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending_payment">{t.status.pending_payment}</SelectItem>
                      <SelectItem value="paid">{t.status.paid}</SelectItem>
                      <SelectItem value="processing">{t.status.processing}</SelectItem>
                      <SelectItem value="shipped">{t.status.shipped}</SelectItem>
                      <SelectItem value="delivered">{t.status.delivered}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>{t.orders.orderSummary}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.orders.subtotal}</span>
                    <span>{formatPrice(subtotal, language)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">{t.orders.shipping}</span>
                    <Input
                      type="number"
                      min={0}
                      value={shippingCost}
                      onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                      className="w-28 text-right"
                    />
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>{t.orders.total}</span>
                    <span className="text-primary">{formatPrice(total, language)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={loading || orderItems.length === 0}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t.common.loading}
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      {t.orders.createOrderBtn}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrderCreate;
