import React, { useEffect, useMemo, useRef, useState } from "react";
import "../styles/ActionConfirmModal.css";

const ActionConfirmModal = ({
  isOpen,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmVariant = "danger",
  requireReason = false,
  reasonLabel = "Motivo",
  reasonPlaceholder = "Escriba el motivo",
  minReasonLength = 8,
  isSubmitting = false,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState("");
  const cardRef = useRef(null);
  const reasonRef = useRef(null);
  const confirmButtonRef = useRef(null);
  const previousFocusedElementRef = useRef(null);

  const dialogTitleId = "action-confirm-title";
  const dialogDescriptionId = "action-confirm-description";

  useEffect(() => {
    if (!isOpen) return;

    setReason("");
    previousFocusedElementRef.current = document.activeElement;

    const focusTarget = requireReason
      ? reasonRef.current
      : confirmButtonRef.current;

    if (focusTarget) {
      focusTarget.focus();
    } else {
      cardRef.current?.focus();
    }

    return () => {
      if (
        previousFocusedElementRef.current &&
        typeof previousFocusedElementRef.current.focus === "function"
      ) {
        previousFocusedElementRef.current.focus();
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose?.();
      }

      if (event.key === "Tab" && cardRef.current) {
        const focusableElements = cardRef.current.querySelectorAll(
          'button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
          return;
        }

        if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, isSubmitting, onClose]);

  const reasonTrimmed = reason.trim();
  const reasonLength = reasonTrimmed.length;

  const canConfirm = useMemo(() => {
    if (isSubmitting) return false;
    if (!requireReason) return true;
    return reasonLength >= minReasonLength;
  }, [isSubmitting, requireReason, reasonLength, minReasonLength]);

  if (!isOpen) return null;

  return (
    <div
      className="action-confirm-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose?.();
        }
      }}
    >
      <div
        className="action-confirm-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        aria-describedby={dialogDescriptionId}
        tabIndex={-1}
        ref={cardRef}
      >
        <div className="action-confirm-header">
          <h3 id={dialogTitleId}>{title}</h3>
        </div>

        <div className="action-confirm-body">
          <p id={dialogDescriptionId}>{description}</p>

          {requireReason && (
            <div className="action-confirm-reason-group">
              <label htmlFor="action-confirm-reason">{reasonLabel}</label>
              <textarea
                id="action-confirm-reason"
                ref={reasonRef}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder={reasonPlaceholder}
                rows={4}
                disabled={isSubmitting}
              />
              <small>
                {reasonLength}/{minReasonLength} mínimo
              </small>
            </div>
          )}
        </div>

        <div className="action-confirm-actions">
          <button
            type="button"
            className="action-confirm-btn action-confirm-btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`action-confirm-btn action-confirm-btn-${confirmVariant}`}
            onClick={() => onConfirm?.(reasonTrimmed)}
            disabled={!canConfirm}
            ref={confirmButtonRef}
          >
            {isSubmitting ? "Procesando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionConfirmModal;
