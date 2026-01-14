import { useEffect, useState, lazy, Suspense, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, Save, RotateCcw, Clock, X, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ImageUpload from "@/components/admin/ImageUpload";
import MultiImageUpload from "@/components/admin/MultiImageUpload";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductDraft } from "@/hooks/useProductDraft";
import { ADMIN_PRODUCTS_QUERY_KEY } from "@/hooks/useAdminProducts";

// Lazy load rich text editor for performance
const RichTextEditor = lazy(() => import("@/components/admin/RichTextEditor"));

// Editor loading skeleton
const EditorSkeleton = () => (
  <div className="border border-input rounded-md">
    <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30">
      {[...Array(10)].map((_, i) => (
        <Skeleton key={i} className="h-8 w-8" />
      ))}
    </div>
    <Skeleton className="h-[150px] m-3" />
  </div>
);

const initialFormData = {
  name: "",
  name_bn: "",
  slug: "",
  description: "",
  description_bn: "",
  short_description: "",
  short_description_bn: "",
  price: "",
  compare_price: "",
  sku: "",
  parent_category_id: "",
  category_id: "", // This is the sub-category ID
  image_url: "",
  images: [] as string[],
  in_stock: true,
  stock_quantity: "0",
  is_featured: false,
  is_active: true,
  specifications: "",
  features: "",
};

const AdminProductEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const { t, language } = useAdminLanguage();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [parentCategories, setParentCategories] = useState<{ id: string; name: string; name_bn: string | null }[]>([]);
  const [subCategories, setSubCategories] = useState<{ id: string; name: string; name_bn: string | null; parent_id: string }[]>([]);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  
  // Quick-add sub-category modal state
  const [showAddSubCategoryModal, setShowAddSubCategoryModal] = useState(false);
  const [newSubCategory, setNewSubCategory] = useState({ name: "", name_bn: "", slug: "" });
  const [addingSubCategory, setAddingSubCategory] = useState(false);

  const [formData, setFormData] = useState(initialFormData);

  // Draft management
  const {
    hasDraft,
    draftSavedAt,
    isAutoSaving,
    autoSave,
    loadDraft,
    clearDraft,
    checkForDraft,
  } = useProductDraft(isNew ? null : id || null);

  // Check for draft on mount
  useEffect(() => {
    const draft = checkForDraft();
    if (draft && isNew) {
      setShowDraftPrompt(true);
    }
  }, [checkForDraft, isNew]);

  useEffect(() => {
    fetchCategories();
    if (!isNew && id) {
      fetchProduct(id);
    } else {
      setInitialDataLoaded(true);
    }
  }, [id, isNew]);

  // Auto-save when form data changes
  useEffect(() => {
    if (initialDataLoaded && !loading) {
      autoSave(formData);
    }
  }, [formData, autoSave, initialDataLoaded, loading]);

  const fetchCategories = async () => {
    // Fetch parent categories (where parent_id is null)
    const { data: parents } = await supabase
      .from("categories")
      .select("id, name, name_bn")
      .is("parent_id", null)
      .eq("is_active", true)
      .order("display_order");
    
    // Fetch sub-categories (where parent_id is not null)
    const { data: subs } = await supabase
      .from("categories")
      .select("id, name, name_bn, parent_id")
      .not("parent_id", "is", null)
      .eq("is_active", true)
      .order("display_order");
    
    setParentCategories(parents || []);
    setSubCategories(subs || []);
  };

  const fetchProduct = async (productId: string) => {
    try {
      // First fetch the product
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error) throw error;

      // If product has a category_id, find its parent
      let parentCategoryId = "";
      if (data.category_id) {
        const { data: categoryData } = await supabase
          .from("categories")
          .select("parent_id")
          .eq("id", data.category_id)
          .single();
        
        if (categoryData?.parent_id) {
          parentCategoryId = categoryData.parent_id;
        }
      }

      const loadedData = {
        name: data.name,
        name_bn: data.name_bn || "",
        slug: data.slug,
        description: data.description || "",
        description_bn: data.description_bn || "",
        short_description: data.short_description || "",
        short_description_bn: data.short_description_bn || "",
        price: String(data.price),
        compare_price: data.compare_price ? String(data.compare_price) : "",
        sku: data.sku || "",
        parent_category_id: parentCategoryId,
        category_id: data.category_id || "",
        image_url: data.image_url || "",
        images: data.images || [],
        in_stock: data.in_stock,
        stock_quantity: String(data.stock_quantity),
        is_featured: data.is_featured,
        is_active: data.is_active,
        specifications: data.specifications ? JSON.stringify(data.specifications, null, 2) : "",
        features: data.features ? data.features.join("\n") : "",
      };

      setFormData(loadedData);
      
      // Check for draft after loading product
      const draft = checkForDraft();
      if (draft) {
        setShowDraftPrompt(true);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error(t.products.loadError);
      navigate("/admin/products");
    } finally {
      setLoading(false);
      setInitialDataLoaded(true);
    }
  };

  // Handle draft restoration
  const handleRestoreDraft = useCallback(() => {
    const draftData = loadDraft();
    if (draftData) {
      // Handle backwards compatibility - add parent_category_id if missing
      const restoredData = {
        ...draftData,
        parent_category_id: draftData.parent_category_id || "",
      };
      setFormData(restoredData);
      setShowDraftPrompt(false);
      toast.success(language === "bn" ? "ড্রাফট পুনরুদ্ধার করা হয়েছে" : "Draft restored");
    }
  }, [loadDraft, language]);

  // Handle draft dismissal
  const handleDismissDraft = useCallback(() => {
    clearDraft();
    setShowDraftPrompt(false);
  }, [clearDraft]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleSave = async (e?: React.FormEvent) => {
    // Prevent form default behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Validate required fields - English name and slug are always required
    if (!formData.name.trim()) {
      toast.error(language === "bn" ? "পণ্যের নাম (ইংরেজি) আবশ্যক" : "Product name (English) is required");
      return;
    }
    
    if (!formData.slug.trim()) {
      toast.error(language === "bn" ? "স্লাগ আবশ্যক" : "Slug is required");
      return;
    }
    
    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
      toast.error(language === "bn" ? "সঠিক মূল্য দিন" : "Please enter a valid price");
      return;
    }

    // Validate category selection - sub-category is required
    if (!formData.parent_category_id) {
      toast.error(language === "bn" ? "প্যারেন্ট ক্যাটাগরি নির্বাচন করুন" : "Please select a parent category");
      return;
    }

    if (!formData.category_id) {
      toast.error(language === "bn" ? "সাব-ক্যাটাগরি নির্বাচন করুন" : "Please select a sub-category");
      return;
    }

    // Parse specifications JSON if provided (validate before optimistic update)
    let specifications = {};
    if (formData.specifications.trim()) {
      try {
        specifications = JSON.parse(formData.specifications);
      } catch {
        toast.error(language === "bn" ? "স্পেসিফিকেশন JSON ফরম্যাটে ভুল" : "Invalid JSON format in specifications");
        return;
      }
    }

    // Parse features (one per line)
    const features = formData.features
      ? formData.features.split("\n").map(f => f.trim()).filter(f => f.length > 0)
      : [];

    // Build product data payload with proper typing
    const baseProductData = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      price: parseFloat(formData.price),
      category_id: formData.category_id || null,
      image_url: formData.image_url || (formData.images.length > 0 ? formData.images[0] : null),
      images: formData.images,
      in_stock: formData.in_stock,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      is_featured: formData.is_featured,
      is_active: formData.is_active,
      specifications,
      features,
      sku: formData.sku.trim() || null,
      compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
      // Include all language fields
      name_bn: formData.name_bn.trim() || null,
      description: formData.description.trim() || null,
      description_bn: formData.description_bn.trim() || null,
      short_description: formData.short_description.trim() || null,
      short_description_bn: formData.short_description_bn.trim() || null,
    };

    setSaving(true);
    
    // Show loading toast
    const toastId = toast.loading(
      language === "bn" 
        ? (isNew ? "পণ্য তৈরি হচ্ছে..." : "পণ্য আপডেট হচ্ছে...") 
        : (isNew ? "Creating product..." : "Updating product...")
    );

    console.log("Saving product data:", { isNew, id, productData: baseProductData });

    try {
      if (isNew) {
        // CREATE - Insert new product
        const { data, error } = await supabase
          .from("products")
          .insert([baseProductData])
          .select()
          .single();
        
        if (error) {
          console.error("Create error:", error);
          throw error;
        }
        
        console.log("Product created:", data);
        
        // Invalidate and refetch product queries to ensure fresh data
        await queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_QUERY_KEY });
        await queryClient.invalidateQueries({ queryKey: ["products"] });
        
        // Clear draft after successful save
        clearDraft();
        
        toast.success(
          language === "bn" ? "পণ্য সফলভাবে তৈরি হয়েছে" : "Product created successfully",
          { id: toastId }
        );
        
        // Navigate AFTER successful save and cache invalidation
        navigate("/admin/products");
      } else {
        // UPDATE - Update existing product by ID
        if (!id) {
          throw new Error("Product ID is missing for update");
        }
        
        const { data, error } = await supabase
          .from("products")
          .update(baseProductData)
          .eq("id", id)
          .select()
          .single();
        
        if (error) {
          console.error("Update error:", error);
          throw error;
        }
        
        console.log("Product updated:", data);
        
        // Invalidate and refetch product queries to ensure fresh data
        await queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_QUERY_KEY });
        await queryClient.invalidateQueries({ queryKey: ["products"] });
        
        // Clear draft after successful save
        clearDraft();
        
        toast.success(
          language === "bn" ? "পণ্য সফলভাবে আপডেট হয়েছে" : "Product updated successfully",
          { id: toastId }
        );
        
        // Navigate AFTER successful save and cache invalidation
        navigate("/admin/products");
      }
    } catch (error: any) {
      console.error("Error saving product:", error);
      
      // Show detailed error message
      const errorMessage = error.message || error.details || "Unknown error occurred";
      toast.error(
        language === "bn" 
          ? `সংরক্ষণ ব্যর্থ: ${errorMessage}। অনুগ্রহ করে আবার চেষ্টা করুন।` 
          : `Save failed: ${errorMessage}. Please try again.`,
        { id: toastId }
      );
      // Stay on the editor page so user can retry
    } finally {
      setSaving(false);
    }
  };

  // Helper to get text input class based on language
  const getInputClass = () => cn(language === "bn" && "font-siliguri");

  // Get category display name based on language
  const getCategoryName = (cat: { name: string; name_bn: string | null }) => {
    if (language === "bn" && cat.name_bn) return cat.name_bn;
    return cat.name;
  };

  // Filter sub-categories based on selected parent
  const filteredSubCategories = subCategories.filter(
    (sub) => sub.parent_id === formData.parent_category_id
  );

  // Handle parent category change - reset sub-category when parent changes
  const handleParentCategoryChange = (parentId: string) => {
    setFormData({
      ...formData,
      parent_category_id: parentId,
      category_id: "", // Reset sub-category when parent changes
    });
  };

  // Generate slug from name
  const generateCategorySlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  // Handle quick-add sub-category
  const handleAddSubCategory = async () => {
    if (!newSubCategory.name.trim()) {
      toast.error(language === "bn" ? "ক্যাটাগরির নাম আবশ্যক" : "Category name is required");
      return;
    }

    if (!newSubCategory.slug.trim()) {
      toast.error(language === "bn" ? "স্লাগ আবশ্যক" : "Slug is required");
      return;
    }

    if (!formData.parent_category_id) {
      toast.error(language === "bn" ? "প্যারেন্ট ক্যাটাগরি নির্বাচন করুন" : "Please select a parent category first");
      return;
    }

    setAddingSubCategory(true);

    try {
      const { data, error } = await supabase
        .from("categories")
        .insert([{
          name: newSubCategory.name.trim(),
          name_bn: newSubCategory.name_bn.trim() || null,
          slug: newSubCategory.slug.trim(),
          parent_id: formData.parent_category_id,
          is_parent: false,
          is_active: true,
          display_order: filteredSubCategories.length,
        }])
        .select()
        .single();

      if (error) throw error;

      // Add to local sub-categories list
      setSubCategories(prev => [...prev, {
        id: data.id,
        name: data.name,
        name_bn: data.name_bn,
        parent_id: data.parent_id,
      }]);

      // Auto-select the new sub-category
      setFormData(prev => ({ ...prev, category_id: data.id }));

      // Invalidate category queries
      queryClient.invalidateQueries({ queryKey: ["categories"] });

      toast.success(language === "bn" ? "সাব-ক্যাটাগরি তৈরি হয়েছে" : "Sub-category created");
      
      // Reset modal
      setNewSubCategory({ name: "", name_bn: "", slug: "" });
      setShowAddSubCategoryModal(false);
    } catch (error: any) {
      console.error("Error creating sub-category:", error);
      toast.error(
        language === "bn" 
          ? `সাব-ক্যাটাগরি তৈরি ব্যর্থ: ${error.message}` 
          : `Failed to create sub-category: ${error.message}`
      );
    } finally {
      setAddingSubCategory(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  // Determine which fields to show based on language
  const isEnglish = language === "en";

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Draft Restoration Prompt */}
        {showDraftPrompt && (
          <Alert className="border-primary/50 bg-primary/5">
            <Clock className="h-4 w-4" />
            <AlertTitle className={cn("flex items-center justify-between", getInputClass())}>
              {language === "bn" ? "সংরক্ষিত ড্রাফট পাওয়া গেছে" : "Unsaved Draft Found"}
            </AlertTitle>
            <AlertDescription className={cn("mt-2", getInputClass())}>
              <p className="text-sm mb-3">
                {language === "bn" 
                  ? `আপনার আগের কাজ ${draftSavedAt ? new Date(draftSavedAt).toLocaleString('bn-BD') : ''} এ সংরক্ষিত আছে। পুনরুদ্ধার করতে চান?`
                  : `Your previous work was saved ${draftSavedAt ? new Date(draftSavedAt).toLocaleString() : ''}. Would you like to restore it?`
                }
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleRestoreDraft}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  {language === "bn" ? "পুনরুদ্ধার করুন" : "Restore Draft"}
                </Button>
                <Button size="sm" variant="outline" onClick={handleDismissDraft}>
                  <X className="h-4 w-4 mr-1" />
                  {language === "bn" ? "বাতিল করুন" : "Discard"}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/products">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className={cn("text-2xl font-bold", getInputClass())}>
              {isNew ? t.products.newProduct : t.products.editProduct}
            </h1>
            <p className={cn("text-muted-foreground", getInputClass())}>
              {t.products.fillProductInfo}
            </p>
          </div>
          {/* Auto-save indicator */}
          {(isAutoSaving || draftSavedAt) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {isAutoSaving ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>{language === "bn" ? "সংরক্ষণ করা হচ্ছে..." : "Saving..."}</span>
                </>
              ) : draftSavedAt && (
                <>
                  <Clock className="h-3 w-3" />
                  <span>
                    {language === "bn" ? "ড্রাফট সংরক্ষিত" : "Draft saved"}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          {/* Language-specific Name & Description Fields */}
          <div className="space-y-4">
            {isEnglish ? (
              <>
                {/* English Fields */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t.products.productName} *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          name: e.target.value,
                          slug: isNew ? generateSlug(e.target.value) : formData.slug,
                        });
                      }}
                      placeholder={t.products.productNamePlaceholder}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">{t.products.slug} *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder={t.products.slugPlaceholder}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short_description">{t.products.shortDescription}</Label>
                  <Suspense fallback={<EditorSkeleton />}>
                    <RichTextEditor
                      value={formData.short_description}
                      onChange={(value) => setFormData({ ...formData, short_description: value })}
                      placeholder={t.products.shortDescriptionPlaceholder}
                      minHeight="80px"
                    />
                  </Suspense>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t.products.fullDescription}</Label>
                  <Suspense fallback={<EditorSkeleton />}>
                    <RichTextEditor
                      value={formData.description}
                      onChange={(value) => setFormData({ ...formData, description: value })}
                      placeholder={t.products.fullDescriptionPlaceholder}
                      minHeight="200px"
                    />
                  </Suspense>
                </div>
              </>
            ) : (
              <>
                {/* Bangla Fields */}
                <div className="space-y-2">
                  <Label htmlFor="name_bn" className="font-siliguri">
                    {t.products.productName}
                  </Label>
                  <Input
                    id="name_bn"
                    value={formData.name_bn}
                    onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                    placeholder={t.products.productNamePlaceholder}
                    className="font-siliguri"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short_description_bn" className="font-siliguri">
                    {t.products.shortDescription}
                  </Label>
                  <Suspense fallback={<EditorSkeleton />}>
                    <RichTextEditor
                      value={formData.short_description_bn}
                      onChange={(value) => setFormData({ ...formData, short_description_bn: value })}
                      placeholder={t.products.shortDescriptionPlaceholder}
                      isBangla={true}
                      minHeight="80px"
                    />
                  </Suspense>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description_bn" className="font-siliguri">
                    {t.products.fullDescription}
                  </Label>
                  <Suspense fallback={<EditorSkeleton />}>
                    <RichTextEditor
                      value={formData.description_bn}
                      onChange={(value) => setFormData({ ...formData, description_bn: value })}
                      placeholder={t.products.fullDescriptionPlaceholder}
                      isBangla={true}
                      minHeight="200px"
                    />
                  </Suspense>
                </div>
              </>
            )}
          </div>

          {/* Pricing - Always visible */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className={getInputClass()}>
                {t.products.price} (৳) *
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="compare_price" className={getInputClass()}>
                {t.products.comparePrice} (৳)
              </Label>
              <Input
                id="compare_price"
                type="number"
                value={formData.compare_price}
                onChange={(e) => setFormData({ ...formData, compare_price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku" className={getInputClass()}>
                {t.products.sku}
              </Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>
          </div>

          {/* Category Selection */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Parent Category */}
            <div className="space-y-2">
              <Label htmlFor="parent_category" className={getInputClass()}>
                {t.categories.parentCategory} *
              </Label>
              <Select
                value={formData.parent_category_id}
                onValueChange={handleParentCategoryChange}
              >
                <SelectTrigger className={getInputClass()}>
                  <SelectValue placeholder={t.categories.selectParentCategory} />
                </SelectTrigger>
                <SelectContent>
                  {parentCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className={getInputClass()}>
                      {getCategoryName(cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!formData.parent_category_id && (
                <p className="text-xs text-destructive">
                  {language === "bn" ? "প্যারেন্ট ক্যাটাগরি আবশ্যক" : "Parent category is required"}
                </p>
              )}
            </div>

            {/* Sub-Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className={getInputClass()}>
                {t.categories.subCategory} *
              </Label>
              <div className="flex gap-2">
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  disabled={!formData.parent_category_id}
                >
                  <SelectTrigger className={cn("flex-1", getInputClass())}>
                    <SelectValue 
                      placeholder={
                        !formData.parent_category_id 
                          ? (language === "bn" ? "প্রথমে প্যারেন্ট নির্বাচন করুন" : "Select parent first")
                          : t.products.selectCategory
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSubCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className={getInputClass()}>
                        {getCategoryName(cat)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowAddSubCategoryModal(true)}
                  disabled={!formData.parent_category_id}
                  title={language === "bn" ? "নতুন সাব-ক্যাটাগরি যোগ করুন" : "Add new sub-category"}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.parent_category_id && !formData.category_id && (
                <p className="text-xs text-destructive">
                  {language === "bn" ? "সাব-ক্যাটাগরি আবশ্যক" : "Sub-category is required"}
                </p>
              )}
              {formData.parent_category_id && filteredSubCategories.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  {language === "bn" ? "এই প্যারেন্টে কোনো সাব-ক্যাটাগরি নেই। নতুন তৈরি করতে + বাটনে ক্লিক করুন।" : "No sub-categories under this parent. Click + to create one."}
                </p>
              )}
            </div>
          </div>

          {/* Product Images Gallery */}
          <div className="space-y-2">
            <Label className={getInputClass()}>{t.products.productGallery}</Label>
            <MultiImageUpload
              value={formData.images}
              onChange={(urls) => {
                setFormData({ 
                  ...formData, 
                  images: urls,
                  image_url: formData.image_url || (urls.length > 0 ? urls[0] : "")
                });
              }}
              maxImages={10}
            />
          </div>

          {/* Main Product Image (fallback/override) */}
          <div className="space-y-2">
            <Label className={getInputClass()}>{t.products.mainImage}</Label>
            <p className={cn("text-xs text-muted-foreground mb-2", getInputClass())}>
              {t.products.mainImageHint}
            </p>
            <ImageUpload
              value={formData.image_url}
              onChange={(url) => setFormData({ ...formData, image_url: url })}
            />
            <Input
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder={t.products.orEnterUrl}
              className="mt-2"
            />
          </div>

          {/* Stock */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock_quantity" className={getInputClass()}>
                {t.products.stockQuantity}
              </Label>
              <Input
                id="stock_quantity"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="in_stock"
                checked={formData.in_stock}
                onCheckedChange={(checked) => setFormData({ ...formData, in_stock: checked })}
              />
              <Label htmlFor="in_stock" className={getInputClass()}>
                {t.products.inStock}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
              />
              <Label htmlFor="is_featured" className={getInputClass()}>
                {t.products.featured}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active" className={getInputClass()}>
                {t.products.active}
              </Label>
            </div>
          </div>

          {/* Specifications */}
          <div className="space-y-2">
            <Label htmlFor="specifications" className={getInputClass()}>
              {t.products.specifications} ({t.products.specificationsHint})
            </Label>
            <Textarea
              id="specifications"
              value={formData.specifications}
              onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
              rows={5}
              placeholder={t.products.specificationsPlaceholder}
              className="font-mono text-sm"
            />
          </div>

          {/* Features */}
          <div className="space-y-2">
            <Label htmlFor="features" className={getInputClass()}>
              {t.products.features} ({t.products.featuresHint})
            </Label>
            <Textarea
              id="features"
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              rows={4}
              placeholder={t.products.featuresPlaceholder}
              className={getInputClass()}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-border">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => navigate("/admin/products")}
              className={getInputClass()}
            >
              {t.common.cancel}
            </Button>
            <Button 
              type="button"
              onClick={handleSave} 
              disabled={saving} 
              className={getInputClass()}
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              <Save className="h-4 w-4 mr-2" />
              {t.common.save}
            </Button>
          </div>
        </div>
      </div>

      {/* Quick-Add Sub-Category Modal */}
      <Dialog open={showAddSubCategoryModal} onOpenChange={setShowAddSubCategoryModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className={getInputClass()}>
              {language === "bn" ? "নতুন সাব-ক্যাটাগরি" : "New Sub-Category"}
            </DialogTitle>
            <DialogDescription className={getInputClass()}>
              {language === "bn" 
                ? `"${getCategoryName(parentCategories.find(p => p.id === formData.parent_category_id) || { name: "", name_bn: null })}" এর অধীনে নতুন সাব-ক্যাটাগরি তৈরি করুন`
                : `Create a new sub-category under "${getCategoryName(parentCategories.find(p => p.id === formData.parent_category_id) || { name: "", name_bn: null })}"`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new_cat_name" className={getInputClass()}>
                {language === "bn" ? "নাম (ইংরেজি) *" : "Name (English) *"}
              </Label>
              <Input
                id="new_cat_name"
                value={newSubCategory.name}
                onChange={(e) => setNewSubCategory({
                  ...newSubCategory,
                  name: e.target.value,
                  slug: generateCategorySlug(e.target.value),
                })}
                placeholder={language === "bn" ? "যেমন: Digital Scales" : "e.g., Digital Scales"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new_cat_name_bn" className="font-siliguri">
                {language === "bn" ? "নাম (বাংলা)" : "Name (Bangla)"}
              </Label>
              <Input
                id="new_cat_name_bn"
                value={newSubCategory.name_bn}
                onChange={(e) => setNewSubCategory({
                  ...newSubCategory,
                  name_bn: e.target.value,
                })}
                placeholder={language === "bn" ? "যেমন: ডিজিটাল স্কেল" : "e.g., ডিজিটাল স্কেল"}
                className="font-siliguri"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new_cat_slug" className={getInputClass()}>
                {language === "bn" ? "স্লাগ *" : "Slug *"}
              </Label>
              <Input
                id="new_cat_slug"
                value={newSubCategory.slug}
                onChange={(e) => setNewSubCategory({
                  ...newSubCategory,
                  slug: e.target.value,
                })}
                placeholder="digital-scales"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddSubCategoryModal(false);
                setNewSubCategory({ name: "", name_bn: "", slug: "" });
              }}
              className={getInputClass()}
            >
              {t.common.cancel}
            </Button>
            <Button
              type="button"
              onClick={handleAddSubCategory}
              disabled={addingSubCategory}
              className={getInputClass()}
            >
              {addingSubCategory && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              <Plus className="h-4 w-4 mr-2" />
              {language === "bn" ? "তৈরি করুন" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminProductEditor;
