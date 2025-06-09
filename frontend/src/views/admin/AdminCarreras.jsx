import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosConfig";
import { toast } from "react-toastify";
import { Dialog } from "@headlessui/react";
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
} from "lucide-react";

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
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [modalEdicion, setModalEdicion] = useState({
    abierto: false,
    carrera: null,
  });

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
  const cargarCarreras = async () => {
    try {
      const res = await axiosInstance.get("/carreras");
      // Asegúrate de que cada carrera tenga todos los campos necesarios
      const carrerasConValidacion = res.data.map((carrera) => ({
        ...carrera,
        dur_sem_car: carrera.dur_sem_car || 0, // Proporciona un valor predeterminado si es nulo o indefinido
      }));
      setCarreras(carrerasConValidacion);
    } catch (error) {
      console.error("Error al cargar carreras:", error);
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
          id_fac_per: res.data[0].id_fac,
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

      await axiosInstance.post("/carreras", {
        ...formData,
        dur_sem_car: parseInt(formData.dur_sem_car),
      });

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
      cargarCarreras();
    } catch (error) {
      console.error("Error al crear carrera:", error);
      toast.error(
        "Error al crear carrera: " +
          (error.response?.data?.msg || error.message)
      );
    }
  };

  const confirmarEliminar = (id) => {
    setModalEliminar({ abierto: true, id });
  };

  const eliminarCarrera = async () => {
    const id = modalEliminar.id;
    try {
      await axiosInstance.delete(`/carreras/${id}`);
      toast.success("Carrera desactivada correctamente");
      cargarCarreras();
    } catch (error) {
      console.error(error);
      toast.error("Error al desactivar la carrera");
    } finally {
      setModalEliminar({ abierto: false, id: null });
    }
  };
  const iniciarEdicion = (carrera) => {
    console.log(
      "Duración de la carrera:",
      carrera.dur_sem_car,
      "Tipo:",
      typeof carrera.dur_sem_car
    );

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

      console.log("Modal de edición debería estar abierto ahora:", {
        abierto: true,
        carrera,
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
      console.log("Enviando datos de actualización:", {
        ...editFormData,
        dur_sem_car: parseInt(editFormData.dur_sem_car),
      });

      const response = await axiosInstance.put(`/carreras/${id}`, {
        ...editFormData,
        dur_sem_car: parseInt(editFormData.dur_sem_car),
      });

      toast.success("Carrera actualizada");
      setModalEdicion({ abierto: false, carrera: null });
      cargarCarreras();
    } catch (error) {
      console.error(
        "Error detallado al actualizar carrera:",
        error.response?.data || error
      );
      toast.error(
        `Error al actualizar carrera: ${
          error.response?.data?.msg || error.message
        }`
      );
    }
  };

  useEffect(() => {
    cargarCarreras();
    cargarFacultades();
    cargarCoordinadores();
  }, []);

  // Función para renderizar el icono según el valor
  const renderIcono = (iconoValue) => {
    const icon = iconOptions.find((opt) => opt.value === iconoValue);
    return icon ? icon.icon : <Laptop size={20} />;
  };

  return (
    <div className="admincarreras-container">
      <h2 className="admincarreras-title">Gestión de Carreras</h2>
      <button
        className="form-toggle-button"
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
      <div className={`admincarreras-form ${isFormExpanded ? "expanded" : ""}`}>
        <h3>Nueva Carrera</h3>
        <div className="form-group">
          <label htmlFor="nom_car">Nombre:</label>
          <input
            type="text"
            id="nom_car"
            name="nom_car"
            placeholder="Nombre de la carrera"
            className="admincarreras-input"
            value={formData.nom_car}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="des_car">Descripción:</label>
          <textarea
            id="des_car"
            name="des_car"
            placeholder="Descripción de la carrera"
            className="admincarreras-textarea"
            value={formData.des_car}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="dur_sem_car">Duración (semestres):</label>
          <input
            type="number"
            id="dur_sem_car"
            name="dur_sem_car"
            placeholder="Semestres"
            className="admincarreras-input"
            value={formData.dur_sem_car}
            onChange={handleInputChange}
            min="1"
          />
        </div>

        <div className="form-group">
          <label htmlFor="mod_car">Modalidad:</label>
          <select
            id="mod_car"
            name="mod_car"
            className="admincarreras-select"
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

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="ico_car">Icono:</label>
            <select
              id="ico_car"
              name="ico_car"
              className="admincarreras-select"
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

          <div className="form-group">
            <label htmlFor="id_fac_per">Facultad:</label>
            <select
              id="id_fac_per"
              name="id_fac_per"
              className="admincarreras-select"
              value={formData.id_fac_per}
              onChange={handleInputChange}
            >
              <option value="">Seleccione una facultad</option>
              {facultades.map((facultad) => (
                <option key={facultad.id_fac} value={facultad.id_fac}>
                  {facultad.nom_fac}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="id_coo_per">Coordinador (opcional):</label>
          <select
            id="id_coo_per"
            name="id_coo_per"
            className="admincarreras-select"
            value={formData.id_coo_per}
            onChange={handleInputChange}
          >
            <option value="">Sin coordinador asignado</option>
            {coordinadores.map((coordinador) => (
              <option key={coordinador.id_coo} value={coordinador.id_coo}>
                {coordinador.nom_coo} {coordinador.ape_coo}
              </option>
            ))}
          </select>
        </div>

        <div className="crear-carrera">
          <button onClick={crearCarrera} className="btn-crear-ad">
            Crear Carrera
          </button>
        </div>
      </div>
      <h3 className="admincarreras-subtitle">Carreras Existentes</h3>{" "}
      <div className="admincarreras-lista-container">
        {carreras.length === 0 ? (
          <p className="no-carreras">No hay carreras registradas</p>
        ) : (
          <ul className="admincarreras-lista">
            {carreras.map((carrera) => (
              <li key={carrera.id_car} className="admincarreras-item">
                <div className="carrera-display">
                  <div className="carrera-header">
                    <div className="carrera-icon">
                      {renderIcono(carrera.ico_car)}
                    </div>
                    <h4 className="carrera-nombre">{carrera.nom_car}</h4>
                  </div>

                  <p className="carrera-descripcion">{carrera.des_car}</p>

                  <div className="carrera-detalles-duracion">
                    <span>Duración: {carrera.dur_sem_car} semestres</span>
                  </div>

                  <div className="carrera-detalles-modalidad">
                    <span>Modalidad: {carrera.mod_car}</span>
                  </div>

                  <div className="carrera-facultad">
                    Facultad:{" "}
                    {facultades.find((f) => f.id_fac === carrera.id_fac_per)
                      ?.nom_fac || "No asignada"}
                  </div>

                  <div className="carrera-coordinador">
                    Coordinador:{" "}
                    {carrera.id_coo_per
                      ? coordinadores.find(
                          (c) => c.id_coo === carrera.id_coo_per
                        )?.nom_coo +
                        " " +
                        coordinadores.find(
                          (c) => c.id_coo === carrera.id_coo_per
                        )?.ape_coo
                      : "No asignado"}
                  </div>

                  <div className="carrera-buttons">
                    <button
                      onClick={() => iniciarEdicion(carrera)}
                      className="btn-editar"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => confirmarEliminar(carrera.id_car)}
                      className="btn-eliminar"
                    >
                      Desactivar
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
        className="modal-container"
      >
        <div className="modal-overlay">
          <Dialog.Panel className="edicion-modal-content">
            <Dialog.Title className="edicion-modal-title">
              Editar Carrera
            </Dialog.Title>

            {modalEdicion.carrera && (
              <>
                <div className="form-group">
                  <label>Nombre:</label>
                  <input
                    type="text"
                    name="nom_car"
                    value={editFormData.nom_car || ""}
                    onChange={handleEditInputChange}
                    className="admincarreras-input"
                  />
                </div>

                <div className="form-group">
                  <label>Descripción:</label>
                  <textarea
                    name="des_car"
                    value={editFormData.des_car || ""}
                    onChange={handleEditInputChange}
                    className="admincarreras-textarea"
                  />
                </div>

                <div className="form-group">
                  <label>Duración (semestres):</label>
                  <input
                    type="number"
                    name="dur_sem_car"
                    value={editFormData.dur_sem_car || ""}
                    onChange={handleEditInputChange}
                    className="admincarreras-input"
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label>Modalidad:</label>
                  <select
                    name="mod_car"
                    value={editFormData.mod_car || "PRESENCIAL"}
                    onChange={handleEditInputChange}
                    className="admincarreras-select"
                  >
                    {modalidades.map((modalidad) => (
                      <option key={modalidad} value={modalidad}>
                        {modalidad}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Icono:</label>
                    <select
                      name="ico_car"
                      value={editFormData.ico_car || "laptop"}
                      onChange={handleEditInputChange}
                      className="admincarreras-select"
                    >
                      {iconOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Facultad:</label>
                    <select
                      name="id_fac_per"
                      value={editFormData.id_fac_per || ""}
                      onChange={handleEditInputChange}
                      className="admincarreras-select"
                    >
                      {facultades.map((facultad) => (
                        <option key={facultad.id_fac} value={facultad.id_fac}>
                          {facultad.nom_fac}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Coordinador:</label>
                  <select
                    name="id_coo_per"
                    value={editFormData.id_coo_per || ""}
                    onChange={handleEditInputChange}
                    className="admincarreras-select"
                  >
                    <option value="">Sin coordinador asignado</option>
                    {coordinadores.map((coordinador) => (
                      <option
                        key={coordinador.id_coo}
                        value={coordinador.id_coo}
                      >
                        {coordinador.nom_coo} {coordinador.ape_coo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="edicion-buttons">
                  <button
                    onClick={() =>
                      actualizarCarrera(modalEdicion.carrera.id_car)
                    }
                    className="btn-guardar"
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
      {/* Modal de confirmación para eliminar */}
      {modalEliminar.abierto && (
        <Dialog
          open={modalEliminar.abierto}
          onClose={() => setModalEliminar({ abierto: false, id: null })}
          className="modal-container"
        >
          <div className="modal-overlay">
            <Dialog.Panel className="modal-content">
              <Dialog.Title className="modal-title">
                Confirmar desactivación
              </Dialog.Title>
              <p className="modal-message">
                ¿Estás seguro de que deseas desactivar esta carrera? Esto no
                eliminará la carrera permanentemente, solo la marcará como
                inactiva.
              </p>
              <div className="modal-buttons">
                <button
                  onClick={() => setModalEliminar({ abierto: false, id: null })}
                  className="btn-cancelar"
                >
                  Cancelar
                </button>
                <button onClick={eliminarCarrera} className="btn-confirmar">
                  Confirmar
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
