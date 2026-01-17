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
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Users,
  Search,
  Activity,
  Image as ImageIcon
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/contexts/AdminContext";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import AdminLanguageSwitcher from "./AdminLanguageSwitcher";
import { AdminThemeToggle } from "./AdminThemeToggle";
import { AdminGlobalSearch } from "./AdminGlobalSearch";
import { AdminNotificationCenter } from "./AdminNotificationCenter";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  module: string;
  group?: string;
  badgeKey?: "pendingOrders" | "pendingQuotes";
}

const SIDEBAR_COLLAPSED_KEY = "admin-sidebar-collapsed";

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { isAdmin, loading, canAccessModule, isSuperAdmin, roles } = useAdmin();
  const { t, language } = useAdminLanguage();
  const notifications = useAdminNotifications();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Ref for nav container to enable auto-scroll to active item
  const navRef = useRef<HTMLElement>(null);

  // Hydrate collapsed state from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (saved === "true") {
      setCollapsed(true);
    }
  }, []);

  // Save collapsed state to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
  }, [collapsed]);

  // Auto-scroll to active nav item on route change
  useEffect(() => {
    const activeElement = navRef.current?.querySelector('[data-active="true"]') as HTMLElement | null;
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [location.pathname]);

  // Toggle collapse with animation
  const handleToggleCollapse = useCallback(() => {
    setIsAnimating(true);
    setCollapsed(prev => !prev);
    setTimeout(() => setIsAnimating(false), 250);
  }, []);

  // Navigation items with module mapping for permissions and groups
  const allNavItems: NavItem[] = [
    { href: "/admin", label: t.nav.dashboard, icon: LayoutDashboard, module: "dashboard", group: "main" },
    { href: "/admin/products", label: t.nav.products, icon: Package, module: "products", group: "catalog" },
    { href: "/admin/categories", label: t.nav.categories, icon: FolderOpen, module: "categories", group: "catalog" },
    { href: "/admin/orders", label: t.nav.orders, icon: ShoppingCart, module: "orders", group: "sales", badgeKey: "pendingOrders" },
    { href: "/admin/quotes", label: t.nav.quotes, icon: FileText, module: "quotes", group: "sales", badgeKey: "pendingQuotes" },
    { href: "/admin/logos", label: t.nav.logos, icon: Building2, module: "logos", group: "content" },
    { href: "/admin/testimonials", label: t.nav.testimonials, icon: Quote, module: "testimonials", group: "content" },
    { href: "/admin/page-seo", label: language === "bn" ? "পেজ SEO" : "Page SEO", icon: Search, module: "seo", group: "seo" },
    { href: "/admin/seo-health", label: language === "bn" ? "SEO স্বাস্থ্য" : "SEO Health", icon: Activity, module: "seo", group: "seo" },
    { href: "/admin/og-preview", label: language === "bn" ? "OG প্রিভিউ" : "OG Preview", icon: ImageIcon, module: "seo", group: "seo" },
    { href: "/admin/ux-insights", label: t.nav.uxInsights, icon: BarChart3, module: "ux-insights", group: "analytics" },
    { href: "/admin/users", label: language === "bn" ? "ব্যবহারকারী" : "Users", icon: Users, module: "users", group: "settings" },
    { href: "/admin/roles", label: t.nav.roles, icon: Shield, module: "roles", group: "settings" },
  ];

  // Group labels for navigation sections
  const groupLabels: Record<string, { en: string; bn: string }> = {
    main: { en: "Overview", bn: "ওভারভিউ" },
    catalog: { en: "Catalog", bn: "ক্যাটালগ" },
    sales: { en: "Sales", bn: "বিক্রয়" },
    content: { en: "Content", bn: "কন্টেন্ট" },
    seo: { en: "SEO", bn: "SEO" },
    analytics: { en: "Analytics", bn: "অ্যানালিটিক্স" },
    settings: { en: "Settings", bn: "সেটিংস" },
  };

  // Filter nav items based on permissions
  const navItems = allNavItems.filter(item => {
    // Super admin sees everything
    if (isSuperAdmin) return true;
    // Dashboard is always visible to admin users
    if (item.module === "dashboard") return true;
    // Roles and users pages are super admin only
    if (item.module === "roles" || item.module === "users") return false;
    // SEO module - check if user has SEO permissions or is admin
    if (item.module === "seo") return canAccessModule("products") || canAccessModule("categories");
    // Check module permission
    return canAccessModule(item.module);
  });

  // Group nav items
  const groupedNavItems = navItems.reduce((acc, item) => {
    const group = item.group || "main";
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const allAccessibleItems = navItems;
    const totalItems = allAccessibleItems.length;
    
    if (totalItems === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev - 1 + totalItems) % totalItems);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < totalItems) {
          navigate(allAccessibleItems[focusedIndex].href);
          setSidebarOpen(false);
        }
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(totalItems - 1);
        break;
      case 'Escape':
        setFocusedIndex(-1);
        break;
    }
  }, [navItems, focusedIndex, navigate]);

  // Focus the appropriate nav item when focusedIndex changes
  useEffect(() => {
    if (focusedIndex >= 0) {
      const links = navRef.current?.querySelectorAll('[data-nav-item]');
      const targetLink = links?.[focusedIndex] as HTMLElement | undefined;
      targetLink?.focus();
    }
  }, [focusedIndex]);

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

  const getRoleBadgeStyles = () => {
    if (isSuperAdmin) return "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400";
    if (roles.includes("admin")) return "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-primary/50";
    if (roles.includes("accounts")) return "bg-gradient-to-r from-emerald-500 to-green-500 text-white border-emerald-400";
    if (roles.includes("sales")) return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-400";
    if (roles.includes("moderator")) return "bg-gradient-to-r from-purple-500 to-violet-500 text-white border-purple-400";
    return "bg-muted text-muted-foreground";
  };

  const getBadgeCount = (item: NavItem) => {
    if (!item.badgeKey) return 0;
    return notifications[item.badgeKey] || 0;
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

  const NavLink = ({ item, isLocked = false, itemIndex }: { item: NavItem; isLocked?: boolean; itemIndex?: number }) => {
    const isActive = location.pathname === item.href || 
      (item.href !== "/admin" && location.pathname.startsWith(item.href));
    const badgeCount = getBadgeCount(item);
    const isFocused = itemIndex !== undefined && itemIndex === focusedIndex;

    if (isLocked) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "group flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-all duration-150",
                "text-muted-foreground/40 cursor-not-allowed",
                collapsed && "justify-center px-1.5"
              )}
            >
              <div className={cn(
                "flex items-center justify-center rounded-md",
                collapsed ? "w-8 h-8" : "w-7 h-7",
                "bg-muted/30"
              )}>
                <item.icon className="h-4 w-4" />
              </div>
              {!collapsed && (
                <>
                  <span className="flex-1 text-[13px]">{item.label}</span>
                  <Lock className="h-3 w-3 opacity-40" />
                </>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            {collapsed ? item.label : t.access.noPermission}
          </TooltipContent>
        </Tooltip>
      );
    }

    const linkContent = (
      <Link
        to={item.href}
        onClick={() => setSidebarOpen(false)}
        data-active={isActive}
        data-nav-item={itemIndex !== undefined ? itemIndex : undefined}
        tabIndex={itemIndex !== undefined ? 0 : -1}
        className={cn(
          "group flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-all duration-150",
          "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          isActive 
            ? "bg-primary text-primary-foreground shadow-sm" 
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          isFocused && !isActive && "bg-accent text-accent-foreground",
          collapsed && "justify-center px-1.5"
        )}
      >
        <div className={cn(
          "relative flex items-center justify-center rounded-md transition-colors duration-150",
          collapsed ? "w-8 h-8" : "w-7 h-7",
          isActive ? "bg-primary-foreground/15" : "bg-transparent"
        )}>
          <item.icon className="h-4 w-4" />
          {collapsed && badgeCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 flex items-center justify-center text-[10px] font-semibold bg-destructive text-destructive-foreground rounded-full">
              {badgeCount > 99 ? "99+" : badgeCount}
            </span>
          )}
        </div>
        {!collapsed && (
          <>
            <span className="flex-1 text-[13px] font-medium">{item.label}</span>
            {badgeCount > 0 && (
              <span className={cn(
                "h-5 min-w-5 px-1.5 flex items-center justify-center text-[10px] font-semibold rounded-full",
                isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-destructive text-destructive-foreground"
              )}>
                {badgeCount > 99 ? "99+" : badgeCount}
              </span>
            )}
            {isActive && badgeCount === 0 && (
              <ChevronRight className="h-3.5 w-3.5 opacity-70" />
            )}
          </>
        )}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {linkContent}
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2 text-xs">
            <span>{item.label}</span>
            {badgeCount > 0 && (
              <span className="h-4 min-w-4 px-1 flex items-center justify-center text-[10px] bg-destructive text-destructive-foreground rounded-full">
                {badgeCount}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return linkContent;
  };

  const renderNavGroups = () => {
    const groupOrder = ["main", "catalog", "sales", "content", "seo", "analytics", "settings"];
    let globalIndex = 0;
    
    return groupOrder.map((groupKey, index) => {
      const items = groupedNavItems[groupKey];
      if (!items || items.length === 0) return null;

      const startIndex = globalIndex;
      globalIndex += items.length;

      return (
        <div key={groupKey} className={cn(index > 0 && "mt-4")}>
          {groupKey !== "main" && !collapsed && (
            <div className="px-2.5 mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                {language === "bn" ? groupLabels[groupKey].bn : groupLabels[groupKey].en}
              </span>
            </div>
          )}
          {groupKey !== "main" && collapsed && (
            <div className="my-2 mx-1.5 border-t border-border/50" />
          )}
          <div className="space-y-0.5" role="menu">
            {items.map((item, itemIdx) => (
              <NavLink key={item.href} item={item} itemIndex={startIndex + itemIdx} />
            ))}
          </div>
        </div>
      );
    });
  };

  return (
    <TooltipProvider>
      <div className={cn("min-h-screen bg-muted/30", language === "bn" && "font-siliguri")}>
        {/* Desktop Topbar - Clean, distraction-free */}
        <header className="hidden lg:flex h-14 bg-card border-b border-border items-center justify-between px-4 sticky top-0 z-30">
          {/* Left: Collapse button + Logo */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleCollapse}
              className={cn(
                "h-9 w-9 text-muted-foreground hover:text-foreground shrink-0 transition-transform duration-200",
                isAnimating && "scale-95"
              )}
            >
              <PanelLeftClose className={cn(
                "h-5 w-5 transition-all duration-200",
                collapsed && "rotate-180"
              )} />
            </Button>
            <Link to="/admin" className="flex items-center gap-2.5">
              <img src={logo} alt="ST International" className="h-8 w-auto" />
              <div className="hidden sm:block">
                <h2 className="font-semibold text-sm leading-tight">ST International</h2>
                <p className="text-[11px] text-muted-foreground">{t.nav.adminPanel}</p>
              </div>
            </Link>
          </div>
          
          {/* Right side: Search | Notifications | View Website | Language | Dark Mode | Profile */}
          <div className="flex items-center gap-1">
            {/* Global Search */}
            <AdminGlobalSearch />
            
            {/* Notification Center */}
            <AdminNotificationCenter />
            
            <div className="h-6 w-px bg-border mx-1" />
            
            {/* View Website */}
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-9 px-3 border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary/50"
            >
              <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                <span className="hidden xl:inline text-sm font-medium">
                  {t.layout?.viewWebsite || (language === "bn" ? "ওয়েবসাইট দেখুন" : "View Website")}
                </span>
              </a>
            </Button>
            
            <div className="h-6 w-px bg-border mx-1" />
            
            {/* Language Toggle */}
            <AdminLanguageSwitcher variant="compact" />
            
            {/* Dark Mode Toggle */}
            <AdminThemeToggle />
            
            <div className="h-6 w-px bg-border mx-1" />
            
            {/* User Profile with Role Badge */}
            <div className="flex items-center gap-2.5 pl-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold shrink-0 shadow-sm">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden xl:flex flex-col items-start gap-0.5 min-w-0">
                <p className="text-sm font-medium leading-tight truncate max-w-[120px]">
                  {user?.email?.split('@')[0]}
                </p>
                <Badge 
                  className={cn(
                    "h-5 px-2 text-[10px] font-semibold border shadow-sm",
                    getRoleBadgeStyles()
                  )}
                >
                  {isSuperAdmin && <Shield className="h-3 w-3 mr-1" />}
                  {getPrimaryRoleLabel()}
                </Badge>
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
          <div className="flex items-center gap-1">
            {/* Mobile Notification Center */}
            <AdminNotificationCenter />
            
            <Button
              variant="outline"
              size="icon"
              asChild
              className="h-9 w-9 border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/50"
            >
              <a href="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-5 w-5" />
              </a>
            </Button>
            <AdminLanguageSwitcher variant="compact" />
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <aside className={cn(
            "fixed lg:sticky inset-y-0 lg:top-14 left-0 z-50 lg:z-10 bg-card border-r border-border",
            "transform transition-all duration-200 ease-out",
            "lg:h-[calc(100vh-3.5rem)] overflow-hidden",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
            collapsed ? "w-[60px]" : "w-60",
            isAnimating && "sidebar-collapse-indicator"
          )}>
            {/* Mobile sidebar header */}
            <div className="lg:hidden p-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={logo} alt="ST International" className="h-7 w-auto" />
                <span className="font-semibold text-sm">{t.nav.admin}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className={cn(
              collapsed ? "h-[calc(100%-3.5rem)]" : "h-[calc(100%-7rem)] lg:h-[calc(100%-3.5rem)]",
              "sidebar-scroll-area"
            )}>
              <nav 
                className={cn("p-2", collapsed && "p-1.5")} 
                ref={navRef}
                onKeyDown={handleKeyDown}
                role="navigation"
                aria-label="Admin navigation"
              >
                {renderNavGroups()}
                
                {/* Locked items section */}
                {lockedItems.length > 0 && (
                  <div className="mt-4">
                    {!collapsed && (
                      <div className="px-2.5 mb-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
                          {t.layout?.restricted || (language === "bn" ? "সীমিত" : "Restricted")}
                        </span>
                      </div>
                    )}
                    {collapsed && <div className="my-2 mx-1.5 border-t border-border/50" />}
                    <div className="space-y-0.5">
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
              {!collapsed && (
                <div className="lg:hidden p-3 border-b border-border">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-primary-foreground text-xs font-semibold shadow-sm">
                      {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user?.email?.split('@')[0]}</p>
                      <Badge 
                        className={cn(
                          "h-5 px-2 text-[10px] font-semibold border shadow-sm mt-0.5",
                          getRoleBadgeStyles()
                        )}
                      >
                        {isSuperAdmin && <Shield className="h-3 w-3 mr-1" />}
                        {getPrimaryRoleLabel()}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Logout button */}
              <div className={cn("p-2", collapsed && "p-1.5")}>
                {collapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="w-full h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {t.nav.logout}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-2.5 h-9 px-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" 
                    onClick={handleSignOut}
                  >
                    <div className="flex items-center justify-center w-7 h-7 rounded-md">
                      <LogOut className="h-4 w-4" />
                    </div>
                    <span className="text-[13px] font-medium">{t.nav.logout}</span>
                  </Button>
                )}
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

          {/* Main Content - Consistent spacing */}
          <main className="flex-1 min-h-[calc(100vh-3.5rem)] overflow-x-hidden">
            <div className="p-4 md:p-6 lg:p-8 max-w-[1600px]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AdminLayout;