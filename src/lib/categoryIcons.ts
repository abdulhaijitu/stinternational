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
  Atom,
  Pipette,
  Syringe,
  Activity,
  Zap,
  Settings,
  Layers,
  Box,
  Boxes,
  CircuitBoard,
  Cpu,
  Database,
  Factory,
  FlaskRound,
  Hammer,
  HardDrive,
  HeartPulse,
  Lightbulb,
  Magnet,
  MonitorCheck,
  Radio,
  Scan,
  Search,
  Stethoscope,
  Target,
  TestTubes,
  Waves,
  type LucideIcon,
} from "lucide-react";

// Available icons for admin selection
export interface IconOption {
  name: string;
  icon: LucideIcon;
  label: string;
  category: string;
}

export const availableIcons: IconOption[] = [
  // Laboratory & Science
  { name: "FlaskConical", icon: FlaskConical, label: "Flask Conical", category: "Laboratory" },
  { name: "FlaskRound", icon: FlaskRound, label: "Flask Round", category: "Laboratory" },
  { name: "Beaker", icon: Beaker, label: "Beaker", category: "Laboratory" },
  { name: "TestTube", icon: TestTube, label: "Test Tube", category: "Laboratory" },
  { name: "TestTubes", icon: TestTubes, label: "Test Tubes", category: "Laboratory" },
  { name: "Pipette", icon: Pipette, label: "Pipette", category: "Laboratory" },
  { name: "Microscope", icon: Microscope, label: "Microscope", category: "Laboratory" },
  { name: "Atom", icon: Atom, label: "Atom", category: "Laboratory" },
  { name: "Syringe", icon: Syringe, label: "Syringe", category: "Laboratory" },
  
  // Measurement & Instruments
  { name: "Scale", icon: Scale, label: "Scale / Balance", category: "Measurement" },
  { name: "Ruler", icon: Ruler, label: "Ruler", category: "Measurement" },
  { name: "Timer", icon: Timer, label: "Timer / Stopwatch", category: "Measurement" },
  { name: "Gauge", icon: Gauge, label: "Gauge", category: "Measurement" },
  { name: "Thermometer", icon: Thermometer, label: "Thermometer", category: "Measurement" },
  { name: "Activity", icon: Activity, label: "Activity / Graph", category: "Measurement" },
  { name: "Scan", icon: Scan, label: "Scanner", category: "Measurement" },
  { name: "Target", icon: Target, label: "Target / Precision", category: "Measurement" },
  
  // Engineering & Industrial
  { name: "HardHat", icon: HardHat, label: "Hard Hat / Construction", category: "Engineering" },
  { name: "Wrench", icon: Wrench, label: "Wrench", category: "Engineering" },
  { name: "Hammer", icon: Hammer, label: "Hammer", category: "Engineering" },
  { name: "Cog", icon: Cog, label: "Cog / Gear", category: "Engineering" },
  { name: "Settings", icon: Settings, label: "Settings", category: "Engineering" },
  { name: "Factory", icon: Factory, label: "Factory", category: "Engineering" },
  { name: "Zap", icon: Zap, label: "Electrical / Zap", category: "Engineering" },
  { name: "CircuitBoard", icon: CircuitBoard, label: "Circuit Board", category: "Engineering" },
  { name: "Cpu", icon: Cpu, label: "CPU / Processor", category: "Engineering" },
  
  // Safety & Health
  { name: "ShieldCheck", icon: ShieldCheck, label: "Shield Check", category: "Safety" },
  { name: "Shield", icon: Shield, label: "Shield", category: "Safety" },
  { name: "HeartPulse", icon: HeartPulse, label: "Heart Pulse / Medical", category: "Safety" },
  { name: "Stethoscope", icon: Stethoscope, label: "Stethoscope", category: "Safety" },
  
  // Education & General
  { name: "GraduationCap", icon: GraduationCap, label: "Graduation Cap", category: "Education" },
  { name: "Lightbulb", icon: Lightbulb, label: "Lightbulb / Ideas", category: "Education" },
  { name: "Search", icon: Search, label: "Search / Research", category: "Education" },
  { name: "MonitorCheck", icon: MonitorCheck, label: "Monitor Check", category: "Education" },
  
  // Storage & Organization
  { name: "Package", icon: Package, label: "Package", category: "General" },
  { name: "Box", icon: Box, label: "Box", category: "General" },
  { name: "Boxes", icon: Boxes, label: "Boxes", category: "General" },
  { name: "Layers", icon: Layers, label: "Layers", category: "General" },
  { name: "Database", icon: Database, label: "Database", category: "General" },
  { name: "HardDrive", icon: HardDrive, label: "Hard Drive", category: "General" },
  
  // Specialty
  { name: "Waves", icon: Waves, label: "Waves / Frequency", category: "Specialty" },
  { name: "Radio", icon: Radio, label: "Radio / Signal", category: "Specialty" },
  { name: "Magnet", icon: Magnet, label: "Magnet", category: "Specialty" },
];

// Map icon_name from database to Lucide icons
export const categoryIconMap: Record<string, LucideIcon> = availableIcons.reduce(
  (acc, { name, icon }) => ({ ...acc, [name]: icon }),
  {} as Record<string, LucideIcon>
);

// Add aliases for backward compatibility
categoryIconMap["Weight"] = Scale;

export const getCategoryIcon = (iconName: string | null): LucideIcon => {
  if (!iconName) return Package;
  return categoryIconMap[iconName] || Package;
};

// Get icon options grouped by category
export const getIconsByCategory = (): Record<string, IconOption[]> => {
  return availableIcons.reduce((acc, icon) => {
    if (!acc[icon.category]) acc[icon.category] = [];
    acc[icon.category].push(icon);
    return acc;
  }, {} as Record<string, IconOption[]>);
};
