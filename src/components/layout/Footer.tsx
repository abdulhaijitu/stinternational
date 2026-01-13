import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, Facebook, Linkedin, Youtube, Shield, Truck, CreditCard } from "lucide-react";
import { categoryGroups } from "@/lib/categories";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Trust Reinforcement Bar */}
      <div className="border-b border-primary-foreground/10">
        <div className="container-premium py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <Shield className="h-5 w-5 text-accent" />
              <span className="text-sm text-primary-foreground/80">100% Authentic Products</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Truck className="h-5 w-5 text-accent" />
              <span className="text-sm text-primary-foreground/80">Nationwide Delivery</span>
            </div>
            <div className="flex items-center justify-center md:justify-end gap-3">
              <CreditCard className="h-5 w-5 text-accent" />
              <span className="text-sm text-primary-foreground/80">Secure Payment Options</span>
            </div>
          </div>
        </div>
      </div>

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
            <p className="text-sm text-primary-foreground/80 mb-2 leading-relaxed">
              <strong className="text-primary-foreground">ST International</strong>
            </p>
            <p className="text-sm text-primary-foreground/70 mb-4 leading-relaxed">
              Dhaka, Bangladesh
            </p>
            <p className="text-sm text-primary-foreground/70 mb-6 leading-relaxed">
              Your trusted partner for scientific, industrial, and educational equipment in Bangladesh. 
              Serving institutions and businesses since 2005.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="#" 
                className="w-9 h-9 bg-primary-foreground/10 rounded flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-105"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 bg-primary-foreground/10 rounded flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-105"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 bg-primary-foreground/10 rounded flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-105"
                aria-label="YouTube"
              >
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
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors duration-200"
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
                <Link to="/about" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors duration-200">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors duration-200">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors duration-200">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors duration-200">
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
                  Mamun Mansion, 52/2,<br />
                  Toyeanbee Circular Road,<br />
                  Hatkhola, Tikatuli,<br />
                  Dhaka-1203, Bangladesh
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent shrink-0" />
                <div className="text-sm text-primary-foreground/80">
                  <a href="tel:+88027165562" className="hover:text-accent transition-colors duration-200 block">
                    +880 2-7165562
                  </a>
                  <a href="tel:+8801715575665" className="hover:text-accent transition-colors duration-200 block">
                    01715-575665
                  </a>
                  <a href="tel:+8801713297170" className="hover:text-accent transition-colors duration-200 block">
                    01713-297170
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-accent shrink-0" />
                <a href="mailto:info@stinternationalbd.com" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors duration-200">
                  info@stinternationalbd.com
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

      {/* Payment Methods Section */}
      <div className="border-t border-primary-foreground/10">
        <div className="container-premium py-6">
          <div className="flex flex-col items-center gap-4">
            <p className="text-xs text-primary-foreground/50 uppercase tracking-wider font-medium">
              Accepted Payment Methods
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
              {/* Visa */}
              <div className="h-8 w-12 bg-white rounded flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity">
                <svg viewBox="0 0 48 32" className="h-5 w-auto">
                  <rect fill="#1A1F71" width="48" height="32" rx="4"/>
                  <path fill="#FFFFFF" d="M19.5 21h-3l1.9-11.5h3L19.5 21zm8.4-11.2c-.6-.2-1.5-.5-2.7-.5-3 0-5.1 1.5-5.1 3.7 0 1.6 1.5 2.5 2.6 3 1.2.6 1.6 1 1.6 1.5 0 .8-1 1.2-1.9 1.2-1.2 0-1.9-.2-2.9-.6l-.4-.2-.4 2.5c.7.3 2.1.6 3.5.6 3.2 0 5.3-1.5 5.3-3.8 0-1.3-.8-2.3-2.6-3.1-1.1-.5-1.7-.9-1.7-1.4 0-.5.6-1 1.8-1 1 0 1.8.2 2.3.4l.3.1.4-2.4zm7.9-.3h-2.3c-.7 0-1.3.2-1.6.9L28 21h3.2l.6-1.7h3.9l.4 1.7h2.8l-2.5-11.5h-2.1zm-2.2 7.4l1.2-3.2.3-.8.2.8.7 3.2h-2.4zM16.4 9.5l-3 7.8-.3-1.6-.3-1.4v-.1c-.5-1.3-1.5-2.6-2.8-3.4l2.7 9.7h3.2l4.8-11h-3.3z"/>
                </svg>
              </div>
              {/* Mastercard */}
              <div className="h-8 w-12 bg-white rounded flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity">
                <svg viewBox="0 0 48 32" className="h-5 w-auto">
                  <rect fill="#000000" width="48" height="32" rx="4"/>
                  <circle fill="#EB001B" cx="18" cy="16" r="8"/>
                  <circle fill="#F79E1B" cx="30" cy="16" r="8"/>
                  <path fill="#FF5F00" d="M24 10c2 1.5 3.3 3.8 3.3 6.5 0 2.7-1.3 5-3.3 6.5-2-1.5-3.3-3.8-3.3-6.5 0-2.7 1.3-5 3.3-6.5z"/>
                </svg>
              </div>
              {/* PayPal */}
              <div className="h-8 w-12 bg-white rounded flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity">
                <svg viewBox="0 0 48 32" className="h-5 w-auto">
                  <rect fill="#003087" width="48" height="32" rx="4"/>
                  <path fill="#009CDE" d="M20.5 12c2.2 0 4 .8 4.3 3.2.4 2.8-1.4 4.8-4.2 4.8h-1.3c-.3 0-.5.2-.6.5l-.5 3c0 .2-.2.4-.4.4h-2c-.2 0-.3-.2-.3-.4l1.6-10.5c.1-.5.5-.9 1-.9h2.4zm-1.3 5.5h.8c1.1 0 2-.6 2.2-1.8.1-.9-.5-1.5-1.5-1.5h-.6c-.2 0-.3.1-.3.3l-.6 3z"/>
                  <path fill="#FFFFFF" d="M28.5 12c2.2 0 4 .8 4.3 3.2.4 2.8-1.4 4.8-4.2 4.8h-1.3c-.3 0-.5.2-.6.5l-.5 3c0 .2-.2.4-.4.4h-2c-.2 0-.3-.2-.3-.4l1.6-10.5c.1-.5.5-.9 1-.9h2.4zm-1.3 5.5h.8c1.1 0 2-.6 2.2-1.8.1-.9-.5-1.5-1.5-1.5h-.6c-.2 0-.3.1-.3.3l-.6 3z"/>
                </svg>
              </div>
              {/* American Express */}
              <div className="h-8 w-12 bg-white rounded flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity">
                <svg viewBox="0 0 48 32" className="h-5 w-auto">
                  <rect fill="#006FCF" width="48" height="32" rx="4"/>
                  <path fill="#FFFFFF" d="M14 20v-8h8l1.2 1.5L24.5 12h9.5v8h-8.5l-1.2-1.5-1.3 1.5H14zm1.2-1.2h4.3v-1.3h-3V16h2.9v-1.2h-2.9v-1.3h3.2l1.4 1.8 1.5-1.8h1.1v5.5h-1.2v-3.8l-1.6 1.9h-.1l-1.6-1.9v3.8h-4zm10.3 0h4.3v-1.3h-3V16h2.9v-1.2h-2.9v-1.3h3.2l1.4 1.8 1.5-1.8h1.1v5.5h-1.2v-3.8l-1.6 1.9h-.1l-1.6-1.9v3.8h-4z"/>
                </svg>
              </div>
              {/* Visa Electron */}
              <div className="h-8 w-12 bg-white rounded flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity">
                <svg viewBox="0 0 48 32" className="h-5 w-auto">
                  <rect fill="#1A1F71" width="48" height="32" rx="4"/>
                  <path fill="#FFFFFF" d="M19.5 18h-3l1.9-9h3L19.5 18z"/>
                  <path fill="#F7B600" d="M8 21h32v2H8z"/>
                  <text x="24" y="15" textAnchor="middle" fill="#FFFFFF" fontSize="5" fontWeight="bold">ELECTRON</text>
                </svg>
              </div>
              {/* Maestro */}
              <div className="h-8 w-12 bg-white rounded flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity">
                <svg viewBox="0 0 48 32" className="h-5 w-auto">
                  <rect fill="#FFFFFF" width="48" height="32" rx="4"/>
                  <circle fill="#EB001B" cx="18" cy="16" r="7"/>
                  <circle fill="#00A1DF" cx="30" cy="16" r="7"/>
                  <path fill="#7375CF" d="M24 10.5c1.7 1.3 2.8 3.3 2.8 5.5s-1.1 4.2-2.8 5.5c-1.7-1.3-2.8-3.3-2.8-5.5s1.1-4.2 2.8-5.5z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container-premium py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/60">
            <p>© 2026 ST International. All rights reserved.</p>
            <div className="flex items-center gap-2 text-center md:text-right">
              <span>Design & Developed by</span>
              <a 
                href="http://creationtechbd.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-foreground/80 hover:text-accent transition-colors duration-200 font-medium"
              >
                Creation Tech
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
