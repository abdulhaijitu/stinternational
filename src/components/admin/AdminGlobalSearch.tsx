import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Package, ShoppingCart, FileText, Users, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchResult {
  id: string;
  type: "product" | "order" | "quote" | "user";
  title: string;
  subtitle: string;
  href: string;
}

export const AdminGlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { language, t } = useAdminLanguage();
  
  const debouncedQuery = useDebounce(query, 300);

  // Keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  // Search when query changes
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }
    performSearch(debouncedQuery);
  }, [debouncedQuery]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const searchResults: SearchResult[] = [];
      const searchTerm = `%${searchQuery}%`;

      // Search products
      const { data: products } = await supabase
        .from("products")
        .select("id, name, name_bn, sku, slug")
        .or(`name.ilike.${searchTerm},sku.ilike.${searchTerm},name_bn.ilike.${searchTerm}`)
        .limit(5);

      if (products) {
        products.forEach((p) => {
          searchResults.push({
            id: p.id,
            type: "product",
            title: language === "bn" && p.name_bn ? p.name_bn : p.name,
            subtitle: p.sku || p.slug,
            href: `/admin/products/${p.id}`,
          });
        });
      }

      // Search orders
      const { data: orders } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, customer_email")
        .or(`order_number.ilike.${searchTerm},customer_name.ilike.${searchTerm},customer_email.ilike.${searchTerm}`)
        .limit(5);

      if (orders) {
        orders.forEach((o) => {
          searchResults.push({
            id: o.id,
            type: "order",
            title: o.order_number,
            subtitle: o.customer_name,
            href: `/admin/orders/${o.id}`,
          });
        });
      }

      // Search quotes
      const { data: quotes } = await supabase
        .from("quote_requests")
        .select("id, company_name, contact_person, email")
        .or(`company_name.ilike.${searchTerm},contact_person.ilike.${searchTerm},email.ilike.${searchTerm}`)
        .limit(5);

      if (quotes) {
        quotes.forEach((q) => {
          searchResults.push({
            id: q.id,
            type: "quote",
            title: q.company_name,
            subtitle: q.contact_person,
            href: `/admin/quotes?highlight=${q.id}`,
          });
        });
      }

      // Search users/profiles
      const { data: users } = await supabase
        .from("profiles")
        .select("id, full_name, company_name, phone")
        .or(`full_name.ilike.${searchTerm},company_name.ilike.${searchTerm},phone.ilike.${searchTerm}`)
        .limit(5);

      if (users) {
        users.forEach((u) => {
          searchResults.push({
            id: u.id,
            type: "user",
            title: u.full_name || "Unknown User",
            subtitle: u.company_name || u.phone || "",
            href: `/admin/users?highlight=${u.id}`,
          });
        });
      }

      setResults(searchResults);
      setSelectedIndex(0);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = useCallback((result: SearchResult) => {
    setOpen(false);
    navigate(result.href);
  }, [navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "product":
        return Package;
      case "order":
        return ShoppingCart;
      case "quote":
        return FileText;
      case "user":
        return Users;
    }
  };

  const getTypeLabel = (type: SearchResult["type"]) => {
    switch (type) {
      case "product":
        return language === "bn" ? "পণ্য" : "Product";
      case "order":
        return language === "bn" ? "অর্ডার" : "Order";
      case "quote":
        return language === "bn" ? "কোটেশন" : "Quote";
      case "user":
        return language === "bn" ? "ব্যবহারকারী" : "User";
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-9 px-3 text-muted-foreground hover:text-foreground gap-2"
      >
        <Search className="h-4 w-4" />
        <span className="hidden xl:inline text-sm">
          {language === "bn" ? "অনুসন্ধান" : "Search"}
        </span>
        <kbd className="hidden xl:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>
              {language === "bn" ? "অনুসন্ধান" : "Global Search"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center border-b px-4">
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={language === "bn" ? "পণ্য, অর্ডার, কোটেশন বা ব্যবহারকারী খুঁজুন..." : "Search products, orders, quotes, or users..."}
              className="border-0 focus-visible:ring-0 h-14 text-base"
            />
            {loading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            {query && !loading && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {results.length > 0 ? (
            <ScrollArea className="max-h-[400px]">
              <div className="p-2">
                {results.map((result, index) => {
                  const Icon = getIcon(result.type);
                  return (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSelect(result)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                        index === selectedIndex
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{result.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {result.subtitle}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                        {getTypeLabel(result.type)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          ) : query.length >= 2 && !loading ? (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{language === "bn" ? "কোনো ফলাফল পাওয়া যায়নি" : "No results found"}</p>
            </div>
          ) : query.length < 2 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{language === "bn" ? "অনুসন্ধান শুরু করতে টাইপ করুন" : "Start typing to search"}</p>
              <p className="text-sm mt-2">
                {language === "bn" ? "পণ্য, অর্ডার, কোটেশন ও ব্যবহারকারী জুড়ে খুঁজুন" : "Search across products, orders, quotes & users"}
              </p>
            </div>
          ) : null}

          <div className="border-t p-2 flex items-center justify-between text-xs text-muted-foreground bg-muted/50">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded border bg-background">↑↓</kbd>
                {language === "bn" ? "নেভিগেট" : "Navigate"}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded border bg-background">↵</kbd>
                {language === "bn" ? "নির্বাচন" : "Select"}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded border bg-background">Esc</kbd>
                {language === "bn" ? "বন্ধ" : "Close"}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
