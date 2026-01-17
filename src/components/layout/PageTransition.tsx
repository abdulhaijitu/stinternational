import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * PageTransition - STATIC render only.
 *
 * Critical fix: No framer-motion usage in shell to avoid preview boot deadlocks.
 */
const PageTransition = ({ children, className }: PageTransitionProps) => {
  return <div className={className}>{children}</div>;
};

export default PageTransition;

