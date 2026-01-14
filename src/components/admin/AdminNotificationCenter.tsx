import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, 
  ShoppingCart, 
  FileText, 
  AlertCircle,
  Check,
  X,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: "order" | "quote" | "system";
  title: string;
  message: string;
  href: string;
  createdAt: Date;
  read: boolean;
}

export const AdminNotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { language } = useAdminLanguage();
  const { pendingOrders, pendingQuotes } = useAdminNotifications();

  const totalCount = pendingOrders + pendingQuotes;

  // Fetch recent notifications when popover opens
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const notificationList: Notification[] = [];

      // Fetch recent pending orders (last 10)
      const { data: orders } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, created_at, status")
        .in("status", ["pending_payment", "paid", "processing"])
        .order("created_at", { ascending: false })
        .limit(5);

      if (orders) {
        orders.forEach((order) => {
          const statusLabels: Record<string, { en: string; bn: string }> = {
            pending_payment: { en: "Pending Payment", bn: "পেমেন্ট বাকি" },
            paid: { en: "Paid", bn: "পেমেন্ট সম্পন্ন" },
            processing: { en: "Processing", bn: "প্রসেসিং" },
          };
          notificationList.push({
            id: `order-${order.id}`,
            type: "order",
            title: language === "bn" ? "নতুন অর্ডার" : "New Order",
            message: `${order.order_number} - ${order.customer_name} (${statusLabels[order.status]?.[language] || order.status})`,
            href: `/admin/orders/${order.id}`,
            createdAt: new Date(order.created_at),
            read: false,
          });
        });
      }

      // Fetch recent pending quotes (last 5)
      const { data: quotes } = await supabase
        .from("quote_requests")
        .select("id, company_name, contact_person, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5);

      if (quotes) {
        quotes.forEach((quote) => {
          notificationList.push({
            id: `quote-${quote.id}`,
            type: "quote",
            title: language === "bn" ? "নতুন কোটেশন রিকোয়েস্ট" : "New Quote Request",
            message: `${quote.company_name} - ${quote.contact_person}`,
            href: `/admin/quotes?highlight=${quote.id}`,
            createdAt: new Date(quote.created_at),
            read: false,
          });
        });
      }

      // Sort by date
      notificationList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setNotifications(notificationList);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    setOpen(false);
    navigate(notification.href);
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "order":
        return ShoppingCart;
      case "quote":
        return FileText;
      case "system":
        return AlertCircle;
    }
  };

  const getIconColor = (type: Notification["type"]) => {
    switch (type) {
      case "order":
        return "text-blue-500 bg-blue-500/10";
      case "quote":
        return "text-amber-500 bg-amber-500/10";
      case "system":
        return "text-red-500 bg-red-500/10";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
          {totalCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1 flex items-center justify-center text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full">
              {totalCount > 99 ? "99+" : totalCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 sm:w-96 p-0"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold">
              {language === "bn" ? "বিজ্ঞপ্তি" : "Notifications"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {totalCount > 0
                ? language === "bn"
                  ? `${totalCount}টি মনোযোগ প্রয়োজন`
                  : `${totalCount} items need attention`
                : language === "bn"
                ? "সব ঠিক আছে"
                : "All caught up"}
            </p>
          </div>
          {totalCount > 0 && (
            <Badge variant="secondary" className="font-mono">
              {pendingOrders} / {pendingQuotes}
            </Badge>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 p-3 border-b bg-muted/30">
          <Button
            variant="ghost"
            className="h-auto py-2 px-3 justify-start gap-3"
            onClick={() => {
              setOpen(false);
              navigate("/admin/orders");
            }}
          >
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-left">
              <p className="text-lg font-semibold leading-none">{pendingOrders}</p>
              <p className="text-xs text-muted-foreground">
                {language === "bn" ? "পেন্ডিং অর্ডার" : "Pending Orders"}
              </p>
            </div>
          </Button>
          <Button
            variant="ghost"
            className="h-auto py-2 px-3 justify-start gap-3"
            onClick={() => {
              setOpen(false);
              navigate("/admin/quotes");
            }}
          >
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-left">
              <p className="text-lg font-semibold leading-none">{pendingQuotes}</p>
              <p className="text-xs text-muted-foreground">
                {language === "bn" ? "পেন্ডিং কোটেশন" : "Pending Quotes"}
              </p>
            </div>
          </Button>
        </div>

        {/* Notification List */}
        <ScrollArea className="max-h-[300px]">
          {loading ? (
            <div className="p-8 text-center">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : notifications.length > 0 ? (
            <div className="py-2">
              {notifications.map((notification) => {
                const Icon = getIcon(notification.type);
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className={cn(
                      "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                      getIconColor(notification.type)
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Check className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {language === "bn" ? "কোনো নতুন বিজ্ঞপ্তি নেই" : "No new notifications"}
              </p>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-2">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => {
                setOpen(false);
                navigate("/admin/orders");
              }}
            >
              {language === "bn" ? "সব অর্ডার দেখুন" : "View All Orders"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => {
                setOpen(false);
                navigate("/admin/quotes");
              }}
            >
              {language === "bn" ? "সব কোটেশন দেখুন" : "View All Quotes"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
