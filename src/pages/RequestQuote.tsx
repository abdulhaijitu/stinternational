import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Building2, 
  Package, 
  Truck, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Send
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

// Validation schemas for each step
const step1Schema = z.object({
  company_name: z.string().min(2, "Company name must be at least 2 characters").max(200),
  company_type: z.string().min(1, "Please select a company type"),
  contact_person: z.string().min(2, "Contact name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address").max(255),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(20),
});

const step2Schema = z.object({
  product_category: z.string().min(1, "Please select a product category"),
  product_details: z.string().min(10, "Please provide more details about your requirements").max(2000),
  quantity: z.string().min(1, "Please specify quantity requirements").max(200),
  budget_range: z.string().optional(),
});

const step3Schema = z.object({
  delivery_address: z.string().min(5, "Please provide a delivery address").max(500),
  delivery_city: z.string().min(2, "Please provide a city").max(100),
  delivery_urgency: z.string().min(1, "Please select delivery urgency"),
  preferred_payment: z.string().optional(),
  additional_notes: z.string().max(1000).optional(),
});

const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema);
type FormData = z.infer<typeof fullSchema>;

const RequestQuote = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const fontClass = language === "bn" ? "font-siliguri" : "";

  // Translated options
  const companyTypes = [
    { value: "university", label: t.rfq.university },
    { value: "research_lab", label: t.rfq.researchLab },
    { value: "hospital", label: t.rfq.hospital },
    { value: "factory", label: t.rfq.factory },
    { value: "government", label: t.rfq.government },
    { value: "school", label: t.rfq.school },
    { value: "ngo", label: t.rfq.ngo },
    { value: "private_business", label: t.rfq.privateBusiness },
    { value: "other", label: t.rfq.other },
  ];

  const productCategories = [
    { value: "laboratory", label: t.rfq.catLaboratory },
    { value: "measurement", label: t.rfq.catMeasurement },
    { value: "industrial", label: t.rfq.catIndustrial },
    { value: "educational", label: t.rfq.catEducational },
    { value: "safety", label: t.rfq.catSafety },
    { value: "chemicals", label: t.rfq.catChemicals },
    { value: "multiple", label: t.rfq.catMultiple },
    { value: "other", label: t.rfq.catOther },
  ];

  const deliveryUrgency = [
    { value: "urgent", label: t.rfq.urgent },
    { value: "within_week", label: t.rfq.within2Weeks },
    { value: "within_month", label: t.rfq.within1Month },
    { value: "flexible", label: t.rfq.flexible },
  ];

  const paymentMethods = [
    { value: "bank_transfer", label: t.rfq.bankTransfer },
    { value: "cash_on_delivery", label: t.rfq.cashOnDelivery },
    { value: "credit", label: t.rfq.creditTerms },
    { value: "lc", label: t.rfq.letterOfCredit },
  ];

  const budgetRanges = [
    { value: "under_50k", label: t.rfq.budgetUnder50k },
    { value: "50k_100k", label: t.rfq.budget50k100k },
    { value: "100k_500k", label: t.rfq.budget100k500k },
    { value: "500k_1m", label: t.rfq.budget500k1m },
    { value: "above_1m", label: t.rfq.budgetAbove1m },
    { value: "not_specified", label: t.rfq.budgetNotSpecified },
  ];

  const steps = [
    { id: 1, title: t.rfq.step1, icon: Building2 },
    { id: 2, title: t.rfq.step2, icon: Package },
    { id: 3, title: t.rfq.step3, icon: Truck },
    { id: 4, title: t.rfq.step4, icon: CheckCircle },
  ];

  const form = useForm<FormData>({
    resolver: zodResolver(fullSchema),
    mode: "onChange",
    defaultValues: {
      company_name: "",
      company_type: "",
      contact_person: "",
      email: "",
      phone: "",
      product_category: "",
      product_details: "",
      quantity: "",
      budget_range: "",
      delivery_address: "",
      delivery_city: "",
      delivery_urgency: "",
      preferred_payment: "",
      additional_notes: "",
    },
  });

  const { register, formState: { errors }, trigger, getValues, setValue, watch } = form;

  const validateStep = async (step: number): Promise<boolean> => {
    let fieldsToValidate: (keyof FormData)[] = [];
    
    switch (step) {
      case 1:
        fieldsToValidate = ["company_name", "company_type", "contact_person", "email", "phone"];
        break;
      case 2:
        fieldsToValidate = ["product_category", "product_details", "quantity"];
        break;
      case 3:
        fieldsToValidate = ["delivery_address", "delivery_city", "delivery_urgency"];
        break;
    }
    
    return await trigger(fieldsToValidate);
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Prevent double submission
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const values = getValues();
      const quoteId = crypto.randomUUID();

      // Prepare the payload with trimmed values
      const quotePayload = {
        id: quoteId,
        company_name: values.company_name.trim(),
        company_type: values.company_type,
        contact_person: values.contact_person.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        product_category: values.product_category,
        product_details: values.product_details.trim(),
        quantity: values.quantity.trim(),
        budget_range: values.budget_range || null,
        delivery_address: values.delivery_address.trim(),
        delivery_city: values.delivery_city.trim(),
        delivery_urgency: values.delivery_urgency,
        preferred_payment: values.preferred_payment || null,
        additional_notes: values.additional_notes?.trim() || null,
        user_id: user?.id || null,
        source_page: "request-quote",
        language: language,
      };

      // Insert into database (avoid .select().single() because guests can't SELECT their row via RLS)
      const { error: insertError } = await supabase
        .from("quote_requests")
        .insert(quotePayload);

      if (insertError) {
        console.error("Database insert error:", insertError);
        throw new Error(insertError.message || "Failed to save your request");
      }

      // Send email notifications (non-blocking, don't throw on failure)
      supabase.functions.invoke("send-quote-notification", {
        body: {
          type: "new_quote",
          quote: {
            id: quoteId,
            company_name: values.company_name.trim(),
            contact_person: values.contact_person.trim(),
            email: values.email.trim(),
            phone: values.phone.trim(),
            company_type: values.company_type,
            product_category: values.product_category,
            product_details: values.product_details.trim(),
            quantity: values.quantity.trim(),
            budget_range: values.budget_range,
            delivery_city: values.delivery_city.trim(),
            delivery_urgency: values.delivery_urgency,
          },
          language,
        },
      }).catch((emailError) => {
        // Log but don't block on email failure
        console.warn("Email notification failed (non-critical):", emailError);
      });

      toast.success(t.rfq.successMessage);
      navigate("/");
    } catch (error: unknown) {
      console.error("Error submitting quote request:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`${t.rfq.errorMessage} (${errorMessage})`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchedValues = watch();

  return (
    <Layout>
      <div className={`bg-muted/30 min-h-screen py-12 ${fontClass}`}>
        <div className="container-premium">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="mb-4">{t.rfq.title}</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t.rfq.subtitle}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="max-w-3xl mx-auto mb-10">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                        currentStep >= step.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <step.icon className="h-5 w-5" />
                    </div>
                    <span className={`text-xs mt-2 font-medium ${
                      currentStep >= step.id ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 w-16 md:w-24 lg:w-32 mx-2 transition-all duration-200 ${
                        currentStep > step.id ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Container */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
              {/* Step 1: Company Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">{t.rfq.companyInfo}</h2>
                    <p className="text-sm text-muted-foreground">{t.rfq.tellUsAbout}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="company_name">
                        {t.rfq.companyName}
                        <span className="text-destructive ml-0.5">*</span>
                      </Label>
                      <Input
                        id="company_name"
                        {...register("company_name")}
                        placeholder={t.rfq.companyNamePlaceholder}
                        className={cn(errors.company_name && "border-destructive focus-visible:ring-destructive")}
                      />
                      {errors.company_name && (
                        <p className="text-xs font-medium text-destructive">{errors.company_name.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="company_type">
                        {t.rfq.organizationType}
                        <span className="text-destructive ml-0.5">*</span>
                      </Label>
                      <Select
                        value={watchedValues.company_type}
                        onValueChange={(value) => setValue("company_type", value, { shouldValidate: true })}
                      >
                        <SelectTrigger className={cn(errors.company_type && "border-destructive focus-visible:ring-destructive")}>
                          <SelectValue placeholder={t.rfq.selectOrganization} />
                        </SelectTrigger>
                        <SelectContent>
                          {companyTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.company_type && (
                        <p className="text-xs font-medium text-destructive">{errors.company_type.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="contact_person">
                        {t.rfq.contactPerson}
                        <span className="text-destructive ml-0.5">*</span>
                      </Label>
                      <Input
                        id="contact_person"
                        {...register("contact_person")}
                        placeholder={t.rfq.contactPersonPlaceholder}
                        className={cn(errors.contact_person && "border-destructive focus-visible:ring-destructive")}
                      />
                      {errors.contact_person && (
                        <p className="text-xs font-medium text-destructive">{errors.contact_person.message}</p>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="email">
                          {t.rfq.emailAddress}
                          <span className="text-destructive ml-0.5">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          {...register("email")}
                          placeholder={t.rfq.emailPlaceholder}
                          className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
                        />
                        {errors.email && (
                          <p className="text-xs font-medium text-destructive">{errors.email.message}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone">
                          {t.rfq.phoneNumber}
                          <span className="text-destructive ml-0.5">*</span>
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          {...register("phone")}
                          placeholder={t.rfq.phonePlaceholder}
                          className={cn(errors.phone && "border-destructive focus-visible:ring-destructive")}
                        />
                        {errors.phone && (
                          <p className="text-xs font-medium text-destructive">{errors.phone.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Product Requirements */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">{t.rfq.productRequirements}</h2>
                    <p className="text-sm text-muted-foreground">{t.rfq.describeNeeds}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="product_category">
                        {t.rfq.productCategory}
                        <span className="text-destructive ml-0.5">*</span>
                      </Label>
                      <Select
                        value={watchedValues.product_category}
                        onValueChange={(value) => setValue("product_category", value, { shouldValidate: true })}
                      >
                        <SelectTrigger className={cn(errors.product_category && "border-destructive focus-visible:ring-destructive")}>
                          <SelectValue placeholder={t.rfq.selectCategory} />
                        </SelectTrigger>
                        <SelectContent>
                          {productCategories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.product_category && (
                        <p className="text-xs font-medium text-destructive">{errors.product_category.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="product_details">
                        {t.rfq.productDetails}
                        <span className="text-destructive ml-0.5">*</span>
                      </Label>
                      <Textarea
                        id="product_details"
                        {...register("product_details")}
                        placeholder={t.rfq.productDetailsPlaceholder}
                        className={cn("min-h-[120px]", errors.product_details && "border-destructive focus-visible:ring-destructive")}
                      />
                      {errors.product_details && (
                        <p className="text-xs font-medium text-destructive">{errors.product_details.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="quantity">
                        {t.rfq.quantityRequired}
                        <span className="text-destructive ml-0.5">*</span>
                      </Label>
                      <Input
                        id="quantity"
                        {...register("quantity")}
                        placeholder={t.rfq.quantityPlaceholder}
                        className={cn(errors.quantity && "border-destructive focus-visible:ring-destructive")}
                      />
                      {errors.quantity && (
                        <p className="text-xs font-medium text-destructive">{errors.quantity.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="budget_range">
                        {t.rfq.budgetRange}
                        <span className="text-muted-foreground text-xs font-normal ml-1.5">
                          ({language === "bn" ? "ঐচ্ছিক" : "Optional"})
                        </span>
                      </Label>
                      <Select
                        value={watchedValues.budget_range}
                        onValueChange={(value) => setValue("budget_range", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t.rfq.selectBudget} />
                        </SelectTrigger>
                        <SelectContent>
                          {budgetRanges.map((range) => (
                            <SelectItem key={range.value} value={range.value}>
                              {range.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Delivery Preferences */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">{t.rfq.deliveryPreferences}</h2>
                    <p className="text-sm text-muted-foreground">{t.rfq.whereWhen}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="delivery_address">
                        {t.rfq.deliveryAddress}
                        <span className="text-destructive ml-0.5">*</span>
                      </Label>
                      <Textarea
                        id="delivery_address"
                        {...register("delivery_address")}
                        placeholder={t.rfq.addressPlaceholder}
                        className={cn(errors.delivery_address && "border-destructive focus-visible:ring-destructive")}
                      />
                      {errors.delivery_address && (
                        <p className="text-xs font-medium text-destructive">{errors.delivery_address.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="delivery_city">
                        {t.rfq.deliveryCity}
                        <span className="text-destructive ml-0.5">*</span>
                      </Label>
                      <Input
                        id="delivery_city"
                        {...register("delivery_city")}
                        placeholder={t.rfq.cityPlaceholder}
                        className={cn(errors.delivery_city && "border-destructive focus-visible:ring-destructive")}
                      />
                      {errors.delivery_city && (
                        <p className="text-xs font-medium text-destructive">{errors.delivery_city.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="delivery_urgency">
                        {t.rfq.deliveryTimeline}
                        <span className="text-destructive ml-0.5">*</span>
                      </Label>
                      <Select
                        value={watchedValues.delivery_urgency}
                        onValueChange={(value) => setValue("delivery_urgency", value, { shouldValidate: true })}
                      >
                        <SelectTrigger className={cn(errors.delivery_urgency && "border-destructive focus-visible:ring-destructive")}>
                          <SelectValue placeholder={t.rfq.timelinePlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {deliveryUrgency.map((urgency) => (
                            <SelectItem key={urgency.value} value={urgency.value}>
                              {urgency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.delivery_urgency && (
                        <p className="text-xs font-medium text-destructive">{errors.delivery_urgency.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="preferred_payment">
                        {t.rfq.preferredPayment}
                        <span className="text-muted-foreground text-xs font-normal ml-1.5">
                          ({language === "bn" ? "ঐচ্ছিক" : "Optional"})
                        </span>
                      </Label>
                      <Select
                        value={watchedValues.preferred_payment}
                        onValueChange={(value) => setValue("preferred_payment", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t.rfq.paymentPlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method.value} value={method.value}>
                              {method.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="additional_notes">
                        {t.rfq.additionalNotes}
                        <span className="text-muted-foreground text-xs font-normal ml-1.5">
                          ({language === "bn" ? "ঐচ্ছিক" : "Optional"})
                        </span>
                      </Label>
                      <Textarea
                        id="additional_notes"
                        {...register("additional_notes")}
                        placeholder={t.rfq.notesPlaceholder}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Confirmation */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">{t.rfq.reviewRequest}</h2>
                    <p className="text-sm text-muted-foreground">{t.rfq.verifyInfo}</p>
                  </div>

                  <div className="space-y-6">
                    {/* Company Info Summary */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {t.rfq.companyInfoSummary}
                      </h4>
                      <dl className="grid grid-cols-2 gap-2 text-sm">
                        <dt className="text-muted-foreground">{t.rfq.company}:</dt>
                        <dd className="font-medium">{watchedValues.company_name}</dd>
                        <dt className="text-muted-foreground">{t.rfq.type}:</dt>
                        <dd className="font-medium">{companyTypes.find(t => t.value === watchedValues.company_type)?.label}</dd>
                        <dt className="text-muted-foreground">{t.rfq.contact}:</dt>
                        <dd className="font-medium">{watchedValues.contact_person}</dd>
                        <dt className="text-muted-foreground">{t.rfq.email}:</dt>
                        <dd className="font-medium">{watchedValues.email}</dd>
                        <dt className="text-muted-foreground">{t.rfq.phone}:</dt>
                        <dd className="font-medium">{watchedValues.phone}</dd>
                      </dl>
                    </div>

                    {/* Product Requirements Summary */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        {t.rfq.productReqSummary}
                      </h4>
                      <dl className="space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <dt className="text-muted-foreground">{t.rfq.category}:</dt>
                          <dd className="font-medium">{productCategories.find(c => c.value === watchedValues.product_category)?.label}</dd>
                          <dt className="text-muted-foreground">{t.rfq.quantity}:</dt>
                          <dd className="font-medium">{watchedValues.quantity}</dd>
                          {watchedValues.budget_range && (
                            <>
                              <dt className="text-muted-foreground">{t.rfq.budget}:</dt>
                              <dd className="font-medium">{budgetRanges.find(b => b.value === watchedValues.budget_range)?.label}</dd>
                            </>
                          )}
                        </div>
                        <div>
                          <dt className="text-muted-foreground mb-1">{t.rfq.details}:</dt>
                          <dd className="font-medium bg-background p-2 rounded text-sm">{watchedValues.product_details}</dd>
                        </div>
                      </dl>
                    </div>

                    {/* Delivery Summary */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        {t.rfq.deliveryPrefSummary}
                      </h4>
                      <dl className="grid grid-cols-2 gap-2 text-sm">
                        <dt className="text-muted-foreground">{t.rfq.city}:</dt>
                        <dd className="font-medium">{watchedValues.delivery_city}</dd>
                        <dt className="text-muted-foreground">{t.rfq.timeline}:</dt>
                        <dd className="font-medium">{deliveryUrgency.find(u => u.value === watchedValues.delivery_urgency)?.label}</dd>
                        {watchedValues.preferred_payment && (
                          <>
                            <dt className="text-muted-foreground">{t.rfq.payment}:</dt>
                            <dd className="font-medium">{paymentMethods.find(p => p.value === watchedValues.preferred_payment)?.label}</dd>
                          </>
                        )}
                      </dl>
                      <div className="mt-2 text-sm">
                        <dt className="text-muted-foreground mb-1">{t.rfq.address}:</dt>
                        <dd className="font-medium">{watchedValues.delivery_address}</dd>
                      </div>
                      {watchedValues.additional_notes && (
                        <div className="mt-2 text-sm">
                          <dt className="text-muted-foreground mb-1">{t.rfq.notes}:</dt>
                          <dd className="font-medium">{watchedValues.additional_notes}</dd>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                {currentStep > 1 ? (
                  <Button variant="outline" onClick={prevStep} className="active:scale-95">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t.rfq.previous}
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < 4 ? (
                  <Button onClick={nextStep} className="active:scale-95">
                    {t.rfq.next}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    variant="default" 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="active:scale-95"
                  >
                    {isSubmitting ? (
                      <>{t.rfq.submitting}</>
                    ) : (
                      <>
                        {t.rfq.submitRequest}
                        <Send className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>{t.rfq.needAssistance}{" "}
                <a href="tel:+8801715575665" className="text-primary hover:text-accent font-medium">
                  01715-575665
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RequestQuote;
