import { useState, useEffect } from "react";
import { Loader2, FileText, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/formatPrice";

interface DeletionLog {
  id: string;
  order_id: string;
  order_number: string;
  order_data: any;
  deleted_by: string;
  deleted_at: string;
  reason: string | null;
}

interface OrderDeletionLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  translations: {
    title: string;
    description: string;
    deletedBy: string;
    deletedAt: string;
    originalData: string;
    viewOriginalData: string;
    noDeleteLogs: string;
  };
  language?: string;
}

export const OrderDeletionLogDialog = ({
  open,
  onOpenChange,
  translations,
  language = "en",
}: OrderDeletionLogDialogProps) => {
  const [logs, setLogs] = useState<DeletionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminNames, setAdminNames] = useState<Record<string, string>>({});
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchLogs();
    }
  }, [open]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("order_deletion_logs")
        .select("*")
        .order("deleted_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setLogs(data || []);

      // Fetch admin names
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(log => log.deleted_by))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", userIds);

        if (profiles) {
          const nameMap: Record<string, string> = {};
          profiles.forEach(p => {
            nameMap[p.user_id] = p.full_name || "Unknown";
          });
          setAdminNames(nameMap);
        }
      }
    } catch (error) {
      console.error("Error fetching deletion logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(language === "bn" ? "bn-BD" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-3xl max-h-[80vh]", language === "bn" && "font-siliguri")}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {translations.title}
          </DialogTitle>
          <DialogDescription>{translations.description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {translations.noDeleteLogs}
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <Collapsible
                  key={log.id}
                  open={expandedLog === log.id}
                  onOpenChange={(isOpen) => setExpandedLog(isOpen ? log.id : null)}
                >
                  <div className="border border-border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="destructive" className="font-mono">
                          {log.order_number}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {translations.deletedBy}: <strong>{adminNames[log.deleted_by] || "Unknown"}</strong>
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(log.deleted_at)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span>
                        {log.order_data?.customer_name} • {formatPrice(log.order_data?.total || 0, language as "bn" | "en")}
                      </span>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          {expandedLog === log.id ? (
                            <X className="h-4 w-4 mr-1" />
                          ) : (
                            <FileText className="h-4 w-4 mr-1" />
                          )}
                          {translations.viewOriginalData}
                        </Button>
                      </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent>
                      <div className="mt-3 p-3 bg-muted/50 rounded-md">
                        <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(log.order_data, null, 2)}
                        </pre>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
