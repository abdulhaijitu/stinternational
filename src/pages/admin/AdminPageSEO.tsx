import { useEffect, useState } from "react";
import { Pencil, Loader2, Search, Globe, Save, X } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ImageUpload from "@/components/admin/ImageUpload";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PageSEO {
  id: string;
  page_slug: string;
  page_name: string;
  seo_title: string | null;
  seo_title_bn: string | null;
  seo_description: string | null;
  seo_description_bn: string | null;
  seo_keywords: string | null;
  seo_keywords_bn: string | null;
  og_image: string | null;
  is_active: boolean;
  updated_at: string;
}

const AdminPageSEO = () => {
  const [pages, setPages] = useState<PageSEO[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPage, setEditingPage] = useState<PageSEO | null>(null);
  const { t, language } = useAdminLanguage();

  const [formData, setFormData] = useState({
    seo_title: "",
    seo_title_bn: "",
    seo_description: "",
    seo_description_bn: "",
    seo_keywords: "",
    seo_keywords_bn: "",
    og_image: "",
  });

  const getTextClass = () => cn(language === "bn" && "font-siliguri");

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from("page_seo")
        .select("*")
        .order("page_name");

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error("Error fetching pages:", error);
      toast.error(language === "bn" ? "পেজ লোড করতে সমস্যা হয়েছে" : "Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (page: PageSEO) => {
    setEditingPage(page);
    setFormData({
      seo_title: page.seo_title || "",
      seo_title_bn: page.seo_title_bn || "",
      seo_description: page.seo_description || "",
      seo_description_bn: page.seo_description_bn || "",
      seo_keywords: page.seo_keywords || "",
      seo_keywords_bn: page.seo_keywords_bn || "",
      og_image: page.og_image || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingPage) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("page_seo")
        .update({
          seo_title: formData.seo_title || null,
          seo_title_bn: formData.seo_title_bn || null,
          seo_description: formData.seo_description || null,
          seo_description_bn: formData.seo_description_bn || null,
          seo_keywords: formData.seo_keywords || null,
          seo_keywords_bn: formData.seo_keywords_bn || null,
          og_image: formData.og_image || null,
        })
        .eq("id", editingPage.id);

      if (error) throw error;

      toast.success(language === "bn" ? "SEO আপডেট হয়েছে" : "SEO updated successfully");
      setDialogOpen(false);
      fetchPages();
    } catch (error) {
      console.error("Error saving SEO:", error);
      toast.error(language === "bn" ? "সংরক্ষণ করতে সমস্যা হয়েছে" : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const getTitleCharColor = (length: number) => {
    if (length === 0) return "text-muted-foreground";
    if (length <= 60) return "text-green-600";
    if (length <= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getDescCharColor = (length: number) => {
    if (length === 0) return "text-muted-foreground";
    if (length <= 160) return "text-green-600";
    if (length <= 180) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <AdminLayout>
      <div className={cn("space-y-6", getTextClass())}>
        <AdminPageHeader
          title={language === "bn" ? "পেজ SEO" : "Page SEO"}
          subtitle={language === "bn" ? "স্ট্যাটিক পেজের SEO সেটিংস পরিচালনা করুন" : "Manage SEO settings for static pages"}
        />

        {loading ? (
          <AdminTableSkeleton columns={4} rows={6} />
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={getTextClass()}>
                    {language === "bn" ? "পেজ" : "Page"}
                  </TableHead>
                  <TableHead className={getTextClass()}>
                    {language === "bn" ? "SEO শিরোনাম" : "SEO Title"}
                  </TableHead>
                  <TableHead className={getTextClass()}>
                    {language === "bn" ? "স্থিতি" : "Status"}
                  </TableHead>
                  <TableHead className="text-right">
                    {language === "bn" ? "অ্যাকশন" : "Actions"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{page.page_name}</span>
                        <span className="block text-xs text-muted-foreground">/{page.page_slug}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={cn("text-sm", !page.seo_title && "text-muted-foreground italic")}>
                        {page.seo_title || (language === "bn" ? "সেট করা হয়নি" : "Not set")}
                      </span>
                    </TableCell>
                    <TableCell>
                      {page.seo_title && page.seo_description ? (
                        <Badge variant="default" className="bg-green-600">
                          {language === "bn" ? "সম্পূর্ণ" : "Complete"}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          {language === "bn" ? "অসম্পূর্ণ" : "Incomplete"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(page)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className={cn("max-w-2xl max-h-[90vh] overflow-y-auto", getTextClass())}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                {editingPage?.page_name} - SEO
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* SEO Title */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{language === "bn" ? "SEO শিরোনাম (ইংরেজি)" : "SEO Title (English)"}</Label>
                  <Input
                    value={formData.seo_title}
                    onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                    maxLength={100}
                  />
                  <span className={cn("text-xs", getTitleCharColor(formData.seo_title.length))}>
                    {formData.seo_title.length}/60 {language === "bn" ? "অক্ষর" : "characters"}
                  </span>
                </div>
                <div className="space-y-2">
                  <Label className="font-siliguri">{language === "bn" ? "SEO শিরোনাম (বাংলা)" : "SEO Title (Bangla)"}</Label>
                  <Input
                    value={formData.seo_title_bn}
                    onChange={(e) => setFormData({ ...formData, seo_title_bn: e.target.value })}
                    maxLength={100}
                    className="font-siliguri"
                  />
                  <span className={cn("text-xs", getTitleCharColor(formData.seo_title_bn.length))}>
                    {formData.seo_title_bn.length}/60 {language === "bn" ? "অক্ষর" : "characters"}
                  </span>
                </div>
              </div>

              {/* Meta Description */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{language === "bn" ? "মেটা বর্ণনা (ইংরেজি)" : "Meta Description (English)"}</Label>
                  <Textarea
                    value={formData.seo_description}
                    onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                    maxLength={200}
                    rows={3}
                  />
                  <span className={cn("text-xs", getDescCharColor(formData.seo_description.length))}>
                    {formData.seo_description.length}/160 {language === "bn" ? "অক্ষর" : "characters"}
                  </span>
                </div>
                <div className="space-y-2">
                  <Label className="font-siliguri">{language === "bn" ? "মেটা বর্ণনা (বাংলা)" : "Meta Description (Bangla)"}</Label>
                  <Textarea
                    value={formData.seo_description_bn}
                    onChange={(e) => setFormData({ ...formData, seo_description_bn: e.target.value })}
                    maxLength={200}
                    rows={3}
                    className="font-siliguri"
                  />
                  <span className={cn("text-xs", getDescCharColor(formData.seo_description_bn.length))}>
                    {formData.seo_description_bn.length}/160 {language === "bn" ? "অক্ষর" : "characters"}
                  </span>
                </div>
              </div>

              {/* Keywords */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{language === "bn" ? "কীওয়ার্ড (ইংরেজি)" : "Keywords (English)"}</Label>
                  <Input
                    value={formData.seo_keywords}
                    onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
                    placeholder={language === "bn" ? "কমা দিয়ে আলাদা করুন" : "Comma-separated"}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-siliguri">{language === "bn" ? "কীওয়ার্ড (বাংলা)" : "Keywords (Bangla)"}</Label>
                  <Input
                    value={formData.seo_keywords_bn}
                    onChange={(e) => setFormData({ ...formData, seo_keywords_bn: e.target.value })}
                    placeholder={language === "bn" ? "কমা দিয়ে আলাদা করুন" : "Comma-separated"}
                    className="font-siliguri"
                  />
                </div>
              </div>

              {/* OG Image */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {language === "bn" ? "সোশ্যাল শেয়ার ইমেজ" : "Social Share Image"}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {language === "bn" ? "Facebook, WhatsApp, LinkedIn এ শেয়ার করলে দেখাবে" : "Shown when shared on Facebook, WhatsApp, LinkedIn"}
                </p>
                <ImageUpload
                  value={formData.og_image}
                  onChange={(url) => setFormData({ ...formData, og_image: url })}
                  bucket="product-images"
                  folder="seo/pages"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                {language === "bn" ? "বাতিল" : "Cancel"}
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                <Save className="h-4 w-4 mr-2" />
                {language === "bn" ? "সংরক্ষণ" : "Save"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminPageSEO;
