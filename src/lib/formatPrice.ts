// Bilingual price formatter
export const formatPrice = (price: number, language: "en" | "bn" = "bn"): string => {
  if (language === "bn") {
    return new Intl.NumberFormat("bn-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }
  
  // English format: ৳1,500 or BDT 1,500
  return `৳${new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)}`;
};

// Hook-friendly version that can be imported
export const usePriceFormatter = (language: "en" | "bn") => {
  return (price: number) => formatPrice(price, language);
};
