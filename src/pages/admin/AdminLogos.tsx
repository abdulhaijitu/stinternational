import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, GripVertical, Eye, EyeOff, ArrowUp, ArrowDown, Image } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { cn } from "@/lib/utils";

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
  const isBangla = language === "bn";
  const [logos, setLogos] = useState<InstitutionLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingLogo, setEditingLogo] = useState<InstitutionLogo | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    logo_url: "",
    is_active: true,
  });

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

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(t.logos.deleteConfirm.replace("{name}", name))) return;

    try {
      const { error } = await supabase.from("institution_logos").delete().eq("id", id);
      if (error) throw error;
      
      // Refetch to ensure UI is in sync with database
      await fetchLogos();
      toast.success(t.logos.deleteSuccess);
    } catch (error) {
      console.error("Error deleting logo:", error);
      toast.error(t.logos.deleteError);
    }
  };

  const handleToggleActive = async (logo: InstitutionLogo) => {
    try {
      const { data, error } = await supabase
        .from("institution_logos")
        .update({ is_active: !logo.is_active })
        .eq("id", logo.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("No data returned from update");
      
      // Refetch to ensure UI is in sync with database
      await fetchLogos();
      toast.success(!logo.is_active ? t.logos.statusEnabled : t.logos.statusDisabled);
    } catch (error) {
      console.error("Error toggling logo:", error);
      toast.error(t.logos.statusError);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    
    const currentLogo = logos[index];
    const prevLogo = logos[index - 1];
    
    const currentOrder = currentLogo.display_order;
    const prevOrder = prevLogo.display_order;
    
    try {
      const [result1, result2] = await Promise.all([
        supabase.from("institution_logos").update({ display_order: prevOrder }).eq("id", currentLogo.id).select(),
        supabase.from("institution_logos").update({ display_order: currentOrder }).eq("id", prevLogo.id).select(),
      ]);
      
      if (result1.error) throw result1.error;
      if (result2.error) throw result2.error;
      
      // Refetch to ensure UI is in sync with database
      await fetchLogos();
    } catch (error) {
      console.error("Error reordering:", error);
      toast.error(t.logos.reorderError);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === logos.length - 1) return;
    
    const currentLogo = logos[index];
    const nextLogo = logos[index + 1];
    
    const currentOrder = currentLogo.display_order;
    const nextOrder = nextLogo.display_order;
    
    try {
      const [result1, result2] = await Promise.all([
        supabase.from("institution_logos").update({ display_order: nextOrder }).eq("id", currentLogo.id).select(),
        supabase.from("institution_logos").update({ display_order: currentOrder }).eq("id", nextLogo.id).select(),
      ]);
      
      if (result1.error) throw result1.error;
      if (result2.error) throw result2.error;
      
      // Refetch to ensure UI is in sync with database
      await fetchLogos();
    } catch (error) {
      console.error("Error reordering:", error);
      toast.error(t.logos.reorderError);
    }
  };

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
        </div>

        {/* Logos List */}
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
          <div className="admin-table-wrapper divide-y divide-border">
            {logos.map((logo, index) => (
              <div 
                key={logo.id} 
                className={cn(
                  "flex items-center gap-4 p-4",
                  !logo.is_active && "opacity-50 bg-muted/30"
                )}
              >
                {/* Reorder controls */}
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-3 w-3" />
                    <span className="sr-only">Move up</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === logos.length - 1}
                  >
                    <ArrowDown className="h-3 w-3" />
                    <span className="sr-only">Move down</span>
                  </Button>
                </div>

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
                    title={logo.is_active ? t.logos.hidden : t.logos.active}
                  >
                    {logo.is_active ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(logo)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(logo.id, logo.name)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminLogos;