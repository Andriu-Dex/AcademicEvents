import { X } from "lucide-react";
import "./styles/ModalCartaMotivacion.css";

const ModalCartaMotivacion = ({ carta, onClose }) => {
  if (!carta) return null;

  return (
    <div className="modal-carta-overlay" onClick={onClose}>
      <div
        className="modal-carta-contenido"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-carta-header">
          <h3>Carta de Motivación</h3>
          <button className="modal-carta-cerrar" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-carta-cuerpo">
          <p className="modal-carta-texto">{carta}</p>
        </div>
      </div>
    </div>
  );
};

export default ModalCartaMotivacion;
