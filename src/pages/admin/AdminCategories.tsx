import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_group: string | null;
  display_order: number;
  image_url: string | null;
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
  });

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
      toast.error("ক্যাটাগরি লোড করতে সমস্যা হয়েছে");
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
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        parent_group: category.parent_group || "",
        image_url: category.image_url || "",
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", slug: "", description: "", parent_group: "", image_url: "" });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.error("নাম এবং স্লাগ আবশ্যক");
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
          })
          .eq("id", editingCategory.id);

        if (error) throw error;
        toast.success("ক্যাটাগরি আপডেট হয়েছে");
      } else {
        const { error } = await supabase.from("categories").insert([{
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          parent_group: formData.parent_group || null,
          image_url: formData.image_url || null,
          display_order: categories.length + 1,
        }]);

        if (error) throw error;
        toast.success("ক্যাটাগরি তৈরি হয়েছে");
      }

      setDialogOpen(false);
      fetchCategories();
    } catch (error: any) {
      console.error("Error saving category:", error);
      toast.error(error.message || "সংরক্ষণে সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" মুছে ফেলতে চান?`)) return;

    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      setCategories(categories.filter((c) => c.id !== id));
      toast.success("ক্যাটাগরি মুছে ফেলা হয়েছে");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("মুছতে সমস্যা হয়েছে");
    }
  };

  const groupedCategories = categories.reduce((acc, cat) => {
    const group = cat.parent_group || "অন্যান্য";
    if (!acc[group]) acc[group] = [];
    acc[group].push(cat);
    return acc;
  }, {} as Record<string, Category[]>);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">ক্যাটাগরি</h1>
            <p className="text-muted-foreground">পণ্যের ক্যাটাগরি ম্যানেজ করুন</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4" />
                নতুন ক্যাটাগরি
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? "ক্যাটাগরি সম্পাদনা" : "নতুন ক্যাটাগরি"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="name">নাম *</Label>
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
                  <Label htmlFor="slug">স্লাগ *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent_group">প্যারেন্ট গ্রুপ</Label>
                  <Input
                    id="parent_group"
                    value={formData.parent_group}
                    onChange={(e) => setFormData({ ...formData, parent_group: e.target.value })}
                    placeholder="Laboratory & Education, Measurement & Instruments..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">বিবরণ</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>ক্যাটাগরির ছবি</Label>
                  <ImageUpload
                    value={formData.image_url}
                    onChange={(url) => setFormData({ ...formData, image_url: url })}
                    folder="categories"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    বাতিল
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    সংরক্ষণ
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Categories List */}
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
            কোনো ক্যাটাগরি নেই
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedCategories).map(([group, cats]) => (
              <div key={group} className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/50 p-4 border-b border-border">
                  <h3 className="font-semibold">{group}</h3>
                </div>
                <div className="divide-y divide-border">
                  {cats.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
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
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-sm text-muted-foreground">/{category.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(category)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(category.id, category.name)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
