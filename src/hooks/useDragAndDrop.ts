import { useState, useCallback } from "react";
import {
  DragEndEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

interface UseDragAndDropOptions<T> {
  items: T[];
  onReorder: (items: T[], activeId: string, overId: string) => Promise<void>;
  getId: (item: T) => string;
  canReorder?: boolean;
}

export function useDragAndDrop<T>({
  items,
  onReorder,
  getId,
  canReorder = true,
}: UseDragAndDropOptions<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevent accidental drags
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // Long press on touch
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    if (!canReorder) return;
    setActiveId(event.active.id as string);
  }, [canReorder]);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over || active.id === over.id || !canReorder) {
        return;
      }

      const oldIndex = items.findIndex((item) => getId(item) === active.id);
      const newIndex = items.findIndex((item) => getId(item) === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      setIsReordering(true);
      try {
        const reorderedItems = arrayMove(items, oldIndex, newIndex);
        await onReorder(reorderedItems, active.id as string, over.id as string);
      } catch (error) {
        console.error("Reorder failed:", error);
      } finally {
        setIsReordering(false);
      }
    },
    [items, onReorder, getId, canReorder]
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  return {
    sensors,
    activeId,
    isReordering,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
}
