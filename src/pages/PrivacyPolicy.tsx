import Layout from "@/components/layout/Layout";
import { PageSEO } from "@/components/seo/PageSEO";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <PageSEO 
        pageSlug="/privacy-policy"
        fallbackTitle={{
          en: "Privacy Policy - ST International",
          bn: "গোপনীয়তা নীতি - ST International"
        }}
        fallbackDescription={{
          en: "Read our privacy policy to understand how we collect, use, and protect your personal information.",
          bn: "আমরা কীভাবে আপনার ব্যক্তিগত তথ্য সংগ্রহ, ব্যবহার এবং সুরক্ষা করি তা বুঝতে আমাদের গোপনীয়তা নীতি পড়ুন।"
        }}
      />
      <section className="bg-muted/50 border-b border-border">
        <div className="container-premium py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground mt-4">Last updated: January 2024</p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-premium">
          <div className="max-w-3xl mx-auto prose prose-neutral">
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  At ST International, we collect information you provide directly to us, including:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Name, email address, phone number, and company information</li>
                  <li>Shipping and billing addresses</li>
                  <li>Payment information (processed securely through our payment partners)</li>
                  <li>Order history and preferences</li>
                  <li>Communications with our customer service team</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">2. How We Use Your Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use the information we collect to process orders, provide customer support, 
                  send order updates, and improve our services. We may also use your information 
                  to send promotional communications with your consent.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">3. Information Sharing</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We do not sell your personal information. We share information only with service 
                  providers who assist in our operations, such as shipping companies and payment 
                  processors, and only as necessary to fulfill your orders.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">4. Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your 
                  personal information against unauthorized access, alteration, disclosure, or 
                  destruction.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">5. Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You have the right to access, correct, or delete your personal information. 
                  You may also opt out of promotional communications at any time by contacting us 
                  or using the unsubscribe link in our emails.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">6. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have questions about this Privacy Policy, please contact us at:<br />
                  Email: info@stinternationalbd.com<br />
                  Phone: 01715-575665<br />
                  Address: Mamun Mansion, 52/2, Toyeanbee Circular Road, Hatkhola, Tikatuli, Dhaka-1203, Bangladesh
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PrivacyPolicy;
