import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  FileText, 
  Mail, 
  Phone, 
  Building2, 
  Package, 
  Truck,
  Clock,
  MessageSquare,
  Send,
  Eye,
  Filter,
  Globe,
  Activity
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { format } from "date-fns";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { cn } from "@/lib/utils";
import { useAdminQuotes, AdminQuote, ADMIN_QUOTES_QUERY_KEY } from "@/hooks/useAdminQuotes";

interface QuoteRequest {
  id: string;
  company_name: string;
  company_type: string;
  contact_person: string;
  email: string;
  phone: string;
  product_category: string;
  product_details: string;
  quantity: string;
  budget_range: string | null;
  delivery_address: string;
  delivery_city: string;
  delivery_urgency: string;
  preferred_payment: string | null;
  additional_notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  source_page?: string | null;
  language?: string | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  reviewed: "bg-blue-100 text-blue-800 border-blue-200",
  quoted: "bg-green-100 text-green-800 border-green-200",
  closed: "bg-gray-100 text-gray-800 border-gray-200",
};

const AdminQuotes = () => {
  const { language, t } = useAdminLanguage();
  const isBangla = language === "bn";
  const queryClient = useQueryClient();
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);

  // Get translated labels
  const getCompanyTypeLabel = (type: string) => {
    const key = type as keyof typeof t.quotes.companyTypes;
    return t.quotes.companyTypes[key] || type;
  };

  const getUrgencyLabel = (urgency: string) => {
    const key = urgency as keyof typeof t.quotes.urgencyLabels;
    return t.quotes.urgencyLabels[key] || urgency;
  };

  const getStatusLabel = (status: string) => {
    const key = status as keyof typeof t.quotes.statuses;
    return t.quotes.statuses[key] || status;
  };

  const getSourcePageLabel = (source: string | null | undefined) => {
    if (!source) return t.quotes.sourcePages?.["unknown"] || "Unknown";
    const key = source as keyof typeof t.quotes.sourcePages;
    return t.quotes.sourcePages?.[key] || source;
  };

  const getLanguageLabel = (lang: string | null | undefined) => {
    if (!lang) return "-";
    const key = lang as keyof typeof t.quotes.languages;
    return t.quotes.languages?.[key] || lang.toUpperCase();
  };

  // Fetch quote requests with realtime updates
  const { data: quotes, isLoading } = useAdminQuotes(filterStatus);

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("quote_requests")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUOTES_QUERY_KEY });
      toast.success(t.quotes.statusUpdateSuccess);
    },
    onError: () => {
      toast.error(t.quotes.statusUpdateError);
    },
  });

  // Send response email mutation
  const sendResponseMutation = useMutation({
    mutationFn: async ({ quote, message }: { quote: QuoteRequest; message: string }) => {
      const response = await supabase.functions.invoke("send-quote-notification", {
        body: {
          type: "quote_response",
          quote: {
            id: quote.id,
            company_name: quote.company_name,
            contact_person: quote.contact_person,
            email: quote.email,
            phone: quote.phone,
            company_type: quote.company_type,
            product_category: quote.product_category,
            product_details: quote.product_details,
            quantity: quote.quantity,
            budget_range: quote.budget_range,
            delivery_city: quote.delivery_city,
            delivery_urgency: quote.delivery_urgency,
          },
          response_message: message,
        },
      });

      if (response.error) throw response.error;

      // Update status to quoted
      await supabase
        .from("quote_requests")
        .update({ status: "quoted" })
        .eq("id", quote.id);

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quotes"] });
      toast.success(t.quotes.responseSentSuccess);
      setIsResponseDialogOpen(false);
      setResponseMessage("");
      setSelectedQuote(null);
    },
    onError: (error: any) => {
      console.error("Failed to send response:", error);
      toast.error(t.quotes.responseSendError);
    },
  });

  const handleSendResponse = () => {
    if (!selectedQuote || !responseMessage.trim()) {
      toast.error(t.quotes.enterMessage);
      return;
    }
    sendResponseMutation.mutate({ quote: selectedQuote, message: responseMessage });
  };

  const openResponseDialog = (quote: QuoteRequest) => {
    setSelectedQuote(quote);
    setResponseMessage("");
    setIsResponseDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className={cn("space-y-6", isBangla && "font-siliguri")}>
        {/* Header */}
        <AdminPageHeader 
          title={t.quotes.title} 
          subtitle={t.quotes.subtitle}
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t.quotes.filterByStatus} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.quotes.allRequests}</SelectItem>
                <SelectItem value="pending">{t.quotes.statuses.pending}</SelectItem>
                <SelectItem value="reviewed">{t.quotes.statuses.reviewed}</SelectItem>
                <SelectItem value="quoted">{t.quotes.statuses.quoted}</SelectItem>
                <SelectItem value="closed">{t.quotes.statuses.closed}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </AdminPageHeader>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(["pending", "reviewed", "quoted", "closed"] as const).map((status) => {
            const count = quotes?.filter((q) => q.status === status).length || 0;
            return (
              <div key={status} className="admin-stats-card">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{getStatusLabel(status)}</span>
                  <Badge className={statusColors[status]}>{count}</Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quotes Table */}
        <div className="admin-table-wrapper">
          {isLoading ? (
            <AdminTableSkeleton columns={7} rows={5} />
          ) : quotes && quotes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead className="sticky top-0 z-10 bg-muted/50">
                  <tr>
                    <th>{t.quotes.company}</th>
                    <th>{t.quotes.contact}</th>
                    <th>{t.quotes.category}</th>
                    <th>{t.quotes.urgency}</th>
                    <th>{t.quotes.status}</th>
                    <th>{t.quotes.date}</th>
                    <th className="text-right">{t.common.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((quote) => (
                    <tr key={quote.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-sm">
                        <div>
                          <p className="font-medium">{quote.company_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {getCompanyTypeLabel(quote.company_type)}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        <div className="space-y-1">
                          <p>{quote.contact_person}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {quote.email}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        <span className="capitalize">{quote.product_category}</span>
                      </td>
                      <td className="p-4 text-sm">
                        <span>{getUrgencyLabel(quote.delivery_urgency)}</span>
                      </td>
                      <td className="p-4 text-sm">
                        <Select
                          value={quote.status}
                          onValueChange={(value) => 
                            updateStatusMutation.mutate({ id: quote.id, status: value })
                          }
                        >
                          <SelectTrigger className="w-[120px] h-8">
                            <Badge className={statusColors[quote.status]}>
                              {getStatusLabel(quote.status)}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">{t.quotes.statuses.pending}</SelectItem>
                            <SelectItem value="reviewed">{t.quotes.statuses.reviewed}</SelectItem>
                            <SelectItem value="quoted">{t.quotes.statuses.quoted}</SelectItem>
                            <SelectItem value="closed">{t.quotes.statuses.closed}</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4 text-sm">
                        <span className="text-muted-foreground">
                          {format(new Date(quote.created_at), "MMM d, yyyy")}
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedQuote(quote)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openResponseDialog(quote)}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <AdminEmptyState
              icon={FileText}
              title={t.quotes.noQuotes}
              description={t.quotes.subtitle}
            />
          )}
        </div>

        {/* Quote Activity Log */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">{t.quotes.activityLog}</h3>
                <p className="text-sm text-muted-foreground">{t.quotes.activityLogDescription}</p>
              </div>
            </div>
          </div>
          {isLoading ? (
            <div className="p-6 space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : quotes && quotes.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.quotes.date}</TableHead>
                    <TableHead>{t.quotes.company}</TableHead>
                    <TableHead>{t.quotes.contact}</TableHead>
                    <TableHead>{t.quotes.sourcePage}</TableHead>
                    <TableHead>{t.quotes.language}</TableHead>
                    <TableHead>{t.quotes.status}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.slice(0, 10).map((quote) => (
                    <TableRow key={quote.id} className="text-sm">
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{format(new Date(quote.created_at), "MMM d, HH:mm")}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{quote.company_name}</TableCell>
                      <TableCell>{quote.contact_person}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {getSourcePageLabel(quote.source_page)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{getLanguageLabel(quote.language)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", statusColors[quote.status])}>
                          {getStatusLabel(quote.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              {t.quotes.noQuotes}
            </div>
          )}
        </div>

        {/* Quote Detail Dialog */}
        <Dialog open={!!selectedQuote && !isResponseDialogOpen} onOpenChange={() => setSelectedQuote(null)}>
          <DialogContent className={cn("max-w-2xl max-h-[90vh] overflow-y-auto", isBangla && "font-siliguri")}>
            {selectedQuote && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {selectedQuote.company_name}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Company Info */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {t.quotes.companyInfo}
                    </h4>
                    <dl className="grid grid-cols-2 gap-2 text-sm">
                      <dt className="text-muted-foreground">{t.quotes.type}:</dt>
                      <dd>{getCompanyTypeLabel(selectedQuote.company_type)}</dd>
                      <dt className="text-muted-foreground">{t.quotes.contact}:</dt>
                      <dd>{selectedQuote.contact_person}</dd>
                      <dt className="text-muted-foreground">{t.quotes.email}:</dt>
                      <dd>
                        <a href={`mailto:${selectedQuote.email}`} className="text-primary hover:underline">
                          {selectedQuote.email}
                        </a>
                      </dd>
                      <dt className="text-muted-foreground">{t.quotes.phone}:</dt>
                      <dd>
                        <a href={`tel:${selectedQuote.phone}`} className="text-primary hover:underline">
                          {selectedQuote.phone}
                        </a>
                      </dd>
                    </dl>
                  </div>

                  {/* Product Requirements */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      {t.quotes.productRequirements}
                    </h4>
                    <dl className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <dt className="text-muted-foreground">{t.quotes.category}:</dt>
                        <dd className="capitalize">{selectedQuote.product_category}</dd>
                        <dt className="text-muted-foreground">{t.quotes.quantity}:</dt>
                        <dd>{selectedQuote.quantity}</dd>
                        {selectedQuote.budget_range && (
                          <>
                            <dt className="text-muted-foreground">{t.quotes.budget}:</dt>
                            <dd>{selectedQuote.budget_range}</dd>
                          </>
                        )}
                      </div>
                      <div className="pt-2">
                        <dt className="text-muted-foreground mb-1">{t.quotes.details}:</dt>
                        <dd className="bg-background p-3 rounded text-sm whitespace-pre-wrap">
                          {selectedQuote.product_details}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Delivery */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      {t.quotes.deliveryPreferences}
                    </h4>
                    <dl className="grid grid-cols-2 gap-2 text-sm">
                      <dt className="text-muted-foreground">{t.quotes.city}:</dt>
                      <dd>{selectedQuote.delivery_city}</dd>
                      <dt className="text-muted-foreground">{t.quotes.urgency}:</dt>
                      <dd>{getUrgencyLabel(selectedQuote.delivery_urgency)}</dd>
                      {selectedQuote.preferred_payment && (
                        <>
                          <dt className="text-muted-foreground">{t.quotes.payment}:</dt>
                          <dd className="capitalize">{selectedQuote.preferred_payment.replace(/_/g, " ")}</dd>
                        </>
                      )}
                    </dl>
                    <div className="mt-2 text-sm">
                      <dt className="text-muted-foreground mb-1">{t.quotes.address}:</dt>
                      <dd>{selectedQuote.delivery_address}</dd>
                    </div>
                    {selectedQuote.additional_notes && (
                      <div className="mt-2 text-sm">
                        <dt className="text-muted-foreground mb-1">{t.quotes.notes}:</dt>
                        <dd className="bg-background p-2 rounded">{selectedQuote.additional_notes}</dd>
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {t.quotes.submitted}: {format(new Date(selectedQuote.created_at), "PPp")}
                    </span>
                    <Badge className={statusColors[selectedQuote.status]}>
                      {getStatusLabel(selectedQuote.status)}
                    </Badge>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedQuote(null)}>
                    {t.quotes.close}
                  </Button>
                  <Button onClick={() => openResponseDialog(selectedQuote)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {t.quotes.sendResponse}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Send Response Dialog */}
        <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
          <DialogContent className={cn("max-w-lg", isBangla && "font-siliguri")}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                {t.quotes.sendResponseTo} {selectedQuote?.contact_person}
              </DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                {t.quotes.emailWillBeSent} <strong>{selectedQuote?.email}</strong>
              </p>
              <Textarea
                placeholder={t.quotes.enterResponseMessage}
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                className="min-h-[200px]"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsResponseDialogOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button 
                onClick={handleSendResponse}
                disabled={sendResponseMutation.isPending || !responseMessage.trim()}
              >
                {sendResponseMutation.isPending ? (
                  t.quotes.sending
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {t.quotes.sendEmail}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminQuotes;