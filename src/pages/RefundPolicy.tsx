import Layout from "@/components/layout/Layout";

const RefundPolicy = () => {
  return (
    <Layout>
      <section className="bg-muted/50 border-b border-border">
        <div className="container-premium py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold">Refund Policy</h1>
          <p className="text-muted-foreground mt-4">Last updated: January 2024</p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-premium">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">1. Return Eligibility</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Products may be returned within 7 days of delivery if they meet the following criteria:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Product is unused and in original packaging</li>
                  <li>All accessories and documentation are included</li>
                  <li>Product is not damaged due to customer handling</li>
                  <li>Return request is initiated within 7 days of delivery</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">2. Non-Returnable Items</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The following items cannot be returned:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Consumable products (chemicals, filter papers, test kits)</li>
                  <li>Custom or special-order items</li>
                  <li>Products with broken seals or damaged packaging</li>
                  <li>Items marked as "Final Sale"</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">3. Refund Process</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To initiate a return, please contact our customer service team with your order 
                  number and reason for return. Once we receive and inspect the returned item, 
                  we will process your refund within 7-10 business days. Refunds will be issued 
                  to the original payment method.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">4. Damaged or Defective Products</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you receive a damaged or defective product, please contact us within 48 hours 
                  of delivery with photographs of the damage. We will arrange for replacement or 
                  full refund including shipping costs.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">5. Shipping Costs</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For standard returns, the customer is responsible for return shipping costs. 
                  For defective or incorrectly shipped items, ST International will cover all 
                  shipping costs.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">6. Exchanges</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We offer exchanges for products of equal or greater value, subject to 
                  availability. Price differences must be paid before the exchange is processed.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">7. Contact for Returns</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To initiate a return or for questions about our refund policy:<br />
                  Email: info@stinternationalbd.com<br />
                  Phone: +880 2-7165562, 01715-575665<br />
                  Hours: Saturday - Thursday, 9:00 AM - 6:00 PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default RefundPolicy;
