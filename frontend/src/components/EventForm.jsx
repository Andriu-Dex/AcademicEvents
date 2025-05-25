import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosConfig";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
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

const EventForm = ({ eventId = null, mode = "create" }) => {
  const navigate = useNavigate();  const [loading, setLoading] = useState(false);
  const [carreras, setCarreras] = useState([]);
  const [imagenPreview, setImagenPreview] = useState(null);  const [formData, setFormData] = useState({
    nom_eve: "",
    des_eve: "",
    tip_eve: "WEBINAR",
    fec_ini_eve: "",
    fec_fin_eve: "",
    dur_hrs_eve: "",
    pagado_eve: false,
    nota_min_eve: "",
    por_asist_eve: "",
    carreraId: "",
    imagen_portada: null,
  });

  const tiposEvento = [
    { value: "CURSO", label: "Curso", icon: GraduationCap },
    { value: "CONGRESO", label: "Congreso", icon: Users },
    { value: "WEBINAR", label: "Webinar", icon: BookOpen },
    { value: "CHARLA", label: "Charla", icon: FileText },
    { value: "SOCIALIZACION", label: "Socialización", icon: Users },
    { value: "PUBLICO", label: "Evento Público", icon: Target },  ];

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

      // Formatear fechas para inputs datetime-local
      const formatearFecha = (fecha) => {
        if (!fecha) return "";
        const date = new Date(fecha);
        const offset = date.getTimezoneOffset() * 60000;
        const fechaLocal = new Date(date.getTime() - offset);
        return fechaLocal.toISOString().slice(0, 16);
      };      setFormData({
        nom_eve: evento.nom_eve || "",
        des_eve: evento.des_eve || "",
        tip_eve: evento.tip_eve || "WEBINAR",
        fec_ini_eve: formatearFecha(evento.fec_ini_eve),
        fec_fin_eve: formatearFecha(evento.fec_fin_eve),
        dur_hrs_eve: evento.dur_hrs_eve?.toString() || "",
        pagado_eve: evento.pagado_eve || false,
        nota_min_eve: evento.nota_min_eve?.toString() || "",
        por_asist_eve: evento.por_asist_eve?.toString() || "",
        carreraId: evento.carreraId || "",
        imagen_portada: null,
      });

      // Mostrar imagen existente si la hay
      if (evento.imagen_portada) {
        setImagenPreview(`${import.meta.env.VITE_API_URL}/uploads/${evento.imagen_portada}`);
      }
    } catch (error) {
      toast.error("Error al cargar el evento");
      navigate("/admin/eventos");
    } finally {
      setLoading(false);
    }
  };  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo y tamaño
      const tiposPermitidos = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!tiposPermitidos.includes(file.type)) {
        toast.error("Solo se permiten imágenes JPG, PNG o WEBP");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen no debe superar los 5MB");
        return;
      }

      setFormData(prev => ({ ...prev, imagen_portada: file }));
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => setImagenPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const validarFormulario = () => {
    const errores = [];

    if (!formData.nom_eve.trim()) errores.push("El nombre del evento es obligatorio");
    if (!formData.tip_eve) errores.push("El tipo de evento es obligatorio");
    if (!formData.fec_ini_eve) errores.push("La fecha de inicio es obligatoria");
    if (!formData.fec_fin_eve) errores.push("La fecha de fin es obligatoria");
    if (!formData.dur_hrs_eve || formData.dur_hrs_eve <= 0) errores.push("La duración debe ser mayor a 0 horas");

    // Validar fechas
    if (formData.fec_ini_eve && formData.fec_fin_eve) {
      if (new Date(formData.fec_ini_eve) > new Date(formData.fec_fin_eve)) {
        errores.push("La fecha de inicio no puede ser posterior a la fecha de fin");
      }
    }

    // Validaciones específicas para cursos
    if (formData.tip_eve === "CURSO") {
      if (!formData.nota_min_eve || formData.nota_min_eve < 0 || formData.nota_min_eve > 10) {
        errores.push("Para cursos, la nota mínima debe estar entre 0 y 10");
      }
      if (!formData.por_asist_eve || formData.por_asist_eve < 0 || formData.por_asist_eve > 100) {
        errores.push("Para cursos, el porcentaje de asistencia debe estar entre 0 y 100");
      }
    }

    return errores;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errores = validarFormulario();
    if (errores.length > 0) {
      errores.forEach(error => toast.error(error));
      return;
    }

    setLoading(true);    try {
      // Preparar FormData para envío (para manejar la imagen)
      const formDataToSend = new FormData();
      
      // Agregar campos básicos
      formDataToSend.append("nom_eve", formData.nom_eve);
      formDataToSend.append("des_eve", formData.des_eve);
      formDataToSend.append("tip_eve", formData.tip_eve);
      formDataToSend.append("fec_ini_eve", formData.fec_ini_eve);
      formDataToSend.append("fec_fin_eve", formData.fec_fin_eve);
      formDataToSend.append("dur_hrs_eve", formData.dur_hrs_eve);
      formDataToSend.append("pagado_eve", formData.pagado_eve);

      // Campos específicos para cursos
      if (formData.tip_eve === "CURSO") {
        formDataToSend.append("nota_min_eve", formData.nota_min_eve);
        formDataToSend.append("por_asist_eve", formData.por_asist_eve);
      }

      // Carrera (opcional)
      if (formData.carreraId) {
        formDataToSend.append("carreraId", formData.carreraId);
      }

      // Imagen (opcional)
      if (formData.imagen_portada) {
        formDataToSend.append("imagen_portada", formData.imagen_portada);
      }      let response;
      if (mode === "create") {
        response = await axiosInstance.post("/eventos", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Evento creado exitosamente");
      } else {
        response = await axiosInstance.put(`/eventos/${eventId}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Evento actualizado exitosamente");
      }

      navigate("/admin/eventos");
    } catch (error) {
      console.error("Error al guardar evento:", error);
      toast.error(error.response?.data?.msg || "Error al guardar el evento");
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
        <h1 className={`event-form-title ${esCurso ? 'curso' : 'evento'}`}>
          {mode === "create" ? "Crear Nuevo" : "Editar"} {esCurso ? "Curso" : "Evento"}
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
                placeholder={`Ingrese el nombre del ${esCurso ? "curso" : "evento"}`}
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
                {tiposEvento.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="des_eve"
              value={formData.des_eve}
              onChange={handleInputChange}
              placeholder={`Describe el contenido y objetivos del ${esCurso ? "curso" : "evento"}`}
              rows={4}
            />
          </div>
        </div>

        {/* Fechas y Duración */}
        <div className="event-form-section">
          <h2 className="section-title">
            <Calendar size={20} />
            Fechas y Duración
          </h2>
            <div className="form-grid">
            <div className="form-group">
              <label>Fecha y Hora de Inicio *</label>
              <div className="input-with-icon">
                <Calendar size={18} />
                <input
                  type="datetime-local"
                  name="fec_ini_eve"
                  value={formData.fec_ini_eve}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Fecha y Hora de Fin *</label>
              <div className="input-with-icon">
                <Calendar size={18} />
                <input
                  type="datetime-local"
                  name="fec_fin_eve"
                  value={formData.fec_fin_eve}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-grid">          <div className="form-group">
            <label>Duración Total (horas) *</label>
            <div className="input-with-icon">
              <Clock size={18} />
              <input
                type="number"
                name="dur_hrs_eve"
                value={formData.dur_hrs_eve}
                onChange={handleInputChange}
                min="1"
                step="1"
                placeholder="Ej: 8, 16, 40"
                required
              />
            </div>
          </div>
        </div>
        </div>

        {/* Configuración Específica de Curso */}
        {esCurso && (
          <div className="event-form-section curso-section">
            <h2 className="section-title">
              <GraduationCap size={20} />
              Configuración de Curso
            </h2>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Nota Mínima para Aprobar *</label>
                <div className="input-with-icon">
                  <Star size={18} />
                  <input
                    type="number"
                    name="nota_min_eve"
                    value={formData.nota_min_eve}
                    onChange={handleInputChange}
                    min="0"
                    max="10"
                    step="0.1"
                    placeholder="Ej: 7.0"
                    required={esCurso}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Asistencia Mínima (%) *</label>
                <div className="input-with-icon">
                  <Target size={18} />
                  <input
                    type="number"
                    name="por_asist_eve"
                    value={formData.por_asist_eve}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="1"
                    placeholder="Ej: 80"
                    required={esCurso}
                  />
                </div>
              </div>
            </div>
          </div>
        )}        {/* Información Adicional */}
        <div className="event-form-section">
          <h2 className="section-title">
            <Users size={20} />
            Información Adicional
          </h2>
          
          <div className="form-group">
            <label>Carrera Asociada</label>
            <select
              name="carreraId"
              value={formData.carreraId}
              onChange={handleInputChange}
            >
              <option value="">Todas las carreras / Evento general</option>
              {carreras.map(carrera => (
                <option key={carrera.id_car} value={carrera.id_car}>
                  {carrera.nom_car}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="pagado_eve"
                checked={formData.pagado_eve}
                onChange={handleInputChange}
              />
              <DollarSign size={18} />
              Evento de pago
            </label>
          </div>        </div>

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
            className={`btn-primary ${esCurso ? 'curso' : 'evento'}`}
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
                {mode === "create" ? "Crear" : "Actualizar"} {esCurso ? "Curso" : "Evento"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
