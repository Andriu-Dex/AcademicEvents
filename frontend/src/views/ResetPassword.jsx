import React from "react";
import ResetPasswordForm from "../components/recovery/ResetPasswordForm";
import Footer from "../components/Footer";
import "./styles/ResetPassword.css";

/**
 * Página para restablecer contraseña
 */
const ResetPassword = () => {
  document.title = "Restablecer Contraseña | AcademicEvents UTA";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header con logo */}
      <header className="contenedor-superior-rp">
        <div className="contenedor-logo-rp">
          <a href="/" className="flex items-center">
            <img
              src="/Logo.png"
              alt="Logo UTA Academic Events"
              className="img-logo-rp"
            />
          </a>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-grow container mx-auto px-4 py-10">
        <div className="max-w-xl mx-auto">
          <ResetPasswordForm />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResetPassword;
