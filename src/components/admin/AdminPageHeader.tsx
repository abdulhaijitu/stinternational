import { cn } from "@/lib/utils";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

export const AdminPageHeader = ({
  title,
  subtitle,
  children,
  className,
}: AdminPageHeaderProps) => {
  const { language } = useAdminLanguage();

  return (
    <div className={cn("admin-page-header", className)}>
      <div>
        <h1 className={cn(
          "admin-page-title",
          language === "bn" && "font-siliguri"
        )}>
          {title}
        </h1>
        {subtitle && (
          <p className={cn(
            "admin-page-subtitle",
            language === "bn" && "font-siliguri"
          )}>
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="admin-action-bar">
          {children}
        </div>
      )}
    </div>
  );
};

export default AdminPageHeader;
