import { useCallback, useEffect } from "react";

interface UseKeyboardNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  itemCount: number;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onSelect?: (index: number) => void;
  orientation?: "horizontal" | "vertical";
}

export const useKeyboardNavigation = ({
  isOpen,
  onClose,
  itemCount,
  activeIndex,
  onActiveIndexChange,
  onSelect,
  orientation = "vertical",
}: UseKeyboardNavigationProps) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;

      const prevKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
      const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";

      switch (event.key) {
        case "Escape":
          event.preventDefault();
          onClose();
          break;
        case prevKey:
          event.preventDefault();
          onActiveIndexChange(activeIndex > 0 ? activeIndex - 1 : itemCount - 1);
          break;
        case nextKey:
          event.preventDefault();
          onActiveIndexChange(activeIndex < itemCount - 1 ? activeIndex + 1 : 0);
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          onSelect?.(activeIndex);
          break;
        case "Home":
          event.preventDefault();
          onActiveIndexChange(0);
          break;
        case "End":
          event.preventDefault();
          onActiveIndexChange(itemCount - 1);
          break;
        case "Tab":
          // Allow tab to close menu and move focus
          onClose();
          break;
      }
    },
    [isOpen, onClose, itemCount, activeIndex, onActiveIndexChange, onSelect, orientation]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  return { handleKeyDown };
};
