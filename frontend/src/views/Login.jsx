// Importación de módulos necesarios
import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../api/axiosConfig";
import { requestWithEndpointFallback } from "../api/endpointFallback";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { Eye, EyeOff, Lock, AtSign, X, Home } from "lucide-react";
import "./styles/Login.css";

const ADMIN_ROLES = new Set([
  "ADMIN_GLOBAL",
  "ADMIN_GENERAL",
  "GLOBAL_ADMIN",
  "GENERAL_ADMIN",
]);

const HOME_ROLES = new Set(["ESTUDIANTE", "STUDENT", "GENERAL"]);

const resolveUserRole = (user) => user?.rol_usu || user?.role || "";

// Componente principal de Login
const Login = () => {
  const { login, usuario } = useAuth();
  const location = useLocation();
  const navigate = useNavigate(); // Hook para redireccionar

  // Accessibility: Dynamic page title (WCAG 2.4.2)
  useDocumentTitle("Iniciar Sesión");

  // Estados locales
  const [email, setEmail] = useState(""); // Correo electrónico
  const [password, setPassword] = useState(""); // Contraseña
  const [showPassword, setShowPassword] = useState(false); // Mostrar/ocultar contraseña
  const [fadeIn, setFadeIn] = useState(false); // Animación de aparición
  const [isLoading, setIsLoading] = useState(false); // Estado de carga del botón
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  // Estados de validación para accesibilidad WCAG 2.1
  const [errors, setErrors] = useState({ email: "", password: "" });
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  const navigateByRole = (user) => {
    const role = resolveUserRole(user);

    if (ADMIN_ROLES.has(role)) {
      navigate("/admin");
      return true;
    }

    if (HOME_ROLES.has(role)) {
      navigate("/home");
      return true;
    }

    return false;
  };

  // Animación al montar el componente
  useEffect(() => {
    setFadeIn(true);
  }, []);

  // Redirecciona al usuario según su rol almacenado en localStorage
  useEffect(() => {
    // Solo redirige si estás en /login
    if (location.pathname === "/login" && usuario) {
      navigateByRole(usuario);
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

  const clearFieldError = (fieldName) => {
    setErrors((prevErrors) => {
      if (!prevErrors[fieldName]) {
        return prevErrors;
      }

      return { ...prevErrors, [fieldName]: "" };
    });
  };

  // Autocompletado
  const handleEmailChange = (e) => {
    const valor = e.target.value;
    setEmail(valor);
    clearFieldError("email");

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

    const normalizedEmail = email.trim().toLowerCase();

    // Limpiar errores anteriores
    setErrors({ email: "", password: "" });

    // Validación básica de campos con feedback accesible
    if (!normalizedEmail || !password) {
      const newErrors = { email: "", password: "" };
      if (!normalizedEmail) {
        newErrors.email = "El correo electrónico es obligatorio";
        emailInputRef.current?.focus();
      } else if (!password) {
        newErrors.password = "La contraseña es obligatoria";
        passwordInputRef.current?.focus();
      }
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }
    // Validación de formato de correo
    if (!isEmailValido(normalizedEmail)) {
      setErrors({ email: "El correo no tiene un formato válido", password: "" });
      emailInputRef.current?.focus();
      setIsLoading(false);
      return;
    }
    if (normalizedEmail !== email) {
      setEmail(normalizedEmail);
    }

    saveEmailIfNew(normalizedEmail);
    try {
      const payload = {
        email: normalizedEmail,
        password,
      };

      const res = await requestWithEndpointFallback(
        () => axiosInstance.post("/auth/login", payload),
        () =>
          axiosInstance.post("/login", {
            correo: normalizedEmail,
            contrasena: password,
          })
      );

      // Verificar si la cuenta requiere verificación
      if (res.data.requireVerification) {
        toast.warning(
          "Debes verificar tu correo electrónico antes de iniciar sesión"
        );
        // Guardar el email para la página de verificación
        localStorage.setItem("verificationPendingEmail", normalizedEmail);
        navigate("/verificacion-pendiente");
        setIsLoading(false);
        return;
      }

      const { usuario: usu, token } = res.data;
      const usuarioFinal = usu ?? res.data;
      login(usuarioFinal, token);
      toast.success("¡Bienvenido!"); // Redirecciona luego de que todo esté estable
      setTimeout(() => {
        const roleHandled = navigateByRole(usuarioFinal);
        if (!roleHandled) {
          toast.error("Rol de usuario no reconocido");
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
      <Link to="/home" className="home-button-l" aria-label="Volver a la página de inicio">
        <Home size={22} color="white" aria-hidden="true" />
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
          <form onSubmit={handleSubmit} className="login-form-l" aria-label="Formulario de inicio de sesión">
            {/* Campo de correo electrónico */}
            <div className="form-group-l">
              <label htmlFor="email" className="form-label-l">
                Correo electrónico
              </label>
              <div className="input-group-l">
                <span className="input-group-text-l" aria-hidden="true">
                  <AtSign size={18} color="#ffffff" />
                </span>
                <input
                  ref={emailInputRef}
                  type="email"
                  className={`form-control-l input-animate-l ${errors.email ? 'input-error-l' : ''}`}
                  id="email"
                  placeholder="usuario@uta.edu.ec"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() =>
                    setTimeout(() => setMostrarSugerencias(false), 150)
                  }
                  onFocus={() => setMostrarSugerencias(sugerencias.length > 0)}
                  autoComplete="email"
                  name="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  aria-autocomplete="list"
                  aria-controls={mostrarSugerencias ? "email-suggestions" : undefined}
                  aria-expanded={mostrarSugerencias}
                />
              </div>

              {/* Mensaje de error accesible */}
              {errors.email && (
                <div id="email-error" className="form-error-l" role="alert">
                  {errors.email}
                </div>
              )}

              {/* Autocompletado de correos guardados */}
              {mostrarSugerencias && (
                <div
                  id="email-suggestions"
                  className="suggestions-container-l"
                  role="listbox"
                  aria-label="Sugerencias de correo electrónico"
                >
                  {sugerencias.map((correo, index) => (
                    <div
                      key={index}
                      className="suggestion-item-l"
                      role="option"
                      aria-selected={false}
                    >
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
                        aria-label={`Eliminar ${correo} de sugerencias`}
                      >
                        <X size={16} aria-hidden="true" />
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
                <span className="input-group-text-l" aria-hidden="true">
                  <Lock size={18} strokeWidth={1.8} />
                </span>
                <input
                  ref={passwordInputRef}
                  type={showPassword ? "text" : "password"}
                  className={`form-control-l input-animate-l ${errors.password ? 'input-error-l' : ''}`}
                  id="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError("password");
                  }}
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  className="btn-outline-secondary-l"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff size={18} color="#6b7280" aria-hidden="true" />
                  ) : (
                    <Eye size={18} color="#6b7280" aria-hidden="true" />
                  )}
                </button>
              </div>

              {/* Mensaje de error accesible */}
              {errors.password && (
                <div id="password-error" className="form-error-l" role="alert">
                  {errors.password}
                </div>
              )}
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
            <Link to="/register" className="register-link-l hover:underline">
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
