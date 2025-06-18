import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import PasswordRecoveryService from "../../services/PasswordRecoveryService";
import styles from "./styles/RequestRecoveryForm.module.css";

/**
 * Componente de formulario para solicitar recuperación de contraseña
 */
const RequestRecoveryForm = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Por favor, ingrese su correo electrónico");
      return;
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor, ingrese un correo electrónico válido");
      return;
    }

    setLoading(true);

    try {
      const response = await PasswordRecoveryService.requestPasswordRecovery(
        email
      );
      toast.success(response.message);

      // Redirigir a una página de confirmación
      setTimeout(() => {
        navigate("/recovery-instructions", {
          state: { email },
        });
      }, 2000);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={styles["pw-recovery-form-container"]}>
      <h2 className={styles["pw-recovery-title"]}>
        Recuperación de Contraseña
      </h2>

      <form onSubmit={handleSubmit} className={styles["pw-recovery-form"]}>
        <div className={styles["pw-recovery-form-group"]}>
          <label htmlFor="email" className={styles["pw-recovery-label"]}>
            Correo Electrónico
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles["pw-recovery-input"]}
            placeholder="ejemplo@correo.com"
            required
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className={styles["pw-recovery-button"]}
          >
            {loading ? "Enviando..." : "Enviar Instrucciones"}
          </button>
        </div>

        <div className={styles["pw-recovery-links"]}>
          <Link to="/login" className={styles["pw-recovery-link"]}>
            Volver al Inicio de Sesión
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RequestRecoveryForm;
