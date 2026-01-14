import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, Save } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ImageUpload from "@/components/admin/ImageUpload";
import MultiImageUpload from "@/components/admin/MultiImageUpload";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  name_bn: string | null;
}

const AdminProductEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const { t, language } = useAdminLanguage();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
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
    category_id: "",
    image_url: "",
    images: [] as string[],
    in_stock: true,
    stock_quantity: "0",
    is_featured: false,
    is_active: true,
    specifications: "",
    features: "",
  });

  useEffect(() => {
    fetchCategories();
    if (!isNew && id) {
      fetchProduct(id);
    }
  }, [id, isNew]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("id, name, name_bn")
      .order("name");
    setCategories(data || []);
  };

  const fetchProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error) throw error;

      setFormData({
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
        category_id: data.category_id || "",
        image_url: data.image_url || "",
        images: data.images || [],
        in_stock: data.in_stock,
        stock_quantity: String(data.stock_quantity),
        is_featured: data.is_featured,
        is_active: data.is_active,
        specifications: data.specifications ? JSON.stringify(data.specifications, null, 2) : "",
        features: data.features ? data.features.join("\n") : "",
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error(t.products.loadError);
      navigate("/admin/products");
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

  const handleSave = async () => {
    // Validate based on language - English name is always required
    if (!formData.name || !formData.slug || !formData.price) {
      toast.error(t.products.required);
      return;
    }

    setSaving(true);

    try {
      let specifications = {};
      if (formData.specifications) {
        try {
          specifications = JSON.parse(formData.specifications);
        } catch {
          toast.error(t.products.specJsonError);
          setSaving(false);
          return;
        }
      }

      const features = formData.features
        ? formData.features.split("\n").filter((f) => f.trim())
        : [];

      const productData = {
        name: formData.name,
        name_bn: formData.name_bn || null,
        slug: formData.slug,
        description: formData.description || null,
        description_bn: formData.description_bn || null,
        short_description: formData.short_description || null,
        short_description_bn: formData.short_description_bn || null,
        price: parseFloat(formData.price),
        compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
        sku: formData.sku || null,
        category_id: formData.category_id || null,
        image_url: formData.image_url || (formData.images.length > 0 ? formData.images[0] : null),
        images: formData.images,
        in_stock: formData.in_stock,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        specifications,
        features,
      };

      if (isNew) {
        const { error } = await supabase.from("products").insert([productData]);
        if (error) throw error;
        toast.success(t.products.createSuccess);
      } else {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", id);
        if (error) throw error;
        toast.success(t.products.updateSuccess);
      }

      navigate("/admin/products");
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast.error(error.message || t.products.saveError);
    } finally {
      setSaving(false);
    }
  };

  // Helper to get text input class based on language
  const getInputClass = () => cn(language === "bn" && "font-siliguri");

  // Get category display name based on language
  const getCategoryName = (cat: Category) => {
    if (language === "bn" && cat.name_bn) return cat.name_bn;
    return cat.name;
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/products">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className={cn("text-2xl font-bold", getInputClass())}>
              {isNew ? t.products.newProduct : t.products.editProduct}
            </h1>
            <p className={cn("text-muted-foreground", getInputClass())}>
              {t.products.fillProductInfo}
            </p>
          </div>
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
                  <Input
                    id="short_description"
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    placeholder={t.products.shortDescriptionPlaceholder}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t.products.fullDescription}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    placeholder={t.products.fullDescriptionPlaceholder}
                  />
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
                  <Input
                    id="short_description_bn"
                    value={formData.short_description_bn}
                    onChange={(e) => setFormData({ ...formData, short_description_bn: e.target.value })}
                    placeholder={t.products.shortDescriptionPlaceholder}
                    className="font-siliguri"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description_bn" className="font-siliguri">
                    {t.products.fullDescription}
                  </Label>
                  <Textarea
                    id="description_bn"
                    value={formData.description_bn}
                    onChange={(e) => setFormData({ ...formData, description_bn: e.target.value })}
                    rows={4}
                    placeholder={t.products.fullDescriptionPlaceholder}
                    className="font-siliguri"
                  />
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

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className={getInputClass()}>
              {t.products.category}
            </Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
            >
              <SelectTrigger className={getInputClass()}>
                <SelectValue placeholder={t.products.selectCategory} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className={getInputClass()}>
                    {getCategoryName(cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              variant="outline" 
              onClick={() => navigate("/admin/products")}
              className={getInputClass()}
            >
              {t.common.cancel}
            </Button>
            <Button onClick={handleSave} disabled={saving} className={getInputClass()}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              <Save className="h-4 w-4 mr-2" />
              {t.common.save}
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProductEditor;
