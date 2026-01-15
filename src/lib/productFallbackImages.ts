/**
 * Product Fallback Image Utility
 * Provides context-aware fallback images based on category
 */

// Import fallback images (product thumbnails)
import laboratoryEquipment from "@/assets/fallbacks/laboratory-equipment.jpg";
import scalesBalance from "@/assets/fallbacks/scales-balance.jpg";
import safetyEquipment from "@/assets/fallbacks/safety-equipment.jpg";
import measurementInstruments from "@/assets/fallbacks/measurement-instruments.jpg";
import textileTesting from "@/assets/fallbacks/textile-testing.jpg";
import civilConstruction from "@/assets/fallbacks/civil-construction.jpg";
import defaultProduct from "@/assets/fallbacks/default-product.jpg";
import electricalEquipment from "@/assets/fallbacks/electrical-equipment.jpg";
import medicalEquipment from "@/assets/fallbacks/medical-equipment.jpg";
import environmentalTesting from "@/assets/fallbacks/environmental-testing.jpg";
import foodTesting from "@/assets/fallbacks/food-testing.jpg";
import opticalSurveying from "@/assets/fallbacks/optical-surveying.jpg";

// Import hero images (wide banners for category pages)
import heroLaboratory from "@/assets/fallbacks/hero-laboratory.jpg";
import heroMeasurement from "@/assets/fallbacks/hero-measurement.jpg";
import heroSafety from "@/assets/fallbacks/hero-safety.jpg";
import heroConstruction from "@/assets/fallbacks/hero-construction.jpg";
import heroTextile from "@/assets/fallbacks/hero-textile.jpg";
import heroDefault from "@/assets/fallbacks/hero-default.jpg";

// Category keyword to fallback image mapping
const categoryFallbackMap: Record<string, string> = {
  // Laboratory & Education
  "laboratory": laboratoryEquipment,
  "lab": laboratoryEquipment,
  "education": laboratoryEquipment,
  "glassware": laboratoryEquipment,
  "beaker": laboratoryEquipment,
  "flask": laboratoryEquipment,
  "chemical": laboratoryEquipment,
  "plastic-glassware": laboratoryEquipment,
  
  // Scales & Balances
  "scale": scalesBalance,
  "balance": scalesBalance,
  "weighing": scalesBalance,
  "analytical-balance": scalesBalance,
  "floor-scales": scalesBalance,
  "weight": scalesBalance,
  
  // Safety Equipment
  "safety": safetyEquipment,
  "ppe": safetyEquipment,
  "helmet": safetyEquipment,
  "protective": safetyEquipment,
  "safety-equipment": safetyEquipment,
  
  // Measurement & Instruments
  "measurement": measurementInstruments,
  "instrument": measurementInstruments,
  "meter": measurementInstruments,
  "gauge": measurementInstruments,
  "caliper": measurementInstruments,
  "micrometer": measurementInstruments,
  
  // Textile Testing
  "textile": textileTesting,
  "gsm": textileTesting,
  "fabric": textileTesting,
  "gsm-instrument": textileTesting,
  
  // Civil & Construction
  "civil": civilConstruction,
  "construction": civilConstruction,
  "soil": civilConstruction,
  "civil-construction": civilConstruction,
  "surveying": civilConstruction,
  "engineering": civilConstruction,
  
  // Electrical Equipment
  "electrical": electricalEquipment,
  "electronics": electricalEquipment,
  "multimeter": electricalEquipment,
  "oscilloscope": electricalEquipment,
  "circuit": electricalEquipment,
  "cable": electricalEquipment,
  
  // Medical Equipment
  "medical": medicalEquipment,
  "healthcare": medicalEquipment,
  "diagnostic": medicalEquipment,
  "stethoscope": medicalEquipment,
  "hospital": medicalEquipment,
  
  // Environmental Testing
  "environmental": environmentalTesting,
  "water": environmentalTesting,
  "ph": environmentalTesting,
  "turbidity": environmentalTesting,
  "pollution": environmentalTesting,
  
  // Food Testing
  "food": foodTesting,
  "moisture": foodTesting,
  "refractometer": foodTesting,
  "quality": foodTesting,
  
  // Optical & Surveying
  "optical": opticalSurveying,
  "theodolite": opticalSurveying,
  "total-station": opticalSurveying,
  "level": opticalSurveying,
};

// Parent group to fallback image mapping
const parentGroupFallbackMap: Record<string, string> = {
  "laboratory-education": laboratoryEquipment,
  "measurement-instruments": measurementInstruments,
  "engineering-industrial": civilConstruction,
};

// Hero image mapping for category page headers
const categoryHeroMap: Record<string, string> = {
  // Laboratory & Education
  "laboratory": heroLaboratory,
  "lab": heroLaboratory,
  "education": heroLaboratory,
  "glassware": heroLaboratory,
  "chemical": heroLaboratory,
  "laboratory-education": heroLaboratory,
  
  // Scales & Measurement
  "scale": heroMeasurement,
  "balance": heroMeasurement,
  "weighing": heroMeasurement,
  "measurement": heroMeasurement,
  "instrument": heroMeasurement,
  "meter": heroMeasurement,
  "caliper": heroMeasurement,
  "measurement-instruments": heroMeasurement,
  
  // Safety Equipment
  "safety": heroSafety,
  "ppe": heroSafety,
  "helmet": heroSafety,
  "protective": heroSafety,
  "safety-equipment": heroSafety,
  
  // Civil & Construction
  "civil": heroConstruction,
  "construction": heroConstruction,
  "soil": heroConstruction,
  "surveying": heroConstruction,
  "engineering": heroConstruction,
  "civil-construction": heroConstruction,
  "engineering-industrial": heroConstruction,
  
  // Textile Testing
  "textile": heroTextile,
  "gsm": heroTextile,
  "fabric": heroTextile,
  
  // Electrical (use measurement hero)
  "electrical": heroMeasurement,
  "electronics": heroMeasurement,
  
  // Medical (use laboratory hero)
  "medical": heroLaboratory,
  "healthcare": heroLaboratory,
  
  // Environmental (use laboratory hero)
  "environmental": heroLaboratory,
  "water": heroLaboratory,
  
  // Food (use laboratory hero)
  "food": heroLaboratory,
};

