import { lazy, Suspense } from "react";
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
import ErrorBoundary from "@/components/ErrorBoundary";

// Critical pages - load immediately for fast initial render
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Route-based code splitting with lazy loading
const Categories = lazy(() => import("./pages/Categories"));
const Products = lazy(() => import("./pages/Products"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Orders = lazy(() => import("./pages/Orders"));
const OrderDetail = lazy(() => import("./pages/OrderDetail"));
const Account = lazy(() => import("./pages/Account"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const RequestQuote = lazy(() => import("./pages/RequestQuote"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));

// Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminProductEditor = lazy(() => import("./pages/admin/AdminProductEditor"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminQuotes = lazy(() => import("./pages/admin/AdminQuotes"));
const AdminLogos = lazy(() => import("./pages/admin/AdminLogos"));
const AdminTestimonials = lazy(() => import("./pages/admin/AdminTestimonials"));
const AdminUXInsights = lazy(() => import("./pages/admin/AdminUXInsights"));
const AdminRoles = lazy(() => import("./pages/admin/AdminRoles"));
const AdminOrderDetail = lazy(() => import("./pages/admin/AdminOrderDetail"));
const AdminOrderCreate = lazy(() => import("./pages/admin/AdminOrderCreate"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminPageSEO = lazy(() => import("./pages/admin/AdminPageSEO"));
const AdminSEOHealth = lazy(() => import("./pages/admin/AdminSEOHealth"));
const AdminOGPreview = lazy(() => import("./pages/admin/AdminOGPreview"));

// QueryClient with caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
      refetchOnMount: false,
    },
  },
});

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Wrap lazy component with Suspense
const LazyRoute = ({ component: Component }: { component: React.ComponentType }) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

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
                    <ErrorBoundary>
                      <Routes>
                        {/* Critical routes - no lazy loading */}
                        <Route path="/" element={<Index />} />
                        
                        {/* Public routes */}
                        <Route path="/categories" element={<LazyRoute component={Categories} />} />
                        <Route path="/products" element={<LazyRoute component={Products} />} />
                        <Route path="/category/:slug" element={<LazyRoute component={CategoryPage} />} />
                        <Route path="/category/:parentSlug/:subSlug" element={<LazyRoute component={CategoryPage} />} />
                        <Route path="/product/:slug" element={<LazyRoute component={ProductPage} />} />
                        <Route path="/about" element={<LazyRoute component={About} />} />
                        <Route path="/contact" element={<LazyRoute component={Contact} />} />
                        <Route path="/cart" element={<LazyRoute component={Cart} />} />
                        <Route path="/checkout" element={<LazyRoute component={Checkout} />} />
                        <Route path="/orders" element={<LazyRoute component={Orders} />} />
                        <Route path="/orders/:id" element={<LazyRoute component={OrderDetail} />} />
                        <Route path="/account" element={<LazyRoute component={Account} />} />
                        <Route path="/account/orders" element={<LazyRoute component={Orders} />} />
                        <Route path="/wishlist" element={<LazyRoute component={Wishlist} />} />
                        <Route path="/request-quote" element={<LazyRoute component={RequestQuote} />} />
                        <Route path="/track-order" element={<LazyRoute component={TrackOrder} />} />
                        <Route path="/privacy-policy" element={<LazyRoute component={PrivacyPolicy} />} />
                        <Route path="/terms-conditions" element={<LazyRoute component={TermsConditions} />} />
                        <Route path="/refund-policy" element={<LazyRoute component={RefundPolicy} />} />
                        
                        {/* Admin routes */}
                        <Route path="/admin" element={<LazyRoute component={AdminDashboard} />} />
                        <Route path="/admin/products" element={<LazyRoute component={AdminProducts} />} />
                        <Route path="/admin/products/:id" element={<LazyRoute component={AdminProductEditor} />} />
                        <Route path="/admin/categories" element={<LazyRoute component={AdminCategories} />} />
                        <Route path="/admin/orders" element={<LazyRoute component={AdminOrders} />} />
                        <Route path="/admin/orders/new" element={<LazyRoute component={AdminOrderCreate} />} />
                        <Route path="/admin/orders/:id" element={<LazyRoute component={AdminOrderDetail} />} />
                        <Route path="/admin/quotes" element={<LazyRoute component={AdminQuotes} />} />
                        <Route path="/admin/logos" element={<LazyRoute component={AdminLogos} />} />
                        <Route path="/admin/testimonials" element={<LazyRoute component={AdminTestimonials} />} />
                        <Route path="/admin/ux-insights" element={<LazyRoute component={AdminUXInsights} />} />
                        <Route path="/admin/roles" element={<LazyRoute component={AdminRoles} />} />
                        <Route path="/admin/users" element={<LazyRoute component={AdminUsers} />} />
                        <Route path="/admin/page-seo" element={<LazyRoute component={AdminPageSEO} />} />
                        <Route path="/admin/seo-health" element={<LazyRoute component={AdminSEOHealth} />} />
                        <Route path="/admin/og-preview" element={<LazyRoute component={AdminOGPreview} />} />
                        
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </ErrorBoundary>
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
