import Layout from "@/components/layout/Layout";
import { PageSEO } from "@/components/seo/PageSEO";

const TermsConditions = () => {
  return (
    <Layout>
      <PageSEO 
        pageSlug="/terms-conditions"
        fallbackTitle={{
          en: "Terms & Conditions - ST International",
          bn: "শর্তাবলী - ST International"
        }}
        fallbackDescription={{
          en: "Read our terms and conditions for using ST International's website and services.",
          bn: "ST International-এর ওয়েবসাইট এবং সেবা ব্যবহারের জন্য আমাদের শর্তাবলী পড়ুন।"
        }}
      />
      <section className="bg-muted/50 border-b border-border">
        <div className="container-premium py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold">Terms & Conditions</h1>
          <p className="text-muted-foreground mt-4">Last updated: January 2024</p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-premium">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing and using the ST International website and services, you accept 
                  and agree to be bound by these Terms and Conditions. If you do not agree to 
                  these terms, please do not use our services.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">2. Products and Pricing</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  All prices displayed are in Bangladeshi Taka (BDT) and are subject to change 
                  without notice. We reserve the right to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Modify prices before order confirmation</li>
                  <li>Correct pricing errors</li>
                  <li>Limit quantities on certain products</li>
                  <li>Discontinue products without notice</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">3. Orders and Payment</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Orders are subject to acceptance and product availability. We accept Cash on 
                  Delivery (COD) and Bank Transfer payments. Payment must be received in full 
                  before shipping for bank transfer orders.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">4. Shipping and Delivery</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We ship nationwide within Bangladesh. Delivery times vary based on location 
                  and product availability. Shipping costs are calculated at checkout based on 
                  order weight and destination.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">5. Warranty and Returns</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Product warranties vary by manufacturer and are specified on individual product 
                  pages. Please refer to our Refund Policy for information about returns and 
                  exchanges.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">6. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  ST International shall not be liable for any indirect, incidental, or 
                  consequential damages arising from the use of our products or services. 
                  Our liability is limited to the purchase price of the product.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">7. Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All content on this website, including text, images, and logos, is the 
                  property of ST International or its licensors and is protected by intellectual 
                  property laws.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">8. Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For questions about these Terms & Conditions, please contact us at:<br />
                  Email: info@stinternationalbd.com<br />
                  Phone: 01715-575665
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default TermsConditions;
