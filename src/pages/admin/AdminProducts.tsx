import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/formatPrice";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  sku: string | null;
  in_stock: boolean;
  stock_quantity: number;
  is_active: boolean;
  image_url: string | null;
  category: { name: string } | null;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id, name, slug, price, sku, in_stock, stock_quantity, is_active, image_url,
          category:categories(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("পণ্য লোড করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" মুছে ফেলতে চান?`)) return;

    setDeleting(id);
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      setProducts(products.filter((p) => p.id !== id));
      toast.success("পণ্য মুছে ফেলা হয়েছে");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("মুছতে সমস্যা হয়েছে");
    } finally {
      setDeleting(null);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">পণ্যসমূহ</h1>
            <p className="text-muted-foreground">সব পণ্য ম্যানেজ করুন</p>
          </div>
          <Button asChild>
            <Link to="/admin/products/new">
              <Plus className="h-4 w-4" />
              নতুন পণ্য
            </Link>
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="পণ্য বা SKU দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Products Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {search ? "কোনো পণ্য পাওয়া যায়নি" : "কোনো পণ্য নেই"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium">পণ্য</th>
                    <th className="text-left p-4 text-sm font-medium">SKU</th>
                    <th className="text-left p-4 text-sm font-medium">ক্যাটাগরি</th>
                    <th className="text-left p-4 text-sm font-medium">দাম</th>
                    <th className="text-left p-4 text-sm font-medium">স্টক</th>
                    <th className="text-left p-4 text-sm font-medium">স্ট্যাটাস</th>
                    <th className="text-right p-4 text-sm font-medium">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-t border-border">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded overflow-hidden shrink-0">
                            {product.image_url && (
                              <img
                                src={product.image_url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <span className="font-medium text-sm line-clamp-1">{product.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{product.sku || "-"}</td>
                      <td className="p-4 text-sm">{product.category?.name || "-"}</td>
                      <td className="p-4 text-sm font-medium">{formatPrice(product.price)}</td>
                      <td className="p-4 text-sm">{product.stock_quantity}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          product.is_active && product.in_stock
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {product.is_active ? (product.in_stock ? "স্টকে আছে" : "স্টক নেই") : "নিষ্ক্রিয়"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/admin/products/${product.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product.id, product.name)}
                            disabled={deleting === product.id}
                          >
                            {deleting === product.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
