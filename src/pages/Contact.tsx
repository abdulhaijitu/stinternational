import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

const contactInfo = [
  {
    icon: MapPin,
    title: "Visit Us",
    details: ["123 Bangla Motor", "Dhaka-1000, Bangladesh"],
  },
  {
    icon: Phone,
    title: "Call Us",
    details: ["+880 1234 567 890", "+880 1234 567 891"],
  },
  {
    icon: Mail,
    title: "Email Us",
    details: ["info@stinternational.com.bd", "sales@stinternational.com.bd"],
  },
  {
    icon: Clock,
    title: "Business Hours",
    details: ["Saturday - Thursday", "9:00 AM - 6:00 PM"],
  },
];

const Contact = () => {
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
        <div className="container-premium py-16 md:py-20">
          <div className="max-w-2xl">
            <h1 className="mb-4">Contact Us</h1>
            <p className="text-lg text-primary-foreground/80">
              Have questions about our products or need a custom quote? 
              Our team is here to help you find the right solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 md:py-16">
        <div className="container-premium">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((item, index) => (
              <div key={index} className="bg-card border border-border rounded-lg p-6">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                {item.details.map((detail, i) => (
                  <p key={i} className="text-sm text-muted-foreground">{detail}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container-premium">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <div className="bg-card border border-border rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-2">Send us a Message</h2>
              <p className="text-muted-foreground mb-8">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full h-11 px-4 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full h-11 px-4 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full h-11 px-4 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="+880 1XXX XXX XXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Company / Institution</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full h-11 px-4 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Organization name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subject *</label>
                  <select
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full h-11 px-4 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select a subject</option>
                    <option value="product-inquiry">Product Inquiry</option>
                    <option value="quote-request">Quote Request</option>
                    <option value="bulk-order">Bulk Order</option>
                    <option value="technical-support">Technical Support</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message *</label>
                  <textarea
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder="Tell us about your requirements..."
                  />
                </div>
                <Button type="submit" variant="accent" size="lg" className="w-full sm:w-auto">
                  <Send className="h-4 w-4" />
                  Send Message
                </Button>
              </form>
            </div>

            {/* Map / Location Info */}
            <div className="space-y-8">
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                  <div className="text-center p-8">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Interactive map will be displayed here
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      123 Bangla Motor, Dhaka-1000
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-primary text-primary-foreground rounded-lg p-8">
                <h3 className="text-xl font-semibold mb-4">Why Choose ST International?</h3>
                <ul className="space-y-3 text-primary-foreground/80">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                    <span>19+ years of experience in Bangladesh</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                    <span>Authorized distributor for premium brands</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                    <span>Nationwide delivery and installation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                    <span>Dedicated after-sales support</span>
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
