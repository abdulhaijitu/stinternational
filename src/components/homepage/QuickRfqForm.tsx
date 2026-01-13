import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCtaAnalytics } from "@/hooks/useCtaAnalytics";
import { Skeleton } from "@/components/ui/skeleton";

const rfqSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100, "Name too long"),
  organization: z.string().trim().min(2, "Organization is required").max(200, "Organization name too long"),
  phone: z.string().trim().min(7, "Valid phone number required").max(20, "Phone number too long"),
  email: z.string().trim().email("Valid email required").max(255, "Email too long"),
  requirements: z.string().trim().min(10, "Please describe your requirements").max(1000, "Description too long"),
  quantity: z.string().trim().max(50, "Quantity too long").optional(),
});

type RfqFormData = z.infer<typeof rfqSchema>;

const QuickRfqForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const { trackRfqSubmit } = useCtaAnalytics();

  const form = useForm<RfqFormData>({
    resolver: zodResolver(rfqSchema),
    defaultValues: {
      name: "",
      organization: "",
      phone: "",
      email: "",
      requirements: "",
      quantity: "",
    },
  });

  const onSubmit = async (data: RfqFormData) => {
    setIsSubmitting(true);
    
    try {
      // Insert into quote_requests table (using simplified fields for quick RFQ)
      const { error } = await supabase.from("quote_requests").insert({
        contact_person: data.name,
        company_name: data.organization,
        company_type: "other",
        phone: data.phone,
        email: data.email,
        product_category: "general",
        product_details: data.requirements,
        quantity: data.quantity || "Not specified",
        delivery_urgency: "flexible",
        delivery_address: "To be confirmed",
        delivery_city: "To be confirmed",
        status: "pending",
      });

      if (error) throw error;

      // Track the RFQ submission
      trackRfqSubmit();

      // Try to send notification email (non-blocking)
      try {
        await supabase.functions.invoke("send-quote-notification", {
          body: {
            type: "new_quote",
            quoteData: {
              contact_person: data.name,
              company_name: data.organization,
              email: data.email,
              phone: data.phone,
              product_details: data.requirements,
              quantity: data.quantity || "Not specified",
            },
          },
        });
      } catch {
        // Email notification failed silently
      }

      setIsSuccess(true);
      form.reset();
      
      toast({
        title: "Quote Request Submitted",
        description: "Our team will contact you within 24 hours.",
      });
    } catch (error) {
      console.error("RFQ submission error:", error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container-premium">
          <div className="max-w-xl mx-auto bg-card border border-border rounded-lg p-8 md:p-10 text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Request Received</h3>
            <p className="text-muted-foreground mb-4">
              Thank you for your inquiry. Our team will review your requirements and contact you within 24 business hours.
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              Operated by ST International, Dhaka, Bangladesh
            </p>
            <Button
              variant="outline"
              onClick={() => setIsSuccess(false)}
              className="active:scale-95 transition-transform duration-200"
            >
              Submit Another Request
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container-premium">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold mb-3">
              Need Bulk Quantity or Institutional Pricing?
            </h2>
            <p className="text-muted-foreground">
              Get a personalized quotation for your organization. Quick response guaranteed.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Full name"
                          {...field}
                          disabled={isSubmitting}
                          className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="organization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization / Company *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Company or institution name"
                          {...field}
                          disabled={isSubmitting}
                          className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+880 1XXX-XXXXXX"
                            {...field}
                            disabled={isSubmitting}
                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@company.com"
                            {...field}
                            disabled={isSubmitting}
                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product / Requirements *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the products or equipment you need..."
                          className="min-h-[100px] resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 10 units, 50 pieces"
                          {...field}
                          disabled={isSubmitting}
                          className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full active:scale-[0.98] transition-transform duration-200"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded-full animate-pulse" />
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Request a Quote
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  We typically respond within 24 business hours
                </p>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickRfqForm;
