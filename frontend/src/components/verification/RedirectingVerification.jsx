import React from "react";
import { CheckCircle } from "lucide-react";
import "../verification/styles/verification-styles.css";

/**
 * @class RedirectingVerificationComponent
 * @description Componente que muestra una pantalla elegante durante la redirección post-verificación
 * Proporciona feedback visual continuo durante el auto-login y navegación
 */
class RedirectingVerificationComponent extends React.Component {
  /**
   * Constructor del componente
   * @param {Object} props - Propiedades del componente
   */
  constructor(props) {
    super(props);
  }

  /**
   * Render del componente
   * @returns {JSX.Element} Componente JSX con pantalla de redirección animada
   */
  render() {
    return (
      <div className="contenedor-redireccion-ve">
        {/* Header con logo institucional */}
        <div className="header-redireccion-ve">
          <img
            src="/Logo.png"
            alt="AcademicEvents"
            className="logo-animado-ve"
          />
          <h2 className="titulo-redireccion-ve">AcademicEvents</h2>
        </div>

        {/* Icono de éxito animado */}
        <div className="icono-exito-ve">
          <CheckCircle className="icono-check-animado-ve" />
        </div>

        {/* Mensajes de confirmación */}
        <div className="mensajes-redireccion-ve">
          <h3 className="mensaje-principal-ve">¡Verificación Exitosa!</h3>
          <p className="mensaje-secundario-ve">
            Tu correo ha sido confirmado correctamente
          </p>
          <p className="mensaje-accion-ve">
            Iniciando sesión automáticamente...
          </p>
        </div>

        {/* Barra de progreso animada */}
        <div className="barra-progreso-ve">
          <div className="progreso-animado-ve"></div>
        </div>

        {/* Indicador de carga elegante */}
        <div className="spinner-elegante-ve">
          <div className="pulso-ve"></div>
          <div className="pulso-ve pulso-delay-ve"></div>
          <div className="pulso-ve pulso-delay2-ve"></div>
        </div>
      </div>
    );
  }
}

export default RedirectingVerificationComponent;
