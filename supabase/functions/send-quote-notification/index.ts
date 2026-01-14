import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface QuoteNotificationRequest {
  type: "new_quote" | "quote_response";
  quote: {
    id: string;
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
  };
  admin_email?: string;
  response_message?: string;
  language?: "en" | "bn";
}

const ADMIN_EMAIL = "info@stinternationalbd.com";

// Bilingual email templates
const getQuoteConfirmationEmail = (quote: QuoteNotificationRequest["quote"], language: "en" | "bn" = "en") => {
  if (language === "bn") {
    return {
      subject: "আমরা আপনার কোটেশন অনুরোধ পেয়েছি - ST International",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a365d; border-bottom: 2px solid #d97706; padding-bottom: 10px;">
            আপনার অনুরোধের জন্য ধন্যবাদ
          </h1>
          
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a365d; border-bottom: 2px solid #d97706; padding-bottom: 10px;">
          Thank You for Your Request
        </h1>
        
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

const getQuoteResponseEmail = (quote: QuoteNotificationRequest["quote"], responseMessage: string, language: "en" | "bn" = "en") => {
  if (language === "bn") {
    return {
      subject: "আপনার কোটেশন অনুরোধের প্রতিক্রিয়া - ST International",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a365d; border-bottom: 2px solid #d97706; padding-bottom: 10px;">
            কোটেশন অনুরোধ আপডেট
          </h1>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            প্রিয় ${quote.contact_person},
          </p>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            ST International-এ আপনার আগ্রহের জন্য ধন্যবাদ। আমরা ${quote.company_name}-এর জন্য 
            আপনার কোটেশন অনুরোধ পর্যালোচনা করেছি।
          </p>
          
          <div style="margin: 24px 0; padding: 16px; background-color: #f9fafb; border-radius: 6px;">
            <p style="margin: 0; color: #374151; white-space: pre-wrap;">${responseMessage}</p>
          </div>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            কোনো প্রশ্ন থাকলে বা এগিয়ে যেতে চাইলে, অনুগ্রহ করে আমাদের সাথে যোগাযোগ করুন:
          </p>
          
          <p style="color: #4b5563; font-size: 16px;">
            📞 ফোন: <a href="tel:+8801715575665" style="color: #2563eb;">+৮৮০ ১৭১৫-৫৭৫৬৬৫</a><br>
            ✉️ ইমেইল: <a href="mailto:info@stinternationalbd.com" style="color: #2563eb;">info@stinternationalbd.com</a>
          </p>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-top: 24px;">
            শুভেচ্ছান্তে,<br>
            <strong>ST International টিম</strong>
          </p>
        </div>
      `,
    };
  }

  return {
    subject: "Response to Your Quote Request - ST International",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a365d; border-bottom: 2px solid #d97706; padding-bottom: 10px;">
          Quote Request Update
        </h1>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Dear ${quote.contact_person},
        </p>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Thank you for your interest in ST International. We have reviewed your quote request 
          for ${quote.company_name}.
        </p>
        
        <div style="margin: 24px 0; padding: 16px; background-color: #f9fafb; border-radius: 6px;">
          <p style="margin: 0; color: #374151; white-space: pre-wrap;">${responseMessage}</p>
        </div>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          If you have any questions or would like to proceed, please contact us:
        </p>
        
        <p style="color: #4b5563; font-size: 16px;">
          📞 Phone: <a href="tel:+8801715575665" style="color: #2563eb;">+880 1715-575665</a><br>
          ✉️ Email: <a href="mailto:info@stinternationalbd.com" style="color: #2563eb;">info@stinternationalbd.com</a>
        </p>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-top: 24px;">
          Best regards,<br>
          <strong>The ST International Team</strong>
        </p>
      </div>
    `,
  };
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, quote, admin_email, response_message, language = "en" }: QuoteNotificationRequest = await req.json();

    if (type === "new_quote") {
      // Send notification to admin (always in English)
      const adminEmailResponse = await resend.emails.send({
        from: "ST International <onboarding@resend.dev>",
        to: [admin_email || ADMIN_EMAIL],
        subject: `New Quote Request from ${quote.company_name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a365d; border-bottom: 2px solid #d97706; padding-bottom: 10px;">
              New Quote Request
            </h1>
            
            <h2 style="color: #374151; margin-top: 24px;">Company Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Company:</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${quote.company_name}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Type:</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${quote.company_type}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Contact:</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${quote.contact_person}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Email:</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
                  <a href="mailto:${quote.email}" style="color: #2563eb;">${quote.email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Phone:</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
                  <a href="tel:${quote.phone}" style="color: #2563eb;">${quote.phone}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Language:</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${language === "bn" ? "Bangla (বাংলা)" : "English"}</td>
              </tr>
            </table>
            
            <h2 style="color: #374151; margin-top: 24px;">Product Requirements</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Category:</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${quote.product_category}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Quantity:</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${quote.quantity}</td>
              </tr>
              ${quote.budget_range ? `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Budget:</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${quote.budget_range}</td>
              </tr>
              ` : ''}
            </table>
            <div style="margin-top: 12px; padding: 12px; background-color: #f9fafb; border-radius: 6px;">
              <strong style="color: #374151;">Details:</strong>
              <p style="margin: 8px 0 0 0; color: #4b5563;">${quote.product_details}</p>
            </div>
            
            <h2 style="color: #374151; margin-top: 24px;">Delivery</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">City:</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${quote.delivery_city}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Urgency:</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${quote.delivery_urgency}</td>
              </tr>
            </table>
            
            <div style="margin-top: 24px; padding: 16px; background-color: #fef3c7; border-radius: 6px;">
              <p style="margin: 0; color: #92400e;">
                <strong>Action Required:</strong> Please respond to this quote request within 24 hours.
                ${language === "bn" ? "<br><em>Note: Customer prefers Bangla communication.</em>" : ""}
              </p>
            </div>
          </div>
        `,
      });

      // Send confirmation to customer in their preferred language
      const customerEmailTemplate = getQuoteConfirmationEmail(quote, language);
      const customerEmailResponse = await resend.emails.send({
        from: "ST International <onboarding@resend.dev>",
        to: [quote.email],
        subject: customerEmailTemplate.subject,
        html: customerEmailTemplate.html,
      });

      console.log("Admin email sent:", adminEmailResponse);
      console.log("Customer email sent:", customerEmailResponse);

      return new Response(
        JSON.stringify({ 
          success: true, 
          adminEmail: adminEmailResponse,
          customerEmail: customerEmailResponse 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } 
    
    if (type === "quote_response") {
      // Send response email to customer in their preferred language
      const responseEmailTemplate = getQuoteResponseEmail(quote, response_message || "", language);
      const responseEmailResult = await resend.emails.send({
        from: "ST International <onboarding@resend.dev>",
        to: [quote.email],
        subject: responseEmailTemplate.subject,
        html: responseEmailTemplate.html,
      });

      console.log("Response email sent:", responseEmailResult);

      return new Response(
        JSON.stringify({ success: true, email: responseEmailResult }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid notification type" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-quote-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
