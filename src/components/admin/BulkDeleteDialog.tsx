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
import { cn } from "@/lib/utils";

interface BulkDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  itemType: string;
  onConfirm: () => Promise<void>;
  translations: {
    title: string;
    description: string;
    typeToConfirm: string;
    confirmWord: string;
    cancel: string;
    delete: string;
    deleting: string;
  };
  language: string;
}

export function BulkDeleteDialog({
  open,
  onOpenChange,
  selectedCount,
  itemType,
  onConfirm,
  translations,
  language,
}: BulkDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  
  const isBangla = language === "bn";
  const confirmWord = translations.confirmWord || "DELETE";
  const isConfirmValid = confirmText.toUpperCase() === confirmWord.toUpperCase();

  const handleConfirm = async () => {
    if (!isConfirmValid) return;
    
    setIsDeleting(true);
    try {
      await onConfirm();
      onOpenChange(false);
      setConfirmText("");
    } catch (error) {
      console.error("Bulk delete failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isDeleting) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setConfirmText("");
      }
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className={cn(isBangla && "font-siliguri")}>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle className="text-lg">
              {translations.title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">
            {translations.description.replace("{count}", String(selectedCount)).replace("{type}", itemType)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-2 py-2">
          <p className="text-sm text-muted-foreground">
            {translations.typeToConfirm} <span className="font-mono font-bold text-destructive">{confirmWord}</span>
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={confirmWord}
            className="font-mono"
            disabled={isDeleting}
          />
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {translations.cancel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting || !isConfirmValid}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting ? translations.deleting : `${translations.delete} (${selectedCount})`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
