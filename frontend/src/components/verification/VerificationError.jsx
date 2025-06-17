import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Loader2, RefreshCw, Mail } from "lucide-react";
import "../verification/styles/VerificationStyles.css";

/**
 * @class VerificationErrorComponent
 * @description Componente que muestra una pantalla de error en la verificación
 */
class VerificationErrorComponent extends React.Component {
  /**
   * Render del componente
   * @returns {JSX.Element} Componente JSX
   */
  render() {
    const { message, email, onResendClick, loading, motivo } = this.props;

    // Determinar icono y mensaje basado en el motivo del error
    let icon = <AlertTriangle className="status-icon-error-vs" />;
    let title = "Error de verificación";
    let helpText = "Ha ocurrido un error al verificar tu correo electrónico.";

    // Personalizar la UI según el motivo del error
    if (motivo === "CORRECCION_CORREO") {
      icon = <Mail className="status-icon-warning-vs" />;
      title = "Correo actualizado";
      helpText =
        "Se ha enviado un nuevo enlace de verificación a tu correo actualizado.";
    } else if (motivo === "EXPIRADO") {
      icon = <RefreshCw className="status-icon-warning-vs" />;
      title = "Enlace expirado";
      helpText = "El enlace de verificación ha expirado.";
    }

    return (
      <div className="container-vs">
        <div className="header-vs">
          <h2 className="title-vs">{title}</h2>
        </div>
        <div className="content-vs">
          <div className="icon-vs">{icon}</div>

          <div className="message-vs">
            <p className="error-message-vs">
              {message ||
                "Ha ocurrido un error al verificar tu correo electrónico."}
            </p>

            {motivo === "CORRECCION_CORREO" && (
              <div className="correction-message-vs">
                <p>
                  Has corregido tu dirección de correo electrónico. Por favor,
                  revisa tu bandeja de entrada y utiliza el enlace más reciente
                  que te hemos enviado.
                </p>
              </div>
            )}

            {email && <p>{helpText}</p>}
          </div>

          {email && (
            <div className="actions-vs">
              <button
                onClick={onResendClick}
                disabled={loading}
                className="button-vs"
              >
                {loading ? (
                  <>
                    <Loader2 className="spinner-vs" size={16} /> Enviando...
                  </>
                ) : (
                  "Reenviar verificación"
                )}
              </button>
            </div>
          )}

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

export default VerificationErrorComponent;
