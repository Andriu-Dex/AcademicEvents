import React from "react";
import { Link } from "react-router-dom";
import { Mail, Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import "./styles/VerificationPending.css";
import HomeButton from "../common/HomeButton";

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
    console.log("🔍 VerificationPending - Iniciando render");

    const { email, loading, error } = this.props;

    console.log("📊 VerificationPending - Props:", {
      email,
      loading,
      error,
      allProps: this.props,
    });

    try {
      console.log("🏠 VerificationPending - Intentando renderizar HomeButton");

      return (
        <>
          {/* Botón de inicio usando el componente HomeButton */}
          <HomeButton
            position={{ top: "20px", right: "20px" }}
            redirectTo="/home"
            useNavigate={false}
          />

          <div className="container-vp">
            <div className="header-vp">
              <h2 className="title-vp">Verificación Pendiente</h2>
            </div>
            <div className="content-vp">
              <div className="icon-vp">
                <Mail className="status-icon-warning-vp" size={38} />
              </div>

              <div className="message-vp">
                <p className="notificacion-vp">
                  Hemos enviado un enlace de verificación a:
                </p>
                <p className="email-highlight-vp">{email}</p>
                <p>
                  Por favor, revise su bandeja de entrada (y carpeta de spam)
                  para completar el proceso de registro.
                </p>
              </div>

              {error && <div className="error-message-vp">{error}</div>}

              <div className="actions-vp">
                <button
                  onClick={this.handleResendClick}
                  disabled={loading}
                  className="button-vp"
                >
                  {loading ? (
                    <>
                      <Loader2 className="spinner-vp" size={16} />
                      Enviando...
                    </>
                  ) : (
                    "Reenviar verificación"
                  )}
                </button>

                <button
                  onClick={this.handleCorrectEmail}
                  className="button-secondary-vp"
                >
                  <AlertTriangle size={16} />
                  ¿Corregir correo incorrecto?
                </button>
              </div>

              <div className="footer-vp">
                <Link to="/login" className="link-vp">
                  <ArrowLeft size={16} />
                  Volver al inicio de sesión
                </Link>
              </div>
            </div>
          </div>
        </>
      );
    } catch (renderError) {
      console.error("❌ VerificationPending - Error en render:", renderError);
      console.error("📚 VerificationPending - Stack trace:", renderError.stack);

      // Fallback sin HomeButton
      return (
        <div className="container-vp">
          <div className="header-vp">
            <h2 className="title-vp">Verificación Pendiente</h2>
          </div>
          <div className="content-vp">
            <div className="icon-vp">
              <Mail size={46} className="status-icon-warning-vp" />
            </div>

            <div className="message-vp">
              <p className="notificacion-vp">
                Hemos enviado un enlace de verificación a:
              </p>
              <p className="email-highlight-vp">{email}</p>
              <p>
                Por favor, revise su bandeja de entrada (y carpeta de spam) para
                completar el proceso de registro.
              </p>
            </div>

            {error && <div className="error-message-vp">{error}</div>}

            <div className="actions-vp">
              <button
                onClick={this.handleResendClick}
                disabled={loading}
                className="button-vp"
              >
                {loading ? (
                  <>
                    <Loader2 className="spinner-vp" size={16} />
                    Enviando...
                  </>
                ) : (
                  "Reenviar verificación"
                )}
              </button>

              <button
                onClick={this.handleCorrectEmail}
                className="button-secondary-vp"
              >
                <AlertTriangle size={16} />
                ¿Corregir correo incorrecto?
              </button>
            </div>

            <div className="footer-vp">
              <Link to="/login" className="link-vp">
                <ArrowLeft size={16} /> Volver al inicio de sesión
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }
}

export default VerificationPendingComponent;
