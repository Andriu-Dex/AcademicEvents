import React from "react";
import { X } from "lucide-react";
import "./styles/DocumentViewer.css";

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

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
      loadError: false,
      resolvedDocumentUrl: props.documentUrl,
    };
    this.modalRef = React.createRef();
    this.closeButtonRef = React.createRef();
    this.previousFocusedElement = null;
    this.generatedObjectUrl = null;
  }

  componentDidMount() {
    this.previousFocusedElement = document.activeElement;
    window.addEventListener("keydown", this.handleKeyDown, true);
    this.prepareDocumentSource();

    const focusTarget =
      this.closeButtonRef.current || this.getFocusableElements()[0] || this.modalRef.current;
    focusTarget?.focus();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.documentUrl !== this.props.documentUrl ||
      prevProps.documentType !== this.props.documentType
    ) {
      this.prepareDocumentSource();
    }
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown, true);
    this.cleanupGeneratedObjectUrl();

    if (
      this.previousFocusedElement &&
      typeof this.previousFocusedElement.focus === "function"
    ) {
      this.previousFocusedElement.focus();
    }
  }

  getFocusableElements = () =>
    Array.from(this.modalRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) || []);

  /**
   * Maneja eventos de teclado para accesibilidad
   */
  handleKeyDown = (event) => {
    const container = this.modalRef.current;

    if (!container) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      this.props.onClose();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = this.getFocusableElements();

    if (focusableElements.length === 0) {
      event.preventDefault();
      container.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (!container.contains(activeElement)) {
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

  handleDocumentLoadError = () => {
    this.setState({
      loading: false,
      loadError: true,
    });
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

  cleanupGeneratedObjectUrl = () => {
    if (this.generatedObjectUrl) {
      URL.revokeObjectURL(this.generatedObjectUrl);
      this.generatedObjectUrl = null;
    }
  };

  prepareDocumentSource = async () => {
    const { documentUrl } = this.props;
    const documentType = this.getDocumentType();

    this.cleanupGeneratedObjectUrl();
    this.setState({
      loading: true,
      loadError: false,
      resolvedDocumentUrl: documentUrl,
    });

    if (
      documentType !== "pdf" ||
      !documentUrl ||
      documentUrl.startsWith("blob:") ||
      documentUrl.startsWith("data:")
    ) {
      return;
    }

    try {
      const response = await fetch(documentUrl);

      if (!response.ok) {
        throw new Error(`No se pudo cargar el documento: ${response.status}`);
      }

      const documentBlob = await response.blob();
      const objectUrl = URL.createObjectURL(documentBlob);

      this.generatedObjectUrl = objectUrl;

      this.setState({
        resolvedDocumentUrl: objectUrl,
      });
    } catch (error) {
      console.error("Error al preparar el documento para vista previa:", error);
      this.setState({
        loading: false,
        loadError: true,
        resolvedDocumentUrl: documentUrl,
      });
    }
  };

  render() {
    const { documentUrl, onClose, title } = this.props;
    const { loading, loadError, resolvedDocumentUrl } = this.state;
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
          aria-describedby="document-viewer-description"
          ref={this.modalRef}
          tabIndex={-1}
        >
          <p id="document-viewer-description" className="sr-only">
            Usa Tab para navegar por el visor y Escape para cerrarlo.
          </p>
          <div className="modal-header-dv">
            <h2 id="document-viewer-title" className="modal-title-dv">{title || "Documento"}</h2>
            <button
              type="button"
              className="close-button-dv"
              onClick={onClose}
              aria-label="Cerrar visor de documento"
              ref={this.closeButtonRef}
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

            {loadError ? (
              <div className="loading-dv">
                <p>No se pudo cargar la vista previa del documento.</p>
                <a
                  href={documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cancel-button-dv"
                >
                  Abrir en nueva pestaña
                </a>
              </div>
            ) : documentType === "pdf" ? (
              <iframe
                src={`${resolvedDocumentUrl}#toolbar=0`}
                className="document-iframe-dv"
                onLoad={this.handleDocumentLoaded}
                onError={this.handleDocumentLoadError}
                title="Documento PDF"
              />
            ) : (
              <div className="image-container-dv">
                <img
                  src={resolvedDocumentUrl}
                  alt="Documento"
                  className="document-image-dv"
                  onLoad={this.handleDocumentLoaded}
                  onError={this.handleDocumentLoadError}
                />
              </div>
            )}
          </div>

          <div className="modal-actions-dv">
            <button type="button" className="cancel-button-dv" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default DocumentViewer;
