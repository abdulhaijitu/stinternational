import { ReactNode } from "react";
import { motion } from "framer-motion";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * PageTransition - Smooth animated page transitions using framer-motion.
 * Provides fade + subtle slide animation for polished navigation experience.
 */
const PageTransition = ({ children, className }: PageTransitionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smooth feel
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
