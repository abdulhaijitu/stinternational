import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Search, Loader2, Lock } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/formatPrice";
import { toast } from "sonner";
import BulkProductImport from "@/components/admin/BulkProductImport";
import ProductExport from "@/components/admin/ProductExport";
import { useAdmin } from "@/contexts/AdminContext";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  sku: string | null;
  in_stock: boolean;
  stock_quantity: number;
  is_active: boolean;
  image_url: string | null;
  category: { name: string } | null;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  
  const { hasPermission, isSuperAdmin } = useAdmin();
  const { t, language } = useAdminLanguage();
  
  // Permission checks
  const canCreate = isSuperAdmin || hasPermission("products", "create");
  const canEdit = isSuperAdmin || hasPermission("products", "update");
  const canDelete = isSuperAdmin || hasPermission("products", "delete");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id, name, slug, price, sku, in_stock, stock_quantity, is_active, image_url,
          category:categories(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error(t.products.loadError);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!canDelete) {
      toast.error(t.products.noPermission);
      return;
    }
    
    if (!confirm(`${t.products.deleteConfirm} "${name}"?`)) return;

    setDeleting(id);
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      setProducts(products.filter((p) => p.id !== id));
      toast.success(t.products.deleteSuccess);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(t.products.deleteError);
    } finally {
      setDeleting(null);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusInfo = (product: Product) => {
    if (!product.is_active) {
      return { label: t.products.inactive, className: "bg-muted text-muted-foreground" };
    }
    if (product.in_stock) {
      return { label: t.products.inStock, className: "bg-success/10 text-success" };
    }
    return { label: t.products.outOfStock, className: "bg-destructive/10 text-destructive" };
  };

  return (
    <AdminLayout>
      <TooltipProvider>
        <div className={cn("space-y-6", language === "bn" && "font-siliguri")}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{t.products.title}</h1>
              <p className="text-muted-foreground">{t.products.subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <ProductExport />
              {canCreate ? (
                <>
                  <BulkProductImport onSuccess={fetchProducts} />
                  <Button asChild>
                    <Link to="/admin/products/new">
                      <Plus className="h-4 w-4 mr-1" />
                      {t.products.newProduct}
                    </Link>
                  </Button>
                </>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button disabled className="opacity-50">
                      <Lock className="h-4 w-4 mr-1" />
                      {t.products.newProduct}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t.products.noPermission}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.products.searchProducts}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Products Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {search ? t.products.noProducts : t.common.noData}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium">{t.products.productName}</th>
                      <th className="text-left p-4 text-sm font-medium">{t.products.sku}</th>
                      <th className="text-left p-4 text-sm font-medium">{t.products.category}</th>
                      <th className="text-left p-4 text-sm font-medium">{t.products.price}</th>
                      <th className="text-left p-4 text-sm font-medium">{t.products.stock}</th>
                      <th className="text-left p-4 text-sm font-medium">{t.common.status}</th>
                      <th className="text-right p-4 text-sm font-medium">{t.common.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const status = getStatusInfo(product);
                      return (
                        <tr key={product.id} className="border-t border-border">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-muted rounded overflow-hidden shrink-0">
                                {product.image_url && (
                                  <img
                                    src={product.image_url}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <span className="font-medium text-sm line-clamp-1">{product.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">{product.sku || "-"}</td>
                          <td className="p-4 text-sm">{product.category?.name || "-"}</td>
                          <td className="p-4 text-sm font-medium">{formatPrice(product.price, language)}</td>
                          <td className="p-4 text-sm">{product.stock_quantity}</td>
                          <td className="p-4">
                            <span className={cn("text-xs px-2 py-1 rounded-full font-medium", status.className)}>
                              {status.label}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {canEdit ? (
                                <Button variant="ghost" size="icon" asChild>
                                  <Link to={`/admin/products/${product.id}`}>
                                    <Pencil className="h-4 w-4" />
                                  </Link>
                                </Button>
                              ) : (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" disabled className="opacity-50">
                                      <Lock className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{t.products.noEditPermission}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              {canDelete ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(product.id, product.name)}
                                  disabled={deleting === product.id}
                                >
                                  {deleting === product.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  )}
                                </Button>
                              ) : (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" disabled className="opacity-50">
                                      <Lock className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{t.products.noDeletePermission}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </TooltipProvider>
    </AdminLayout>
  );
};

export default AdminProducts;