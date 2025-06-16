import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Loader2 } from "lucide-react";

/**
 * Componente que muestra una pantalla de error en la verificación
 * @param {Object} props - Propiedades del componente
 * @param {string} props.message - Mensaje de error
 * @param {string} props.email - Correo electrónico (opcional)
 * @param {Function} props.onResendClick - Función para reenviar verificación
 * @param {boolean} props.loading - Estado de carga
 * @returns {JSX.Element} Componente JSX
 */
const VerificationError = ({ message, email, onResendClick, loading }) => {
  return (
    <div className="contenedor-error-ve bg-white p-8 rounded-lg shadow-md max-w-md mx-auto mt-10">
      {" "}
      <div className="icono-error-ve text-center mb-6">
        <AlertTriangle className="text-5xl text-yellow-500 mx-auto" size={48} />
      </div>
      <h2 className="titulo-error-ve text-2xl font-bold text-center text-gray-800 mb-4">
        Error de verificación
      </h2>
      <div className="mensaje-error-ve text-center mb-6">
        <p className="texto-error-ve text-red-600 font-medium">
          {message ||
            "Ha ocurrido un error al verificar tu correo electrónico."}
        </p>

        {email && (
          <p className="texto-email-ve text-gray-600 mt-4">
            Si deseas intentarlo nuevamente, puedes solicitar un nuevo enlace de
            verificación.
          </p>
        )}
      </div>
      {email && (
        <div className="acciones-error-ve">
          <button
            onClick={onResendClick}
            disabled={loading}
            className="boton-reenviar-ve w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-300 flex items-center justify-center"
          >
            {" "}
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} /> Enviando...
              </>
            ) : (
              "Reenviar verificación"
            )}
          </button>
        </div>
      )}
      <div className="enlaces-error-ve mt-4 text-center">
        <Link
          to="/login"
          className="texto-login-ve text-blue-600 hover:underline"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
};

export default VerificationError;
