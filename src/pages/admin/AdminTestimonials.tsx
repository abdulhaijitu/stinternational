import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Star, Quote, ArrowUp, ArrowDown, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: string;
  client_name: string;
  company_name: string;
  designation: string | null;
  quote: string;
  avatar_url: string | null;
  rating: number;
  is_active: boolean;
  display_order: number;
}

const AdminTestimonials = () => {
  const { language, t } = useAdminLanguage();
  const isBangla = language === "bn";
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({
    client_name: "",
    company_name: "",
    designation: "",
    quote: "",
    avatar_url: "",
    rating: 5,
    is_active: true,
  });

  const { data: testimonials, isLoading } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as Testimonial[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      if (data.id) {
        const { error } = await supabase
          .from("testimonials")
          .update({
            client_name: data.client_name,
            company_name: data.company_name,
            designation: data.designation || null,
            quote: data.quote,
            avatar_url: data.avatar_url || null,
            rating: data.rating,
            is_active: data.is_active,
          })
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const maxOrder = testimonials?.reduce((max, t) => Math.max(max, t.display_order), 0) || 0;
        const { error } = await supabase.from("testimonials").insert({
          client_name: data.client_name,
          company_name: data.company_name,
          designation: data.designation || null,
          quote: data.quote,
          avatar_url: data.avatar_url || null,
          rating: data.rating,
          is_active: data.is_active,
          display_order: maxOrder + 1,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      setIsDialogOpen(false);
      resetForm();
      toast.success(editingTestimonial ? t.testimonials.updateSuccess : t.testimonials.createSuccess);
    },
    onError: (error) => {
      toast.error(t.common.error + ": " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success(t.testimonials.deleteSuccess);
    },
    onError: (error) => {
      toast.error(t.common.error + ": " + error.message);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: number }) => {
      const { error } = await supabase
        .from("testimonials")
        .update({ display_order: newOrder })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("testimonials")
        .update({ is_active: isActive })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success(t.testimonials.statusUpdated);
    },
  });

  const resetForm = () => {
    setFormData({
      client_name: "",
      company_name: "",
      designation: "",
      quote: "",
      avatar_url: "",
      rating: 5,
      is_active: true,
    });
    setEditingTestimonial(null);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      client_name: testimonial.client_name,
      company_name: testimonial.company_name,
      designation: testimonial.designation || "",
      quote: testimonial.quote,
      avatar_url: testimonial.avatar_url || "",
      rating: testimonial.rating,
      is_active: testimonial.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleMoveUp = (testimonial: Testimonial, index: number) => {
    if (index === 0 || !testimonials) return;
    const prevTestimonial = testimonials[index - 1];
    reorderMutation.mutate({ id: testimonial.id, newOrder: prevTestimonial.display_order });
    reorderMutation.mutate({ id: prevTestimonial.id, newOrder: testimonial.display_order });
  };

  const handleMoveDown = (testimonial: Testimonial, index: number) => {
    if (!testimonials || index === testimonials.length - 1) return;
    const nextTestimonial = testimonials[index + 1];
    reorderMutation.mutate({ id: testimonial.id, newOrder: nextTestimonial.display_order });
    reorderMutation.mutate({ id: nextTestimonial.id, newOrder: testimonial.display_order });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      ...formData,
      id: editingTestimonial?.id,
    });
  };

  return (
    <AdminLayout>
      <div className={cn("space-y-6", isBangla && "font-siliguri")}>
        <AdminPageHeader 
          title={t.testimonials.title} 
          subtitle={t.testimonials.subtitle}
        >
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            {t.testimonials.addTestimonial}
          </Button>
        </AdminPageHeader>

        {/* Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className={cn("max-w-lg admin-dialog-header", isBangla && "font-siliguri")}>
            <DialogHeader>
              <DialogTitle>
                {editingTestimonial ? t.testimonials.editTestimonial : t.testimonials.newTestimonial}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="admin-form-group space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="client_name">
                    {t.testimonials.clientName}
                    <span className="text-destructive ml-0.5">*</span>
                  </Label>
                  <Input
                    id="client_name"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    placeholder={t.testimonials.clientNamePlaceholder}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="company_name">
                    {t.testimonials.companyName}
                    <span className="text-destructive ml-0.5">*</span>
                  </Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder={t.testimonials.companyNamePlaceholder}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="designation">
                  {t.testimonials.designation}
                  <span className="text-muted-foreground text-xs font-normal ml-1.5">
                    {isBangla ? "(ঐচ্ছিক)" : "(Optional)"}
                  </span>
                </Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder={t.testimonials.designationPlaceholder}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="quote">
                  {t.testimonials.testimonialQuote}
                  <span className="text-destructive ml-0.5">*</span>
                </Label>
                <Textarea
                  id="quote"
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  placeholder={t.testimonials.testimonialQuotePlaceholder}
                  rows={4}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="avatar_url">
                  {t.testimonials.avatarUrl}
                  <span className="text-muted-foreground text-xs font-normal ml-1.5">
                    {isBangla ? "(ঐচ্ছিক)" : "(Optional)"}
                  </span>
                </Label>
                <Input
                  id="avatar_url"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                  placeholder={t.testimonials.avatarUrlPlaceholder}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="rating">
                    {t.testimonials.rating}
                    <span className="text-muted-foreground text-xs font-normal ml-1.5">
                      {isBangla ? "(ঐচ্ছিক)" : "(Optional)"}
                    </span>
                  </Label>
                  <Input
                    id="rating"
                    type="number"
                    min={1}
                    max={5}
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex items-center justify-between pt-6">
                  <Label htmlFor="is_active">{t.testimonials.active}</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t.common.cancel}
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? t.common.loading : t.common.save}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Table */}
        <div className="admin-table-wrapper">
          {isLoading ? (
            <AdminTableSkeleton columns={6} rows={4} />
          ) : testimonials && testimonials.length > 0 ? (
            <table className="admin-table">
              <thead className="sticky top-0 z-10 bg-muted/50">
                <tr>
                  <th className="w-12">{t.testimonials.order}</th>
                  <th>{t.testimonials.client}</th>
                  <th>{t.testimonials.company}</th>
                  <th>{t.testimonials.rating}</th>
                  <th>{t.testimonials.status}</th>
                  <th className="text-right">{t.testimonials.actions}</th>
                </tr>
              </thead>
              <tbody>
                {testimonials.map((testimonial, index) => (
                  <tr key={testimonial.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-sm">
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleMoveUp(testimonial, index)}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleMoveDown(testimonial, index)}
                          disabled={index === testimonials.length - 1}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      <div>
                        <p className="font-medium">{testimonial.client_name}</p>
                        {testimonial.designation && (
                          <p className="text-xs text-muted-foreground">{testimonial.designation}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm">{testimonial.company_name}</td>
                    <td className="p-4 text-sm">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-3 w-3",
                              i < testimonial.rating ? "text-amber-500 fill-amber-500" : "text-muted"
                            )}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      <Switch
                        checked={testimonial.is_active}
                        onCheckedChange={(checked) =>
                          toggleActiveMutation.mutate({ id: testimonial.id, isActive: checked })
                        }
                      />
                    </td>
                    <td className="p-4 text-sm text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(testimonial)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(t.testimonials.deleteConfirm)) {
                              deleteMutation.mutate(testimonial.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <AdminEmptyState
              icon={MessageSquare}
              title={t.testimonials.noTestimonials}
              description={t.testimonials.subtitle}
              action={
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t.testimonials.addTestimonial}
                </Button>
              }
            />
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminTestimonials;