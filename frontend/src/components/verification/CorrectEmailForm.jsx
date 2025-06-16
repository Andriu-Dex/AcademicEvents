import React, { useState, useEffect } from "react";
import { Mail, ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

/**
 * Componente para corregir el correo electrónico antes de verificar
 * @param {Object} props - Propiedades del componente
 * @param {string} props.currentEmail - Correo actual ingresado (incorrecto)
 * @param {boolean} props.isUTA - Si es correo UTA
 * @param {string} props.currentCarrera - ID de la carrera seleccionada inicialmente
 * @param {Function} props.onSuccess - Función a ejecutar cuando se corrige con éxito
 * @param {Function} props.onCancel - Función para cancelar y volver
 * @param {Array} props.carreras - Lista de carreras disponibles
 * @returns {JSX.Element} Componente JSX
 */
const CorrectEmailForm = ({
  currentEmail,
  isUTA,
  currentCarrera,
  onSuccess,
  onCancel,
  carreras = [],
}) => {
  // Estados del formulario
  const [email, setEmail] = useState("");
  const [carreraId, setCarreraId] = useState(currentCarrera || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Detectar si el nuevo correo es UTA
  const [newIsUTA, setNewIsUTA] = useState(false);

  // Cambio de tipo detectado
  const [typeChanged, setTypeChanged] = useState(false);

  // Efecto para inicializar el formulario
  useEffect(() => {
    if (currentEmail) {
      setEmail(currentEmail);
    }
  }, [currentEmail]);

  // Efecto para detectar cambio de tipo
  useEffect(() => {
    if (email) {
      const esUTA = email.endsWith("@uta.edu.ec");
      setNewIsUTA(esUTA);

      // Detectar cambio de tipo
      if (esUTA !== isUTA) {
        setTypeChanged(true);

        // Si cambia de general a UTA, carrera es obligatoria
        if (esUTA && !carreraId) {
          setError("Al usar correo UTA, debes seleccionar una carrera");
        }
        // Si cambia de UTA a general, quitar carrera
        else if (!esUTA && carreraId) {
          setCarreraId("");
          setError("");
        }
      } else {
        setTypeChanged(false);
        setError("");
      }
    }
  }, [email, isUTA]);

  // Validar email
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!email.trim()) {
      setError("El correo electrónico es obligatorio");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Ingresa un correo electrónico válido");
      return;
    }

    // Si es UTA, carrera es obligatoria
    if (newIsUTA && !carreraId) {
      setError("Al usar correo UTA, debes seleccionar una carrera");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Llamada a la API para corregir el correo
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/cuenta/corregir-correo`,
        {
          correoAnterior: currentEmail,
          correoNuevo: email,
          carreraNueva: newIsUTA ? carreraId : null,
        }
      );

      if (response.data.success) {
        toast.success(
          "Correo actualizado correctamente. Se ha enviado un nuevo email de verificación."
        );

        // Llamar a la función de éxito y pasar el nuevo correo
        if (onSuccess) {
          onSuccess(email);
        }
      } else {
        setError(response.data.message || "Error al actualizar el correo");
      }
    } catch (error) {
      console.error("Error:", error);

      if (error.response?.data?.message) {
        setError(error.response.data.message);
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
    <div className="contenedor-correccion-ce bg-white p-8 rounded-lg shadow-md max-w-md mx-auto mt-10">
      <div className="encabezado-correccion-ce flex justify-between items-center mb-6">
        <button
          onClick={onCancel}
          className="boton-volver-ce flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={16} className="mr-1" />
          Volver
        </button>
      </div>

      <h2 className="titulo-correccion-ce text-2xl font-bold text-center text-gray-800 mb-4">
        Corregir correo electrónico
      </h2>

      {typeChanged && (
        <div className="alerta-cambio-ce bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded mb-4">
          <div className="flex items-center mb-2">
            <AlertTriangle size={18} className="mr-2" />
            <span className="font-medium">Cambio de tipo de cuenta</span>
          </div>
          <p className="texto-alerta-ce text-sm">
            {newIsUTA
              ? "Has cambiado a un correo institucional. Ahora debes seleccionar tu carrera."
              : "Has cambiado a un correo no institucional. Tu cuenta será de tipo general."}
          </p>
        </div>
      )}

      {error && (
        <div className="error-correccion-ce bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="formulario-correccion-ce">
        <div className="mb-4">
          <label
            htmlFor="email"
            className="etiqueta-email-ce block text-gray-700 mb-2"
          >
            Correo electrónico
          </label>
          <div className="campo-email-container-ce relative">
            <Mail
              size={18}
              className="icono-email-ce absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="campo-email-ce w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingresa el correo correcto"
              disabled={loading}
            />
          </div>
          <p className="texto-ayuda-ce text-sm text-gray-500 mt-1">
            Asegúrate de escribir correctamente el correo para recibir la
            verificación.
          </p>
        </div>

        {newIsUTA && (
          <div className="mb-4">
            <label
              htmlFor="carrera"
              className="etiqueta-carrera-ce block text-gray-700 mb-2"
            >
              Carrera
            </label>
            <select
              id="carrera"
              value={carreraId}
              onChange={(e) => setCarreraId(e.target.value)}
              className="campo-carrera-ce w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading || !newIsUTA}
            >
              <option value="">Selecciona tu carrera</option>
              {carreras.map((carrera) => (
                <option key={carrera.id_car} value={carrera.id_car}>
                  {carrera.nom_car}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="boton-corregir-ce w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-300 flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              Actualizando...
            </>
          ) : (
            "Actualizar y enviar verificación"
          )}
        </button>
      </form>
    </div>
  );
};

export default CorrectEmailForm;
