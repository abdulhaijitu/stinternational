import { Link } from "react-router-dom";
import { 
  Phone, 
  Mail, 
  MapPin, 
  ShoppingCart, 
  User, 
  Search,
  Menu,
  X,
  ChevronRight,
  Heart,
  Grid3X3
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { categoryGroups } from "@/lib/categories";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const { getItemCount } = useCart();
  const { user } = useAuth();
  const { wishlist } = useWishlist();
  const cartItemCount = getItemCount();
  const wishlistCount = wishlist.length;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container-premium">
          <div className="flex items-center justify-between py-2 text-sm">
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
            <div className="flex items-center gap-2 text-xs md:text-sm">
              <MapPin className="h-3.5 w-3.5" />
              <span>Dhaka, Bangladesh</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-background border-b border-border shadow-sm">
        <div className="container-premium">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img 
                src={logo} 
                alt="ST International" 
                className="h-12 md:h-16 w-auto"
              />
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search products, categories, brands..."
                  className="w-full h-11 pl-4 pr-12 rounded-md border border-border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <button className="absolute right-1 top-1 h-9 w-9 flex items-center justify-center bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              <Link to="/account" className="hidden md:flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                <User className="h-5 w-5" />
                <span>Account</span>
              </Link>
              <Link to="/wishlist" className="relative flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                <Heart className="h-5 w-5" />
                <span className="hidden md:inline">Wishlist</span>
                {user && wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 md:static md:ml-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="relative flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                <ShoppingCart className="h-5 w-5" />
                <span className="hidden md:inline">Cart</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 md:static md:ml-1 w-5 h-5 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center font-medium">
                    {cartItemCount}
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
      <nav className="hidden lg:block bg-muted/50 border-b border-border">
        <div className="container-premium">
          <div className="flex items-center gap-8 h-12">
            {/* Categories Dropdown - Global B2B Style */}
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  isCategoriesOpen 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
                <span>All Categories</span>
                <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${isCategoriesOpen ? 'rotate-90' : ''}`} />
              </button>

              {/* Mega Menu - Two Column Layout */}
              {isCategoriesOpen && (
                <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded-lg shadow-2xl overflow-hidden z-50">
                  <div className="flex">
                    {/* Left Column - Main Categories */}
                    <div className="w-64 bg-muted/30 border-r border-border py-2">
                      {categoryGroups.map((group, index) => (
                        <button
                          key={group.id}
                          onMouseEnter={() => setActiveGroupIndex(index)}
                          onClick={() => setActiveGroupIndex(index)}
                          className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm transition-colors duration-150 ${
                            activeGroupIndex === index
                              ? 'bg-background text-primary font-medium border-l-2 border-primary'
                              : 'text-foreground hover:bg-background/50'
                          }`}
                        >
                          <span>{group.name}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </button>
                      ))}
                      
                      {/* View All Categories Link */}
                      <div className="border-t border-border mt-2 pt-2 px-4">
                        <Link
                          to="/categories"
                          onClick={() => setIsCategoriesOpen(false)}
                          className="flex items-center gap-2 py-2 text-sm text-primary font-medium hover:underline"
                        >
                          View All Categories
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>

                    {/* Right Column - Subcategories */}
                    <div className="w-80 p-4">
                      <div className="mb-3 pb-2 border-b border-border">
                        <h3 className="font-semibold text-foreground">
                          {categoryGroups[activeGroupIndex]?.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {categoryGroups[activeGroupIndex]?.description}
                        </p>
                      </div>
                      
                      <ul className="space-y-1">
                        {categoryGroups[activeGroupIndex]?.categories.map((category) => (
                          <li key={category.id}>
                            <Link
                              to={`/category/${category.slug}`}
                              onClick={() => setIsCategoriesOpen(false)}
                              className="flex items-center justify-between px-3 py-2.5 rounded-md text-sm text-foreground hover:bg-muted transition-colors duration-150 group"
                            >
                              <div className="flex items-center gap-3">
                                <category.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                <span className="group-hover:text-primary transition-colors">{category.name}</span>
                              </div>
                              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                {category.productCount}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      
                      {/* Group CTA */}
                      <div className="mt-4 pt-3 border-t border-border">
                        <Link
                          to={`/categories#${categoryGroups[activeGroupIndex]?.slug}`}
                          onClick={() => setIsCategoriesOpen(false)}
                          className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline"
                        >
                          Browse all {categoryGroups[activeGroupIndex]?.name}
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link to="/products" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              All Products
            </Link>
            <Link to="/request-quote" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Request Quote
            </Link>
            <Link to="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              About Us
            </Link>
            <Link to="/contact" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[108px] bg-background z-40 overflow-y-auto animate-fade-in">
          <div className="container-premium py-4">
            {/* Mobile Search */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full h-11 pl-4 pr-12 rounded-md border border-border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="absolute right-1 top-1 h-9 w-9 flex items-center justify-center bg-primary text-primary-foreground rounded">
                <Search className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile Nav Links */}
            <nav className="space-y-1">
              <Link to="/categories" className="flex items-center justify-between py-3 px-4 text-base font-medium bg-primary/5 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                <span>All Products</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
              
              {categoryGroups.map((group) => (
                <div key={group.id} className="border-b border-border py-3">
                  <h3 className="font-semibold text-foreground px-4 mb-2">{group.name}</h3>
                  <ul className="space-y-1">
                    {group.categories.map((category) => (
                      <li key={category.id}>
                        <Link
                          to={`/category/${category.slug}`}
                          className="flex items-center justify-between py-2 px-4 text-sm text-muted-foreground hover:bg-muted rounded-md"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <div className="flex items-center gap-3">
                            <category.icon className="h-4 w-4" />
                            <span>{category.name}</span>
                          </div>
                          <span className="text-xs bg-muted px-2 py-0.5 rounded">{category.productCount}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              
              <div className="pt-4 space-y-1">
                <Link to="/request-quote" className="flex items-center justify-between py-3 px-4 text-base font-medium hover:bg-muted rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                  <span>Request Quote</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
                <Link to="/about" className="flex items-center justify-between py-3 px-4 text-base font-medium hover:bg-muted rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                  <span>About Us</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
                <Link to="/contact" className="flex items-center justify-between py-3 px-4 text-base font-medium hover:bg-muted rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                  <span>Contact</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
                <Link to="/wishlist" className="flex items-center justify-between py-3 px-4 text-base font-medium hover:bg-muted rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                  <span>My Wishlist</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
                <Link to="/account" className="flex items-center justify-between py-3 px-4 text-base font-medium hover:bg-muted rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                  <span>My Account</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
