import { useState, useRef } from "react";
import { Upload, Download, Loader2, AlertCircle, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

// Validation schema for each product row
const productRowSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  slug: z.string().min(1, "Slug is required").max(255),
  price: z.number().positive("Price must be positive"),
  description: z.string().max(10000).optional(),
  short_description: z.string().max(500).optional(),
  sku: z.string().max(100).optional(),
  category_slug: z.string().max(255).optional(),
  image_url: z.string().url().optional().or(z.literal("")),
  stock_quantity: z.number().int().min(0).optional(),
  in_stock: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
  compare_price: z.number().positive().optional().nullable(),
});

const BulkProductImport = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { language, t } = useAdminLanguage();
  const isBangla = language === "bn";
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("id, name, slug");
    setCategories(data || []);
  };

  const handleOpen = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      await fetchCategories();
      setResult(null);
      setProgress(0);
    }
  };

  const downloadTemplate = () => {
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
    ];

    const sampleRow = [
      "Digital Analytical Balance",
      "digital-analytical-balance",
      "45000",
      "50000",
      "High precision analytical balance for laboratory use",
      "Precision balance with 0.0001g accuracy",
      "BAL-001",
      "analytical-balance",
      "https://example.com/image.jpg",
      "10",
      "TRUE",
      "FALSE",
      "TRUE",
    ];

    const csvContent = [headers.join(","), sampleRow.join(",")].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length !== headers.length) continue;

      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim().replace(/^"|"$/g, "") || "";
      });
      rows.push(row);
    }

    return rows;
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error(t.products.csvOnlySupported);
      return;
    }

    setImporting(true);
    setProgress(0);
    setResult(null);

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length === 0) {
        toast.error(t.products.noDataInFile);
        setImporting(false);
        return;
      }

      const importResult: ImportResult = { success: 0, failed: 0, errors: [] };

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2; // +2 for header row and 1-based index

        try {
          // Parse and validate the row
          const parsedRow = {
            name: row.name || "",
            slug: row.slug || "",
            price: parseFloat(row.price) || 0,
            compare_price: row.compare_price ? parseFloat(row.compare_price) : null,
            description: row.description || undefined,
            short_description: row.short_description || undefined,
            sku: row.sku || undefined,
            category_slug: row.category_slug || undefined,
            image_url: row.image_url || undefined,
            stock_quantity: row.stock_quantity ? parseInt(row.stock_quantity) : 0,
            in_stock: row.in_stock?.toUpperCase() === "TRUE",
            is_featured: row.is_featured?.toUpperCase() === "TRUE",
            is_active: row.is_active?.toUpperCase() !== "FALSE",
          };

          // Validate using zod
          const validatedRow = productRowSchema.parse(parsedRow);

          // Find category ID if category_slug is provided
          let categoryId: string | null = null;
          if (validatedRow.category_slug) {
            const category = categories.find((c) => c.slug === validatedRow.category_slug);
            if (category) {
              categoryId = category.id;
            }
          }

          // Insert product
          const { error } = await supabase.from("products").insert({
            name: validatedRow.name,
            slug: validatedRow.slug,
            price: validatedRow.price,
            compare_price: validatedRow.compare_price,
            description: validatedRow.description || null,
            short_description: validatedRow.short_description || null,
            sku: validatedRow.sku || null,
            category_id: categoryId,
            image_url: validatedRow.image_url || null,
            stock_quantity: validatedRow.stock_quantity || 0,
            in_stock: validatedRow.in_stock ?? true,
            is_featured: validatedRow.is_featured ?? false,
            is_active: validatedRow.is_active ?? true,
          });

          if (error) throw error;
          importResult.success++;
        } catch (error: any) {
          importResult.failed++;
          const errorMessage = error.message || "Unknown error";
          importResult.errors.push(`Row ${rowNumber} (${row.name || "Unknown"}): ${errorMessage}`);
        }

        setProgress(Math.round(((i + 1) / rows.length) * 100));
      }

      setResult(importResult);

      if (importResult.success > 0) {
        toast.success(t.products.productsImported.replace("{count}", String(importResult.success)));
        onSuccess?.();
      }

      if (importResult.failed > 0) {
        toast.error(t.products.productsFailed.replace("{count}", String(importResult.failed)));
      }
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error(t.products.fileProcessError);
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4" />
          {t.products.bulkImport}
        </Button>
      </DialogTrigger>
      <DialogContent className={cn("max-w-lg", isBangla && "font-siliguri")}>
        <DialogHeader>
          <DialogTitle>{t.products.bulkImportTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Instructions */}
          <div className="text-sm text-muted-foreground space-y-2">
            <p>{t.products.bulkImportDescription}</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>{t.products.bulkImportSteps.step1}</li>
              <li>{t.products.bulkImportSteps.step2}</li>
              <li>{t.products.bulkImportSteps.step3}</li>
            </ol>
          </div>

          {/* Download Template */}
          <Button variant="outline" onClick={downloadTemplate} className="w-full">
            <Download className="h-4 w-4" />
            {t.products.downloadTemplate}
          </Button>

          {/* File Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            disabled={importing}
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="w-full"
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.products.importing}
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                {t.products.uploadCsvFile}
              </>
            )}
          </Button>

          {/* Progress */}
          {importing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">
                {progress}% {t.products.completed}
              </p>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-3">
              {result.success > 0 && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    {t.products.productsImported.replace("{count}", String(result.success))}
                  </AlertDescription>
                </Alert>
              )}

              {result.failed > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p>{t.products.productsFailed.replace("{count}", String(result.failed))}</p>
                    {result.errors.length > 0 && (
                      <ul className="mt-2 text-xs space-y-1 max-h-32 overflow-y-auto">
                        {result.errors.slice(0, 10).map((error, i) => (
                          <li key={i}>• {error}</li>
                        ))}
                        {result.errors.length > 10 && (
                          <li>{t.products.andMoreErrors.replace("{count}", String(result.errors.length - 10))}</li>
                        )}
                      </ul>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="w-full"
              >
                <X className="h-4 w-4" />
                {t.products.closeDialog}
              </Button>
            </div>
          )}

          {/* Available Categories Info */}
          {categories.length > 0 && !importing && !result && (
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">{t.products.availableCategorySlugs}</p>
              <div className="flex flex-wrap gap-1">
                {categories.map((cat) => (
                  <code key={cat.id} className="bg-muted px-1 py-0.5 rounded">
                    {cat.slug}
                  </code>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkProductImport;