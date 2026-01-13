import {
  FlaskConical,
  Microscope,
  Scale,
  HardHat,
  TestTube,
  GraduationCap,
  Timer,
  Ruler,
  ShieldCheck,
  Shield,
  Package,
  Beaker,
  Thermometer,
  Gauge,
  Wrench,
  Cog,
  type LucideIcon,
} from "lucide-react";

// Map icon_name from database to Lucide icons
export const categoryIconMap: Record<string, LucideIcon> = {
  FlaskConical,
  Microscope,
  Scale,
  HardHat,
  TestTube,
  GraduationCap,
  Timer,
  Ruler,
  ShieldCheck,
  Shield,
  Package,
  Beaker,
  Thermometer,
  Gauge,
  Wrench,
  Cog,
  Weight: Scale, // Alias
};

export const getCategoryIcon = (iconName: string | null): LucideIcon => {
  if (!iconName) return Package;
  return categoryIconMap[iconName] || Package;
};
