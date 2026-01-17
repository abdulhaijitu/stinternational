import { useState, useEffect, ReactNode } from "react";

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * ClientOnly - Wrapper component that only renders children after client mount
 * 
 * This prevents hydration mismatches and SSR issues with:
 * - framer-motion animations
 * - window/document access
 * - Browser-only APIs
 * 
 * Usage:
 * <ClientOnly>
 *   <AnimatedComponent />
 * </ClientOnly>
 */
export const ClientOnly = ({ children, fallback = null }: ClientOnlyProps) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Hook version for conditional rendering
 */
export const useClientOnly = (): boolean => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
};

export default ClientOnly;
