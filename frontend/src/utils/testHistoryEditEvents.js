/**
 * Test básico para HistoryEditEvents
 * Este archivo se puede ejecutar en la consola del navegador para probar la funcionalidad
 */

// Test de la clase HistoryEditEvents
function testHistoryEditEvents() {
  console.log("🧪 Iniciando tests para HistoryEditEvents...");

  // Test 1: Instanciación Singleton
  console.log("\n📝 Test 1: Singleton Pattern");
  const instance1 = HistoryEditEvents.getInstance();
  const instance2 = HistoryEditEvents.getInstance();
  console.log("¿Las instancias son iguales?", instance1 === instance2);

  // Test 2: Registrar evento editado
  console.log("\n📝 Test 2: Registrar evento editado");
  const eventoId = "test-evento-123";
  const resultado = instance1.registrarEventoEditado(eventoId);
  console.log("¿Registro exitoso?", resultado);

  // Test 3: Verificar evento editado recientemente
  console.log("\n📝 Test 3: Verificar evento reciente");
  const esReciente = instance1.esEventoEditadoRecientemente(eventoId, 24);
  console.log("¿Es evento reciente?", esReciente);

  // Test 4: Obtener eventos editados
  console.log("\n📝 Test 4: Obtener eventos editados");
  const eventosEditados = instance1.obtenerEventosEditados();
  console.log("Eventos editados:", eventosEditados);

  // Test 5: Métricas
  console.log("\n📝 Test 5: Métricas");
  const metricas = instance1.obtenerMetricas();
  console.log("Métricas:", metricas);

  // Test 6: Ordenamiento híbrido
  console.log("\n📝 Test 6: Ordenamiento híbrido");
  const eventosEjemplo = [
    { id_eve: "evento-1", nom_eve: "Evento A", fec_cre_eve: "2025-06-29" },
    {
      id_eve: "test-evento-123",
      nom_eve: "Evento B",
      fec_cre_eve: "2025-06-30",
    },
    { id_eve: "evento-3", nom_eve: "Evento C", fec_cre_eve: "2025-06-28" },
  ];

  const criterio = { campo: "nom_eve", direccion: "asc" };
  const eventosOrdenados = instance1.ordenarEventosConHistorial(
    eventosEjemplo,
    criterio
  );
  console.log("Eventos ordenados (editado primero):");
  eventosOrdenados.forEach((evento, index) => {
    console.log(`${index + 1}. ${evento.nom_eve} (${evento.id_eve})`);
  });

  // Test 7: Limpiar historial
  console.log("\n📝 Test 7: Limpiar historial");
  const eliminados = instance1.limpiarTodoElHistorial();
  console.log("¿Limpieza exitosa?", eliminados);

  console.log("\n✅ Tests completados!");
}

// Función para ejecutar en la consola del navegador
function ejecutarTestsEnConsola() {
  if (typeof HistoryEditEvents !== "undefined") {
    testHistoryEditEvents();
  } else {
    console.error(
      "❌ HistoryEditEvents no está disponible. Asegúrate de estar en la página correcta."
    );
  }
}

// Instrucciones
console.log(`
🔧 INSTRUCCIONES PARA TESTING:

1. Abre la página "Gestionar Eventos" en el admin
2. Abre la consola del navegador (F12)
3. Ejecuta: ejecutarTestsEnConsola()
4. Observa los resultados de los tests

Para testing manual:
- Edita un evento y observa que aparezca al principio de la lista
- Verifica que tenga el badge "📝 Editado recientemente"
- Recarga la página y verifica que se mantenga el ordenamiento
- Prueba el filtro "Fecha de Creación"
`);

export { testHistoryEditEvents, ejecutarTestsEnConsola };
