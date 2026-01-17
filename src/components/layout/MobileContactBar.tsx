import { useState, useEffect } from "react";
import { Phone, MessageCircle, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

/**
 * Mobile Contact Bar
 * Client-only: Renders only after mount to prevent hydration issues
 */
const MobileContactBar = () => {
  const [hasMounted, setHasMounted] = useState(false);
  const { language } = useLanguage();

  // Client-only mount guard
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const contactActions = [
    {
      icon: Phone,
      label: language === "bn" ? "কল করুন" : "Call",
      href: "tel:+8801715575665",
      bgColor: "bg-primary",
      hoverColor: "hover:bg-primary/90",
    },
    {
      icon: MessageCircle,
      label: language === "bn" ? "হোয়াটসঅ্যাপ" : "WhatsApp",
      href: "https://wa.me/8801715575665?text=Hello%2C%20I%20would%20like%20to%20inquire%20about%20your%20products.",
      bgColor: "bg-[#25D366]",
      hoverColor: "hover:bg-[#1da851]",
      external: true,
    },
    {
      icon: Mail,
      label: language === "bn" ? "ইমেইล" : "Email",
      href: "mailto:info@stinternationalbd.com",
      bgColor: "bg-accent",
      hoverColor: "hover:bg-accent/90",
    },
  ];

  // Don't render until client is ready
  if (!hasMounted) {
    return null;
  }

  // Contact bar sits at 64px (above bottom nav)
  // Height: 48px
  return (
    <div 
      className={cn(
        "fixed bottom-[64px] left-0 right-0 z-[42] lg:hidden",
        "bg-background/95 backdrop-blur-md border-t border-border",
        "safe-area-bottom"
      )}
    >
      <div className="flex items-stretch h-12">
        {contactActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <a
              key={index}
              href={action.href}
              target={action.external ? "_blank" : undefined}
              rel={action.external ? "noopener noreferrer" : undefined}
              className={cn(
                "flex-1 flex items-center justify-center gap-2",
                "text-white font-medium text-sm",
                "transition-colors duration-200",
                action.bgColor,
                action.hoverColor,
                index !== contactActions.length - 1 && "border-r border-white/20"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{action.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default MobileContactBar;
