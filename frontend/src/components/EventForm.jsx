import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosConfig";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";
import {
  Calendar,
  Clock,
  FileText,
  Image,
  Users,
  BookOpen,
  DollarSign,
  GraduationCap,
  Star,
  Target,
  Save,
  X,
} from "lucide-react";
import "./styles/EventForm.css";
import "./styles/CarreraCheckboxes.css";

// Registrar el idioma español
registerLocale("es", es);

const EventForm = ({ eventId = null, mode = "create" }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [carreras, setCarreras] = useState([]);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [formData, setFormData] = useState({
    nom_eve: "",
    des_eve: "",
    tip_eve: "",
    fec_ini_eve: "",
    fec_fin_eve: "",
    dur_hor_eve: "",
    val_eve: "",
    not_min_cur: "",
    por_min_asi_eve: "",
    cup_max_eve: "",
    carrerasSeleccionadas: [],
    esEventoGeneral: false,
    img_por_eve: null,
    est_eve: "ACTIVO",
  });

  const tiposEvento = [
    { value: "CURSO", label: "Curso", icon: GraduationCap },
    { value: "CONGRESO", label: "Congreso", icon: Users },
    { value: "WEBINAR", label: "Webinar", icon: BookOpen },
    { value: "CHARLA", label: "Charla", icon: FileText },
    { value: "SOCIALIZACION", label: "Socialización", icon: Users },
    { value: "PUBLICO", label: "Evento Público", icon: Target },
  ];

  useEffect(() => {
    cargarCarreras();
    if (mode === "edit" && eventId) {
      cargarEventoParaEditar();
    }
  }, [eventId, mode]);

  const cargarCarreras = async () => {
    try {
      const res = await axiosInstance.get("/carreras");
      setCarreras(res.data);
    } catch (error) {
      toast.error("Error al cargar carreras");
    }
  };
  const cargarEventoParaEditar = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/eventos/${eventId}`);
      const evento = res.data;

      // Verificar si el evento tiene carreras asociadas o es general
      const tieneCarreras =
        evento.eventos_carrera && evento.eventos_carrera.length > 0;
      const carrerasIds = tieneCarreras
        ? evento.eventos_carrera.map((ec) => ec.carrera.id_car)
        : [];
      const esGeneral = !tieneCarreras;

      setFormData({
        nom_eve: evento.nom_eve || "",
        des_eve: evento.des_eve || "",
        tip_eve: evento.tip_eve || "",
        fec_ini_eve: evento.fec_ini_eve ? evento.fec_ini_eve.split("T")[0] : "",
        fec_fin_eve: evento.fec_fin_eve ? evento.fec_fin_eve.split("T")[0] : "",
        dur_hor_eve: evento.dur_hor_eve ? Number(evento.dur_hor_eve) : "",
        val_eve: Number(evento.val_eve),
        por_min_asi_eve: Number(evento.por_min_asi_eve),
        cup_max_eve: evento.cup_max_eve ? Number(evento.cup_max_eve) : "",
        img_por_eve: null,
        est_eve: evento.est_eve || "ACTIVO",
        not_min_cur:
          evento.tip_eve === "CURSO" && evento.eventos_curso
            ? Number(evento.eventos_curso.not_min_cur) || ""
            : "",
        carrerasSeleccionadas: carrerasIds,
        esEventoGeneral: esGeneral,
      });

      // Mostrar imagen existente si la hay
      if (evento.img_por_eve) {
        setImagenPreview(evento.img_por_eve);
      }
    } catch (error) {
      toast.error("Error al cargar el evento");
      navigate("/admin/eventos");
    } finally {
      setLoading(false);
    }
  }; // Prevenir cambios en los campos de número cuando se hace scroll
  const preventScrollChange = (e) => {
    // Detener el evento por completo
    e.preventDefault();
    e.stopPropagation();
    // Quitar el foco para evitar que el navegador cambie el valor
    e.target.blur();
    return false;
  }; // Función mejorada para manejar cambios en inputs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Para el checkbox de evento general
    if (name === "esEventoGeneral") {
      setFormData((prev) => ({
        ...prev,
        esEventoGeneral: checked,
        // Si se marca como evento general, limpiar las carreras seleccionadas
        carrerasSeleccionadas: checked ? [] : prev.carrerasSeleccionadas,
      }));
      return;
    }

    // Para los checkboxes de carreras específicas
    if (name.startsWith("carrera-")) {
      const carreraId = name.replace("carrera-", "");

      setFormData((prev) => {
        let nuevasCarreras = [...prev.carrerasSeleccionadas];

        if (checked) {
          // Agregar carrera si no está ya en el array
          if (!nuevasCarreras.includes(carreraId)) {
            nuevasCarreras.push(carreraId);
          }
        } else {
          // Quitar carrera si está seleccionada
          nuevasCarreras = nuevasCarreras.filter((id) => id !== carreraId);
        }

        return {
          ...prev,
          carrerasSeleccionadas: nuevasCarreras,
        };
      });
      return;
    } // Para inputs numéricos, asegurarse de que se conviertan correctamente
    if (type === "number") {
      let numericValue = value === "" ? "" : Number(value);

      // Validaciones específicas para campos que no pueden ser negativos
      const camposPositivos = ["cup_max_eve", "dur_hor_eve"];
      if (camposPositivos.includes(name) && numericValue < 0) {
        // Mostrar mensaje específico para valores negativos
        if (name === "cup_max_eve") {
          toast.error("❌ El cupo máximo no puede ser negativo");
        }
        return;
      }

      // Validación específica para cup_max_eve
      if (name === "cup_max_eve") {
        if (numericValue !== "" && numericValue < 1) {
          toast.error("❌ El cupo máximo debe ser al menos 1 persona");
          return;
        }
        if (numericValue > 10000) {
          toast.error("❌ El cupo máximo no puede ser mayor a 10,000 personas");
          return;
        }
        if (numericValue !== "" && !Number.isInteger(numericValue)) {
          toast.error("❌ El cupo máximo debe ser un número entero");
          return;
        }
      }

      // Validación para val_eve (puede ser 0 pero no negativo)
      if (name === "val_eve" && numericValue < 0) {
        toast.error("❌ El valor del evento no puede ser negativo");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      // Para otros tipos de campos, mantener el comportamiento original
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo y tamaño
      const tiposPermitidos = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!tiposPermitidos.includes(file.type)) {
        toast.error("Solo se permiten imágenes JPG, PNG o WEBP");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen no debe superar los 5MB");
        return;
      }

      setFormData((prev) => ({ ...prev, img_por_eve: file }));

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => setImagenPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const validarFormulario = () => {
    const errores = [];

    // Validaciones generales
    if (!formData.nom_eve.trim())
      errores.push("El nombre del evento es obligatorio");
    if (!formData.tip_eve) errores.push("El tipo de evento es obligatorio");
    if (!formData.fec_ini_eve)
      errores.push("La fecha de inicio es obligatoria");
    if (
      formData.val_eve === "" ||
      formData.val_eve === null ||
      formData.val_eve === undefined
    ) {
      errores.push("El valor del evento es obligatorio");
    } else if (formData.val_eve < 0) {
      errores.push("El valor del evento debe ser 0 o un número positivo");
    }
    if (!formData.fec_fin_eve) errores.push("La fecha de fin es obligatoria");
    if (!formData.dur_hor_eve || formData.dur_hor_eve <= 0)
      errores.push("La duración debe ser mayor a 0 horas");

    // Validaciones específicas para cupo máximo (campo obligatorio)
    if (
      formData.cup_max_eve === "" ||
      formData.cup_max_eve === null ||
      formData.cup_max_eve === undefined
    ) {
      errores.push(
        "❌ El cupo máximo es obligatorio. Por favor ingrese un valor."
      );
    } else if (isNaN(formData.cup_max_eve)) {
      errores.push("❌ El cupo máximo debe ser un número válido.");
    } else if (formData.cup_max_eve <= 0) {
      errores.push(
        "❌ El cupo máximo debe ser mayor a 0. Valor mínimo permitido: 1"
      );
    } else if (!Number.isInteger(Number(formData.cup_max_eve))) {
      errores.push(
        "❌ El cupo máximo debe ser un número entero (sin decimales)."
      );
    } else if (formData.cup_max_eve > 10000) {
      errores.push("❌ El cupo máximo no puede ser mayor a 10,000 personas.");
    }
    // Validar fechas
    if (formData.fec_ini_eve && formData.fec_fin_eve) {
      if (new Date(formData.fec_ini_eve) > new Date(formData.fec_fin_eve)) {
        errores.push(
          "La fecha de inicio no puede ser posterior a la fecha de fin"
        );
      }
    }

    // Validaciones específicas para cursos
    if (formData.tip_eve === "CURSO") {
      if (
        !formData.not_min_cur ||
        formData.not_min_cur < 8 ||
        formData.not_min_cur > 10
      )
        errores.push("Para cursos, la nota mínima debe estar entre 8 y 10");
    }

    return errores;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errores = validarFormulario();
    if (errores.length > 0) {
      errores.forEach((error) => toast.error(error));
      return;
    }

    setLoading(true);
    try {
      // Preparar FormData para envío (para manejar la imagen)
      const formDataToSend = new FormData();

      // Agregar campos básicos
      formDataToSend.append("nom_eve", formData.nom_eve);
      formDataToSend.append("des_eve", formData.des_eve);
      formDataToSend.append("tip_eve", formData.tip_eve);
      formDataToSend.append("fec_ini_eve", formData.fec_ini_eve);
      formDataToSend.append("val_eve", formData.val_eve);
      formDataToSend.append("img_por_eve", formData.img_por_eve);
      formDataToSend.append("est_eve", formData.est_eve);
      formDataToSend.append("fec_fin_eve", formData.fec_fin_eve);
      formDataToSend.append("dur_hor_eve", formData.dur_hor_eve);
      formDataToSend.append("por_min_asi_eve", formData.por_min_asi_eve);
      formDataToSend.append("cup_max_eve", formData.cup_max_eve);

      // Campos específicos para cursos
      if (formData.tip_eve === "CURSO") {
        formDataToSend.append("not_min_cur", formData.not_min_cur);
      }

      // Agregar información de carreras
      formDataToSend.append("esEventoGeneral", formData.esEventoGeneral);

      // Si no es evento general, enviar las carreras seleccionadas
      if (
        !formData.esEventoGeneral &&
        formData.carrerasSeleccionadas.length > 0
      ) {
        // Convertir el array de IDs a JSON para enviarlo como string
        formDataToSend.append(
          "carrerasIds",
          JSON.stringify(formData.carrerasSeleccionadas)
        );
      }
      let response;
      if (mode === "create") {
        response = await axiosInstance.post("/eventos", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(
          // `✅ Evento creado exitosamente con cupo máximo de ${formData.cup_max_eve} personas`
          `Evento creado exitosamente`
        );
      } else {
        response = await axiosInstance.put(
          `/eventos/${eventId}`,
          formDataToSend,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        toast.success(
          // `✅ Evento actualizado exitosamente. Cupo máximo: ${formData.cup_max_eve} personas`
          `Evento actualizado exitosamente`
        );
      }
      navigate("/admin/eventos");
    } catch (error) {
      console.error("Error al guardar evento:", error);

      // Proporcionar mensajes de error más específicos
      let errorMessage = "Error al guardar el evento";

      if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      } else if (error.response?.status === 400) {
        errorMessage =
          "❌ Datos inválidos. Verifique el cupo máximo y otros campos obligatorios.";
      } else if (error.response?.status === 500) {
        errorMessage =
          "❌ Error del servidor. Intente nuevamente en unos momentos.";
      } else if (error.code === "NETWORK_ERROR") {
        errorMessage =
          "❌ Error de conexión. Verifique su conexión a internet.";
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const esCurso = formData.tip_eve === "CURSO";

  if (loading && mode === "edit") {
    return (
      <div className="event-form-container">
        <div className="event-form-loading">
          <div className="spinner"></div>
          <p>Cargando evento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="event-form-container">
      <div className="event-form-header">
        <h1 className={`event-form-title ${esCurso ? "curso" : "evento"}`}>
          {mode === "create" ? "Crear Nuevo" : "Editar"}{" "}
          {esCurso ? "Curso" : "Evento"}
        </h1>
        <button
          type="button"
          onClick={() => navigate("/admin/eventos")}
          className="event-form-close"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="event-form">
        {/* Información Básica */}
        <div className="event-form-section">
          <h2 className="section-title">
            <FileText size={20} />
            Información Básica
          </h2>

          <div className="form-grid">
            <div className="form-group">
              <label>Nombre del {esCurso ? "Curso" : "Evento"} *</label>
              <input
                type="text"
                name="nom_eve"
                value={formData.nom_eve}
                onChange={handleInputChange}
                placeholder={`Ingrese el nombre del ${
                  esCurso ? "curso" : "evento"
                }`}
                required
              />
            </div>

            <div className="form-group">
              <label>Tipo *</label>
              <select
                name="tip_eve"
                value={formData.tip_eve}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccione un tipo</option>
                {tiposEvento.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            {mode === "edit" && (
              <div className="form-group">
                <label>Estado del Evento *</label>
                <select
                  name="est_eve"
                  value={formData.est_eve}
                  onChange={handleInputChange}
                  required
                >
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                  <option value="FINALIZADO">Finalizado</option>
                  <option value="CANCELADO">Cancelado</option>
                  <option value="SUSPENDIDO">Suspendido</option>
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="des_eve"
              value={formData.des_eve}
              onChange={handleInputChange}
              placeholder={`Describe el contenido y objetivos del ${
                esCurso ? "curso" : "evento"
              }`}
              rows={4}
            />
          </div>
        </div>
        {/* Fecha */}
        <div className="event-form-section">
          <h2 className="section-title">
            <Calendar size={20} />
            Fechas y Duración
          </h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Fecha de Inicio *</label>
              <div className="input-with-icon date-picker-container">
                <Calendar size={18} />{" "}
                <DatePicker
                  selected={
                    formData.fec_ini_eve
                      ? new Date(formData.fec_ini_eve + "T12:00:00Z")
                      : null
                  }
                  onChange={(date) => {
                    // Usar UTC para evitar problemas de zona horaria
                    const year = date.getUTCFullYear();
                    const month = String(date.getUTCMonth() + 1).padStart(
                      2,
                      "0"
                    );
                    const day = String(date.getUTCDate()).padStart(2, "0");
                    const formattedDate = `${year}-${month}-${day}`;
                    setFormData((prev) => ({
                      ...prev,
                      fec_ini_eve: formattedDate,
                    }));
                  }}
                  dateFormat="dd/MM/yyyy"
                  locale="es"
                  placeholderText="Seleccionar fecha"
                  className="date-picker-input"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Fecha de Fin *</label>
              <div className="input-with-icon date-picker-container">
                <Calendar size={18} />{" "}
                <DatePicker
                  selected={
                    formData.fec_fin_eve
                      ? new Date(formData.fec_fin_eve + "T12:00:00Z")
                      : null
                  }
                  onChange={(date) => {
                    // Usar UTC para evitar problemas de zona horaria
                    const year = date.getUTCFullYear();
                    const month = String(date.getUTCMonth() + 1).padStart(
                      2,
                      "0"
                    );
                    const day = String(date.getUTCDate()).padStart(2, "0");
                    const formattedDate = `${year}-${month}-${day}`;
                    setFormData((prev) => ({
                      ...prev,
                      fec_fin_eve: formattedDate,
                    }));
                  }}
                  dateFormat="dd/MM/yyyy"
                  locale="es"
                  placeholderText="Seleccionar fecha"
                  className="date-picker-input"
                  minDate={
                    formData.fec_ini_eve
                      ? new Date(formData.fec_ini_eve + "T12:00:00Z")
                      : null
                  }
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Duración (horas) *</label>
              <div className="input-with-icon">
                <Clock size={18} />{" "}
                <input
                  type="number"
                  name="dur_hor_eve"
                  value={formData.dur_hor_eve}
                  onChange={handleInputChange}
                  onWheel={preventScrollChange}
                  onMouseEnter={(e) => e.target.blur()}
                  onFocus={(e) =>
                    e.target.addEventListener("wheel", preventScrollChange, {
                      passive: false,
                    })
                  }
                  onBlur={(e) =>
                    e.target.removeEventListener("wheel", preventScrollChange)
                  }
                  min="1"
                  step="1"
                  placeholder="Ej: 2, 4, 8"
                  required
                />
              </div>
            </div>{" "}
            <div className="form-group">
              <label>Porcentaje Mínimo de Asistencia % *</label>
              <div className="input-with-icon">
                <Star size={18} />{" "}
                <input
                  type="number"
                  name="por_min_asi_eve"
                  value={formData.por_min_asi_eve}
                  onChange={handleInputChange}
                  onWheel={preventScrollChange}
                  onMouseEnter={(e) => e.target.blur()}
                  onFocus={(e) =>
                    e.target.addEventListener("wheel", preventScrollChange, {
                      passive: false,
                    })
                  }
                  onBlur={(e) =>
                    e.target.removeEventListener("wheel", preventScrollChange)
                  }
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="80"
                  required
                />
              </div>
            </div>{" "}
            <div className="form-group">
              <label>Cupo Máximo *</label>
              <div className="input-with-icon">
                <Users size={18} />{" "}
                <input
                  type="number"
                  name="cup_max_eve"
                  value={formData.cup_max_eve}
                  onChange={handleInputChange}
                  onWheel={preventScrollChange}
                  onMouseEnter={(e) => e.target.blur()}
                  onFocus={(e) =>
                    e.target.addEventListener("wheel", preventScrollChange, {
                      passive: false,
                    })
                  }
                  onBlur={(e) =>
                    e.target.removeEventListener("wheel", preventScrollChange)
                  }
                  min="1"
                  step="1"
                  placeholder="Ej: 50, 100, 200"
                  required
                />
              </div>
            </div>
            {esCurso && (
              <div className="form-group">
                <label>Nota Mínima para Aprobar *</label>
                <div className="input-with-icon">
                  <Star size={18} />{" "}
                  <input
                    type="number"
                    name="not_min_cur"
                    value={formData.not_min_cur}
                    onChange={handleInputChange}
                    onWheel={preventScrollChange}
                    onMouseEnter={(e) => e.target.blur()}
                    onFocus={(e) =>
                      e.target.addEventListener("wheel", preventScrollChange, {
                        passive: false,
                      })
                    }
                    onBlur={(e) =>
                      e.target.removeEventListener("wheel", preventScrollChange)
                    }
                    min="0"
                    max="10"
                    step="0.1"
                    placeholder="Ej: 8.0"
                    required={esCurso}
                  />
                </div>
              </div>
            )}
          </div>
        </div>{" "}
        {/* Configuración Específica de Curso */}
        {/*esCurso && (
          <div className="event-form-section curso-section">
            <h2 className="section-title">
              <GraduationCap size={20} />
              Configuración de Curso
            </h2>
            <div className="form-grid">

            </div>
          </div>
        )*/}{" "}
        {/* Información Adicional */}{" "}
        <div className="event-form-section">
          <h2 className="section-title">
            <Users size={20} />
            Información Adicional
          </h2>
          <div className="form-group">
            <label>Carreras Asociadas</label>
            <div className="carreras-checkbox-container">
              <div className="carrera-checkbox-item general">
                <input
                  type="checkbox"
                  name="esEventoGeneral"
                  id="evento-general"
                  checked={formData.esEventoGeneral}
                  onChange={handleInputChange}
                />
                <label htmlFor="evento-general">
                  Todas las carreras / Evento general
                </label>
              </div>

              <div className="carreras-checkbox-grid">
                {carreras.map((carrera) => (
                  <div key={carrera.id_car} className="carrera-checkbox-item">
                    <input
                      type="checkbox"
                      name={`carrera-${carrera.id_car}`}
                      id={`carrera-${carrera.id_car}`}
                      checked={formData.carrerasSeleccionadas.includes(
                        carrera.id_car
                      )}
                      onChange={handleInputChange}
                      disabled={formData.esEventoGeneral}
                    />
                    <label htmlFor={`carrera-${carrera.id_car}`}>
                      {carrera.nom_car}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="valor-eve-ef">Valor del Evento ($) *</label>{" "}
            <input
              type="number"
              name="val_eve"
              value={formData.val_eve}
              onChange={handleInputChange}
              onWheel={preventScrollChange}
              onMouseEnter={(e) => e.target.blur()}
              onFocus={(e) =>
                e.target.addEventListener("wheel", preventScrollChange, {
                  passive: false,
                })
              }
              onBlur={(e) =>
                e.target.removeEventListener("wheel", preventScrollChange)
              }
              min="0"
              step="0.01"
              placeholder="Ej: 10.00"
              required
            />
          </div>{" "}
        </div>
        {/* Imagen de Portada */}
        <div className="event-form-section">
          <h2 className="section-title">
            <Image size={20} />
            Imagen de Portada
          </h2>

          <div className="image-upload-container">
            <div className="image-upload-area">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                id="imagen-upload"
                className="image-input"
              />
              <label htmlFor="imagen-upload" className="image-upload-label">
                {imagenPreview ? (
                  <div className="image-preview">
                    <img src={imagenPreview} alt="Preview" />
                    <div className="image-overlay">
                      <Image size={24} />
                      Cambiar imagen
                    </div>
                  </div>
                ) : (
                  <div className="image-placeholder">
                    <Image size={48} />
                    <span>Seleccionar imagen de portada</span>
                    <small>JPG, PNG o WEBP - Máximo 5MB</small>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>
        {/* Botones de Acción */}
        <div className="event-form-actions">
          <button
            type="button"
            onClick={() => navigate("/admin/eventos")}
            className="btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={`btn-primary ${esCurso ? "curso" : "evento"}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                {mode === "create" ? "Creando..." : "Actualizando..."}
              </>
            ) : (
              <>
                <Save size={18} />
                {mode === "create" ? "Crear" : "Actualizar"}{" "}
                {esCurso ? "Curso" : "Evento"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
