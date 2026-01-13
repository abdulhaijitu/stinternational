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

const companyTypes = [
  { value: "university", label: "University / College" },
  { value: "research_lab", label: "Research Laboratory" },
  { value: "hospital", label: "Hospital / Medical Center" },
  { value: "factory", label: "Factory / Manufacturing" },
  { value: "government", label: "Government Institution" },
  { value: "school", label: "School / Educational Institute" },
  { value: "ngo", label: "NGO / Non-Profit" },
  { value: "private_business", label: "Private Business" },
  { value: "other", label: "Other" },
];

const productCategories = [
  { value: "laboratory", label: "Laboratory Equipment" },
  { value: "measurement", label: "Measurement Instruments" },
  { value: "industrial", label: "Industrial Equipment" },
  { value: "educational", label: "Educational Supplies" },
  { value: "safety", label: "Safety Equipment" },
  { value: "chemicals", label: "Chemicals & Reagents" },
  { value: "multiple", label: "Multiple Categories" },
  { value: "other", label: "Other" },
];

const deliveryUrgency = [
  { value: "urgent", label: "Urgent (Within 1 week)" },
  { value: "within_week", label: "Within 2 weeks" },
  { value: "within_month", label: "Within 1 month" },
  { value: "flexible", label: "Flexible / No Rush" },
];

const paymentMethods = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash_on_delivery", label: "Cash on Delivery" },
  { value: "credit", label: "Credit Terms (for institutions)" },
  { value: "lc", label: "Letter of Credit (LC)" },
];

const budgetRanges = [
  { value: "under_50k", label: "Under ৳50,000" },
  { value: "50k_100k", label: "৳50,000 - ৳100,000" },
  { value: "100k_500k", label: "৳100,000 - ৳500,000" },
  { value: "500k_1m", label: "৳500,000 - ৳10,00,000" },
  { value: "above_1m", label: "Above ৳10,00,000" },
  { value: "not_specified", label: "Prefer not to specify" },
];

const steps = [
  { id: 1, title: "Company Info", icon: Building2 },
  { id: 2, title: "Requirements", icon: Package },
  { id: 3, title: "Delivery", icon: Truck },
  { id: 4, title: "Confirm", icon: CheckCircle },
];

