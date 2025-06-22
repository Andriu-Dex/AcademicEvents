import { useEffect, useState } from "react";
import axiosInstance from "../../../api/axiosConfig";
import "./styles/AdminReporteMes.css";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const obtenerAnioActual = () => new Date().getFullYear();

const AdminReporteMes = () => {
  const [mes, setMes] = useState(new Date().getMonth() + 1); // JS: 0=Enero, 1=Febrero...
  const [anio, setAnio] = useState(obtenerAnioActual());
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tot_tod_eve, setTotTodEve] = useState(0);

  // Generar un rango de años (por ejemplo 2022 al año actual + 2)
  const anios = [];
  for (let y = obtenerAnioActual() - 3; y <= obtenerAnioActual() + 2; y++) {
    anios.push(y);
  }

  const descargarPDFMensual = async () => {
    try {
      // Cambia el cursor y deshabilita el botón mientras descarga
      setLoading(true);
      document.body.style.cursor = "wait";

      // Petición al endpoint del PDF (ajusta la URL si tu ruta es diferente)
      const res = await axiosInstance.post(
        "/admin/reportes-mes/pdf",
        { anio, mes },
        { responseType: "blob" }
      );

      // Usa el nombre personalizado (ejemplo: "Reporte_Mensual_Junio_2025.pdf")
      const nombreArchivo = `Reporte_Mensual_${MESES[mes - 1]}_${anio}.pdf`;

      // Descargar el blob como archivo
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", nombreArchivo);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("No se pudo descargar el PDF.");
      console.error(err);
    } finally {
      setLoading(false);
      document.body.style.cursor = "default";
    }
  };

  const cargarReporte = async (anioSel, mesSel) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/admin/reportes-mes", {
        anio: anioSel,
        mes: mesSel,
      });
      setEventos(res.data.eve || []);
      setTotTodEve(res.data.tot_tod_eve ?? 0);
    } catch (err) {
      setEventos([]);
      setTotTodEve(0);
    } finally {
      setLoading(false);
    }
  };

  // Llamar al backend cada vez que mes o año cambian
  useEffect(() => {
    cargarReporte(anio, mes);
  }, [anio, mes]);

  return (
    <div className="reporte-mes-container">
      <h2
        style={{ color: "#8a1538", textAlign: "center", marginBottom: "1rem" }}
      >
        Reporte Mensual de Eventos
      </h2>
      <div
        className="reporte-mes-filtros"
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          marginBottom: "2rem",
        }}
      >
        <select value={mes} onChange={(e) => setMes(Number(e.target.value))}>
          {MESES.map((m, idx) => (
            <option key={idx + 1} value={idx + 1}>
              {m}
            </option>
          ))}
        </select>
        <select value={anio} onChange={(e) => setAnio(Number(e.target.value))}>
          {anios.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <div style={{ textAlign: "center" }}>Cargando reporte...</div>
      ) : (
        <>
          <table
            className="reporte-mes-table"
            style={{
              width: "100%",
              background: "#fff",
              borderRadius: "10px",
              boxShadow: "0 2px 8px #0001",
              marginBottom: "1.5rem",
            }}
          >
            <thead>
              <tr style={{ background: "#f5e9ec", color: "#8a1538" }}>
                <th>#</th>
                <th>Nombre del Evento</th>
                <th>Valor ($)</th>
                <th>Tipo</th>
                <th>Fecha Fin</th>
                <th>Inscritos</th>
                <th>Creador</th>
                <th>Total Evento ($)</th>
              </tr>
            </thead>
            <tbody>
              {eventos.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center" }}>
                    No hay eventos para este mes y año.
                  </td>
                </tr>
              ) : (
                eventos.map((ev, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{ev.nom_eve}</td>
                    <td>{ev.val_eve}</td>
                    <td>{ev.tip_eve}</td>
                    <td>{ev.fec_fin_eve?.split("T")[0]}</td>
                    <td>{ev.can_ins}</td>
                    <td>{`${ev.nom_cre} ${ev.ape_cre}`}</td>
                    <td>{ev.tot_eve}</td>
                  </tr>
                ))
              )}
            </tbody>
            {eventos.length > 0 && (
              <tfoot>
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: "right", fontWeight: "bold" }}
                  >
                    Total del mes:
                  </td>
                  <td style={{ fontWeight: "bold" }}>{tot_tod_eve}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </>
      )}
      {eventos.length > 0 && (
        <button
          className="reporte-btn-descargar"
          onClick={descargarPDFMensual}
          disabled={loading}
          style={{
            opacity: loading ? 0.7 : 1,
            pointerEvents: loading ? "none" : "auto",
          }}
        >
          {loading ? "Generando PDF..." : "Descargar Reporte PDF"}
        </button>
      )}
    </div>
  );
};

export default AdminReporteMes;
