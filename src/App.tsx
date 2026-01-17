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
// Public pages
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

// Admin pages - load on demand (rarely accessed by regular users)
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

// Optimized QueryClient with aggressive caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 30 minutes
      gcTime: 30 * 60 * 1000,
      // Don't refetch on window focus for better performance
      refetchOnWindowFocus: false,
      // Retry failed requests only once
      retry: 1,
      // Use cache for faster initial render
      refetchOnMount: false,
    },
  },
});

// Lightweight loading fallback - minimal layout shift
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
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
                      <Suspense fallback={<PageLoader />}>
                        <Routes>
                          {/* Public Routes */}
                          <Route path="/" element={<Index />} />
                          <Route path="/categories" element={<Categories />} />
                          <Route path="/products" element={<Products />} />
                          <Route path="/category/:slug" element={<CategoryPage />} />
                          <Route path="/category/:parentSlug/:subSlug" element={<CategoryPage />} />
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
                          <Route path="/admin/orders/new" element={<AdminOrderCreate />} />
                          <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
                          <Route path="/admin/quotes" element={<AdminQuotes />} />
                          <Route path="/admin/logos" element={<AdminLogos />} />
                          <Route path="/admin/testimonials" element={<AdminTestimonials />} />
                          <Route path="/admin/ux-insights" element={<AdminUXInsights />} />
                          <Route path="/admin/roles" element={<AdminRoles />} />
                          <Route path="/admin/users" element={<AdminUsers />} />
                          <Route path="/admin/page-seo" element={<AdminPageSEO />} />
                          <Route path="/admin/seo-health" element={<AdminSEOHealth />} />
                          <Route path="/admin/og-preview" element={<AdminOGPreview />} />
                          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Suspense>
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
