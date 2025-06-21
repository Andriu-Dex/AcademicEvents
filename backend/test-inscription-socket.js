// ============================
//  Script de prueba para notificaciones de inscripciones
// ============================

const io = require("socket.io-client");

console.log("🔧 Iniciando prueba de notificaciones de inscripciones...");
console.log("📅 Timestamp:", new Date().toISOString());

// Conectar al servidor Socket.IO
const socket = io("http://localhost:3000", {
  transports: ["websocket", "polling"],
  timeout: 10000,
  forceNew: true,
});

let eventosRecibidos = 0;

socket.on("connect", () => {
  console.log("\n✅ CONECTADO al servidor Socket.IO:", socket.id);
  console.log("⏰", new Date().toISOString());

  // Simular autenticación como admin
  socket.emit("authenticate", {
    userId: "admin-test-user",
    role: "ADMIN_GLOBAL",
    token: "test-token",
  });

  console.log("📤 Datos de autenticación enviados como ADMIN_GLOBAL");
});

socket.on("disconnect", (reason) => {
  console.log("\n❌ DESCONECTADO del servidor Socket.IO");
  console.log("📄 Razón:", reason);
  console.log("⏰", new Date().toISOString());
});

socket.on("connect_error", (error) => {
  console.error("\n❌ ERROR DE CONEXIÓN:", error.message);
  console.log("⏰", new Date().toISOString());
});

// === ESCUCHAR EVENTOS DE INSCRIPCIONES ===

socket.on("inscripcion-change-hm", (data) => {
  eventosRecibidos++;
  console.log("\n🎯🎯🎯 [INSCRIPCION-CHANGE-HM] EVENTO RECIBIDO 🎯🎯🎯");
  console.log("⏰ Timestamp:", new Date().toISOString());
  console.log("📊 Evento #", eventosRecibidos);
  console.log("📋 Detalles completos:", JSON.stringify(data, null, 2));
  console.log("🔍 Resumen:", {
    action: data.action,
    timestamp: data.timestamp,
    inscripcionId: data.data?.inscripcion?.id_ins,
    eventoNombre: data.data?.evento?.nom_eve,
    estado: data.data?.inscripcion?.est_ins,
    usuario: data.data?.inscripcion?.cuenta?.usuario?.nom_usu,
  });
  console.log("========================================================\n");
});

socket.on("inscription-validation-change", (data) => {
  eventosRecibidos++;
  console.log(
    "\n🔔🔔🔔 [INSCRIPTION-VALIDATION-CHANGE] EVENTO RECIBIDO 🔔🔔🔔"
  );
  console.log("⏰ Timestamp:", new Date().toISOString());
  console.log("📊 Evento #", eventosRecibidos);
  console.log("📋 Detalles completos:", JSON.stringify(data, null, 2));
  console.log("🔍 Resumen:", {
    action: data.action,
    timestamp: data.timestamp,
    inscripcionId: data.data?.id,
    priority: data.priority,
    requiresValidation: data.data?.requiresValidation,
    correo: data.data?.correo,
  });
  console.log("========================================================\n");
});

socket.on("admin-notification", (data) => {
  eventosRecibidos++;
  console.log("\n👨‍💼👨‍💼👨‍💼 [ADMIN-NOTIFICATION] EVENTO RECIBIDO 👨‍💼👨‍💼👨‍💼");
  console.log("⏰ Timestamp:", new Date().toISOString());
  console.log("📊 Evento #", eventosRecibidos);
  console.log("📋 Detalles completos:", JSON.stringify(data, null, 2));
  console.log("🔍 Resumen:", {
    message: data.message,
    type: data.type,
    timestamp: data.timestamp,
    targetAudience: data.targetAudience,
    actionRequired: data.actionRequired,
  });
  console.log("========================================================\n");
});

// === CAPTURAR TODOS LOS EVENTOS ===
const originalEmit = socket.onevent;
socket.onevent = function (packet) {
  const args = packet.data || [];
  const eventName = args[0];

  if (
    eventName &&
    !["connect", "disconnect", "connect_error"].includes(eventName)
  ) {
    console.log(
      `🎪 EVENTO GENÉRICO CAPTURADO: "${eventName}" en ${new Date().toISOString()}`
    );
  }

  originalEmit.call(this, packet);
};

// Mostrar estadísticas cada 10 segundos
const intervalId = setInterval(() => {
  console.log(`\n📊 ESTADÍSTICAS (${new Date().toISOString()}):`);
  console.log(`   - Socket conectado: ${socket.connected}`);
  console.log(`   - Eventos recibidos: ${eventosRecibidos}`);
  console.log(`   - Socket ID: ${socket.id || "N/A"}`);
  console.log(
    "   - Tiempo ejecutándose:",
    Math.floor((Date.now() - startTime) / 1000),
    "segundos"
  );
}, 10000);

const startTime = Date.now();

// Mantener la conexión abierta por 60 segundos
setTimeout(() => {
  console.log("\n⏰ CERRANDO PRUEBA DE CONEXIÓN...");
  console.log(`📊 RESUMEN FINAL:`);
  console.log(`   - Eventos recibidos total: ${eventosRecibidos}`);
  console.log(
    `   - Tiempo total: ${Math.floor((Date.now() - startTime) / 1000)} segundos`
  );
  console.log(`   - Socket ID final: ${socket.id || "N/A"}`);

  clearInterval(intervalId);
  socket.disconnect();

  setTimeout(() => {
    process.exit(0);
  }, 1000);
}, 60000);

console.log("\n🔄 ESCUCHANDO EVENTOS POR 60 SEGUNDOS...");
console.log("💡 INSTRUCCIONES:");
console.log("   1. Ve al frontend (http://localhost:5173)");
console.log("   2. Inicia sesión como estudiante");
console.log("   3. Realiza una inscripción a cualquier evento");
console.log("   4. Observa las notificaciones aquí en tiempo real");
console.log("========================================================");
