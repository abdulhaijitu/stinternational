import { useEffect, useState, useMemo, useCallback } from "react";
import { Plus, Pencil, Trash2, Loader2, GripVertical, Eye, EyeOff, Lock, ChevronDown, ChevronRight, FolderOpen, Folder } from "lucide-react";
import {
  DndContext,
  closestCenter,
  DragOverlay,
  DragEndEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ImageUpload from "@/components/admin/ImageUpload";
import IconPicker from "@/components/admin/IconPicker";
import SEOFieldsSection from "@/components/admin/SEOFieldsSection";
import { SEOPreviewCard } from "@/components/admin/SEOPreviewCard";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { useAdmin } from "@/contexts/AdminContext";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { BulkDeleteDialog } from "@/components/admin/BulkDeleteDialog";
import { Checkbox } from "@/components/ui/checkbox";

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

// Sortable category row component
function SortableCategoryRow({
  category,
  isSubCategory,
  index,
  siblings,
  isExpanded,
  onToggleExpand,
  onToggleVisibility,
  onEdit,
  onDelete,
  onAddSubCategory,
  canEdit,
  canDelete,
  canCreate,
  togglingId,
  deletingId,
  saving,
  subCount,
  getCategoryName,
  t,
  language,
  isReordering,
}: {
  category: Category;
  isSubCategory: boolean;
  index: number;
  siblings: Category[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleVisibility: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddSubCategory: () => void;
  canEdit: boolean;
  canDelete: boolean;
  canCreate: boolean;
  togglingId: string | null;
  deletingId: string | null;
  saving: boolean;
  subCount: number;
  getCategoryName: (c: Category) => string;
  t: any;
  language: string;
  isReordering: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id, disabled: !canEdit || isReordering });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    position: isDragging ? "relative" as const : undefined,
  };

  const IconComponent = getCategoryIcon(category.icon_name);

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center justify-between p-4 border-b border-border last:border-b-0 transition-all",
        !category.is_active && 'bg-muted/30 opacity-60',
        isSubCategory && 'pl-12 bg-muted/10',
        isDragging && 'shadow-lg bg-card ring-2 ring-primary/20 opacity-95 rounded-lg'
      )}
    >
      <div className="flex items-center gap-4">
        {/* Expand/Collapse for parents */}
        {!isSubCategory && (
          <button
            onClick={onToggleExpand}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        )}
        
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className={cn(
            "touch-none p-1.5 rounded hover:bg-muted transition-colors",
            "cursor-grab active:cursor-grabbing",
            (!canEdit || isReordering) && "opacity-30 cursor-not-allowed pointer-events-none"
          )}
          disabled={!canEdit || isReordering}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>
        
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
                onClick={onAddSubCategory}
                className="text-xs"
                disabled={isReordering}
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
              onClick={onToggleVisibility}
              disabled={!canEdit || togglingId === category.id || isReordering}
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
            onClick={onEdit}
            disabled={saving || isReordering}
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
            onClick={onDelete}
            disabled={(!isSubCategory && subCount > 0) || deletingId === category.id || isReordering}
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeDragType, setActiveDragType] = useState<'parent' | 'sub' | null>(null);
  const [activeParentId, setActiveParentId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
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
    // SEO fields
    seo_title: "",
    seo_title_bn: "",
    seo_description: "",
    seo_description_bn: "",
    seo_keywords: "",
    seo_keywords_bn: "",
    og_image: "",
  });
  
  const { hasPermission, isSuperAdmin } = useAdmin();
  const { t, language } = useAdminLanguage();
  
  // Permission checks
  const canCreate = isSuperAdmin || hasPermission("categories", "create");
  const canEdit = isSuperAdmin || hasPermission("categories", "update");
  const canDelete = isSuperAdmin || hasPermission("categories", "delete");

  // Helper for text class
  const getTextClass = () => cn(language === "bn" && "font-siliguri");

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Drag and drop handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    if (!canEdit) return;
    
    const draggedId = event.active.id as string;
    setActiveId(draggedId);
    
    // Determine if dragging a parent or sub-category
    const category = categories.find(c => c.id === draggedId);
    if (category) {
      if (category.parent_id) {
        setActiveDragType('sub');
        setActiveParentId(category.parent_id);
      } else {
        setActiveDragType('parent');
        setActiveParentId(null);
      }
    }
  }, [canEdit, categories]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveDragType(null);
    setActiveParentId(null);

    if (!over || active.id === over.id || !canEdit) {
      return;
    }

    const draggedCategory = categories.find(c => c.id === active.id);
    const targetCategory = categories.find(c => c.id === over.id);
    
    if (!draggedCategory || !targetCategory) return;

    // Only allow reordering within the same group (parents with parents, subs with same-parent subs)
    if (draggedCategory.parent_id !== targetCategory.parent_id) {
      toast.error(language === "bn" ? "শুধুমাত্র একই গ্রুপে পুনর্বিন্যাস করা যায়" : "Can only reorder within the same group");
      return;
    }

    setIsReordering(true);
    
    try {
      // Get the correct list of siblings
      const siblings = draggedCategory.parent_id 
        ? subCategoriesByParent[draggedCategory.parent_id] || []
        : parentCategories;
      
      const oldIndex = siblings.findIndex(c => c.id === active.id);
      const newIndex = siblings.findIndex(c => c.id === over.id);
      
      if (oldIndex === -1 || newIndex === -1) return;
      
      const reorderedItems = arrayMove(siblings, oldIndex, newIndex);
      
      // Update display_order for all items
      const updates = reorderedItems.map((item, index) => ({
        id: item.id,
        display_order: index + 1,
      }));
      
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
      console.error("Error reordering:", error);
      toast.error(t.categories.orderError);
    } finally {
      setIsReordering(false);
    }
  }, [categories, parentCategories, subCategoriesByParent, canEdit, language, t.categories.orderUpdated, t.categories.orderError]);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setActiveDragType(null);
    setActiveParentId(null);
  }, []);

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
        // SEO fields
        seo_title: (category as any).seo_title || "",
        seo_title_bn: (category as any).seo_title_bn || "",
        seo_description: (category as any).seo_description || "",
        seo_description_bn: (category as any).seo_description_bn || "",
        seo_keywords: (category as any).seo_keywords || "",
        seo_keywords_bn: (category as any).seo_keywords_bn || "",
        og_image: (category as any).og_image || "",
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
        // SEO fields
        seo_title: "",
        seo_title_bn: "",
        seo_description: "",
        seo_description_bn: "",
        seo_keywords: "",
        seo_keywords_bn: "",
        og_image: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.error(t.categories.slugRequired);
      return;
    }

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
        // SEO fields
        seo_title: formData.seo_title || null,
        seo_title_bn: formData.seo_title_bn || null,
        seo_description: formData.seo_description || null,
        seo_description_bn: formData.seo_description_bn || null,
        seo_keywords: formData.seo_keywords || null,
        seo_keywords_bn: formData.seo_keywords_bn || null,
        og_image: formData.og_image || null,
      };

      if (editingCategory) {
        const { error } = await supabase
          .from("categories")
          .update(categoryData)
          .eq("id", editingCategory.id);

        if (error) throw error;
        toast.success(t.categories.updateSuccess);
      } else {
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

  const openDeleteDialog = (category: Category) => {
    if (!canDelete) {
      toast.error(t.products.noPermission);
      return;
    }
    
    const hasChildren = subCategoriesByParent[category.id]?.length > 0;
    if (hasChildren) {
      toast.error(t.categories.deleteErrorHasChildren);
      return;
    }
    
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    setDeletingId(categoryToDelete.id);
    try {
      const { error } = await supabase.from("categories").delete().eq("id", categoryToDelete.id);
      if (error) {
        if (error.message?.includes("sub-categories")) {
          toast.error(t.categories.deleteErrorHasChildren);
        } else {
          throw error;
        }
        return;
      }
      
      await fetchCategories();
      toast.success(t.categories.deleteSuccess);
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(t.categories.deleteError);
      throw error;
    } finally {
      setDeletingId(null);
      setCategoryToDelete(null);
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
      
      await fetchCategories();
      toast.success(t.categories.visibilityUpdated);
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast.error(t.categories.saveError);
    } finally {
      setTogglingId(null);
    }
  };

  // Bulk selection handlers
  const toggleSelectCategory = (id: string) => {
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
    // Only select sub-categories (ones that can be deleted without children)
    const deletableCategories = categories.filter(c => {
      if (!c.parent_id) {
        // Parent category - only deletable if no sub-categories
        return !subCategoriesByParent[c.id]?.length;
      }
      return true; // Sub-categories are always deletable
    });
    
    if (selectedIds.size === deletableCategories.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(deletableCategories.map(c => c.id)));
    }
  };

  const handleBulkDelete = async () => {
    const idsToDelete = Array.from(selectedIds);
    let successCount = 0;
    let errorCount = 0;
    
    // Filter out parent categories with sub-categories
    const safeToDelete = idsToDelete.filter(id => {
      const category = categories.find(c => c.id === id);
      if (!category) return false;
      if (!category.parent_id && subCategoriesByParent[id]?.length > 0) {
        return false; // Don't delete parents with subs
      }
      return true;
    });
    
    for (const id of safeToDelete) {
      try {
        const { error } = await supabase.from("categories").delete().eq("id", id);
        if (error) throw error;
        successCount++;
      } catch (error) {
        console.error(`Error deleting category ${id}:`, error);
        errorCount++;
      }
    }
    
    await fetchCategories();
    setSelectedIds(new Set());
    
    if (successCount > 0) {
      toast.success(t.categories.bulkDeleteSuccess.replace("{count}", String(successCount)));
    }
    if (errorCount > 0) {
      toast.error(t.categories.bulkDeleteError);
      throw new Error("Some categories failed to delete");
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

  const getCategoryName = (category: Category) => {
    if (language === "bn" && category.name_bn) return category.name_bn;
    return category.name;
  };

  const isEnglish = language === "en";
  const isBangla = language === "bn";

  const activeCategory = activeId ? categories.find(c => c.id === activeId) : null;

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

                    {/* Parent Category Selection */}
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

                    {/* SEO Settings */}
                    <SEOFieldsSection
                      seoTitle={formData.seo_title}
                      seoTitleBn={formData.seo_title_bn}
                      seoDescription={formData.seo_description}
                      seoDescriptionBn={formData.seo_description_bn}
                      seoKeywords={formData.seo_keywords}
                      seoKeywordsBn={formData.seo_keywords_bn}
                      ogImage={formData.og_image}
                      onSeoTitleChange={(value) => setFormData({ ...formData, seo_title: value })}
                      onSeoTitleBnChange={(value) => setFormData({ ...formData, seo_title_bn: value })}
                      onSeoDescriptionChange={(value) => setFormData({ ...formData, seo_description: value })}
                      onSeoDescriptionBnChange={(value) => setFormData({ ...formData, seo_description_bn: value })}
                      onSeoKeywordsChange={(value) => setFormData({ ...formData, seo_keywords: value })}
                      onSeoKeywordsBnChange={(value) => setFormData({ ...formData, seo_keywords_bn: value })}
                      onOgImageChange={(value) => setFormData({ ...formData, og_image: value })}
                      language={language}
                      entityType="category"
                    />

                    {/* SEO Preview */}
                    <SEOPreviewCard
                      title={language === "bn" && formData.seo_title_bn ? formData.seo_title_bn : (formData.seo_title || formData.name)}
                      description={language === "bn" && formData.seo_description_bn ? formData.seo_description_bn : (formData.seo_description || formData.description || '')}
                      url={`https://stinternational.lovable.app/category/${formData.slug}`}
                      language={language}
                    />
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
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
              {isBangla ? "💡 পুনর্বিন্যাস করতে টেনে আনুন এবং ফেলুন" : "💡 Drag and drop to reorder categories"}
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
              
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
                modifiers={[restrictToVerticalAxis]}
              >
                <div>
                  {/* Parent Categories */}
                  <SortableContext items={parentCategories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                    {parentCategories.map((parent, index) => {
                      const subs = subCategoriesByParent[parent.id] || [];
                      const isExpanded = expandedParents.has(parent.id);
                      
                      return (
                        <div key={parent.id}>
                          <SortableCategoryRow
                            category={parent}
                            isSubCategory={false}
                            index={index}
                            siblings={parentCategories}
                            isExpanded={isExpanded}
                            onToggleExpand={() => toggleParentExpand(parent.id)}
                            onToggleVisibility={() => handleToggleVisibility(parent)}
                            onEdit={() => handleOpenDialog(parent)}
                            onDelete={() => openDeleteDialog(parent)}
                            onAddSubCategory={() => handleOpenDialog(undefined, parent.id)}
                            canEdit={canEdit}
                            canDelete={canDelete}
                            canCreate={canCreate}
                            togglingId={togglingId}
                            deletingId={deletingId}
                            saving={saving}
                            subCount={subs.length}
                            getCategoryName={getCategoryName}
                            t={t}
                            language={language}
                            isReordering={isReordering}
                          />
                          
                          {/* Sub-categories with their own sortable context */}
                          {isExpanded && subs.length > 0 && (
                            <div className="border-l-4 border-primary/20 ml-4">
                              <SortableContext items={subs.map(s => s.id)} strategy={verticalListSortingStrategy}>
                                {subs.map((sub, subIndex) => (
                                  <SortableCategoryRow
                                    key={sub.id}
                                    category={sub}
                                    isSubCategory={true}
                                    index={subIndex}
                                    siblings={subs}
                                    isExpanded={false}
                                    onToggleExpand={() => {}}
                                    onToggleVisibility={() => handleToggleVisibility(sub)}
                                    onEdit={() => handleOpenDialog(sub)}
                                    onDelete={() => openDeleteDialog(sub)}
                                    onAddSubCategory={() => {}}
                                    canEdit={canEdit}
                                    canDelete={canDelete}
                                    canCreate={canCreate}
                                    togglingId={togglingId}
                                    deletingId={deletingId}
                                    saving={saving}
                                    subCount={0}
                                    getCategoryName={getCategoryName}
                                    t={t}
                                    language={language}
                                    isReordering={isReordering}
                                  />
                                ))}
                              </SortableContext>
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
                  </SortableContext>
                </div>
                
                <DragOverlay>
                  {activeCategory && (
                    <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg shadow-lg">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center border border-border">
                        {(() => {
                          const IconComponent = getCategoryIcon(activeCategory.icon_name);
                          return <IconComponent className="h-5 w-5 text-muted-foreground" />;
                        })()}
                      </div>
                      <span className="font-medium">{getCategoryName(activeCategory)}</span>
                      {!activeCategory.parent_id && (
                        <Badge variant="outline" className="text-xs">
                          {t.categories.parentCategory}
                        </Badge>
                      )}
                      {activeCategory.parent_id && (
                        <Badge variant="secondary" className="text-xs">
                          {t.categories.subCategory}
                        </Badge>
                      )}
                    </div>
                  )}
                </DragOverlay>
              </DndContext>
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          itemName={categoryToDelete ? (language === "bn" && categoryToDelete.name_bn ? categoryToDelete.name_bn : categoryToDelete.name) : ""}
          itemType={language === "bn" ? "বিভাগ" : "Category"}
          onConfirm={handleDelete}
          translations={{
            cancel: t.common.cancel,
            delete: t.common.delete || "Delete",
            deleting: language === "bn" ? "মুছে ফেলা হচ্ছে..." : "Deleting...",
          }}
          language={language}
        />

        {/* Bulk Delete Dialog */}
        <BulkDeleteDialog
          open={bulkDeleteDialogOpen}
          onOpenChange={setBulkDeleteDialogOpen}
          selectedCount={selectedIds.size}
          itemType={language === "bn" ? "ক্যাটাগরি" : "categories"}
          onConfirm={handleBulkDelete}
          translations={{
            title: t.categories.bulkDeleteTitle,
            description: t.categories.bulkDeleteDescription,
            typeToConfirm: language === "bn" ? "নিশ্চিত করতে টাইপ করুন" : "Type to confirm:",
            confirmWord: "DELETE",
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

export default AdminCategories;
