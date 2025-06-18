import React from "react";
import { X } from "lucide-react";
import "./styles/CertificateViewer.css";

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

  render() {
    const { pdfUrl, onClose } = this.props;
    const { loading } = this.state;

    return (
      <div className="modal-overlay-cv">
        <div className="modal-content-cv">
          <div className="modal-header-cv">
            <h2 className="modal-title-cv">Certificado</h2>
            <button className="close-button-cv" onClick={onClose}>
              <X size={24} />
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
            <button className="cancel-button-cv" onClick={onClose}>
              Cancelar
            </button>
            <button
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
