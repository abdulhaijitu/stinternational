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
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  name_bn: string | null;
  slug: string;
  description: string | null;
  description_bn: string | null;
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
    name_bn: "",
    slug: "",
    description: "",
    description_bn: "",
    parent_group: "",
    image_url: "",
    icon_name: "",
    is_active: true,
  });
  
  const { hasPermission, isSuperAdmin } = useAdmin();
  const { t, language } = useAdminLanguage();
  
  // Permission checks
  const canCreate = isSuperAdmin || hasPermission("categories", "create");
  const canEdit = isSuperAdmin || hasPermission("categories", "update");
  const canDelete = isSuperAdmin || hasPermission("categories", "delete");

  // Helper for text class
  const getTextClass = () => cn(language === "bn" && "font-siliguri");

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
      toast.error(t.products.loadError);
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
        toast.error(t.products.noPermission);
        return;
      }
      setEditingCategory(category);
      setFormData({
        name: category.name,
        name_bn: category.name_bn || "",
        slug: category.slug,
        description: category.description || "",
        description_bn: category.description_bn || "",
        parent_group: category.parent_group || "",
        image_url: category.image_url || "",
        icon_name: category.icon_name || "",
        is_active: category.is_active ?? true,
      });
    } else {
      if (!canCreate) {
        toast.error(t.products.noPermission);
        return;
      }
      setEditingCategory(null);
      setFormData({ 
        name: "", 
        name_bn: "", 
        slug: "", 
        description: "", 
        description_bn: "", 
        parent_group: "", 
        image_url: "", 
        icon_name: "", 
        is_active: true 
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    // English name is always required for slug generation
    if (!formData.name || !formData.slug) {
      toast.error(t.categories.slugRequired);
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from("categories")
          .update({
            name: formData.name,
            name_bn: formData.name_bn || null,
            slug: formData.slug,
            description: formData.description || null,
            description_bn: formData.description_bn || null,
            parent_group: formData.parent_group || null,
            image_url: formData.image_url || null,
            icon_name: formData.icon_name || null,
            is_active: formData.is_active,
          })
          .eq("id", editingCategory.id);

        if (error) throw error;
        toast.success(t.categories.updateSuccess);
      } else {
        const { error } = await supabase.from("categories").insert([{
          name: formData.name,
          name_bn: formData.name_bn || null,
          slug: formData.slug,
          description: formData.description || null,
          description_bn: formData.description_bn || null,
          parent_group: formData.parent_group || null,
          image_url: formData.image_url || null,
          icon_name: formData.icon_name || null,
          is_active: formData.is_active,
          display_order: categories.length + 1,
        }]);

        if (error) throw error;
        toast.success(t.categories.createSuccess);
      }

      setDialogOpen(false);
      fetchCategories();
    } catch (error: any) {
      console.error("Error saving category:", error);
      toast.error(error.message || t.categories.saveError);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!canDelete) {
      toast.error(t.products.noPermission);
      return;
    }
    
    if (!confirm(`${t.categories.deleteConfirm}`)) return;

    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      setCategories(categories.filter((c) => c.id !== id));
      toast.success(t.categories.deleteSuccess);
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(t.categories.deleteError);
    }
  };

  const handleToggleVisibility = async (category: Category) => {
    if (!canEdit) {
      toast.error(t.products.noPermission);
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
      toast.success(`${t.categories.visibilityUpdated}`);
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast.error(t.categories.saveError);
    }
  };

  const handleMoveCategory = async (category: Category, direction: 'up' | 'down') => {
    if (!canEdit) {
      toast.error(t.products.noPermission);
      return;
    }
    
    const groupCategories = categories.filter(c => c.parent_group === category.parent_group);
    const currentIndex = groupCategories.findIndex(c => c.id === category.id);
    
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === groupCategories.length - 1) return;

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const swapCategory = groupCategories[swapIndex];

    try {
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
      toast.success(t.categories.orderUpdated);
    } catch (error) {
      console.error("Error moving category:", error);
      toast.error(t.categories.orderError);
    }
  };

  const groupedCategories = categories.reduce((acc, cat) => {
    const group = cat.parent_group || "Other";
    if (!acc[group]) acc[group] = [];
    acc[group].push(cat);
    return acc;
  }, {} as Record<string, Category[]>);

  // Get category display name based on language
  const getCategoryName = (category: Category) => {
    if (language === "bn" && category.name_bn) return category.name_bn;
    return category.name;
  };

  // Determine if we're showing English or Bangla fields
  const isEnglish = language === "en";

  return (
    <AdminLayout>
      <TooltipProvider>
        <div className={cn("space-y-6", getTextClass())}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{t.categories.title}</h1>
              <p className="text-muted-foreground">{t.categories.subtitle}</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                {canCreate ? (
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4" />
                    {t.categories.newCategory}
                  </Button>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button disabled className="opacity-50">
                        <Lock className="h-4 w-4 mr-1" />
                        {t.categories.newCategory}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t.products.noPermission}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </DialogTrigger>
              <DialogContent className={getTextClass()}>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? t.categories.editCategory : t.categories.newCategory}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                  {/* Language-specific name field */}
                  {isEnglish ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name">{t.categories.categoryName} *</Label>
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
                          placeholder={t.categories.categoryNamePlaceholder}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="slug">{t.categories.slug} *</Label>
                        <Input
                          id="slug"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">{t.categories.description}</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name_bn" className="font-siliguri">
                          {t.categories.categoryName}
                        </Label>
                        <Input
                          id="name_bn"
                          value={formData.name_bn}
                          onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                          placeholder={t.categories.categoryNamePlaceholder}
                          className="font-siliguri"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description_bn" className="font-siliguri">
                          {t.categories.description}
                        </Label>
                        <Textarea
                          id="description_bn"
                          value={formData.description_bn}
                          onChange={(e) => setFormData({ ...formData, description_bn: e.target.value })}
                          rows={3}
                          className="font-siliguri"
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="parent_group">{t.categories.parentGroup}</Label>
                    <Input
                      id="parent_group"
                      value={formData.parent_group}
                      onChange={(e) => setFormData({ ...formData, parent_group: e.target.value })}
                      placeholder={t.categories.parentGroupPlaceholder}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{t.categories.image}</Label>
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
                      <Label htmlFor="is_active">{t.categories.visibleToPublic}</Label>
                      <p className="text-xs text-muted-foreground">{t.categories.visibilityHint}</p>
                    </div>
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      {t.common.cancel}
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      {t.common.save}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>{t.categories.tip}</strong> {t.categories.tipText}
            </p>
          </div>

          {/* Categories List */}
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            </div>
          ) : categories.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
              {t.categories.noCategories}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedCategories).map(([group, cats]) => (
                <div key={group} className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 p-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold">{group}</h3>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {cats.length} {t.categories.categoryCount}
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
                              alt={getCategoryName(category)}
                              className="w-12 h-12 object-cover rounded-lg border border-border"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                              <span className="text-muted-foreground text-xs">{t.categories.noImage}</span>
                            </div>
                          )}
                          
                          {/* Info */}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{getCategoryName(category)}</span>
                              {!category.is_active && (
                                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                                  {t.status.inactive}
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">/{category.slug}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleVisibility(category)}
                                disabled={!canEdit}
                              >
                                {category.is_active ? (
                                  <Eye className="h-4 w-4" />
                                ) : (
                                  <EyeOff className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{category.is_active ? t.categories.hidden : t.categories.shown}</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          {canEdit ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(category)}
                            >
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
                                <p>{t.products.noEditPermission}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          
                          {canDelete ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(category.id, getCategoryName(category))}
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
                                <p>{t.products.noDeletePermission}</p>
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
