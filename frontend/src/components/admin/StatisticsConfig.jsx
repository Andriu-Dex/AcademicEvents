import { useState, useEffect } from "react";
import {
  InfoIcon,
  AlertTriangle,
  GraduationCap,
  Calendar,
  Users,
  TrendingUp,
  CalendarX,
  CalendarCheck,
  Award,
  ClipboardCheck,
  UserPlus,
  MapPin,
  Laptop,
  Star,
  CheckCircle,
  Save,
} from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../../api/axiosConfig";
import {
  AVAILABLE_STATISTICS,
  MAX_STATISTICS,
  DEFAULT_ACTIVE_STATISTICS,
} from "../../utils/statistics";
import "../../views/admin/styles/StatisticsConfig.css";

/**
 * Componente para configurar las estadísticas que se muestran en el Home
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.loading - Estado de carga
 * @param {Function} props.onSave - Función a ejecutar cuando se guardan los cambios
 * @param {Function} props.onStatsUpdate - Función para actualizar estadísticas en tiempo real
 * @returns {JSX.Element} Componente de configuración de estadísticas
 */
const StatisticsConfig = ({ loading, onSave, onStatsUpdate }) => {
  // Estado para almacenar las estadísticas seleccionadas
  const [selectedStats, setSelectedStats] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  // Cargar configuración de estadísticas al iniciar
  useEffect(() => {
    const loadStatisticsConfig = async () => {
      try {
        setLoadingStats(true);

        // Cargar configuración desde localStorage
        const savedConfig = localStorage.getItem("activeStatistics");
        if (savedConfig) {
          try {
            const parsedConfig = JSON.parse(savedConfig);
            setSelectedStats(parsedConfig);
          } catch (e) {
            console.error("Error parsing saved config:", e);
            setSelectedStats(DEFAULT_ACTIVE_STATISTICS);
          }
        } else {
          setSelectedStats(DEFAULT_ACTIVE_STATISTICS);
        }

        // Por ahora, usamos localStorage mientras se implementa el backend
        // Cuando se implemente el backend, obtener de la API
        // const response = await axiosInstance.get("/estadisticas/configuracion");
        // setSelectedStats(response.data.activeStatistics || DEFAULT_ACTIVE_STATISTICS);
      } catch (error) {
        console.error("Error al cargar configuración de estadísticas:", error);
        toast.error("No se pudo cargar la configuración de estadísticas");
        // En caso de error, usar valores por defecto
        setSelectedStats(DEFAULT_ACTIVE_STATISTICS);
      } finally {
        setLoadingStats(false);
      }
    };

    loadStatisticsConfig();
  }, []); // Manejar cambio de selección de estadística
  const handleStatisticToggle = (statId) => {
    setSelectedStats((prev) => {
      let newStats;

      // Si ya está seleccionada, removerla
      if (prev.includes(statId)) {
        newStats = prev.filter((id) => id !== statId);
      } else {
        // Si ya hay MAX_STATISTICS seleccionadas, mostrar error
        if (prev.length >= MAX_STATISTICS) {
          toast.warning(
            `Solo puedes seleccionar hasta ${MAX_STATISTICS} estadísticas`
          );
          return prev;
        }

        // Añadir la estadística
        newStats = [...prev, statId];
      }

      // Actualizar en tiempo real tanto el localStorage como notificar al Home
      localStorage.setItem("activeStatistics", JSON.stringify(newStats));

      // Actualizar las estadísticas en tiempo real si se proporciona la función
      if (onStatsUpdate) {
        onStatsUpdate(newStats);
      }

      return newStats;
    });
  };
  // Guardar configuración
  const saveStatisticsConfig = async () => {
    try {
      setLoadingStats(true);
      setSaveSuccess(false);

      // Actualizar en tiempo real tanto el localStorage como notificar al Home
      localStorage.setItem("activeStatistics", JSON.stringify(selectedStats));

      // Por ahora, solo actualizar el estado y simular guardado
      // Cuando se implemente el backend, enviar a la API:
      // await axiosInstance.post("/estadisticas/configuracion", {
      //   activeStatistics: selectedStats
      // });

      toast.success("Configuración de estadísticas guardada correctamente");
      setSaveSuccess(true);

      // Notificar al componente padre
      if (onSave) {
        onSave(selectedStats);
      }

      // Actualizar las estadísticas en tiempo real
      if (onStatsUpdate) {
        onStatsUpdate(selectedStats);
      }

      // Resetear estado de éxito después de un tiempo
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error al guardar configuración de estadísticas:", error);
      toast.error("No se pudo guardar la configuración de estadísticas");
    } finally {
      setLoadingStats(false);
    }
  };

  // Obtener el componente de icono según el nombre
  const getIconComponent = (iconName, size = 20) => {
    const icons = {
      GraduationCap: <GraduationCap size={size} />,
      Calendar: <Calendar size={size} />,
      Users: <Users size={size} />,
      TrendingUp: <TrendingUp size={size} />,
      CalendarX: <CalendarX size={size} />,
      CalendarCheck: <CalendarCheck size={size} />,
      Award: <Award size={size} />,
      ClipboardCheck: <ClipboardCheck size={size} />,
      UserPlus: <UserPlus size={size} />,
      MapPin: <MapPin size={size} />,
      Laptop: <Laptop size={size} />,
      Star: <Star size={size} />,
    };

    return icons[iconName] || <InfoIcon size={size} />;
  };

  return (
    <div className="statistics-section-acmva">
      <h3 className="statistics-title-acmva">
        Configuración de Estadísticas del Home
      </h3>
      <p className="statistics-description-acmva">
        Selecciona hasta {MAX_STATISTICS} estadísticas para mostrar en la página
        principal. Estas estadísticas serán visibles para todos los usuarios en
        la parte superior del Home.
      </p>

      <div className="statistics-info-acmva">
        <InfoIcon size={20} />
        <span>
          Las estadísticas son calculadas en tiempo real y se actualizan
          automáticamente.
        </span>
      </div>

      {selectedStats.length === 0 && (
        <div className="statistics-warning-acmva">
          <AlertTriangle size={20} />
          <span>
            No has seleccionado ninguna estadística. Se mostrarán las
            estadísticas por defecto.
          </span>
        </div>
      )}

      <div className="statistics-count-acmva">
        Estadísticas seleccionadas:
        <span className="statistics-count-badge-acmva">
          {selectedStats.length}/{MAX_STATISTICS}
        </span>
      </div>

      <div className="statistics-container-acmva">
        {AVAILABLE_STATISTICS.map((stat) => (
          <div
            key={stat.id}
            className={`statistic-item-acmva ${
              selectedStats.includes(stat.id) ? "selected" : ""
            } ${
              selectedStats.length >= MAX_STATISTICS &&
              !selectedStats.includes(stat.id)
                ? "disabled"
                : ""
            }`}
            onClick={() => {
              if (
                !(
                  selectedStats.length >= MAX_STATISTICS &&
                  !selectedStats.includes(stat.id)
                )
              ) {
                handleStatisticToggle(stat.id);
              }
            }}
          >
            <input
              type="checkbox"
              className="statistic-checkbox-acmva"
              checked={selectedStats.includes(stat.id)}
              onChange={() => {
                if (
                  !(
                    selectedStats.length >= MAX_STATISTICS &&
                    !selectedStats.includes(stat.id)
                  )
                ) {
                  handleStatisticToggle(stat.id);
                }
              }}
              disabled={
                selectedStats.length >= MAX_STATISTICS &&
                !selectedStats.includes(stat.id)
              }
            />
            <div className="statistic-icon-acmva">
              {getIconComponent(stat.iconName)}
            </div>
            <div className="statistic-name-acmva">{stat.name}</div>
            <div className="statistic-description-acmva">
              {stat.description}
            </div>
          </div>
        ))}
      </div>

      <div className="adminconfig-actions-acmva">
        <button
          onClick={saveStatisticsConfig}
          className={`adminconfig-btn-acmva ${
            loadingStats ? "loading-acmva" : ""
          } ${saveSuccess ? "success-acmva" : ""}`}
          disabled={loadingStats || loading}
        >
          {loadingStats ? (
            <>Guardando...</>
          ) : saveSuccess ? (
            <>
              <CheckCircle size={18} /> Guardado
            </>
          ) : (
            <>
              <Save size={18} /> Guardar Configuración
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default StatisticsConfig;
