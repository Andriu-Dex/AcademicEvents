import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import "../verification/styles/verification-styles.css";

/**
 * @class VerificationSuccessComponent
 * @description Componente que muestra una pantalla de verificación exitosa
 */
class VerificationSuccessComponent extends React.Component {
  /**
   * Constructor del componente
   * @param {Object} props - Propiedades del componente
   */
  constructor(props) {
    super(props);
    this.handleContinue = this.handleContinue.bind(this);
  }

  /**
   * Maneja el evento de continuar/iniciar sesión
   * @param {Event} e - Evento del click
   */
  handleContinue(e) {
    e.preventDefault();
    if (this.props.onContinue) {
      this.props.onContinue();
    }
  }

  /**
   * Render del componente
   * @returns {JSX.Element} Componente JSX
   */
  render() {
    return (
      <div className="container-vs">
        <div className="header-vs">
          <h2 className="title-vs">¡Verificación Exitosa!</h2>
        </div>
        <div className="content-vs">
          <div className="icon-vs">
            <CheckCircle className="status-icon-success-vs" />
          </div>

          <div className="message-vs">
            {" "}
            <p className="success-message-vs">
              ¡Su dirección de correo electrónico ha sido verificada
              exitosamente!
            </p>
            <p>
              Ahora puede disfrutar de todas las funcionalidades de
              AcademicEvents. Le agradecemos por completar el proceso de
              verificación.
            </p>
          </div>

          <div className="actions-vs">
            <button onClick={this.handleContinue} className="button-vs">
              Continuar a inicio
            </button>
          </div>

          <div className="footer-vs">
            <Link to="/" className="link-vs">
              Ir a la página principal
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default VerificationSuccessComponent;
