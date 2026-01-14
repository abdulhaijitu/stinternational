import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type PaymentMethod = "cash_on_delivery" | "bank_transfer" | "online_payment";

interface CreateOrderPayload {
  order: {
    status?: "pending_payment" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";
    payment_method: PaymentMethod;
    subtotal: number;
    shipping_cost: number;
    total: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    company_name?: string | null;
    shipping_address: string;
    shipping_city: string;
    shipping_postal_code?: string | null;
    notes?: string | null;
  };
  items: Array<{
    product_id: string;
    product_name: string;
    product_sku?: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

function generateOrderNumber() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `STI-${yyyy}${mm}${dd}-${rand}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";

    // Client for reading auth user from incoming token (if present)
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: authHeader ? { Authorization: authHeader } : {} },
    });

    // Admin client for DB writes (bypasses RLS)
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const payload: CreateOrderPayload = await req.json();

    if (!payload?.order || !payload?.items?.length) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine user_id from auth token (optional)
    let userId: string | null = null;
    if (authHeader?.toLowerCase().startsWith("bearer ")) {
      const { data } = await userClient.auth.getUser();
      userId = data.user?.id ?? null;
    }

    const orderId = crypto.randomUUID();
    const orderNumber = generateOrderNumber();

    const orderInsert = {
      id: orderId,
      user_id: userId,
      status: payload.order.status ?? ("pending_payment" as const),
      payment_method: payload.order.payment_method,
      subtotal: payload.order.subtotal,
      shipping_cost: payload.order.shipping_cost,
      total: payload.order.total,
      customer_name: payload.order.customer_name,
      customer_email: payload.order.customer_email,
      customer_phone: payload.order.customer_phone,
      company_name: payload.order.company_name ?? null,
      shipping_address: payload.order.shipping_address,
      shipping_city: payload.order.shipping_city,
      shipping_postal_code: payload.order.shipping_postal_code ?? null,
      notes: payload.order.notes ?? null,
      order_number: orderNumber,
    };

    const { error: orderError } = await adminClient.from("orders").insert(orderInsert);
    if (orderError) {
      return new Response(JSON.stringify({ error: orderError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const itemsInsert = payload.items.map((it) => ({
      order_id: orderId,
      product_id: it.product_id,
      product_name: it.product_name,
      product_sku: it.product_sku ?? null,
      quantity: it.quantity,
      unit_price: it.unit_price,
      total_price: it.total_price,
    }));

    const { error: itemsError } = await adminClient.from("order_items").insert(itemsInsert);
    if (itemsError) {
      // If items insert fails, mark order cancelled to avoid dangling unpaid orders
      await adminClient.from("orders").update({ status: "cancelled" }).eq("id", orderId);

      return new Response(JSON.stringify({ error: itemsError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ orderId, orderNumber }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
