import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AdminCarreras = () => {
  const [carreras, setCarreras] = useState([]);
  const [nuevaCarrera, setNuevaCarrera] = useState("");

  const cargarCarreras = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/carreras");
      setCarreras(res.data);
    } catch (error) {
      toast.error("Error al cargar las carreras");
    }
  };

  // Función para crear una nueva carrera
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

  // Función para eliminar una carrera
  const eliminarCarrera = async (id) => {
    if (!window.confirm("¿Seguro de eliminar esta carrera?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/carreras/${id}`);
      toast.success("Carrera eliminada");
      cargarCarreras();
    } catch (error) {
      toast.error("Error al eliminar carrera");
    }
  };

  // Función para actualizar el nombre de una carrera
  const actualizarCarrera = async (id, nuevoNombre) => {
    if (!nuevoNombre || !nuevoNombre.trim())
      return toast.warning("El nombre no puede estar vacío");
    try {
      await axios.put(`http://localhost:3000/api/carreras/${id}`, {
        nom_car: nuevoNombre.trim(),
      });
      toast.success("Carrera actualizada");
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
            <input
              type="text"
              value={carrera.nomEditable || carrera.nom_car}
              onChange={(e) => {
                setCarreras((prev) =>
                  prev.map((c) =>
                    c.id_car === carrera.id_car
                      ? { ...c, nomEditable: e.target.value }
                      : c
                  )
                );
              }}
              className="border p-1 flex-1"
            />
            <button
              onClick={() =>
                actualizarCarrera(carrera.id_car, carrera.nomEditable)
              }
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Guardar
            </button>
            <button
              onClick={() => eliminarCarrera(carrera.id_car)}
              className="text-red-600 hover:underline"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminCarreras;
