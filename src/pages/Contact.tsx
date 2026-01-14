import { MapPin, Phone, Mail, Clock, Send, Building2 } from "lucide-react";
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

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
        "+880 2-7165562 (Office)",
        "01715-575665",
        "01713-297170"
      ],
      links: [
        { href: "tel:+88027165562", text: "+880 2-7165562" },
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Layout>
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
              href="tel:+88027165562" 
              className="text-sm text-primary hover:text-accent transition-colors"
            >
              +880 2-7165562
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
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t.contact.fullName} *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full h-11 px-4 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder={t.contact.yourName}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t.contact.email} *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full h-11 px-4 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder={t.contact.yourEmail}
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t.contact.phone}</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full h-11 px-4 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder={t.contact.phonePlaceholder}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t.contact.company}</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full h-11 px-4 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder={t.contact.organizationName}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.contact.subject} *</label>
                  <select
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full h-11 px-4 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">{t.contact.selectSubject}</option>
                    <option value="product-inquiry">{t.contact.productInquiry}</option>
                    <option value="quote-request">{t.contact.quoteRequest}</option>
                    <option value="bulk-order">{t.contact.bulkOrder}</option>
                    <option value="technical-support">{t.contact.technicalSupport}</option>
                    <option value="other">{t.contact.other}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.contact.message} *</label>
                  <textarea
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder={t.contact.messagePlaceholder}
                  />
                </div>
                <Button type="submit" variant="accent" size="lg" className="w-full sm:w-auto">
                  <Send className="h-4 w-4" />
                  {t.contact.sendButton}
                </Button>
              </form>
            </div>

            {/* Map / Location Info */}
            <div className="space-y-8">
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3652.2366881853287!2d90.40957897601694!3d23.727082778676587!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8f03e5b1f5b%3A0x6b0b6f1d8a2b3c4d!2sHatkhola%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1704884400000!5m2!1sen!2sbd"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="ST International Location - Hatkhola, Tikatuli, Dhaka"
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
