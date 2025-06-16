import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
// import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import CorrectEmailForm from "../components/verification/CorrectEmailForm";
import HomeButton from "../components/common/HomeButton";
import "../components/verification/styles/CorrectEmailForm.css";

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
      <div
        className="min-h-screen flex justify-center items-center bg-gray-100"
        style={{
          background: "linear-gradient(135deg, #f5f7fa 0%, #e8eaed 100%)",
        }}
      >
        <div className="p-8 rounded-lg shadow-lg bg-white flex flex-col items-center">
          <Loader2 className="animate-spin h-12 w-12 text-[#8a1538] mb-4" />
          <p className="text-gray-600 font-medium">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="contenedor-padre-ce">
      {/* Botón de inicio */}
      <HomeButton
        position={{ top: "20px", right: "20px" }}
        redirectTo="/home"
        useNavigate={true}
      />

      <div className="max-w-md mx-auto">
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
// Andriu Dex
