import { Link, useLocation } from "react-router-dom";
import { 
  Phone, 
  Mail, 
  MapPin, 
  ShoppingCart, 
  User, 
  Menu,
  X,
  ChevronRight,
  Heart
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useClientOnly } from "@/components/ClientOnly";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/contexts/AuthContext";
import { useSmartHeader } from "@/hooks/useSmartHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { useUXTelemetry, type MobileMenuCloseMethod } from "@/hooks/useUXTelemetry";
import CategoryAwareSearch from "./CategoryAwareSearch";
import MegaMenu from "./MegaMenu";
import MobileCategoryDrawer from "./MobileCategoryDrawer";
import LanguageSwitcher from "./LanguageSwitcher";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

// Fixed heights for header sections to prevent layout shift (CLS optimization)
const TOP_BAR_HEIGHT = 40; // px
const MAIN_HEADER_HEIGHT_MOBILE = 64; // px
const NAV_HEIGHT = 48; // px
const TOTAL_HEADER_HEIGHT = TOP_BAR_HEIGHT + MAIN_HEADER_HEIGHT_MOBILE + NAV_HEIGHT;
const COMPACT_HEADER_HEIGHT = MAIN_HEADER_HEIGHT_MOBILE + NAV_HEIGHT;

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuContentRef = useRef<HTMLDivElement>(null);
  const closeMethodRef = useRef<MobileMenuCloseMethod>('button');
  const hasMounted = useClientOnly();
  const { getItemCount } = useCart();
  const { user } = useAuth();
  const { wishlist } = useWishlist();
  const location = useLocation();
  const { isScrolled, isCompact, isVisible, scrollDirection } = useSmartHeader(100);
  const { t } = useLanguage();
  const { lightTap, mediumTap } = useHapticFeedback();
  const { trackMobileMenu } = useUXTelemetry();
  
  const cartItemCount = getItemCount();
  const wishlistCount = wishlist.length;

  // Get current category from URL if on category page
  const currentCategorySlug = location.pathname.startsWith('/category/') 
    ? location.pathname.split('/category/')[1] 
    : undefined;

  // Close mobile menu handler with haptic feedback and telemetry
  const closeMobileMenu = useCallback((method: MobileMenuCloseMethod = 'button') => {
    lightTap();
    trackMobileMenu('close', method);
    setIsMobileMenuOpen(false);
    setDragOffset(0);
    // Return focus to menu button after closing
    menuButtonRef.current?.focus();
  }, [lightTap, trackMobileMenu]);

  // Toggle mobile menu handler with haptic feedback and telemetry
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => {
      const next = !prev;
      if (next) {
        mediumTap();
        trackMobileMenu('open');
      } else {
        lightTap();
        trackMobileMenu('close', 'button');
      }
      return next;
    });
  }, [mediumTap, lightTap, trackMobileMenu]);

  // Handle drag for finger-following preview
  const handleDrag = useCallback((offset: number) => {
    setDragOffset(offset);
  }, []);

  // Swipe gesture handlers for closing menu with drag preview
  const swipeHandlers = useSwipeGesture({
    onSwipeDown: () => closeMobileMenu('swipe'),
    onDrag: handleDrag,
    threshold: 80,
    velocityThreshold: 0.5,
    direction: 'vertical',
  });

  // Close mobile menu on route change
  useEffect(() => {
    if (isMobileMenuOpen) {
      trackMobileMenu('close', 'navigation');
      setIsMobileMenuOpen(false);
    }
  }, [location.pathname]);

  // Handle ESC key to close menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        closeMobileMenu('escape');
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen, closeMobileMenu]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isMobileMenuOpen]);

  // Focus trap inside menu
  useEffect(() => {
    if (!isMobileMenuOpen || !menuContentRef.current) return;

    const menuContent = menuContentRef.current;
    const focusableElements = menuContent.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    menuContent.addEventListener('keydown', handleTabKey);
    // Focus first element when menu opens
    firstFocusable?.focus();

    return () => {
      menuContent.removeEventListener('keydown', handleTabKey);
    };
  }, [isMobileMenuOpen]);

  // Calculate header translation based on visibility and scroll state
  const getHeaderTransform = () => {
    if (!isVisible) {
      // Hide entire header when scrolling down
      return `translateY(-100%)`;
    }
    if (isCompact) {
      // In compact mode, slide up the top bar
      return `translateY(-${TOP_BAR_HEIGHT}px)`;
    }
    return 'translateY(0)';
  };

  // Mobile menu offset calculation
  const mobileMenuOffset = isCompact 
    ? MAIN_HEADER_HEIGHT_MOBILE 
    : MAIN_HEADER_HEIGHT_MOBILE + TOP_BAR_HEIGHT;

  return (
    <>
      {/* Skip to main content link for keyboard users */}
      <a 
        href="#main-content" 
        className="skip-link"
      >
        Skip to main content
      </a>
      
      {/* Spacer to prevent layout shift - reserves space for sticky header */}
      <div 
        className="w-full"
        style={{ 
          height: isCompact ? COMPACT_HEADER_HEIGHT : TOTAL_HEADER_HEIGHT,
          transition: 'height 200ms ease-out'
        }}
        aria-hidden="true"
      />
      
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 w-full",
          "will-change-transform transition-transform duration-300 ease-out"
        )}
        style={{ transform: getHeaderTransform() }}
      >
        {/* Top Bar */}
        <div 
          className="bg-primary text-primary-foreground"
          style={{ height: TOP_BAR_HEIGHT }}
        >
          <div className="container-premium h-full">
            <div className="flex items-center justify-between h-full text-sm">
              <div className="hidden md:flex items-center gap-6">
                <a href="tel:+8801715575665" className="flex items-center gap-2 hover:text-accent transition-colors">
                  <Phone className="h-3.5 w-3.5" />
                  <span>01715-575665</span>
                </a>
                <a href="mailto:info@stinternationalbd.com" className="flex items-center gap-2 hover:text-accent transition-colors">
                  <Mail className="h-3.5 w-3.5" />
                  <span>info@stinternationalbd.com</span>
                </a>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{t.header.topBarLocation}</span>
                </div>
                <LanguageSwitcher className="hidden md:flex" invertColors />
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div 
          className={cn(
            "bg-background border-b border-border",
            "transition-shadow duration-200",
            isScrolled && "shadow-md"
          )}
          style={{ height: MAIN_HEADER_HEIGHT_MOBILE }}
        >
          <div className="container-premium h-full">
            <div className="flex items-center justify-between h-full">
              {/* Logo */}
              <Link to="/" className="flex items-center shrink-0">
                <img 
                  src={logo} 
                  alt="ST International" 
                  className={cn(
                    "h-12 md:h-14 w-auto will-change-transform",
                    "transition-transform duration-200 ease-out origin-left",
                    isCompact && "scale-90"
                  )}
                  // Explicit dimensions for CLS optimization
                  width={140}
                  height={56}
                />
              </Link>

              {/* Search Bar - Desktop */}
              <div className="hidden lg:flex flex-1 max-w-xl mx-8">
                <CategoryAwareSearch 
                  currentCategorySlug={currentCategorySlug} 
                  isCompact={isCompact}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 md:gap-4">
                <LanguageSwitcher className="md:hidden" variant="compact" />
                
                <Link 
                  to="/account" 
                  className={cn(
                    "hidden md:flex items-center gap-2 text-sm font-medium",
                    "text-foreground hover:text-primary transition-colors"
                  )}
                >
                  <User className="h-5 w-5" />
                  <span className={cn(
                    "transition-all duration-200 overflow-hidden whitespace-nowrap",
                    isCompact ? "w-0 opacity-0" : "w-auto opacity-100"
                  )}>
                    {t.nav.account}
                  </span>
                </Link>
                
                <Link 
                  to="/wishlist" 
                  className="relative flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <Heart className="h-5 w-5" />
                  <span className={cn(
                    "hidden md:inline transition-all duration-200 overflow-hidden whitespace-nowrap",
                    isCompact ? "w-0 opacity-0" : "w-auto opacity-100"
                  )}>
                    {t.nav.wishlist}
                  </span>
                  {user && wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </Link>
                
                <Link 
                  to="/cart" 
                  className="relative flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className={cn(
                    "hidden md:inline transition-all duration-200 overflow-hidden whitespace-nowrap",
                    isCompact ? "w-0 opacity-0" : "w-auto opacity-100"
                  )}>
                    {t.nav.cart}
                  </span>
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center font-medium">
                      {cartItemCount > 9 ? '9+' : cartItemCount}
                    </span>
                  )}
                </Link>
                
                <Button
                  ref={menuButtonRef}
                  variant="ghost"
                  size="icon"
                  className="lg:hidden min-w-[44px] min-h-[44px] touch-manipulation"
                  onClick={toggleMobileMenu}
                  aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="mobile-menu"
                >
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav 
          className="hidden lg:block bg-muted/30 border-b border-border"
          style={{ height: NAV_HEIGHT }}
        >
          <div className="container-premium h-full">
            <div className="flex items-center gap-8 h-full">
              <MegaMenu isCompact={isCompact} />

              <Link 
                to="/products" 
                className="font-medium text-foreground hover:text-primary transition-colors text-sm header-link-focus"
              >
                {t.nav.products}
              </Link>
              <Link 
                to="/request-quote" 
                className="font-medium text-foreground hover:text-primary transition-colors text-sm header-link-focus"
              >
                {t.nav.requestQuote}
              </Link>
              <Link 
                to="/about" 
                className="font-medium text-foreground hover:text-primary transition-colors text-sm header-link-focus"
              >
                {t.nav.about}
              </Link>
              <Link 
                to="/contact" 
                className="font-medium text-foreground hover:text-primary transition-colors text-sm header-link-focus"
              >
                {t.nav.contact}
              </Link>
            </div>
          </div>
        </nav>

        {/* Mobile menu rendered outside <header> to avoid transform + fixed-positioning issues */}
      </header>

      {/* Mobile Menu (mobile only) - Only render after client mount */}
      {hasMounted && (
        <AnimatePresence>
          {isMobileMenuOpen && (
          <>
            <motion.div
              key="mobile-menu-overlay"
              className="lg:hidden fixed inset-0 bg-foreground/60 z-[60]"
              style={{ top: mobileMenuOffset }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 - dragOffset / 300 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={() => closeMobileMenu('overlay')}
              aria-hidden="true"
            />

            <motion.div
              key="mobile-menu-drawer"
              ref={menuContentRef}
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              className="lg:hidden fixed inset-x-0 bottom-0 bg-background z-[70] overflow-hidden will-change-transform"
              style={{ 
                top: mobileMenuOffset,
                transform: `translateY(${dragOffset}px)`,
              }}
              initial={{ y: "100%" }}
              animate={{ y: dragOffset }}
              exit={{ y: "100%" }}
              transition={dragOffset > 0 ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
              {...swipeHandlers}
            >
              {/* Swipe indicator handle */}
              <div className="flex justify-center pt-2 pb-1">
                <div 
                  className={cn(
                    "w-12 h-1.5 rounded-full transition-colors",
                    dragOffset > 40 ? "bg-primary" : "bg-muted-foreground/30"
                  )} 
                />
              </div>

              {/* Close button for accessibility */}
              <div className="absolute top-2 right-2 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="min-w-[44px] min-h-[44px] touch-manipulation"
                  onClick={() => closeMobileMenu('button')}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="h-full flex flex-col">
                <div className="p-4 pr-14 border-b border-border">
                  <CategoryAwareSearch currentCategorySlug={currentCategorySlug} />
                </div>

                <div
                  className="flex-1 overflow-y-auto overscroll-contain"
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                >
                  <MobileCategoryDrawer onCategoryClick={() => closeMobileMenu('navigation')} />
                </div>

                <div className="border-t border-border p-4 space-y-2 pb-safe">
                  <Link
                    to="/wishlist"
                    onClick={() => closeMobileMenu('navigation')}
                    className="flex items-center justify-between py-3 px-4 text-sm font-medium bg-muted/30 rounded-lg min-h-[44px] touch-manipulation"
                  >
                    <span>{t.nav.myWishlist}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                  <Link
                    to="/account"
                    onClick={() => closeMobileMenu('navigation')}
                    className="flex items-center justify-between py-3 px-4 text-sm font-medium bg-muted/30 rounded-lg min-h-[44px] touch-manipulation"
                  >
                    <span>{t.nav.myAccount}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
          )}
        </AnimatePresence>
      )}
    </>
  );
};

export default Header;
