import React from "react";
import { Send, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import "../verification/styles/verification-styles.css";

/**
 * @class ResendVerificationComponent
 * @description Componente para reenviar la verificación de correo
 */
class ResendVerificationComponent extends React.Component {
  /**
   * Constructor del componente
   * @param {Object} props - Propiedades del componente
   */
  constructor(props) {
    super(props);

    this.state = {
      email: props.defaultEmail || "",
      loading: false,
      error: "",
    };

    // Bindings
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
  }

  /**
   * Valida un email
   * @param {string} email - Email a validar
   * @returns {boolean} True si es válido
   */
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Maneja el cambio en el campo de email
   * @param {Event} e - Evento de cambio
   */
  handleEmailChange(e) {
    this.setState({ email: e.target.value });
  }

  /**
   * Maneja el envío del formulario
   * @param {Event} e - Evento del formulario
   */
  async handleSubmit(e) {
    e.preventDefault();
    const { email } = this.state;

    if (!email) {
      this.setState({ error: "Por favor, ingrese su correo electrónico" });
      return;
    }

    if (!this.isValidEmail(email)) {
      this.setState({
        error: "Por favor, ingrese un correo electrónico válido",
      });
      return;
    }

    this.setState({
      loading: true,
      error: "",
    });

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/verificacion/reenviar`,
        {
          correo: email,
        }
      );

      if (response.data.success) {
        toast.success(
          "Correo de verificación reenviado. Por favor, revise su bandeja de entrada."
        );
        if (this.props.onSuccess) {
          this.props.onSuccess(email);
        }
      } else {
        this.setState({
          error:
            response.data.message ||
            "Error al reenviar el correo de verificación",
        });
      }
    } catch (error) {
      if (error.response?.data?.message) {
        this.setState({ error: error.response.data.message });

        // Si hay un tiempo de espera debido al rate limiting
        if (error.response.data.tiempoRestante) {
          toast.warning(
            `Intente nuevamente en ${error.response.data.tiempoRestante} minutos`
          );
        }
      } else {
        this.setState({
          error:
            "Error al comunicarse con el servidor. Intente nuevamente más tarde.",
        });
      }
    } finally {
      this.setState({ loading: false });
    }
  }

  /**
   * Render del componente
   * @returns {JSX.Element} Componente JSX
   */
  render() {
    const { email, loading, error } = this.state;

    return (
      <div className="container-vs" style={{ maxWidth: "480px" }}>
        <div className="header-vs">
          <h3 className="subtitle-vs">Reenviar Verificación de Correo</h3>
        </div>

        <div className="content-vs">
          {error && (
            <div className="error-message-vs" style={{ margin: "15px 0" }}>
              {error}
            </div>
          )}

          <form onSubmit={this.handleSubmit} style={{ width: "100%" }}>
            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                  color: "#333",
                }}
              >
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={this.handleEmailChange}
                placeholder="su@correo.com"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "16px",
                }}
                disabled={loading}
              />
            </div>

            <div className="actions-vs">
              <button
                type="submit"
                disabled={loading}
                className="button-vs"
                style={{ width: "100%" }}
              >
                {loading ? (
                  <>
                    <Loader2 className="spinner-vs" size={16} />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send style={{ marginRight: "8px" }} size={16} />
                    Reenviar verificación
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default ResendVerificationComponent;
