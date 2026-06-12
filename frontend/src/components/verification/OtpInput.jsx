import React, { useState, useRef, useEffect } from "react";
import "./styles/OtpInput.css";

/**
 * Componente de input OTP de 6 dígitos para verificación de correo
 * @param {Object} props
 * @param {number} props.length - Número de dígitos (default: 6)
 * @param {function} props.onComplete - Callback cuando se completan todos los dígitos
 * @param {boolean} props.disabled - Desactivar inputs
 * @param {boolean} props.error - Mostrar estado de error
 */
const OtpInput = ({ length = 6, onComplete, disabled = false, error = false }) => {
  const [values, setValues] = useState(Array(length).fill(""));
  const inputRefs = useRef([]);

  useEffect(() => {
    // Auto-focus en el primer input al montar
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Resetear cuando error cambie a false (nuevo intento)
  useEffect(() => {
    if (!error && values.every(v => v === "")) {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }
  }, [error]);

  const handleChange = (index, e) => {
    const value = e.target.value;

    // Solo permitir dígitos
    if (value && !/^\d$/.test(value)) return;

    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);

    // Mover al siguiente input si se escribió un dígito
    if (value && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }

    // Verificar si todos los dígitos están completos
    if (newValues.every(v => v !== "")) {
      onComplete?.(newValues.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    // Mover al input anterior con Backspace si el input actual está vacío
    if (e.key === "Backspace" && !values[index] && index > 0) {
      inputRefs.current[index - 1].focus();
      const newValues = [...values];
      newValues[index - 1] = "";
      setValues(newValues);
    }

    // Mover con flechas
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    
    // Solo procesar si es numérico
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, length).split("");
    const newValues = [...values];

    digits.forEach((digit, i) => {
      newValues[i] = digit;
    });

    setValues(newValues);

    // Enfocar el siguiente input vacío o el último
    const nextEmptyIndex = newValues.findIndex(v => v === "");
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex].focus();
    } else {
      inputRefs.current[length - 1].focus();
      onComplete?.(newValues.join(""));
    }
  };

  const handleFocus = (e) => {
    e.target.select();
  };

  /**
   * Resetea todos los valores del OTP y enfoca el primer input
   */
  const reset = () => {
    setValues(Array(length).fill(""));
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  };

  return (
    <div className={`otp-container ${error ? "otp-error" : ""}`}>
      <div className="otp-inputs">
        {values.map((value, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="\d{1}"
            maxLength={1}
            value={value}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            onFocus={handleFocus}
            disabled={disabled}
            className={`otp-digit ${value ? "otp-digit-filled" : ""} ${error ? "otp-digit-error" : ""}`}
            autoComplete="one-time-code"
            aria-label={`Dígito ${index + 1} del código de verificación`}
          />
        ))}
      </div>
    </div>
  );
};

export default OtpInput;
