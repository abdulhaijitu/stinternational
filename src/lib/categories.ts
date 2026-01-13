import { 
  Microscope, 
  FlaskConical, 
  TestTube, 
  Scale, 
  Gauge, 
  Timer, 
  HardHat, 
  ShieldCheck,
  Building2,
  type LucideIcon
} from "lucide-react";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: LucideIcon;
  parentId: string | null;
  productCount: number;
}

export interface CategoryGroup {
  id: string;
  name: string;
  slug: string;
  description: string;
  categories: Category[];
}

export const categoryGroups: CategoryGroup[] = [
  {
    id: "lab-education",
    name: "Laboratory & Education",
    slug: "laboratory-education",
    description: "Complete solutions for educational institutions and research laboratories",
    categories: [
      {
        id: "education-lab",
        name: "Education Lab Materials",
        slug: "education-lab-materials",
        description: "Comprehensive lab materials for schools, colleges, and universities",
        icon: Microscope,
        parentId: "lab-education",
        productCount: 245,
      },
      {
        id: "plastic-glassware",
        name: "Plastic & Glassware",
        slug: "plastic-glassware",
        description: "High-quality laboratory plastic and glass equipment",
        icon: FlaskConical,
        parentId: "lab-education",
        productCount: 189,
      },
      {
        id: "test-kits",
        name: "Test Kits & Filter Papers",
        slug: "test-kits-filter-papers",
        description: "Precision testing kits and premium filter papers",
        icon: TestTube,
        parentId: "lab-education",
        productCount: 156,
      },
      {
        id: "bioflog",
        name: "Bioflog All Equipment",
        slug: "bioflog-equipment",
        description: "Complete range of Bioflog laboratory equipment",
        icon: Microscope,
        parentId: "lab-education",
        productCount: 78,
      },
    ],
  },
  {
    id: "measurement",
    name: "Measurement & Instruments",
    slug: "measurement-instruments",
    description: "Precision measurement equipment for industrial and laboratory use",
    categories: [
      {
        id: "analytical-balance",
        name: "Analytical Balance",
        slug: "analytical-balance",
        description: "High-precision analytical balances for accurate measurements",
        icon: Scale,
        parentId: "measurement",
        productCount: 67,
      },
      {
        id: "floor-scales",
        name: "Floor & Industrial Scales",
        slug: "floor-industrial-scales",
        description: "Heavy-duty scales for industrial applications",
        icon: Scale,
        parentId: "measurement",
        productCount: 45,
      },
      {
        id: "kitchen-scales",
        name: "Kitchen & Top Loading Scale",
        slug: "kitchen-top-loading-scales",
        description: "Versatile scales for kitchen and general weighing needs",
        icon: Scale,
        parentId: "measurement",
        productCount: 89,
      },
      {
        id: "gsm-instrument",
        name: "GSM Instrument",
        slug: "gsm-instruments",
        description: "Accurate GSM measurement instruments for textiles",
        icon: Gauge,
        parentId: "measurement",
        productCount: 34,
      },
      {
        id: "stopwatch-timer",
        name: "Stop Watch Timer",
        slug: "stopwatch-timers",
        description: "Professional stopwatches and timing equipment",
        icon: Timer,
        parentId: "measurement",
        productCount: 28,
      },
    ],
  },
  {
    id: "engineering",
    name: "Engineering & Industrial",
    slug: "engineering-industrial",
    description: "Professional equipment for construction and industrial safety",
    categories: [
      {
        id: "civil-construction",
        name: "Civil, Soil & Construction Equipment",
        slug: "civil-soil-construction",
        description: "Equipment for civil engineering and construction testing",
        icon: Building2,
        parentId: "engineering",
        productCount: 156,
      },
      {
        id: "health-safety",
        name: "Health & Safety",
        slug: "health-safety",
        description: "Comprehensive health and safety solutions",
        icon: ShieldCheck,
        parentId: "engineering",
        productCount: 98,
      },
      {
        id: "safety-equipment",
        name: "Safety Equipment",
        slug: "safety-equipment",
        description: "Industrial safety gear and protective equipment",
        icon: HardHat,
        parentId: "engineering",
        productCount: 134,
      },
    ],
  },
];

export const getAllCategories = (): Category[] => {
  return categoryGroups.flatMap(group => group.categories);
};

export const getCategoryBySlug = (slug: string): Category | undefined => {
  return getAllCategories().find(cat => cat.slug === slug);
};

export const getCategoryGroupBySlug = (slug: string): CategoryGroup | undefined => {
  return categoryGroups.find(group => group.slug === slug);
};
