import { LayoutGrid, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { GridDensity } from "@/hooks/useGridDensity";
import { useLanguage } from "@/contexts/LanguageContext";

interface GridDensityToggleProps {
  density: GridDensity;
  onDensityChange: (density: GridDensity) => void;
  className?: string;
}

const GridDensityToggle = ({
  density,
  onDensityChange,
  className,
}: GridDensityToggleProps) => {
  const { t } = useLanguage();

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn("flex items-center rounded-md border border-border bg-background", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDensityChange('comfortable')}
              className={cn(
                "h-8 px-2.5 rounded-r-none border-r border-border",
                "transition-colors duration-150",
                density === 'comfortable' 
                  ? "bg-muted text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={t.products.comfortable}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {t.products.comfortable}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDensityChange('compact')}
              className={cn(
                "h-8 px-2.5 rounded-l-none",
                "transition-colors duration-150",
                density === 'compact' 
                  ? "bg-muted text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={t.products.compact}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {t.products.compact}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default GridDensityToggle;
