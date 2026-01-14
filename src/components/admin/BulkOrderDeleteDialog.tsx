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

interface BulkOrderDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderCount: number;
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
  language?: string;
}

export const BulkOrderDeleteDialog = ({
  open,
  onOpenChange,
  orderCount,
  onConfirm,
  translations,
  language = "en",
}: BulkOrderDeleteDialogProps) => {
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const isConfirmed = confirmText.toUpperCase() === translations.confirmWord.toUpperCase();

  const handleConfirm = async () => {
    if (!isConfirmed) return;
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      setConfirmText("");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setConfirmText("");
    }
    onOpenChange(newOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className={cn(language === "bn" && "font-siliguri")}>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {translations.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              {translations.description.replace("{count}", String(orderCount))}
            </p>
            <div className="space-y-2">
              <Label htmlFor="confirm-bulk-delete">
                {translations.typeToConfirm.replace("{word}", translations.confirmWord)}
              </Label>
              <Input
                id="confirm-bulk-delete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={translations.confirmWord}
                className="font-mono"
              />
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
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {translations.deleting}
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
