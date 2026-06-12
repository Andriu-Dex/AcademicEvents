import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VerificationPending from "../components/verification/VerificationPending";
import ResendVerification from "../components/verification/ResendVerification";
import VerificationSuccess from "../components/verification/VerificationSuccess";
import RedirectingVerification from "../components/verification/RedirectingVerification";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

/**
 * Página de verificación pendiente con input de código OTP
 * @returns {JSX.Element} Componente JSX
 */
const VerificationPendingPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [showResendForm, setShowResendForm] = useState(false);
  const [status, setStatus] = useState("pending"); // pending, success, redirecting
  const navigate = useNavigate();
  const { login } = useAuth();

  // Obtener el email del localStorage si existe
  useEffect(() => {
    const pendingEmail = localStorage.getItem("verificationPendingEmail");
    if (pendingEmail) {
      setEmail(pendingEmail);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Manejar verificación del código OTP
  const handleCodeSubmit = async (code) => {
    if (!email || !code) return;

    setVerifying(true);
    setCodeError("");
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/verificacion/codigo`,
        {
          email: email,
          code: code,
        }
      );

      if (response.data.success) {
        // Si hay datos de autenticación, iniciar sesión automáticamente
        if (response.data.authToken && response.data.usuario) {
          login(response.data.usuario, response.data.authToken);
          toast.success("¡Correo verificado! Redirigiendo al inicio...");

          // Limpiar email pendiente del localStorage
          localStorage.removeItem("verificationPendingEmail");

          // Mostrar pantalla de redirección
          setStatus("redirecting");

          setTimeout(() => {
            navigate("/");
          }, 3000);
        } else {
          setStatus("success");
          localStorage.removeItem("verificationPendingEmail");
          toast.success("¡Correo verificado exitosamente!");
        }
      } else {
        setCodeError(
          response.data.message || "Código inválido. Intenta de nuevo."
        );
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Error al verificar el código. Intenta de nuevo.";
      setCodeError(message);
    } finally {
      setVerifying(false);
    }
  };

  // Manejar el reenvío de verificación
  const handleResendClick = async () => {
    if (!email) {
      setError("No hay un correo electrónico para reenviar la verificación");
      return;
    }

    setLoading(true);
    setError("");
    setCodeError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/verificacion/reenviar`,
        {
          correo: email,
        }
      );

      if (response.data.success) {
        toast.success(
          "Nuevo código de verificación enviado. Revisa tu bandeja de entrada."
        );
      } else {
        setError(
          response.data.message || "Error al reenviar el código de verificación"
        );
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);

        if (error.response.data.tiempoRestante) {
          toast.warning(
            `Intenta nuevamente en ${error.response.data.tiempoRestante} minutos`
          );
        }
      } else {
        setError(
          "Error al comunicarse con el servidor. Intenta nuevamente más tarde."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Manejar el éxito del reenvío desde el formulario
  const handleResendSuccess = (newEmail) => {
    setShowResendForm(false);
    setEmail(newEmail);
    localStorage.setItem("verificationPendingEmail", newEmail);
  };

  // Navegar a la página de corrección de correo
  const handleCorrectEmail = () => {
    navigate("/corregir-correo", { state: { email } });
  };

  // Redireccionar al home
  const handleContinue = () => {
    navigate("/");
  };

  // Pantalla de redirección después de verificación exitosa
  if (status === "redirecting") {
    return <RedirectingVerification />;
  }

  // Pantalla de éxito (fallback sin auto-login)
  if (status === "success") {
    return <VerificationSuccess onContinue={handleContinue} />;
  }

  return (
    <div className="contenedor-pagina-vp min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {!showResendForm ? (
          <VerificationPending
            email={email}
            onResendClick={handleResendClick}
            onCodeSubmit={handleCodeSubmit}
            onCorrectEmail={handleCorrectEmail}
            loading={loading}
            verifying={verifying}
            error={error}
            codeError={codeError}
          />
        ) : (
          <ResendVerification
            defaultEmail={email}
            onSuccess={handleResendSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default VerificationPendingPage;
