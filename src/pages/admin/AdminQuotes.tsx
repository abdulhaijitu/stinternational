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
  CheckCircle,
  XCircle,
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

const statusLabels: Record<string, string> = {
  pending: "Pending",
  reviewed: "Reviewed",
  quoted: "Quoted",
  closed: "Closed",
};

const companyTypeLabels: Record<string, string> = {
  university: "University / College",
  research_lab: "Research Laboratory",
  hospital: "Hospital / Medical Center",
  factory: "Factory / Manufacturing",
  government: "Government Institution",
  school: "School / Educational Institute",
  ngo: "NGO / Non-Profit",
  private_business: "Private Business",
  other: "Other",
};

const urgencyLabels: Record<string, string> = {
  urgent: "Urgent (Within 1 week)",
  within_week: "Within 2 weeks",
  within_month: "Within 1 month",
  flexible: "Flexible / No Rush",
};

const AdminQuotes = () => {
  const queryClient = useQueryClient();
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);

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
      toast.success("Status updated successfully");
    },
    onError: () => {
      toast.error("Failed to update status");
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
      toast.success("Response sent successfully");
      setIsResponseDialogOpen(false);
      setResponseMessage("");
      setSelectedQuote(null);
    },
    onError: (error: any) => {
      console.error("Failed to send response:", error);
      toast.error("Failed to send response email");
    },
  });

  const handleSendResponse = () => {
    if (!selectedQuote || !responseMessage.trim()) {
      toast.error("Please enter a response message");
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Quote Requests</h1>
            <p className="text-muted-foreground">Manage quote requests from institutional buyers</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="quoted">Quoted</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["pending", "reviewed", "quoted", "closed"].map((status) => {
            const count = quotes?.filter((q) => q.status === status).length || 0;
            return (
              <div key={status} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground capitalize">{status}</span>
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
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{quote.company_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {companyTypeLabels[quote.company_type] || quote.company_type}
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
                          {urgencyLabels[quote.delivery_urgency] || quote.delivery_urgency}
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
                              {statusLabels[quote.status]}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                            <SelectItem value="quoted">Quoted</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
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
              <p className="text-muted-foreground">No quote requests found</p>
            </div>
          )}
        </div>

        {/* Quote Detail Dialog */}
        <Dialog open={!!selectedQuote && !isResponseDialogOpen} onOpenChange={() => setSelectedQuote(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                      Company Information
                    </h4>
                    <dl className="grid grid-cols-2 gap-2 text-sm">
                      <dt className="text-muted-foreground">Type:</dt>
                      <dd>{companyTypeLabels[selectedQuote.company_type]}</dd>
                      <dt className="text-muted-foreground">Contact:</dt>
                      <dd>{selectedQuote.contact_person}</dd>
                      <dt className="text-muted-foreground">Email:</dt>
                      <dd>
                        <a href={`mailto:${selectedQuote.email}`} className="text-primary hover:underline">
                          {selectedQuote.email}
                        </a>
                      </dd>
                      <dt className="text-muted-foreground">Phone:</dt>
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
                      Product Requirements
                    </h4>
                    <dl className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <dt className="text-muted-foreground">Category:</dt>
                        <dd className="capitalize">{selectedQuote.product_category}</dd>
                        <dt className="text-muted-foreground">Quantity:</dt>
                        <dd>{selectedQuote.quantity}</dd>
                        {selectedQuote.budget_range && (
                          <>
                            <dt className="text-muted-foreground">Budget:</dt>
                            <dd>{selectedQuote.budget_range}</dd>
                          </>
                        )}
                      </div>
                      <div className="pt-2">
                        <dt className="text-muted-foreground mb-1">Details:</dt>
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
                      Delivery Preferences
                    </h4>
                    <dl className="grid grid-cols-2 gap-2 text-sm">
                      <dt className="text-muted-foreground">City:</dt>
                      <dd>{selectedQuote.delivery_city}</dd>
                      <dt className="text-muted-foreground">Urgency:</dt>
                      <dd>{urgencyLabels[selectedQuote.delivery_urgency]}</dd>
                      {selectedQuote.preferred_payment && (
                        <>
                          <dt className="text-muted-foreground">Payment:</dt>
                          <dd className="capitalize">{selectedQuote.preferred_payment.replace(/_/g, " ")}</dd>
                        </>
                      )}
                    </dl>
                    <div className="mt-2 text-sm">
                      <dt className="text-muted-foreground mb-1">Address:</dt>
                      <dd>{selectedQuote.delivery_address}</dd>
                    </div>
                    {selectedQuote.additional_notes && (
                      <div className="mt-2 text-sm">
                        <dt className="text-muted-foreground mb-1">Notes:</dt>
                        <dd className="bg-background p-2 rounded">{selectedQuote.additional_notes}</dd>
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Submitted: {format(new Date(selectedQuote.created_at), "PPp")}
                    </span>
                    <Badge className={statusColors[selectedQuote.status]}>
                      {statusLabels[selectedQuote.status]}
                    </Badge>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedQuote(null)}>
                    Close
                  </Button>
                  <Button onClick={() => openResponseDialog(selectedQuote)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Response
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Send Response Dialog */}
        <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send Response to {selectedQuote?.contact_person}
              </DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                This email will be sent to: <strong>{selectedQuote?.email}</strong>
              </p>
              <Textarea
                placeholder="Enter your response message..."
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                className="min-h-[200px]"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsResponseDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSendResponse}
                disabled={sendResponseMutation.isPending || !responseMessage.trim()}
              >
                {sendResponseMutation.isPending ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
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
