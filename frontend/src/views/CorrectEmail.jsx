import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Home } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import CorrectEmailForm from "../components/verification/CorrectEmailForm";

/**
 * Página para corregir el correo electrónico antes de verificar
 * @returns {JSX.Element} Componente JSX
 */
const CorrectEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener email y carrera del estado de navegación o localStorage
  const [email, setEmail] = useState("");
  const [isUTA, setIsUTA] = useState(false);
  const [carreraId, setCarreraId] = useState("");
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Obtener email y datos relacionados
  useEffect(() => {
    const getEmailData = () => {
      // Intentar obtener del estado de navegación
      if (location.state?.email) {
        const emailValue = location.state.email;
        setEmail(emailValue);
        setIsUTA(emailValue.endsWith("@uta.edu.ec"));
        setCarreraId(location.state.carreraId || "");
        setLoading(false);
        return;
      }

      // Intentar obtener del localStorage
      const savedEmail = localStorage.getItem("verificationPendingEmail");
      if (savedEmail) {
        setEmail(savedEmail);
        setIsUTA(savedEmail.endsWith("@uta.edu.ec"));

        // Intentar obtener la carrera si está guardada
        const savedCarrera = localStorage.getItem("verificationPendingCarrera");
        if (savedCarrera) {
          setCarreraId(savedCarrera);
        }

        setLoading(false);
        return;
      }

      // Si no hay email, redirigir a verificación pendiente
      navigate("/verificacion-pendiente");
    };

    getEmailData();
  }, [location, navigate]);

  // Cargar carreras si es necesario
  useEffect(() => {
    const fetchCarreras = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/carreras`
        );
        setCarreras(response.data);
      } catch (error) {
        console.error("Error al cargar carreras:", error);
        setError(
          "No se pudieron cargar las carreras. Intenta nuevamente más tarde."
        );
      }
    };

    // Solo cargar carreras si el correo es UTA o si se está cargando inicialmente
    if (isUTA || loading) {
      fetchCarreras();
    }
  }, [isUTA, loading]);

  // Manejar el éxito de la corrección
  const handleSuccess = (newEmail) => {
    // Actualizar localStorage con el nuevo correo
    localStorage.setItem("verificationPendingEmail", newEmail);

    // Limpiar la carrera guardada si ya no es UTA
    if (!newEmail.endsWith("@uta.edu.ec")) {
      localStorage.removeItem("verificationPendingCarrera");
    }

    // Redirigir a verificación pendiente con mensaje de éxito
    navigate("/verificacion-pendiente");
  };

  // Manejar cancelación
  const handleCancel = () => {
    navigate("/verificacion-pendiente");
  };

  if (loading) {
    return (
      <div className="contenedor-cargando-correo-cc flex justify-center items-center min-h-screen">
        <div className="spinner-cargando-cc animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  return (
    <div className="contenedor-pagina-cc min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <Home className="h-5 w-5 mr-2" />
            <span>Volver al inicio</span>
          </Link>
        </div>

        <CorrectEmailForm
          currentEmail={email}
          isUTA={isUTA}
          currentCarrera={carreraId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          carreras={carreras}
        />
      </div>
    </div>
  );
};

export default CorrectEmail;
