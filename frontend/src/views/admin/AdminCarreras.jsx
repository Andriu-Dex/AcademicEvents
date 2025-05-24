import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Dialog } from "@headlessui/react";
import "../styles/AdminCarreras.css"; 

const AdminCarreras = () => {
  const [carreras, setCarreras] = useState([]);
  const [nuevaCarrera, setNuevaCarrera] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [nombresEditables, setNombresEditables] = useState({});
  const [modalEliminar, setModalEliminar] = useState({
    abierto: false,
    id: null,
  });

  const cargarCarreras = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/carreras`);
      setCarreras(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar las carreras");
    }
  };

  const crearCarrera = async () => {
    if (!nuevaCarrera.trim()) return toast.warning("Nombre vacío");
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/carreras`, {
        nom_car: nuevaCarrera.trim(),
      });
      toast.success("Carrera creada");
      setNuevaCarrera("");
      cargarCarreras();
    } catch (error) {
      console.error(error);
      toast.error("Error al crear carrera");
    }
  };

  const confirmarEliminar = (id) => {
    setModalEliminar({ abierto: true, id });
  };

  const eliminarCarrera = async () => {
    const id = modalEliminar.id;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/carreras/${id}`);
      toast.success("Carrera eliminada");
      cargarCarreras();
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar carrera");
    } finally {
      setModalEliminar({ abierto: false, id: null });
    }
  };

  const actualizarCarrera = async (id) => {
    const nuevoNombre = nombresEditables[id];
    if (!nuevoNombre || !nuevoNombre.trim()) {
      return toast.warning("El nombre no puede estar vacío");
    }
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/carreras/${id}`, {
        nom_car: nuevoNombre.trim(),
      });
      toast.success("Carrera actualizada");
      setEditandoId(null);
      setNombresEditables((prev) => {
        const actualizado = { ...prev };
        delete actualizado[id];
        return actualizado;
      });
      cargarCarreras();
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar carrera");
    }
  };

  useEffect(() => {
    cargarCarreras();
  }, []);

  return (
    <div className="admincarreras-container">
      <h2 className="admincarreras-title">Gestión de Carreras</h2>

      <div className="admincarreras-input-group">
        <input
          type="text"
          placeholder="Nueva carrera"
          className="admincarreras-input"
          value={nuevaCarrera}
          onChange={(e) => setNuevaCarrera(e.target.value)}
        />
        <button onClick={crearCarrera} className="btn-crear">Crear</button>
      </div>

      <ul className="admincarreras-lista">
        {carreras.map((carrera) => (
          <li key={carrera.id_car} className="admincarreras-item">
            {editandoId === carrera.id_car ? (
              <input
                type="text"
                value={nombresEditables[carrera.id_car] || ""}
                onChange={(e) =>
                  setNombresEditables((prev) => ({
                    ...prev,
                    [carrera.id_car]: e.target.value,
                  }))
                }
                className="admincarreras-input"
              />
            ) : (
              <span className="admincarreras-nombre">{carrera.nom_car}</span>
            )}

            {editandoId === carrera.id_car ? (
              <>
                <button onClick={() => actualizarCarrera(carrera.id_car)} className="btn-guardar">Guardar</button>
                <button onClick={() => setEditandoId(null)} className="btn-cancelar">Cancelar</button>
              </>
            ) : (
              <button
                onClick={() => {
                  setEditandoId(carrera.id_car);
                  setNombresEditables((prev) => ({
                    ...prev,
                    [carrera.id_car]: carrera.nom_car,
                  }));
                }}
                className="btn-editar"
              >
                Editar
              </button>
            )}

            <button onClick={() => confirmarEliminar(carrera.id_car)} className="btn-eliminar">
              Eliminar
            </button>
          </li>
        ))}
      </ul>

      <Dialog
        open={modalEliminar.abierto}
        onClose={() => setModalEliminar({ abierto: false, id: null })}
        className="admincarreras-modal-container"
      >
        <div className="admincarreras-modal-overlay" aria-hidden="true" />
        <div className="admincarreras-modal-content">
          <Dialog.Title className="admincarreras-modal-title">Confirmar eliminación</Dialog.Title>
          <p className="admincarreras-modal-text">
            ¿Estás seguro de que deseas eliminar esta carrera? Esta acción no se puede deshacer.
          </p>
          <div className="admincarreras-modal-buttons">
            <button onClick={() => setModalEliminar({ abierto: false, id: null })} className="btn-cancelar">
              Cancelar
            </button>
            <button onClick={eliminarCarrera} className="btn-eliminar">
              Eliminar
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default AdminCarreras;
