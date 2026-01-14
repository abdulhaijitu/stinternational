import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AdminLanguageProvider } from "@/contexts/AdminLanguageContext";
import { AdminThemeProvider } from "@/contexts/AdminThemeContext";
import ScrollToTop from "@/components/layout/ScrollToTop";
import BilingualSEO from "@/components/seo/BilingualSEO";
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import Products from "./pages/Products";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Account from "./pages/Account";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import RefundPolicy from "./pages/RefundPolicy";
import Wishlist from "./pages/Wishlist";
import RequestQuote from "./pages/RequestQuote";
import TrackOrder from "./pages/TrackOrder";
import NotFound from "./pages/NotFound";
// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductEditor from "./pages/admin/AdminProductEditor";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminQuotes from "./pages/admin/AdminQuotes";
import AdminLogos from "./pages/admin/AdminLogos";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminUXInsights from "./pages/admin/AdminUXInsights";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import AdminUsers from "./pages/admin/AdminUsers";

const queryClient = new QueryClient();

// Main App Component
const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <AdminProvider>
          <AdminLanguageProvider>
            <AdminThemeProvider>
              <CartProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <ScrollToTop />
                    <BilingualSEO />
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/category/:slug" element={<CategoryPage />} />
                      <Route path="/product/:slug" element={<ProductPage />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/orders/:id" element={<OrderDetail />} />
                      <Route path="/account" element={<Account />} />
                      <Route path="/account/orders" element={<Orders />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/request-quote" element={<RequestQuote />} />
                      <Route path="/track-order" element={<TrackOrder />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                      <Route path="/terms-conditions" element={<TermsConditions />} />
                      <Route path="/refund-policy" element={<RefundPolicy />} />
                      {/* Admin Routes */}
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/admin/products" element={<AdminProducts />} />
                      <Route path="/admin/products/:id" element={<AdminProductEditor />} />
                      <Route path="/admin/categories" element={<AdminCategories />} />
                      <Route path="/admin/orders" element={<AdminOrders />} />
                      <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
                      <Route path="/admin/quotes" element={<AdminQuotes />} />
                      <Route path="/admin/logos" element={<AdminLogos />} />
                      <Route path="/admin/testimonials" element={<AdminTestimonials />} />
                      <Route path="/admin/ux-insights" element={<AdminUXInsights />} />
                      <Route path="/admin/roles" element={<AdminRoles />} />
                      <Route path="/admin/users" element={<AdminUsers />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </CartProvider>
            </AdminThemeProvider>
          </AdminLanguageProvider>
        </AdminProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
