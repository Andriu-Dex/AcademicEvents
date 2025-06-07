import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosConfig"; // Asegúrate de que axiosInstance esté configurado correctamente
import { toast } from "react-toastify";
import "./styles/AdminConfiguracion.css";

const AdminConfiguracion = () => {
  // Estado para almacenar la misión y visión
  const [form, setForm] = useState({ mision: "", vision: "", autoridades: "" });

  // Función para cargar misión y visión de la facultad desde el backend
  const cargar = async () => {
    try {
      // Cambiar la ruta de la API para que apunte a la facultad y recupere misión y visión
      const res = await axiosInstance.get(`/facultades/1`); // 1 es el ID de la facultad, puedes cambiarlo dinámicamente si es necesario
      if (res.data) {
        // Asignamos los datos recibidos a nuestro estado
        setForm({
          mision: res.data.mis_fac,
          vision: res.data.vis_fac,
          autoridades: res.data.nom_dec_fac, // Cambiar según los datos que necesites (decano, subdecano, etc.)
        });
      }
    } catch (error) {
      toast.error("Error al cargar configuración");
    }
  };

  // Función para guardar los cambios en misión, visión y autoridades
  const guardar = async () => {
    try {
      // Realizamos la actualización de misión y visión en la facultad
      await axiosInstance.put(`/facultades/1`, { // Aquí usamos PUT para actualizar misión y visión
        mis_fac: form.mision,
        vis_fac: form.vision,
        // Asegúrate de pasar las autoridades si es necesario, por ejemplo, autoridades: form.autoridades
      });
      toast.success("Configuración actualizada");
    } catch (error) {
      toast.error("Error al guardar configuración");
    }
  };

  // Cargar la configuración al montar el componente
  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="adminconfig-container">
      <h2 className="adminconfig-title">Misión, Visión y Autoridades</h2>

      <label className="adminconfig-label">Misión</label>
      <textarea
        rows={4}
        className="adminconfig-textarea"
        value={form.mision}
        onChange={(e) => setForm({ ...form, mision: e.target.value })}
      />

      <label className="adminconfig-label">Visión</label>
      <textarea
        rows={4}
        className="adminconfig-textarea"
        value={form.vision}
        onChange={(e) => setForm({ ...form, vision: e.target.value })}
      />

      <label className="adminconfig-label">Autoridades</label>
      <textarea
        rows={4}
        className="adminconfig-textarea"
        value={form.autoridades}
        onChange={(e) => setForm({ ...form, autoridades: e.target.value })}
      />

      <button onClick={guardar} className="adminconfig-btn">
        Guardar
      </button>
    </div>
  );
};

export default AdminConfiguracion;