const RequestQuote = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

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
    setIsSubmitting(true);
    
    try {
      const values = getValues();
      
      // Insert into database
      const { data: insertedQuote, error } = await supabase.from("quote_requests").insert({
        company_name: values.company_name,
        company_type: values.company_type,
        contact_person: values.contact_person,
        email: values.email,
        phone: values.phone,
        product_category: values.product_category,
        product_details: values.product_details,
        quantity: values.quantity,
        budget_range: values.budget_range || null,
        delivery_address: values.delivery_address,
        delivery_city: values.delivery_city,
        delivery_urgency: values.delivery_urgency,
        preferred_payment: values.preferred_payment || null,
        additional_notes: values.additional_notes || null,
        user_id: user?.id || null,
      }).select().single();

      if (error) throw error;

      // Send email notifications (don't block on failure)
      try {
        await supabase.functions.invoke("send-quote-notification", {
          body: {
            type: "new_quote",
            quote: {
              id: insertedQuote.id,
              company_name: values.company_name,
              contact_person: values.contact_person,
              email: values.email,
              phone: values.phone,
              company_type: values.company_type,
              product_category: values.product_category,
              product_details: values.product_details,
              quantity: values.quantity,
              budget_range: values.budget_range,
              delivery_city: values.delivery_city,
              delivery_urgency: values.delivery_urgency,
            },
          },
        });
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Don't fail the submission if email fails
      }

      toast.success("Quote request submitted successfully! We'll contact you within 24 hours.");
      navigate("/");
    } catch (error: any) {
      console.error("Error submitting quote request:", error);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchedValues = watch();

  return (
    <Layout>
      <div className="bg-muted/30 min-h-screen py-12">
        <div className="container-premium">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="mb-4">Request a Quote</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get personalized pricing for bulk orders and institutional purchases. 
              Our team will respond within 24 hours.
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
                    <h2 className="text-xl font-semibold mb-1">Company Information</h2>
                    <p className="text-sm text-muted-foreground">Tell us about your organization</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="company_name">Company / Institution Name *</Label>
                      <Input
                        id="company_name"
                        {...register("company_name")}
                        placeholder="e.g., Dhaka University"
                        className="mt-1.5"
                      />
                      {errors.company_name && (
                        <p className="text-sm text-destructive mt-1">{errors.company_name.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="company_type">Organization Type *</Label>
                      <Select
                        value={watchedValues.company_type}
                        onValueChange={(value) => setValue("company_type", value, { shouldValidate: true })}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select organization type" />
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
                        <p className="text-sm text-destructive mt-1">{errors.company_type.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="contact_person">Contact Person *</Label>
                      <Input
                        id="contact_person"
                        {...register("contact_person")}
                        placeholder="Your full name"
                        className="mt-1.5"
                      />
                      {errors.contact_person && (
                        <p className="text-sm text-destructive mt-1">{errors.contact_person.message}</p>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register("email")}
                          placeholder="you@company.com"
                          className="mt-1.5"
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          {...register("phone")}
                          placeholder="+880 1XXX XXXXXX"
                          className="mt-1.5"
                        />
                        {errors.phone && (
                          <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
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
                    <h2 className="text-xl font-semibold mb-1">Product Requirements</h2>
                    <p className="text-sm text-muted-foreground">Describe what you need</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="product_category">Product Category *</Label>
                      <Select
                        value={watchedValues.product_category}
                        onValueChange={(value) => setValue("product_category", value, { shouldValidate: true })}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select product category" />
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
                        <p className="text-sm text-destructive mt-1">{errors.product_category.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="product_details">Product Details *</Label>
                      <Textarea
                        id="product_details"
                        {...register("product_details")}
                        placeholder="Describe the products you need, including specific models, specifications, brands, etc."
                        className="mt-1.5 min-h-[120px]"
                      />
                      {errors.product_details && (
                        <p className="text-sm text-destructive mt-1">{errors.product_details.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="quantity">Quantity Requirements *</Label>
                      <Input
                        id="quantity"
                        {...register("quantity")}
                        placeholder="e.g., 10 units, 50-100 pieces, bulk quantity"
                        className="mt-1.5"
                      />
                      {errors.quantity && (
                        <p className="text-sm text-destructive mt-1">{errors.quantity.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="budget_range">Budget Range (Optional)</Label>
                      <Select
                        value={watchedValues.budget_range}
                        onValueChange={(value) => setValue("budget_range", value)}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select budget range (optional)" />
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
                    <h2 className="text-xl font-semibold mb-1">Delivery Preferences</h2>
                    <p className="text-sm text-muted-foreground">Where and when do you need it?</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="delivery_address">Delivery Address *</Label>
                      <Textarea
                        id="delivery_address"
                        {...register("delivery_address")}
                        placeholder="Full delivery address"
                        className="mt-1.5"
                      />
                      {errors.delivery_address && (
                        <p className="text-sm text-destructive mt-1">{errors.delivery_address.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="delivery_city">City *</Label>
                      <Input
                        id="delivery_city"
                        {...register("delivery_city")}
                        placeholder="e.g., Dhaka, Chittagong"
                        className="mt-1.5"
                      />
                      {errors.delivery_city && (
                        <p className="text-sm text-destructive mt-1">{errors.delivery_city.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="delivery_urgency">Delivery Timeline *</Label>
                      <Select
                        value={watchedValues.delivery_urgency}
                        onValueChange={(value) => setValue("delivery_urgency", value, { shouldValidate: true })}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="How soon do you need it?" />
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
                        <p className="text-sm text-destructive mt-1">{errors.delivery_urgency.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="preferred_payment">Preferred Payment Method (Optional)</Label>
                      <Select
                        value={watchedValues.preferred_payment}
                        onValueChange={(value) => setValue("preferred_payment", value)}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select payment method (optional)" />
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

                    <div>
                      <Label htmlFor="additional_notes">Additional Notes (Optional)</Label>
                      <Textarea
                        id="additional_notes"
                        {...register("additional_notes")}
                        placeholder="Any other requirements or questions"
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Confirmation */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Review Your Request</h2>
                    <p className="text-sm text-muted-foreground">Please verify the information before submitting</p>
                  </div>

                  <div className="space-y-6">
                    {/* Company Info Summary */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Company Information
                      </h4>
                      <dl className="grid grid-cols-2 gap-2 text-sm">
                        <dt className="text-muted-foreground">Company:</dt>
                        <dd className="font-medium">{watchedValues.company_name}</dd>
                        <dt className="text-muted-foreground">Type:</dt>
                        <dd className="font-medium">{companyTypes.find(t => t.value === watchedValues.company_type)?.label}</dd>
                        <dt className="text-muted-foreground">Contact:</dt>
                        <dd className="font-medium">{watchedValues.contact_person}</dd>
                        <dt className="text-muted-foreground">Email:</dt>
                        <dd className="font-medium">{watchedValues.email}</dd>
                        <dt className="text-muted-foreground">Phone:</dt>
                        <dd className="font-medium">{watchedValues.phone}</dd>
                      </dl>
                    </div>

                    {/* Product Requirements Summary */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Product Requirements
                      </h4>
                      <dl className="space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <dt className="text-muted-foreground">Category:</dt>
                          <dd className="font-medium">{productCategories.find(c => c.value === watchedValues.product_category)?.label}</dd>
                          <dt className="text-muted-foreground">Quantity:</dt>
                          <dd className="font-medium">{watchedValues.quantity}</dd>
                          {watchedValues.budget_range && (
                            <>
                              <dt className="text-muted-foreground">Budget:</dt>
                              <dd className="font-medium">{budgetRanges.find(b => b.value === watchedValues.budget_range)?.label}</dd>
                            </>
                          )}
                        </div>
                        <div>
                          <dt className="text-muted-foreground mb-1">Details:</dt>
                          <dd className="font-medium bg-background p-2 rounded text-sm">{watchedValues.product_details}</dd>
                        </div>
                      </dl>
                    </div>

                    {/* Delivery Summary */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Delivery Preferences
                      </h4>
                      <dl className="grid grid-cols-2 gap-2 text-sm">
                        <dt className="text-muted-foreground">City:</dt>
                        <dd className="font-medium">{watchedValues.delivery_city}</dd>
                        <dt className="text-muted-foreground">Timeline:</dt>
                        <dd className="font-medium">{deliveryUrgency.find(u => u.value === watchedValues.delivery_urgency)?.label}</dd>
                        {watchedValues.preferred_payment && (
                          <>
                            <dt className="text-muted-foreground">Payment:</dt>
                            <dd className="font-medium">{paymentMethods.find(p => p.value === watchedValues.preferred_payment)?.label}</dd>
                          </>
                        )}
                      </dl>
                      <div className="mt-2 text-sm">
                        <dt className="text-muted-foreground mb-1">Address:</dt>
                        <dd className="font-medium">{watchedValues.delivery_address}</dd>
                      </div>
                      {watchedValues.additional_notes && (
                        <div className="mt-2 text-sm">
                          <dt className="text-muted-foreground mb-1">Notes:</dt>
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
                    Previous
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < 4 ? (
                  <Button onClick={nextStep} className="active:scale-95">
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    variant="accent" 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="active:scale-95"
                  >
                    {isSubmitting ? (
                      <>Submitting...</>
                    ) : (
                      <>
                        Submit Request
                        <Send className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>Need immediate assistance? Call us at{" "}
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
