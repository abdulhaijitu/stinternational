import { MapPin, Phone, Mail, Clock, Send, Building2, MessageCircle } from "lucide-react";
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PageSEO } from "@/components/seo/PageSEO";

const Contact = () => {
  const { t, language } = useLanguage();
  const fontClass = language === "bn" ? "font-siliguri" : "";

  const contactInfo = [
    {
      icon: MapPin,
      title: t.contact.visitUs,
      details: [
        "Mamun Mansion, 52/2,",
        "Toyeanbee Circular Road,",
        "Hatkhola, Tikatuli,",
        "Dhaka-1203, Bangladesh"
      ],
    },
    {
      icon: Phone,
      title: t.contact.callUs,
      details: [
        "01715-575665",
        "01713-297170"
      ],
      links: [
        { href: "tel:+8801715575665", text: "01715-575665" },
        { href: "tel:+8801713297170", text: "01713-297170" }
      ],
    },
    {
      icon: Mail,
      title: t.contact.emailUs,
      details: ["info@stinternationalbd.com"],
      links: [
        { href: "mailto:info@stinternationalbd.com", text: "info@stinternationalbd.com" }
      ],
    },
    {
      icon: Clock,
      title: t.contact.businessHours,
      details: [t.contact.satThurs, t.contact.businessTime],
    },
  ];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = language === "bn" ? "নাম আবশ্যক" : "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = language === "bn" ? "ইমেইল আবশ্যক" : "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = language === "bn" ? "সঠিক ইমেইল দিন" : "Enter a valid email";
    }
    
    if (!formData.subject) {
      newErrors.subject = language === "bn" ? "বিষয় নির্বাচন করুন" : "Please select a subject";
    }
    
    if (!formData.message.trim()) {
      newErrors.message = language === "bn" ? "বার্তা আবশ্যক" : "Message is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    // Simulate submission
    setTimeout(() => {
      toast.success(language === "bn" ? "বার্তা পাঠানো হয়েছে!" : "Message sent successfully!");
      setFormData({ name: "", email: "", phone: "", company: "", subject: "", message: "" });
      setSubmitting(false);
    }, 1000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  return (
    <Layout>
      <PageSEO 
        pageSlug="/contact"
        fallbackTitle={{
          en: "Contact Us - ST International | Get in Touch for Equipment Inquiries",
          bn: "যোগাযোগ করুন - ST International | যন্ত্রপাতি সম্পর্কে জানতে যোগাযোগ করুন"
        }}
        fallbackDescription={{
          en: "Contact ST International for scientific and industrial equipment inquiries. Visit our Dhaka office or reach us via phone and email.",
          bn: "বৈজ্ঞানিক এবং শিল্প যন্ত্রপাতি সম্পর্কে জানতে ST International-এ যোগাযোগ করুন।"
        }}
      />
      {/* Hero Section */}
      <section className="hero-gradient text-primary-foreground">
        <div className={`container-premium py-16 md:py-20 ${fontClass}`}>
          <div className="max-w-2xl">
            <h1 className="mb-4">{t.contact.title}</h1>
            <p className="text-lg text-primary-foreground/80">
              {t.contact.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 md:py-16">
        <div className={`container-premium ${fontClass}`}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((item, index) => (
              <div key={index} className="bg-card border border-border rounded-lg p-6">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                {item.links ? (
                  item.links.map((link, i) => (
                    <a 
                      key={i} 
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors block"
                    >
                      {link.text}
                    </a>
                  ))
                ) : (
                  item.details.map((detail, i) => (
                    <p key={i} className="text-sm text-muted-foreground">{detail}</p>
                  ))
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp CTA Section */}
      <section className="py-10 bg-[#25D366]/10 border-y border-[#25D366]/20">
        <div className={`container-premium ${fontClass}`}>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">
                  {language === "bn" ? "দ্রুত যোগাযোগ করুন" : "Quick Contact"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === "bn" ? "হোয়াটসঅ্যাপে মেসেজ করুন" : "Message us on WhatsApp"}
                </p>
              </div>
            </div>
            <a
              href="https://wa.me/8801715575665?text=Hello%2C%20I%20would%20like%20to%20inquire%20about%20your%20products."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#1da851] text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              <MessageCircle className="h-5 w-5" />
              {language === "bn" ? "হোয়াটসঅ্যাপে চ্যাট করুন" : "Chat on WhatsApp"}
            </a>
          </div>
        </div>
      </section>

      {/* Official Business Info Banner */}
      <section className="py-8 bg-muted/50 border-y border-border">
        <div className={`container-premium ${fontClass}`}>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-center md:text-left">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-primary shrink-0" />
              <span className="font-semibold">ST International</span>
            </div>
            <span className="hidden md:block text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">
              Hatkhola, Tikatuli, Dhaka-1203
            </span>
            <span className="hidden md:block text-muted-foreground">•</span>
            <a 
              href="tel:+8801715575665" 
              className="text-sm text-primary hover:text-accent transition-colors"
            >
              01715-575665
            </a>
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className={`container-premium ${fontClass}`}>
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <div className="bg-card border border-border rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-2">{t.contact.sendMessage}</h2>
              <p className="text-muted-foreground mb-8">
                {t.contact.formSubtitle}
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Row 1: Name & Email */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className={cn(errors.name && "text-destructive")}>
                      {t.contact.fullName} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder={t.contact.yourName}
                      className={cn(errors.name && "border-destructive focus-visible:ring-destructive")}
                    />
                    {errors.name && (
                      <p className="text-xs font-medium text-destructive">{errors.name}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className={cn(errors.email && "text-destructive")}>
                      {t.contact.email} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder={t.contact.yourEmail}
                      className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
                    />
                    {errors.email && (
                      <p className="text-xs font-medium text-destructive">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Row 2: Phone & Company */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">
                      {t.contact.phone} <span className="text-muted-foreground text-xs font-normal">({language === "bn" ? "ঐচ্ছিক" : "Optional"})</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder={t.contact.phonePlaceholder}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="company">
                      {t.contact.company} <span className="text-muted-foreground text-xs font-normal">({language === "bn" ? "ঐচ্ছিক" : "Optional"})</span>
                    </Label>
                    <Input
                      id="company"
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleChange("company", e.target.value)}
                      placeholder={t.contact.organizationName}
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <Label htmlFor="subject" className={cn(errors.subject && "text-destructive")}>
                    {t.contact.subject} <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(value) => handleChange("subject", value)}
                  >
                    <SelectTrigger 
                      id="subject"
                      className={cn(errors.subject && "border-destructive focus:ring-destructive")}
                    >
                      <SelectValue placeholder={t.contact.selectSubject} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product-inquiry">{t.contact.productInquiry}</SelectItem>
                      <SelectItem value="quote-request">{t.contact.quoteRequest}</SelectItem>
                      <SelectItem value="bulk-order">{t.contact.bulkOrder}</SelectItem>
                      <SelectItem value="technical-support">{t.contact.technicalSupport}</SelectItem>
                      <SelectItem value="other">{t.contact.other}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.subject && (
                    <p className="text-xs font-medium text-destructive">{errors.subject}</p>
                  )}
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <Label htmlFor="message" className={cn(errors.message && "text-destructive")}>
                    {t.contact.message} <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    rows={5}
                    placeholder={t.contact.messagePlaceholder}
                    className={cn(
                      "resize-none",
                      errors.message && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  {errors.message && (
                    <p className="text-xs font-medium text-destructive">{errors.message}</p>
                  )}
                </div>

                <Button type="submit" variant="accent" size="lg" className="w-full sm:w-auto" disabled={submitting}>
                  <Send className="h-4 w-4" />
                  {submitting 
                    ? (language === "bn" ? "পাঠানো হচ্ছে..." : "Sending...") 
                    : t.contact.sendButton
                  }
                </Button>
              </form>
            </div>

            {/* Map / Location Info */}
            <div className="space-y-8">
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d913.0574095376736!2d90.41523496951752!3d23.72547099969478!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8ebf1bace9d%3A0x1b1acf3e1c3f8c8e!2sToyenbee%20Circular%20Rd%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1705000000000!5m2!1sen!2sbd"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="ST International Location - Mamun Mansion, 52/2, Toyeanbee Circular Road, Hatkhola, Tikatuli, Dhaka-1203"
                  className="aspect-[4/3]"
                />
              </div>
              <div className="bg-primary text-primary-foreground rounded-lg p-8">
                <h3 className="text-xl font-semibold mb-4">{t.contact.whyChoose}</h3>
                <ul className="space-y-3 text-primary-foreground/80">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                    <span>{t.contact.experience}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                    <span>{t.contact.authorized}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                    <span>{t.contact.nationwide}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                    <span>{t.contact.afterSales}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
