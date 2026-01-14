import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { cn } from "@/lib/utils";

const ProductExport = () => {
  const { t, language } = useAdminLanguage();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);

    try {
      // Fetch all products with categories
      const { data: products, error } = await supabase
        .from("products")
        .select(`
          name, slug, price, compare_price, description, short_description,
          sku, image_url, stock_quantity, in_stock, is_featured, is_active,
          specifications, features,
          category:categories(slug)
        `)
        .order("name");

      if (error) throw error;

      if (!products || products.length === 0) {
        toast.error(t.productExport?.noProducts || "No products to export");
        return;
      }

      // CSV headers
      const headers = [
        "name",
        "slug",
        "price",
        "compare_price",
        "description",
        "short_description",
        "sku",
        "category_slug",
        "image_url",
        "stock_quantity",
        "in_stock",
        "is_featured",
        "is_active",
        "specifications",
        "features",
      ];

      // Convert products to CSV rows
      const rows = products.map((product) => {
        const specs = product.specifications 
          ? JSON.stringify(product.specifications).replace(/"/g, '""')
          : "";
        const feats = product.features 
          ? (product.features as string[]).join("; ")
          : "";

        return [
          escapeCSV(product.name),
          escapeCSV(product.slug),
          product.price,
          product.compare_price || "",
          escapeCSV(product.description || ""),
          escapeCSV(product.short_description || ""),
          escapeCSV(product.sku || ""),
          escapeCSV(product.category?.slug || ""),
          escapeCSV(product.image_url || ""),
          product.stock_quantity || 0,
          product.in_stock ? "TRUE" : "FALSE",
          product.is_featured ? "TRUE" : "FALSE",
          product.is_active ? "TRUE" : "FALSE",
          `"${specs}"`,
          escapeCSV(feats),
        ].join(",");
      });

      // Create CSV content
      const csvContent = [headers.join(","), ...rows].join("\n");

      // Download file
      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `products_export_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      const successMsg = (t.productExport?.success || "{count} products exported").replace("{count}", String(products.length));
      toast.success(successMsg);
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error(t.productExport?.error || "Failed to export");
    } finally {
      setExporting(false);
    }
  };

  const escapeCSV = (value: string): string => {
    if (!value) return "";
    // If value contains comma, newline, or quote, wrap in quotes
    if (value.includes(",") || value.includes("\n") || value.includes('"')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleExport} 
      disabled={exporting}
      className={cn(language === "bn" && "font-siliguri")}
    >
      {exporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {exporting 
        ? (t.productExport?.exporting || "Exporting...") 
        : (t.productExport?.export || "Export")
      }
    </Button>
  );
};

export default ProductExport;