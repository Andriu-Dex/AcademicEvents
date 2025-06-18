import React from "react";
import { Mail, ArrowLeft, AlertTriangle, Loader2, School } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import "./styles/VerificationCorrectEmail.css";

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
   */ render() {
    const { email, carreraId, loading, error, newIsUTA, typeChanged } =
      this.state;
    const { carreras = [] } = this.props;

    return (
      <div className="container-ce">
        <button
          onClick={this.handleCancel}
          className="back-button-ce"
          type="button"
        >
          <ArrowLeft size={16} />
          Volver
        </button>
        <div className="header-ce">
          <h2 className="title-ce">Corrección de Correo Electrónico</h2>
        </div>

        <div className="content-ce">
          {typeChanged && (
            <div className="alert-message-ce slide-in-ce">
              <div className="alert-header-ce">
                <AlertTriangle size={20} color="#ffc107" />
                <h4 className="alert-title-ce">Cambio de tipo de cuenta</h4>
              </div>
              <p className="alert-content-ce">
                {newIsUTA
                  ? "Ha cambiado a un correo institucional. Ahora debe seleccionar su carrera."
                  : "Ha cambiado a un correo no institucional. Su cuenta será de tipo general."}
              </p>
            </div>
          )}

          {error && <div className="error-message-ce">{error}</div>}

          <form onSubmit={this.handleSubmit} className="transition-ce">
            <div className="form-group-ce">
              <label htmlFor="email" className="form-label-ce">
                Correo electrónico
              </label>
              <div className="input-container-ce">
                <Mail size={18} className="input-icon-ce" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={this.handleEmailChange}
                  className="input-field-ce"
                  placeholder="Ingrese el correo correcto"
                  disabled={loading}
                />
              </div>
              <p className="input-help-ce">
                Asegúrese de escribir correctamente el correo para recibir la
                verificación.
              </p>
            </div>

            {newIsUTA && (
              <div className="form-group-ce slide-in-ce">
                <label htmlFor="carrera" className="form-label-ce">
                  Carrera
                </label>
                <div className="input-container-ce">
                  <select
                    id="carrera"
                    value={carreraId}
                    onChange={this.handleCarreraChange}
                    className="input-field-ce select-field-ce"
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
              </div>
            )}

            <div className="actions-ce">
              <button type="submit" disabled={loading} className="button-ce">
                {loading ? (
                  <>
                    <Loader2 className="spinner-ce" size={18} />
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
