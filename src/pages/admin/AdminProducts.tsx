import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Search, Loader2, Lock, Package, CheckSquare, Square, X } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { BulkProductDeleteDialog } from "@/components/admin/BulkProductDeleteDialog";
import { supabase } from "@/integrations/supabase/client";

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
  
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  
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

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  // Bulk selection handlers
  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  }, [filteredProducts, selectedIds.size]);

  const handleSelectOne = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleBulkDelete = async () => {
    if (!canDelete || selectedIds.size === 0) return;
    
    setIsBulkDeleting(true);
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .in("id", Array.from(selectedIds));
      
      if (error) throw error;
      
      toast.success(
        language === "bn" 
          ? `${selectedIds.size}টি পণ্য মুছে ফেলা হয়েছে` 
          : `${selectedIds.size} products deleted`
      );
      
      setSelectedIds(new Set());
      invalidateProducts();
    } catch (error) {
      console.error("Bulk delete failed:", error);
      toast.error(language === "bn" ? "মুছে ফেলতে ব্যর্থ" : "Failed to delete products");
      throw error;
    } finally {
      setIsBulkDeleting(false);
    }
  };

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
      throw error;
    } finally {
      setDeletingId(null);
      setProductToDelete(null);
    }
  };

  const getStatusInfo = (product: Product) => {
    if (!product.is_active) {
      return { label: t.products.inactive, className: "bg-muted text-muted-foreground" };
    }
    if (product.in_stock) {
      return { label: t.products.inStock, className: "bg-success/10 text-success" };
    }
    return { label: t.products.outOfStock, className: "bg-destructive/10 text-destructive" };
  };

  const isAllSelected = filteredProducts.length > 0 && selectedIds.size === filteredProducts.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < filteredProducts.length;

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

          {/* Search and Bulk Actions Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.products.searchProducts}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            
            {/* Bulk Actions */}
            {selectedIds.size > 0 && canDelete && (
              <div className="flex items-center gap-3 bg-muted/50 border border-border rounded-lg px-4 py-2">
                <span className="text-sm font-medium">
                  {language === "bn" 
                    ? `${selectedIds.size}টি নির্বাচিত` 
                    : `${selectedIds.size} selected`}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  className="h-7 px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setBulkDeleteDialogOpen(true)}
                  disabled={isBulkDeleting}
                  className="h-7"
                >
                  {isBulkDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-1" />
                  )}
                  {language === "bn" ? "মুছুন" : "Delete"}
                </Button>
              </div>
            )}
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
                      {canDelete && (
                        <th className="w-12">
                          <Checkbox
                            checked={isAllSelected}
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all"
                            className={cn(isSomeSelected && "data-[state=checked]:bg-primary/50")}
                          />
                        </th>
                      )}
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
                      const isSelected = selectedIds.has(product.id);
                      return (
                        <tr 
                          key={product.id}
                          className={cn(isSelected && "bg-primary/5")}
                        >
                          {canDelete && (
                            <td>
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleSelectOne(product.id)}
                                aria-label={`Select ${product.name}`}
                              />
                            </td>
                          )}
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

        {/* Bulk Delete Confirmation Dialog */}
        <BulkProductDeleteDialog
          open={bulkDeleteDialogOpen}
          onOpenChange={setBulkDeleteDialogOpen}
          selectedCount={selectedIds.size}
          onConfirm={handleBulkDelete}
          translations={{
            title: language === "bn" ? "পণ্য মুছে ফেলুন" : "Delete Products",
            description: language === "bn" 
              ? "আপনি কি নিশ্চিত যে আপনি {count}টি পণ্য মুছে ফেলতে চান? এই ক্রিয়া অপরিবর্তনীয়।" 
              : "Are you sure you want to delete {count} products? This action cannot be undone.",
            typeToConfirm: language === "bn" ? "নিশ্চিত করতে টাইপ করুন:" : "Type to confirm:",
            confirmWord: "DELETE",
            cancel: t.common.cancel,
            delete: language === "bn" ? "মুছুন" : "Delete",
            deleting: language === "bn" ? "মুছে ফেলা হচ্ছে..." : "Deleting...",
          }}
          language={language}
        />
      </TooltipProvider>
    </AdminLayout>
  );
};

export default AdminProducts;
