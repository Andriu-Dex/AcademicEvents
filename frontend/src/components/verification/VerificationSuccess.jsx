import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

/**
 * Componente que muestra una pantalla de verificación exitosa
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onContinue - Función a ejecutar al continuar
 * @returns {JSX.Element} Componente JSX
 */
const VerificationSuccess = ({ onContinue }) => {
  return (
    <div className="contenedor-exito-vs bg-white p-8 rounded-lg shadow-md max-w-md mx-auto mt-10">
      {" "}
      <div className="icono-exito-vs text-center mb-6">
        <CheckCircle className="text-5xl text-green-500 mx-auto" size={48} />
      </div>
      <h2 className="titulo-exito-vs text-2xl font-bold text-center text-gray-800 mb-4">
        ¡Correo verificado!
      </h2>
      <div className="mensaje-exito-vs text-center mb-6">
        <p className="text-gray-600">
          Tu dirección de correo electrónico ha sido verificada exitosamente.
          Ahora puedes iniciar sesión y disfrutar de todas las funcionalidades
          de AcademicEvents.
        </p>
      </div>
      <div className="acciones-exito-vs">
        <button
          onClick={onContinue}
          className="boton-continuar-vs w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition duration-300"
        >
          Iniciar sesión
        </button>

        <div className="enlaces-exito-vs mt-4 text-center">
          <Link to="/" className="text-blue-600 hover:underline">
            Ir a la página principal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerificationSuccess;
