import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Dialog } from "@headlessui/react";

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
      const res = await axios.get("http://localhost:3000/api/carreras");
      setCarreras(res.data);
    } catch (error) {
      toast.error("Error al cargar las carreras");
    }
  };

  const crearCarrera = async () => {
    if (!nuevaCarrera.trim()) return toast.warning("Nombre vacío");
    try {
      await axios.post("http://localhost:3000/api/carreras", {
        nom_car: nuevaCarrera.trim(),
      });
      toast.success("Carrera creada");
      setNuevaCarrera("");
      cargarCarreras();
    } catch (error) {
      toast.error("Error al crear carrera");
    }
  };

  const confirmarEliminar = (id) => {
    setModalEliminar({ abierto: true, id });
  };

  const eliminarCarrera = async () => {
    const id = modalEliminar.id;
    try {
      await axios.delete(`http://localhost:3000/api/carreras/${id}`);
      toast.success("Carrera eliminada");
      cargarCarreras();
    } catch (error) {
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
      await axios.put(`http://localhost:3000/api/carreras/${id}`, {
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
      toast.error("Error al actualizar carrera");
    }
  };

  useEffect(() => {
    cargarCarreras();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Gestión de Carreras</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Nueva carrera"
          className="border p-2 flex-1"
          value={nuevaCarrera}
          onChange={(e) => setNuevaCarrera(e.target.value)}
        />
        <button
          onClick={crearCarrera}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Crear
        </button>
      </div>

      <ul className="space-y-2">
        {carreras.map((carrera) => (
          <li
            key={carrera.id_car}
            className="border p-2 flex justify-between items-center gap-2"
          >
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
                className="border p-1 flex-1"
              />
            ) : (
              <span className="flex-1">{carrera.nom_car}</span>
            )}

            {editandoId === carrera.id_car ? (
              <>
                <button
                  onClick={() => actualizarCarrera(carrera.id_car)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setEditandoId(null)}
                  className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                >
                  Cancelar
                </button>
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
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Editar
              </button>
            )}

            <button
              onClick={() => confirmarEliminar(carrera.id_car)}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>

      {/* Modal de confirmación */}
      <Dialog
        open={modalEliminar.abierto}
        onClose={() => setModalEliminar({ abierto: false, id: null })}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div
          className="fixed inset-0 bg-black bg-opacity-30"
          aria-hidden="true"
        />

        <div className="relative bg-white rounded-lg shadow p-6 z-50 w-full max-w-sm mx-auto">
          <Dialog.Title className="text-lg font-bold text-gray-800 mb-4">
            Confirmar eliminación
          </Dialog.Title>
          <p className="text-sm text-gray-600 mb-6">
            ¿Estás seguro de que deseas eliminar esta carrera? Esta acción no se
            puede deshacer.
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setModalEliminar({ abierto: false, id: null })}
              className="px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              onClick={eliminarCarrera}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default AdminCarreras;
//Andriu Dex
