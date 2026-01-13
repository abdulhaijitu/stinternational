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
  ExternalLink,
  ChevronRight
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
import { ScrollArea } from "@/components/ui/scroll-area";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  module: string;
  group?: string;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { isAdmin, loading, canAccessModule, isSuperAdmin, roles } = useAdmin();
  const { t, language } = useAdminLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Navigation items with module mapping for permissions and groups
  const allNavItems: NavItem[] = [
    { href: "/admin", label: t.nav.dashboard, icon: LayoutDashboard, module: "dashboard", group: "main" },
    { href: "/admin/products", label: t.nav.products, icon: Package, module: "products", group: "catalog" },
    { href: "/admin/categories", label: t.nav.categories, icon: FolderOpen, module: "categories", group: "catalog" },
    { href: "/admin/orders", label: t.nav.orders, icon: ShoppingCart, module: "orders", group: "sales" },
    { href: "/admin/quotes", label: t.nav.quotes, icon: FileText, module: "quotes", group: "sales" },
    { href: "/admin/logos", label: t.nav.logos, icon: Building2, module: "logos", group: "content" },
    { href: "/admin/testimonials", label: t.nav.testimonials, icon: Quote, module: "testimonials", group: "content" },
    { href: "/admin/ux-insights", label: t.nav.uxInsights, icon: BarChart3, module: "ux-insights", group: "analytics" },
    { href: "/admin/roles", label: t.nav.roles, icon: Shield, module: "roles", group: "settings" },
  ];

  // Group labels for navigation sections
  const groupLabels: Record<string, { en: string; bn: string }> = {
    main: { en: "Overview", bn: "ওভারভিউ" },
    catalog: { en: "Catalog", bn: "ক্যাটালগ" },
    sales: { en: "Sales", bn: "বিক্রয়" },
    content: { en: "Content", bn: "কন্টেন্ট" },
    analytics: { en: "Analytics", bn: "অ্যানালিটিক্স" },
    settings: { en: "Settings", bn: "সেটিংস" },
  };

  // Filter nav items based on permissions
  const navItems = allNavItems.filter(item => {
    if (isSuperAdmin) return true;
    if (item.module === "dashboard") return true;
    if (item.module === "roles") return isSuperAdmin;
    return canAccessModule(item.module);
  });

  // Group nav items
  const groupedNavItems = navItems.reduce((acc, item) => {
    const group = item.group || "main";
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  // Locked items
  const lockedItems = allNavItems.filter(item => !navItems.includes(item));

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

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

  const NavLink = ({ item, isLocked = false }: { item: NavItem; isLocked?: boolean }) => {
    const isActive = location.pathname === item.href || 
      (item.href !== "/admin" && location.pathname.startsWith(item.href));

    if (isLocked) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                "text-muted-foreground/40 cursor-not-allowed"
              )}
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted/30">
                <item.icon className="h-[18px] w-[18px]" />
              </div>
              <span className="flex-1 font-medium">{item.label}</span>
              <Lock className="h-3.5 w-3.5 opacity-50" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            {t.access.noPermission}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Link
        to={item.href}
        onClick={() => setSidebarOpen(false)}
        className={cn(
          "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
          isActive 
            ? "bg-primary text-primary-foreground shadow-sm" 
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <div className={cn(
          "flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-200",
          isActive 
            ? "bg-primary-foreground/10" 
            : "bg-muted/50 group-hover:bg-muted"
        )}>
          <item.icon className="h-[18px] w-[18px]" />
        </div>
        <span className="flex-1 font-medium">{item.label}</span>
        {isActive && (
          <ChevronRight className="h-4 w-4 opacity-60" />
        )}
      </Link>
    );
  };

  const renderNavGroups = () => {
    const groupOrder = ["main", "catalog", "sales", "content", "analytics", "settings"];
    
    return groupOrder.map((groupKey, index) => {
      const items = groupedNavItems[groupKey];
      if (!items || items.length === 0) return null;

      return (
        <div key={groupKey} className={cn(index > 0 && "mt-6")}>
          {groupKey !== "main" && (
            <div className="px-3 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {language === "bn" ? groupLabels[groupKey].bn : groupLabels[groupKey].en}
              </span>
            </div>
          )}
          <div className="space-y-1">
            {items.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        </div>
      );
    });
  };

  return (
    <TooltipProvider>
      <div className={cn("min-h-screen bg-muted/30", language === "bn" && "font-siliguri")}>
        {/* Desktop Topbar */}
        <header className="hidden lg:flex h-14 bg-card border-b border-border items-center justify-between px-6 sticky top-0 z-30">
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
        <div className="lg:hidden bg-card border-b border-border p-4 flex items-center justify-between sticky top-0 z-30">
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
          <aside className={cn(
            "fixed lg:sticky inset-y-0 lg:top-14 left-0 z-50 lg:z-10 w-72 bg-card border-r border-border",
            "transform transition-transform duration-300 ease-out",
            "lg:h-[calc(100vh-3.5rem)] overflow-hidden",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}>
            {/* Mobile sidebar header */}
            <div className="lg:hidden p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={logo} alt="ST International" className="h-8 w-auto" />
                <span className="font-semibold">{t.nav.admin}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <ScrollArea className="h-[calc(100%-8rem)] lg:h-[calc(100%-5rem)]">
              <nav className="p-4">
                {renderNavGroups()}
                
                {/* Locked items section */}
                {lockedItems.length > 0 && (
                  <div className="mt-6">
                    <div className="px-3 mb-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/40">
                        {language === "bn" ? "সীমিত অ্যাক্সেস" : "Restricted"}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {lockedItems.map((item) => (
                        <NavLink key={item.href} item={item} isLocked />
                      ))}
                    </div>
                  </div>
                )}
              </nav>
            </ScrollArea>

            {/* Sidebar Footer */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-card">
              {/* Mobile: Show user info */}
              <div className="lg:hidden p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold shadow-sm">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user?.email}</p>
                    <p className="text-xs text-muted-foreground">{getPrimaryRoleLabel()}</p>
                  </div>
                </div>
              </div>
              
              {/* Logout button */}
              <div className="p-3">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors" 
                  onClick={handleSignOut}
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted/50">
                    <LogOut className="h-[18px] w-[18px]" />
                  </div>
                  <span className="font-medium">{t.nav.logout}</span>
                </Button>
              </div>
            </div>
          </aside>

          {/* Mobile Overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in" 
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 min-h-[calc(100vh-3.5rem)]">
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