import React, { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

/**
 * Componente para reenviar la verificación de correo
 * @param {Object} props - Propiedades del componente
 * @param {string} props.defaultEmail - Correo electrónico predeterminado (opcional)
 * @param {Function} props.onSuccess - Función a ejecutar cuando el reenvío es exitoso
 * @returns {JSX.Element} Componente JSX
 */
const ResendVerification = ({ defaultEmail = "", onSuccess }) => {
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Por favor, ingresa tu correo electrónico");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Por favor, ingresa un correo electrónico válido");
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
        if (onSuccess) {
          onSuccess(email);
        }
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

  return (
    <div className="contenedor-reenvio-rv bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h3 className="titulo-reenvio-rv text-xl font-semibold text-gray-800 mb-4">
        Reenviar verificación de correo
      </h3>

      {error && (
        <div className="error-reenvio-rv bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="formulario-reenvio-rv">
        <div className="mb-4">
          <label
            htmlFor="email"
            className="etiqueta-email-rv block text-gray-700 mb-2"
          >
            Correo electrónico
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className="campo-email-rv w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="boton-enviar-rv w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-300 flex items-center justify-center"
        >
          {" "}
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              Enviando...
            </>
          ) : (
            <>
              <Send className="mr-2" size={16} />
              Reenviar verificación
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ResendVerification;
