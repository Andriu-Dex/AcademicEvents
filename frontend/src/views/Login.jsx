// Importación de módulos necesarios
import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosConfig";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import { Eye, EyeOff, Lock, AtSign, X, Home } from "lucide-react";
import "./styles/Login.css";

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
      switch (usuario.rol_usu) {
        case "ADMIN_GLOBAL":
        case "ADMIN_GENERAL":
          navigate("/admin"); // ✅ Redirige al panel principal
          break;
        case "ESTUDIANTE":
        case "GENERAL":
          navigate("/home"); // Tanto estudiantes como usuarios generales van al home
          break;
      }
    }
  }, [usuario, location.pathname]);

  // Añade una clase al body para estilos específicos de login
  useEffect(() => {
    document.body.classList.add("login-active");
    return () => document.body.classList.remove("login-active");
  }, []);

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
      const res = await axiosInstance.post(`/login`, {
        correo: email,
        contrasena: password,
      });

      // Verificar si la cuenta requiere verificación
      if (res.data.requireVerification) {
        toast.warning(
          "Debes verificar tu correo electrónico antes de iniciar sesión"
        );
        // Guardar el email para la página de verificación
        localStorage.setItem("verificationPendingEmail", email);
        navigate("/verificacion-pendiente");
        setIsLoading(false);
        return;
      }

      const { usuario: usu, token } = res.data;
      const usuarioFinal = usu ?? res.data;
      login(usuarioFinal, token);
      toast.success("¡Bienvenido!"); // Redirecciona luego de que todo esté estable
      setTimeout(() => {
        switch (usuarioFinal.rol_usu) {
          case "ADMIN_GLOBAL":
          case "ADMIN_GENERAL":
            navigate("/admin");
            break;
          case "ESTUDIANTE":
          case "GENERAL":
            navigate("/home"); // Tanto estudiantes como usuarios generales van al home
            break;
          default:
            toast.error("Rol de usuario no reconocido");
            break;
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
      {/* Fondo animado con imagen */}
      <div className="login-background-l"></div>{" "}
      {/* Onda decorativa inferior */}
      <div className="wave-divider-l">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="shape-fill-l"
          ></path>
        </svg>
      </div>
      {/* Botón para volver al home */}
      <Link to="/home" className="home-button-l">
        <Home size={22} color="white" />
      </Link>
      {/* Contenedor principal centrado */}
      <div className="login-main-container-l">
        {/* Tarjeta de inicio de sesión con animación */}
        <div
          className={`login-card-l ${
            fadeIn ? "animate__animated animate__fadeIn" : ""
          }`}
        >
          {/* Logo con animación flotante */}
          <div className="floating-icon-l">
            <img
              src="https://i.imgur.com/KrUzH8J.png"
              alt="Logo FISEI"
              className="logo-img-l"
            />
          </div>

          {/* Título con animación */}
          <div>
            <h2 className="login-title-l">Iniciar Sesión</h2>
          </div>

          {/* Formulario de inicio de sesión */}
          <form onSubmit={handleSubmit} className="login-form-l">
            {/* Campo de correo electrónico */}
            <div className="form-group-l">
              <label htmlFor="email" className="form-label-l">
                Correo electrónico
              </label>
              <div className="input-group-l">
                <span className="input-group-text-l">
                  <AtSign size={18} color="#ffffff" />
                </span>
                <input
                  type="email"
                  className="form-control-l input-animate-l"
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
                <div className="suggestions-container-l">
                  {sugerencias.map((correo, index) => (
                    <div key={index} className="suggestion-item-l">
                      <span
                        onMouseDown={() => {
                          setEmail(correo);
                          setMostrarSugerencias(false);
                        }}
                      >
                        {correo}
                      </span>
                      <button
                        type="button"
                        className="btn-link-l"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Eliminar correo de localStorage
                          const guardados =
                            JSON.parse(localStorage.getItem("emailsUsados")) ||
                            [];
                          const nuevos = guardados.filter((c) => c !== correo);
                          localStorage.setItem(
                            "emailsUsados",
                            JSON.stringify(nuevos)
                          );
                          setSugerencias(
                            nuevos.filter((c) =>
                              c.toLowerCase().includes(email.toLowerCase())
                            )
                          );
                          if (nuevos.length === 0) setMostrarSugerencias(false);
                        }}
                        title="Eliminar sugerencia"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Campo de contraseña */}
            <div className="form-group-password-l">
              <label htmlFor="password" className="form-label-l">
                Contraseña
              </label>
              <div className="input-group-password-l">
                <span className="input-group-text-l">
                  <Lock size={18} strokeWidth={1.8} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control-l input-animate-l"
                  id="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-outline-secondary-l"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff size={18} color="#6b7280" />
                  ) : (
                    <Eye size={18} color="#6b7280" />
                  )}
                </button>
              </div>
            </div>

            {/* Enlace para recuperar contraseña */}
            <div className="forgot-password-container-l">
              <Link to="/forgot-password" className="forgot-password-l">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Botón de envío con spinner de carga */}
            <button type="submit" className="btn-login-l" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span
                    className="spinner-border-sm-l"
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
          <p className="register-text-l">
            ¿No tienes cuenta?{" "}
            <Link to="/registro" className="register-link-l hover:underline">
              Regístrate
            </Link>
          </p>

          <div className="copyright-text-l">
            <small>
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
