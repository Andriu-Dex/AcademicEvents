// Importa hooks y librerías necesarias
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Phone,
  BookText,
  Eye,
  EyeOff,
  Home,
} from "lucide-react";
import Validator from "../utils/Validator"; // Importamos la clase de validación
import Usuario from "../models/Usuario"; // Importamos el modelo de Usuario
import RegistroService from "../services/RegistroService"; // Importamos el servicio de registro
import "./styles/Register.css"; // Importa el archivo CSS

/**
 * Componente para el registro de usuarios
 * Implementa validaciones específicas para Ecuador
 */
const Register = () => {
  const navigate = useNavigate();

  // Inicializamos con un modelo de Usuario
  const [usuarioModel] = useState(new Usuario());
  const [datos, setDatos] = useState(usuarioModel.toServerFormat());

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    esValida: false,
    fortaleza: "muy débil",
    puntuacion: 0,
    errores: [],
    sugerencias: [],
  });
  const esUTA = datos.cor_usu.endsWith("@uta.edu.ec");
  const [carreras, setCarreras] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Actualizamos el modelo de usuario
    usuarioModel.actualizarCampo(name, value);

    // Actualizamos el estado con los datos formateados para el servidor
    setDatos(usuarioModel.toServerFormat());

    // Si se está modificando la contraseña, validar fortaleza
    if (name === "con_usu") {
      const fortaleza = Validator.validarPasswordSegura(value);
      setPasswordStrength(fortaleza);
    }
  }; // Usamos métodos estáticos de la clase Validator
  const validarCedula = (cedula) => {
    return Validator.validarCedulaEcuatoriana(cedula);
  };

  // Validar número de celular ecuatoriano
  const validarCelular = (celular) => {
    return Validator.validarCelularEcuatoriano(celular);
  };

  // Validar que solo contenga letras y espacios
  const soloLetras = (texto) => {
    return Validator.soloLetras(texto);
  };

  // Inicializamos el servicio de registro
  const registroService = RegistroService.getInstance();

  // Cargar carreras desde la API
  useEffect(() => {
    const cargarCarreras = async () => {
      const resultado = await registroService.obtenerCarreras();
      if (resultado.success) {
        setCarreras(resultado.data);
      } else {
        toast.error("Error al cargar carreras");
      }
    };
    cargarCarreras();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      ced_usu,
      nom_usu,
      ape_usu,
      id_car_est: carrera,
      cel_usu,
      con_usu,
    } = datos;

    // Validar campos
    if (!validarCedula(ced_usu)) {
      toast.error(
        "La cédula ingresada no es válida. Debe ser una cédula ecuatoriana de 10 dígitos."
      );
      return;
    }
    if (!soloLetras(nom_usu) || !soloLetras(ape_usu)) {
      toast.error("Los nombres y apellidos solo deben contener letras.");
      return;
    }

    // Validar contraseña segura
    const validacionPassword = Validator.validarPasswordSegura(con_usu);
    if (!validacionPassword.esValida) {
      const errores = validacionPassword.errores.join(". ");
      toast.error(`Contraseña no segura: ${errores}`);
      return;
    }

    if (!Validator.passwordsCoinciden(con_usu, confirmPassword)) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (!validarCelular(cel_usu)) {
      toast.error(
        "El número de celular debe empezar con 09 y tener 10 dígitos"
      );
      return;
    }
    if (usuarioModel.esEstudianteUTA() && !carrera.trim()) {
      toast.error("Debes seleccionar una carrera");
      return;
    }

    try {
      setLoading(true);
      const resultado = await registroService.registrarUsuario(datos);

      if (resultado.success) {
        if (resultado.requireVerification) {
          // Si se requiere verificación, guardamos el email y redirigimos
          toast.success(resultado.message);
          localStorage.setItem("verificationPendingEmail", resultado.email);
          navigate("/verificacion-pendiente");
        } else {
          // Comportamiento normal sin verificación
          toast.success("Registro exitoso.");
          navigate("/login");
        }
      } else {
        toast.error(resultado.message);
      }
    } catch (error) {
      console.error("Error en registro:", error);
      toast.error("Error al registrar usuario. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page-reg">
      <div className="fixed-image-reg" />
      {/* Botón para volver al home */}
      <Link to="/home" className="home-button-reg">
        <Home size={22} color="white" />
      </Link>
      <div className="form-scroll-reg">
        <div className="form-content-reg">
          {" "}
          <div className="text-center mb-4">
            <div>
              <img
                src="https://i.imgur.com/ZDlLQ2T.png"
                alt="Logo"
                style={{ width: "320px", marginBottom: "10px" }}
              />
            </div>
            <h2 className="registro-titulo-reg">Registro de Usuario</h2>
            <p className="text-muted justify-content-center">
              {esUTA
                ? "Registro como estudiante con correo institucional"
                : "Registro como usuario general"}
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            {" "}
            {[
              "ced_usu",
              "nom_usu",
              "ape_usu",
              "cor_usu",
              "cel_usu",
              "con_usu",
            ].map((name) => {
              const labels = {
                ced_usu: "Cédula",
                nom_usu: "Nombre",
                ape_usu: "Apellido",
                cor_usu: "Correo electrónico",
                con_usu: "Contraseña",
                cel_usu: "Celular",
              };
              const icons = {
                ced_usu: <User size={18} />,
                nom_usu: <User size={18} />,
                ape_usu: <User size={18} />,
                cor_usu: <Mail size={18} />,
                con_usu: <Lock size={18} />,
                cel_usu: <Phone size={18} />,
              };
              const type =
                name === "con_usu"
                  ? showPassword
                    ? "text"
                    : "password"
                  : name === "cor_usu"
                  ? "email"
                  : "text";
              return (
                <div key={name} className="mb-3">
                  <label className="form-label fw-semibold">
                    {labels[name]}
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-primary text-white">
                      {icons[name]}
                    </span>
                    <input
                      type={type}
                      name={name}
                      value={datos[name]}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                    {name === "con_usu" && (
                      <button
                        type="button"
                        className="input-group-text btn btn-outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    )}
                  </div>
                  {/* Indicador de fortaleza de contraseña */}
                  {name === "con_usu" && datos[name] && (
                    <div className="password-strength-reg mt-2">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-muted">
                          Fortaleza de contraseña:
                        </small>
                        <small
                          className={`fw-bold ${
                            passwordStrength.fortaleza === "muy fuerte"
                              ? "text-success"
                              : passwordStrength.fortaleza === "fuerte"
                              ? "text-success"
                              : passwordStrength.fortaleza === "moderada"
                              ? "text-warning"
                              : "text-danger"
                          }`}
                        >
                          {passwordStrength.fortaleza.toUpperCase()}
                        </small>
                      </div>
                      <div className="progress mb-2" style={{ height: "4px" }}>
                        <div
                          className={`progress-bar ${
                            passwordStrength.fortaleza === "muy fuerte"
                              ? "bg-success"
                              : passwordStrength.fortaleza === "fuerte"
                              ? "bg-success"
                              : passwordStrength.fortaleza === "moderada"
                              ? "bg-warning"
                              : "bg-danger"
                          }`}
                          role="progressbar"
                          style={{
                            width: `${
                              (passwordStrength.puntuacion / 9) * 100
                            }%`,
                            transition: "width 0.3s ease",
                          }}
                        ></div>
                      </div>
                      {passwordStrength.errores.length > 0 && (
                        <div className="password-errors-reg">
                          {passwordStrength.errores.map((error, index) => (
                            <small key={index} className="text-danger d-block">
                              • {error}
                            </small>
                          ))}
                        </div>
                      )}
                      {passwordStrength.sugerencias.length > 0 && (
                        <div className="password-suggestions-reg mt-1">
                          <small className="text-muted d-block">
                            💡 Sugerencias:{" "}
                            {passwordStrength.sugerencias.join(", ")}
                          </small>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Confirmar contraseña
              </label>
              <div className="input-group">
                <span className="input-group-text bg-primary text-white">
                  <Lock size={18} />
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-control"
                  required
                />
                <button
                  type="button"
                  className="input-group-text btn btn-outline-secondary"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>
            {esUTA && (
              <div className="mb-3">
                <label className="form-label fw-semibold">Carrera</label>
                <div className="input-group">
                  <span className="input-group-text bg-primary text-white">
                    <BookText size={18} />
                  </span>
                  <select
                    className="form-select"
                    name="id_car_est"
                    value={datos.id_car_est}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione una carrera</option>
                    {carreras.map((c) => (
                      <option key={c.id_car} value={c.id_car}>
                        {c.nom_car}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}{" "}
            <div className="alert alert-info mb-3">
              <small>
                <strong>Nota importante:</strong> Después de registrarte,
                deberás subir tus documentos (cédula, papeleta de votación
                {esUTA ? " y certificado de matrícula" : ""}) en tu perfil de
                usuario para poder inscribirte en eventos.
              </small>
            </div>
            <div className="d-grid gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Registrando..." : "Registrarse"}
              </button>
              <Link to="/login" className="btn btn-outline-secondary">
                Ya tengo una cuenta
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
