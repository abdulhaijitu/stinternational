import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  itemType: string;
  onConfirm: () => Promise<void>;
  requireConfirmation?: boolean;
  confirmWord?: string;
  translations: {
    title?: string;
    description?: string;
    typeToConfirm?: string;
    cancel: string;
    delete: string;
    deleting?: string;
  };
  language?: string;
}

export const ConfirmDeleteDialog = ({
  open,
  onOpenChange,
  itemName,
  itemType,
  onConfirm,
  requireConfirmation = false,
  confirmWord = "DELETE",
  translations,
  language = "en",
}: ConfirmDeleteDialogProps) => {
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const isConfirmed = !requireConfirmation || confirmText.toUpperCase() === confirmWord.toUpperCase();

  const isBangla = language === "bn";
  
  const defaultTitle = isBangla ? `${itemType} মুছে ফেলুন` : `Delete ${itemType}`;
  const defaultDescription = isBangla 
    ? `আপনি কি নিশ্চিত যে আপনি "${itemName}" মুছে ফেলতে চান? এই ক্রিয়াটি পূর্বাবস্থায় ফেরানো যাবে না।`
    : `Are you sure you want to delete "${itemName}"? This action cannot be undone.`;
  const defaultTypeToConfirm = isBangla 
    ? `নিশ্চিত করতে "${confirmWord}" টাইপ করুন`
    : `Type "${confirmWord}" to confirm`;
  const defaultDeleting = isBangla ? "মুছে ফেলা হচ্ছে..." : "Deleting...";

  const handleConfirm = async () => {
    if (!isConfirmed) return;
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the parent
    } finally {
      setLoading(false);
      setConfirmText("");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      if (!newOpen) {
        setConfirmText("");
      }
      onOpenChange(newOpen);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className={cn("admin-dialog-content", language === "bn" && "font-siliguri")}>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center text-destructive" style={{ gap: 'var(--space-2)' }}>
            <AlertTriangle className="h-5 w-5" />
            {translations.title || defaultTitle}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <p className="text-muted-foreground">
                {translations.description || defaultDescription}
              </p>
              {requireConfirmation && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <Label htmlFor="confirm-delete-input">
                    {translations.typeToConfirm || defaultTypeToConfirm}
                  </Label>
                  <Input
                    id="confirm-delete-input"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={confirmWord}
                    className="font-mono"
                    disabled={loading}
                  />
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {translations.cancel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isConfirmed || loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" style={{ marginRight: 'var(--space-2)' }} />
                {translations.deleting || defaultDeleting}
              </>
            ) : (
              translations.delete
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDeleteDialog;
