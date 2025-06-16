import React from "react";
import { Mail, ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import "../verification/styles/verification-styles.css";

/**
 * @class CorrectEmailFormComponent
 * @description Componente para corregir el correo electrónico antes de verificar
 */
class CorrectEmailFormComponent extends React.Component {
  /**
   * Constructor del componente
   * @param {Object} props - Propiedades del componente
   */
  constructor(props) {
    super(props);

    this.state = {
      email: props.currentEmail || "",
      carreraId: props.currentCarrera || "",
      loading: false,
      error: "",
      newIsUTA: false,
      typeChanged: false,
    };

    // Bindings
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handleCarreraChange = this.handleCarreraChange.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  /**
   * Ciclo de vida: cuando el componente se monta
   */
  componentDidMount() {
    // Inicializar estado con props
    if (this.props.currentEmail) {
      this.setState({ email: this.props.currentEmail }, () => {
        this.checkEmailType();
      });
    }
  }

  /**
   * Verificar si es un email válido
   * @param {string} email - Email a validar
   * @returns {boolean} True si es válido
   */
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Verifica el tipo de email y actualiza el estado
   */
  checkEmailType() {
    const { email } = this.state;
    const { isUTA } = this.props;

    if (email) {
      const esUTA = email.endsWith("@uta.edu.ec");

      this.setState({ newIsUTA: esUTA }, () => {
        // Detectar cambio de tipo
        if (esUTA !== isUTA) {
          this.setState({ typeChanged: true });

          // Si cambia de general a UTA, carrera es obligatoria
          if (esUTA && !this.state.carreraId) {
            this.setState({
              error: "Al usar correo UTA, debe seleccionar una carrera",
            });
          }
          // Si cambia de UTA a general, quitar carrera
          else if (!esUTA && this.state.carreraId) {
            this.setState({
              carreraId: "",
              error: "",
            });
          }
        } else {
          this.setState({
            typeChanged: false,
            error: "",
          });
        }
      });
    }
  }

  /**
   * Maneja el cambio en el campo de email
   * @param {Event} e - Evento de cambio
   */
  handleEmailChange(e) {
    this.setState({ email: e.target.value }, () => {
      this.checkEmailType();
    });
  }

  /**
   * Maneja el cambio en el campo de carrera
   * @param {Event} e - Evento de cambio
   */
  handleCarreraChange(e) {
    this.setState({ carreraId: e.target.value });
  }

  /**
   * Maneja el evento de cancelar
   * @param {Event} e - Evento del click
   */
  handleCancel(e) {
    e.preventDefault();
    if (this.props.onCancel) {
      this.props.onCancel();
    }
  }

  /**
   * Maneja el envío del formulario
   * @param {Event} e - Evento de submit
   */
  async handleSubmit(e) {
    e.preventDefault();
    const { email, carreraId, newIsUTA } = this.state;
    const { currentEmail } = this.props;

    // Validaciones
    if (!email.trim()) {
      this.setState({ error: "El correo electrónico es obligatorio" });
      return;
    }

    if (!this.isValidEmail(email)) {
      this.setState({ error: "Ingrese un correo electrónico válido" });
      return;
    }

    // Si es UTA, carrera es obligatoria
    if (newIsUTA && !carreraId) {
      this.setState({
        error: "Al usar correo UTA, debe seleccionar una carrera",
      });
      return;
    }

    this.setState({
      loading: true,
      error: "",
    });

    try {
      // Llamada a la API para corregir el correo
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/cuenta/corregir-correo`,
        {
          correoAnterior: currentEmail,
          correoNuevo: email,
          carreraNueva: newIsUTA ? carreraId : null,
        }
      );

      if (response.data.success) {
        toast.success(
          "Correo actualizado correctamente. Se ha enviado un nuevo email de verificación."
        );

        // Llamar a la función de éxito y pasar el nuevo correo
        if (this.props.onSuccess) {
          this.props.onSuccess(email);
        }
      } else {
        this.setState({
          error: response.data.message || "Error al actualizar el correo",
        });
      }
    } catch (error) {
      console.error("Error:", error);

      if (error.response?.data?.message) {
        this.setState({ error: error.response.data.message });
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
    const { email, carreraId, loading, error, newIsUTA, typeChanged } =
      this.state;
    const { carreras = [] } = this.props;

    return (
      <div className="container-vs">
        <div className="header-vs">
          <button
            onClick={this.handleCancel}
            className="link-vs"
            style={{
              position: "absolute",
              left: "20px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <ArrowLeft size={16} className="mr-1" />
            Volver
          </button>
          <h2 className="title-vs">Corrección de Correo Electrónico</h2>
        </div>

        <div className="content-vs">
          {typeChanged && (
            <div className="correction-message-vs">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <AlertTriangle size={18} style={{ marginRight: "8px" }} />
                <span style={{ fontWeight: "600" }}>
                  Cambio de tipo de cuenta
                </span>
              </div>
              <p style={{ fontSize: "14px" }}>
                {newIsUTA
                  ? "Ha cambiado a un correo institucional. Ahora debe seleccionar su carrera."
                  : "Ha cambiado a un correo no institucional. Su cuenta será de tipo general."}
              </p>
            </div>
          )}

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
              <div style={{ position: "relative" }}>
                <Mail
                  size={18}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#6b7280",
                  }}
                />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={this.handleEmailChange}
                  style={{
                    width: "100%",
                    padding: "10px 10px 10px 40px",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "16px",
                  }}
                  placeholder="Ingrese el correo correcto"
                  disabled={loading}
                />
              </div>
              <p
                style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}
              >
                Asegúrese de escribir correctamente el correo para recibir la
                verificación.
              </p>
            </div>

            {newIsUTA && (
              <div style={{ marginBottom: "20px" }}>
                <label
                  htmlFor="carrera"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                    color: "#333",
                  }}
                >
                  Carrera
                </label>
                <select
                  id="carrera"
                  value={carreraId}
                  onChange={this.handleCarreraChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "16px",
                  }}
                  disabled={loading || !newIsUTA}
                >
                  <option value="">Seleccione su carrera</option>
                  {carreras.map((carrera) => (
                    <option key={carrera.id_car} value={carrera.id_car}>
                      {carrera.nom_car}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
                    Actualizando...
                  </>
                ) : (
                  "Actualizar y enviar verificación"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default CorrectEmailFormComponent;
