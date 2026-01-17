import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

/**
 * Floating WhatsApp Button
 * Priority: 1 (Primary floating element - occupies bottom-right corner)
 * Z-Index: 45 (Below modals/header, above content)
 * 
 * Mobile: Positioned above MobileContactBar (112px from bottom)
 * Desktop: Standard bottom-right position
 */
const FloatingWhatsApp = () => {
  const isMobile = useIsMobile();
  const whatsappNumber = "8801715575665";
  const defaultMessage = "Hello, I would like to inquire about your products.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;

  // Mobile: 64px (bottom nav) + 48px (contact bar) + 16px gap = 128px
  // Desktop: 24px from bottom
  const bottomPosition = isMobile ? 128 : 24;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{ bottom: bottomPosition }}
      className={cn(
        "fixed right-4 md:right-6 z-[45]",
        "w-12 h-12 md:w-14 md:h-14",
        "bg-[#25D366] hover:bg-[#1da851] text-white",
        "rounded-full flex items-center justify-center",
        "shadow-lg hover:shadow-xl",
        "transition-all duration-300 group"
      )}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-6 w-6 md:h-7 md:w-7" />
      
      {/* Tooltip - Desktop only */}
      <span className="absolute right-full mr-3 px-3 py-2 bg-foreground text-background text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none hidden md:block">
        Chat on WhatsApp
      </span>
      
      {/* Subtle pulse effect */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
    </motion.a>
  );
};

export default FloatingWhatsApp;
