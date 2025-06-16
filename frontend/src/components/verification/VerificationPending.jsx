import React from "react";
import { Link } from "react-router-dom";
import { Mail, Loader2, AlertTriangle } from "lucide-react";
import "../verification/styles/verification-styles.css";

/**
 * @class VerificationPendingComponent
 * @description Componente que muestra una pantalla de verificación pendiente
 */
class VerificationPendingComponent extends React.Component {
  /**
   * Constructor del componente
   * @param {Object} props - Propiedades del componente
   */
  constructor(props) {
    super(props);
    this.handleResendClick = this.handleResendClick.bind(this);
    this.handleCorrectEmail = this.handleCorrectEmail.bind(this);
  }

  /**
   * Maneja el evento de reenviar verificación
   * @param {Event} e - Evento del click
   */
  handleResendClick(e) {
    e.preventDefault();
    if (this.props.onResendClick) {
      this.props.onResendClick();
    }
  }

  /**
   * Maneja el evento de corregir correo
   * @param {Event} e - Evento del click
   */
  handleCorrectEmail(e) {
    e.preventDefault();
    if (this.props.onCorrectEmail) {
      this.props.onCorrectEmail();
    }
  }

  /**
   * Render del componente
   * @returns {JSX.Element} Componente JSX
   */
  render() {
    const { email, loading, error } = this.props;

    return (
      <div className="container-vs">
        <div className="header-vs">
          <h2 className="title-vs">Verificación Pendiente</h2>
        </div>
        <div className="content-vs">
          <div className="icon-vs">
            <Mail className="status-icon-warning-vs" />
          </div>

          <div className="message-vs">
            <p>Hemos enviado un enlace de verificación a:</p>
            <p className="correction-message-vs">{email}</p>
            <p>
              Por favor, revise su bandeja de entrada (y carpeta de spam) para
              completar el proceso de registro.
            </p>
          </div>

          {error && <div className="error-message-vs">{error}</div>}

          <div className="actions-vs">
            <button
              onClick={this.handleResendClick}
              disabled={loading}
              className="button-vs"
            >
              {loading ? (
                <>
                  <Loader2 className="spinner-vs" size={16} />
                  Enviando...
                </>
              ) : (
                "Reenviar verificación"
              )}
            </button>
          </div>

          <div className="actions-vs">
            <button
              onClick={this.handleCorrectEmail}
              className="button-secondary-vs"
            >
              <AlertTriangle size={16} className="mr-2" />
              ¿Correo incorrecto? Corregir antes de verificar
            </button>
          </div>

          <div className="footer-vs">
            <Link to="/login" className="link-vs">
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default VerificationPendingComponent;
