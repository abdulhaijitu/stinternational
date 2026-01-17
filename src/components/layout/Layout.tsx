import Header from "./Header";
import Footer from "./Footer";
import BackToTop from "./BackToTop";
import MobileBottomNav from "./MobileBottomNav";
import MobileContactBar from "./MobileContactBar";
import FloatingWhatsApp from "./FloatingWhatsApp";
import TawkToChat from "./TawkToChat";

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
 */
const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      
      {/* Floating Elements - Order matters for proper stacking context */}
      {/* Mobile fixed bars first */}
      <MobileContactBar />
      <MobileBottomNav />
      
      {/* Floating buttons - WhatsApp is primary, BackToTop is above it */}
      <FloatingWhatsApp />
      <BackToTop />
      
      {/* Third-party chat widget */}
      <TawkToChat />
    </div>
  );
};

export default Layout;
