import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/formatPrice";

const Cart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, getSubtotal } = useCart();

  const subtotal = getSubtotal();
  const shippingCost = subtotal >= 10000 ? 0 : 150;
  const total = subtotal + shippingCost;

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container-premium py-16 md:py-24 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-4">কার্ট খালি</h1>
            <p className="text-muted-foreground mb-8">
              আপনি এখনো কোনো পণ্য কার্টে যোগ করেননি।
            </p>
            <Button variant="accent" size="lg" asChild>
              <Link to="/categories">
                পণ্য দেখুন
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Page Header */}
      <section className="bg-muted/50 border-b border-border">
        <div className="container-premium py-8 md:py-12">
          <h1 className="text-2xl md:text-3xl font-bold">শপিং কার্ট</h1>
          <p className="text-muted-foreground mt-2">{items.length}টি পণ্য কার্টে আছে</p>
        </div>
      </section>

      {/* Cart Content */}
      <section className="py-8 md:py-12">
        <div className="container-premium">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 bg-card border border-border rounded-lg p-4"
                >
                  {/* Image */}
                  <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.slug}`}
                      className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    {item.sku && (
                      <p className="text-sm text-muted-foreground mt-1">SKU: {item.sku}</p>
                    )}
                    <p className="text-lg font-bold mt-2">{formatPrice(item.price)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <div className="flex items-center border border-border rounded-md">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-8 w-8 flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="h-8 w-10 flex items-center justify-center border-x border-border text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
                <h2 className="text-lg font-semibold mb-6">অর্ডার সারাংশ</h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">সাবটোটাল</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ডেলিভারি</span>
                    <span className="font-medium">
                      {shippingCost === 0 ? "ফ্রি" : formatPrice(shippingCost)}
                    </span>
                  </div>
                  {subtotal < 10000 && (
                    <p className="text-xs text-muted-foreground">
                      ৳১০,০০০+ অর্ডারে ফ্রি ডেলিভারি
                    </p>
                  )}
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between">
                      <span className="font-semibold">মোট</span>
                      <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="accent"
                  size="lg"
                  className="w-full mb-4"
                  onClick={() => navigate("/checkout")}
                >
                  চেকআউট করুন
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" className="w-full" asChild>
                  <Link to="/categories">আরও কেনাকাটা করুন</Link>
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  নিরাপদ চেকআউট • ক্যাশ অন ডেলিভারি সুবিধা
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Cart;
