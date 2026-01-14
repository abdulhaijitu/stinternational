import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  DndContext,
  closestCenter,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
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
import { Plus, Edit, Trash2, Star, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { cn } from "@/lib/utils";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { SortableRow } from "@/components/admin/SortableRow";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState<Testimonial | null>(null);
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

  // Drag and drop reorder handler
  const handleReorder = useCallback(async (reorderedItems: Testimonial[]) => {
    try {
      const updates = reorderedItems.map((item, index) => ({
        id: item.id,
        display_order: index + 1,
      }));
      
      for (const update of updates) {
        const { error } = await supabase
          .from("testimonials")
          .update({ display_order: update.display_order })
          .eq("id", update.id);
        if (error) throw error;
      }
      
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success(isBangla ? "ক্রম আপডেট হয়েছে" : "Order updated");
    } catch (error) {
      console.error("Error reordering:", error);
      toast.error(t.common.error);
    }
  }, [queryClient, isBangla, t.common.error]);

  const { sensors, activeId, isReordering, handleDragStart, handleDragEnd, handleDragCancel } = useDragAndDrop({
    items: testimonials || [],
    onReorder: handleReorder,
    getId: (item) => item.id,
  });

  const activeTestimonial = activeId ? testimonials?.find(t => t.id === activeId) : null;

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      if (data.id) {
        const { data: result, error } = await supabase
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
          .eq("id", data.id)
          .select()
          .single();
        if (error) throw error;
        if (!result) throw new Error("No data returned from update");
        return result;
      } else {
        const maxOrder = testimonials?.reduce((max, t) => Math.max(max, t.display_order), 0) || 0;
        const { data: result, error } = await supabase.from("testimonials").insert({
          client_name: data.client_name,
          company_name: data.company_name,
          designation: data.designation || null,
          quote: data.quote,
          avatar_url: data.avatar_url || null,
          rating: data.rating,
          is_active: data.is_active,
          display_order: maxOrder + 1,
        }).select().single();
        if (error) throw error;
        if (!result) throw new Error("No data returned from insert");
        return result;
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
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success(t.testimonials.deleteSuccess);
      setDeleteDialogOpen(false);
      setTestimonialToDelete(null);
    },
    onError: (error) => {
      toast.error(t.common.error + ": " + error.message);
    },
  });

  const openDeleteDialog = (testimonial: Testimonial) => {
    setTestimonialToDelete(testimonial);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!testimonialToDelete) return;
    await deleteMutation.mutateAsync(testimonialToDelete.id);
  };

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from("testimonials")
        .update({ is_active: isActive })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      if (!data) throw new Error("No data returned from update");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success(t.testimonials.statusUpdated);
    },
    onError: (error) => {
      toast.error(t.common.error + ": " + error.message);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      ...formData,
      id: editingTestimonial?.id,
    });
  };

  const renderTestimonialRow = (testimonial: Testimonial) => (
    <>
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
          disabled={toggleActiveMutation.isPending || isReordering}
          onCheckedChange={(checked) =>
            toggleActiveMutation.mutate({ id: testimonial.id, isActive: checked })
          }
        />
      </td>
      <td className="p-4 text-sm">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(testimonial)}
            disabled={isReordering}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openDeleteDialog(testimonial)}
            disabled={deleteMutation.isPending || isReordering}
          >
            {deleteMutation.isPending && testimonialToDelete?.id === testimonial.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 text-destructive" />
            )}
          </Button>
        </div>
      </td>
    </>
  );

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

        {/* Info Box */}
        <div className="bg-muted/50 border border-border rounded-lg p-4 text-sm text-muted-foreground">
          <p>{isBangla ? "💡 পুনর্বিন্যাস করতে টেনে আনুন এবং ফেলুন" : "💡 Drag and drop to reorder testimonials"}</p>
        </div>

        {/* Table with Drag and Drop */}
        <div className="admin-table-wrapper">
          {isLoading ? (
            <AdminTableSkeleton columns={6} rows={4} />
          ) : testimonials && testimonials.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext items={testimonials.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <table className="admin-table">
                  <thead className="sticky top-0 z-10 bg-muted/50">
                    <tr>
                      <th className="w-10"></th>
                      <th>{t.testimonials.client}</th>
                      <th>{t.testimonials.company}</th>
                      <th>{t.testimonials.rating}</th>
                      <th>{t.testimonials.status}</th>
                      <th className="text-right">{t.testimonials.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testimonials.map((testimonial) => (
                      <SortableRow
                        key={testimonial.id}
                        id={testimonial.id}
                        disabled={isReordering}
                        renderAsTableRow
                        className={cn(
                          "hover:bg-muted/30 transition-colors",
                          !testimonial.is_active && "opacity-50"
                        )}
                      >
                        {renderTestimonialRow(testimonial)}
                      </SortableRow>
                    ))}
                  </tbody>
                </table>
              </SortableContext>
              
              <DragOverlay>
                {activeTestimonial && (
                  <table className="admin-table bg-card shadow-lg rounded-lg border border-border">
                    <tbody>
                      <tr>
                        <td className="p-2 w-10">
                          <div className="p-1.5">
                            <div className="h-4 w-4" />
                          </div>
                        </td>
                        {renderTestimonialRow(activeTestimonial)}
                      </tr>
                    </tbody>
                  </table>
                )}
              </DragOverlay>
            </DndContext>
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

        {/* Delete Confirmation Dialog */}
        <ConfirmDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          itemName={testimonialToDelete?.client_name || ""}
          itemType={isBangla ? "প্রশংসাপত্র" : "Testimonial"}
          onConfirm={handleDeleteConfirm}
          translations={{
            cancel: t.common.cancel,
            delete: t.common.delete || "Delete",
            deleting: isBangla ? "মুছে ফেলা হচ্ছে..." : "Deleting...",
          }}
          language={language}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminTestimonials;
