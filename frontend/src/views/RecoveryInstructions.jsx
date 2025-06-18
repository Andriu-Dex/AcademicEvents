import React from "react";
import RecoveryInstructions from "../components/recovery/RecoveryInstructions";
import Footer from "../components/Footer";
import "./styles/RecoveryInstructions.css"; // Asegúrate de tener este archivo CSS

/**
 * Página con instrucciones después de solicitar recuperación
 */
const RecoveryInstructionsPage = () => {
  document.title = "Instrucciones Enviadas | AcademicEvents UTA";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header con logo */}
      <header className="contenedor-superior-ri">
        <div className="contenedor-logo-ri">
          <a href="/" className="flex items-center">
            <img
              src="/Logo.png"
              alt="Logo UTA Academic Events"
              className="img-logo-ri"
            />
          </a>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-grow container mx-auto px-4 py-10">
        <RecoveryInstructions />
      </main>

      <Footer />
    </div>
  );
};

export default RecoveryInstructionsPage;
