import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Home } from "lucide-react";
import VerificationPending from "../components/verification/VerificationPending";
import ResendVerification from "../components/verification/ResendVerification";
import axios from "axios";
import { toast } from "react-toastify";

/**
 * Página de verificación pendiente
 * @returns {JSX.Element} Componente JSX
 */
const VerificationPendingPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResendForm, setShowResendForm] = useState(false);
  const [showCorrectEmail, setShowCorrectEmail] = useState(false);
  const navigate = useNavigate();

  // Obtener el email del localStorage si existe
  useEffect(() => {
    const pendingEmail = localStorage.getItem("verificationPendingEmail");
    if (pendingEmail) {
      setEmail(pendingEmail);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Manejar el reenvío de verificación
  const handleResendClick = async () => {
    if (!email) {
      setError("No hay un correo electrónico para reenviar la verificación");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/verificacion/reenviar`,
        {
          correo: email,
        }
      );

      if (response.data.success) {
        toast.success(
          "Correo de verificación reenviado. Por favor, revisa tu bandeja de entrada."
        );
      } else {
        setError(
          response.data.message || "Error al reenviar el correo de verificación"
        );
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);

        // Si hay un tiempo de espera debido al rate limiting
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
  const handleResendSuccess = (email) => {
    setShowResendForm(false);
    setEmail(email);
    localStorage.setItem("verificationPendingEmail", email);
  };
  // Cambiar entre pantalla de verificación y formulario de reenvío
  const toggleResendForm = () => {
    setShowResendForm(!showResendForm);
    setShowCorrectEmail(false);
  };

  // Navegar a la página de corrección de correo
  const handleCorrectEmail = () => {
    navigate("/corregir-correo", { state: { email } });
  };

  // Limpiar el email almacenado y volver al login
  const handleGoToLogin = () => {
    localStorage.removeItem("verificationPendingEmail");
    navigate("/login");
  };

  return (
    <div className="contenedor-pagina-vp min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      {" "}
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <span className="sr-only">Volver al inicio</span>
            <Home className="h-5 w-5 mr-2" />
            Volver al inicio
          </Link>
        </div>

        {!showResendForm ? (
          <VerificationPending
            email={email}
            onResendClick={handleResendClick}
            loading={loading}
            error={error}
            onCorrectEmail={handleCorrectEmail}
          />
        ) : (
          <ResendVerification
            defaultEmail={email}
            onSuccess={handleResendSuccess}
          />
        )}
        <div className="mt-6 text-center">
          <button
            onClick={toggleResendForm}
            className="text-sm text-blue-600 hover:underline"
          >
            {showResendForm
              ? "Volver a la pantalla de verificación"
              : "¿No recibiste ningún correo? Usar otro correo electrónico"}
          </button>

          <div className="mt-4">
            <button
              onClick={handleGoToLogin}
              className="text-sm text-gray-600 hover:underline"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPendingPage;
