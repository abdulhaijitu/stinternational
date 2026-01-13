import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, GripVertical, Eye, EyeOff, ArrowUp, ArrowDown, Lock } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import IconPicker from "@/components/admin/IconPicker";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { useAdmin } from "@/contexts/AdminContext";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_group: string | null;
  display_order: number;
  image_url: string | null;
  icon_name: string | null;
  is_active: boolean;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parent_group: "",
    image_url: "",
    icon_name: "",
    is_active: true,
  });
  
  const { hasPermission, isSuperAdmin } = useAdmin();
  
  // Permission checks
  const canCreate = isSuperAdmin || hasPermission("categories", "create");
  const canEdit = isSuperAdmin || hasPermission("categories", "update");
  const canDelete = isSuperAdmin || hasPermission("categories", "delete");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      if (!canEdit) {
        toast.error("আপনার এই কাজের অনুমতি নেই");
        return;
      }
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        parent_group: category.parent_group || "",
        image_url: category.image_url || "",
        icon_name: category.icon_name || "",
        is_active: category.is_active ?? true,
      });
    } else {
      if (!canCreate) {
        toast.error("আপনার এই কাজের অনুমতি নেই");
        return;
      }
      setEditingCategory(null);
      setFormData({ name: "", slug: "", description: "", parent_group: "", image_url: "", icon_name: "", is_active: true });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.error("Name and slug are required");
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from("categories")
          .update({
            name: formData.name,
            slug: formData.slug,
            description: formData.description || null,
            parent_group: formData.parent_group || null,
            image_url: formData.image_url || null,
            icon_name: formData.icon_name || null,
            is_active: formData.is_active,
          })
          .eq("id", editingCategory.id);

        if (error) throw error;
        toast.success("Category updated");
      } else {
        const { error } = await supabase.from("categories").insert([{
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          parent_group: formData.parent_group || null,
          image_url: formData.image_url || null,
          icon_name: formData.icon_name || null,
          is_active: formData.is_active,
          display_order: categories.length + 1,
        }]);

        if (error) throw error;
        toast.success("Category created");
      }

      setDialogOpen(false);
      fetchCategories();
    } catch (error: any) {
      console.error("Error saving category:", error);
      toast.error(error.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!canDelete) {
      toast.error("আপনার এই কাজের অনুমতি নেই");
      return;
    }
    
    if (!confirm(`Delete "${name}"?`)) return;

    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      setCategories(categories.filter((c) => c.id !== id));
      toast.success("Category deleted");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete");
    }
  };

  const handleToggleVisibility = async (category: Category) => {
    if (!canEdit) {
      toast.error("আপনার এই কাজের অনুমতি নেই");
      return;
    }
    
    try {
      const { error } = await supabase
        .from("categories")
        .update({ is_active: !category.is_active })
        .eq("id", category.id);

      if (error) throw error;
      
      setCategories(categories.map(c => 
        c.id === category.id ? { ...c, is_active: !c.is_active } : c
      ));
      toast.success(`Category ${category.is_active ? 'hidden' : 'shown'}`);
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast.error("Failed to update visibility");
    }
  };

  const handleMoveCategory = async (category: Category, direction: 'up' | 'down') => {
    if (!canEdit) {
      toast.error("আপনার এই কাজের অনুমতি নেই");
      return;
    }
    
    const groupCategories = categories.filter(c => c.parent_group === category.parent_group);
    const currentIndex = groupCategories.findIndex(c => c.id === category.id);
    
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === groupCategories.length - 1) return;

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const swapCategory = groupCategories[swapIndex];

    try {
      // Swap display orders
      const updates = [
        { id: category.id, display_order: swapCategory.display_order },
        { id: swapCategory.id, display_order: category.display_order },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from("categories")
          .update({ display_order: update.display_order })
          .eq("id", update.id);
        if (error) throw error;
      }

      await fetchCategories();
      toast.success("Order updated");
    } catch (error) {
      console.error("Error moving category:", error);
      toast.error("Failed to reorder");
    }
  };

  const groupedCategories = categories.reduce((acc, cat) => {
    const group = cat.parent_group || "Other";
    if (!acc[group]) acc[group] = [];
    acc[group].push(cat);
    return acc;
  }, {} as Record<string, Category[]>);

  return (
    <AdminLayout>
      <TooltipProvider>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Categories</h1>
              <p className="text-muted-foreground">Manage product categories, ordering, and visibility</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                {canCreate ? (
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4" />
                    New Category
                  </Button>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button disabled className="opacity-50">
                        <Lock className="h-4 w-4 mr-1" />
                        New Category
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>আপনার এই কাজের অনুমতি নেই</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? "Edit Category" : "New Category"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          name: e.target.value,
                          slug: generateSlug(e.target.value),
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parent_group">Parent Group</Label>
                    <Input
                      id="parent_group"
                      value={formData.parent_group}
                      onChange={(e) => setFormData({ ...formData, parent_group: e.target.value })}
                      placeholder="Laboratory & Education, Measurement & Instruments..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category Image</Label>
                    <ImageUpload
                      value={formData.image_url}
                      onChange={(url) => setFormData({ ...formData, image_url: url })}
                      folder="categories"
                    />
                  </div>
                  <IconPicker
                    value={formData.icon_name}
                    onChange={(iconName) => setFormData({ ...formData, icon_name: iconName })}
                  />
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <Label htmlFor="is_active">Visible to public</Label>
                      <p className="text-xs text-muted-foreground">Toggle to show/hide category</p>
                    </div>
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

          {/* Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Tip:</strong> Use the arrow buttons to reorder categories within each group. 
              Toggle visibility to hide/show categories on the public site without deleting them.
            </p>
          </div>

          {/* Categories List */}
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            </div>
          ) : categories.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
              No categories found
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedCategories).map(([group, cats]) => (
                <div key={group} className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 p-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold">{group}</h3>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {cats.length} categories
                    </span>
                  </div>
                  <div className="divide-y divide-border">
                    {cats.map((category, index) => (
                      <div 
                        key={category.id} 
                        className={`flex items-center justify-between p-4 ${
                          !category.is_active ? 'bg-muted/30 opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Drag Handle Visual */}
                          <div className="text-muted-foreground/50">
                            <GripVertical className="h-5 w-5" />
                          </div>
                          
                          {/* Order Controls */}
                          <div className="flex flex-col gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleMoveCategory(category, 'up')}
                              disabled={index === 0 || !canEdit}
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleMoveCategory(category, 'down')}
                              disabled={index === cats.length - 1 || !canEdit}
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          {/* Icon */}
                          {(() => {
                            const IconComponent = getCategoryIcon(category.icon_name);
                            return (
                              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center border border-border">
                                <IconComponent className="h-5 w-5 text-muted-foreground" />
                              </div>
                            );
                          })()}
                          
                          {/* Image */}
                          {category.image_url ? (
                            <img
                              src={category.image_url}
                              alt={category.name}
                              className="w-12 h-12 object-cover rounded-lg border border-border"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                              <span className="text-muted-foreground text-xs">No img</span>
                            </div>
                          )}
                          
                          {/* Info */}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{category.name}</p>
                              {!category.is_active && (
                                <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded">
                                  Hidden
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">/{category.slug}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Visibility Toggle */}
                          {canEdit ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleVisibility(category)}
                              title={category.is_active ? 'Hide category' : 'Show category'}
                            >
                              {category.is_active ? (
                                <Eye className="h-4 w-4 text-green-600" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
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
                                <p>সম্পাদনার অনুমতি নেই</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          
                          {/* Edit */}
                          {canEdit ? (
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(category)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" disabled className="opacity-50">
                                  <Lock className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>সম্পাদনার অনুমতি নেই</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          
                          {/* Delete */}
                          {canDelete ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(category.id, category.name)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" disabled className="opacity-50">
                                  <Lock className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>মোছার অনুমতি নেই</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </TooltipProvider>
    </AdminLayout>
  );
};

export default AdminCategories;
