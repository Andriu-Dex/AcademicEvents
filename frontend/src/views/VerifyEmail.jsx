import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import VerificationSuccess from "../components/verification/VerificationSuccess";
import VerificationError from "../components/verification/VerificationError";

/**
 * Página para verificar el correo electrónico
 * @returns {JSX.Element} Componente JSX
 */
const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const hasExecutedRef = useRef(false);

  // Verificar el token cuando el componente se monta
  useEffect(() => {
    const verifyToken = async () => {
      // Evitar múltiples ejecuciones
      if (hasExecutedRef.current || !token) return;

      hasExecutedRef.current = true;

      console.log(`[Frontend] Iniciando verificación para token: ${token}`);

      try {
        console.log(
          `[Frontend] Enviando solicitud a: ${
            import.meta.env.VITE_API_URL
          }/api/verificacion/${token}`
        );

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/verificacion/${token}`
        );

        console.log(`[Frontend] Respuesta recibida:`, response.data);

        if (response.data.success) {
          console.log(`[Frontend] Verificación exitosa para token: ${token}`);
          setStatus("success");
          toast.success("¡Correo verificado exitosamente!");
        } else {
          console.log(
            `[Frontend] Verificación fallida para token: ${token}`,
            response.data.message
          );
          setStatus("error");
          setError(
            response.data.message || "Error al verificar el correo electrónico"
          );
        }
      } catch (error) {
        console.log(
          `[Frontend] Error en verificación para token: ${token}`,
          error.response?.data
        );
        setStatus("error");
        setError(
          error.response?.data?.message ||
            "Error al verificar el correo electrónico. El enlace puede haber expirado o ser inválido."
        );
      }
    };

    verifyToken();
  }, [token]);

  // Manejar el reenvío de verificación
  const handleResendClick = async () => {
    setLoading(true);

    try {
      // Intentar obtener información del token (incluso si ha expirado)
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/verificacion/reenviar/${token}`
      );

      if (response.data.success) {
        toast.success(
          "Se ha enviado un nuevo correo de verificación. Por favor, revisa tu bandeja de entrada."
        );
      } else {
        toast.error(
          response.data.message || "Error al reenviar la verificación"
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Error al reenviar la verificación. Por favor, intenta iniciar sesión para solicitar un nuevo enlace."
      );
    } finally {
      setLoading(false);
    }
  };
  // Redireccionar al home después de una verificación exitosa
  const handleContinue = () => {
    navigate("/");
  };

  // Renderizar el componente según el estado
  if (status === "verifying") {
    return (
      <div className="contenedor-verificando-ve flex justify-center items-center min-h-[60vh]">
        <div className="spinner-verificando-ve animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        <p className="texto-verificando-ve ml-4 text-lg text-gray-700">
          Verificando tu correo...
        </p>
      </div>
    );
  }

  if (status === "success") {
    return <VerificationSuccess onContinue={handleContinue} />;
  }

  return (
    <VerificationError
      message={error}
      onResendClick={handleResendClick}
      loading={loading}
    />
  );
};

export default VerifyEmail;
