import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Search, Loader2, Lock, Package, RefreshCw } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/formatPrice";
import { toast } from "sonner";
import BulkProductImport from "@/components/admin/BulkProductImport";
import ProductExport from "@/components/admin/ProductExport";
import { useAdmin } from "@/contexts/AdminContext";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAdminProducts, useDeleteProduct, useInvalidateProducts } from "@/hooks/useAdminProducts";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";

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
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  const { hasPermission, isSuperAdmin } = useAdmin();
  const { t, language } = useAdminLanguage();
  
  // React Query hooks for data management
  const { data: products = [], isLoading: loading, refetch, isFetching } = useAdminProducts();
  const deleteProduct = useDeleteProduct();
  const invalidateProducts = useInvalidateProducts();
  
  // Permission checks
  const canCreate = isSuperAdmin || hasPermission("products", "create");
  const canEdit = isSuperAdmin || hasPermission("products", "update");
  const canDelete = isSuperAdmin || hasPermission("products", "delete");

  const openDeleteDialog = (product: Product) => {
    if (!canDelete) {
      toast.error(t.products.noPermission);
      return;
    }
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    setDeletingId(productToDelete.id);
    try {
      await deleteProduct.mutateAsync(productToDelete.id);
      toast.success(t.products.deleteSuccess);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(t.products.deleteError);
      throw error; // Re-throw to let dialog know it failed
    } finally {
      setDeletingId(null);
      setProductToDelete(null);
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

  if (loading) {
    return (
      <AdminLayout>
        <AdminTableSkeleton columns={7} rows={10} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <TooltipProvider>
        <div className={cn("space-y-6", language === "bn" && "font-siliguri")}>
          {/* Page Header - Enterprise Standard */}
          <div className="admin-page-header">
            <div>
              <h1 className="admin-page-title">{t.products.title}</h1>
              <p className="admin-page-subtitle">{t.products.subtitle}</p>
            </div>
            <div className="admin-action-bar">
              <ProductExport />
              {canCreate ? (
                <>
                  <BulkProductImport onSuccess={invalidateProducts} />
                  <Button asChild className="gap-1.5">
                    <Link to="/admin/products/new">
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">{t.products.newProduct}</span>
                    </Link>
                  </Button>
                </>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button disabled className="opacity-50 gap-1.5">
                      <Lock className="h-4 w-4" />
                      <span className="hidden sm:inline">{t.products.newProduct}</span>
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
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.products.searchProducts}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {/* Products Table - Enterprise Standard */}
          <div className="admin-table-wrapper">
            {filteredProducts.length === 0 ? (
              <div className="admin-empty-state">
                <Package className="admin-empty-state-icon" />
                <p className="admin-empty-state-text">
                  {search ? t.products.noProducts : t.common.noData}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{t.products.productName}</th>
                      <th className="hidden md:table-cell">{t.products.sku}</th>
                      <th className="hidden lg:table-cell">{t.products.category}</th>
                      <th>{t.products.price}</th>
                      <th className="hidden sm:table-cell">{t.products.stock}</th>
                      <th>{t.common.status}</th>
                      <th className="text-right">{t.common.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const status = getStatusInfo(product);
                      return (
                        <tr key={product.id}>
                          <td>
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
                          <td className="hidden md:table-cell text-muted-foreground">
                            {product.sku || "-"}
                          </td>
                          <td className="hidden lg:table-cell">
                            {product.category?.name || "-"}
                          </td>
                          <td>
                            <span className="font-medium">{formatPrice(product.price, language)}</span>
                          </td>
                          <td className="hidden sm:table-cell">{product.stock_quantity}</td>
                          <td>
                            <span className={cn("text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap", status.className)}>
                              {status.label}
                            </span>
                          </td>
                          <td>
                            <div className="admin-table-actions">
                              {canEdit ? (
                                <Button variant="ghost" size="sm" asChild className="h-8 gap-1.5">
                                  <Link to={`/admin/products/${product.id}`}>
                                    <Pencil className="h-4 w-4" />
                                    <span className="hidden lg:inline">{t.common.edit}</span>
                                  </Link>
                                </Button>
                              ) : (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" disabled className="opacity-50 h-8">
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
                                  size="sm"
                                  onClick={() => openDeleteDialog(product)}
                                  disabled={deletingId === product.id}
                                  className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  {deletingId === product.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              ) : (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" disabled className="opacity-50 h-8">
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

        {/* Delete Confirmation Dialog */}
        <ConfirmDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          itemName={productToDelete?.name || ""}
          itemType={language === "bn" ? "পণ্য" : "Product"}
          onConfirm={handleDelete}
          translations={{
            cancel: t.common.cancel,
            delete: t.common.delete || "Delete",
            deleting: language === "bn" ? "মুছে ফেলা হচ্ছে..." : "Deleting...",
          }}
          language={language}
        />
      </TooltipProvider>
    </AdminLayout>
  );
};

export default AdminProducts;