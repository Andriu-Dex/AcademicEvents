// Importa hooks y librerías necesarias
import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosConfig";
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
    id_car_est: "",
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
    if (!/^\d{10}$/.test(datos.cel_usu))
      return toast.error("El celular debe tener exactamente 10 dígitos");
    if (esUTA) {
      if (!archivo)
        return toast.error("Debes subir el documento PDF obligatorio.");
      if (!carrera.trim()) return toast.error("Debes seleccionar una carrera");
    }

    const formData = new FormData();
    Object.entries(datos).forEach(([key, val]) => formData.append(key, val));

    if (archivo) {
      // Validar nuevamente el archivo antes de enviar
      if (archivo.size > 5 * 1024 * 1024) {
        return toast.error(
          "El archivo excede el tamaño máximo permitido (5MB)."
        );
      }
      if (!archivo.type || archivo.type !== "application/pdf") {
        return toast.error("El archivo debe ser un PDF válido.");
      }
      formData.append("archivo", archivo);
    }
    try {
      setLoading(true);
      const response = await axiosInstance.post("/registro", formData);
      toast.success("Registro exitoso.");
      navigate("/login");
    } catch (error) {
      console.error("Error en registro:", error);
      if (error.response?.status === 413) {
        toast.error("El archivo es demasiado grande. El límite es de 5MB.");
      } else if (error.response?.data?.error === "invalid_file") {
        toast.error("El archivo subido no es válido. Debe ser un PDF.");
      } else if (error.response?.data?.msg) {
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
      <div className="form-scroll">
        <div className="form-content">
          <div className="text-center mb-4">
            {" "}
            <div>
              {" "}
              <img
                src="https://i.imgur.com/ZDlLQ2T.png"
                alt="Logo"
                style={{ width: "320px", marginBottom: "10px" }}
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

                <div className="mb-3">
                  {" "}
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
                        const file = e.target.files[0];
                        if (file) {
                          // Validar tamaño de archivo (5MB = 5 * 1024 * 1024 bytes)
                          const maxSize = 5 * 1024 * 1024; // 5MB en bytes
                          if (file.size > maxSize) {
                            toast.error(
                              "El archivo excede el tamaño máximo permitido (5MB). Por favor, comprima el PDF o seleccione un archivo más pequeño.",
                              {
                                position: "top-center",
                                autoClose: 5000,
                              }
                            );
                            e.target.value = ""; // Limpiar el input
                            setArchivo(null);
                            setArchivoNombre("");
                          } else if (
                            !file.type ||
                            file.type !== "application/pdf"
                          ) {
                            toast.error("El archivo debe ser un PDF válido.", {
                              position: "top-center",
                              autoClose: 3000,
                            });
                            e.target.value = ""; // Limpiar el input
                            setArchivo(null);
                            setArchivoNombre("");
                          } else {
                            setArchivo(file);
                            setArchivoNombre(file.name);
                          }
                        }
                      }}
                      className="form-control"
                      required
                    />
                  </div>
                  {archivoNombre && (
                    <div className="mt-2 d-flex justify-content-center">
                      <small className="text-muted d-flex align-items-center">
                        {" "}
                        <strong className="ms-1">{archivoNombre}</strong>
                        {archivo && (
                          <span className="ms-2">
                            ({Math.round(archivo.size / 1024)} KB)
                          </span>
                        )}
                      </small>
                    </div>
                  )}
                </div>
              </>
            )}

            <button
              type="submit"
              className="btn btn-primary w-100 fw-bold py-2"
              style={{ textAlign: "center" }}
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
