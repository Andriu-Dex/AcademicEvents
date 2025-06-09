// Importa hooks y librerías necesarias
import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosConfig";
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
import "./styles/Register.css"; // Importa el archivo CSS

const Register = () => {
  const navigate = useNavigate();
  const [datos, setDatos] = useState({
    ced_usu: "",
    nom_usu: "",
    ape_usu: "",
    cor_usu: "",
    con_usu: "",
    cel_usu: "",
    id_car_est: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const esUTA = datos.cor_usu.endsWith("@uta.edu.ec");
  const [carreras, setCarreras] = useState([]);

  const handleChange = (e) =>
    setDatos({ ...datos, [e.target.name]: e.target.value });

  // Validar cédula
  const validarCedula = (cedula) => {
    return /^\d{10}$/.test(cedula); // Solo 10 dígitos numéricos
  };

  // Validar que solo contenga letras y espacios
  const soloLetras = (texto) => {
    return /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/.test(texto);
  };

  // Cargar carreras desde la API
  useEffect(() => {
    axiosInstance
      .get("/carreras")
      .then((res) => setCarreras(res.data))
      .catch((err) => toast.error("Error al cargar carreras"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { ced_usu, nom_usu, ape_usu, id_car_est: carrera } = datos;

    // Validar campos
    if (!validarCedula(ced_usu)) {
      toast.error("La cédula debe contener exactamente 10 números.");
      return;
    }
    if (!soloLetras(nom_usu) || !soloLetras(ape_usu)) {
      toast.error("Los nombres y apellidos solo deben contener letras.");
      return;
    }
    if (datos.con_usu.length < 6)
      return toast.error("La contraseña debe tener al menos 6 caracteres");
    if (datos.con_usu !== confirmPassword)
      return toast.error("Las contraseñas no coinciden");
    if (!/^\d{10}$/.test(datos.cel_usu))
      return toast.error("El celular debe tener exactamente 10 dígitos");
    if (esUTA && !carrera.trim())
      return toast.error("Debes seleccionar una carrera");
    if (datos.con_usu !== confirmPassword)
      return toast.error("Las contraseñas no coinciden");

    try {
      setLoading(true);
      const response = await axiosInstance.post("/registro", datos);
      toast.success("Registro exitoso.");
      navigate("/login");
    } catch (error) {
      console.error("Error en registro:", error);
      if (error.response?.data?.msg) {
        toast.error(error.response.data.msg);
      } else {
        toast.error("Error al registrar usuario. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page">
      <div className="fixed-image" />
      {/* Botón para volver al home */}
      <Link to="/home" className="home-button">
        <Home size={22} color="white" />
      </Link>
      <div className="form-scroll">
        <div className="form-content">
          {" "}
          <div className="text-center mb-4">
            <div>
              <img
                src="https://i.imgur.com/ZDlLQ2T.png"
                alt="Logo"
                style={{ width: "320px", marginBottom: "10px" }}
              />
            </div>
            <h2 className="registro-titulo">Registro de Usuario</h2>
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
