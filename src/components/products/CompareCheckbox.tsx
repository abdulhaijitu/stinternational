import { GitCompare, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";

interface CompareCheckboxProps {
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: "sm" | "default";
  className?: string;
}

const CompareCheckbox = ({
  isSelected,
  onToggle,
  disabled = false,
  size = "default",
  className,
}: CompareCheckboxProps) => {
  const { t } = useLanguage();

  const sizeClasses = size === "sm" 
    ? "w-6 h-6" 
    : "w-8 h-8";
  
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!disabled) onToggle();
            }}
            disabled={disabled}
            className={cn(
              "rounded-md border transition-all duration-150",
              "flex items-center justify-center",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
              sizeClasses,
              isSelected
                ? "bg-primary border-primary text-primary-foreground"
                : "bg-background/80 backdrop-blur-sm border-border text-muted-foreground hover:text-foreground hover:border-foreground/30",
              disabled && !isSelected && "opacity-50 cursor-not-allowed",
              className
            )}
            aria-label={isSelected ? t.products.removeFromCompare : t.products.addToCompare}
            aria-pressed={isSelected}
          >
            {isSelected ? (
              <Check className={iconSize} />
            ) : (
              <GitCompare className={iconSize} />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {isSelected 
            ? t.products.removeFromCompare 
            : disabled 
              ? t.products.compareLimit 
              : t.products.addToCompare
          }
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CompareCheckbox;
