import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type CheckoutStep = "cart" | "login" | "shipping" | "payment" | "confirmation";

interface CheckoutStepIndicatorProps {
  currentStep: CheckoutStep;
  isLoggedIn: boolean;
}

const steps = [
  { id: "cart", label: "Cart", labelBn: "কার্ট" },
  { id: "login", label: "Account", labelBn: "অ্যাকাউন্ট" },
  { id: "shipping", label: "Shipping", labelBn: "শিপিং" },
  { id: "payment", label: "Payment", labelBn: "পেমেন্ট" },
  { id: "confirmation", label: "Confirm", labelBn: "নিশ্চিত" },
] as const;

const CheckoutStepIndicator = ({ currentStep, isLoggedIn }: CheckoutStepIndicatorProps) => {
  const getStepIndex = (step: CheckoutStep) => steps.findIndex(s => s.id === step);
  const currentIndex = getStepIndex(currentStep);

  const getStepStatus = (stepId: string, index: number) => {
    // If logged in and we're on shipping or beyond, skip login step visually
    if (stepId === "login" && isLoggedIn && currentIndex > 1) {
      return "completed";
    }
    
    if (index < currentIndex) return "completed";
    if (index === currentIndex) return "current";
    return "upcoming";
  };

  return (
    <div className="w-full py-4 md:py-6">
      <div className="flex items-center justify-between max-w-2xl mx-auto px-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id, index);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                    status === "completed" && "bg-primary text-primary-foreground",
                    status === "current" && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    status === "upcoming" && "bg-muted text-muted-foreground border-2 border-border"
                  )}
                >
                  {status === "completed" ? (
                    <Check className="h-4 w-4 md:h-5 md:w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs md:text-sm font-medium whitespace-nowrap",
                    status === "current" && "text-primary",
                    status === "completed" && "text-foreground",
                    status === "upcoming" && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-2 md:mx-4">
                  <div
                    className={cn(
                      "h-full transition-colors duration-300",
                      index < currentIndex ? "bg-primary" : "bg-border"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CheckoutStepIndicator;
