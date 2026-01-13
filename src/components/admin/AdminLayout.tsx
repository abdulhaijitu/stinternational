import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  FolderOpen, 
  ShoppingCart, 
  FileText,
  Building2,
  Quote,
  LogOut,
  Menu,
  X,
  BarChart3,
  Shield
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/contexts/AdminContext";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import AdminLanguageSwitcher from "./AdminLanguageSwitcher";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { isAdmin, loading } = useAdmin();
  const { t, language } = useAdminLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Navigation items with translation keys
  const navItems = [
    { href: "/admin", label: t.nav.dashboard, icon: LayoutDashboard },
    { href: "/admin/products", label: t.nav.products, icon: Package },
    { href: "/admin/categories", label: t.nav.categories, icon: FolderOpen },
    { href: "/admin/orders", label: t.nav.orders, icon: ShoppingCart },
    { href: "/admin/quotes", label: t.nav.quotes, icon: FileText },
    { href: "/admin/logos", label: t.nav.logos, icon: Building2 },
    { href: "/admin/testimonials", label: t.nav.testimonials, icon: Quote },
    { href: "/admin/ux-insights", label: t.nav.uxInsights, icon: BarChart3 },
    { href: "/admin/roles", label: t.nav.roles, icon: Shield },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full text-center">
          <h1 className={cn("text-2xl font-bold mb-4", language === "bn" && "font-siliguri")}>
            {t.access.denied}
          </h1>
          <p className={cn("text-muted-foreground mb-6", language === "bn" && "font-siliguri")}>
            {t.access.noPermission}
          </p>
          <Button onClick={() => navigate("/")} variant="outline">
            {t.access.goHome}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-muted/30", language === "bn" && "font-siliguri")}>
      {/* Mobile Header */}
      <div className="lg:hidden bg-card border-b border-border p-4 flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-2">
          <img src={logo} alt="ST International" className="h-8 w-auto" />
          <span className="font-semibold">{t.nav.admin}</span>
        </Link>
        <div className="flex items-center gap-2">
          <AdminLanguageSwitcher />
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          lg:min-h-screen
        `}>
          <div className="p-6 border-b border-border hidden lg:flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-3">
              <img src={logo} alt="ST International" className="h-10 w-auto" />
              <div>
                <h2 className="font-bold text-sm">ST International</h2>
                <p className="text-xs text-muted-foreground">{t.nav.adminPanel}</p>
              </div>
            </Link>
          </div>

          {/* Desktop Language Switcher */}
          <div className="hidden lg:block p-4 border-b border-border">
            <AdminLanguageSwitcher />
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== "/admin" && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.email}</p>
                <p className="text-xs text-muted-foreground">{t.nav.admin}</p>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              {t.nav.logout}
            </Button>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:min-h-screen">
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;