import { useRef } from "react";
import { X } from "lucide-react";
import useDialogAccessibility from "../hooks/useDialogAccessibility";
import "./styles/ModalCartaMotivacion.css";

const ModalCartaMotivacion = ({ carta, onClose }) => {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);

  useDialogAccessibility({
    isOpen: Boolean(carta),
    onClose,
    containerRef: dialogRef,
    initialFocusRef: closeButtonRef,
  });

  if (!carta) {
    return null;
  }

  return (
    <div
      className="modal-carta-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        className="modal-carta-contenido"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="motivation-letter-title"
        aria-describedby="motivation-letter-description"
        tabIndex={-1}
        ref={dialogRef}
      >
        <div className="modal-carta-header">
          <h3 id="motivation-letter-title">Carta de Motivación</h3>
          <button
            type="button"
            className="modal-carta-cerrar"
            onClick={onClose}
            aria-label="Cerrar carta de motivación"
            ref={closeButtonRef}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="modal-carta-cuerpo">
          <p
            id="motivation-letter-description"
            className="modal-carta-texto"
          >
            {carta}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModalCartaMotivacion;
