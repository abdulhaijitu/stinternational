import { useEffect, useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Loader2, GripVertical, Eye, EyeOff, ArrowUp, ArrowDown, Lock, ChevronDown, ChevronRight, FolderOpen, Folder } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ImageUpload from "@/components/admin/ImageUpload";
import IconPicker from "@/components/admin/IconPicker";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { useAdmin } from "@/contexts/AdminContext";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
  parent_id: string | null;
  is_parent: boolean;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
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
    parent_id: "",
    is_parent: true,
  });
  
  const { hasPermission, isSuperAdmin } = useAdmin();
  const { t, language } = useAdminLanguage();
  
  // Permission checks
  const canCreate = isSuperAdmin || hasPermission("categories", "create");
  const canEdit = isSuperAdmin || hasPermission("categories", "update");
  const canDelete = isSuperAdmin || hasPermission("categories", "delete");

  // Helper for text class
  const getTextClass = () => cn(language === "bn" && "font-siliguri");

  // Organize categories into hierarchy
  const { parentCategories, subCategoriesByParent } = useMemo(() => {
    const parents = categories.filter(c => !c.parent_id);
    const subsByParent: Record<string, Category[]> = {};
    
    categories.filter(c => c.parent_id).forEach(sub => {
      if (!subsByParent[sub.parent_id!]) {
        subsByParent[sub.parent_id!] = [];
      }
      subsByParent[sub.parent_id!].push(sub);
    });
    
    // Sort sub-categories by display_order
    Object.keys(subsByParent).forEach(parentId => {
      subsByParent[parentId].sort((a, b) => a.display_order - b.display_order);
    });
    
    return {
      parentCategories: parents.sort((a, b) => a.display_order - b.display_order),
      subCategoriesByParent: subsByParent,
    };
  }, [categories]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Auto-expand all parents on initial load
  useEffect(() => {
    if (parentCategories.length > 0 && expandedParents.size === 0) {
      setExpandedParents(new Set(parentCategories.map(p => p.id)));
    }
  }, [parentCategories]);

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

  const handleOpenDialog = (category?: Category, parentIdForNew?: string) => {
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
        parent_id: category.parent_id || "",
        is_parent: !category.parent_id,
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
        is_active: true,
        parent_id: parentIdForNew || "",
        is_parent: !parentIdForNew,
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

    // If it's a sub-category, parent_id is required
    if (!formData.is_parent && !formData.parent_id) {
      toast.error(t.categories.parentCategoryRequired);
      return;
    }

    setSaving(true);
    try {
      const categoryData = {
        name: formData.name,
        name_bn: formData.name_bn || null,
        slug: formData.slug,
        description: formData.description || null,
        description_bn: formData.description_bn || null,
        parent_group: formData.parent_group || null,
        image_url: formData.image_url || null,
        icon_name: formData.icon_name || null,
        is_active: formData.is_active,
        parent_id: formData.is_parent ? null : formData.parent_id,
        is_parent: formData.is_parent,
      };

      if (editingCategory) {
        const { error } = await supabase
          .from("categories")
          .update(categoryData)
          .eq("id", editingCategory.id);

        if (error) throw error;
        toast.success(t.categories.updateSuccess);
      } else {
        // Calculate display_order based on category type
        let newDisplayOrder = 0;
        if (formData.is_parent) {
          newDisplayOrder = parentCategories.length + 1;
        } else {
          const siblingCount = subCategoriesByParent[formData.parent_id]?.length || 0;
          newDisplayOrder = siblingCount + 1;
        }

        const { error } = await supabase.from("categories").insert([{
          ...categoryData,
          display_order: newDisplayOrder,
        }]);

        if (error) throw error;
        toast.success(t.categories.createSuccess);
      }

      setDialogOpen(false);
      fetchCategories();
    } catch (error: any) {
      console.error("Error saving category:", error);
      if (error.message?.includes("sub-categories")) {
        toast.error(t.categories.deleteErrorHasChildren);
      } else {
        toast.error(error.message || t.categories.saveError);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      toast.error(t.products.noPermission);
      return;
    }
    
    // Check if this parent has sub-categories
    const hasChildren = subCategoriesByParent[id]?.length > 0;
    if (hasChildren) {
      toast.error(t.categories.deleteErrorHasChildren);
      return;
    }
    
    if (!confirm(t.categories.deleteConfirm)) return;

    setDeletingId(id);
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) {
        if (error.message?.includes("sub-categories")) {
          toast.error(t.categories.deleteErrorHasChildren);
        } else {
          throw error;
        }
        return;
      }
      
      // Refetch to ensure UI is in sync with database
      await fetchCategories();
      toast.success(t.categories.deleteSuccess);
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(t.categories.deleteError);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleVisibility = async (category: Category) => {
    if (!canEdit) {
      toast.error(t.products.noPermission);
      return;
    }
    
    setTogglingId(category.id);
    try {
      const { data, error } = await supabase
        .from("categories")
        .update({ is_active: !category.is_active })
        .eq("id", category.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("No data returned from update");
      
      // Refetch to ensure UI is in sync with database
      await fetchCategories();
      toast.success(t.categories.visibilityUpdated);
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast.error(t.categories.saveError);
    } finally {
      setTogglingId(null);
    }
  };

  const handleMoveCategory = async (category: Category, direction: 'up' | 'down') => {
    if (!canEdit) {
      toast.error(t.products.noPermission);
      return;
    }
    
    // Get siblings (either other parents or same-parent subs)
    const siblings = category.parent_id 
      ? subCategoriesByParent[category.parent_id] || []
      : parentCategories;
    
    const currentIndex = siblings.findIndex(c => c.id === category.id);
    
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === siblings.length - 1) return;

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const swapCategory = siblings[swapIndex];

    setMovingId(category.id);
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
    } finally {
      setMovingId(null);
    }
  };

  const toggleParentExpand = (parentId: string) => {
    setExpandedParents(prev => {
      const next = new Set(prev);
      if (next.has(parentId)) {
        next.delete(parentId);
      } else {
        next.add(parentId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedParents(new Set(parentCategories.map(p => p.id)));
  };

  const collapseAll = () => {
    setExpandedParents(new Set());
  };

  // Get category display name based on language
  const getCategoryName = (category: Category) => {
    if (language === "bn" && category.name_bn) return category.name_bn;
    return category.name;
  };

  // Determine if we're showing English or Bangla fields
  const isEnglish = language === "en";

  // Render a single category row
  const renderCategoryRow = (category: Category, isSubCategory: boolean, index: number, siblings: Category[]) => {
    const IconComponent = getCategoryIcon(category.icon_name);
    const subCount = subCategoriesByParent[category.id]?.length || 0;
    const isExpanded = expandedParents.has(category.id);

    return (
      <div 
        key={category.id} 
        className={cn(
          "flex items-center justify-between p-4 border-b border-border last:border-b-0",
          !category.is_active && 'bg-muted/30 opacity-60',
          isSubCategory && 'pl-12 bg-muted/10'
        )}
      >
        <div className="flex items-center gap-4">
          {/* Expand/Collapse for parents */}
          {!isSubCategory && (
            <button
              onClick={() => toggleParentExpand(category.id)}
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          )}
          
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
              disabled={index === 0 || !canEdit || movingId === category.id}
            >
              {movingId === category.id ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <ArrowUp className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleMoveCategory(category, 'down')}
              disabled={index === siblings.length - 1 || !canEdit || movingId === category.id}
            >
              {movingId === category.id ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
            </Button>
          </div>
          
          {/* Icon */}
          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center border border-border">
            <IconComponent className="h-5 w-5 text-muted-foreground" />
          </div>
          
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
              {!isSubCategory && (
                <Badge variant="outline" className="text-xs">
                  {t.categories.parentCategory}
                </Badge>
              )}
              {isSubCategory && (
                <Badge variant="secondary" className="text-xs">
                  {t.categories.subCategory}
                </Badge>
              )}
              {!category.is_active && (
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                  {t.status.inactive}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>/{category.slug}</span>
              {!isSubCategory && subCount > 0 && (
                <span className="text-xs">• {subCount} {t.categories.subCategoriesCount}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Add Sub-Category button for parent categories */}
          {!isSubCategory && canCreate && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenDialog(undefined, category.id)}
                  className="text-xs"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t.categories.addSubCategory}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t.categories.addSubCategory}</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleToggleVisibility(category)}
                disabled={!canEdit || togglingId === category.id}
              >
                {togglingId === category.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : category.is_active ? (
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
              disabled={saving}
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
              onClick={() => handleDelete(category.id)}
              disabled={(!isSubCategory && subCount > 0) || deletingId === category.id}
            >
              {deletingId === category.id ? (
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
      </div>
    );
  };

  return (
    <AdminLayout>
      <TooltipProvider>
        <div className={cn("space-y-6", getTextClass())}>
          <AdminPageHeader 
            title={t.categories.title} 
            subtitle={t.categories.subtitle}
          >
            <Button variant="outline" size="sm" onClick={expandAll}>
              {t.categories.expandAll}
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              {t.categories.collapseAll}
            </Button>
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
                <DialogContent className={cn("max-w-2xl flex flex-col", getTextClass())}>
                  <DialogHeader className="flex-shrink-0">
                    <DialogTitle>
                      {editingCategory ? t.categories.editCategory : t.categories.newCategory}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto space-y-4 py-4 min-h-0">
                    {/* Category Type Selection */}
                    <div className="space-y-1.5">
                      <Label>{t.categories.categoryType}</Label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="categoryType"
                            checked={formData.is_parent}
                            onChange={() => setFormData({ ...formData, is_parent: true, parent_id: "" })}
                            className="w-4 h-4"
                          />
                          <span className="flex items-center gap-1">
                            <FolderOpen className="h-4 w-4" />
                            {t.categories.parentCategory}
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="categoryType"
                            checked={!formData.is_parent}
                            onChange={() => setFormData({ ...formData, is_parent: false })}
                            className="w-4 h-4"
                          />
                          <span className="flex items-center gap-1">
                            <Folder className="h-4 w-4" />
                            {t.categories.subCategory}
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Parent Category Selection (only for sub-categories) */}
                    {!formData.is_parent && (
                      <div className="space-y-1.5">
                        <Label htmlFor="parent_id">
                          {t.categories.selectParentCategory}
                          <span className="text-destructive ml-0.5">*</span>
                        </Label>
                        <Select
                          value={formData.parent_id}
                          onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t.categories.selectParentCategory} />
                          </SelectTrigger>
                          <SelectContent>
                            {parentCategories.map((parent) => (
                              <SelectItem key={parent.id} value={parent.id}>
                                {getCategoryName(parent)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Language-specific name field */}
                    {isEnglish ? (
                      <>
                        <div className="space-y-1.5">
                          <Label htmlFor="name">
                            {t.categories.categoryName}
                            <span className="text-destructive ml-0.5">*</span>
                          </Label>
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
                        <div className="space-y-1.5">
                          <Label htmlFor="slug">
                            {t.categories.slug}
                            <span className="text-destructive ml-0.5">*</span>
                          </Label>
                          <Input
                            id="slug"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="description">
                            {t.categories.description}
                            <span className="text-muted-foreground text-xs font-normal ml-1.5">
                              (Optional)
                            </span>
                          </Label>
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
                        <div className="space-y-1.5">
                          <Label htmlFor="name_bn" className="font-siliguri">
                            {t.categories.categoryName}
                            <span className="text-muted-foreground text-xs font-normal ml-1.5">
                              (ঐচ্ছিক)
                            </span>
                          </Label>
                          <Input
                            id="name_bn"
                            value={formData.name_bn}
                            onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                            placeholder={t.categories.categoryNamePlaceholder}
                            className="font-siliguri"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="description_bn" className="font-siliguri">
                            {t.categories.description}
                            <span className="text-muted-foreground text-xs font-normal ml-1.5">
                              (ঐচ্ছিক)
                            </span>
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
                    
                    <div className="space-y-1.5">
                      <Label>
                        {t.categories.image}
                        <span className="text-muted-foreground text-xs font-normal ml-1.5">
                          ({isEnglish ? "Optional" : "ঐচ্ছিক"})
                        </span>
                      </Label>
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
                  </div>
                  <div className="flex-shrink-0 flex justify-end gap-2 pt-4 border-t border-border">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      {t.common.cancel}
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      {t.common.save}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
          </AdminPageHeader>

          {/* Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>{t.categories.tip}</strong> {t.categories.tipText}
            </p>
          </div>

          {/* Categories List */}
          {loading ? (
            <AdminTableSkeleton columns={5} rows={6} />
          ) : categories.length === 0 ? (
            <AdminEmptyState
              icon={Folder}
              title={t.categories.noCategories}
              description={t.categories.subtitle}
              action={canCreate && (
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t.categories.newCategory}
                </Button>
              )}
            />
          ) : (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="bg-muted/50 p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold">{t.categories.parentCategories}</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  {parentCategories.length} {t.categories.categoryCount}
                </span>
              </div>
              
              <div>
                {parentCategories.map((parent, index) => {
                  const subs = subCategoriesByParent[parent.id] || [];
                  const isExpanded = expandedParents.has(parent.id);
                  
                  return (
                    <div key={parent.id}>
                      {renderCategoryRow(parent, false, index, parentCategories)}
                      
                      {/* Sub-categories */}
                      {isExpanded && subs.length > 0 && (
                        <div className="border-l-4 border-primary/20 ml-4">
                          {subs.map((sub, subIndex) => 
                            renderCategoryRow(sub, true, subIndex, subs)
                          )}
                        </div>
                      )}
                      
                      {/* No sub-categories message */}
                      {isExpanded && subs.length === 0 && (
                        <div className="pl-16 py-3 text-sm text-muted-foreground border-l-4 border-primary/20 ml-4">
                          {t.categories.noSubCategories}
                          {canCreate && (
                            <Button
                              variant="link"
                              size="sm"
                              className="ml-2 p-0 h-auto"
                              onClick={() => handleOpenDialog(undefined, parent.id)}
                            >
                              {t.categories.addSubCategory}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </TooltipProvider>
    </AdminLayout>
  );
};

export default AdminCategories;