// Parent group to hero image mapping
const parentGroupHeroMap: Record<string, string> = {
  "laboratory-education": heroLaboratory,
  "measurement-instruments": heroMeasurement,
  "engineering-industrial": heroConstruction,
};

/**
 * Get a contextual fallback image based on category information
 * @param categorySlug - The category slug
 * @param categoryName - The category name (optional, for keyword matching)
 * @param parentGroup - The parent group (optional)
 * @returns The appropriate fallback image URL
 */
export const getProductFallbackImage = (
  categorySlug?: string | null,
  categoryName?: string | null,
  parentGroup?: string | null
): string => {
  // Try exact slug match first
  if (categorySlug && categoryFallbackMap[categorySlug.toLowerCase()]) {
    return categoryFallbackMap[categorySlug.toLowerCase()];
  }
  
  // Try parent group match
  if (parentGroup && parentGroupFallbackMap[parentGroup.toLowerCase()]) {
    return parentGroupFallbackMap[parentGroup.toLowerCase()];
  }
  
  // Try keyword matching in category slug
  if (categorySlug) {
    const slug = categorySlug.toLowerCase();
    for (const [keyword, image] of Object.entries(categoryFallbackMap)) {
      if (slug.includes(keyword)) {
        return image;
      }
    }
  }
  
  // Try keyword matching in category name
  if (categoryName) {
    const name = categoryName.toLowerCase();
    for (const [keyword, image] of Object.entries(categoryFallbackMap)) {
      if (name.includes(keyword)) {
        return image;
      }
    }
  }
  
  // Return default product image
  return defaultProduct;
};

/**
 * Get category hero image for page headers
 * @param categorySlug - The category slug
 * @param categoryName - The category name (optional)
 * @param parentGroup - The parent group (optional)
 * @returns The appropriate hero image URL
 */
export const getCategoryHeroImage = (
  categorySlug?: string | null,
  categoryName?: string | null,
  parentGroup?: string | null
): string => {
  // Try exact slug match first
  if (categorySlug && categoryHeroMap[categorySlug.toLowerCase()]) {
    return categoryHeroMap[categorySlug.toLowerCase()];
  }
  
  // Try parent group match
  if (parentGroup && parentGroupHeroMap[parentGroup.toLowerCase()]) {
    return parentGroupHeroMap[parentGroup.toLowerCase()];
  }
  
  // Try keyword matching in category slug
  if (categorySlug) {
    const slug = categorySlug.toLowerCase();
    for (const [keyword, image] of Object.entries(categoryHeroMap)) {
      if (slug.includes(keyword)) {
        return image;
      }
    }
  }
  
  // Try keyword matching in category name
  if (categoryName) {
    const name = categoryName.toLowerCase();
    for (const [keyword, image] of Object.entries(categoryHeroMap)) {
      if (name.includes(keyword)) {
        return image;
      }
    }
  }
  
  // Return default hero image
  return heroDefault;
};

/**
 * Get category fallback image
 * @param categorySlug - The category slug
 * @param parentGroup - The parent group (optional)
 * @returns The appropriate fallback image URL
 */
export const getCategoryFallbackImage = (
  categorySlug?: string | null,
  parentGroup?: string | null
): string => {
  return getProductFallbackImage(categorySlug, null, parentGroup);
};

/**
 * Get product image with fallback
 * @param imageUrl - The product's primary image URL
 * @param images - Array of additional product images
 * @param categorySlug - The category slug for fallback
 * @param categoryName - The category name for fallback
 * @param parentGroup - The parent group for fallback
 * @returns The image URL to display
 */
export const getProductImageWithFallback = (
  imageUrl?: string | null,
  images?: string[] | null,
  categorySlug?: string | null,
  categoryName?: string | null,
  parentGroup?: string | null
): string => {
  // Check primary image URL
  if (imageUrl && !isPlaceholder(imageUrl)) {
    return imageUrl;
  }
  
  // Check images array
  if (images && images.length > 0) {
    const validImage = images.find(img => img && !isPlaceholder(img));
    if (validImage) {
      return validImage;
    }
  }
  
  // Return contextual fallback
  return getProductFallbackImage(categorySlug, categoryName, parentGroup);
};

/**
 * Check if an image URL is a placeholder
 */
const isPlaceholder = (url: string): boolean => {
  if (!url) return true;
  const lowerUrl = url.toLowerCase();
  return (
    lowerUrl.includes("placeholder") ||
    lowerUrl === "/placeholder.svg" ||
    lowerUrl.includes("no-image") ||
    lowerUrl.includes("noimage")
  );
};

// Export default fallback for direct use
export { defaultProduct as DEFAULT_PRODUCT_IMAGE, heroDefault as DEFAULT_HERO_IMAGE };
