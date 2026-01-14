import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Filter
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
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

  // Fetch quote requests
  const { data: quotes, isLoading } = useQuery({
    queryKey: ["admin-quotes", filterStatus],
    queryFn: async () => {
      let query = supabase
        .from("quote_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as QuoteRequest[];
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ["admin-quotes"] });
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t.quotes.title}</h1>
            <p className="text-muted-foreground">{t.quotes.subtitle}</p>
          </div>
          
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
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(["pending", "reviewed", "quoted", "closed"] as const).map((status) => {
            const count = quotes?.filter((q) => q.status === status).length || 0;
            return (
              <div key={status} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{getStatusLabel(status)}</span>
                  <Badge className={statusColors[status]}>{count}</Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quotes Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : quotes && quotes.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.quotes.company}</TableHead>
                    <TableHead>{t.quotes.contact}</TableHead>
                    <TableHead>{t.quotes.category}</TableHead>
                    <TableHead>{t.quotes.urgency}</TableHead>
                    <TableHead>{t.quotes.status}</TableHead>
                    <TableHead>{t.quotes.date}</TableHead>
                    <TableHead className="text-right">{t.common.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{quote.company_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {getCompanyTypeLabel(quote.company_type)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm">{quote.contact_person}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {quote.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm capitalize">{quote.product_category}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {getUrgencyLabel(quote.delivery_urgency)}
                        </span>
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(quote.created_at), "MMM d, yyyy")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t.quotes.noQuotes}</p>
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