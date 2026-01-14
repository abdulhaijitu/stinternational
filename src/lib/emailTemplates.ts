// Bilingual email templates for ST International

interface QuoteData {
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  company_type: string;
  product_category: string;
  product_details: string;
  quantity: string;
  budget_range?: string;
  delivery_city: string;
  delivery_urgency: string;
}

interface OrderData {
  order_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  shipping_address: string;
  shipping_city: string;
  payment_method: string;
}

// Common email styles
const emailStyles = `
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
`;

const headerStyles = `
  color: #1a365d;
  border-bottom: 2px solid #d97706;
  padding-bottom: 10px;
`;

const buttonStyles = `
  display: inline-block;
  padding: 12px 24px;
  background-color: #d97706;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
`;

// ============================================
// QUOTE REQUEST EMAILS
// ============================================

export const getQuoteConfirmationEmail = (quote: QuoteData, language: "en" | "bn" = "en") => {
  if (language === "bn") {
    return {
      subject: "আমরা আপনার কোটেশন অনুরোধ পেয়েছি - ST International",
      html: `
        <div style="${emailStyles}">
          <h1 style="${headerStyles}">আপনার অনুরোধের জন্য ধন্যবাদ</h1>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            প্রিয় ${quote.contact_person},
          </p>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            ST International-এ কোটেশন অনুরোধ জমা দেওয়ার জন্য ধন্যবাদ। আমরা আপনার জিজ্ঞাসা পেয়েছি 
            এবং আমাদের টিম শীঘ্রই আপনার প্রয়োজনীয়তা পর্যালোচনা করবে।
          </p>
          
          <div style="margin: 24px 0; padding: 16px; background-color: #f0fdf4; border-radius: 6px; border-left: 4px solid #22c55e;">
            <p style="margin: 0; color: #166534; font-weight: 600;">
              এরপর কী হবে?
            </p>
            <ul style="color: #166534; margin: 8px 0 0 0; padding-left: 20px;">
              <li>আমাদের টিম আপনার প্রয়োজনীয়তা পর্যালোচনা করবে</li>
              <li>আমরা আপনার জন্য একটি কাস্টমাইজড কোটেশন প্রস্তুত করব</li>
              <li>আপনি ২৪ ঘন্টার মধ্যে একটি প্রতিক্রিয়া পাবেন</li>
            </ul>
          </div>
          
          <h2 style="color: #374151; margin-top: 24px; font-size: 18px;">আপনার অনুরোধের সারসংক্ষেপ</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">কোম্পানি:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${quote.company_name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">ক্যাটাগরি:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${quote.product_category}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">পরিমাণ:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${quote.quantity}</td>
            </tr>
          </table>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            জরুরি কোনো প্রশ্ন থাকলে, অনুগ্রহ করে আমাদের সাথে যোগাযোগ করুন:
          </p>
          
          <p style="color: #4b5563; font-size: 16px;">
            📞 ফোন: <a href="tel:+8801715575665" style="color: #2563eb;">+৮৮০ ১৭১৫-৫৭৫৬৬৫</a><br>
            ✉️ ইমেইল: <a href="mailto:info@stinternationalbd.com" style="color: #2563eb;">info@stinternationalbd.com</a>
          </p>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-top: 24px;">
            শুভেচ্ছান্তে,<br>
            <strong>ST International টিম</strong>
          </p>
          
          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              ST International - বৈজ্ঞানিক ও শিল্প যন্ত্রপাতির আপনার বিশ্বস্ত অংশীদার<br>
              হাতখোলা, টিকাটুলি, ঢাকা-১২০৩, বাংলাদেশ
            </p>
          </div>
        </div>
      `,
    };
  }

  // English (default)
  return {
    subject: "We received your quote request - ST International",
    html: `
      <div style="${emailStyles}">
        <h1 style="${headerStyles}">Thank You for Your Request</h1>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Dear ${quote.contact_person},
        </p>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Thank you for submitting a quote request to ST International. We have received your inquiry 
          and our team will review your requirements shortly.
        </p>
        
        <div style="margin: 24px 0; padding: 16px; background-color: #f0fdf4; border-radius: 6px; border-left: 4px solid #22c55e;">
          <p style="margin: 0; color: #166534; font-weight: 600;">
            What happens next?
          </p>
          <ul style="color: #166534; margin: 8px 0 0 0; padding-left: 20px;">
            <li>Our team will review your requirements</li>
            <li>We'll prepare a customized quotation for you</li>
            <li>You'll receive a response within 24 hours</li>
          </ul>
        </div>
        
        <h2 style="color: #374151; margin-top: 24px; font-size: 18px;">Your Request Summary</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Company:</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${quote.company_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Category:</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${quote.product_category}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Quantity:</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${quote.quantity}</td>
          </tr>
        </table>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          If you have any urgent questions, please don't hesitate to contact us:
        </p>
        
        <p style="color: #4b5563; font-size: 16px;">
          📞 Phone: <a href="tel:+8801715575665" style="color: #2563eb;">+880 1715-575665</a><br>
          ✉️ Email: <a href="mailto:info@stinternationalbd.com" style="color: #2563eb;">info@stinternationalbd.com</a>
        </p>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-top: 24px;">
          Best regards,<br>
          <strong>The ST International Team</strong>
        </p>
        
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            ST International - Your Trusted Partner for Scientific & Industrial Equipment<br>
            Hatkhola, Tikatuli, Dhaka-1203, Bangladesh
          </p>
        </div>
      </div>
    `,
  };
};

