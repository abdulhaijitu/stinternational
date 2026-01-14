import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode, CSSProperties } from "react";

interface SortableRowProps {
  id: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  isActive?: boolean;
  renderAsTableRow?: boolean;
}

export function SortableRow({
  id,
  children,
  disabled = false,
  className,
  isActive = false,
  renderAsTableRow = false,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    position: isDragging ? "relative" : undefined,
  };

  const dragHandle = (
    <button
      {...attributes}
      {...listeners}
      className={cn(
        "touch-none p-1.5 rounded hover:bg-muted transition-colors",
        "cursor-grab active:cursor-grabbing",
        disabled && "opacity-30 cursor-not-allowed pointer-events-none"
      )}
      disabled={disabled}
      aria-label="Drag to reorder"
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
    </button>
  );

  if (renderAsTableRow) {
    return (
      <tr
        ref={setNodeRef}
        style={style}
        className={cn(
          "border-t border-border transition-all",
          isDragging && "shadow-lg bg-card ring-2 ring-primary/20 opacity-95",
          isActive && "bg-muted/30",
          className
        )}
      >
        <td className="p-2 w-10">
          {dragHandle}
        </td>
        {children}
      </tr>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 transition-all",
        isDragging && "shadow-lg bg-card ring-2 ring-primary/20 opacity-95 rounded-lg",
        isActive && "bg-muted/30",
        className
      )}
    >
      {dragHandle}
      {children}
    </div>
  );
}

export function DragHandle({ disabled = false }: { disabled?: boolean }) {
  return (
    <div
      className={cn(
        "touch-none p-1.5 rounded",
        "cursor-grab active:cursor-grabbing",
        disabled && "opacity-30 cursor-not-allowed"
      )}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}
