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
  ChevronDown
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { categoryGroups } from "@/lib/categories";
import { useCart } from "@/contexts/CartContext";
import logo from "@/assets/logo.png";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const { getItemCount } = useCart();
  const cartItemCount = getItemCount();

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container-premium">
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="hidden md:flex items-center gap-6">
              <a href="tel:+8801234567890" className="flex items-center gap-2 hover:text-accent transition-colors">
                <Phone className="h-3.5 w-3.5" />
                <span>+880 1234 567 890</span>
              </a>
              <a href="mailto:info@stinternational.com.bd" className="flex items-center gap-2 hover:text-accent transition-colors">
                <Mail className="h-3.5 w-3.5" />
                <span>info@stinternational.com.bd</span>
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
            {/* Categories Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsCategoriesOpen(true)}
              onMouseLeave={() => setIsCategoriesOpen(false)}
            >
              <button className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                <Menu className="h-4 w-4" />
                <span>All Categories</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mega Menu */}
              {isCategoriesOpen && (
                <div className="absolute top-full left-0 w-[800px] bg-background border border-border rounded-md shadow-xl mt-2 p-6 grid grid-cols-3 gap-6 animate-fade-in">
                  {categoryGroups.map((group) => (
                    <div key={group.id}>
                      <h3 className="font-semibold text-foreground mb-3">{group.name}</h3>
                      <ul className="space-y-2">
                        {group.categories.map((category) => (
                          <li key={category.id}>
                            <Link
                              to={`/category/${category.slug}`}
                              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                            >
                              <category.icon className="h-4 w-4" />
                              {category.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link to="/categories" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Products
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
            <nav className="space-y-4">
              <Link to="/categories" className="block py-3 text-lg font-medium border-b border-border" onClick={() => setIsMobileMenuOpen(false)}>
                All Products
              </Link>
              {categoryGroups.map((group) => (
                <div key={group.id} className="border-b border-border pb-4">
                  <h3 className="font-semibold text-foreground mb-2">{group.name}</h3>
                  <ul className="space-y-2 pl-4">
                    {group.categories.map((category) => (
                      <li key={category.id}>
                        <Link
                          to={`/category/${category.slug}`}
                          className="text-sm text-muted-foreground"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <Link to="/about" className="block py-3 text-lg font-medium border-b border-border" onClick={() => setIsMobileMenuOpen(false)}>
                About Us
              </Link>
              <Link to="/contact" className="block py-3 text-lg font-medium border-b border-border" onClick={() => setIsMobileMenuOpen(false)}>
                Contact
              </Link>
              <Link to="/account" className="block py-3 text-lg font-medium border-b border-border" onClick={() => setIsMobileMenuOpen(false)}>
                My Account
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
