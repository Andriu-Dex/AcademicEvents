import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosConfig";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import {
  Save,
  Plus,
  Trash2,
  Eye,
  User,
  Mail,
  EyeOff,
  Edit2,
  CheckCircle,
  AlertCircle,
  Home,
} from "lucide-react";
import ImageUpload from "../../components/ImageUpload-mva";
import "./styles/AdminConfiguracionMVA.css";

const AdminConfiguracionMVA = () => {
  const [form, setForm] = useState({
    mision: "",
    vision: "",
    autoridades: "",
  });

  const [autoridadesArray, setAutoridadesArray] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    mision: false,
    vision: false,
  });

  const defaultAutoridad = {
    cargo: "",
    nombre: "",
    imagen: "",
    email: "",
  };

  const cargar = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/mva");
      if (res.data) {
        const data = res.data;

        // Verificamos si autoridades es un string JSON y lo parseamos
        let autoridadesData = [];
        if (data.autoridades) {
          try {
            autoridadesData = JSON.parse(data.autoridades);
            setAutoridadesArray(autoridadesData);
          } catch (error) {
            console.error("Error al parsear autoridades:", error);
            setAutoridadesArray([]);
          }
        }

        setForm({
          mision: data.mision || "",
          vision: data.vision || "",
          autoridades: data.autoridades || "",
        });
      }
    } catch (error) {
      console.error("Error al cargar información MVA:", error);
      toast.error(
        "Error al cargar la información de Misión, Visión y Autoridades"
      );
    } finally {
      setLoading(false);
    }
  };

  const guardar = async () => {
    try {
      // Validar que misión y visión no estén vacíos
      const errors = {
        mision: !form.mision.trim(),
        vision: !form.vision.trim(),
      };

      setValidationErrors(errors);

      // Si hay errores, mostrar mensaje y detener el guardado
      if (errors.mision || errors.vision) {
        toast.error("Los campos de Misión y Visión no pueden estar vacíos");
        return;
      }

      setLoading(true);
      setSaveSuccess(false);

      // Actualizar el campo autoridades con el arreglo actual
      const formToSend = {
        ...form,
        autoridades: JSON.stringify(autoridadesArray),
      };

      await axiosInstance.put("/mva", formToSend);
      toast.success(
        "Información de Misión, Visión y Autoridades actualizada correctamente"
      );

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      // Recargar la información para mostrar los cambios actualizados
      cargar();
    } catch (error) {
      console.error("Error al guardar información MVA:", error);
      toast.error(
        "Error al guardar la información de Misión, Visión y Autoridades"
      );
    } finally {
      setLoading(false);
    }
  };

  const agregarAutoridad = () => {
    setAutoridadesArray([...autoridadesArray, { ...defaultAutoridad }]);
  };

  const eliminarAutoridad = (index) => {
    const nuevasAutoridades = autoridadesArray.filter((_, i) => i !== index);
    setAutoridadesArray(nuevasAutoridades);
  };

  const actualizarAutoridad = (index, campo, valor) => {
    const nuevasAutoridades = [...autoridadesArray];
    nuevasAutoridades[index] = {
      ...nuevasAutoridades[index],
      [campo]: valor,
    };
    setAutoridadesArray(nuevasAutoridades);
  };

  useEffect(() => {
    cargar();
  }, []);

  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
  };

  return (
    <>
      {/* Botón para volver al home */}
      <Link to="/home" className="home-button-acmva">
        <Home size={22} color="white" />
      </Link>

      <div className="adminconfig-container">
        <div className="adminconfig-header">
          <h2 className="adminconfig-title">Misión, Visión y Autoridades</h2>
          <button
            className="adminconfig-preview-btn"
            onClick={togglePreviewMode}
            title={previewMode ? "Modo edición" : "Vista previa"}
          >
            {previewMode ? <Edit2 size={18} /> : <Eye size={18} />}
            {previewMode ? " Editar" : " Vista previa"}
          </button>
        </div>

        <p className="adminconfig-description">
          Desde aquí puedes editar la información que se muestra en la página
          principal. Los cambios se reflejarán inmediatamente en la sección
          institucional.
        </p>

        <div className="adminconfig-section">
          <h3 className="adminconfig-section-title">Misión</h3>
          {previewMode ? (
            <div className="adminconfig-preview-box">
              {form.mision ? (
                <p>{form.mision}</p>
              ) : (
                <p className="text-muted">No se ha definido una misión.</p>
              )}
            </div>
          ) : (
            <>
              <textarea
                rows={4}
                className={`adminconfig-textarea ${
                  validationErrors.mision ? "error-input" : ""
                }`}
                value={form.mision}
                onChange={(e) => {
                  setForm({ ...form, mision: e.target.value });
                  if (e.target.value.trim()) {
                    setValidationErrors({ ...validationErrors, mision: false });
                  }
                }}
                placeholder="Ingrese la misión de la facultad"
              />
              {validationErrors.mision && (
                <p className="validation-error-message">
                  Este campo es obligatorio
                </p>
              )}
            </>
          )}
        </div>

        <div className="adminconfig-section">
          <h3 className="adminconfig-section-title">Visión</h3>
          {previewMode ? (
            <div className="adminconfig-preview-box">
              {form.vision ? (
                <p>{form.vision}</p>
              ) : (
                <p className="text-muted">No se ha definido una visión.</p>
              )}
            </div>
          ) : (
            <>
              <textarea
                rows={4}
                className={`adminconfig-textarea ${
                  validationErrors.vision ? "error-input" : ""
                }`}
                value={form.vision}
                onChange={(e) => {
                  setForm({ ...form, vision: e.target.value });
                  if (e.target.value.trim()) {
                    setValidationErrors({ ...validationErrors, vision: false });
                  }
                }}
                placeholder="Ingrese la visión de la facultad"
              />
              {validationErrors.vision && (
                <p className="validation-error-message">
                  Este campo es obligatorio
                </p>
              )}
            </>
          )}
        </div>

        <div className="adminconfig-section">
          <h3 className="adminconfig-section-title">Autoridades</h3>
          <p className="adminconfig-info">
            {previewMode
              ? "Vista previa de las autoridades configuradas."
              : "Agregue hasta 5 autoridades de la facultad. Las dos primeras se considerarán como Decano y Subdecano respectivamente."}
          </p>

          {previewMode ? (
            <div className="adminconfig-autoridades-preview">
              {autoridadesArray.length > 0 ? (
                autoridadesArray.map((autoridad, index) => (
                  <div key={index} className="autoridad-card">
                    <div className="autoridad-imagen">
                      <img
                        src={
                          autoridad.imagen ||
                          "https://via.placeholder.com/150?text=Sin+Imagen"
                        }
                        alt={autoridad.nombre || "Autoridad"}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/150?text=Sin+Imagen";
                        }}
                      />
                    </div>
                    <div className="autoridad-info">
                      <h4>{autoridad.cargo || "Sin cargo asignado"}</h4>
                      <h5>{autoridad.nombre || "Sin nombre especificado"}</h5>
                      {autoridad.email && (
                        <p>
                          <Mail size={14} /> {autoridad.email}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <AlertCircle size={36} color="#94a3b8" />
                  <p>No se han definido autoridades.</p>
                  <button
                    className="adminconfig-preview-btn small"
                    onClick={togglePreviewMode}
                  >
                    <Edit2 size={14} /> Configurar autoridades
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="adminconfig-autoridades-container">
              {autoridadesArray.map((autoridad, index) => (
                <div key={index} className="autoridad-form">
                  <div className="autoridad-form-header">
                    <span className="autoridad-numero">
                      {index === 0
                        ? "Decano"
                        : index === 1
                        ? "Subdecano"
                        : `Autoridad ${index + 1}`}
                    </span>
                    <button
                      className="autoridad-delete-btn"
                      onClick={() => eliminarAutoridad(index)}
                      title="Eliminar autoridad"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="autoridad-form-group">
                    <label>
                      <span>Cargo:</span>
                      <input
                        type="text"
                        value={autoridad.cargo}
                        onChange={(e) =>
                          actualizarAutoridad(index, "cargo", e.target.value)
                        }
                        placeholder={
                          index === 0
                            ? "Decano"
                            : index === 1
                            ? "Subdecano"
                            : "Cargo"
                        }
                        className="autoridad-input"
                      />
                    </label>
                  </div>
                  <div className="autoridad-form-group">
                    <label>
                      <span>
                        <User size={14} /> Nombre completo:
                      </span>
                      <input
                        type="text"
                        value={autoridad.nombre}
                        onChange={(e) =>
                          actualizarAutoridad(index, "nombre", e.target.value)
                        }
                        placeholder="Nombre y apellido"
                        className="autoridad-input"
                      />
                    </label>
                  </div>
                  <div className="autoridad-form-group">
                    <label>
                      <span>
                        <Mail size={14} /> Correo electrónico:
                      </span>
                      <input
                        type="email"
                        value={autoridad.email}
                        onChange={(e) =>
                          actualizarAutoridad(index, "email", e.target.value)
                        }
                        placeholder="correo@uta.edu.ec"
                        className="autoridad-input"
                      />
                    </label>
                  </div>
                  <div className="autoridad-form-group">
                    <label>
                      <span>Imagen de perfil:</span>
                      <ImageUpload
                        currentImage={autoridad.imagen}
                        onImageChange={(url) =>
                          actualizarAutoridad(index, "imagen", url)
                        }
                        placeholder="Subir foto de la autoridad"
                      />
                    </label>
                  </div>
                </div>
              ))}

              {autoridadesArray.length < 5 && (
                <button
                  className="autoridad-add-btn"
                  onClick={agregarAutoridad}
                  disabled={loading}
                >
                  <Plus size={18} /> Agregar autoridad
                </button>
              )}
            </div>
          )}
        </div>

        <div className="adminconfig-actions">
          <button
            onClick={guardar}
            className={`adminconfig-btn ${loading ? "loading" : ""} ${
              saveSuccess ? "success" : ""
            }`}
            disabled={loading}
          >
            {loading ? (
              <>Guardando...</>
            ) : saveSuccess ? (
              <>
                <CheckCircle size={18} /> Guardado
              </>
            ) : (
              <>
                <Save size={18} /> Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminConfiguracionMVA;
