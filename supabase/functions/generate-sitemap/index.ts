import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Product {
  slug: string;
  updated_at: string;
  image_url: string | null;
  name: string;
  name_bn: string | null;
}

interface Category {
  slug: string;
  updated_at: string;
  image_url: string | null;
  name: string;
  name_bn: string | null;
  parent_id: string | null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Primary production domain for all canonical URLs
    const baseUrl = "https://stinternationalbd.com";

    // Fetch all active products
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("slug, updated_at, image_url, name, name_bn")
      .eq("is_active", true)
      .order("updated_at", { ascending: false });

    if (productsError) {
      throw productsError;
    }

    // Fetch all active categories
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("slug, updated_at, image_url, name, name_bn, parent_id")
      .eq("is_active", true)
      .order("updated_at", { ascending: false });

    if (categoriesError) {
      throw categoriesError;
    }

    const today = new Date().toISOString().split("T")[0];

    // Generate XML sitemap
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/?lang=en"/>
    <xhtml:link rel="alternate" hreflang="bn" href="${baseUrl}/?lang=bn"/>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Static Pages -->
  <url>
    <loc>${baseUrl}/products</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/products?lang=en"/>
    <xhtml:link rel="alternate" hreflang="bn" href="${baseUrl}/products?lang=bn"/>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/categories</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/categories?lang=en"/>
    <xhtml:link rel="alternate" hreflang="bn" href="${baseUrl}/categories?lang=bn"/>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/about</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/about?lang=en"/>
    <xhtml:link rel="alternate" hreflang="bn" href="${baseUrl}/about?lang=bn"/>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/contact</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/contact?lang=en"/>
    <xhtml:link rel="alternate" hreflang="bn" href="${baseUrl}/contact?lang=bn"/>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/request-quote</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/request-quote?lang=en"/>
    <xhtml:link rel="alternate" hreflang="bn" href="${baseUrl}/request-quote?lang=bn"/>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/privacy-policy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/terms-conditions</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/refund-policy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
`;

    // Add category pages
    for (const category of (categories as Category[]) || []) {
      const lastMod = category.updated_at.split("T")[0];
      const isParent = !category.parent_id;
      
      sitemap += `
  <!-- Category: ${category.name} -->
  <url>
    <loc>${baseUrl}/category/${category.slug}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/category/${category.slug}?lang=en"/>
    <xhtml:link rel="alternate" hreflang="bn" href="${baseUrl}/category/${category.slug}?lang=bn"/>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${isParent ? "0.8" : "0.7"}</priority>${category.image_url ? `
    <image:image>
      <image:loc>${category.image_url}</image:loc>
      <image:title>${escapeXml(category.name)}</image:title>
    </image:image>` : ""}
  </url>`;
    }

    // Add product pages
    for (const product of (products as Product[]) || []) {
      const lastMod = product.updated_at.split("T")[0];
      
      sitemap += `
  <!-- Product: ${product.name} -->
  <url>
    <loc>${baseUrl}/product/${product.slug}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/product/${product.slug}?lang=en"/>
    <xhtml:link rel="alternate" hreflang="bn" href="${baseUrl}/product/${product.slug}?lang=bn"/>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>${product.image_url ? `
    <image:image>
      <image:loc>${product.image_url}</image:loc>
      <image:title>${escapeXml(product.name)}</image:title>
    </image:image>` : ""}
  </url>`;
    }

    sitemap += `
</urlset>`;

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate sitemap" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Helper function to escape XML special characters
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
