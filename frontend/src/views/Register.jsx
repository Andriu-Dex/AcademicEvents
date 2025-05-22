// Importa hooks y librerías necesarias
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, Phone, FileText, BookText } from "lucide-react";
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
    carrera: "",
  });

  const [archivo, setArchivo] = useState(null);
  const [archivoNombre, setArchivoNombre] = useState("");
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
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/carreras`)
      .then((res) => setCarreras(res.data))
      .catch((err) => toast.error("Error al cargar carreras"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { ced_usu, nom_usu, ape_usu, carrera } = datos;

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
    if (!/^\d{10}$/.test(datos.cel_usu))
      return toast.error("El celular debe tener exactamente 10 dígitos");
    if (esUTA) {
      if (!archivo)
        return toast.error("Debes subir el documento PDF obligatorio.");
      if (!carrera.trim()) return toast.error("Debes seleccionar una carrera");
    }

    const formData = new FormData();
    Object.entries(datos).forEach(([key, val]) => formData.append(key, val));
    if (archivo) formData.append("archivo", archivo);

    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/registro`,
        formData
      );
      toast.success("Registro exitoso");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Error al registrar usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page">
      <div className="fixed-image" />
      <div className="form-scroll">
        <div className="form-content">
          <div className="text-center mb-4">
            <div>
              <img
                src="https://i.imgur.com/ZDlLQ2T.png"
                alt="Logo"
                style={{ width: "180px", marginBottom: "10px" }}
              />
            </div>
            <h2 className="registro-titulo">Registro de Usuario</h2>
          </div>

          <form onSubmit={handleSubmit}>
            {[
              "ced_usu",
              "nom_usu",
              "ape_usu",
              "cor_usu",
              "con_usu",
              "cel_usu",
            ].map((name, i) => {
              const labels = {
                ced_usu: "Cédula",
                nom_usu: "Nombres",
                ape_usu: "Apellidos",
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
                  ? "password"
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
                  </div>
                </div>
              );
            })}

            {esUTA && (
              <>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Carrera</label>
                  <div className="input-group">
                    <span className="input-group-text bg-primary text-white">
                      <BookText size={18} />
                    </span>
                    <select
                      className="form-select"
                      name="carrera"
                      value={datos.carrera}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccione una carrera</option>
                      {carreras.map((c) => (
                        <option key={c.id_car} value={c.nom_car}>
                          {c.nom_car}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Documento PDF (matrícula, cédula, votación, motivación)
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-primary text-white">
                      <FileText size={18} />
                    </span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        setArchivo(e.target.files[0]);
                        setArchivoNombre(e.target.files[0]?.name || "");
                      }}
                      className="form-control"
                      required
                    />
                  </div>
                  {archivoNombre && (
                    <small className="text-muted">
                      Archivo seleccionado: <strong>{archivoNombre}</strong>
                    </small>
                  )}
                </div>
              </>
            )}

            <button
              type="submit"
              className="btn btn-primary w-100 fw-bold py-2"
              disabled={loading}
            >
              {loading ? "Registrando..." : "Registrarse"}
            </button>

            <p className="mt-3 text-center">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="text-decoration-none text-primary">
                Inicia sesión
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
