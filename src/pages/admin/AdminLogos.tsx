import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff, Image, Lock } from "lucide-react";
import {
  DndContext,
  closestCenter,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ImageUpload from "@/components/admin/ImageUpload";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { useAdmin } from "@/contexts/AdminContext";
import { cn } from "@/lib/utils";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { BulkDeleteDialog } from "@/components/admin/BulkDeleteDialog";
import { SortableRow } from "@/components/admin/SortableRow";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface InstitutionLogo {
  id: string;
  name: string;
  logo_url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

const AdminLogos = () => {
  const { language, t } = useAdminLanguage();
  const { hasPermission, isSuperAdmin } = useAdmin();
  const isBangla = language === "bn";
  const [logos, setLogos] = useState<InstitutionLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingLogo, setEditingLogo] = useState<InstitutionLogo | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [logoToDelete, setLogoToDelete] = useState<InstitutionLogo | null>(null);
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    logo_url: "",
    is_active: true,
  });

  // Permission checks - use "edit" to match DB action names
  const canCreate = isSuperAdmin || hasPermission("logos", "create");
  const canEdit = isSuperAdmin || hasPermission("logos", "edit");
  const canDelete = isSuperAdmin || hasPermission("logos", "delete");
  const canReorder = isSuperAdmin || hasPermission("logos", "reorder");

  useEffect(() => {
    fetchLogos();
  }, []);

  const fetchLogos = async () => {
    try {
      const { data, error } = await supabase
        .from("institution_logos")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setLogos(data || []);
    } catch (error) {
      console.error("Error fetching logos:", error);
      toast.error(t.logos.saveError);
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop reorder handler
  const handleReorder = useCallback(async (reorderedItems: InstitutionLogo[]) => {
    // Optimistically update UI
    const previousLogos = [...logos];
    setLogos(reorderedItems);
    
    try {
      // Update display_order for all items
      const updates = reorderedItems.map((item, index) => ({
        id: item.id,
        display_order: index + 1,
      }));
      
      for (const update of updates) {
        const { error } = await supabase
          .from("institution_logos")
          .update({ display_order: update.display_order })
          .eq("id", update.id);
        if (error) throw error;
      }
      
      // Refetch to ensure sync
      await fetchLogos();
      toast.success(isBangla ? "ক্রম আপডেট হয়েছে" : "Order updated");
    } catch (error) {
      console.error("Error reordering:", error);
      setLogos(previousLogos); // Revert on error
      toast.error(t.logos.reorderError);
    }
  }, [logos, isBangla, t.logos.reorderError]);

  const { sensors, activeId, isReordering, handleDragStart, handleDragEnd, handleDragCancel } = useDragAndDrop({
    items: logos,
    onReorder: handleReorder,
    getId: (logo) => logo.id,
  });

  const activeLogo = activeId ? logos.find(l => l.id === activeId) : null;

  const handleOpenDialog = (logo?: InstitutionLogo) => {
    if (logo) {
      setEditingLogo(logo);
      setFormData({
        name: logo.name,
        logo_url: logo.logo_url,
        is_active: logo.is_active,
      });
    } else {
      setEditingLogo(null);
      setFormData({ name: "", logo_url: "", is_active: true });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.logo_url) {
      toast.error(t.logos.required);
      return;
    }

    setSaving(true);
    try {
      if (editingLogo) {
        const { data, error } = await supabase
          .from("institution_logos")
          .update({
            name: formData.name,
            logo_url: formData.logo_url,
            is_active: formData.is_active,
          })
          .eq("id", editingLogo.id)
          .select()
          .single();

        if (error) throw error;
        if (!data) throw new Error("No data returned from update");
        
        setDialogOpen(false);
        await fetchLogos();
        toast.success(t.logos.updateSuccess);
      } else {
        const { data, error } = await supabase.from("institution_logos").insert([{
          name: formData.name,
          logo_url: formData.logo_url,
          is_active: formData.is_active,
          display_order: logos.length + 1,
        }]).select().single();

        if (error) throw error;
        if (!data) throw new Error("No data returned from insert");
        
        setDialogOpen(false);
        await fetchLogos();
        toast.success(t.logos.saveSuccess);
      }
    } catch (error: any) {
      console.error("Error saving logo:", error);
      toast.error(t.logos.saveError);
    } finally {
      setSaving(false);
    }
  };

  const openDeleteDialog = (logo: InstitutionLogo) => {
    setLogoToDelete(logo);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!logoToDelete) return;
    
    setDeletingId(logoToDelete.id);
    try {
      const { error } = await supabase.from("institution_logos").delete().eq("id", logoToDelete.id);
      if (error) throw error;
      
      await fetchLogos();
      toast.success(t.logos.deleteSuccess);
    } catch (error) {
      console.error("Error deleting logo:", error);
      toast.error(t.logos.deleteError);
      throw error;
    } finally {
      setDeletingId(null);
      setLogoToDelete(null);
    }
  };

  const handleToggleActive = async (logo: InstitutionLogo) => {
    setTogglingId(logo.id);
    try {
      const { data, error } = await supabase
        .from("institution_logos")
        .update({ is_active: !logo.is_active })
        .eq("id", logo.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("No data returned from update");
      
      await fetchLogos();
      toast.success(!logo.is_active ? t.logos.statusEnabled : t.logos.statusDisabled);
    } catch (error) {
      console.error("Error toggling logo:", error);
      toast.error(t.logos.statusError);
    } finally {
      setTogglingId(null);
    }
  };

  // Bulk selection handlers
  const toggleSelectLogo = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === logos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(logos.map(l => l.id)));
    }
  };

  const handleBulkDelete = async () => {
    const idsToDelete = Array.from(selectedIds);
    let successCount = 0;
    let errorCount = 0;
    
    for (const id of idsToDelete) {
      try {
        const { error } = await supabase.from("institution_logos").delete().eq("id", id);
        if (error) throw error;
        successCount++;
      } catch (error) {
        console.error(`Error deleting logo ${id}:`, error);
        errorCount++;
      }
    }
    
    await fetchLogos();
    setSelectedIds(new Set());
    
    if (successCount > 0) {
      toast.success(t.logos.bulkDeleteSuccess.replace("{count}", String(successCount)));
    }
    if (errorCount > 0) {
      toast.error(t.logos.bulkDeleteError);
      throw new Error("Some logos failed to delete");
    }
  };

  const renderLogoRow = (logo: InstitutionLogo) => (
    <>
      {/* Checkbox for selection */}
      <Checkbox
        checked={selectedIds.has(logo.id)}
        onCheckedChange={() => toggleSelectLogo(logo.id)}
        disabled={isReordering}
        className="mr-2"
      />
      
      {/* Logo preview */}
      <div className="w-24 h-16 bg-muted rounded-lg border border-border flex items-center justify-center p-2">
        <img
          src={logo.logo_url}
          alt={logo.name}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{logo.name}</p>
        <p className="text-sm text-muted-foreground">
          {t.logos.order}: {logo.display_order} • {logo.is_active ? t.logos.active : t.logos.hidden}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleToggleActive(logo)}
          disabled={togglingId === logo.id || isReordering}
          title={logo.is_active ? t.logos.hidden : t.logos.active}
        >
          {togglingId === logo.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : logo.is_active ? (
            <Eye className="h-4 w-4 text-green-600" />
          ) : (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleOpenDialog(logo)} 
          disabled={saving || isReordering}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => openDeleteDialog(logo)}
          disabled={deletingId === logo.id || isReordering}
        >
          {deletingId === logo.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 text-destructive" />
          )}
        </Button>
      </div>
    </>
  );

  return (
    <AdminLayout>
      <div className={cn("space-y-6", isBangla && "font-siliguri")}>
        <AdminPageHeader 
          title={t.logos.title} 
          subtitle={t.logos.subtitle}
        >
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4" />
            {t.logos.addLogo}
          </Button>
        </AdminPageHeader>

        {/* Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className={cn("admin-dialog-header", isBangla && "font-siliguri")}>
            <DialogHeader>
              <DialogTitle>
                {editingLogo ? t.logos.editLogo : t.logos.newLogo}
              </DialogTitle>
            </DialogHeader>
            <div className="admin-form-group space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">
                  {t.logos.institutionName}
                  <span className="text-destructive ml-0.5">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t.logos.institutionNamePlaceholder}
                />
              </div>
              <div className="space-y-1.5">
                <Label>
                  {t.logos.logoImage}
                  <span className="text-destructive ml-0.5">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t.logos.logoImageHint}
                </p>
                <ImageUpload
                  value={formData.logo_url}
                  onChange={(url) => setFormData({ ...formData, logo_url: url })}
                  folder="institution-logos"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">{t.logos.showOnHomepage}</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {t.common.save}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Info Box */}
        <div className="bg-muted/50 border border-border rounded-lg p-4 text-sm text-muted-foreground">
          <p>{t.logos.infoBox}</p>
          <p className="mt-2 text-xs">
            {isBangla ? "💡 পুনর্বিন্যাস করতে টেনে আনুন এবং ফেলুন" : "💡 Drag and drop to reorder"}
          </p>
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
          <div className="bg-muted/50 border border-border rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Checkbox
                checked={selectedIds.size === logos.length}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm font-medium">
                {t.logos.selectedCount.replace("{count}", String(selectedIds.size))}
              </span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t.logos.bulkDelete}
            </Button>
          </div>
        )}

        {/* Logos List with Drag and Drop */}
        {loading ? (
          <AdminTableSkeleton columns={4} rows={4} />
        ) : logos.length === 0 ? (
          <AdminEmptyState
            icon={Image}
            title={t.logos.noLogos}
            description={t.logos.subtitle}
            action={
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                {t.logos.addLogo}
              </Button>
            }
          />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext items={logos.map(l => l.id)} strategy={verticalListSortingStrategy}>
              <div className="admin-table-wrapper divide-y divide-border">
                {logos.map((logo) => (
                  <SortableRow
                    key={logo.id}
                    id={logo.id}
                    disabled={isReordering}
                    className={cn(
                      "p-4",
                      !logo.is_active && "opacity-50 bg-muted/30"
                    )}
                  >
                    {renderLogoRow(logo)}
                  </SortableRow>
                ))}
              </div>
            </SortableContext>
            
            <DragOverlay>
              {activeLogo && (
                <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg shadow-lg">
                  {renderLogoRow(activeLogo)}
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          itemName={logoToDelete?.name || ""}
          itemType={isBangla ? "লোগো" : "Logo"}
          onConfirm={handleDelete}
          translations={{
            cancel: t.common.cancel,
            delete: t.common.delete || "Delete",
            deleting: isBangla ? "মুছে ফেলা হচ্ছে..." : "Deleting...",
          }}
          language={language}
        />

        {/* Bulk Delete Dialog */}
        <BulkDeleteDialog
          open={bulkDeleteDialogOpen}
          onOpenChange={setBulkDeleteDialogOpen}
          selectedCount={selectedIds.size}
          itemType={isBangla ? "লোগো" : "logos"}
          onConfirm={handleBulkDelete}
          translations={{
            title: t.logos.bulkDeleteTitle,
            description: t.logos.bulkDeleteDescription,
            typeToConfirm: isBangla ? "নিশ্চিত করতে টাইপ করুন" : "Type to confirm:",
            confirmWord: "DELETE",
            cancel: t.common.cancel,
            delete: t.common.delete || "Delete",
            deleting: isBangla ? "মুছে ফেলা হচ্ছে..." : "Deleting...",
          }}
          language={language}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminLogos;
