export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription: string;
  price: number;
  comparePrice?: number;
  currency: string;
  categoryId: string;
  images: string[];
  inStock: boolean;
  stockQuantity: number;
  specifications: Record<string, string>;
  features: string[];
  brand?: string;
  model?: string;
  warranty?: string;
  isFeatured: boolean;
  createdAt: string;
}

// Sample products for demonstration
export const sampleProducts: Product[] = [
  {
    id: "prod-001",
    name: "Digital Analytical Balance AS 220.R2",
    slug: "digital-analytical-balance-as-220-r2",
    sku: "BAL-AS220-R2",
    description: "High-precision digital analytical balance with exceptional accuracy for laboratory applications. Features internal calibration, RS232 interface, and glass draft shield. Ideal for pharmaceutical, chemical, and research laboratories requiring precise measurements.",
    shortDescription: "High-precision analytical balance with 0.0001g readability",
    price: 85000,
    comparePrice: 95000,
    currency: "BDT",
    categoryId: "analytical-balance",
    images: ["/placeholder.svg"],
    inStock: true,
    stockQuantity: 12,
    specifications: {
      "Maximum Capacity": "220g",
      "Readability": "0.0001g (0.1mg)",
      "Repeatability": "0.0001g",
      "Linearity": "±0.0002g",
      "Pan Size": "Ø90mm",
      "Calibration": "Internal automatic",
      "Display": "Backlit LCD",
      "Interface": "RS232, USB",
      "Power Supply": "AC adapter 12V",
      "Dimensions": "196 × 330 × 280mm",
      "Weight": "4.5kg",
    },
    features: [
      "Internal automatic calibration",
      "Glass draft shield included",
      "Level indicator with adjustment",
      "Below balance weighing hook",
      "GLP/GMP compliant printouts",
    ],
    brand: "RADWAG",
    model: "AS 220.R2",
    warranty: "2 Years",
    isFeatured: true,
    createdAt: "2024-01-15",
  },
  {
    id: "prod-002",
    name: "Laboratory Glass Beaker Set (50ml - 2000ml)",
    slug: "laboratory-glass-beaker-set",
    sku: "GLW-BEAK-SET",
    description: "Complete set of borosilicate glass beakers in graduated sizes from 50ml to 2000ml. Made from high-quality borosilicate 3.3 glass with excellent chemical and thermal resistance. Clear graduation marks for accurate measurement.",
    shortDescription: "Complete 8-piece borosilicate glass beaker set",
    price: 4500,
    currency: "BDT",
    categoryId: "plastic-glassware",
    images: ["/placeholder.svg"],
    inStock: true,
    stockQuantity: 45,
    specifications: {
      "Material": "Borosilicate Glass 3.3",
      "Set Includes": "50, 100, 250, 400, 600, 1000, 1500, 2000ml",
      "Graduation": "White enamel",
      "Temperature Range": "-40°C to +500°C",
      "Thermal Shock": "140K",
      "Autoclavable": "Yes",
    },
    features: [
      "Premium borosilicate 3.3 glass",
      "Clear graduation marks",
      "Pouring spout",
      "Autoclavable",
      "Chemical resistant",
    ],
    brand: "BOROSIL",
    warranty: "Manufacturing defects covered",
    isFeatured: true,
    createdAt: "2024-01-20",
  },
  {
    id: "prod-003",
    name: "Industrial Platform Scale 300kg",
    slug: "industrial-platform-scale-300kg",
    sku: "SCL-IND-300",
    description: "Heavy-duty industrial platform scale with 300kg capacity. Features stainless steel platform, rechargeable battery, and RS232 connectivity. Suitable for warehouses, factories, and shipping applications.",
    shortDescription: "Heavy-duty 300kg platform scale for industrial use",
    price: 28000,
    comparePrice: 32000,
    currency: "BDT",
    categoryId: "floor-scales",
    images: ["/placeholder.svg"],
    inStock: true,
    stockQuantity: 8,
    specifications: {
      "Maximum Capacity": "300kg",
      "Division": "50g",
      "Platform Size": "450 × 600mm",
      "Material": "Stainless Steel 304",
      "Display": "LCD with backlight",
      "Power": "AC/DC, Rechargeable battery",
      "Battery Life": "80 hours",
      "Interface": "RS232",
      "IP Rating": "IP65",
    },
    features: [
      "Stainless steel platform",
      "Rechargeable battery included",
      "Tare function",
      "Piece counting mode",
      "Overload protection",
      "IP65 water resistant",
    ],
    brand: "KERN",
    model: "IFS 300K-2",
    warranty: "1 Year",
    isFeatured: true,
    createdAt: "2024-02-01",
  },
  {
    id: "prod-004",
    name: "Digital GSM Cutter & Balance Set",
    slug: "digital-gsm-cutter-balance-set",
    sku: "GSM-SET-001",
    description: "Complete GSM testing set including precision GSM cutter and analytical balance. Essential for textile industry quality control. Cutter produces standard 100cm² samples for accurate GSM measurement.",
    shortDescription: "Complete GSM testing kit for textile industry",
    price: 45000,
    currency: "BDT",
    categoryId: "gsm-instrument",
    images: ["/placeholder.svg"],
    inStock: true,
    stockQuantity: 15,
    specifications: {
      "Sample Size": "100cm² (round)",
      "Balance Capacity": "300g",
      "Balance Readability": "0.01g",
      "Cutter Material": "Hardened Steel",
      "Balance Display": "LCD",
      "Power": "AC adapter included",
    },
    features: [
      "Standard 100cm² sample cutter",
      "High precision balance included",
      "Direct GSM reading mode",
      "Carrying case included",
      "Calibration weights included",
    ],
    brand: "ST International",
    warranty: "1 Year",
    isFeatured: false,
    createdAt: "2024-02-10",
  },
  {
    id: "prod-005",
    name: "Safety Helmet - Industrial Grade",
    slug: "safety-helmet-industrial-grade",
    sku: "SAF-HEL-001",
    description: "High-quality industrial safety helmet meeting international safety standards. Features adjustable ratchet suspension, sweat band, and ventilation holes. Available in multiple colors for site identification.",
    shortDescription: "Industrial safety helmet with ratchet adjustment",
    price: 850,
    currency: "BDT",
    categoryId: "safety-equipment",
    images: ["/placeholder.svg"],
    inStock: true,
    stockQuantity: 200,
    specifications: {
      "Material": "HDPE",
      "Weight": "350g",
      "Size": "Adjustable 52-63cm",
      "Standard": "EN 397, ANSI Z89.1",
      "Temperature Range": "-30°C to +50°C",
      "Colors Available": "White, Yellow, Blue, Red, Orange",
    },
    features: [
      "Ratchet adjustment system",
      "Replaceable sweat band",
      "Ventilation holes",
      "Accessory slots for attachments",
      "UV stabilized material",
    ],
    brand: "3M",
    warranty: "2 Years from manufacture",
    isFeatured: false,
    createdAt: "2024-02-15",
  },
  {
    id: "prod-006",
    name: "Soil Testing Kit - Complete Set",
    slug: "soil-testing-kit-complete",
    sku: "CIV-SOIL-KIT",
    description: "Comprehensive soil testing kit for civil engineering and construction applications. Includes equipment for moisture content, compaction, and gradation tests. Suitable for field and laboratory use.",
    shortDescription: "Complete soil testing equipment for construction",
    price: 125000,
    currency: "BDT",
    categoryId: "civil-construction",
    images: ["/placeholder.svg"],
    inStock: true,
    stockQuantity: 5,
    specifications: {
      "Tests Included": "Moisture, Compaction, Sieve Analysis",
      "Sieve Sizes": "8 standard sizes",
      "Proctor Mold": "Standard and Modified",
      "Balance Capacity": "5kg",
      "Case": "Heavy-duty carrying case",
    },
    features: [
      "Multiple test capabilities",
      "Standard and modified proctor",
      "Complete sieve set",
      "Precision balance included",
      "Field-ready design",
      "Training manual included",
    ],
    brand: "Controls",
    warranty: "1 Year",
    isFeatured: true,
    createdAt: "2024-02-20",
  },
];

export const getProductsByCategory = (categoryId: string): Product[] => {
  return sampleProducts.filter(product => product.categoryId === categoryId);
};

export const getProductBySlug = (slug: string): Product | undefined => {
  return sampleProducts.find(product => product.slug === slug);
};

export const getFeaturedProducts = (): Product[] => {
  return sampleProducts.filter(product => product.isFeatured);
};

export const formatPrice = (price: number, currency: string = "BDT"): string => {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};
