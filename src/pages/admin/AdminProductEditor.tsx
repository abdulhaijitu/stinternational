import { useEffect, useState, lazy, Suspense, useCallback, useMemo } from "react";
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
import IconPicker from "@/components/admin/IconPicker";
import SEOFieldsSection from "@/components/admin/SEOFieldsSection";
import { SEOPreviewCard } from "@/components/admin/SEOPreviewCard";
import { SearchableSelect } from "@/components/admin/SearchableSelect";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { useAuth } from "@/contexts/AuthContext";
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
  // SEO fields
  seo_title: "",
  seo_title_bn: "",
  seo_description: "",
  seo_description_bn: "",
  seo_keywords: "",
  seo_keywords_bn: "",
  og_image: "",
};

const AdminProductEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const { t, language } = useAdminLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [parentCategories, setParentCategories] = useState<{ id: string; name: string; name_bn: string | null }[]>([]);
  const [subCategories, setSubCategories] = useState<{ id: string; name: string; name_bn: string | null; parent_id: string }[]>([]);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  
  // Quick-add sub-category modal state
  const [showAddSubCategoryModal, setShowAddSubCategoryModal] = useState(false);
  const [newSubCategory, setNewSubCategory] = useState({ name: "", name_bn: "", slug: "", image_url: "", icon_name: "" });
  const [addingSubCategory, setAddingSubCategory] = useState(false);
  const [subCategoryErrors, setSubCategoryErrors] = useState<{ name?: string; slug?: string }>({});
  const [checkingSubCategorySlug, setCheckingSubCategorySlug] = useState(false);

  // Quick-add parent category modal state
  const [showAddParentCategoryModal, setShowAddParentCategoryModal] = useState(false);
  const [newParentCategory, setNewParentCategory] = useState({ name: "", name_bn: "", slug: "", image_url: "", icon_name: "" });
  const [addingParentCategory, setAddingParentCategory] = useState(false);
  const [parentCategoryErrors, setParentCategoryErrors] = useState<{ name?: string; slug?: string }>({});
  const [checkingParentCategorySlug, setCheckingParentCategorySlug] = useState(false);

  const [formData, setFormData] = useState(initialFormData);
  
  // Form validation state
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    slug?: string;
    price?: string;
    parent_category_id?: string;
    specifications?: string;
  }>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Field validation function
  const validateField = useCallback((name: string, value: string): string | undefined => {
    switch (name) {
      case "name":
        if (!value.trim()) {
          return language === "bn" ? "পণ্যের নাম আবশ্যক" : "Product name is required";
        }
        if (value.trim().length < 2) {
          return language === "bn" ? "নাম কমপক্ষে ২ অক্ষরের হতে হবে" : "Name must be at least 2 characters";
        }
        break;
      case "slug":
        if (!value.trim()) {
          return language === "bn" ? "স্লাগ আবশ্যক" : "Slug is required";
        }
        if (!/^[a-z0-9-]+$/.test(value.trim())) {
          return language === "bn" ? "স্লাগে শুধু ছোট হাতের অক্ষর, সংখ্যা এবং হাইফেন থাকতে পারবে" : "Slug can only contain lowercase letters, numbers, and hyphens";
        }
        break;
      case "price":
        if (!value || isNaN(parseFloat(value))) {
          return language === "bn" ? "মূল্য আবশ্যক" : "Price is required";
        }
        if (parseFloat(value) < 0) {
          return language === "bn" ? "মূল্য ঋণাত্মক হতে পারে না" : "Price cannot be negative";
        }
        break;
      case "parent_category_id":
        if (!value) {
          return language === "bn" ? "প্যারেন্ট ক্যাটাগরি আবশ্যক" : "Parent category is required";
        }
        break;
      case "specifications":
        if (value.trim()) {
          try {
            JSON.parse(value);
          } catch {
            return language === "bn" ? "স্পেসিফিকেশন JSON ফরম্যাটে ভুল" : "Invalid JSON format";
          }
        }
        break;
    }
    return undefined;
  }, [language]);

  // Handle field blur for validation
  const handleBlur = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const value = formData[name as keyof typeof formData];
    const error = validateField(name, typeof value === 'string' ? value : String(value));
    setFormErrors(prev => ({ ...prev, [name]: error }));
  }, [formData, validateField]);

  // Handle field change with real-time validation
  const handleFieldChange = useCallback((name: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Only validate if field has been touched
    if (touched[name] && typeof value === 'string') {
      const error = validateField(name, value);
      setFormErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  // Validate all required fields
  const validateForm = useCallback((): boolean => {
    const errors: typeof formErrors = {};
    const fieldsToValidate = ['name', 'slug', 'price', 'parent_category_id'];
    
    fieldsToValidate.forEach(field => {
      const value = formData[field as keyof typeof formData];
      const error = validateField(field, typeof value === 'string' ? value : String(value));
      if (error) {
        errors[field as keyof typeof errors] = error;
      }
    });

    // Also validate specifications if present
    if (formData.specifications.trim()) {
      const specError = validateField('specifications', formData.specifications);
      if (specError) {
        errors.specifications = specError;
      }
    }

    setFormErrors(errors);
    setTouched({
      name: true,
      slug: true,
      price: true,
      parent_category_id: true,
      specifications: !!formData.specifications.trim(),
    });

    return Object.keys(errors).length === 0;
  }, [formData, validateField]);

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

      // If product has a category_id, find its parent to properly populate both dropdowns
      let parentCategoryId = "";
      let subCategoryId = "";
      
      if (data.category_id) {
        const { data: categoryData } = await supabase
          .from("categories")
          .select("id, parent_id")
          .eq("id", data.category_id)
          .single();
        
        if (categoryData) {
          if (categoryData.parent_id) {
            // This is a sub-category - set both parent and sub-category
            parentCategoryId = categoryData.parent_id;
            subCategoryId = categoryData.id;
          } else {
            // This is a parent category - set only parent category
            parentCategoryId = categoryData.id;
            subCategoryId = "";
          }
        }
      }

      console.log("Fetched product category data:", { 
        productCategoryId: data.category_id, 
        parentCategoryId, 
        subCategoryId 
      });

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
        category_id: subCategoryId,
        image_url: data.image_url || "",
        images: data.images || [],
        in_stock: data.in_stock,
        stock_quantity: String(data.stock_quantity),
        is_featured: data.is_featured,
        is_active: data.is_active,
        specifications: data.specifications ? JSON.stringify(data.specifications, null, 2) : "",
        features: data.features ? data.features.join("\n") : "",
        // SEO fields
        seo_title: data.seo_title || "",
        seo_title_bn: data.seo_title_bn || "",
        seo_description: data.seo_description || "",
        seo_description_bn: data.seo_description_bn || "",
        seo_keywords: data.seo_keywords || "",
        seo_keywords_bn: data.seo_keywords_bn || "",
        og_image: data.og_image || "",
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
      // Handle backwards compatibility - add missing fields
      const restoredData = {
        ...initialFormData,
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

    // Validate all fields using the form validation function
    if (!validateForm()) {
      toast.error(language === "bn" ? "অনুগ্রহ করে সব প্রয়োজনীয় তথ্য সঠিকভাবে পূরণ করুন" : "Please fill in all required fields correctly");
      return;
    }

    // Parse specifications JSON if provided (already validated in validateForm)
    let specifications = {};
    if (formData.specifications.trim()) {
      specifications = JSON.parse(formData.specifications);
    }

    // Parse features (one per line)
    const features = formData.features
      ? formData.features.split("\n").map(f => f.trim()).filter(f => f.length > 0)
      : [];

    // Build product data payload with proper typing
    // Determine the final category_id: use sub-category if selected, otherwise use parent category
    const finalCategoryId = formData.category_id || formData.parent_category_id || null;
    
    console.log("Saving with category:", {
      parent_category_id: formData.parent_category_id,
      category_id: formData.category_id,
      finalCategoryId
    });
    
    const baseProductData = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      price: parseFloat(formData.price),
      category_id: finalCategoryId,
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
      name_bn: formData.name_bn.trim() || null,
      description: formData.description.trim() || null,
      description_bn: formData.description_bn.trim() || null,
      short_description: formData.short_description.trim() || null,
      short_description_bn: formData.short_description_bn.trim() || null,
      // SEO fields
      seo_title: formData.seo_title.trim() || null,
      seo_title_bn: formData.seo_title_bn.trim() || null,
      seo_description: formData.seo_description.trim() || null,
      seo_description_bn: formData.seo_description_bn.trim() || null,
      seo_keywords: formData.seo_keywords.trim() || null,
      seo_keywords_bn: formData.seo_keywords_bn.trim() || null,
      og_image: formData.og_image.trim() || null,
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
        // CREATE - Insert new product with created_by audit field
        const productDataWithCreatedBy = {
          ...baseProductData,
          created_by: user?.id || null,
        };
        
        const { data, error } = await supabase
          .from("products")
          .insert([productDataWithCreatedBy])
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
  const filteredSubCategories = useMemo(() => {
    return subCategories.filter((sub) => sub.parent_id === formData.parent_category_id);
  }, [subCategories, formData.parent_category_id]);

  // Searchable select options for parent categories
  const parentCategoryOptions = useMemo(() => {
    return parentCategories.map((cat) => ({
      value: cat.id,
      label: getCategoryName(cat),
    }));
  }, [parentCategories, language]);

  // Searchable select options for sub-categories
  const subCategoryOptions = useMemo(() => {
    return filteredSubCategories.map((cat) => ({
      value: cat.id,
      label: getCategoryName(cat),
    }));
  }, [filteredSubCategories, language]);

  // Handle parent category change - reset sub-category when parent changes
  const handleParentCategoryChange = (parentId: string) => {
    handleFieldChange("parent_category_id", parentId);
    handleFieldChange("category_id", ""); // Reset sub-category when parent changes
    setTouched(prev => ({ ...prev, parent_category_id: true }));
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
    // Validate fields
    const errors: { name?: string; slug?: string } = {};
    
    if (!newSubCategory.name.trim()) {
      errors.name = language === "bn" ? "ক্যাটাগরির নাম আবশ্যক" : "Category name is required";
    } else if (newSubCategory.name.trim().length > 100) {
      errors.name = language === "bn" ? "নাম ১০০ অক্ষরের বেশি হতে পারবে না" : "Name must be less than 100 characters";
    }

    if (!newSubCategory.slug.trim()) {
      errors.slug = language === "bn" ? "স্লাগ আবশ্যক" : "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(newSubCategory.slug.trim())) {
      errors.slug = language === "bn" ? "স্লাগে শুধু ছোট হাতের অক্ষর, সংখ্যা এবং হাইফেন থাকতে পারবে" : "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    setSubCategoryErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    if (!formData.parent_category_id) {
      toast.error(language === "bn" ? "প্যারেন্ট ক্যাটাগরি নির্বাচন করুন" : "Please select a parent category first");
      return;
    }

    setAddingSubCategory(true);

    try {
      // Check for duplicate slug
      setCheckingSubCategorySlug(true);
      const { data: existingCategory } = await supabase
        .from("categories")
        .select("id, slug")
        .eq("slug", newSubCategory.slug.trim())
        .maybeSingle();
      setCheckingSubCategorySlug(false);

      if (existingCategory) {
        setSubCategoryErrors({ slug: language === "bn" ? "এই স্লাগটি ইতিমধ্যে ব্যবহৃত হয়েছে" : "This slug is already in use" });
        setAddingSubCategory(false);
        return;
      }

      const { data, error } = await supabase
        .from("categories")
        .insert([{
          name: newSubCategory.name.trim(),
          name_bn: newSubCategory.name_bn.trim() || null,
          slug: newSubCategory.slug.trim(),
          image_url: newSubCategory.image_url || null,
          icon_name: newSubCategory.icon_name || null,
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
      
      // Reset modal and errors
      setNewSubCategory({ name: "", name_bn: "", slug: "", image_url: "", icon_name: "" });
      setSubCategoryErrors({});
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

  // Handle quick-add parent category
  const handleAddParentCategory = async () => {
    // Validate fields
    const errors: { name?: string; slug?: string } = {};
    
    if (!newParentCategory.name.trim()) {
      errors.name = language === "bn" ? "ক্যাটাগরির নাম আবশ্যক" : "Category name is required";
    } else if (newParentCategory.name.trim().length > 100) {
      errors.name = language === "bn" ? "নাম ১০০ অক্ষরের বেশি হতে পারবে না" : "Name must be less than 100 characters";
    }

    if (!newParentCategory.slug.trim()) {
      errors.slug = language === "bn" ? "স্লাগ আবশ্যক" : "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(newParentCategory.slug.trim())) {
      errors.slug = language === "bn" ? "স্লাগে শুধু ছোট হাতের অক্ষর, সংখ্যা এবং হাইফেন থাকতে পারবে" : "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    setParentCategoryErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setAddingParentCategory(true);

    try {
      // Check for duplicate slug
      setCheckingParentCategorySlug(true);
      const { data: existingCategory } = await supabase
        .from("categories")
        .select("id, slug")
        .eq("slug", newParentCategory.slug.trim())
        .maybeSingle();
      setCheckingParentCategorySlug(false);

      if (existingCategory) {
        setParentCategoryErrors({ slug: language === "bn" ? "এই স্লাগটি ইতিমধ্যে ব্যবহৃত হয়েছে" : "This slug is already in use" });
        setAddingParentCategory(false);
        return;
      }

      const { data, error } = await supabase
        .from("categories")
        .insert([{
          name: newParentCategory.name.trim(),
          name_bn: newParentCategory.name_bn.trim() || null,
          slug: newParentCategory.slug.trim(),
          image_url: newParentCategory.image_url || null,
          icon_name: newParentCategory.icon_name || null,
          parent_id: null,
          is_parent: true,
          is_active: true,
          display_order: parentCategories.length,
        }])
        .select()
        .single();

      if (error) throw error;

      // Add to local parent categories list
      setParentCategories(prev => [...prev, {
        id: data.id,
        name: data.name,
        name_bn: data.name_bn,
      }]);

      // Auto-select the new parent category
      setFormData(prev => ({ ...prev, parent_category_id: data.id, category_id: "" }));

      // Invalidate category queries
      queryClient.invalidateQueries({ queryKey: ["categories"] });

      toast.success(language === "bn" ? "প্যারেন্ট ক্যাটাগরি তৈরি হয়েছে" : "Parent category created");
      
      // Reset modal and errors
      setNewParentCategory({ name: "", name_bn: "", slug: "", image_url: "", icon_name: "" });
      setParentCategoryErrors({});
      setShowAddParentCategoryModal(false);
    } catch (error: any) {
      console.error("Error creating parent category:", error);
      toast.error(
        language === "bn" 
          ? `প্যারেন্ট ক্যাটাগরি তৈরি ব্যর্থ: ${error.message}` 
          : `Failed to create parent category: ${error.message}`
      );
    } finally {
      setAddingParentCategory(false);
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
                  <div className="space-y-1.5">
                    <Label htmlFor="name">{t.products.productName} <span className="text-destructive">*</span></Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => {
                        const newName = e.target.value;
                        handleFieldChange("name", newName);
                        if (isNew) {
                          handleFieldChange("slug", generateSlug(newName));
                        }
                      }}
                      onBlur={() => handleBlur("name")}
                      placeholder={t.products.productNamePlaceholder}
                      className={cn(formErrors.name && touched.name && "border-destructive focus-visible:ring-destructive")}
                    />
                    {formErrors.name && touched.name && (
                      <p className="text-xs font-medium text-destructive">{formErrors.name}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="slug">{t.products.slug} <span className="text-destructive">*</span></Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleFieldChange("slug", e.target.value)}
                      onBlur={() => handleBlur("slug")}
                      placeholder={t.products.slugPlaceholder}
                      className={cn(formErrors.slug && touched.slug && "border-destructive focus-visible:ring-destructive")}
                    />
                    {formErrors.slug && touched.slug && (
                      <p className="text-xs font-medium text-destructive">{formErrors.slug}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
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

                <div className="space-y-1.5">
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
                <div className="space-y-1.5">
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

                <div className="space-y-1.5">
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

                <div className="space-y-1.5">
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
            <div className="space-y-1.5">
              <Label htmlFor="price" className={getInputClass()}>
                {t.products.price} (৳) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleFieldChange("price", e.target.value)}
                onBlur={() => handleBlur("price")}
                className={cn(formErrors.price && touched.price && "border-destructive focus-visible:ring-destructive")}
              />
              {formErrors.price && touched.price && (
                <p className="text-xs font-medium text-destructive">{formErrors.price}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="compare_price" className={getInputClass()}>
                {t.products.comparePrice} (৳) <span className="text-muted-foreground text-xs font-normal">({language === "bn" ? "ঐচ্ছিক" : "Optional"})</span>
              </Label>
              <Input
                id="compare_price"
                type="number"
                value={formData.compare_price}
                onChange={(e) => handleFieldChange("compare_price", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sku" className={getInputClass()}>
                {t.products.sku} <span className="text-muted-foreground text-xs font-normal">({language === "bn" ? "ঐচ্ছিক" : "Optional"})</span>
              </Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleFieldChange("sku", e.target.value)}
              />
            </div>
          </div>

          {/* Category Selection - Searchable Dropdowns */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Parent Category - Required */}
            <div className="space-y-1.5">
              <Label htmlFor="parent_category" className={getInputClass()}>
                {t.categories.parentCategory} <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <SearchableSelect
                    options={parentCategoryOptions}
                    value={formData.parent_category_id}
                    onValueChange={handleParentCategoryChange}
                    placeholder={t.categories.selectParentCategory}
                    searchPlaceholder={language === "bn" ? "ক্যাটাগরি খুঁজুন..." : "Search categories..."}
                    emptyMessage={language === "bn" ? "কোনো ক্যাটাগরি পাওয়া যায়নি" : "No categories found"}
                    error={!!(formErrors.parent_category_id && touched.parent_category_id)}
                    className={getInputClass()}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowAddParentCategoryModal(true)}
                  title={language === "bn" ? "নতুন প্যারেন্ট ক্যাটাগরি যোগ করুন" : "Add new parent category"}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formErrors.parent_category_id && touched.parent_category_id && (
                <p className="text-xs font-medium text-destructive">{formErrors.parent_category_id}</p>
              )}
              {!formData.parent_category_id && parentCategories.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  {language === "bn" ? "কোনো প্যারেন্ট ক্যাটাগরি নেই। নতুন তৈরি করতে + বাটনে ক্লিক করুন।" : "No parent categories. Click + to create one."}
                </p>
              )}
            </div>

            {/* Sub-Category - Required for proper categorization */}
            <div className="space-y-1.5">
              <Label htmlFor="category" className={getInputClass()}>
                {t.categories.subCategory} <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <SearchableSelect
                    options={subCategoryOptions}
                    value={formData.category_id}
                    onValueChange={(value) => handleFieldChange("category_id", value)}
                    placeholder={
                      !formData.parent_category_id 
                        ? (language === "bn" ? "প্রথমে প্যারেন্ট নির্বাচন করুন" : "Select parent first")
                        : t.products.selectCategory
                    }
                    searchPlaceholder={language === "bn" ? "সাব-ক্যাটাগরি খুঁজুন..." : "Search sub-categories..."}
                    emptyMessage={language === "bn" ? "কোনো সাব-ক্যাটাগরি পাওয়া যায়নি" : "No sub-categories found"}
                    disabled={!formData.parent_category_id}
                    className={getInputClass()}
                  />
                </div>
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
              {formData.parent_category_id && filteredSubCategories.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  {language === "bn" ? "এই প্যারেন্টে কোনো সাব-ক্যাটাগরি নেই। নতুন তৈরি করতে + বাটনে ক্লিক করুন।" : "No sub-categories under this parent. Click + to create one."}
                </p>
              )}
            </div>
          </div>

          {/* Product Images Gallery */}
          <div className="space-y-1.5">
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
          <div className="space-y-1.5">
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
            <div className="space-y-1.5">
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
          <div className="space-y-1.5">
            <Label htmlFor="specifications" className={getInputClass()}>
              {t.products.specifications} <span className="text-muted-foreground text-xs font-normal">({t.products.specificationsHint})</span>
            </Label>
            <Textarea
              id="specifications"
              value={formData.specifications}
              onChange={(e) => handleFieldChange("specifications", e.target.value)}
              onBlur={() => handleBlur("specifications")}
              rows={5}
              placeholder={t.products.specificationsPlaceholder}
              className={cn("font-mono text-sm", formErrors.specifications && touched.specifications && "border-destructive focus-visible:ring-destructive")}
            />
            {formErrors.specifications && touched.specifications && (
              <p className="text-xs font-medium text-destructive">{formErrors.specifications}</p>
            )}
          </div>

          {/* Features */}
          <div className="space-y-1.5">
            <Label htmlFor="features" className={getInputClass()}>
              {t.products.features} <span className="text-muted-foreground text-xs font-normal">({t.products.featuresHint})</span>
            </Label>
            <Textarea
              id="features"
              value={formData.features}
              onChange={(e) => handleFieldChange("features", e.target.value)}
              rows={4}
              placeholder={t.products.featuresPlaceholder}
              className={getInputClass()}
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
            onSeoTitleChange={(value) => handleFieldChange("seo_title", value)}
            onSeoTitleBnChange={(value) => handleFieldChange("seo_title_bn", value)}
            onSeoDescriptionChange={(value) => handleFieldChange("seo_description", value)}
            onSeoDescriptionBnChange={(value) => handleFieldChange("seo_description_bn", value)}
            onSeoKeywordsChange={(value) => handleFieldChange("seo_keywords", value)}
            onSeoKeywordsBnChange={(value) => handleFieldChange("seo_keywords_bn", value)}
            onOgImageChange={(value) => handleFieldChange("og_image", value)}
            language={language}
            entityType="product"
          />

          {/* SEO Preview */}
          <SEOPreviewCard
            title={language === "bn" && formData.seo_title_bn ? formData.seo_title_bn : (formData.seo_title || formData.name)}
            description={language === "bn" && formData.seo_description_bn ? formData.seo_description_bn : (formData.seo_description || formData.short_description)}
            url={`https://stinternational.lovable.app/products/${formData.slug}`}
            language={language}
          />

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
        <DialogContent className="sm:max-w-[425px] flex flex-col">
          <DialogHeader className="flex-shrink-0">
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
          <div className="flex-1 overflow-y-auto space-y-4 py-4 min-h-0">
            <div className="space-y-2">
              <Label htmlFor="new_cat_name" className={cn(getInputClass(), subCategoryErrors.name && "text-destructive")}>
                {language === "bn" ? "নাম (ইংরেজি) *" : "Name (English) *"}
              </Label>
              <Input
                id="new_cat_name"
                value={newSubCategory.name}
                onChange={(e) => {
                  setNewSubCategory({
                    ...newSubCategory,
                    name: e.target.value,
                    slug: generateCategorySlug(e.target.value),
                  });
                  if (subCategoryErrors.name) {
                    setSubCategoryErrors(prev => ({ ...prev, name: undefined }));
                  }
                }}
                placeholder={language === "bn" ? "যেমন: Digital Scales" : "e.g., Digital Scales"}
                className={cn(subCategoryErrors.name && "border-destructive focus-visible:ring-destructive")}
              />
              {subCategoryErrors.name && (
                <p className="text-sm text-destructive">{subCategoryErrors.name}</p>
              )}
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
              <Label htmlFor="new_cat_slug" className={cn(getInputClass(), subCategoryErrors.slug && "text-destructive")}>
                {language === "bn" ? "স্লাগ *" : "Slug *"}
              </Label>
              <div className="relative">
                <Input
                  id="new_cat_slug"
                  value={newSubCategory.slug}
                  onChange={(e) => {
                    setNewSubCategory({
                      ...newSubCategory,
                      slug: e.target.value,
                    });
                    if (subCategoryErrors.slug) {
                      setSubCategoryErrors(prev => ({ ...prev, slug: undefined }));
                    }
                  }}
                  placeholder="digital-scales"
                  className={cn(
                    "pr-10",
                    subCategoryErrors.slug && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {checkingSubCategorySlug && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
              {subCategoryErrors.slug && (
                <p className="text-sm text-destructive">{subCategoryErrors.slug}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className={getInputClass()}>
                {language === "bn" ? "ক্যাটাগরি ছবি" : "Category Image"}
              </Label>
              <ImageUpload
                value={newSubCategory.image_url}
                onChange={(url) => setNewSubCategory({ ...newSubCategory, image_url: url })}
              />
            </div>
            <IconPicker
              value={newSubCategory.icon_name || null}
              onChange={(iconName) => setNewSubCategory({ ...newSubCategory, icon_name: iconName })}
            />
          </div>
          <DialogFooter className="flex-shrink-0 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddSubCategoryModal(false);
                setNewSubCategory({ name: "", name_bn: "", slug: "", image_url: "", icon_name: "" });
                setSubCategoryErrors({});
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

      {/* Quick-Add Parent Category Modal */}
      <Dialog open={showAddParentCategoryModal} onOpenChange={setShowAddParentCategoryModal}>
        <DialogContent className="sm:max-w-[425px] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className={getInputClass()}>
              {language === "bn" ? "নতুন প্যারেন্ট ক্যাটাগরি" : "New Parent Category"}
            </DialogTitle>
            <DialogDescription className={getInputClass()}>
              {language === "bn" 
                ? "নতুন প্যারেন্ট ক্যাটাগরি তৈরি করুন যার অধীনে সাব-ক্যাটাগরি থাকবে"
                : "Create a new parent category to organize sub-categories under"
              }
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 py-4 min-h-0">
            <div className="space-y-2">
              <Label htmlFor="new_parent_name" className={cn(getInputClass(), parentCategoryErrors.name && "text-destructive")}>
                {language === "bn" ? "নাম (ইংরেজি) *" : "Name (English) *"}
              </Label>
              <Input
                id="new_parent_name"
                value={newParentCategory.name}
                onChange={(e) => {
                  setNewParentCategory({
                    ...newParentCategory,
                    name: e.target.value,
                    slug: generateCategorySlug(e.target.value),
                  });
                  if (parentCategoryErrors.name) {
                    setParentCategoryErrors(prev => ({ ...prev, name: undefined }));
                  }
                }}
                placeholder={language === "bn" ? "যেমন: Laboratory Equipment" : "e.g., Laboratory Equipment"}
                className={cn(parentCategoryErrors.name && "border-destructive focus-visible:ring-destructive")}
              />
              {parentCategoryErrors.name && (
                <p className="text-sm text-destructive">{parentCategoryErrors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new_parent_name_bn" className="font-siliguri">
                {language === "bn" ? "নাম (বাংলা)" : "Name (Bangla)"}
              </Label>
              <Input
                id="new_parent_name_bn"
                value={newParentCategory.name_bn}
                onChange={(e) => setNewParentCategory({
                  ...newParentCategory,
                  name_bn: e.target.value,
                })}
                placeholder={language === "bn" ? "যেমন: ল্যাবরেটরি সরঞ্জাম" : "e.g., ল্যাবরেটরি সরঞ্জাম"}
                className="font-siliguri"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new_parent_slug" className={cn(getInputClass(), parentCategoryErrors.slug && "text-destructive")}>
                {language === "bn" ? "স্লাগ *" : "Slug *"}
              </Label>
              <div className="relative">
                <Input
                  id="new_parent_slug"
                  value={newParentCategory.slug}
                  onChange={(e) => {
                    setNewParentCategory({
                      ...newParentCategory,
                      slug: e.target.value,
                    });
                    if (parentCategoryErrors.slug) {
                      setParentCategoryErrors(prev => ({ ...prev, slug: undefined }));
                    }
                  }}
                  placeholder="laboratory-equipment"
                  className={cn(
                    "pr-10",
                    parentCategoryErrors.slug && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {checkingParentCategorySlug && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
              {parentCategoryErrors.slug && (
                <p className="text-sm text-destructive">{parentCategoryErrors.slug}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className={getInputClass()}>
                {language === "bn" ? "ক্যাটাগরি ছবি" : "Category Image"}
              </Label>
              <ImageUpload
                value={newParentCategory.image_url}
                onChange={(url) => setNewParentCategory({ ...newParentCategory, image_url: url })}
              />
            </div>
            <IconPicker
              value={newParentCategory.icon_name || null}
              onChange={(iconName) => setNewParentCategory({ ...newParentCategory, icon_name: iconName })}
            />
          </div>
          <DialogFooter className="flex-shrink-0 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddParentCategoryModal(false);
                setNewParentCategory({ name: "", name_bn: "", slug: "", image_url: "", icon_name: "" });
                setParentCategoryErrors({});
              }}
              className={getInputClass()}
            >
              {t.common.cancel}
            </Button>
            <Button
              type="button"
              onClick={handleAddParentCategory}
              disabled={addingParentCategory}
              className={getInputClass()}
            >
              {addingParentCategory && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
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
