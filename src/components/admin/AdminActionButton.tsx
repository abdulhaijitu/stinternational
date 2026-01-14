import { Button, ButtonProps } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LucideIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminActionButtonProps extends Omit<ButtonProps, "children"> {
  icon: LucideIcon;
  label: string;
  tooltip?: string;
  loading?: boolean;
  destructive?: boolean;
}

export const AdminActionButton = ({
  icon: Icon,
  label,
  tooltip,
  loading = false,
  destructive = false,
  variant = "ghost",
  size = "sm",
  className,
  disabled,
  ...props
}: AdminActionButtonProps) => {
  const button = (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || loading}
      className={cn(
        "gap-1.5 h-8 px-2.5",
        destructive && "text-destructive hover:text-destructive hover:bg-destructive/10",
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
};

export default AdminActionButton;
