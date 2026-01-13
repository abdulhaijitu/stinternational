import Layout from "@/components/layout/Layout";

const PrivacyPolicy = () => {
  return (
    <Layout>
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
                  Email: info@stinternational.com.bd<br />
                  Phone: +880 1234 567 890<br />
                  Address: 123 Bangla Motor, Dhaka-1000, Bangladesh
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
