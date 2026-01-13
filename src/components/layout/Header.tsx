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
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/contexts/AuthContext";
import { useSmartHeader } from "@/hooks/useSmartHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import CategoryAwareSearch from "./CategoryAwareSearch";
import CategoryNavMenu from "./CategoryNavMenu";
import MobileCategoryDrawer from "./MobileCategoryDrawer";
import LanguageSwitcher from "./LanguageSwitcher";
import logo from "@/assets/logo.png";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getItemCount } = useCart();
  const { user } = useAuth();
  const { wishlist } = useWishlist();
  const location = useLocation();
  const { isScrolled, isCompact } = useSmartHeader(100);
  const { t } = useLanguage();
  
  const cartItemCount = getItemCount();
  const wishlistCount = wishlist.length;

  // Get current category from URL if on category page
  const currentCategorySlug = location.pathname.startsWith('/category/') 
    ? location.pathname.split('/category/')[1] 
    : undefined;

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-200 ${
      isScrolled ? 'shadow-md' : ''
    }`}>
      {/* Top Bar - Hide on scroll for compact mode */}
      <div className={`bg-primary text-primary-foreground transition-all duration-200 overflow-hidden ${
        isCompact ? 'max-h-0 py-0' : 'max-h-16 py-2'
      }`}>
        <div className="container-premium">
          <div className="flex items-center justify-between text-sm">
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
              {/* Language Switcher */}
              <LanguageSwitcher className="hidden md:flex" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className={`bg-background border-b border-border transition-all duration-200 ${
        isCompact ? 'shadow-sm' : ''
      }`}>
        <div className="container-premium">
          <div className={`flex items-center justify-between transition-all duration-200 ${
            isCompact ? 'h-14' : 'h-16 md:h-20'
          }`}>
            {/* Logo */}
            <Link to="/" className="flex items-center shrink-0">
              <img 
                src={logo} 
                alt="ST International" 
                className={`w-auto transition-all duration-200 ${
                  isCompact ? 'h-10 md:h-12' : 'h-12 md:h-16'
                }`}
              />
            </Link>

            {/* Search Bar - Desktop with Category Awareness */}
            <div className="hidden lg:flex flex-1 max-w-xl mx-8">
              <CategoryAwareSearch 
                currentCategorySlug={currentCategorySlug} 
                isCompact={isCompact}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Language Switcher - Mobile in header */}
              <LanguageSwitcher className="md:hidden" variant="compact" />
              
              <Link to="/account" className="hidden md:flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                <User className={`transition-all duration-200 ${isCompact ? 'h-4 w-4' : 'h-5 w-5'}`} />
                {!isCompact && <span>{t.nav.account}</span>}
              </Link>
              <Link to="/wishlist" className="relative flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                <Heart className={`transition-all duration-200 ${isCompact ? 'h-4 w-4' : 'h-5 w-5'}`} />
                {!isCompact && <span className="hidden md:inline">{t.nav.wishlist}</span>}
                {user && wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="relative flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                <ShoppingCart className={`transition-all duration-200 ${isCompact ? 'h-4 w-4' : 'h-5 w-5'}`} />
                {!isCompact && <span className="hidden md:inline">{t.nav.cart}</span>}
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center font-medium">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`hidden lg:block bg-muted/30 border-b border-border transition-all duration-200 ${
        isCompact ? 'h-10' : 'h-12'
      }`}>
        <div className="container-premium h-full">
          <div className="flex items-center gap-8 h-full">
            {/* Categories Dropdown - New Shadcn Style */}
            <CategoryNavMenu isCompact={isCompact} />

            <Link to="/products" className={`font-medium text-foreground hover:text-primary transition-colors ${
              isCompact ? 'text-xs' : 'text-sm'
            }`}>
              {t.nav.products}
            </Link>
            <Link to="/request-quote" className={`font-medium text-foreground hover:text-primary transition-colors ${
              isCompact ? 'text-xs' : 'text-sm'
            }`}>
              {t.nav.requestQuote}
            </Link>
            <Link to="/about" className={`font-medium text-foreground hover:text-primary transition-colors ${
              isCompact ? 'text-xs' : 'text-sm'
            }`}>
              {t.nav.about}
            </Link>
            <Link to="/contact" className={`font-medium text-foreground hover:text-primary transition-colors ${
              isCompact ? 'text-xs' : 'text-sm'
            }`}>
              {t.nav.contact}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Clean Drawer Style */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[108px] bg-background z-40 overflow-hidden animate-fade-in">
          <div className="h-full flex flex-col">
            {/* Mobile Search */}
            <div className="p-4 border-b border-border">
              <CategoryAwareSearch currentCategorySlug={currentCategorySlug} />
            </div>

            {/* Mobile Category Navigation */}
            <div className="flex-1 overflow-y-auto">
              <MobileCategoryDrawer onCategoryClick={closeMobileMenu} />
            </div>

            {/* Mobile Footer Actions */}
            <div className="border-t border-border p-4 space-y-2">
              <Link 
                to="/wishlist" 
                onClick={closeMobileMenu}
                className="flex items-center justify-between py-3 px-4 text-sm font-medium bg-muted/30 rounded-lg"
              >
                <span>{t.nav.myWishlist}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link 
                to="/account" 
                onClick={closeMobileMenu}
                className="flex items-center justify-between py-3 px-4 text-sm font-medium bg-muted/30 rounded-lg"
              >
                <span>{t.nav.myAccount}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
