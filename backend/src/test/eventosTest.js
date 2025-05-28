// ===================================
// Test de Endpoints de Eventos
// ===================================

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000/api';

// Token de administrador (obtener del login)
let adminToken = '';

// Test de login de administrador
async function loginAdmin() {
  try {
    const response = await axios.post(`${BASE_URL}/login`, {
      correo: 'admin@uta.edu.ec', // Ajustar según tu admin
      contrasena: 'admin123'      // Ajustar según tu admin
    });
    
    adminToken = response.data.token;
    console.log('✅ Login admin exitoso');
    return true;
  } catch (error) {
    console.error('❌ Error en login admin:', error.response?.data || error.message);
    return false;
  }
}

// Test de obtener todos los eventos
async function testObtenerEventos() {
  try {
    const response = await axios.get(`${BASE_URL}/eventos`);
    console.log('✅ Obtener eventos exitoso. Total:', response.data.length);
    return true;
  } catch (error) {
    console.error('❌ Error al obtener eventos:', error.response?.data || error.message);
    return false;
  }
}

// Test de crear evento
async function testCrearEvento() {
  try {
    const formData = new FormData();
    
    // Datos del evento
    formData.append('nom_eve', 'Evento de Prueba API');
    formData.append('des_eve', 'Este es un evento creado desde las pruebas de API');
    formData.append('tip_eve', 'CURSO');
    formData.append('fec_ini_eve', '2025-06-01');
    formData.append('fec_fin_eve', '2025-06-05');
    formData.append('dur_hrs_eve', '40');
    formData.append('pagado_eve', 'false');
    formData.append('nota_min_eve', '7.0');
    formData.append('por_asist_eve', '80');
    formData.append('requisitos', 'Conocimientos básicos de programación');
    formData.append('modalidad', 'Virtual');
    formData.append('publico_objetivo', 'Estudiantes de ingeniería');
    
    // Archivo de imagen (opcional)
    // formData.append('imagen_portada', fs.createReadStream('ruta/a/imagen.jpg'));

    const response = await axios.post(`${BASE_URL}/eventos`, formData, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        ...formData.getHeaders()
      }
    });
    
    console.log('✅ Crear evento exitoso. ID:', response.data.evento.id_eve);
    return response.data.evento.id_eve;
  } catch (error) {
    console.error('❌ Error al crear evento:', error.response?.data || error.message);
    return null;
  }
}

// Test de obtener evento por ID
async function testObtenerEventoPorId(eventoId) {
  try {
    const response = await axios.get(`${BASE_URL}/eventos/${eventoId}`);
    console.log('✅ Obtener evento por ID exitoso:', response.data.nom_eve);
    return true;
  } catch (error) {
    console.error('❌ Error al obtener evento por ID:', error.response?.data || error.message);
    return false;
  }
}

// Test de actualizar evento
async function testActualizarEvento(eventoId) {
  try {
    const formData = new FormData();
    
    formData.append('nom_eve', 'Evento de Prueba API - ACTUALIZADO');
    formData.append('des_eve', 'Este evento ha sido actualizado desde las pruebas de API');
    formData.append('tip_eve', 'WEBINAR');
    formData.append('fec_ini_eve', '2025-06-10');
    formData.append('fec_fin_eve', '2025-06-10');
    formData.append('dur_hrs_eve', '2');
    formData.append('pagado_eve', 'false');
    formData.append('modalidad', 'Virtual');
    formData.append('publico_objetivo', 'Comunidad académica en general');

    const response = await axios.put(`${BASE_URL}/eventos/${eventoId}`, formData, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        ...formData.getHeaders()
      }
    });
    
    console.log('✅ Actualizar evento exitoso');
    return true;
  } catch (error) {
    console.error('❌ Error al actualizar evento:', error.response?.data || error.message);
    return false;
  }
}

// Test de eliminar evento
async function testEliminarEvento(eventoId) {
  try {
    const response = await axios.delete(`${BASE_URL}/eventos/${eventoId}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    console.log('✅ Eliminar evento exitoso');
    return true;
  } catch (error) {
    console.error('❌ Error al eliminar evento:', error.response?.data || error.message);
    return false;
  }
}

// Ejecutar todas las pruebas
async function ejecutarPruebas() {
  console.log('🚀 Iniciando pruebas de API de eventos...\n');
  
  // 1. Login
  if (!await loginAdmin()) {
    console.log('❌ No se pudo hacer login. Deteniendo pruebas.');
    return;
  }
  
  // 2. Obtener eventos
  await testObtenerEventos();
  
  // 3. Crear evento
  const eventoId = await testCrearEvento();
  if (!eventoId) {
    console.log('❌ No se pudo crear evento. Deteniendo pruebas.');
    return;
  }
  
  // 4. Obtener evento por ID
  await testObtenerEventoPorId(eventoId);
  
  // 5. Actualizar evento
  await testActualizarEvento(eventoId);
  
  // 6. Eliminar evento
  await testEliminarEvento(eventoId);
  
  console.log('\n✅ Pruebas completadas exitosamente!');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  ejecutarPruebas().catch(console.error);
}

module.exports = {
  loginAdmin,
  testObtenerEventos,
  testCrearEvento,
  testObtenerEventoPorId,
  testActualizarEvento,
  testEliminarEvento
};