// ============================================
// ORDER CONFIRMATION EMAILS
// ============================================

export const getOrderConfirmationEmail = (order: OrderData, language: "en" | "bn" = "en") => {
  const formatPrice = (price: number) => `৳${price.toLocaleString()}`;
  
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatPrice(item.price * item.quantity)}</td>
    </tr>
  `).join("");

  if (language === "bn") {
    const paymentMethodBn: Record<string, string> = {
      cash_on_delivery: "ক্যাশ অন ডেলিভারি",
      bank_transfer: "ব্যাংক ট্রান্সফার",
      online_payment: "অনলাইন পেমেন্ট",
    };

    return {
      subject: `অর্ডার নিশ্চিত হয়েছে #${order.order_number} - ST International`,
      html: `
        <div style="${emailStyles}">
          <h1 style="${headerStyles}">অর্ডার নিশ্চিত হয়েছে!</h1>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            প্রিয় ${order.customer_name},
          </p>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            আপনার অর্ডারের জন্য ধন্যবাদ! আমরা আপনার অর্ডার পেয়েছি এবং শীঘ্রই প্রসেস করব।
          </p>
          
          <div style="margin: 24px 0; padding: 16px; background-color: #fef3c7; border-radius: 6px;">
            <p style="margin: 0; font-weight: 600; color: #92400e;">
              অর্ডার নম্বর: #${order.order_number}
            </p>
          </div>
          
          <h2 style="color: #374151; margin-top: 24px; font-size: 18px;">অর্ডারের বিবরণ</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <thead>
              <tr style="background-color: #f9fafb;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">পণ্য</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">পরিমাণ</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">মূল্য</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr style="background-color: #f9fafb;">
                <td colspan="2" style="padding: 12px; font-weight: 600; text-align: right;">মোট:</td>
                <td style="padding: 12px; font-weight: 600; text-align: right;">${formatPrice(order.total)}</td>
              </tr>
            </tfoot>
          </table>
          
          <h2 style="color: #374151; margin-top: 24px; font-size: 18px;">ডেলিভারি তথ্য</h2>
          <p style="color: #4b5563; font-size: 16px;">
            <strong>ঠিকানা:</strong> ${order.shipping_address}, ${order.shipping_city}<br>
            <strong>পেমেন্ট পদ্ধতি:</strong> ${paymentMethodBn[order.payment_method] || order.payment_method}
          </p>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-top: 24px;">
            কোনো প্রশ্ন থাকলে আমাদের সাথে যোগাযোগ করুন।
          </p>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            শুভেচ্ছান্তে,<br>
            <strong>ST International টিম</strong>
          </p>
          
          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              ST International - বৈজ্ঞানিক ও শিল্প যন্ত্রপাতির আপনার বিশ্বস্ত অংশীদার
            </p>
          </div>
        </div>
      `,
    };
  }

  // English (default)
  const paymentMethodEn: Record<string, string> = {
    cash_on_delivery: "Cash on Delivery",
    bank_transfer: "Bank Transfer",
    online_payment: "Online Payment",
  };

  return {
    subject: `Order Confirmed #${order.order_number} - ST International`,
    html: `
      <div style="${emailStyles}">
        <h1 style="${headerStyles}">Order Confirmed!</h1>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Dear ${order.customer_name},
        </p>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Thank you for your order! We have received it and will process it shortly.
        </p>
        
        <div style="margin: 24px 0; padding: 16px; background-color: #fef3c7; border-radius: 6px;">
          <p style="margin: 0; font-weight: 600; color: #92400e;">
            Order Number: #${order.order_number}
          </p>
        </div>
        
        <h2 style="color: #374151; margin-top: 24px; font-size: 18px;">Order Details</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <thead>
            <tr style="background-color: #f9fafb;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Product</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Qty</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr style="background-color: #f9fafb;">
              <td colspan="2" style="padding: 12px; font-weight: 600; text-align: right;">Total:</td>
              <td style="padding: 12px; font-weight: 600; text-align: right;">${formatPrice(order.total)}</td>
            </tr>
          </tfoot>
        </table>
        
        <h2 style="color: #374151; margin-top: 24px; font-size: 18px;">Delivery Information</h2>
        <p style="color: #4b5563; font-size: 16px;">
          <strong>Address:</strong> ${order.shipping_address}, ${order.shipping_city}<br>
          <strong>Payment Method:</strong> ${paymentMethodEn[order.payment_method] || order.payment_method}
        </p>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-top: 24px;">
          If you have any questions, please don't hesitate to contact us.
        </p>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Best regards,<br>
          <strong>The ST International Team</strong>
        </p>
        
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            ST International - Your Trusted Partner for Scientific & Industrial Equipment
          </p>
        </div>
      </div>
    `,
  };
};

// ============================================
// ORDER STATUS UPDATE EMAILS
// ============================================

export const getOrderStatusUpdateEmail = (
  orderNumber: string,
  customerName: string,
  status: string,
  language: "en" | "bn" = "en"
) => {
  const statusLabels = {
    en: {
      pending_payment: "Pending Payment",
      paid: "Payment Confirmed",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    },
    bn: {
      pending_payment: "পেমেন্ট বাকি",
      paid: "পেমেন্ট নিশ্চিত হয়েছে",
      processing: "প্রসেসিং চলছে",
      shipped: "শিপিং হয়েছে",
      delivered: "ডেলিভারি সম্পন্ন",
      cancelled: "বাতিল করা হয়েছে",
    },
  };

  const statusLabel = statusLabels[language][status as keyof typeof statusLabels.en] || status;

  if (language === "bn") {
    return {
      subject: `অর্ডার #${orderNumber} আপডেট: ${statusLabel}`,
      html: `
        <div style="${emailStyles}">
          <h1 style="${headerStyles}">অর্ডার স্ট্যাটাস আপডেট</h1>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            প্রিয় ${customerName},
          </p>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            আপনার অর্ডার #${orderNumber} এর স্ট্যাটাস আপডেট হয়েছে:
          </p>
          
          <div style="margin: 24px 0; padding: 20px; background-color: #f0fdf4; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 24px; font-weight: 600; color: #166534;">
              ${statusLabel}
            </p>
          </div>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            আপনার অর্ডার সম্পর্কে কোনো প্রশ্ন থাকলে আমাদের সাথে যোগাযোগ করুন।
          </p>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            শুভেচ্ছান্তে,<br>
            <strong>ST International টিম</strong>
          </p>
        </div>
      `,
    };
  }

  return {
    subject: `Order #${orderNumber} Update: ${statusLabel}`,
    html: `
      <div style="${emailStyles}">
        <h1 style="${headerStyles}">Order Status Update</h1>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Dear ${customerName},
        </p>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Your order #${orderNumber} has been updated:
        </p>
        
        <div style="margin: 24px 0; padding: 20px; background-color: #f0fdf4; border-radius: 8px; text-align: center;">
          <p style="margin: 0; font-size: 24px; font-weight: 600; color: #166534;">
            ${statusLabel}
          </p>
        </div>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          If you have any questions about your order, please contact us.
        </p>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Best regards,<br>
          <strong>The ST International Team</strong>
        </p>
      </div>
    `,
  };
};
