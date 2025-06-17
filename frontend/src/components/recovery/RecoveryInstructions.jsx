import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Mail, CheckCircle, AlertTriangle } from "lucide-react";
import styles from "./styles/RecoveryInstructions.module.css";

/**
 * Componente para mostrar instrucciones después de solicitar recuperación
 */
const RecoveryInstructions = () => {
  const location = useLocation();
  const email = location.state?.email || "su correo";
  return (
    <div className={styles["pw-recovery-instructions"]}>
      <div className={styles["pw-recovery-icon-container"]}>
        <div className={styles["pw-recovery-icon-wrapper"]}>
          <Mail className={styles["pw-recovery-icon"]} />
        </div>

        <h2 className={styles["pw-recovery-title"]}>
          Revise su correo electrónico
        </h2>

        <p className={styles["pw-recovery-subtitle"]}>
          Hemos enviado instrucciones para restablecer su contraseña a:
        </p>

        <div className={styles["pw-recovery-email"]}>{email}</div>
      </div>

      <div className={styles["pw-recovery-step-container"]}>
        <div
          className={`${styles["pw-recovery-step"]} ${styles["pw-recovery-steps"]}`}
        >
          <CheckCircle
            className={`${styles["pw-recovery-step-icon"]} ${styles["pw-recovery-step-icon-success"]}`}
          />
          <div className={styles["pw-recovery-step-content"]}>
            <h3>Próximos pasos:</h3>
            <p className={styles["pw-recovery-step-text"]}>
              1. Revise su bandeja de entrada y carpeta de spam
              <br />
              2. Haga clic en el enlace del correo
              <br />
              3. Cree una nueva contraseña segura
            </p>
          </div>
        </div>

        <div
          className={`${styles["pw-recovery-step"]} ${styles["pw-recovery-warning"]}`}
        >
          <AlertTriangle
            className={`${styles["pw-recovery-step-icon"]} ${styles["pw-recovery-step-icon-warning"]}`}
          />
          <div className={styles["pw-recovery-step-content"]}>
            <h3>Importante:</h3>
            <p className={styles["pw-recovery-step-text"]}>
              El enlace enviado será válido durante 2 horas. Si no lo utiliza en
              este tiempo, deberá solicitar uno nuevo.
            </p>
          </div>
        </div>
      </div>

      <div className={styles["pw-recovery-footer"]}>
        <Link to="/login" className={styles["pw-recovery-back-link"]}>
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
};

export default RecoveryInstructions;
