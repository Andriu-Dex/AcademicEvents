import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/AdminConfiguracion.css";

const AdminConfiguracion = () => {
  const [form, setForm] = useState({ mision: "", vision: "", autoridades: "" });

  const cargar = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/configuracion`);
      if (res.data) setForm(res.data);
    } catch {
      toast.error("Error al cargar configuración");
    }
  };

  const guardar = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/configuracion`, form);
      toast.success("Configuración actualizada");
    } catch {
      toast.error("Error al guardar configuración");
    }
  };

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
