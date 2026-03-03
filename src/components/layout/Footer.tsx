import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, Facebook, Linkedin, Youtube, Shield, Truck, CreditCard } from "lucide-react";
import { categoryGroups } from "@/lib/categories";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import logo from "@/assets/logo.png";

const paymentMethods = ["Visa", "Mastercard", "PayPal", "Amex", "Maestro"];

const Footer = () => {
  const { t, language, isTransitioning } = useLanguage();
  const fontClass = language === 'bn' ? 'font-bangla' : '';

  return (
    <footer className={cn(
      "bg-primary text-primary-foreground transition-opacity duration-200",
      fontClass,
      isTransitioning ? "opacity-50" : "opacity-100"
    )}>
      {/* Trust Reinforcement Bar */}
      <div className="border-b border-primary-foreground/10">
        <div className={cn(
          "container-premium py-4 transition-all duration-200",
          isTransitioning ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
        )}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Shield className="h-4 w-4 text-accent" />
              <span className="text-xs text-primary-foreground/80">{t.footer.authenticProducts}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Truck className="h-4 w-4 text-accent" />
              <span className="text-xs text-primary-foreground/80">{t.footer.nationwideDelivery}</span>
            </div>
            <div className="flex items-center justify-center md:justify-end gap-2">
              <CreditCard className="h-4 w-4 text-accent" />
              <span className="text-xs text-primary-foreground/80">{t.footer.securePayment}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className={cn(
        "container-premium py-10 md:py-12 transition-all duration-200",
        isTransitioning ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
      )}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <img 
                src={logo} 
                alt="ST International" 
                className="h-12 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-xs text-primary-foreground/70 mb-1 leading-relaxed font-medium">
              ST International
            </p>
            <p className="text-xs text-primary-foreground/60 mb-3">
              {language === 'bn' ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, Bangladesh'}
            </p>
            <p className="text-xs text-primary-foreground/60 mb-4 leading-relaxed">
              {t.footer.companyDescription}
            </p>
            <div className="flex items-center gap-3">
              <a 
                href="#" 
                className="w-8 h-8 bg-primary-foreground/10 rounded flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                aria-label="Facebook"
              >
                <Facebook className="h-3.5 w-3.5" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 bg-primary-foreground/10 rounded flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-3.5 w-3.5" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 bg-primary-foreground/10 rounded flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                aria-label="YouTube"
              >
                <Youtube className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-4">{t.footer.productCategories}</h4>
            <ul className="space-y-2">
              {categoryGroups.map((group) => (
                <li key={group.id}>
                  <Link 
                    to={`/categories#${group.slug}`} 
                    className="text-xs text-primary-foreground/60 hover:text-accent transition-colors duration-200"
                  >
                    {group.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-4">{t.footer.quickLinks}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-xs text-primary-foreground/60 hover:text-accent transition-colors duration-200">
                  {t.footer.aboutUs}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-xs text-primary-foreground/60 hover:text-accent transition-colors duration-200">
                  {t.footer.contact}
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-xs text-primary-foreground/60 hover:text-accent transition-colors duration-200">
                  {t.footer.allProducts}
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-xs text-primary-foreground/60 hover:text-accent transition-colors duration-200">
                  {t.footer.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions" className="text-xs text-primary-foreground/60 hover:text-accent transition-colors duration-200">
                  {t.footer.termsConditions}
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-xs text-primary-foreground/60 hover:text-accent transition-colors duration-200">
                  {t.footer.refundPolicy}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-4">{t.footer.contactUs}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span className="text-xs text-primary-foreground/70 leading-relaxed">
                  {language === 'bn' 
                    ? <>মামুন ম্যানশন, ৫২/২,<br />তয়েনবী সার্কুলার রোড,<br />হাটখোলা, টিকাটুলি,<br />ঢাকা-১২০৩, বাংলাদেশ</>
                    : <>Mamun Mansion, 52/2,<br />Toyeanbee Circular Road,<br />Hatkhola, Tikatuli,<br />Dhaka-1203, Bangladesh</>
                  }
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-accent shrink-0" />
                <div className="text-xs text-primary-foreground/70">
                  <a href="tel:+8801715575665" className="hover:text-accent transition-colors duration-200 block">
                    01715-575665
                  </a>
                  <a href="tel:+8801713297170" className="hover:text-accent transition-colors duration-200 block">
                    01713-297170
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-accent shrink-0" />
                <a href="mailto:info@stinternationalbd.com" className="text-xs text-primary-foreground/70 hover:text-accent transition-colors duration-200">
                  info@stinternationalbd.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-accent shrink-0" />
                <span className="text-xs text-primary-foreground/70">
                  {t.footer.businessHours}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Separator className="bg-primary-foreground/10" />

      {/* Bottom Bar — Payment + Copyright */}
      <div className="container-premium py-5 pb-7 lg:pb-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Payment badges */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-[10px] text-primary-foreground/40 uppercase tracking-wider mr-1">
              {t.footer.acceptedPayments}:
            </span>
            {paymentMethods.map((method) => (
              <span
                key={method}
                className="text-[10px] font-medium bg-primary-foreground/10 text-primary-foreground/70 px-2 py-0.5 rounded"
              >
                {method}
              </span>
            ))}
          </div>

          {/* Copyright & Credit */}
          <div className="flex flex-col sm:flex-row items-center gap-2 text-[11px] text-primary-foreground/50 md:pr-16">
            <p>© 2026 ST International. {t.footer.allRightsReserved}</p>
            <span className="hidden sm:inline">·</span>
            <div className="flex items-center gap-1">
              <span>{t.footer.designBy}</span>
              <a 
                href="http://creationtechbd.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-foreground/70 hover:text-accent transition-colors duration-200 font-medium"
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
