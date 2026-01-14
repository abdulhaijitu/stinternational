import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCtaAnalytics } from "@/hooks/useCtaAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

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
  const { language } = useLanguage();

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
    // Prevent double submission
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      // Prepare the quote data with all required fields
      const quotePayload = {
        contact_person: data.name.trim(),
        company_name: data.organization.trim(),
        company_type: "other",
        phone: data.phone.trim(),
        email: data.email.trim(),
        product_category: "general",
        product_details: data.requirements.trim(),
        quantity: data.quantity?.trim() || "Not specified",
        delivery_urgency: "flexible",
        delivery_address: "To be confirmed",
        delivery_city: "To be confirmed",
        status: "pending",
        source_page: "homepage-quick-rfq",
        language: language,
      };

      // Insert into quote_requests table
      const { error: insertError } = await supabase
        .from("quote_requests")
        .insert(quotePayload);

      if (insertError) {
        console.error("Database insert error:", insertError);
        throw new Error(insertError.message || "Failed to save your request");
      }

      // Track the RFQ submission
      trackRfqSubmit();

      // Try to send notification email (non-blocking, don't throw on failure)
      supabase.functions.invoke("send-quote-notification", {
        body: {
          type: "new_quote",
          quote: {
            id: crypto.randomUUID(),
            contact_person: data.name.trim(),
            company_name: data.organization.trim(),
            company_type: "other",
            email: data.email.trim(),
            phone: data.phone.trim(),
            product_category: "general",
            product_details: data.requirements.trim(),
            quantity: data.quantity?.trim() || "Not specified",
            delivery_city: "To be confirmed",
            delivery_urgency: "flexible",
          },
          language,
        },
      }).catch((emailErr) => {
        // Log but don't block on email failure
        console.warn("Email notification failed (non-critical):", emailErr);
      });

      setIsSuccess(true);
      form.reset();
      
      toast({
        title: language === "bn" ? "অনুরোধ সফলভাবে জমা হয়েছে" : "Quote Request Submitted",
        description: language === "bn" ? "আমাদের টিম ২৪ ঘন্টার মধ্যে যোগাযোগ করবে।" : "Our team will contact you within 24 hours.",
      });
    } catch (error: unknown) {
      console.error("RFQ submission error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: language === "bn" ? "জমা দিতে ব্যর্থ" : "Submission Failed",
        description: language === "bn" 
          ? `দুঃখিত, আবার চেষ্টা করুন। (${errorMessage})`
          : `Please try again or contact us directly. (${errorMessage})`,
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">
                  {language === "bn" ? "আপনার নাম" : "Your Name"}
                  <span className="text-destructive ml-0.5">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder={language === "bn" ? "পূর্ণ নাম" : "Full name"}
                  {...form.register("name")}
                  disabled={isSubmitting}
                  className={cn(
                    "transition-all duration-200 focus:ring-2 focus:ring-primary/20",
                    form.formState.errors.name && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {form.formState.errors.name && (
                  <p className="text-xs font-medium text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="organization">
                  {language === "bn" ? "প্রতিষ্ঠান / কোম্পানি" : "Organization / Company"}
                  <span className="text-destructive ml-0.5">*</span>
                </Label>
                <Input
                  id="organization"
                  placeholder={language === "bn" ? "কোম্পানি বা প্রতিষ্ঠানের নাম" : "Company or institution name"}
                  {...form.register("organization")}
                  disabled={isSubmitting}
                  className={cn(
                    "transition-all duration-200 focus:ring-2 focus:ring-primary/20",
                    form.formState.errors.organization && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {form.formState.errors.organization && (
                  <p className="text-xs font-medium text-destructive">{form.formState.errors.organization.message}</p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">
                    {language === "bn" ? "ফোন নম্বর" : "Phone Number"}
                    <span className="text-destructive ml-0.5">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+880 1XXX-XXXXXX"
                    {...form.register("phone")}
                    disabled={isSubmitting}
                    className={cn(
                      "transition-all duration-200 focus:ring-2 focus:ring-primary/20",
                      form.formState.errors.phone && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  {form.formState.errors.phone && (
                    <p className="text-xs font-medium text-destructive">{form.formState.errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">
                    {language === "bn" ? "ইমেইল ঠিকানা" : "Email Address"}
                    <span className="text-destructive ml-0.5">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    {...form.register("email")}
                    disabled={isSubmitting}
                    className={cn(
                      "transition-all duration-200 focus:ring-2 focus:ring-primary/20",
                      form.formState.errors.email && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  {form.formState.errors.email && (
                    <p className="text-xs font-medium text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="requirements">
                  {language === "bn" ? "পণ্য / প্রয়োজনীয়তা" : "Product / Requirements"}
                  <span className="text-destructive ml-0.5">*</span>
                </Label>
                <Textarea
                  id="requirements"
                  placeholder={language === "bn" ? "আপনার প্রয়োজনীয় পণ্য বা সরঞ্জাম বর্ণনা করুন..." : "Describe the products or equipment you need..."}
                  {...form.register("requirements")}
                  disabled={isSubmitting}
                  className={cn(
                    "min-h-[100px] resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20",
                    form.formState.errors.requirements && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {form.formState.errors.requirements && (
                  <p className="text-xs font-medium text-destructive">{form.formState.errors.requirements.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="quantity">
                  {language === "bn" ? "পরিমাণ" : "Quantity"}
                  <span className="text-muted-foreground text-xs font-normal ml-1.5">
                    ({language === "bn" ? "ঐচ্ছিক" : "Optional"})
                  </span>
                </Label>
                <Input
                  id="quantity"
                  placeholder={language === "bn" ? "যেমন, ১০ ইউনিট, ৫০ পিস" : "e.g., 10 units, 50 pieces"}
                  {...form.register("quantity")}
                  disabled={isSubmitting}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <Button
                type="submit"
                className="w-full active:scale-[0.98] transition-transform duration-200"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full animate-pulse" />
                    <span>{language === "bn" ? "জমা হচ্ছে..." : "Submitting..."}</span>
                  </div>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {language === "bn" ? "কোটেশন অনুরোধ করুন" : "Request a Quote"}
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                {language === "bn" ? "আমরা সাধারণত ২৪ ঘন্টার মধ্যে সাড়া দিই" : "We typically respond within 24 business hours"}
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickRfqForm;
