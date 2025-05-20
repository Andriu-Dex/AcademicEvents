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
            className="border p-2 flex justify-between items-center"
          >
            <span>{carrera.nom_car}</span>
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
