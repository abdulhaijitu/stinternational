import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface FormFieldWrapperProps {
  id?: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  optionalText?: string;
  error?: string;
  touched?: boolean;
  hint?: string;
  className?: string;
  labelClassName?: string;
  children: React.ReactNode;
}

/**
 * Standardized Form Field Wrapper for Admin Panel
 * 
 * Features:
 * - Consistent label positioning above input
 * - Required indicator (*) with proper color
 * - Optional indicator text
 * - Smooth error message appearance (no layout jump)
 * - Helper text support
 * - Proper focus ring inheritance for error state
 */
export function FormFieldWrapper({
  id,
  label,
  required,
  optional,
  optionalText = "Optional",
  error,
  touched,
  hint,
  className,
  labelClassName,
  children,
}: FormFieldWrapperProps) {
  const showError = error && touched;
  
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label
        htmlFor={id}
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          showError && "text-destructive",
          labelClassName
        )}
      >
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
        {optional && (
          <span className="text-muted-foreground text-xs font-normal ml-1.5">
            ({optionalText})
          </span>
        )}
      </Label>

      {/* Input container with error state styling */}
      <div
        className={cn(
          "relative",
          // Apply error border to common input elements
          showError && [
            "[&>input]:border-destructive [&>input]:focus-visible:ring-destructive",
            "[&>textarea]:border-destructive [&>textarea]:focus-visible:ring-destructive",
            "[&>button]:border-destructive",
            "[&_.select-trigger]:border-destructive",
          ]
        )}
      >
        {children}
      </div>

      {/* Error message with smooth appearance - fixed height container prevents layout jump */}
      <div className="min-h-[18px]">
        {showError && (
          <p className="text-xs font-medium text-destructive flex items-center gap-1 animate-in fade-in-0 slide-in-from-top-1 duration-150">
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
            <span>{error}</span>
          </p>
        )}
        {/* Helper hint - only show when no error */}
        {hint && !showError && (
          <p className="text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Form Section Divider for visual separation
 */
interface FormSectionDividerProps {
  title?: string;
  description?: string;
  className?: string;
}

export function FormSectionDivider({
  title,
  description,
  className,
}: FormSectionDividerProps) {
  if (!title && !description) {
    return <div className={cn("border-t border-border my-6", className)} />;
  }

  return (
    <div className={cn("pt-6 pb-2", className)}>
      {title && (
        <h3 className="text-base font-semibold leading-none tracking-tight mb-1">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

/**
 * Form Row for consistent grid layouts
 */
interface FormRowProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}

export function FormRow({ children, columns = 2, className }: FormRowProps) {
  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  }[columns];

  return (
    <div className={cn("grid gap-4", gridClass, className)}>{children}</div>
  );
}

/**
 * Form Actions Bar - sticky footer for form buttons
 */
interface FormActionsBarProps {
  children: React.ReactNode;
  className?: string;
  sticky?: boolean;
  align?: "left" | "right" | "between";
}

export function FormActionsBar({
  children,
  className,
  sticky = false,
  align = "right",
}: FormActionsBarProps) {
  const alignClass = {
    left: "justify-start",
    right: "justify-end",
    between: "justify-between",
  }[align];

  return (
    <div
      className={cn(
        "flex items-center gap-3 pt-4 border-t border-border",
        alignClass,
        sticky && "sticky bottom-0 bg-card py-4 -mx-6 px-6 mt-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]",
        className
      )}
    >
      {children}
    </div>
  );
}
