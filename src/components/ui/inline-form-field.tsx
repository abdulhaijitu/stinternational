import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface InlineFormFieldProps {
  id?: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  labelClassName?: string;
  children?: React.ReactNode;
}

/**
 * Standardized Inline Form Field Component
 * 
 * Usage:
 * <InlineFormField label="Email" required error={errors.email}>
 *   <Input {...register("email")} />
 * </InlineFormField>
 * 
 * Features:
 * - Label always visible above input (tight spacing)
 * - Required indicator (*)
 * - Optional indicator (Optional)
 * - Error message directly under input
 * - Helper text subtle and secondary
 * - Consistent height and spacing
 */
const InlineFormField = React.forwardRef<
  HTMLDivElement,
  InlineFormFieldProps
>(({ 
  id,
  label, 
  required, 
  optional,
  error, 
  hint, 
  className, 
  labelClassName,
  children 
}, ref) => {
  return (
    <div ref={ref} className={cn("space-y-1.5", className)}>
      <Label 
        htmlFor={id} 
        className={cn(
          "text-sm font-medium leading-none",
          error && "text-destructive",
          labelClassName
        )}
      >
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
        {optional && (
          <span className="text-muted-foreground text-xs font-normal ml-1.5">
            (Optional)
          </span>
        )}
      </Label>
      
      {/* Input wrapper - applies error border to child input */}
      <div className={cn(
        "[&>input]:h-10 [&>textarea]:min-h-[80px]",
        error && "[&>input]:border-destructive [&>input]:focus-visible:ring-destructive [&>textarea]:border-destructive [&>textarea]:focus-visible:ring-destructive [&>button]:border-destructive [&_.select-trigger]:border-destructive"
      )}>
        {children}
      </div>
      
      {/* Error message with smooth appearance - fixed height container prevents layout jump */}
      <div className="min-h-[18px]">
        {error && (
          <p className="text-xs font-medium text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-150">
            {error}
          </p>
        )}
        {/* Helper text - subtle and secondary */}
        {hint && !error && (
          <p className="text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
    </div>
  );
});

InlineFormField.displayName = "InlineFormField";

/**
 * Form Section component for grouping related fields
 */
interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3;
}

const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  ({ title, description, children, className, columns = 1 }, ref) => {
    const gridClass = {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    }[columns];

    return (
      <div ref={ref} className={cn("space-y-4", className)}>
        {(title || description) && (
          <div className="space-y-1">
            {title && (
              <h3 className="text-base font-semibold leading-none tracking-tight">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
        <div className={cn("grid gap-4", gridClass)}>
          {children}
        </div>
      </div>
    );
  }
);

FormSection.displayName = "FormSection";

/**
 * Form Actions component for consistent button placement
 */
interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
  sticky?: boolean;
}

const FormActions = React.forwardRef<HTMLDivElement, FormActionsProps>(
  ({ children, className, sticky }, ref) => {
    return (
      <div 
        ref={ref} 
        className={cn(
          "flex items-center gap-3 pt-4",
          sticky && "sticky bottom-0 bg-background border-t py-4 -mx-6 px-6 mt-6",
          className
        )}
      >
        {children}
      </div>
    );
  }
);

FormActions.displayName = "FormActions";

export { InlineFormField, FormSection, FormActions };
