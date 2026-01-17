import Header from "./Header";
import Footer from "./Footer";
import BackToTop from "./BackToTop";
import MobileBottomNav from "./MobileBottomNav";
import FloatingWhatsApp from "./FloatingWhatsApp";

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
      <MobileBottomNav />
      <FloatingWhatsApp />
    </div>
  );
};

export default Layout;
