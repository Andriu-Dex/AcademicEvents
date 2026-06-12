import React from "react";
import { Link } from "react-router-dom";
import { Mail, Loader2, AlertTriangle, ArrowLeft, ShieldCheck } from "lucide-react";
import OtpInput from "./OtpInput";
import "./styles/VerificationPending.css";
import HomeButton from "../common/HomeButton";

/**
 * @class VerificationPendingComponent
 * @description Componente que muestra una pantalla de verificación pendiente con input OTP de 6 dígitos
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
    this.handleCodeComplete = this.handleCodeComplete.bind(this);
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
   * Maneja cuando el usuario completa el código OTP
   * @param {string} code - Código de 6 dígitos completo
   */
  handleCodeComplete(code) {
    if (this.props.onCodeSubmit) {
      this.props.onCodeSubmit(code);
    }
  }

  /**
   * Render del componente
   * @returns {JSX.Element} Componente JSX
   */
  render() {
    const { email, loading, error, verifying, codeError } = this.props;

    try {
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
              <h2 className="title-vp">Verificar tu correo</h2>
            </div>
            <div className="content-vp">
              <div className="icon-vp">
                <ShieldCheck className="status-icon-warning-vp" size={38} />
              </div>

              <div className="message-vp">
                <p className="notificacion-vp">
                  Hemos enviado un código de verificación a:
                </p>
                <p className="email-highlight-vp">{email}</p>
                <p>
                  Ingresa el código de 6 dígitos que recibiste en tu correo
                  electrónico.
                </p>
              </div>

              {/* Input OTP de 6 dígitos */}
              <OtpInput
                length={6}
                onComplete={this.handleCodeComplete}
                disabled={loading || verifying}
                error={!!codeError}
              />

              {/* Mensaje de error del código */}
              {codeError && (
                <div className="error-message-vp" style={{ textAlign: "center" }}>
                  {codeError}
                </div>
              )}

              {/* Indicador de verificación */}
              {verifying && (
                <div className="verifying-indicator-vp">
                  <Loader2 className="spinner-vp" size={20} />
                  <span>Verificando código...</span>
                </div>
              )}

              {error && <div className="error-message-vp">{error}</div>}

              <div className="actions-vp">
                <p className="resend-text-vp">
                  ¿No recibiste el código?
                </p>
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
                    "Reenviar código"
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
                <p className="code-expiry-info-vp">
                  ⏱️ El código caduca en <strong>15 minutos</strong>
                </p>
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

      // Fallback sin HomeButton
      return (
        <div className="container-vp">
          <div className="header-vp">
            <h2 className="title-vp">Verificar tu correo</h2>
          </div>
          <div className="content-vp">
            <div className="icon-vp">
              <Mail size={46} className="status-icon-warning-vp" />
            </div>

            <div className="message-vp">
              <p className="notificacion-vp">
                Hemos enviado un código de verificación a:
              </p>
              <p className="email-highlight-vp">{email}</p>
              <p>
                Ingresa el código de 6 dígitos que recibiste en tu correo.
              </p>
            </div>

            <OtpInput
              length={6}
              onComplete={this.handleCodeComplete}
              disabled={loading || verifying}
              error={!!codeError}
            />

            {codeError && (
              <div className="error-message-vp" style={{ textAlign: "center" }}>
                {codeError}
              </div>
            )}

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
                  "Reenviar código"
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
