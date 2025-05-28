// Importación de módulos necesarios
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import { Eye, EyeOff, Lock, AtSign } from "lucide-react";

// Componente principal de Login
const Login = () => {
  const { login, usuario } = useAuth();
  const location = useLocation();
  const navigate = useNavigate(); // Hook para redireccionar

  // Estados locales
  const [email, setEmail] = useState(""); // Correo electrónico
  const [password, setPassword] = useState(""); // Contraseña
  const [showPassword, setShowPassword] = useState(false); // Mostrar/ocultar contraseña
  const [fadeIn, setFadeIn] = useState(false); // Animación de aparición
  const [isLoading, setIsLoading] = useState(false); // Estado de carga del botón
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  // Animación al montar el componente
  useEffect(() => {
    setFadeIn(true);
  }, []);

  // Redirecciona al usuario según su rol almacenado en localStorage
  useEffect(() => {
    // Solo redirige si estás en /login
    if (location.pathname === "/login" && usuario) {
      if (usuario.rol_usu === "ADMIN") {
        navigate("/admin"); // ✅ Redirige al panel principal
      } else if (usuario.rol_usu === "ESTUDIANTE") {
        navigate("/eventos");
      }
    }
  }, [usuario, location.pathname]);

  // Guarda email si es nuevo
  const saveEmailIfNew = (nuevoEmail) => {
    const guardados = JSON.parse(localStorage.getItem("emailsUsados")) || [];
    if (!guardados.includes(nuevoEmail)) {
      guardados.push(nuevoEmail);
      localStorage.setItem("emailsUsados", JSON.stringify(guardados));
    }
  };

  // Validación de correo simple
  const isEmailValido = (correo) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

  // Autocompletado
  const handleEmailChange = (e) => {
    const valor = e.target.value;
    setEmail(valor);

    const correos = JSON.parse(localStorage.getItem("emailsUsados")) || [];
    const coincidencias = correos.filter((c) =>
      c.toLowerCase().includes(valor.toLowerCase())
    );
    setSugerencias(coincidencias);
    setMostrarSugerencias(coincidencias.length > 0);
  };

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
    // Validación de formato de correo
    if (!isEmailValido(email)) {
      toast.error("El correo no tiene un formato válido.");
      setIsLoading(false);
      return;
    }
    saveEmailIfNew(email);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/login`,
        {
          correo: email,
          contrasena: password,
        }
      );

      const { usuario: usu, token } = res.data;
      const usuarioFinal = usu ?? res.data;

      login(usuarioFinal, token);
      toast.success("¡Bienvenido!");

      // Redirecciona luego de que todo esté estable
      setTimeout(() => {
        if (usuarioFinal.rol_usu === "ADMIN") {
          navigate("/admin");
        } else if (usuarioFinal.rol_usu === "ESTUDIANTE") {
          navigate("/eventos");
        }
      }, 500); // pequeña pausa opcional
    } catch (err) {
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
          /* Mejora la transición y diseño de sugerencias */
        .suggestion-item:hover {
          background-color: #f8d7da !important;
          color: #8A1538;
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
            <div className="mb-4 position-relative" style={{ zIndex: 5 }}>
              <label htmlFor="email" className="form-label fw-semibold">
                Correo electrónico
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <AtSign size={18} color="#ffffff" />
                </span>
                <input
                  type="email"
                  className="form-control py-2"
                  id="email"
                  placeholder="usuario@uta.edu.ec"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() =>
                    setTimeout(() => setMostrarSugerencias(false), 150)
                  }
                  onFocus={() => setMostrarSugerencias(sugerencias.length > 0)}
                  autoComplete="off"
                  name="email"
                />
              </div>

              {/* Autocompletado de correos guardados */}
              {mostrarSugerencias && (
                <div
                  className="position-absolute bg-white border rounded-3 shadow-sm"
                  style={{
                    width: "100%",
                    zIndex: 20,
                    maxHeight: "150px",
                    overflowY: "auto",
                    borderColor: "#8A1538",
                    marginTop: "2px", // Ajuste menor de margen
                    top: "100%", // Asegura que se coloque justo debajo del input
                  }}
                >
                  {sugerencias.map((correo, index) => (
                    <div
                      key={index}
                      onMouseDown={() => {
                        setEmail(correo);
                        setMostrarSugerencias(false);
                      }}
                      className="px-3 py-2 suggestion-item"
                      style={{
                        cursor: "pointer",
                        transition: "background 0.2s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f8d7da")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      {correo}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Campo de contraseña */}
            <div className="mb-4">
              <label htmlFor="password" className="form-label fw-semibold">
                Contraseña
              </label>
              <div className="input-group">
                {/* <span className="input-group-text">🔒</span> */}
                <span className="input-group-text">
                  <Lock size={18} strokeWidth={1.8} className="text-gray-700" />
                </span>
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
                  {showPassword ? (
                    <EyeOff size={18} color="#323232" />
                  ) : (
                    <Eye size={18} color="#323232" />
                  )}
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
          <p className="mt-3 text-sm text-center">
            ¿No tienes cuenta?{" "}
            <Link to="/registro" className="text-blue-600 hover:underline">
              Regístrate
            </Link>
          </p>

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
