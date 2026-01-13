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
  Shield,
  Lock,
  ExternalLink
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/contexts/AdminContext";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import AdminLanguageSwitcher from "./AdminLanguageSwitcher";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  module: string;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { isAdmin, loading, canAccessModule, isSuperAdmin, roles } = useAdmin();
  const { t, language } = useAdminLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Navigation items with module mapping for permissions
  const allNavItems: NavItem[] = [
    { href: "/admin", label: t.nav.dashboard, icon: LayoutDashboard, module: "dashboard" },
    { href: "/admin/products", label: t.nav.products, icon: Package, module: "products" },
    { href: "/admin/categories", label: t.nav.categories, icon: FolderOpen, module: "categories" },
    { href: "/admin/orders", label: t.nav.orders, icon: ShoppingCart, module: "orders" },
    { href: "/admin/quotes", label: t.nav.quotes, icon: FileText, module: "quotes" },
    { href: "/admin/logos", label: t.nav.logos, icon: Building2, module: "logos" },
    { href: "/admin/testimonials", label: t.nav.testimonials, icon: Quote, module: "testimonials" },
    { href: "/admin/ux-insights", label: t.nav.uxInsights, icon: BarChart3, module: "ux-insights" },
    { href: "/admin/roles", label: t.nav.roles, icon: Shield, module: "roles" },
  ];

  // Filter nav items based on permissions
  const navItems = allNavItems.filter(item => {
    // Super admin can see everything
    if (isSuperAdmin) return true;
    // Dashboard is always visible for admins
    if (item.module === "dashboard") return true;
    // Roles page only for super_admin
    if (item.module === "roles") return isSuperAdmin;
    // Check module access
    return canAccessModule(item.module);
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Get user's primary role for display
  const getPrimaryRoleLabel = () => {
    if (isSuperAdmin) return t.roles?.superAdmin || "Super Admin";
    if (roles.includes("admin")) return t.roles?.admin || "Admin";
    if (roles.includes("accounts")) return t.roles?.accounts || "Accounts";
    if (roles.includes("sales")) return t.roles?.sales || "Sales";
    if (roles.includes("moderator")) return t.roles?.moderator || "Moderator";
    return t.nav.admin;
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
    <TooltipProvider>
      <div className={cn("min-h-screen bg-muted/30", language === "bn" && "font-siliguri")}>
        {/* Desktop Topbar */}
        <header className="hidden lg:flex h-14 bg-card border-b border-border items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="flex items-center gap-3">
              <img src={logo} alt="ST International" className="h-8 w-auto" />
              <div>
                <h2 className="font-bold text-sm">ST International</h2>
                <p className="text-xs text-muted-foreground">{t.nav.adminPanel}</p>
              </div>
            </Link>
          </div>
          
          {/* Right side: View Website, Language Toggle, User */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-foreground"
            >
              <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                <span>{language === "bn" ? "ওয়েবসাইট দেখুন" : "View Website"}</span>
              </a>
            </Button>
            
            <div className="h-5 w-px bg-border" />
            
            <AdminLanguageSwitcher variant="compact" />
            
            <div className="h-5 w-px bg-border" />
            
            {/* User Profile Menu */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden xl:block">
                <p className="text-sm font-medium leading-none">{user?.email?.split('@')[0]}</p>
                <p className="text-xs text-muted-foreground">{getPrimaryRoleLabel()}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Header */}
        <div className="lg:hidden bg-card border-b border-border p-4 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2">
            <img src={logo} alt="ST International" className="h-8 w-auto" />
            <span className="font-semibold">{t.nav.admin}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="text-muted-foreground"
            >
              <a href="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-5 w-5" />
              </a>
            </Button>
            <AdminLanguageSwitcher variant="compact" />
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
            lg:min-h-[calc(100vh-3.5rem)] pt-4 lg:pt-0
          `}>
            {/* Mobile sidebar header */}
            <div className="lg:hidden p-4 border-b border-border flex items-center gap-3">
              <img src={logo} alt="ST International" className="h-8 w-auto" />
              <span className="font-semibold">{t.nav.admin}</span>
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

              {/* Show locked items with tooltip */}
              {allNavItems.filter(item => !navItems.includes(item)).map((item) => (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <div
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground/50 cursor-not-allowed"
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="flex-1">{item.label}</span>
                      <Lock className="h-4 w-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{t.access.noPermission}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border lg:hidden">
              <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">{getPrimaryRoleLabel()}</p>
                </div>
              </div>
              <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                {t.nav.logout}
              </Button>
            </div>
            
            {/* Desktop: Only logout button */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border hidden lg:block">
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
          <main className="flex-1 lg:min-h-[calc(100vh-3.5rem)]">
            <div className="p-4 md:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AdminLayout;