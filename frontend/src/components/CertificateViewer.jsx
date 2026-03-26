import React from "react";
import { X } from "lucide-react";
import "./styles/CertificateViewer.css";

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

/**
 * Componente que muestra un PDF en un modal con opciones para descargarlo
 * @param {Object} props - Propiedades del componente
 * @param {string} props.pdfUrl - URL del PDF a mostrar
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {string} props.fileName - Nombre del archivo para la descarga
 */
class CertificateViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
    this.modalRef = React.createRef();
    this.closeButtonRef = React.createRef();
    this.previousFocusedElement = null;
  }

  componentDidMount() {
    this.previousFocusedElement = document.activeElement;
    window.addEventListener("keydown", this.handleKeyDown, true);
    (this.closeButtonRef.current || this.modalRef.current)?.focus();
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown, true);

    if (
      this.previousFocusedElement &&
      typeof this.previousFocusedElement.focus === "function"
    ) {
      this.previousFocusedElement.focus();
    }
  }

  /**
   * Maneja la descarga del PDF
   */
  handleDownload = () => {
    const { pdfUrl, fileName } = this.props;

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = fileName || "certificado.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Maneja cuando el PDF termina de cargar
   */
  handlePdfLoaded = () => {
    this.setState({ loading: false });
  };

  getFocusableElements = () =>
    Array.from(this.modalRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) || []);

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

  handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      this.props.onClose();
    }
  };

  render() {
    const { pdfUrl, onClose } = this.props;
    const { loading } = this.state;

    return (
      <div
        className="modal-overlay-cv"
        onClick={this.handleOverlayClick}
        role="presentation"
      >
        <div
          className="modal-content-cv"
          role="dialog"
          aria-modal="true"
          aria-labelledby="certificate-viewer-title"
          aria-describedby="certificate-viewer-description"
          tabIndex={-1}
          ref={this.modalRef}
        >
          <p id="certificate-viewer-description" className="sr-only">
            Usa Tab para navegar por el certificado y Escape para cerrar el visor.
          </p>
          <div className="modal-header-cv">
            <h2 id="certificate-viewer-title" className="modal-title-cv">
              Certificado
            </h2>
            <button
              type="button"
              className="close-button-cv"
              onClick={onClose}
              aria-label="Cerrar visor de certificado"
              ref={this.closeButtonRef}
            >
              <X size={24} aria-hidden="true" />
            </button>
          </div>
          <div className="pdf-container-cv">
            {loading && (
              <div className="loading-cv">
                <div className="spinner-cv"></div>
                <p>Cargando certificado...</p>
              </div>
            )}

            <iframe
              src={`${pdfUrl}#toolbar=0`}
              className="pdf-iframe-cv"
              onLoad={this.handlePdfLoaded}
              title="Certificado PDF"
            />
          </div>{" "}
          <div className="modal-actions-cv">
            <button type="button" className="cancel-button-cv" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="button"
              className="download-button-cv"
              onClick={this.handleDownload}
            >
              Descargar certificado
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default CertificateViewer;
