// ============================
//  Script de prueba para Socket.IO
// ============================

const io = require("socket.io-client");

console.log("🔧 Iniciando prueba de conexión Socket.IO...");

// Conectar al servidor
const socket = io("http://localhost:3000", {
  transports: ["websocket", "polling"],
  timeout: 5000,
});

socket.on("connect", () => {
  console.log("✅ Conectado al servidor Socket.IO:", socket.id);

  // Simular autenticación
  socket.emit("authenticate", {
    userId: "test-user-123",
    role: "ADMIN_GLOBAL",
    token: "test-token",
  });

  console.log("📤 Datos de autenticación enviados");
});

socket.on("disconnect", () => {
  console.log("❌ Desconectado del servidor Socket.IO");
});

socket.on("connect_error", (error) => {
  console.error("❌ Error de conexión:", error.message);
});

// Escuchar eventos de inscripciones
socket.on("inscripcion-change-hm", (data) => {
  console.log("📡 Evento inscripcion-change-hm recibido:", {
    action: data.action,
    timestamp: data.timestamp,
    inscripcionId: data.data?.inscripcion?.id_ins,
    eventoNombre: data.data?.evento?.nom_eve,
  });
});

socket.on("inscription-validation-change", (data) => {
  console.log("📡 Evento inscription-validation-change recibido:", {
    action: data.action,
    timestamp: data.timestamp,
    inscripcionId: data.data?.id,
    priority: data.priority,
  });
});

// Mantener la conexión abierta por 30 segundos
setTimeout(() => {
  console.log("⏰ Cerrando prueba de conexión...");
  socket.disconnect();
  process.exit(0);
}, 30000);

console.log("🔄 Escuchando eventos por 30 segundos...");
