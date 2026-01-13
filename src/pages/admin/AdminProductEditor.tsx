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

interface Category {
  id: string;
  name: string;
}

const AdminProductEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    short_description: "",
    price: "",
    compare_price: "",
    sku: "",
    category_id: "",
    image_url: "",
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
      .select("id, name")
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
        slug: data.slug,
        description: data.description || "",
        short_description: data.short_description || "",
        price: String(data.price),
        compare_price: data.compare_price ? String(data.compare_price) : "",
        sku: data.sku || "",
        category_id: data.category_id || "",
        image_url: data.image_url || "",
        in_stock: data.in_stock,
        stock_quantity: String(data.stock_quantity),
        is_featured: data.is_featured,
        is_active: data.is_active,
        specifications: data.specifications ? JSON.stringify(data.specifications, null, 2) : "",
        features: data.features ? data.features.join("\n") : "",
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("পণ্য লোড করতে সমস্যা হয়েছে");
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
    if (!formData.name || !formData.slug || !formData.price) {
      toast.error("নাম, স্লাগ এবং দাম আবশ্যক");
      return;
    }

    setSaving(true);

    try {
      let specifications = {};
      if (formData.specifications) {
        try {
          specifications = JSON.parse(formData.specifications);
        } catch {
          toast.error("স্পেসিফিকেশন JSON ফরম্যাটে হতে হবে");
          setSaving(false);
          return;
        }
      }

      const features = formData.features
        ? formData.features.split("\n").filter((f) => f.trim())
        : [];

      const productData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        short_description: formData.short_description || null,
        price: parseFloat(formData.price),
        compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
        sku: formData.sku || null,
        category_id: formData.category_id || null,
        image_url: formData.image_url || null,
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
        toast.success("পণ্য তৈরি হয়েছে");
      } else {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", id);
        if (error) throw error;
        toast.success("পণ্য আপডেট হয়েছে");
      }

      navigate("/admin/products");
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast.error(error.message || "সংরক্ষণে সমস্যা হয়েছে");
    } finally {
      setSaving(false);
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
            <h1 className="text-2xl font-bold">
              {isNew ? "নতুন পণ্য" : "পণ্য সম্পাদনা"}
            </h1>
            <p className="text-muted-foreground">পণ্যের তথ্য পূরণ করুন</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">পণ্যের নাম *</Label>
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">স্লাগ *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="short_description">সংক্ষিপ্ত বিবরণ</Label>
            <Input
              id="short_description"
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">বিস্তারিত বিবরণ</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          {/* Pricing */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">দাম (৳) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="compare_price">তুলনামূলক দাম (৳)</Label>
              <Input
                id="compare_price"
                type="number"
                value={formData.compare_price}
                onChange={(e) => setFormData({ ...formData, compare_price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">ক্যাটাগরি</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product Image */}
          <div className="space-y-2">
            <Label>পণ্যের ছবি</Label>
            <ImageUpload
              value={formData.image_url}
              onChange={(url) => setFormData({ ...formData, image_url: url })}
            />
            <p className="text-xs text-muted-foreground">
              অথবা সরাসরি URL দিন:
            </p>
            <Input
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          {/* Stock */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock_quantity">স্টক পরিমাণ</Label>
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
              <Label htmlFor="in_stock">স্টকে আছে</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
              />
              <Label htmlFor="is_featured">ফিচার্ড</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">সক্রিয়</Label>
            </div>
          </div>

          {/* Specifications */}
          <div className="space-y-2">
            <Label htmlFor="specifications">স্পেসিফিকেশন (JSON ফরম্যাট)</Label>
            <Textarea
              id="specifications"
              value={formData.specifications}
              onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
              rows={5}
              placeholder='{"Capacity": "500g", "Accuracy": "0.01g"}'
              className="font-mono text-sm"
            />
          </div>

          {/* Features */}
          <div className="space-y-2">
            <Label htmlFor="features">ফিচার (প্রতি লাইনে একটি)</Label>
            <Textarea
              id="features"
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              rows={4}
              placeholder="High precision measurement&#10;Easy to use&#10;Durable construction"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => navigate("/admin/products")}>
              বাতিল
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              <Save className="h-4 w-4 mr-2" />
              সংরক্ষণ করুন
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProductEditor;
