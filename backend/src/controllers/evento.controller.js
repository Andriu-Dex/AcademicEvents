const prisma = require("../config/db");

// ===================================
// Crear nuevo evento académico
// ===================================
const crearEvento = async (req, res) => {
  try {
    const {
      nom_eve,
      des_eve,
      tip_eve,
      fec_ini_eve,
      fec_fin_eve,
      dur_hrs_eve,
      pagado_eve,
      nota_min_eve,
      por_asist_eve,
      carreraId,
    } = req.body;

    // Manejar imagen de portada si se proporciona
    const imagen_portada = req.file ? req.file.filename : null;

    // Validaciones mínimas (pueden expandirse según necesidades)
    if (!nom_eve || !tip_eve || !fec_ini_eve || !fec_fin_eve || !dur_hrs_eve) {
      return res.status(400).json({ msg: "Faltan campos obligatorios" });
    }

    // Verificar que las fechas son válidas
    if (isNaN(new Date(fec_ini_eve)) || isNaN(new Date(fec_fin_eve))) {
      return res.status(400).json({ msg: "Fechas inválidas" });
    }

    // Validar que la fecha de inicio no sea mayor a la de fin
    if (new Date(fec_ini_eve) > new Date(fec_fin_eve)) {
      return res.status(400).json({ 
        msg: "La fecha de inicio no puede ser posterior a la fecha de fin" 
      });
    }

    // Para cursos, validar campos específicos
    if (tip_eve === "CURSO") {
      if (!nota_min_eve || !por_asist_eve) {
        return res.status(400).json({ 
          msg: "Para cursos son obligatorios: nota mínima y porcentaje mínimo de asistencia" 
        });
      }
      if (nota_min_eve < 0 || nota_min_eve > 10) {
        return res.status(400).json({ msg: "La nota mínima debe estar entre 0 y 10" });
      }
      if (por_asist_eve < 0 || por_asist_eve > 100) {
        return res.status(400).json({ msg: "El porcentaje de asistencia debe estar entre 0 y 100" });
      }
    }    // Creación del evento
    const nuevoEvento = await prisma.evento.create({
      data: {
        nom_eve,
        des_eve,
        tip_eve,
        fec_ini_eve: new Date(fec_ini_eve),
        fec_fin_eve: new Date(fec_fin_eve),
        dur_hrs_eve: parseInt(dur_hrs_eve),
        pagado_eve: pagado_eve === true || pagado_eve === 'true',
        nota_min_eve: tip_eve === "CURSO" ? parseFloat(nota_min_eve) : null,
        por_asist_eve: tip_eve === "CURSO" ? parseFloat(por_asist_eve) : null,
        carreraId: carreraId || null,
        imagen_portada,
      },
      include: { carrera: true },
    });

    res.status(201).json(nuevoEvento);
  } catch (error) {
    res.status(500).json({
      msg: "Error al crear evento",
      error: error.message,
    });
  }
};

// ===================================
// Obtener todos los eventos
// ===================================
const obtenerEventos = async (req, res) => {
  try {
    const eventos = await prisma.evento.findMany({
      include: { carrera: true },
      orderBy: { fec_ini_eve: "asc" }, // Orden cronológico opcional
    });

    res.status(200).json(eventos);
  } catch (error) {
    res.status(500).json({
      msg: "Error al obtener eventos",
      error: error.message,
    });
  }
};

