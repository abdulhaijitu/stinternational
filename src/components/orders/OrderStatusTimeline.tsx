import { 
  Clock, 
  CreditCard, 
  Package, 
  Truck, 
  CheckCircle2, 
  XCircle,
  Circle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderStatusTimelineProps {
  currentStatus: string;
  language: "en" | "bn";
}

interface TimelineStep {
  key: string;
  labelEn: string;
  labelBn: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ORDER_STEPS: TimelineStep[] = [
  { key: "pending_payment", labelEn: "Order Placed", labelBn: "অর্ডার করা হয়েছে", icon: Clock },
  { key: "paid", labelEn: "Payment Confirmed", labelBn: "পেমেন্ট নিশ্চিত", icon: CreditCard },
  { key: "processing", labelEn: "Processing", labelBn: "প্রসেসিং", icon: Package },
  { key: "shipped", labelEn: "Shipped", labelBn: "শিপিং হয়েছে", icon: Truck },
  { key: "delivered", labelEn: "Delivered", labelBn: "ডেলিভারি সম্পন্ন", icon: CheckCircle2 },
];

const STATUS_ORDER: Record<string, number> = {
  pending_payment: 0,
  paid: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  cancelled: -1,
};

const OrderStatusTimeline = ({ currentStatus, language }: OrderStatusTimelineProps) => {
  const currentIndex = STATUS_ORDER[currentStatus] ?? -1;
  const isCancelled = currentStatus === "cancelled";

  if (isCancelled) {
    return (
      <div className="flex flex-col items-center justify-center py-6">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
          <XCircle className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-destructive font-medium">
          {language === "bn" ? "অর্ডার বাতিল করা হয়েছে" : "Order Cancelled"}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop Timeline - Horizontal */}
      <div className="hidden md:block">
        <div className="flex items-start justify-between relative">
          {/* Progress Line Background */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-muted rounded-full" />
          
          {/* Progress Line Active */}
          <div 
            className="absolute top-5 left-0 h-1 bg-primary rounded-full transition-all duration-500"
            style={{ 
              width: currentIndex >= 0 
                ? `${(currentIndex / (ORDER_STEPS.length - 1)) * 100}%` 
                : '0%' 
            }}
          />

          {ORDER_STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div 
                key={step.key} 
                className="flex flex-col items-center relative z-10"
                style={{ width: `${100 / ORDER_STEPS.length}%` }}
              >
                {/* Icon Circle */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                    isCompleted 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                      : "bg-muted text-muted-foreground",
                    isCurrent && "ring-4 ring-primary/20"
                  )}
                >
                  {isCompleted ? (
                    <StepIcon className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </div>

                {/* Label */}
                <p 
                  className={cn(
                    "text-xs mt-3 text-center font-medium transition-colors",
                    isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {language === "bn" ? step.labelBn : step.labelEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Timeline - Vertical */}
      <div className="md:hidden">
        <div className="relative pl-8">
          {/* Vertical Line */}
          <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-muted" />
          
          {/* Active Line */}
          <div 
            className="absolute left-[15px] top-0 w-0.5 bg-primary transition-all duration-500"
            style={{ 
              height: currentIndex >= 0 
                ? `${((currentIndex + 0.5) / ORDER_STEPS.length) * 100}%` 
                : '0%' 
            }}
          />

          <div className="space-y-6">
            {ORDER_STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = index <= currentIndex;
              const isCurrent = index === currentIndex;

              return (
                <div key={step.key} className="relative flex items-center gap-4">
                  {/* Icon Circle */}
                  <div
                    className={cn(
                      "absolute -left-8 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 z-10",
                      isCompleted 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                        : "bg-muted text-muted-foreground",
                      isCurrent && "ring-4 ring-primary/20"
                    )}
                  >
                    {isCompleted ? (
                      <StepIcon className="h-4 w-4" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-h-[32px] flex items-center">
                    <p 
                      className={cn(
                        "text-sm font-medium transition-colors",
                        isCompleted ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {language === "bn" ? step.labelBn : step.labelEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusTimeline;
