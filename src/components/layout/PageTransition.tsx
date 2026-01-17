import { ReactNode, useState, useEffect } from 'react';
import { motion, Transition, Variants } from 'framer-motion';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
};

const pageTransition: Transition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.2,
};

/**
 * PageTransition - Animates page content on mount
 * 
 * Client-safe: Only animates after client mount to prevent hydration issues
 * Removed exit animation to avoid AnimatePresence requirement at root
 */
const PageTransition = ({ children, className }: PageTransitionProps) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Render children immediately but only animate after mount
  if (!hasMounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={pageVariants}
      transition={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
