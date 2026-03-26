import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import "./styles/HomeButton.css";

/**
 * Clase que define las configuraciones por defecto del botón Home
 */
class HomeButtonConfig {
  constructor() {
    this.size = 22;
    this.color = "white";
    this.position = { top: "20px", right: "20px" };
    this.redirectTo = "/home";
    this.backgroundColor = "rgba(138, 21, 56, 0.7)";
    this.hoverBackgroundColor = "rgba(138, 21, 56, 1)";
    this.animation = "pulse-hb";
    this.zIndex = 1000;
    this.className = "home-button-hb";
  }

  /**
   * Actualiza múltiples propiedades de configuración
   * @param {Object} updates - Objeto con las propiedades a actualizar
   * @returns {HomeButtonConfig} - Instancia actualizada para method chaining
   */
  updateConfig(updates) {
    Object.keys(updates).forEach((key) => {
      if (this.hasOwnProperty(key)) {
        this[key] = updates[key];
      }
    });
    return this;
  }

  /**
   * Obtiene los estilos CSS para el botón
   * @returns {Object} - Objeto con estilos CSS
   */
  getStyles() {
    return {
      position: "fixed",
      top: this.position.top,
      right: this.position.right,
      width: "45px",
      height: "45px",
      backgroundColor: this.backgroundColor,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: this.color,
      boxShadow: `0 2px 8px ${this.backgroundColor.replace("0.7", "0.3")}`,
      transition: "all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)",
      zIndex: this.zIndex,
      backdropFilter: "blur(3px)",
      animation: `${this.animation} 2s infinite`,
      textDecoration: "none",
    };
  }
}

/**
 * Clase que maneja la lógica del botón Home
 */
class HomeButtonController {
  constructor(config = new HomeButtonConfig()) {
    this.config = config;
    this.navigate = null;
  }

  /**
   * Establece la función de navegación
   * @param {Function} navigateFunction - Función de navegación de React Router
   */
  setNavigateFunction(navigateFunction) {
    this.navigate = navigateFunction;
  }

  /**
   * Maneja el click del botón
   * @param {Event} event - Evento del click
   */
  handleClick(event) {
    if (this.navigate) {
      event.preventDefault();
      this.navigate(this.config.redirectTo);
    }
  }

  /**
   * Obtiene las propiedades CSS para el hover
   * @returns {Object} - Objeto con estilos de hover
   */
  getHoverStyles() {
    return {
      backgroundColor: this.config.hoverBackgroundColor,
      transform: "rotate(360deg) scale(1.1)",
      boxShadow: `0 5px 15px ${this.config.hoverBackgroundColor.replace(
        "1)",
        "0.5)"
      )}`,
    };
  }
}

/**
 * Componente HomeButton - Botón circular reutilizable para navegar al home
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.config - Configuración personalizada del botón
 * @param {string} props.redirectTo - URL de redirección (por defecto: "/home")
 * @param {Object} props.position - Posición del botón {top, right, bottom, left}
 * @param {string} props.backgroundColor - Color de fondo del botón
 * @param {string} props.className - Clase CSS adicional
 * @param {number} props.iconSize - Tamaño del icono
 * @param {Function} props.onClick - Función personalizada para el click
 * @param {boolean} props.useNavigate - Si usar navigate en lugar de Link (por defecto: true)
 */
const HomeButton = ({
  config: customConfig,
  redirectTo,
  position,
  backgroundColor,
  className,
  iconSize,
  onClick,
  useNavigate = true,
  ...props
}) => {
  console.log("🏠 HomeButton - Iniciando componente");
  console.log("📊 HomeButton - Props recibidas:", {
    customConfig,
    redirectTo,
    position,
    backgroundColor,
    className,
    iconSize,
    onClick,
    useNavigate,
    props,
  });

  try {
    console.log("🎣 HomeButton - useNavigate valor:", useNavigate);

    let navigate = null;
    if (useNavigate) {
      console.log("🎣 HomeButton - Intentando usar useNavigate hook");
      navigate = useNavigate();
      console.log("✅ HomeButton - useNavigate ejecutado exitosamente");
    } else {
      console.log("🔗 HomeButton - Usando Link en lugar de navigate");
    }

    // Crear configuración del botón
    console.log("⚙️ HomeButton - Creando configuración del botón");
    const buttonConfig = new HomeButtonConfig();

    // Aplicar configuraciones personalizadas
    if (customConfig) {
      console.log("🔧 HomeButton - Aplicando configuración personalizada");
      buttonConfig.updateConfig(customConfig);
    }
    console.log("📝 HomeButton - Aplicando propiedades individuales");
    // Aplicar propiedades individuales
    if (redirectTo) buttonConfig.redirectTo = redirectTo;
    if (position)
      buttonConfig.position = { ...buttonConfig.position, ...position };
    if (backgroundColor) buttonConfig.backgroundColor = backgroundColor;
    if (className) buttonConfig.className += ` ${className}`;
    if (iconSize) buttonConfig.size = iconSize;

    console.log("🎮 HomeButton - Creando controlador");
    // Crear controlador
    const controller = new HomeButtonController(buttonConfig);
    controller.setNavigateFunction(navigate);

    // Manejar click
    const handleClick = (event) => {
      console.log("🖱️ HomeButton - Click detectado");
      if (onClick) {
        onClick(event);
      } else {
        controller.handleClick(event);
      }
    };

    console.log(
      "🔄 HomeButton - Decidiendo tipo de renderizado, useNavigate:",
      useNavigate
    );

    // Si se prefiere usar Link en lugar de navigate
    if (!useNavigate) {
      console.log("🔗 HomeButton - Renderizando como Link");
      return (
        <Link
          to={buttonConfig.redirectTo}
          className={buttonConfig.className}
          style={buttonConfig.getStyles()}
          {...props}
        >
          <Home size={buttonConfig.size} color={buttonConfig.color} />
        </Link>
      );
    }

    console.log("🖲️ HomeButton - Renderizando como button con navigate");
    // Usar button con navigate (por defecto)
    return (
      <button
        className={buttonConfig.className}
        style={buttonConfig.getStyles()}
        onClick={handleClick}
        type="button"
        title="Ir al inicio"
        aria-label="Ir al inicio"
        {...props}
      >
        <Home size={buttonConfig.size} color={buttonConfig.color} />
      </button>
    );
  } catch (homeButtonError) {
    console.error("❌ HomeButton - Error en componente:", homeButtonError);
    console.error("📚 HomeButton - Stack trace:", homeButtonError.stack);
    console.error("📊 HomeButton - Props que causaron error:", {
      customConfig,
      redirectTo,
      position,
      backgroundColor,
      className,
      iconSize,
      onClick,
      useNavigate,
      props,
    });

    // Fallback básico
    return (
      <Link
        to={redirectTo || "/home"}
        style={{
          position: "fixed",
          top: position?.top || "20px",
          right: position?.right || "20px",
          width: "45px",
          height: "45px",
          backgroundColor: "#8a1538",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          textDecoration: "none",
          zIndex: 1000,
        }}
        title="Ir al inicio"
        aria-label="Ir al inicio"
      >
        <Home size={22} color="white" />
      </Link>
    );
  }
};

export default HomeButton;
export { HomeButtonConfig, HomeButtonController };
