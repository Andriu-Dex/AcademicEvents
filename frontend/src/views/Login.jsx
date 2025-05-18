// Importación de módulos necesarios
import React, { useState, useEffect } from "react"; // React y hooks
import axios from "axios"; // Cliente HTTP
import { useNavigate } from "react-router-dom"; // Navegación programática
import { toast } from "react-toastify"; // Notificaciones tipo toast
import { useAuth } from "../hooks/useAuth"; // Hook personalizado de autenticación
import { Eye, EyeOff } from "lucide-react"; // Íconos para mostrar/ocultar contraseña

// Componente principal de Login
const Login = () => {
  const { login } = useAuth(); // Función de login desde el hook de autenticación
  const navigate = useNavigate(); // Hook para redireccionar

  // Estados para manejar formulario, animaciones y carga
  const [email, setEmail] = useState(""); // Correo electrónico
  const [password, setPassword] = useState(""); // Contraseña
  const [showPassword, setShowPassword] = useState(false); // Mostrar/ocultar contraseña
  const [fadeIn, setFadeIn] = useState(false); // Animación de aparición
  const [isLoading, setIsLoading] = useState(false); // Estado de carga del botón

  // Ejecuta efecto de animación cuando se monta el componente
  useEffect(() => {
    setFadeIn(true);
  }, []);

  // Manejo del formulario al enviar
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene recarga de página
    setIsLoading(true); // Muestra spinner de carga

    // Validación básica de campos
    if (!email || !password) {
      toast.error("Todos los campos son obligatorios.");
      setIsLoading(false);
      return;
    }

    // Validación de dominio institucional
    if (!email.endsWith("@uta.edu.ec")) {
      toast.error("Debes usar tu correo institucional (@uta.edu.ec)");
      setIsLoading(false);
      return;
    }

    try {
      // Enviar credenciales al backend
      const response = await axios.post("http://localhost:3000/api/login", {
        correo: email,
        contrasena: password,
      });

      // Extrae token y usuario de la respuesta
      const { token, usuario } = response.data;

      // Guarda usuario y token en el contexto de autenticación
      login(usuario, token);

      // Muestra mensaje de bienvenida
      toast.success("¡Bienvenido!");

      // Redirige según el rol del usuario
      if (usuario.rol === "ESTUDIANTE") {
        navigate("/certificados");
      } else {
        navigate("/"); // Redirección por defecto o para futuros roles
      }
    } catch (err) {
      // Muestra mensaje de error si la petición falla
      toast.error(err.response?.data?.msg || "Error al iniciar sesión");
    } finally {
      // Finaliza la carga
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Estilos personalizados para animaciones y diseño del login */}
      <style>{`
        html, body, #root {
          margin: 0;
          padding: 0;
          height: 100%;
          overflow: hidden;
          background-color: transparent;
          font-family: 'Poppins', 'Segoe UI', sans-serif;
        }

        @keyframes moveBackground {
          0% { background-position: center top; }
          50% { background-position: center bottom; }
          100% { background-position: center top; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        .form-control:focus {
          border-color: #8A1538;
          box-shadow: 0 0 0 0.25rem rgba(138, 21, 56, 0.25);
        }

        .input-group-text {
          background-color: #8A1538;
          color: white;
          border: none;
        }

        .btn-login {
          background-color: #8A1538;
          color: white;
          transition: all 0.3s ease;
        }

        .btn-login:hover {
          background-color: #6a102c;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .alert {
          animation: fadeIn 0.5s ease forwards;
        }

        .login-card {
          transition: all 0.5s ease;
          backdrop-filter: blur(10px);
        }

        .login-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2) !important;
        }

        .floating-icon {
          animation: float 6s ease-in-out infinite;
        }

        .input-animate {
          transition: all 0.3s ease;
        }

        .input-animate:focus {
          transform: translateX(5px);
        }

        .forgot-password {
          color: #8A1538;
          transition: all 0.3s ease;
        }

        .forgot-password:hover {
          color: #6a102c;
          text-decoration: underline !important;
        }

        .wave-divider {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          overflow: hidden;
          line-height: 0;
        }

        .wave-divider svg {
          display: block;
          width: calc(100% + 1.3px);
          height: 150px;
        }

        .wave-divider .shape-fill {
          fill: rgba(255, 255, 255, 0.4);
        }
      `}</style>

      {/* Fondo animado con imagen */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: "url('https://i.imgur.com/2mo8unt.jpg')",
          backgroundSize: "cover",
          backgroundRepeat: "repeat-y",
          backgroundPosition: "center",
          animation: "moveBackground 30s ease infinite",
          zIndex: -1,
        }}
      ></div>

      {/* Onda decorativa inferior */}
      <div className="wave-divider">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="shape-fill"
          ></path>
        </svg>
      </div>

      {/* Contenedor principal centrado */}
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh", width: "100vw" }}
      >
        {/* Tarjeta de inicio de sesión con animación */}
        <div
          className={`shadow-lg p-4 p-md-5 rounded-4 text-center login-card ${
            fadeIn ? "animate__animated animate__fadeIn" : ""
          }`}
          style={{
            maxWidth: "450px",
            width: "90%",
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            borderTop: "6px solid #8A1538",
            animation: fadeIn ? "fadeIn 1s ease forwards" : "none",
            opacity: fadeIn ? 1 : 0,
          }}
        >
          {/* Logo con animación flotante */}
          <div className="floating-icon mb-4">
            <img
              src="https://i.imgur.com/KrUzH8J.png"
              alt="Logo FISEI"
              style={{ width: "280px", height: "auto" }}
              className="img-fluid"
            />
          </div>

          {/* Título con animación */}
          <div
            style={{
              animation: "fadeIn 1s ease 0.3s forwards",
              opacity: 0,
              animationFillMode: "forwards",
            }}
          >
            <h2
              className="mb-4"
              style={{ color: "#8A1538", fontWeight: "bold" }}
            >
              Iniciar Sesión
            </h2>
          </div>

          {/* Formulario de inicio de sesión */}
          <form onSubmit={handleSubmit} className="text-start">
            {/* Campo de correo electrónico */}
            <div className="mb-4">
              <label htmlFor="email" className="form-label fw-semibold">
                Correo electrónico
              </label>
              <div className="input-group">
                <span className="input-group-text">@</span>
                <input
                  type="email"
                  className="form-control py-2"
                  id="email"
                  placeholder="usuario@uta.edu.ec"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Campo de contraseña */}
            <div className="mb-4">
              <label htmlFor="password" className="form-label fw-semibold">
                Contraseña
              </label>
              <div className="input-group">
                <span className="input-group-text">🔒</span>
                <input
                  type={showPassword ? "text" : "password"} // Alterna tipo input
                  className="form-control py-2"
                  id="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {/* Botón para mostrar/ocultar contraseña */}
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ border: "none", background: "transparent" }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Enlace para recuperar contraseña */}
            <div className="mb-4 text-end">
              <a
                href="#"
                className="text-decoration-none forgot-password"
                style={{ fontSize: "0.9rem" }}
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Botón de envío con spinner de carga */}
            <button
              type="submit"
              className="btn btn-login w-100 py-2 fw-bold d-flex align-items-center justify-content-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Iniciando sesión...
                </>
              ) : (
                <>Iniciar sesión</>
              )}
            </button>
          </form>
          <div
            className="mt-4 text-center"
            style={{
              animation: "fadeIn 1s ease 0.9s forwards",
              opacity: 0,
              animationFillMode: "forwards",
            }}
          >
            <small className="text-muted">
              Universidad Técnica de Ambato &copy; {new Date().getFullYear()}
            </small>
          </div>
        </div>
      </div>
    </>
  );
};

// Exporta el componente de Login
export default Login;
