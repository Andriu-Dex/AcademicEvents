import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

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
  const [archivoNombre, setArchivoNombre] = useState(""); // ← nombre visible
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setDatos({ ...datos, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación de archivo
    if (!archivo) return toast.error("Debes subir un archivo PDF.");

    // Validación de correo institucional
    if (!datos.cor_usu.endsWith("@uta.edu.ec")) {
      return toast.error("El correo debe ser institucional (@uta.edu.ec)");
    }

    // Validación de contraseña
    if (datos.con_usu.length < 6) {
      return toast.error("La contraseña debe tener al menos 6 caracteres");
    }

    // Validación de celular (exactamente 10 dígitos)
    if (!/^\d{10}$/.test(datos.cel_usu)) {
      return toast.error("El celular debe tener exactamente 10 dígitos");
    }

    const formData = new FormData();
    Object.entries(datos).forEach(([key, val]) => formData.append(key, val));
    formData.append("archivo", archivo);

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
    <div className="max-w-xl mx-auto p-6 mt-10 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Registro de Estudiante</h1>

      <form onSubmit={handleSubmit}>
        {[
          { label: "Cédula", name: "ced_usu" },
          { label: "Nombres", name: "nom_usu" },
          { label: "Apellidos", name: "ape_usu" },
          { label: "Correo institucional", name: "cor_usu", type: "email" },
          { label: "Contraseña", name: "con_usu", type: "password" },
          { label: "Celular", name: "cel_usu" },
          { label: "Carrera", name: "carrera" },
        ].map(({ label, name, type = "text" }) => (
          <div key={name} className="mb-4">
            <label className="block font-semibold">{label}</label>
            <input
              type={type}
              name={name}
              value={datos[name]}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
        ))}

        <div className="mb-4">
          <label className="block font-semibold">
            Documento PDF (matrícula)
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              setArchivo(e.target.files[0]);
              setArchivoNombre(e.target.files[0]?.name || "");
            }}
            className="w-full"
            required
          />
          {archivoNombre && (
            <p className="text-sm text-gray-600 mt-1">
              Archivo seleccionado: <strong>{archivoNombre}</strong>
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
          disabled={loading}
        >
          {loading ? "Registrando..." : "Registrarse"}
        </button>
      </form>
    </div>
  );
};

export default Register;
