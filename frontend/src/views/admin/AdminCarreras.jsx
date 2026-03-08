import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosConfig";
import { toast } from "react-toastify";
import { Dialog } from "@headlessui/react";
import { useSocket } from "../../context/SocketContext";
import "./styles/AdminCarreras.css";
import "./styles/modalStyles.css";
import {
  Laptop,
  Wrench,
  Zap,
  Factory,
  BookOpen,
  Monitor,
  ChevronDown,
  ChevronUp,
  Plus,
  AlertTriangle,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";

// Clase para manejar las carreras
class CarreraManager {
  constructor() {
    this.axiosInstance = axiosInstance;
  }

  async obtenerTodasLasCarreras() {
    try {
      const res = await this.axiosInstance.get("/carreras/todas");
      return res.data.map((carrera) => ({
        ...carrera,
        dur_sem_car: carrera.dur_sem_car || 0,
      }));
    } catch (error) {
      console.error("Error al cargar carreras:", error);
      throw error;
    }
  }

  async crearCarrera(formData) {
    try {
      const response = await this.axiosInstance.post("/carreras", {
        ...formData,
        dur_sem_car: parseInt(formData.dur_sem_car),
      });
      return response.data;
    } catch (error) {
      console.error("Error al crear carrera:", error);
      throw error;
    }
  }

  async actualizarCarrera(id, editFormData) {
    try {
      const response = await this.axiosInstance.put(`/carreras/${id}`, {
        ...editFormData,
        dur_sem_car: parseInt(editFormData.dur_sem_car),
      });
      return response.data;
    } catch (error) {
      console.error("Error al actualizar carrera:", error);
      throw error;
    }
  }

  async desactivarCarrera(id) {
    try {
      const response = await this.axiosInstance.delete(`/carreras/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al desactivar carrera:", error);
      throw error;
    }
  }

  async activarCarrera(id) {
    try {
      const response = await this.axiosInstance.put(`/carreras/${id}/activar`);
      return response.data;
    } catch (error) {
      console.error("Error al activar carrera:", error);
      throw error;
    }
  }

  async eliminarCarreraPermanentemente(id) {
    try {
      const response = await this.axiosInstance.delete(
        `/carreras/${id}/permanente`
      );
      return response.data;
    } catch (error) {
      console.error("Error al eliminar carrera permanentemente:", error);
      throw error;
    }
  }
}

const AdminCarreras = () => {
  const [carreras, setCarreras] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [coordinadores, setCoordinadores] = useState([]);
  const [formData, setFormData] = useState({
    nom_car: "",
    des_car: "",
    dur_sem_car: "",
    mod_car: "PRESENCIAL",
    ico_car: "laptop", // default icon
    id_fac_per: "",
    id_coo_per: "",
  });
  const [editandoId, setEditandoId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [modalEliminar, setModalEliminar] = useState({
    abierto: false,
    id: null,
  });
  const [modalEliminarPermanente, setModalEliminarPermanente] = useState({
    abierto: false,
    id: null,
  });
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [modalEdicion, setModalEdicion] = useState({
    abierto: false,
    carrera: null,
  });

  // Hook para socket y actualizaciones en tiempo real
  const { carreraUpdates, clearCarreraUpdates, isConnected } = useSocket();

  // Instancia de la clase CarreraManager
  const carreraManager = new CarreraManager();

  // Iconos disponibles para carreras
  const iconOptions = [
    { value: "laptop", label: "Laptop", icon: <Laptop size={20} /> },
    { value: "wrench", label: "Herramienta", icon: <Wrench size={20} /> },
    { value: "zap", label: "Electrónica", icon: <Zap size={20} /> },
    { value: "factory", label: "Industrial", icon: <Factory size={20} /> },
    { value: "book", label: "Educación", icon: <BookOpen size={20} /> },
    { value: "monitor", label: "Computación", icon: <Monitor size={20} /> },
  ];

  // Modalidades disponibles
  const modalidades = ["PRESENCIAL", "VIRTUAL", "SEMIPRESENCIAL"];

  const getCareerId = (career) => career?.id_car || career?.id || "";

  const normalizeCarrera = (career) => {
    if (!career || typeof career !== "object") return null;

    const rawIsActive = career.est_car ?? career.isActive;

    return {
      ...career,
      id_car: getCareerId(career),
      nom_car: career.nom_car ?? career.name ?? career.nombre ?? "",
      des_car: career.des_car ?? career.description ?? career.descripcion ?? "",
      dur_sem_car: Number(
        career.dur_sem_car ?? career.durationSemesters ?? career.duracion ?? 0
      ),
      mod_car: career.mod_car ?? career.modality ?? career.modalidad ?? "PRESENCIAL",
      ico_car: career.ico_car ?? career.iconUrl ?? career.icon ?? "laptop",
      id_fac_per: career.id_fac_per ?? career.facultyId ?? "",
      id_coo_per: career.id_coo_per ?? career.coordinatorId ?? "",
      est_car:
        typeof rawIsActive === "boolean"
          ? rawIsActive
          : rawIsActive === undefined
          ? true
          : Boolean(rawIsActive),
    };
  };

  const getFacultyId = (faculty) => faculty?.id_fac || faculty?.id || "";
  const getFacultyName = (faculty) =>
    faculty?.nom_fac || faculty?.name || "Sin nombre";
  const getCoordinatorId = (coordinator) =>
    coordinator?.id_coo || coordinator?.id || "";
  const getCoordinatorName = (coordinator) => {
    const firstName = coordinator?.nom_coo || coordinator?.firstName || "";
    const lastName = coordinator?.ape_coo || coordinator?.lastName || "";
    return `${firstName} ${lastName}`.trim() || "Sin nombre";
  };

  const cargarCarreras = async () => {
    try {
      const carrerasConValidacion = await carreraManager.obtenerTodasLasCarreras();
      setCarreras(
        carrerasConValidacion
          .map((carrera) => normalizeCarrera(carrera))
          .filter(Boolean)
      );
    } catch (error) {
      toast.error("Error al cargar las carreras");
    }
  };

  const cargarFacultades = async () => {
    try {
      const res = await axiosInstance.get("/facultades");
      setFacultades(res.data);
      if (res.data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          id_fac_per: getFacultyId(res.data[0]),
        }));
      }
    } catch (error) {
      console.error("Error al cargar facultades:", error);
      toast.error("Error al cargar las facultades");
    }
  };

  const cargarCoordinadores = async () => {
    try {
      const res = await axiosInstance.get("/coordinadores");
      setCoordinadores(res.data);
    } catch (error) {
      console.error("Error al cargar coordinadores:", error);
      toast.error("Error al cargar los coordinadores");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const crearCarrera = async () => {
    if (!formData.nom_car.trim())
      return toast.warning("El nombre es obligatorio");
    if (!formData.des_car.trim())
      return toast.warning("La descripción es obligatoria");
    if (!formData.dur_sem_car || isNaN(parseInt(formData.dur_sem_car)))
      return toast.warning("La duración debe ser un número válido");
    if (!formData.id_fac_per) return toast.warning("Seleccione una facultad");

    try {
      await carreraManager.crearCarrera(formData);
      toast.success("Carrera creada exitosamente");
      setFormData({
        nom_car: "",
        des_car: "",
        dur_sem_car: "",
        mod_car: "PRESENCIAL",
        ico_car: "laptop",
        id_fac_per: formData.id_fac_per,
        id_coo_per: "",
      });
      // No llamamos cargarCarreras() aquí porque el socket se encargará de la actualización
    } catch (error) {
      toast.error(
        "Error al crear carrera: " +
          (error.response?.data?.msg || error.message)
      );
    }
  };

  const confirmarDesactivar = (id, estaActiva) => {
    if (estaActiva) {
      setModalEliminar({ abierto: true, id });
    } else {
      activarCarrera(id);
    }
  };

  const confirmarEliminarPermanente = (id) => {
    setModalEliminarPermanente({ abierto: true, id });
  };

  const desactivarCarrera = async () => {
    const id = modalEliminar.id;
    try {
      await carreraManager.desactivarCarrera(id);
      toast.success("Carrera desactivada correctamente");
      // No llamamos cargarCarreras() aquí porque el socket se encargará de la actualización
    } catch (error) {
      console.error(error);
      toast.error("Error al desactivar la carrera");
    } finally {
      setModalEliminar({ abierto: false, id: null });
    }
  };

  const activarCarrera = async (id) => {
    try {
      await carreraManager.activarCarrera(id);
      toast.success("Carrera activada correctamente");
      // No llamamos cargarCarreras() aquí porque el socket se encargará de la actualización
    } catch (error) {
      console.error(error);
      toast.error("Error al activar la carrera");
    }
  };

  const eliminarCarreraPermanente = async () => {
    const id = modalEliminarPermanente.id;
    try {
      await carreraManager.eliminarCarreraPermanentemente(id);
      toast.success("Carrera eliminada permanentemente");
      // No llamamos cargarCarreras() aquí porque el socket se encargará de la actualización
    } catch (error) {
      console.error(error);
      if (error.response?.data?.msg) {
        toast.error(error.response.data.msg);
      } else {
        toast.error("Error al eliminar la carrera permanentemente");
      }
    } finally {
      setModalEliminarPermanente({ abierto: false, id: null });
    }
  };

  const iniciarEdicion = (carrera) => {
    try {
      // Validamos y verificamos los datos antes de asignarlos
      const duracionStr =
        carrera.dur_sem_car !== undefined && carrera.dur_sem_car !== null
          ? carrera.dur_sem_car.toString()
          : "";

      setEditFormData({
        nom_car: carrera.nom_car || "",
        des_car: carrera.des_car || "",
        dur_sem_car: duracionStr,
        mod_car: carrera.mod_car || "PRESENCIAL",
        ico_car: carrera.ico_car || "laptop",
        id_fac_per: carrera.id_fac_per || "",
        id_coo_per: carrera.id_coo_per || "",
      });

      setModalEdicion({
        abierto: true,
        carrera: carrera,
      });
    } catch (error) {
      console.error("Error al iniciar la edición:", error);
      toast.error("Error al abrir el formulario de edición");
    }
  };

  const actualizarCarrera = async (id) => {
    if (!editFormData.nom_car.trim())
      return toast.warning("El nombre no puede estar vacío");
    if (!editFormData.des_car.trim())
      return toast.warning("La descripción no puede estar vacía");
    if (!editFormData.dur_sem_car || isNaN(parseInt(editFormData.dur_sem_car)))
      return toast.warning("La duración debe ser un número válido");

    try {
      await carreraManager.actualizarCarrera(id, editFormData);
      toast.success("Carrera actualizada");
      setModalEdicion({ abierto: false, carrera: null });
      // No llamamos cargarCarreras() aquí porque el socket se encargará de la actualización
    } catch (error) {
      toast.error(
        `Error al actualizar carrera: ${
          error.response?.data?.msg || error.message
        }`
      );
    }
  };

  useEffect(() => {
    console.log(
      "🚀 [AdminCarreras] Componente montado, iniciando carga de datos"
    );
    cargarCarreras();
    cargarFacultades();
    cargarCoordinadores();
  }, []);

  // useEffect para manejar actualizaciones de socket en tiempo real
  useEffect(() => {
    if (carreraUpdates) {
      const { action, data } = carreraUpdates;
      const carreraNormalizada = normalizeCarrera(data);
      const carreraId = getCareerId(data);

      switch (action) {
        case "created":
          // Añadir nueva carrera a la lista
          setCarreras((prev) => {
            if (!carreraNormalizada) return prev;

            const yaExiste = prev.some(
              (carrera) => getCareerId(carrera) === carreraNormalizada.id_car
            );

            const nuevaLista = yaExiste
              ? prev.map((carrera) =>
                  getCareerId(carrera) === carreraNormalizada.id_car
                    ? { ...carrera, ...carreraNormalizada }
                    : carrera
                )
              : [...prev, carreraNormalizada];

            return nuevaLista;
          });
          break;

        case "updated":
          // Actualizar carrera existente (incluyendo cambios de estado activo/inactivo)
          setCarreras((prev) => {
            if (!carreraNormalizada) return prev;

            const nuevaLista = prev.map((carrera) =>
              getCareerId(carrera) === carreraNormalizada.id_car
                ? { ...carrera, ...carreraNormalizada }
                : carrera
            );

            return nuevaLista;
          });
          break;

        case "deleted":
          // Para compatibilidad hacia atrás
          setCarreras((prev) => {
            const nuevaLista = prev.map((carrera) =>
              getCareerId(carrera) === carreraId
                ? { ...carrera, est_car: false }
                : carrera
            );
            return nuevaLista;
          });
          break;

        case "permanentlyDeleted":
          // Eliminar carrera de la lista permanentemente
          setCarreras((prev) => {
            const nuevaLista = prev.filter(
              (carrera) => getCareerId(carrera) !== carreraId
            );
            return nuevaLista;
          });
          break;

        default:
          // Acción de carrera no reconocida
          break;
      }

      // Limpiar la actualización para evitar procesamientos duplicados
      clearCarreraUpdates();
    }
  }, [carreraUpdates, clearCarreraUpdates]);

  // Función para renderizar el icono según el valor
  const renderIcono = (iconoValue) => {
    const icon = iconOptions.find((opt) => opt.value === iconoValue);
    return icon ? icon.icon : <Laptop size={20} />;
  };

  return (
    <div className="admincarreras-container-ac">
      <h2 className="admincarreras-title-ac">Gestión de Carreras</h2>
      <button
        className="form-toggle-button-ac"
        onClick={() => setIsFormExpanded(!isFormExpanded)}
      >
        {isFormExpanded ? (
          <>
            <ChevronUp size={20} /> Ocultar formulario
          </>
        ) : (
          <>
            <Plus size={20} /> Crear nueva carrera
          </>
        )}
      </button>
      <div
        className={`admincarreras-form-ac ${
          isFormExpanded ? "expanded-ac" : ""
        }`}
      >
        <h3>Nueva Carrera</h3>
        <div className="form-group-ac">
          <label htmlFor="nom_car">Nombre:</label>
          <input
            type="text"
            id="nom_car"
            name="nom_car"
            placeholder="Nombre de la carrera"
            className="admincarreras-input-ac"
            value={formData.nom_car}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group-ac">
          <label htmlFor="des_car">Descripción:</label>
          <textarea
            id="des_car"
            name="des_car"
            placeholder="Descripción de la carrera"
            className="admincarreras-textarea-ac"
            value={formData.des_car}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group-ac">
          <label htmlFor="dur_sem_car">Duración (semestres):</label>
          <input
            type="number"
            id="dur_sem_car"
            name="dur_sem_car"
            placeholder="Semestres"
            className="admincarreras-input-ac"
            value={formData.dur_sem_car}
            onChange={handleInputChange}
            min="1"
          />
        </div>

        <div className="form-group-ac">
          <label htmlFor="mod_car">Modalidad:</label>
          <select
            id="mod_car"
            name="mod_car"
            className="admincarreras-select-ac"
            value={formData.mod_car}
            onChange={handleInputChange}
          >
            {modalidades.map((modalidad) => (
              <option key={modalidad} value={modalidad}>
                {modalidad}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row-ac">
          <div className="form-group-ac">
            <label htmlFor="ico_car">Icono:</label>
            <select
              id="ico_car"
              name="ico_car"
              className="admincarreras-select-ac"
              value={formData.ico_car}
              onChange={handleInputChange}
            >
              {iconOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group-ac">
            <label htmlFor="id_fac_per">Facultad:</label>
            <select
              id="id_fac_per"
              name="id_fac_per"
              className="admincarreras-select-ac"
              value={formData.id_fac_per}
              onChange={handleInputChange}
            >
              <option value="">Seleccione una facultad</option>
              {facultades.map((facultad, index) => {
                const facultyId = getFacultyId(facultad);
                return (
                <option key={facultyId || `faculty-${index}`} value={facultyId}>
                  {getFacultyName(facultad)}
                </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="form-group-ac">
          <label htmlFor="id_coo_per">Coordinador (opcional):</label>
          <select
            id="id_coo_per"
            name="id_coo_per"
            className="admincarreras-select-ac"
            value={formData.id_coo_per}
            onChange={handleInputChange}
          >
            <option value="">Sin coordinador asignado</option>
            {coordinadores.map((coordinador, index) => {
              const coordinatorId = getCoordinatorId(coordinador);
              return (
              <option key={coordinatorId || `coord-${index}`} value={coordinatorId}>
                {getCoordinatorName(coordinador)}
              </option>
              );
            })}
          </select>
        </div>

        <div className="crear-carrera-ac">
          <button onClick={crearCarrera} className="btn-crear-ad-ac">
            Crear Carrera
          </button>
        </div>
      </div>
      <h3 className="admincarreras-subtitle-ac">Carreras Existentes</h3>{" "}
      <div className="admincarreras-lista-container-ac">
        {carreras.length === 0 ? (
          <p className="no-carreras-ac">No hay carreras registradas</p>
        ) : (
          <ul className="admincarreras-lista-ac">
            {carreras.map((carrera) => (
              <li
                key={getCareerId(carrera) || carrera.nom_car}
                className="admincarreras-item-ac"
              >
                <div
                  className={`carrera-display-ac ${
                    !carrera.est_car ? "carrera-inactiva-ac" : ""
                  }`}
                >
                  <div className="carrera-header-ac">
                    <div className="carrera-icon-ac">
                      {renderIcono(carrera.ico_car)}
                    </div>
                    <h4 className="carrera-nombre-ac">{carrera.nom_car}</h4>
                    {!carrera.est_car && (
                      <span className="carrera-badge-inactiva-ac">
                        <AlertTriangle size={16} /> INACTIVA
                      </span>
                    )}
                  </div>

                  <p className="carrera-descripcion-ac">{carrera.des_car}</p>

                  <div className="carrera-detalles-duracion-ac">
                    <span>Duración: {carrera.dur_sem_car} semestres</span>
                  </div>

                  <div className="carrera-detalles-modalidad-ac">
                    <span>Modalidad: {carrera.mod_car}</span>
                  </div>

                  <div className="carrera-facultad-ac">
                    Facultad:{" "}
                    {getFacultyName(
                      facultades.find((f) => getFacultyId(f) === carrera.id_fac_per)
                    ) || "No asignada"}
                  </div>

                  <div className="carrera-coordinador-ac">
                    Coordinador:{" "}
                    {carrera.id_coo_per
                      ? getCoordinatorName(
                          coordinadores.find(
                            (c) => getCoordinatorId(c) === carrera.id_coo_per
                          )
                        )
                      : "No asignado"}
                  </div>

                  <div className="carrera-buttons-ac">
                    <button
                      onClick={() => iniciarEdicion(carrera)}
                      className="btn-editar-ac"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() =>
                        confirmarDesactivar(getCareerId(carrera), carrera.est_car)
                      }
                      className={
                        carrera.est_car ? "btn-desactivar-ac" : "btn-activar-ac"
                      }
                    >
                      {carrera.est_car ? (
                        <>
                          <XCircle size={16} /> Desactivar
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} /> Activar
                        </>
                      )}
                    </button>
                    <button
                      onClick={() =>
                        confirmarEliminarPermanente(getCareerId(carrera))
                      }
                      className="btn-eliminar-permanente-ac"
                    >
                      <Trash2 size={16} /> Eliminar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Modal de edición */}
      <Dialog
        open={modalEdicion.abierto}
        onClose={() => setModalEdicion({ abierto: false, carrera: null })}
        className="modal-container-ac"
      >
        <div className="modal-overlay-ac">
          <Dialog.Panel className="edicion-modal-content-ac">
            <Dialog.Title className="edicion-modal-title-ac">
              Editar Carrera
            </Dialog.Title>

            {modalEdicion.carrera && (
              <>
                <div className="form-group-ac">
                  <label>Nombre:</label>
                  <input
                    type="text"
                    name="nom_car"
                    value={editFormData.nom_car || ""}
                    onChange={handleEditInputChange}
                    className="admincarreras-input-ac"
                  />
                </div>

                <div className="form-group-ac">
                  <label>Descripción:</label>
                  <textarea
                    name="des_car"
                    value={editFormData.des_car || ""}
                    onChange={handleEditInputChange}
                    className="admincarreras-textarea-ac"
                  />
                </div>

                <div className="form-group-ac">
                  <label>Duración (semestres):</label>
                  <input
                    type="number"
                    name="dur_sem_car"
                    value={editFormData.dur_sem_car || ""}
                    onChange={handleEditInputChange}
                    className="admincarreras-input-ac"
                    min="1"
                  />
                </div>

                <div className="form-group-ac">
                  <label>Modalidad:</label>
                  <select
                    name="mod_car"
                    value={editFormData.mod_car || "PRESENCIAL"}
                    onChange={handleEditInputChange}
                    className="admincarreras-select-ac"
                  >
                    {modalidades.map((modalidad) => (
                      <option key={modalidad} value={modalidad}>
                        {modalidad}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row-ac">
                  <div className="form-group-ac">
                    <label>Icono:</label>
                    <select
                      name="ico_car"
                      value={editFormData.ico_car || "laptop"}
                      onChange={handleEditInputChange}
                      className="admincarreras-select-ac"
                    >
                      {iconOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group-ac">
                    <label>Facultad:</label>
                    <select
                      name="id_fac_per"
                      value={editFormData.id_fac_per || ""}
                      onChange={handleEditInputChange}
                      className="admincarreras-select-ac"
                    >
                      {facultades.map((facultad, index) => {
                        const facultyId = getFacultyId(facultad);
                        return (
                        <option key={facultyId || `faculty-edit-${index}`} value={facultyId}>
                          {getFacultyName(facultad)}
                        </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div className="form-group-ac">
                  <label>Coordinador:</label>
                  <select
                    name="id_coo_per"
                    value={editFormData.id_coo_per || ""}
                    onChange={handleEditInputChange}
                    className="admincarreras-select-ac"
                  >
                    <option value="">Sin coordinador asignado</option>
                    {coordinadores.map((coordinador, index) => {
                      const coordinatorId = getCoordinatorId(coordinador);
                      return (
                      <option
                        key={coordinatorId || `coord-edit-${index}`}
                        value={coordinatorId}
                      >
                        {getCoordinatorName(coordinador)}
                      </option>
                      );
                    })}
                  </select>
                </div>

                <div className="edicion-buttons-ac">
                  <button
                    onClick={() =>
                      actualizarCarrera(getCareerId(modalEdicion.carrera))
                    }
                    className="btn-guardar-ac"
                  >
                    Guardar Cambios
                  </button>
                  <button
                    onClick={() =>
                      setModalEdicion({ abierto: false, carrera: null })
                    }
                    className="btn-cancelar-ac"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
      {/* Modal de confirmación para desactivar */}
      {modalEliminar.abierto && (
        <Dialog
          open={modalEliminar.abierto}
          onClose={() => setModalEliminar({ abierto: false, id: null })}
          className="modal-container-ac"
        >
          <div className="modal-overlay-ac">
            <Dialog.Panel className="modal-content-ac">
              <Dialog.Title className="modal-title-ac">
                Confirmar desactivación
              </Dialog.Title>
              <p className="modal-message-ac">
                ¿Estás seguro de que deseas desactivar esta carrera? Esto la
                marcará como inactiva y no se mostrará en el Home.
              </p>
              <div className="modal-buttons-ac">
                <button
                  onClick={() => setModalEliminar({ abierto: false, id: null })}
                  className="btn-cancelar-ac"
                >
                  Cancelar
                </button>
                <button
                  onClick={desactivarCarrera}
                  className="btn-confirmar-ac"
                >
                  Confirmar
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
      {/* Modal de confirmación para eliminar permanentemente */}
      {modalEliminarPermanente.abierto && (
        <Dialog
          open={modalEliminarPermanente.abierto}
          onClose={() =>
            setModalEliminarPermanente({ abierto: false, id: null })
          }
          className="modal-container-ac"
        >
          <div className="modal-overlay-ac">
            <Dialog.Panel className="modal-content-ac">
              <Dialog.Title className="modal-title-eliminacion-ac">
                Confirmar eliminación permanente
              </Dialog.Title>
              <div className="modal-warning-ac">
                <AlertTriangle size={84} color="#dc2626" />
                <p className="modal-message-ac">
                  ¿Estás seguro de que deseas eliminar permanentemente esta
                  carrera? Esta acción no se puede deshacer y la carrera se
                  eliminará de la base de datos.
                </p>
                <AlertTriangle size={84} color="#dc2626" />
              </div>
              <div className="modal-buttons-ac">
                <button
                  onClick={() =>
                    setModalEliminarPermanente({ abierto: false, id: null })
                  }
                  className="btn-cancelar-ac"
                >
                  Cancelar
                </button>
                <button
                  onClick={eliminarCarreraPermanente}
                  className="btn-eliminar-confirmar-ac"
                >
                  Eliminar permanentemente
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default AdminCarreras;
