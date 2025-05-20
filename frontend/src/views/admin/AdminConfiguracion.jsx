import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AdminConfiguracion = () => {
  const [form, setForm] = useState({ mision: "", vision: "", autoridades: "" });

  const cargar = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/configuracion");
      if (res.data) setForm(res.data);
    } catch {
      toast.error("Error al cargar configuración");
    }
  };

  const guardar = async () => {
    try {
      await axios.put("http://localhost:3000/api/configuracion", form);
      toast.success("Configuración actualizada");
    } catch {
      toast.error("Error al guardar configuración");
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Misión, Visión y Autoridades</h2>

      <label className="block mb-2 font-semibold">Misión</label>
      <textarea
        rows={4}
        className="w-full border p-2 mb-4"
        value={form.mision}
        onChange={(e) => setForm({ ...form, mision: e.target.value })}
      />

      <label className="block mb-2 font-semibold">Visión</label>
      <textarea
        rows={4}
        className="w-full border p-2 mb-4"
        value={form.vision}
        onChange={(e) => setForm({ ...form, vision: e.target.value })}
      />

      <label className="block mb-2 font-semibold">Autoridades</label>
      <textarea
        rows={4}
        className="w-full border p-2 mb-4"
        value={form.autoridades}
        onChange={(e) => setForm({ ...form, autoridades: e.target.value })}
      />

      <button
        onClick={guardar}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Guardar
      </button>
    </div>
  );
};

export default AdminConfiguracion;