// ===================================
// Actualizar un evento por ID
// ===================================
const actualizarEvento = async (req, res) => {
  try {    const { id } = req.params;
    const {
      nom_eve,
      des_eve,
      tip_eve,
      fec_ini_eve,
      fec_fin_eve,
      dur_hrs_eve,
      pagado_eve,
      nota_min_eve,
      por_asist_eve,
      carreraId,
    } = req.body;    // Verificar que el evento existe
    const eventoExistente = await prisma.evento.findUnique({
      where: { id_eve: id }
    });

    if (!eventoExistente) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    }

    // Manejar imagen de portada
    let imagen_portada = eventoExistente.imagen_portada;
    if (req.file) {
      imagen_portada = req.file.filename;
    }

    // Validaciones si se proporcionan fechas
    if (fec_ini_eve && fec_fin_eve) {
      if (isNaN(new Date(fec_ini_eve)) || isNaN(new Date(fec_fin_eve))) {
        return res.status(400).json({ msg: "Fechas inválidas" });
      }
      if (new Date(fec_ini_eve) > new Date(fec_fin_eve)) {
        return res.status(400).json({ 
          msg: "La fecha de inicio no puede ser posterior a la fecha de fin" 
        });
      }
    }

    // Para cursos, validar campos específicos
    if (tip_eve === "CURSO") {
      if (nota_min_eve !== undefined && (nota_min_eve < 0 || nota_min_eve > 10)) {
        return res.status(400).json({ msg: "La nota mínima debe estar entre 0 y 10" });
      }
      if (por_asist_eve !== undefined && (por_asist_eve < 0 || por_asist_eve > 100)) {
        return res.status(400).json({ msg: "El porcentaje de asistencia debe estar entre 0 y 100" });
      }
    }    // Preparar datos para actualizar
    const dataToUpdate = {};
    
    if (nom_eve !== undefined) dataToUpdate.nom_eve = nom_eve;
    if (des_eve !== undefined) dataToUpdate.des_eve = des_eve;
    if (tip_eve !== undefined) dataToUpdate.tip_eve = tip_eve;
    if (fec_ini_eve !== undefined) dataToUpdate.fec_ini_eve = new Date(fec_ini_eve);
    if (fec_fin_eve !== undefined) dataToUpdate.fec_fin_eve = new Date(fec_fin_eve);
    if (dur_hrs_eve !== undefined) dataToUpdate.dur_hrs_eve = parseInt(dur_hrs_eve);
    if (pagado_eve !== undefined) dataToUpdate.pagado_eve = pagado_eve === true || pagado_eve === 'true';
    if (carreraId !== undefined) dataToUpdate.carreraId = carreraId || null;
    if (imagen_portada !== undefined) dataToUpdate.imagen_portada = imagen_portada;

    // Para cursos, manejar campos específicos
    if (tip_eve === "CURSO") {
      if (nota_min_eve !== undefined) dataToUpdate.nota_min_eve = parseFloat(nota_min_eve);
      if (por_asist_eve !== undefined) dataToUpdate.por_asist_eve = parseFloat(por_asist_eve);
    } else {
      // Si no es curso, limpiar campos específicos de curso
      dataToUpdate.nota_min_eve = null;
      dataToUpdate.por_asist_eve = null;
    }

    const eventoActualizado = await prisma.evento.update({
      where: { id_eve: id },
      data: dataToUpdate,
      include: { carrera: true },
    });

    res.status(200).json(eventoActualizado);
  } catch (error) {
    res.status(500).json({
      msg: "Error al actualizar evento",
      error: error.message,
    });
  }
};

// ===================================
// Eliminar un evento por ID
// ===================================
const eliminarEvento = async (req, res) => {
  try {
    const { id } = req.params;

    const evento = await prisma.evento.findUnique({ where: { id_eve: id } });
    if (!evento) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    }

    await prisma.evento.delete({ where: { id_eve: id } });

    res.status(200).json({ msg: "Evento eliminado correctamente" });
  } catch (error) {
    res.status(500).json({
      msg: "Error al eliminar evento",
      error: error.message,
    });
  }
};

// Obtener un solo evento por su ID
const obtenerEventoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const evento = await prisma.evento.findUnique({
      where: { id_eve: id },
      include: { carrera: true },
    });

    if (!evento) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    }

    res.status(200).json(evento);
  } catch (error) {
    res.status(500).json({
      msg: "Error al obtener el evento",
      error: error.message,
    });
  }
};

module.exports = {
  crearEvento,
  obtenerEventos,
  actualizarEvento,
  eliminarEvento,
  obtenerEventoPorId,
};
