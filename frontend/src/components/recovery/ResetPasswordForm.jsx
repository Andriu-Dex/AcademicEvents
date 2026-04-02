import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import PasswordRecoveryService from "../../services/PasswordRecoveryService";
import HomeButton from "../common/HomeButton";
import Validator from "../../utils/Validator";
import styles from "./styles/ResetPasswordForm.module.css";

/**
 * Componente para resetear la contraseña
 */
const ResetPasswordForm = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [tokenInfo, setTokenInfo] = useState({
    isValid: false,
    userName: "",
    email: "",
    message: "",
    loading: true,
    error: null,
    errorReason: null,
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    success: false,
    message: "",
  });

  // Validar token al cargar
  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await PasswordRecoveryService.validateToken(token);

        setTokenInfo({
          isValid: response.success,
          userName: response.userName || "Usuario",
          email: response.email || "",
          message: response.message,
          loading: false,
          error: null,
          errorReason: null,
        });
      } catch (error) {
        // Extraer el motivo del error si está disponible
        let errorReason = null;
        try {
          if (error.response && error.response.data) {
            errorReason = error.response.data.reason;
          }
        } catch (e) {
          console.error("Error al extraer la razón del error:", e);
        }

        setTokenInfo({
          isValid: false,
          userName: "",
          email: "",
          message: "",
          loading: false,
          error: error.message,
          errorReason: errorReason,
        });
      }
    };

    validateToken();
  }, [token]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar errores al escribir
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    const errors = {};
    const passwordValidation = Validator.validarPasswordSegura(
      formData.newPassword
    );

    if (!passwordValidation.esValida) {
      errors.newPassword = passwordValidation.errores;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = ["Las contraseñas no coinciden"];
    }

    // Si hay errores, mostrarlos y detener
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Enviar solicitud de cambio
    setSubmitStatus({
      loading: true,
      success: false,
      message: "",
    });
    try {
      const response = await PasswordRecoveryService.resetPassword(
        token,
        formData.newPassword,
        formData.confirmPassword
      );

      setSubmitStatus({
        loading: false,
        success: true,
        message: response.message || "Contraseña restablecida con éxito",
      });

      toast.success(response.message || "Contraseña restablecida con éxito");

      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate("/login", { state: { resetSuccess: true } });
      }, 3000);
    } catch (error) {
      // Comprobar si el error es porque el token ya fue utilizado
      const isTokenUsed =
        error.message.includes("ya ha sido utilizado") ||
        (error.response &&
          error.response.data &&
          (error.response.data.reason === "USO_NORMAL" ||
            error.response.data.message.includes("ya ha sido utilizado")));

      setSubmitStatus({
        loading: false,
        success: false,
        message: error.message,
        tokenUsed: isTokenUsed,
      });

      if (isTokenUsed) {
        // Actualizar el estado del token para mostrar la interfaz de error
        setTokenInfo((prev) => ({
          ...prev,
          isValid: false,
          error: error.message,
          errorReason: "USO_NORMAL",
        }));
      } else {
        toast.error(error.message);
      }
    }
  };

  // Si el token es inválido
  if (!tokenInfo.loading && !tokenInfo.isValid) {
    const isTokenUsed =
      (tokenInfo.error && tokenInfo.error.includes("ya ha sido utilizado")) ||
      tokenInfo.errorReason === "USO_NORMAL" ||
      (submitStatus.message &&
        submitStatus.message.includes("ya ha sido utilizado"));
    return (
      <>
        <HomeButton
          customConfig={{ className: "home-button-rpf" }}
          redirectTo="/"
        />
        <div className={styles["pw-reset-error"]}>
          <div className={styles["pw-reset-error-icon-container"]}>
            <AlertCircle className={styles["pw-reset-error-icon"]} />
          </div>

          <h2 className={styles["pw-reset-error-title"]}>
            {isTokenUsed ? "Enlace ya utilizado" : "Enlace inválido o expirado"}
          </h2>

          <p className={styles["pw-reset-error-text"]}>
            {isTokenUsed
              ? "Este enlace de recuperación ya ha sido utilizado para restablecer la contraseña. Por motivos de seguridad, cada enlace de recuperación solo puede utilizarse una vez."
              : tokenInfo.error ||
                "El enlace para restablecer la contraseña es inválido o ha expirado."}
          </p>

          <button
            onClick={() => navigate("/forgot-password")}
            className={styles["pw-reset-error-button"]}
          >
            Solicitar nuevo enlace
          </button>
        </div>
      </>
    );
  }
  // Si está cargando
  if (tokenInfo.loading) {
    return (
      <>
        <HomeButton
          customConfig={{ className: "home-button-rpf" }}
          redirectTo="/"
        />
        <div className={styles["pw-reset-loading"]}>
          <div className={styles["pw-reset-loading-spinner"]}></div>
          <p className={styles["pw-reset-loading-text"]}>
            Verificando enlace...
          </p>
        </div>
      </>
    );
  }
  // Si ya se ha restablecido exitosamente
  if (submitStatus.success) {
    return (
      <>
        <HomeButton
          customConfig={{ className: "home-button-rpf" }}
          redirectTo="/"
        />
        <div className={styles["pw-reset-success"]}>
          <div className={styles["pw-reset-success-icon-container"]}>
            <CheckCircle className={styles["pw-reset-success-icon"]} />
          </div>

          <h2 className={styles["pw-reset-success-title"]}>
            Contraseña Restablecida
          </h2>

          <p className={styles["pw-reset-success-text"]}>
            {submitStatus.message}
          </p>

          <p className={styles["pw-reset-redirect-text"]}>
            Redirigiendo al inicio de sesión...
          </p>
        </div>
      </>
    );
  }
  // Formulario de restablecimiento
  return (
    <>
      <HomeButton
        customConfig={{ className: "home-button-rpf" }}
        redirectTo="/"
      />
      <div className={styles["pw-reset-container"]}>
        <div className={styles["pw-reset-header"]}>
          <h2 className={styles["pw-reset-title"]}>Restablecer Contraseña</h2>
          <p className={styles["pw-reset-subtitle"]}>
            Hola {tokenInfo.userName}, crea una nueva contraseña segura para tu
            cuenta.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles["pw-reset-form"]}>
          {/* Nueva contraseña */}
          <div className={styles["pw-reset-form-group"]}>
            <label htmlFor="newPassword" className={styles["pw-reset-label"]}>
              Nueva Contraseña
            </label>
            <div className={styles["pw-reset-input-container"]}>
              <input
                type={passwordVisible ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={`${styles["pw-reset-input"]} ${
                  formErrors.newPassword ? styles["pw-reset-input-error"] : ""
                }`}
                placeholder="Ingrese nueva contraseña"
              />
              <Lock className={styles["pw-reset-icon-left"]} />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className={styles["pw-reset-icon-right"]}
              >
                {passwordVisible ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {formErrors.newPassword && (
              <ul className={styles["pw-reset-error-list"]}>
                {formErrors.newPassword.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
          </div>
          {/* Confirmar contraseña */}
          <div className={styles["pw-reset-form-group"]}>
            <label
              htmlFor="confirmPassword"
              className={styles["pw-reset-label"]}
            >
              Confirmar Contraseña
            </label>
            <div className={styles["pw-reset-input-container"]}>
              <input
                type={confirmVisible ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`${styles["pw-reset-input"]} ${
                  formErrors.confirmPassword
                    ? styles["pw-reset-input-error"]
                    : ""
                }`}
                placeholder="Confirme nueva contraseña"
              />
              <Lock className={styles["pw-reset-icon-left"]} />
              <button
                type="button"
                onClick={() => setConfirmVisible(!confirmVisible)}
                className={styles["pw-reset-icon-right"]}
              >
                {confirmVisible ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {formErrors.confirmPassword && (
              <ul className={styles["pw-reset-error-list"]}>
                {formErrors.confirmPassword.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
          </div>
          {/* Reglas de contraseña */}
          <div className={styles["pw-reset-password-rules"]}>
            <p className={styles["pw-reset-rules-title"]}>
              La contraseña debe:
            </p>
            <ul className={styles["pw-reset-rules-list"]}>
              <li className={styles["pw-reset-rules-item"]}>
                Tener al menos 8 caracteres
              </li>
              <li className={styles["pw-reset-rules-item"]}>
                Incluir al menos una letra mayúscula
              </li>
              <li className={styles["pw-reset-rules-item"]}>
                Incluir al menos una letra minúscula
              </li>
              <li className={styles["pw-reset-rules-item"]}>
                Incluir al menos un número
              </li>
              <li className={styles["pw-reset-rules-item"]}>
                Incluir al menos un carácter especial
              </li>
              <li className={styles["pw-reset-rules-item"]}>
                No contener espacios en blanco
              </li>
            </ul>
          </div>
          {/* Mensaje de estado */}
          {submitStatus.message && !submitStatus.success && (
            <div className={styles["pw-reset-error-message"]}>
              {submitStatus.message}
            </div>
          )}{" "}
          {/* Botón de envío */}
          <button
            type="submit"
            disabled={submitStatus.loading}
            className={styles["pw-reset-button"]}
          >
            {submitStatus.loading ? "Procesando..." : "Restablecer Contraseña"}
          </button>
        </form>
      </div>
    </>
  );
};

export default ResetPasswordForm;
