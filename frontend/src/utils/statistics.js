/**
 * Define todas las estadísticas posibles para mostrar en el Home
 * Cada estadística tiene:
 * - id: Identificador único
 * - name: Nombre para mostrar
 * - description: Descripción para el administrador
 * - icon: Icono de Lucide React
 * - defaultValue: Valor por defecto
 * - apiRoute: Ruta de la API para obtener el valor (opcional)
 * - formatter: Función para formatear el valor (opcional)
 */

// Estadísticas disponibles para el Home
export const AVAILABLE_STATISTICS = [
  // Estadísticas originales
  {
    id: "carreras",
    name: "Carreras",
    description: "Número total de carreras activas",
    iconName: "GraduationCap",
    defaultValue: "0",
    isOriginal: true,
  },
  {
    id: "eventosActivos",
    name: "Eventos Activos",
    description: "Eventos disponibles actualmente",
    iconName: "Calendar",
    defaultValue: "0",
    isOriginal: true,
  },
  {
    id: "usuariosRegistrados",
    name: "Usuarios Registrados",
    description: "Total de estudiantes y usuarios generales",
    iconName: "Users",
    defaultValue: "0",
    isOriginal: true,
  },
  {
    id: "tasaParticipacion",
    name: "Participación de Usuarios",
    description: "Porcentaje de usuarios que participan en eventos",
    iconName: "TrendingUp",
    defaultValue: "0%",
    isOriginal: true,
  },

  // Nuevas estadísticas
  {
    id: "eventosCancelados",
    name: "Eventos Cancelados",
    description: "Número de eventos cancelados",
    iconName: "CalendarX",
    defaultValue: "0",
  },
  {
    id: "eventosFinalizados",
    name: "Eventos Finalizados",
    description: "Número de eventos que han finalizado",
    iconName: "CalendarCheck",
    defaultValue: "0",
  },
  {
    id: "certificadosEmitidos",
    name: "Certificados Emitidos",
    description: "Total de certificados generados",
    iconName: "Award",
    defaultValue: "0",
  },
  {
    id: "inscripcionesActivas",
    name: "Inscripciones Activas",
    description: "Total de inscripciones en proceso",
    iconName: "ClipboardCheck",
    defaultValue: "0",
  },
  {
    id: "cuposDisponibles",
    name: "Cupos Disponibles",
    description: "Total de cupos disponibles en todos los eventos activos",
    iconName: "UserPlus",
    defaultValue: "0",
  },
  {
    id: "eventosPresenciales",
    name: "Eventos Presenciales",
    description: "Número de eventos presenciales activos",
    iconName: "MapPin",
    defaultValue: "0",
  },
  {
    id: "eventosVirtuales",
    name: "Eventos Virtuales",
    description: "Número de eventos virtuales activos",
    iconName: "Laptop",
    defaultValue: "0",
  },
  {
    id: "eventosDestacados",
    name: "Eventos Destacados",
    description: "Número de eventos marcados como destacados",
    iconName: "Star",
    defaultValue: "0",
  },
];

// Lista de estadísticas activas por defecto (los 4 originales)
export const DEFAULT_ACTIVE_STATISTICS = [
  "carreras",
  "eventosActivos",
  "usuariosRegistrados",
  "tasaParticipacion",
];

// Máximo número de estadísticas a mostrar
export const MAX_STATISTICS = 4;
