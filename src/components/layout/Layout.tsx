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

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <BackToTop />
      <MobileContactBar />
      <MobileBottomNav />
      <FloatingWhatsApp />
      <TawkToChat />
    </div>
  );
};

export default Layout;
