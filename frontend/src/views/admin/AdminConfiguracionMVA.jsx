import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosConfig";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useConfigurableStats } from "../../hooks/useConfigurableStats";
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
  ChevronDown,
  ChevronUp,
  Building,
  Briefcase,
  Image,
  AlignLeft,
  Globe,
  Phone,
  MapPin,
  School,
  BarChart,
  University,
  Users,
} from "lucide-react";
import ImageUpload from "../../components/ImageUploadMVA";
import StatisticsConfig from "../../components/admin/StatisticsConfig";
import "./styles/AdminConfiguracionMVA.css";

const AdminConfiguracionMVA = () => {
  // Hook para manejar estadísticas configurables
  const { updateActiveStats } = useConfigurableStats();

  const [form, setForm] = useState({
    mision: "",
    vision: "",
    autoridades: "",
  });

  const [facultad, setFacultad] = useState({
    id_fac: "",
    nom_fac: "",
    acr_fac: "",
    des_fac: "",
    url_log_fac: "",
  });

  const [autoridadesArray, setAutoridadesArray] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingFacultad, setLoadingFacultad] = useState(false);
  const [loadingUniversidad, setLoadingUniversidad] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveFacultadSuccess, setSaveFacultadSuccess] = useState(false);
  const [saveUniversidadSuccess, setSaveUniversidadSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    mision: false,
    vision: false,
  });
  const [validationFacultadErrors, setValidationFacultadErrors] = useState({
    nom_fac: false,
  });
  const [validationUniversidadErrors, setValidationUniversidadErrors] =
    useState({
      nom_uni: false,
      dir_uni: false,
    });
  const [mvaExpanded, setMvaExpanded] = useState(false);
  const [facultadExpanded, setFacultadExpanded] = useState(false);
  const [universidadExpanded, setUniversidadExpanded] = useState(false);
  const [statisticsExpanded, setStatisticsExpanded] = useState(false);

  const [universidad, setUniversidad] = useState({
    id_uni: "",
    nom_uni: "",
    acr_uni: "",
    url_log_uni: "",
    url_web_uni: "",
    dir_uni: "",
    tel_uni: "",
    cor_uni: "",
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

  const cargarFacultad = async () => {
    try {
      setLoadingFacultad(true);
      const res = await axiosInstance.get("/facultad-principal");
      if (res.data) {
        const data = res.data;
        setFacultad({
          id_fac: data.id_fac || "",
          nom_fac: data.nom_fac || "",
          acr_fac: data.acr_fac || "",
          des_fac: data.des_fac || "",
          url_log_fac: data.url_log_fac || "",
        });
      }
    } catch (error) {
      console.error("Error al cargar información de la Facultad:", error);
      toast.error("Error al cargar la información de la Facultad");
    } finally {
      setLoadingFacultad(false);
    }
  };

  // Cargar datos de la universidad
  const cargarUniversidad = async () => {
    try {
      setLoadingUniversidad(true);
      const res = await axiosInstance.get("/universidad-principal");
      if (res.data) {
        const data = res.data;
        setUniversidad({
          id_uni: data.id_uni || "",
          nom_uni: data.nom_uni || "",
          acr_uni: data.acr_uni || "",
          url_log_uni: data.url_log_uni || "",
          url_web_uni: data.url_web_uni || "",
          dir_uni: data.dir_uni || "",
          tel_uni: data.tel_uni || "",
          cor_uni: data.cor_uni || "",
        });
      }
    } catch (error) {
      console.error("Error al cargar información de la Universidad:", error);
      toast.error("Error al cargar la información de la Universidad");
    } finally {
      setLoadingUniversidad(false);
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

  const guardarFacultad = async () => {
    try {
      // Validar que el nombre no esté vacío
      const errors = {
        nom_fac: !facultad.nom_fac.trim(),
      };

      setValidationFacultadErrors(errors);

      // Si hay errores, mostrar mensaje y detener el guardado
      if (errors.nom_fac) {
        toast.error("El nombre de la facultad no puede estar vacío");
        return;
      }

      setLoadingFacultad(true);
      setSaveFacultadSuccess(false);

      await axiosInstance.put(`/facultades/${facultad.id_fac}/datos-basicos`, {
        nom_fac: facultad.nom_fac,
        acr_fac: facultad.acr_fac,
        des_fac: facultad.des_fac,
        url_log_fac: facultad.url_log_fac,
      });

      toast.success("Datos de la Facultad actualizados correctamente");

      setSaveFacultadSuccess(true);
      setTimeout(() => setSaveFacultadSuccess(false), 3000);

      // Recargar la información para mostrar los cambios actualizados
      cargarFacultad();
    } catch (error) {
      console.error("Error al guardar información de la Facultad:", error);
      toast.error("Error al guardar la información de la Facultad");
    } finally {
      setLoadingFacultad(false);
    }
  };

  // Guardar datos de la universidad
  const guardarUniversidad = async () => {
    try {
      // Validar que nombre y dirección no estén vacíos
      const errors = {
        nom_uni: !universidad.nom_uni.trim(),
        dir_uni: !universidad.dir_uni.trim(),
      };

      setValidationUniversidadErrors(errors);

      // Si hay errores, mostrar mensaje y detener el guardado
      if (errors.nom_uni || errors.dir_uni) {
        toast.error(
          "El nombre y la dirección de la universidad no pueden estar vacíos"
        );
        return;
      }

      setLoadingUniversidad(true);
      setSaveUniversidadSuccess(false);

      await axiosInstance.put(`/universidad/${universidad.id_uni}`, {
        nom_uni: universidad.nom_uni,
        acr_uni: universidad.acr_uni,
        url_log_uni: universidad.url_log_uni,
        url_web_uni: universidad.url_web_uni,
        dir_uni: universidad.dir_uni,
        tel_uni: universidad.tel_uni,
        cor_uni: universidad.cor_uni,
      });

      toast.success("Datos de la Universidad actualizados correctamente");

      setSaveUniversidadSuccess(true);
      setTimeout(() => setSaveUniversidadSuccess(false), 3000);

      // Recargar la información para mostrar los cambios actualizados
      cargarUniversidad();
    } catch (error) {
      console.error("Error al guardar información de la Universidad:", error);
      toast.error("Error al guardar la información de la Universidad");
    } finally {
      setLoadingUniversidad(false);
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
    cargarFacultad();
    cargarUniversidad();
  }, []);

  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
  };

  const toggleMvaSection = () => {
    setMvaExpanded(!mvaExpanded);
  };

  const toggleFacultadSection = () => {
    setFacultadExpanded(!facultadExpanded);
  };

  const toggleUniversidadSection = () => {
    setUniversidadExpanded(!universidadExpanded);
  };

  const toggleStatisticsSection = () => {
    setStatisticsExpanded(!statisticsExpanded);
  };

  return (
    <>
      {/* Botón para volver al home */}
      <Link to="/home" className="home-button-acmva">
        <Home size={22} color="white" />
      </Link>

      <div className="adminconfig-container-acmva">
        {/* Sección Datos Universidad */}
        <div
          className="adminconfig-collapsible-header-acmva"
          onClick={toggleUniversidadSection}
        >
          <h2 className="adminconfig-title-acmva">
            <University size={20} /> Datos Universidad
          </h2>
          <button
            className="adminconfig-collapse-btn-acmva"
            aria-label={
              universidadExpanded ? "Colapsar sección" : "Expandir sección"
            }
          >
            {universidadExpanded ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </button>
        </div>

        {universidadExpanded && (
          <>
            <p className="adminconfig-description-acmva">
              Desde aquí puedes editar la información básica de la universidad,
              como su nombre, logo, dirección y datos de contacto. Esta
              información aparecerá en todas las secciones del sistema.
            </p>

            <div className="adminconfig-section-acmva">
              <div className="adminconfig-form-acmva">
                <div className="adminconfig-form-group-acmva">
                  <label>
                    <span>
                      <Image size={14} /> Logo de la Universidad:
                    </span>
                    <ImageUpload
                      currentImage={universidad.url_log_uni}
                      onImageChange={(url) =>
                        setUniversidad({ ...universidad, url_log_uni: url })
                      }
                      placeholder="Subir logo de la universidad"
                    />
                  </label>
                </div>

                <div className="adminconfig-form-group-acmva">
                  <label>
                    <span>
                      <School size={14} /> Nombre de la Universidad *:
                    </span>
                    <input
                      type="text"
                      className={`adminconfig-input-acmva ${
                        validationUniversidadErrors.nom_uni
                          ? "error-input-acmva"
                          : ""
                      }`}
                      value={universidad.nom_uni}
                      onChange={(e) => {
                        setUniversidad({
                          ...universidad,
                          nom_uni: e.target.value,
                        });
                        if (e.target.value.trim()) {
                          setValidationUniversidadErrors({
                            ...validationUniversidadErrors,
                            nom_uni: false,
                          });
                        }
                      }}
                      placeholder="Nombre completo de la universidad"
                    />
                    {validationUniversidadErrors.nom_uni && (
                      <p className="validation-error-message-acmva">
                        Este campo es obligatorio
                      </p>
                    )}
                  </label>
                </div>

                <div className="adminconfig-form-group-acmva">
                  <label>
                    <span>
                      <Building size={14} /> Acrónimo de la Universidad:
                    </span>
                    <input
                      type="text"
                      className="adminconfig-input-acmva"
                      value={universidad.acr_uni || ""}
                      onChange={(e) =>
                        setUniversidad({
                          ...universidad,
                          acr_uni: e.target.value,
                        })
                      }
                      placeholder="Ejemplo: UTA"
                    />
                  </label>
                </div>

                <div className="adminconfig-form-group-acmva">
                  <label>
                    <span>
                      <Globe size={14} /> Sitio Web:
                    </span>
                    <input
                      type="text"
                      className="adminconfig-input-acmva"
                      value={universidad.url_web_uni || ""}
                      onChange={(e) =>
                        setUniversidad({
                          ...universidad,
                          url_web_uni: e.target.value,
                        })
                      }
                      placeholder="https://ejemplo.com"
                    />
                  </label>
                </div>

                <div className="adminconfig-form-group-acmva">
                  <label>
                    <span>
                      <MapPin size={14} /> Dirección *:
                    </span>
                    <input
                      type="text"
                      className={`adminconfig-input-acmva ${
                        validationUniversidadErrors.dir_uni
                          ? "error-input-acmva"
                          : ""
                      }`}
                      value={universidad.dir_uni}
                      onChange={(e) => {
                        setUniversidad({
                          ...universidad,
                          dir_uni: e.target.value,
                        });
                        if (e.target.value.trim()) {
                          setValidationUniversidadErrors({
                            ...validationUniversidadErrors,
                            dir_uni: false,
                          });
                        }
                      }}
                      placeholder="Dirección completa de la universidad"
                    />
                    {validationUniversidadErrors.dir_uni && (
                      <p className="validation-error-message-acmva">
                        Este campo es obligatorio
                      </p>
                    )}
                  </label>
                </div>

                <div className="adminconfig-form-group-acmva">
                  <label>
                    <span>
                      <Phone size={14} /> Teléfono:
                    </span>
                    <input
                      type="text"
                      className="adminconfig-input-acmva"
                      value={universidad.tel_uni || ""}
                      onChange={(e) =>
                        setUniversidad({
                          ...universidad,
                          tel_uni: e.target.value,
                        })
                      }
                      placeholder="Número de teléfono"
                    />
                  </label>
                </div>

                <div className="adminconfig-form-group-acmva">
                  <label>
                    <span>
                      <Mail size={14} /> Correo Electrónico:
                    </span>
                    <input
                      type="email"
                      className="adminconfig-input-acmva"
                      value={universidad.cor_uni || ""}
                      onChange={(e) =>
                        setUniversidad({
                          ...universidad,
                          cor_uni: e.target.value,
                        })
                      }
                      placeholder="correo@universidad.edu.ec"
                    />
                  </label>
                </div>
              </div>

              <div className="adminconfig-actions-acmva">
                <button
                  onClick={guardarUniversidad}
                  className={`adminconfig-btn-acmva ${
                    loadingUniversidad ? "loading-acmva" : ""
                  } ${saveUniversidadSuccess ? "success-acmva" : ""}`}
                  disabled={loadingUniversidad}
                >
                  {loadingUniversidad ? (
                    <>Guardando...</>
                  ) : saveUniversidadSuccess ? (
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
        )}

        {/* Sección Datos de la Facultad */}
        <div
          className="adminconfig-collapsible-header-acmva"
          onClick={toggleFacultadSection}
        >
          <h2 className="adminconfig-title-acmva">
            <Building size={20} /> Datos de la Facultad
          </h2>
          <button
            className="adminconfig-collapse-btn-acmva"
            aria-label={
              facultadExpanded ? "Colapsar sección" : "Expandir sección"
            }
          >
            {facultadExpanded ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </button>
        </div>

        {facultadExpanded && (
          <>
            <p className="adminconfig-description-acmva">
              Desde aquí puedes editar la información básica de la facultad,
              como su nombre, acrónimo y logo. Estos datos aparecerán en todas
              las secciones del sistema.
            </p>

            <div className="adminconfig-section-acmva">
              <div className="facultad-form-acmva">
                <div className="facultad-form-group-acmva">
                  <label>
                    <span>
                      <Image size={14} /> Logo de la Facultad:
                    </span>
                    <ImageUpload
                      currentImage={facultad.url_log_fac}
                      onImageChange={(url) =>
                        setFacultad({ ...facultad, url_log_fac: url })
                      }
                      placeholder="Subir logo de la facultad"
                    />
                  </label>
                </div>

                <div className="facultad-form-group-acmva">
                  <label>
                    <span>
                      <Building size={14} /> Nombre de la Facultad:
                    </span>
                    <input
                      type="text"
                      className={`facultad-input-acmva ${
                        validationFacultadErrors.nom_fac
                          ? "error-input-acmva"
                          : ""
                      }`}
                      value={facultad.nom_fac}
                      onChange={(e) => {
                        setFacultad({ ...facultad, nom_fac: e.target.value });
                        if (e.target.value.trim()) {
                          setValidationFacultadErrors({
                            ...validationFacultadErrors,
                            nom_fac: false,
                          });
                        }
                      }}
                      placeholder="Nombre completo de la facultad"
                    />
                    {validationFacultadErrors.nom_fac && (
                      <p className="validation-error-message-acmva">
                        Este campo es obligatorio
                      </p>
                    )}
                  </label>
                </div>

                <div className="facultad-form-group-acmva">
                  <label>
                    <span>
                      <Briefcase size={14} /> Acrónimo de la Facultad:
                    </span>
                    <input
                      type="text"
                      className="facultad-input-acmva"
                      value={facultad.acr_fac || ""}
                      onChange={(e) =>
                        setFacultad({ ...facultad, acr_fac: e.target.value })
                      }
                      placeholder="Ejemplo: FISEI"
                    />
                  </label>
                </div>

                <div className="facultad-form-group-acmva">
                  <label>
                    <span>
                      <AlignLeft size={14} /> Descripción de la Facultad:
                    </span>
                    <textarea
                      rows={4}
                      className="facultad-input-acmva textarea-acmva"
                      value={facultad.des_fac || ""}
                      onChange={(e) =>
                        setFacultad({ ...facultad, des_fac: e.target.value })
                      }
                      placeholder="Breve descripción de la facultad"
                    />
                  </label>
                </div>
              </div>

              <div className="adminconfig-actions-acmva">
                <button
                  onClick={guardarFacultad}
                  className={`adminconfig-btn-acmva ${
                    loadingFacultad ? "loading-acmva" : ""
                  } ${saveFacultadSuccess ? "success-acmva" : ""}`}
                  disabled={loadingFacultad}
                >
                  {loadingFacultad ? (
                    <>Guardando...</>
                  ) : saveFacultadSuccess ? (
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
        )}

        {/* Sección MVA */}
        <div
          className="adminconfig-collapsible-header-acmva"
          onClick={toggleMvaSection}
        >
          <h2 className="adminconfig-title-acmva">
            <Users size={20} /> Misión, Visión y Autoridades
          </h2>
          <button
            className="adminconfig-collapse-btn-acmva"
            aria-label={mvaExpanded ? "Colapsar sección" : "Expandir sección"}
          >
            {mvaExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {mvaExpanded && (
          <>
            <div className="adminconfig-header-acmva">
              <button
                className="adminconfig-preview-btn-acmva"
                onClick={togglePreviewMode}
                title={previewMode ? "Modo edición" : "Vista previa"}
              >
                {previewMode ? <Edit2 size={18} /> : <Eye size={18} />}
                {previewMode ? " Editar" : " Vista previa"}
              </button>
            </div>

            <p className="adminconfig-description-acmva">
              Desde aquí puedes editar la información que se muestra en la
              página principal. Los cambios se reflejarán inmediatamente en la
              sección institucional.
            </p>

            <div className="adminconfig-section-acmva">
              <h3 className="adminconfig-section-title-acmva">Misión</h3>
              {previewMode ? (
                <div className="adminconfig-preview-box-acmva">
                  {form.mision ? (
                    <p>{form.mision}</p>
                  ) : (
                    <p className="text-muted-acmva">
                      No se ha definido una misión.
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <textarea
                    rows={4}
                    className={`adminconfig-textarea-acmva ${
                      validationErrors.mision ? "error-input-acmva" : ""
                    }`}
                    value={form.mision}
                    onChange={(e) => {
                      setForm({ ...form, mision: e.target.value });
                      if (e.target.value.trim()) {
                        setValidationErrors({
                          ...validationErrors,
                          mision: false,
                        });
                      }
                    }}
                    placeholder="Ingrese la misión de la facultad"
                  />
                  {validationErrors.mision && (
                    <p className="validation-error-message-acmva">
                      Este campo es obligatorio
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="adminconfig-section-acmva">
              <h3 className="adminconfig-section-title-acmva">Visión</h3>
              {previewMode ? (
                <div className="adminconfig-preview-box-acmva">
                  {form.vision ? (
                    <p>{form.vision}</p>
                  ) : (
                    <p className="text-muted-acmva">
                      No se ha definido una visión.
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <textarea
                    rows={4}
                    className={`adminconfig-textarea-acmva ${
                      validationErrors.vision ? "error-input-acmva" : ""
                    }`}
                    value={form.vision}
                    onChange={(e) => {
                      setForm({ ...form, vision: e.target.value });
                      if (e.target.value.trim()) {
                        setValidationErrors({
                          ...validationErrors,
                          vision: false,
                        });
                      }
                    }}
                    placeholder="Ingrese la visión de la facultad"
                  />
                  {validationErrors.vision && (
                    <p className="validation-error-message-acmva">
                      Este campo es obligatorio
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="adminconfig-section-acmva">
              <h3 className="adminconfig-section-title-acmva">Autoridades</h3>
              <p className="adminconfig-info-acmva">
                {previewMode
                  ? "Vista previa de las autoridades configuradas."
                  : "Agregue hasta 5 autoridades de la facultad. Las dos primeras se considerarán como Decano y Subdecano respectivamente."}
              </p>

              {previewMode ? (
                <div className="adminconfig-autoridades-preview-acmva">
                  {autoridadesArray.length > 0 ? (
                    autoridadesArray.map((autoridad, index) => (
                      <div key={index} className="autoridad-card-acmva">
                        <div className="autoridad-imagen-acmva">
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
                        <div className="autoridad-info-acmva">
                          <h4>{autoridad.cargo || "Sin cargo asignado"}</h4>
                          <h5>
                            {autoridad.nombre || "Sin nombre especificado"}
                          </h5>
                          {autoridad.email && (
                            <p>
                              <Mail size={14} /> {autoridad.email}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state-acmva">
                      <AlertCircle size={36} color="#94a3b8" />
                      <p>No se han definido autoridades.</p>
                      <button
                        className="adminconfig-preview-btn-acmva small-acmva"
                        onClick={togglePreviewMode}
                      >
                        <Edit2 size={14} /> Configurar autoridades
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="adminconfig-autoridades-container-acmva">
                  {autoridadesArray.map((autoridad, index) => (
                    <div key={index} className="autoridad-form-acmva">
                      <div className="autoridad-form-header-acmva">
                        <span className="autoridad-numero-acmva">
                          {index === 0
                            ? "Decano"
                            : index === 1
                            ? "Subdecano"
                            : `Autoridad ${index + 1}`}
                        </span>
                        <button
                          className="autoridad-delete-btn-acmva"
                          onClick={() => eliminarAutoridad(index)}
                          title="Eliminar autoridad"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="autoridad-form-group-acmva">
                        <label>
                          <span>Cargo:</span>
                          <input
                            type="text"
                            value={autoridad.cargo}
                            onChange={(e) =>
                              actualizarAutoridad(
                                index,
                                "cargo",
                                e.target.value
                              )
                            }
                            placeholder={
                              index === 0
                                ? "Decano"
                                : index === 1
                                ? "Subdecano"
                                : "Cargo"
                            }
                            className="autoridad-input-acmva"
                          />
                        </label>
                      </div>
                      <div className="autoridad-form-group-acmva">
                        <label>
                          <span>
                            <User size={14} /> Nombre completo:
                          </span>
                          <input
                            type="text"
                            value={autoridad.nombre}
                            onChange={(e) =>
                              actualizarAutoridad(
                                index,
                                "nombre",
                                e.target.value
                              )
                            }
                            placeholder="Nombre y apellido"
                            className="autoridad-input-acmva"
                          />
                        </label>
                      </div>
                      <div className="autoridad-form-group-acmva">
                        <label>
                          <span>
                            <Mail size={14} /> Correo electrónico:
                          </span>
                          <input
                            type="email"
                            value={autoridad.email}
                            onChange={(e) =>
                              actualizarAutoridad(
                                index,
                                "email",
                                e.target.value
                              )
                            }
                            placeholder="correo@uta.edu.ec"
                            className="autoridad-input-acmva"
                          />
                        </label>
                      </div>
                      <div className="autoridad-form-group-acmva">
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
                      className="autoridad-add-btn-acmva"
                      onClick={agregarAutoridad}
                      disabled={loading}
                    >
                      <Plus size={18} /> Agregar autoridad
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="adminconfig-actions-acmva">
              <button
                onClick={guardar}
                className={`adminconfig-btn-acmva ${
                  loading ? "loading-acmva" : ""
                } ${saveSuccess ? "success-acmva" : ""}`}
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
          </>
        )}

        {/* Sección de Estadísticas */}
        <div
          className="adminconfig-collapsible-header-acmva"
          onClick={toggleStatisticsSection}
        >
          <h2 className="adminconfig-title-acmva">
            <BarChart size={20} /> Estadísticas del Home
          </h2>
          <button
            className="adminconfig-collapse-btn-acmva"
            aria-label={
              statisticsExpanded ? "Colapsar sección" : "Expandir sección"
            }
          >
            {statisticsExpanded ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </button>
        </div>

        {statisticsExpanded && (
          <>
            <div className="adminconfig-section-acmva">
              <StatisticsConfig
                loading={loading}
                onSave={(selectedStats) => {
                  console.log("Estadísticas seleccionadas:", selectedStats);
                  // Cuando se implemente el backend, aquí se manejará el guardado
                }}
                onStatsUpdate={(selectedStats) => {
                  // Actualizar las estadísticas en tiempo real
                  updateActiveStats(selectedStats);
                }}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AdminConfiguracionMVA;
