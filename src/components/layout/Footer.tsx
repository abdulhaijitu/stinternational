import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, Facebook, Linkedin, Youtube } from "lucide-react";
import { categoryGroups } from "@/lib/categories";
import logo from "@/assets/logo.png";
const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer */}
      <div className="container-premium py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <img 
                src={logo} 
                alt="ST International" 
                className="h-16 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-sm text-primary-foreground/80 mb-6 leading-relaxed">
              Your trusted partner for scientific, industrial, and educational equipment in Bangladesh. 
              Serving institutions and businesses since 2005.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-9 h-9 bg-primary-foreground/10 rounded flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-primary-foreground/10 rounded flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-primary-foreground/10 rounded flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-6">Product Categories</h4>
            <ul className="space-y-3">
              {categoryGroups.map((group) => (
                <li key={group.id}>
                  <Link 
                    to={`/categories#${group.slug}`} 
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {group.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <span className="text-sm text-primary-foreground/80">
                  123 Bangla Motor, Dhaka-1000<br />
                  Bangladesh
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent shrink-0" />
                <div className="text-sm text-primary-foreground/80">
                  <a href="tel:+8801234567890" className="hover:text-accent transition-colors block">
                    +880 1234 567 890
                  </a>
                  <a href="tel:+8801234567891" className="hover:text-accent transition-colors block">
                    +880 1234 567 891
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-accent shrink-0" />
                <a href="mailto:info@stinternational.com.bd" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  info@stinternational.com.bd
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-accent shrink-0" />
                <span className="text-sm text-primary-foreground/80">
                  Sat - Thu: 9:00 AM - 6:00 PM
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container-premium py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/60">
            <p>© 2024 ST International. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span>Secure Checkout</span>
              <span>•</span>
              <span>Cash on Delivery</span>
              <span>•</span>
              <span>Bank Transfer</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
