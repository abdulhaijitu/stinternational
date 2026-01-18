import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

interface AdminStatusBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

// Using semantic color tokens only - no random hex/rgb values
const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
  info: "bg-info/10 text-info border-info/20",
  neutral: "bg-muted text-muted-foreground border-border",
};

export const AdminStatusBadge = ({
  variant,
  children,
  className,
}: AdminStatusBadgeProps) => {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium px-2 py-0.5 transition-colors duration-150",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </Badge>
  );
};

export default AdminStatusBadge;
