import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/products";

// Mock cart data for UI demonstration
interface CartItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "prod-001",
      name: "Digital Analytical Balance AS 220.R2",
      sku: "BAL-AS220-R2",
      price: 85000,
      quantity: 1,
      image: "/placeholder.svg",
    },
    {
      id: "prod-002",
      name: "Laboratory Glass Beaker Set (50ml - 2000ml)",
      sku: "GLW-BEAK-SET",
      price: 4500,
      quantity: 2,
      image: "/placeholder.svg",
    },
  ]);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0; // Free shipping or calculated later
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="container-premium py-16 md:py-24 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Button variant="accent" size="lg" asChild>
              <Link to="/categories">
                Browse Products
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
          <h1 className="text-2xl md:text-3xl font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground mt-2">{cartItems.length} items in your cart</p>
        </div>
      </section>

      {/* Cart Content */}
      <section className="py-8 md:py-12">
        <div className="container-premium">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 bg-card border border-border rounded-lg p-4"
                >
                  {/* Image */}
                  <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.id}`}
                      className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">SKU: {item.sku}</p>
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
                <h2 className="text-lg font-semibold mb-6">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">Calculated at checkout</span>
                  </div>
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="text-xl font-bold">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
                <Button variant="accent" size="lg" className="w-full mb-4">
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" className="w-full" asChild>
                  <Link to="/categories">Continue Shopping</Link>
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Secure checkout • Cash on Delivery available
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
