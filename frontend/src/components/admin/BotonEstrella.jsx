import React, { useState } from "react";
import PropTypes from "prop-types";
import { Star } from "lucide-react";
import { toast } from "react-toastify";
import EventoService from "../../services/EventoService";
import "./styles/BotonEstrella.css";

/**
 * @component BotonEstrella
 * @description Botón para marcar/desmarcar eventos como destacados con estrella mejorada
 */
const BotonEstrella = ({
  idEvento,
  estadoInicial,
  onToggle,
  disabled,
  disabledReason,
}) => {
  const [esDestacado, setEsDestacado] = useState(estadoInicial);
  const [cargando, setCargando] = useState(false);
  /**
   * Maneja el clic en la estrella
   */
  const handleClick = async () => {
    if (cargando) return;

    if (disabled) {
      toast.warning(
        disabledReason || "Esta accion no esta disponible para este evento"
      );
      return;
    }

    try {
      setCargando(true);
      const nuevoEstado = !esDestacado;

      // Llamar al servicio para actualizar
      const respuesta = await EventoService.toggleEventoDestacado(
        idEvento,
        nuevoEstado
      );

      if (respuesta && respuesta.ok) {
        setEsDestacado(nuevoEstado); // Notificar al componente padre del cambio
        if (onToggle) {
          onToggle(nuevoEstado);
        }
      }
    } catch (error) {
      const errorMessage =
        error.message || "Error al actualizar evento destacado";
      toast.error(errorMessage);
    } finally {
      setCargando(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={cargando}
      aria-disabled={disabled || cargando}
      className={`boton-estrella-be rounded-full p-2 transition-all duration-200 ${
        esDestacado
          ? "estrella-activa-be text-amber-500 hover:text-amber-600 drop-shadow-sm"
          : "estrella-inactiva-be text-gray-300 hover:text-amber-400 hover:scale-110"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      title={
        disabled && disabledReason
          ? disabledReason
          : esDestacado
          ? "Desmarcar como destacado"
          : "Marcar como destacado"
      }
      aria-label={
        esDestacado ? "Desmarcar como destacado" : "Marcar como destacado"
      }
    >
      <Star
        className={`text-xl transition-all duration-200 ${
          cargando ? "animate-pulse" : ""
        } ${esDestacado ? "drop-shadow-sm" : "hover:scale-110"}`}
        fill={esDestacado ? "currentColor" : "none"}
        strokeWidth={esDestacado ? 1 : 2}
      />
    </button>
  );
};

BotonEstrella.propTypes = {
  idEvento: PropTypes.string.isRequired,
  estadoInicial: PropTypes.bool.isRequired,
  onToggle: PropTypes.func,
  disabled: PropTypes.bool,
  disabledReason: PropTypes.string,
};

BotonEstrella.defaultProps = {
  estadoInicial: false,
  disabled: false,
  disabledReason: "",
};

export default BotonEstrella;
