import React from "react";
import { X } from "lucide-react";
import "./styles/DocumentViewer.css";

/**
 * Componente que muestra un documento (PDF o imagen) en un modal
 * @param {Object} props - Propiedades del componente
 * @param {string} props.documentUrl - URL del documento a mostrar
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {string} props.title - Título del documento
 * @param {string} props.documentType - Tipo de documento (pdf, image)
 */
class DocumentViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
    this.modalRef = React.createRef();
  }

  componentDidMount() {
    // Agregar listener para tecla Escape
    document.addEventListener("keydown", this.handleKeyDown);
    // Enfocar el modal al abrirse
    this.modalRef.current?.focus();
  }

  componentWillUnmount() {
    // Limpiar listener
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  /**
   * Maneja eventos de teclado para accesibilidad
   */
  handleKeyDown = (event) => {
    if (event.key === "Escape") {
      this.props.onClose();
    }
  };

  /**
   * Maneja click en overlay para cerrar
   */
  handleOverlayClick = (event) => {
    // Solo cerrar si se hace click directamente en el overlay
    if (event.target === event.currentTarget) {
      this.props.onClose();
    }
  };

  /**
   * Maneja cuando el documento termina de cargar
   */
  handleDocumentLoaded = () => {
    this.setState({ loading: false });
  };

  /**
   * Determina el tipo de documento basado en la URL o extensión
   */
  getDocumentType = () => {
    const { documentUrl, documentType } = this.props;

    if (documentType) {
      return documentType;
    }

    // Determinar tipo por extensión
    const extension = documentUrl.split(".").pop().toLowerCase();

    if (["pdf"].includes(extension)) {
      return "pdf";
    } else if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
      return "image";
    }

    return "pdf"; // Por defecto
  };

  render() {
    const { documentUrl, onClose, title } = this.props;
    const { loading } = this.state;
    const documentType = this.getDocumentType();
    return (
      <div
        className="modal-overlay-dv"
        onClick={this.handleOverlayClick}
        role="presentation"
      >
        <div
          className="modal-content-dv"
          role="dialog"
          aria-modal="true"
          aria-labelledby="document-viewer-title"
          ref={this.modalRef}
          tabIndex={-1}
        >
          <div className="modal-header-dv">
            <h2 id="document-viewer-title" className="modal-title-dv">{title || "Documento"}</h2>
            <button
              className="close-button-dv"
              onClick={onClose}
              aria-label="Cerrar visor de documento"
            >
              <X size={24} aria-hidden="true" />
            </button>
          </div>

          <div className="document-container-dv">
            {loading && (
              <div className="loading-dv">
                <div className="spinner-dv"></div>
                <p>Cargando documento...</p>
              </div>
            )}

            {documentType === "pdf" ? (
              <iframe
                src={`${documentUrl}#toolbar=0`}
                className="document-iframe-dv"
                onLoad={this.handleDocumentLoaded}
                title="Documento PDF"
              />
            ) : (
              <div className="image-container-dv">
                <img
                  src={documentUrl}
                  alt="Documento"
                  className="document-image-dv"
                  onLoad={this.handleDocumentLoaded}
                  onError={() => this.setState({ loading: false })}
                />
              </div>
            )}
          </div>

          <div className="modal-actions-dv">
            <button className="cancel-button-dv" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default DocumentViewer;
