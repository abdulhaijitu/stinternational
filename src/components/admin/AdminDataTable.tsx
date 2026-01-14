import React from "react";
import { cn } from "@/lib/utils";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import AdminEmptyState from "./AdminEmptyState";
import { LucideIcon } from "lucide-react";

interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

interface AdminDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  onRowClick?: (item: T) => void;
  className?: string;
  stickyHeader?: boolean;
  maxHeight?: string;
}

export function AdminDataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  onRowClick,
  className,
  stickyHeader = true,
  maxHeight,
}: AdminDataTableProps<T>) {
  const { language } = useAdminLanguage();

  if (data.length === 0 && !isLoading) {
    return (
      <div className={cn("admin-table-wrapper", className)}>
        <AdminEmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      </div>
    );
  }

  return (
    <div className={cn("admin-table-wrapper", className)}>
      <div 
        className={cn(
          "overflow-x-auto",
          maxHeight && "overflow-y-auto"
        )}
        style={maxHeight ? { maxHeight } : undefined}
      >
        <table className={cn(
          "admin-table",
          language === "bn" && "font-siliguri"
        )}>
          <thead className={cn(stickyHeader && "sticky top-0 z-10 bg-muted/50")}>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={cn("whitespace-nowrap", col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={keyExtractor(item)}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                className={cn(
                  "border-t border-border transition-colors duration-100",
                  "hover:bg-muted/30",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn("p-4 text-sm", col.className)}>
                    {col.render 
                      ? col.render(item, index)
                      : (item as any)[col.key]
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDataTable;
