import { useState } from "react";
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

  const handleChange = (e) =>
    setDatos({ ...datos, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (datos.con_usu.length < 6)
      return toast.error("La contraseña debe tener al menos 6 caracteres");
    if (!/^\d{10}$/.test(datos.cel_usu))
      return toast.error("El celular debe tener exactamente 10 dígitos");
    if (esUTA) {
      if (!archivo)
        return toast.error("Debes subir el documento PDF obligatorio.");
      if (!datos.carrera.trim())
        return toast.error("Debes seleccionar una carrera");
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
      {/* IMAGEN FIJA */}
      <div className="fixed-image" />

      {/* FORMULARIO SCROLLABLE */}
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
              { label: "Cédula", name: "ced_usu", icon: <User size={18} /> },
              { label: "Nombres", name: "nom_usu", icon: <User size={18} /> },
              { label: "Apellidos", name: "ape_usu", icon: <User size={18} /> },
              {
                label: "Correo electrónico",
                name: "cor_usu",
                icon: <Mail size={18} />,
                type: "email",
              },
              {
                label: "Contraseña",
                name: "con_usu",
                icon: <Lock size={18} />,
                type: "password",
              },
              { label: "Celular", name: "cel_usu", icon: <Phone size={18} /> },
            ].map(({ label, name, icon, type = "text" }) => (
              <div key={name} className="mb-3">
                <label className="form-label fw-semibold">{label}</label>
                <div className="input-group">
                  <span className="input-group-text bg-primary text-white">
                    {icon}
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
            ))}

            {esUTA && (
              <>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Carrera</label>
                  <div className="input-group">
                    <span className="input-group-text bg-primary text-white">
                      <BookText size={18} />
                    </span>
                    <input
                      type="text"
                      name="carrera"
                      value={datos.carrera}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
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
