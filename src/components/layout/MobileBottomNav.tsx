import { Link, useLocation } from "react-router-dom";
import { Home, Grid3X3, Search, ShoppingCart, Globe } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { triggerHaptic } from "@/hooks/useHapticFeedback";
import { useHasMounted } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import MobileCategoryDrawer from "./MobileCategoryDrawer";
import CategoryAwareSearch from "./CategoryAwareSearch";

const BOTTOM_NAV_HEIGHT = 64; // px - optimized for thumb reach

const MobileBottomNav = () => {
  const hasMounted = useHasMounted();
  const location = useLocation();
  const { getItemCount } = useCart();
  const { t, language, setLanguage } = useLanguage();
  const { isVisible } = useScrollDirection(15);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const cartItemCount = getItemCount();

  // Language toggle handler
  const handleLanguageToggle = useCallback(() => {
    triggerHaptic('medium');
    setLanguage(language === 'en' ? 'bn' : 'en');
  }, [language, setLanguage]);

  // Close sheets on route change
  useEffect(() => {
    setIsCategoryOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  // Get current category from URL
  const currentCategorySlug = location.pathname.startsWith('/category/') 
    ? location.pathname.split('/category/')[1] 
    : undefined;

  const isActive = useCallback((path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  // Haptic feedback handlers
  const handleNavTap = useCallback((action?: () => void) => {
    triggerHaptic('light');
    action?.();
  }, []);

  const handleCategoryOpen = useCallback(() => {
    triggerHaptic('medium');
    setIsCategoryOpen(true);
  }, []);

  const handleSearchOpen = useCallback(() => {
    triggerHaptic('medium');
    setIsSearchOpen(true);
  }, []);

  const navItems = [
    { 
      path: '/', 
      icon: Home, 
      label: t.nav.home,
      isLink: true 
    },
    { 
      path: '/categories', 
      icon: Grid3X3, 
      label: t.nav.categories,
      isLink: false,
      action: handleCategoryOpen
    },
    { 
      path: '/search', 
      icon: Search, 
      label: t.common.search,
      isLink: false,
      action: handleSearchOpen
    },
    { 
      path: '/cart', 
      icon: ShoppingCart, 
      label: t.nav.cart,
      isLink: true,
      badge: cartItemCount > 0 ? (cartItemCount > 9 ? '9+' : cartItemCount) : null
    },
    { 
      path: '/language', 
      icon: Globe, 
      label: language === 'en' ? 'বাং' : 'EN',
      isLink: false,
      action: handleLanguageToggle,
      isLanguage: true
    },
  ];

  // Don't render until client is mounted to prevent hydration issues
  if (!hasMounted) {
    return (
      <>
        {/* Spacer to prevent content overlap with bottom nav + contact bar */}
        <div 
          className="lg:hidden" 
          style={{ height: 64 + 48 }} // Bottom nav (64px) + Contact bar (48px)
          aria-hidden="true"
        />
      </>
    );
  }

  // Bottom nav is the base fixed element at the bottom
  // Z-Index: 43 (above contact bar, below floating buttons)
  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav 
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[43] lg:hidden",
          "bg-background/95 backdrop-blur-md border-t border-border",
          "transition-transform duration-200 ease-out",
          "safe-area-bottom",
          !isVisible && "translate-y-full"
        )}
        style={{ height: BOTTOM_NAV_HEIGHT }}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="h-full flex items-center justify-around px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            const isLanguageItem = (item as any).isLanguage;
            
            const content = (
              <div className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[56px]",
                "rounded-lg transition-colors duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                isLanguageItem
                  ? "text-primary bg-primary/10"
                  : active 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}>
                <div className="relative">
                  <Icon className={cn(
                    "h-5 w-5 transition-transform duration-150",
                    (active || isLanguageItem) && "scale-110"
                  )} />
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-accent text-accent-foreground text-[10px] font-semibold rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-medium leading-tight",
                  (active || isLanguageItem) && "font-semibold",
                  isLanguageItem && language === 'en' && "font-siliguri"
                )}>
                  {item.label}
                </span>
              </div>
            );

            if (item.isLink) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="touch-manipulation select-none"
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => handleNavTap()}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={item.path}
                onClick={item.action}
                className="touch-manipulation select-none"
                aria-label={item.label}
                aria-expanded={item.path === '/categories' ? isCategoryOpen : isSearchOpen}
              >
                {content}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Category Drawer - using vaul Drawer for native swipe gestures */}
      <Drawer open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
        <DrawerContent className="h-[85vh] max-h-[85vh]">
          <DrawerHeader className="pb-2">
            <DrawerTitle>{t.nav.categories}</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-hidden">
            <MobileCategoryDrawer onCategoryClick={() => {
              triggerHaptic('selection');
              setIsCategoryOpen(false);
            }} />
          </div>
        </DrawerContent>
      </Drawer>

      {/* Search Sheet */}
      <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <SheetContent side="top" className="pt-safe-top">
          <div className="py-4">
            <h2 className="text-lg font-semibold mb-4">{t.common.search}</h2>
            <CategoryAwareSearch 
              currentCategorySlug={currentCategorySlug}
              autoFocus={isSearchOpen}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Spacer to prevent content overlap with bottom nav + contact bar */}
      <div 
        className="lg:hidden" 
        style={{ height: 64 + 48 }} // Bottom nav (64px) + Contact bar (48px)
        aria-hidden="true"
      />
    </>
  );
};

export default MobileBottomNav;
