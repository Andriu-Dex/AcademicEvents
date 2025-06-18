import React from "react";
import RequestRecoveryForm from "../components/recovery/RequestRecoveryForm";
import Footer from "../components/Footer";
import styles from "./styles/ForgotPassword.module.css";

/**
 * Página para solicitar recuperación de contraseña
 */
const ForgotPassword = () => {
  document.title = "Recuperar Contraseña | AcademicEvents UTA";
  return (
    <div className={styles["pw-recovery-page"]}>
      {/* Header con logo */}
      <header className={styles["pw-recovery-header"]}>
        <div className={styles["pw-recovery-logo-container"]}>
          <a href="/" className="flex items-center">
            <img
              src="/Logo.png"
              alt="Logo UTA Academic Events"
              className={styles["pw-recovery-logo"]}
            />
          </a>
        </div>
      </header>

      {/* Contenido principal */}
      <main className={styles["pw-recovery-main"]}>
        <div className={styles["pw-recovery-content"]}>
          <div className={styles["pw-recovery-title-container"]}>
            <h1 className={styles["pw-recovery-heading"]}>
              Recuperación de Contraseña
            </h1>
            <p className={styles["pw-recovery-description"]}>
              Ingrese su correo electrónico para recibir instrucciones de
              recuperación.
            </p>
          </div>

          <RequestRecoveryForm />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPassword;
