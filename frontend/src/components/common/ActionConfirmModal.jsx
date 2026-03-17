import React, { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    if (isOpen) {
      setReason("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose?.();
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
      <div className="action-confirm-card" role="dialog" aria-modal="true">
        <div className="action-confirm-header">
          <h3>{title}</h3>
        </div>

        <div className="action-confirm-body">
          <p>{description}</p>

          {requireReason && (
            <div className="action-confirm-reason-group">
              <label htmlFor="action-confirm-reason">{reasonLabel}</label>
              <textarea
                id="action-confirm-reason"
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
          >
            {isSubmitting ? "Procesando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionConfirmModal;
