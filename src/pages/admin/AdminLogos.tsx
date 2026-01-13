import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, GripVertical, Eye, EyeOff } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ImageUpload from "@/components/admin/ImageUpload";

interface InstitutionLogo {
  id: string;
  name: string;
  logo_url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

const AdminLogos = () => {
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
      toast.error("Failed to load logos");
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
      toast.error("Name and logo image are required");
      return;
    }

    setSaving(true);
    try {
      if (editingLogo) {
        const { error } = await supabase
          .from("institution_logos")
          .update({
            name: formData.name,
            logo_url: formData.logo_url,
            is_active: formData.is_active,
          })
          .eq("id", editingLogo.id);

        if (error) throw error;
        toast.success("Logo updated successfully");
      } else {
        const { error } = await supabase.from("institution_logos").insert([{
          name: formData.name,
          logo_url: formData.logo_url,
          is_active: formData.is_active,
          display_order: logos.length + 1,
        }]);

        if (error) throw error;
        toast.success("Logo added successfully");
      }

      setDialogOpen(false);
      fetchLogos();
    } catch (error: any) {
      console.error("Error saving logo:", error);
      toast.error(error.message || "Failed to save logo");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" logo?`)) return;

    try {
      const { error } = await supabase.from("institution_logos").delete().eq("id", id);
      if (error) throw error;
      setLogos(logos.filter((l) => l.id !== id));
      toast.success("Logo deleted successfully");
    } catch (error) {
      console.error("Error deleting logo:", error);
      toast.error("Failed to delete logo");
    }
  };

  const handleToggleActive = async (logo: InstitutionLogo) => {
    try {
      const { error } = await supabase
        .from("institution_logos")
        .update({ is_active: !logo.is_active })
        .eq("id", logo.id);

      if (error) throw error;
      
      setLogos(logos.map(l => 
        l.id === logo.id ? { ...l, is_active: !l.is_active } : l
      ));
      toast.success(`Logo ${!logo.is_active ? "enabled" : "disabled"}`);
    } catch (error) {
      console.error("Error toggling logo:", error);
      toast.error("Failed to update logo status");
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    
    const newLogos = [...logos];
    const currentLogo = newLogos[index];
    const prevLogo = newLogos[index - 1];
    
    // Swap display orders
    const currentOrder = currentLogo.display_order;
    const prevOrder = prevLogo.display_order;
    
    try {
      await Promise.all([
        supabase.from("institution_logos").update({ display_order: prevOrder }).eq("id", currentLogo.id),
        supabase.from("institution_logos").update({ display_order: currentOrder }).eq("id", prevLogo.id),
      ]);
      
      // Swap in array
      [newLogos[index], newLogos[index - 1]] = [newLogos[index - 1], newLogos[index]];
      newLogos[index].display_order = currentOrder;
      newLogos[index - 1].display_order = prevOrder;
      
      setLogos(newLogos);
    } catch (error) {
      console.error("Error reordering:", error);
      toast.error("Failed to reorder logos");
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === logos.length - 1) return;
    
    const newLogos = [...logos];
    const currentLogo = newLogos[index];
    const nextLogo = newLogos[index + 1];
    
    // Swap display orders
    const currentOrder = currentLogo.display_order;
    const nextOrder = nextLogo.display_order;
    
    try {
      await Promise.all([
        supabase.from("institution_logos").update({ display_order: nextOrder }).eq("id", currentLogo.id),
        supabase.from("institution_logos").update({ display_order: currentOrder }).eq("id", nextLogo.id),
      ]);
      
      // Swap in array
      [newLogos[index], newLogos[index + 1]] = [newLogos[index + 1], newLogos[index]];
      newLogos[index].display_order = currentOrder;
      newLogos[index + 1].display_order = nextOrder;
      
      setLogos(newLogos);
    } catch (error) {
      console.error("Error reordering:", error);
      toast.error("Failed to reorder logos");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Institution Logos</h1>
            <p className="text-muted-foreground">Manage client/partner logos displayed on the homepage</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4" />
                Add Logo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingLogo ? "Edit Logo" : "Add New Logo"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Institution Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Dhaka University"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Logo Image *</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Upload a transparent PNG for best results. Recommended size: 200x100px
                  </p>
                  <ImageUpload
                    value={formData.logo_url}
                    onChange={(url) => setFormData({ ...formData, logo_url: url })}
                    folder="institution-logos"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Show on homepage</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Save
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Info Box */}
        <div className="bg-muted/50 border border-border rounded-lg p-4 text-sm text-muted-foreground">
          <p>
            These logos appear in the "Trusted by Institutions & Professional Buyers" section on the homepage.
            Use the arrows to reorder logos. Only active logos will be displayed.
          </p>
        </div>

        {/* Logos List */}
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          </div>
        ) : logos.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
            No institution logos yet. Add your first logo to display on the homepage.
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden divide-y divide-border">
            {logos.map((logo, index) => (
              <div 
                key={logo.id} 
                className={`flex items-center gap-4 p-4 ${!logo.is_active ? "opacity-50 bg-muted/30" : ""}`}
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
                    <GripVertical className="h-3 w-3 rotate-90" />
                    <span className="sr-only">Move up</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === logos.length - 1}
                  >
                    <GripVertical className="h-3 w-3 rotate-90" />
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
                    Order: {logo.display_order} • {logo.is_active ? "Active" : "Hidden"}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleActive(logo)}
                    title={logo.is_active ? "Hide logo" : "Show logo"}
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
