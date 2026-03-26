import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

const getFocusableElements = (container) => {
  if (!container) {
    return [];
  }

  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (element) =>
      !element.hasAttribute("disabled") &&
      element.getAttribute("aria-hidden") !== "true"
  );
};

const useDialogAccessibility = ({
  isOpen,
  onClose,
  containerRef,
  initialFocusRef,
}) => {
  const previousFocusedElementRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    previousFocusedElementRef.current = document.activeElement;

    const focusTarget =
      initialFocusRef?.current ||
      getFocusableElements(containerRef?.current)[0] ||
      containerRef?.current;

    focusTarget?.focus();

    const handleKeyDown = (event) => {
      const container = containerRef?.current;

      if (!container) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements(container);

      if (focusableElements.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;
      const isFocusInsideDialog = container.contains(activeElement);

      if (!isFocusInsideDialog) {
        event.preventDefault();
        (event.shiftKey ? lastElement : firstElement).focus();
        return;
      }

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);

      if (
        previousFocusedElementRef.current &&
        typeof previousFocusedElementRef.current.focus === "function"
      ) {
        previousFocusedElementRef.current.focus();
      }
    };
  }, [containerRef, initialFocusRef, isOpen, onClose]);
};

export default useDialogAccessibility;
