import { lazy, Suspense } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

// Lazy load floating elements - they are not critical for initial render
const BackToTop = lazy(() => import("./BackToTop"));
const MobileBottomNav = lazy(() => import("./MobileBottomNav"));
const MobileContactBar = lazy(() => import("./MobileContactBar"));
const FloatingWhatsApp = lazy(() => import("./FloatingWhatsApp"));
const TawkToChat = lazy(() => import("./TawkToChat"));

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Main Layout Component
 * 
 * Floating Element Stacking Order (bottom to top on mobile):
 * 1. MobileBottomNav (z-43) - Fixed at bottom, 64px height
 * 2. MobileContactBar (z-42) - Above bottom nav, 48px height
 * 3. FloatingWhatsApp (z-45) - Primary floating CTA
 * 4. BackToTop (z-44) - Above WhatsApp button
 * 5. TawkToChat - Third-party widget (manages own z-index)
 * 
 * All floating elements are lazy-loaded to prevent blocking initial render
 */
const Layout = ({ children }: LayoutProps) => {
  const { isTransitioning } = useLanguage();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main 
        id="main-content" 
        className={cn(
          "flex-1 transition-all duration-200 ease-out",
          isTransitioning ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
        )} 
        tabIndex={-1}
      >
        {children}
      </main>
      <Footer />
      
      {/* Floating Elements - Lazy loaded, non-blocking */}
      <Suspense fallback={null}>
        {/* Mobile fixed bars first */}
        <MobileContactBar />
        <MobileBottomNav />
        
        {/* Floating buttons - WhatsApp is primary, BackToTop is above it */}
        <FloatingWhatsApp />
        <BackToTop />
        
        {/* Third-party chat widget */}
        <TawkToChat />
      </Suspense>
    </div>
  );
};

export default Layout;
