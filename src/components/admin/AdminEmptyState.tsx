import { LucideIcon, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";

interface AdminEmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const AdminEmptyState = ({
  icon: Icon = FileText,
  title,
  description,
  action,
}: AdminEmptyStateProps) => {
  const { language, t } = useAdminLanguage();

  return (
    <div className={cn(
      "admin-empty-state",
      language === "bn" && "font-siliguri"
    )}>
      <Icon className="admin-empty-state-icon" />
      {title && (
        <h3 className="text-base font-medium text-foreground" style={{ marginBottom: 'var(--space-1)' }}>
          {title}
        </h3>
      )}
      <p className="admin-empty-state-text">
        {description || t.common.noData}
      </p>
      {action && (
        <div style={{ marginTop: 'var(--space-4)' }}>
          {action}
        </div>
      )}
    </div>
  );
};

export default AdminEmptyState;
