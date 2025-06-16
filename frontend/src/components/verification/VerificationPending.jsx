import React from "react";
import { Link } from "react-router-dom";
import { Mail, Loader2, AlertTriangle } from "lucide-react";

/**
 * Componente que muestra una pantalla de verificación pendiente
 * @param {Object} props - Propiedades del componente
 * @param {string} props.email - Correo electrónico al que se envió la verificación
 * @param {Function} props.onResendClick - Función para reenviar la verificación
 * @param {boolean} props.loading - Estado de carga
 * @param {string} props.error - Mensaje de error (si hay)
 * @param {Function} props.onCorrectEmail - Función para corregir el correo
 * @returns {JSX.Element} Componente JSX
 */
const VerificationPending = ({
  email,
  onResendClick,
  loading,
  error,
  onCorrectEmail,
}) => {
  return (
    <div className="contenedor-verificacion-vp bg-white p-8 rounded-lg shadow-md max-w-md mx-auto mt-10">
      {" "}
      <div className="icono-verificacion-vp text-center mb-6">
        <Mail className="text-5xl text-blue-600 mx-auto" size={48} />
      </div>
      <h2 className="titulo-verificacion-vp text-2xl font-bold text-center text-gray-800 mb-4">
        Verifica tu correo electrónico
      </h2>
      <div className="mensaje-verificacion-vp text-center mb-6">
        <p className="text-gray-600 mb-2">
          Hemos enviado un enlace de verificación a:
        </p>
        <p className="email-verificacion-vp font-medium text-blue-600 bg-blue-50 py-2 px-4 rounded-md inline-block">
          {email}
        </p>
        <p className="text-gray-600 mt-4">
          Por favor, revisa tu bandeja de entrada (y carpeta de spam) para
          completar el proceso de registro.
        </p>
      </div>
      {error && (
        <div className="error-verificacion-vp bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="acciones-verificacion-vp">
        <button
          onClick={onResendClick}
          disabled={loading}
          className="boton-reenviar-vp w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-300 flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              Enviando...
            </>
          ) : (
            "Reenviar verificación"
          )}
        </button>

        <button
          onClick={onCorrectEmail}
          className="boton-corregir-correo-vp w-full mt-3 border border-amber-500 text-amber-700 hover:bg-amber-50 py-2 px-4 rounded-md transition duration-300 flex items-center justify-center"
        >
          <AlertTriangle size={16} className="mr-2" />
          ¿Correo incorrecto? Corregir antes de verificar
        </button>

        <div className="enlaces-verificacion-vp mt-4 text-center">
          <Link to="/login" className="text-blue-600 hover:underline">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerificationPending;
