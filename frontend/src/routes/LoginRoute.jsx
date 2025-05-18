import { useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LoginRoute = () => {
  const { login } = useAuth(); // Hook de contexto para iniciar sesión
  const navigate = useNavigate(); // Redirección tras autenticación

  const [correo, setCorreo] = useState(""); // Estado para el correo
  const [contrasena, setContrasena] = useState(""); // Estado para la contraseña

  // Función para manejar envío del formulario
  const handleLogin = async (e) => {
    e.preventDefault();

    // Validación: solo correos institucionales permitidos
    if (!correo.endsWith("@uta.edu.ec")) {
      return toast.error("Debes usar tu correo institucional");
    }

    try {
      // Solicitud al backend
      const res = await axios.post("http://localhost:3000/api/login", {
        correo,
        contrasena,
      });

      const { token, usuario } = res.data;

      login(usuario, token); // Guardar datos en contexto y localStorage
      toast.success("¡Bienvenido!");

      // Redirección basada en rol
      if (usuario.rol === "ESTUDIANTE") {
        navigate("/certificados");
      } else {
        navigate("/"); // Cambiar si luego hay panel admin
      }
    } catch (error) {
      // Mostrar error de backend o mensaje genérico
      toast.error(error.response?.data?.msg || "Error al iniciar sesión");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-xl font-bold mb-4">Iniciar sesión</h2>

        <input
          type="email"
          placeholder="Correo institucional"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Ingresar
        </button>
      </form>
    </div>
  );
};

export default LoginRoute;
