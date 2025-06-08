const prisma = require("../config/db");
const { estado_inscripcion } = require("../generated/prisma");
const { subirImagenAImgur } = require("../utils/imgur.utils");

// Manejo de errores de multer
const manejarErroresDeMulter = (err, req, res, next) => {
  if (err) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        msg: "El archivo excede el tamaño máximo permitido (5 MB)",
      });
    }

    if (err.message.includes("Solo se permiten archivos")) {
      return res.status(400).json({ msg: err.message });
    }

    // Otro error desconocido de multer
    return res.status(400).json({ msg: "Error al subir archivo" });
  }

  next();
};

// ==========================================
// Crear inscripción a un evento académico
// ==========================================
const crearInscripcion = async (req, res) => {
  try {
    console.log("Iniciando proceso de inscripción...");
    const { id_eve, carta_motivacion } = req.body;
    const id_cue = req.usuario.id; // Ahora trabajamos con ID de cuenta

    const archivo = req.file;

    console.log(
      `Datos recibidos: id_eve=${id_eve}, id_cue=${id_cue}, archivo=${
        archivo ? "Sí" : "No"
      }`
    );
    console.log(
      `Carta motivación: ${carta_motivacion ? "Recibida" : "No recibida"}`
    );

    if (!id_cue || !id_eve) {
      return res
        .status(400)
        .json({ msg: "Faltan campos obligatorios: id_cue o id_eve" });
    }

    if (!carta_motivacion) {
      return res
        .status(400)
        .json({ msg: "Debe incluir una carta de motivación" });
    }

    // Obtenemos el evento para verificar si tiene costo
    console.log(`Buscando evento con ID: ${id_eve}`);
    const evento = await prisma.evento.findUnique({ where: { id_eve } });
    if (!evento) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    }

    console.log(
      `Evento encontrado: ${evento.nom_eve}, costo: ${evento.val_eve}, cupos: ${evento.cup_dis_eve}`
    );

    // Verificar cupos disponibles
    if (evento.cup_dis_eve <= 0) {
      return res.status(400).json({
        msg: "No hay cupos disponibles para este evento",
      });
    }

    // Solo exigimos comprobante para eventos con costo
    if (evento.val_eve > 0 && !archivo) {
      return res
        .status(400)
        .json({ msg: "Debe adjuntar un comprobante de pago" });
    }

    // Si hay archivo, validar tipo y tamaño
    if (archivo) {
      // Validar tipo de archivo (solo imágenes para Imgur)
      const tiposPermitidos = ["image/jpeg", "image/jpg", "image/png"];

      if (!tiposPermitidos.includes(archivo.mimetype)) {
        return res.status(400).json({
          msg: "Tipo de archivo no permitido. Solo se aceptan imágenes (JPG, PNG)",
        });
      }

      // Validar tamaño del archivo (máximo 5 MB)
      const tamMaximo = 5 * 1024 * 1024; // 5MB
      if (archivo.size > tamMaximo) {
        return res.status(400).json({
          msg: "El archivo excede el tamaño máximo permitido (5 MB)",
        });
      }
    }

    // Verificar que la cuenta existe
    console.log(`Verificando cuenta de usuario con ID: ${id_cue}`);
    const cuenta = await prisma.cuenta.findUnique({
      where: { id_cue },
      include: { usuario: true },
    });
    if (!cuenta) {
      return res.status(404).json({ msg: "Cuenta de usuario no encontrada" });
    }
    console.log(
      `Cuenta encontrada: ${cuenta.cor_usu}, usuario: ${cuenta.usuario.nom_usu}`
    );

    // Verificar si el usuario ya está inscrito
    console.log(`Verificando si el usuario ya está inscrito en el evento`);
    const yaInscrito = await prisma.inscripcion.findFirst({
      where: { id_cor_ins: id_cue, id_eve_ins: id_eve },
    });

    console.log(
      `Inscripción existente: ${yaInscrito ? "Sí" : "No"}, Estado: ${
        yaInscrito?.est_ins || "N/A"
      }`
    );

    // Permitir reinscripción si la inscripción anterior fue rechazada
    if (yaInscrito && yaInscrito.est_ins !== "RECHAZADA") {
      return res.status(400).json({ msg: "Ya estás inscrito en este evento" });
    } // Si la inscripción estaba RECHAZADA, la actualizamos en lugar de crear una nueva
    if (yaInscrito && yaInscrito.est_ins === "RECHAZADA") {
      try {
        console.log(`Actualizando inscripción rechazada: ${yaInscrito.id_ins}`);
        // Actualizar la inscripción existente
        await prisma.inscripcion.update({
          where: { id_ins: yaInscrito.id_ins },
          data: {
            est_ins: "PENDIENTE", // Cambiar estado a PENDIENTE
            fec_ins: new Date(), // Actualizar fecha de inscripción
          },
        });

        // Si hay un archivo, lo procesamos
        let urlComprobante = null;
        if (archivo) {
          try {
            console.log(
              `Procesando archivo de comprobante para inscripción rechazada`
            );
            // Subir la imagen a Imgur
            urlComprobante = await subirImagenAImgur(archivo);
            console.log(
              `Imagen subida correctamente a Imgur: ${urlComprobante}`
            );

            // Guardar el comprobante
            await prisma.comprobante_pago.create({
              data: {
                id_ins_per: yaInscrito.id_ins,
                url_com_pag: urlComprobante,
              },
            });
            console.log(`Comprobante guardado correctamente`);
          } catch (imgurError) {
            console.error(`Error al subir imagen a Imgur:`, imgurError);
            return res
              .status(500)
              .json({ msg: "Error al procesar el comprobante" });
          }
        } // Si hay carta de motivación, la actualizamos
        if (carta_motivacion) {
          // Verificar si ya existe una carta
          const cartaExistente = await prisma.carta_motivacion.findFirst({
            where: { id_ins_per: yaInscrito.id_ins },
          });
          if (cartaExistente) {
            // Actualizar carta existente
            await prisma.carta_motivacion.update({
              where: { id_car_mot: cartaExistente.id_car_mot },
              data: { con_car_mot: carta_motivacion },
            });
          } else {
            // Crear nueva carta
            await prisma.carta_motivacion.create({
              data: {
                id_ins_per: yaInscrito.id_ins,
                con_car_mot: carta_motivacion,
              },
            });
          }
        }

        return res.status(200).json({
          msg: "Inscripción actualizada correctamente",
          id_ins: yaInscrito.id_ins,
        });
      } catch (error) {
        throw error;
      }
    }

    try {
      console.log(
        `Creando nueva inscripción para el usuario ${id_cue} en evento ${id_eve}`
      );
      // Crear la inscripción
      const nuevaInscripcion = await prisma.inscripcion.create({
        data: {
          id_cor_ins: id_cue, // Ahora usamos id_cor_ins en lugar de id_usu_ins
          id_eve_ins: id_eve,
          est_ins: "PENDIENTE", // Usando el nuevo campo est_ins
        },
      });
      console.log(`Inscripción creada con ID: ${nuevaInscripcion.id_ins}`);

      // Crear la carta de motivación
      console.log(`Guardando carta de motivación`);
      await prisma.carta_motivacion.create({
        data: {
          id_ins_per: nuevaInscripcion.id_ins,
          con_car_mot: carta_motivacion,
          est_car_mot: "PENDIENTE",
        },
      });
      console.log(`Carta de motivación guardada correctamente`);

      // Si se proporciona un archivo, subirlo a Imgur y guardar la URL
      if (archivo) {
        try {
          console.log(`Procesando comprobante de pago`);
          // Subir la imagen a Imgur
          const imgurUrl = await subirImagenAImgur(archivo);
          console.log(`Imagen subida a Imgur: ${imgurUrl}`);

          // Crear el comprobante de pago con la URL de Imgur
          await prisma.comprobante_pago.create({
            data: {
              id_ins_per: nuevaInscripcion.id_ins,
              url_com_pag: imgurUrl,
              est_com_pag: "PENDIENTE",
            },
          });
          console.log(`Comprobante guardado correctamente`);
        } catch (imgurError) {
          console.error(`Error al subir imagen a Imgur:`, imgurError);
          // Si falla la subida a Imgur, registramos el error pero continuamos con la inscripción
          await prisma.comprobante_pago.create({
            data: {
              id_ins_per: nuevaInscripcion.id_ins,
              url_com_pag: "Error al subir imagen",
              est_com_pag: "ERROR",
            },
          });
          console.log(`Se registró el error con el comprobante`);
        }
      }

      res.status(201).json(nuevaInscripcion);
    } catch (error) {
      console.error(`Error en el bloque de creación de inscripción:`, error);
      if (
        error.code === "P2002" &&
        error.meta?.target?.includes("id_cor_ins_id_eve_ins")
      ) {
        return res.status(400).json({
          msg: "Ya existe una inscripción para este evento con este usuario",
        });
      }

      // Otro tipo de error desconocido
      throw error;
    }
  } catch (error) {
    console.error(`Error general en crearInscripcion:`, error);
    res.status(500).json({
      msg: "Error al inscribirse al evento",
      error: error.message,
      detalles:
        process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// ==============================
// Validar inscripción (admin)
// ==============================
const validarInscripcion = async (req, res) => {
  try {
    const { id } = req.params;
    const { est_ins, asistencia, nota_final, observacion } = req.body;

    console.log(req.body);

    // Verificar estados permitidos con el enum
    const estadosPermitidos = [
      "PENDIENTE",
      "ACEPTADA",
      "RECHAZADA",
      "APROBADO",
      "REPROBADO_NOTA",
      "REPROBADO_ASISTENCIA",
      "REPROBADO_TOTAL",
    ];

    if (!estadosPermitidos.includes(est_ins)) {
      return res.status(400).json({ msg: "Estado inválido" + est_ins });
    }
    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id_ins: id },
      include: { evento: true },
    });

    if (!inscripcion) {
      return res.status(404).json({ msg: "Inscripción no encontrada" });
    }

    const estadoNuevo = est_ins;
    const estadoAnterior = inscripcion.est_ins;
    const idEvento = inscripcion.id_eve_ins;

    let asistenciaNum = asistencia !== undefined ? Number(asistencia) : -1;
    let notaFinalNum = nota_final !== undefined ? Number(nota_final) : -1;

    let nuevoEstado = est_ins; // Usamos el estado enviado si no se especifican asistencia ni nota

    // Si no se proporciona asistencia, no se entra en la lógica de validación de asistencia y nota
    if (asistenciaNum !== -1 || notaFinalNum !== -1) {
      // Validación de asistencia
      if (asistenciaNum !== -1) {
        const asistenciaMinima = inscripcion.evento.por_min_asi_eve;
        if (isNaN(asistenciaNum) || asistenciaNum < 0 || asistenciaNum > 100) {
          return res.status(400).json({ msg: "Asistencia inválida (0–100)" });
        }

        if (asistenciaNum < asistenciaMinima) {
          nuevoEstado = "REPROBADO_ASISTENCIA";
        }
      }

      // Validación de nota final (solo para eventos tipo CURSO)
      if (inscripcion.evento.tip_eve === "CURSO" && notaFinalNum !== -1) {
        const eventoCurso = await prisma.evento_curso.findUnique({
          where: { id_eve_cur: inscripcion.evento.id_eve },
        });

        const notaMinima = eventoCurso.not_min_cur;
        if (isNaN(notaFinalNum) || notaFinalNum < 0 || notaFinalNum > 10) {
          return res.status(400).json({ msg: "Nota inválida (0–10)" });
        }

        if (notaFinalNum < notaMinima) {
          nuevoEstado = "REPROBADO_NOTA";
        } else if (nuevoEstado === "REPROBADO_ASISTENCIA") {
          nuevoEstado = "REPROBADO_TOTAL"; // Si ya se reprobó por asistencia, se pone reprobado total
        } else {
          nuevoEstado = "APROBADO";
        }
      }
    }

    if (
      nuevoEstado === "APROBADO" ||
      nuevoEstado === "REPROBADO_NOTA" ||
      nuevoEstado === "REPROBADO_ASISTENCIA" ||
      nuevoEstado === "REPROBADO_TOTAL"
    ) {
      // Actualizar el estado de la inscripción
      await prisma.inscripcion.update({
        where: { id_ins: id },
        data: {
          est_ins: nuevoEstado, // Estado calculado
          por_asi_fin_usu: asistenciaNum, // Solo actualizar asistencia si se envió
        },
      });

      if (inscripcion.evento.tip_eve === "CURSO" && notaFinalNum !== null) {
        const inscripcionCurso = await prisma.inscripcion_curso.findUnique({
          where: { id_ins_cur: id },
        });
        if (inscripcionCurso) {
          await prisma.inscripcion_curso.update({
            where: { id_ins_cur: id },
            data: {
              not_fin_usu: notaFinalNum, // Actualizar la nota final
            },
          });
        } else {
          await prisma.inscripcion_curso.create({
            where: { id_ins_cur: id },
            data: {
              not_fin_usu: notaFinalNum, // Guardar la nota final
            },
          });
        }
      }

      if (observacion) {
        // Crear nueva observación sin verificar si existe una anterior
        await prisma.observacion_inscripcion.update({
          data: {
            id_ins_per: id, // ID de la inscripción
            obs_ins: observacion, // Texto de la observación
          },
        });
      }

      return res.status(200).json({
        msg: `Inscripción finalizada correctamente con estado: ${nuevoEstado}`,
      });
    }

    // VALIDACIÓN DE CUPOS DISPONIBLES
    // Verificar que hay cupos disponibles antes de aceptar una inscripción
    if (estadoAnterior === "PENDIENTE" && estadoNuevo === "ACEPTADA") {
      if (inscripcion.evento.cup_dis_eve <= 0) {
        return res.status(400).json({
          msg: "No se puede aceptar la inscripción: no hay cupos disponibles para este evento",
        });
      }
    }

    // LÓGICA DE ACTUALIZACIÓN DE CUPOS
    let actualizacionCupo = 0;

    // Casos donde se debe decrementar el cupo (quitar un cupo disponible)
    if (estadoAnterior === "PENDIENTE" && estadoNuevo === "ACEPTADA") {
      actualizacionCupo = -1; // Una inscripción pendiente se acepta: se ocupa un cupo
    }

    // Casos donde se debe incrementar el cupo (liberar un cupo)
    if (
      (estadoAnterior === "ACEPTADA" || estadoAnterior === "PENDIENTE") &&
      estadoNuevo === "RECHAZADA"
    ) {
      actualizacionCupo = 1; // Una inscripción aceptada/pendiente se rechaza: se libera un cupo
    }

    if (estadoAnterior === "ACEPTADA" && estadoNuevo === "PENDIENTE") {
      actualizacionCupo = 1; // Una inscripción aceptada vuelve a pendiente: se libera un cupo
    } // Actualizar cupos si es necesario
    if (actualizacionCupo !== 0) {
      const eventoActualizado = await prisma.evento.update({
        where: { id_eve: idEvento },
        data: {
          cup_dis_eve: {
            increment: actualizacionCupo,
          },
        },
      });

      // BLOQUEO AUTOMÁTICO: Si cupos llegan a 0, bloquear nuevas inscripciones
      if (
        eventoActualizado.cup_dis_eve === 0 &&
        estadoAnterior === "PENDIENTE" &&
        estadoNuevo === "ACEPTADA"
      ) {
        // Nota: El bloqueo se maneja en la función crearInscripcion al verificar cup_dis_eve > 0
      }
    }

    // Actualizar inscripción con los datos
    const actualizada = await prisma.inscripcion.update({
      where: { id_ins: id },
      data: {
        est_ins, // Actualizado a usar est_ins
        por_asi_fin_usu: asistenciaNum, // Actualizado a usar por_asi_fin_usu
      },
    });

    // Guardar observación si se proporciona
    if (observacion) {
      // Verificar si ya existe una observación para esta inscripción
      const observacionExistente =
        await prisma.observacion_inscripcion.findUnique({
          where: { id_ins_per: id },
        });

      if (observacionExistente) {
        // Actualizar observación existente
        await prisma.observacion_inscripcion.update({
          where: { id_ins_per: id },
          data: {
            obs_ins: observacion,
            id_adm_cre_obs: req.usuario.id,
          },
        });
      } else {
        // Crear nueva observación
        await prisma.observacion_inscripcion.create({
          data: {
            id_ins_per: id,
            obs_ins: observacion,
            id_adm_cre_obs: req.usuario.id,
          },
        });
      }
    }

    // Si es un curso, actualizar la nota final en inscripcion_curso
    if (inscripcion.evento.tip_eve === "CURSO") {
      // Buscar si ya existe inscripcion_curso
      const inscripcionCurso = await prisma.inscripcion_curso.findUnique({
        where: { id_ins_cur: id },
      });

      if (inscripcionCurso) {
        // Actualizar inscripcion_curso existente
        await prisma.inscripcion_curso.update({
          where: { id_ins_cur: id },
          data: {
            not_fin_usu: notaFinalNum,
          },
        });
      } else {
        // Crear inscripcion_curso si no existe
        await prisma.inscripcion_curso.create({
          data: {
            id_ins_cur: id,
            not_fin_usu: notaFinalNum,
          },
        });
      }
    }

    res.status(200).json({
      msg: "Inscripción actualizada correctamente",
      inscripcion: actualizada,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error al validar inscripción",
      error: error.message,
    });
  }
};

// ===================================================
// Obtener todas las inscripciones de un usuario dado
// ===================================================
const obtenerInscripcionesPorUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const inscripciones = await prisma.inscripcion.findMany({
      where: { id_eve_ins: id },
      include: {
        cuenta: {
          include: {
            usuario: true,
          },
        },
        inscripcion_curso: true,
        comprobantes_pago: {
          orderBy: { fec_sub_com_pag: "desc" },
          take: 1,
        },
      },
      orderBy: { fec_ins: "desc" },
    }); // Mapear los resultados para tener una estructura más limpia
    const inscripcionesMapeadas = inscripciones.map((inscripcion) => ({
      id_ins: inscripcion.id_ins,
      est_ins: inscripcion.est_ins,
      por_asi_fin_usu: inscripcion.por_asi_fin_usu,
      nota_final: inscripcion.inscripcion_curso?.not_fin_usu || null,
      comprobante: inscripcion.comprobantes_pago[0]?.url_com_pag || null,
      usuario: {
        nom_usu: inscripcion.cuenta.usuario.nom_usu,
        ape_usu: inscripcion.cuenta.usuario.ape_usu,
        cor_usu: inscripcion.cuenta.cor_usu,
      },
    }));

    res.status(200).json(inscripcionesMapeadas);
  } catch (error) {
    res.status(500).json({
      msg: "Error al obtener inscripciones del usuario",
      error: error.message,
    });
  }
};

// ==============================
// Verificar si se puede generar certificado
// ==============================
const puedeGenerarCertificado = async (req, res) => {
  try {
    const { id } = req.params; // ID de la inscripción

    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id_ins: id },
      include: {
        evento: true,
        inscripcion_curso: true,
      },
    });

    if (!inscripcion) {
      return res.status(404).json({ msg: "Inscripción no encontrada" });
    }

    if (inscripcion.est_ins !== "FINALIZADA") {
      return res.status(400).json({ msg: "Inscripción no está finalizada" });
    }

    if (inscripcion.evento.tip_eve === "CURSO") {
      // Buscar la información de nota mínima del curso
      const eventoCurso = await prisma.evento_curso.findUnique({
        where: { id_eve_cur: inscripcion.evento.id_eve },
      });

      const notaMinima = eventoCurso ? eventoCurso.not_min_cur : 8;
      const asistenciaMinima = inscripcion.evento.por_min_asi_eve ?? 80;
      const notaFinal = inscripcion.inscripcion_curso?.not_fin_usu || 0;
      const asistencia = inscripcion.por_asi_fin_usu || 0;

      if (notaFinal >= notaMinima && asistencia >= asistenciaMinima) {
        return res.status(200).json({ puedeGenerar: true, tipo: "APROBADO" });
      } else {
        return res
          .status(200)
          .json({ puedeGenerar: false, tipo: "NO_APROBADO" });
      }
    } else {
      // Otros tipos de evento: solo asistencia requerida
      if ((inscripcion.por_asi_fin_usu ?? 0) >= 80) {
        return res.status(200).json({ puedeGenerar: true, tipo: "ASISTENTE" });
      } else {
        return res
          .status(200)
          .json({ puedeGenerar: false, tipo: "ASISTENCIA_INSUFICIENTE" });
      }
    }
  } catch (error) {
    res.status(500).json({
      msg: "Error al verificar elegibilidad de certificado",
      error: error.message,
    });
  }
};

const path = require("path");

const reenviarComprobante = async (req, res) => {
  try {
    const { id } = req.params;
    const archivo = req.file;

    console.log(`Iniciando reenvío de comprobante para inscripción ID: ${id}`);

    if (!archivo) {
      return res.status(400).json({ msg: "Debes subir un archivo" });
    }

    console.log(`Archivo recibido:`, {
      nombre: archivo.originalname,
      tipo: archivo.mimetype,
      tamaño: archivo.size,
      ruta: archivo.path,
    });

    // Validar tipo de archivo (solo imágenes para Imgur)
    const tiposPermitidos = ["image/jpeg", "image/jpg", "image/png"];
    if (!tiposPermitidos.includes(archivo.mimetype)) {
      return res.status(400).json({
        msg: "Tipo de archivo no permitido. Solo se aceptan imágenes (JPG, PNG)",
      });
    }

    // Validar tamaño del archivo (máximo 5 MB)
    const tamMaximo = 5 * 1024 * 1024; // 5MB
    if (archivo.size > tamMaximo) {
      return res.status(400).json({
        msg: "El archivo excede el tamaño máximo permitido (5 MB)",
      });
    }

    // Buscar la inscripción
    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id_ins: id },
      include: { cuenta: true, evento: true },
    });

    if (!inscripcion) {
      return res.status(404).json({ msg: "Inscripción no encontrada" });
    }

    console.log(
      `Inscripción encontrada: ${inscripcion.id_ins}, Usuario: ${inscripcion.id_cor_ins}, Solicitante: ${req.usuario.id}`
    );

    // Solo puede reenviar el mismo estudiante
    if (inscripcion.id_cor_ins !== req.usuario.id) {
      return res
        .status(403)
        .json({ msg: "No tienes permiso para modificar esta inscripción" });
    }

    try {
      // Subir la imagen a Imgur
      console.log("Intentando subir imagen a Imgur...");
      const imgurUrl = await subirImagenAImgur(archivo);
      console.log(`Imagen subida correctamente a Imgur: ${imgurUrl}`);

      // Crear un nuevo comprobante de pago con la URL de Imgur
      await prisma.comprobante_pago.create({
        data: {
          id_ins_per: id,
          url_com_pag: imgurUrl,
          est_com_pag: "PENDIENTE",
        },
      });
      console.log("Comprobante registrado en la base de datos");

      // Actualizar estado de la inscripción a pendiente
      const actualizada = await prisma.inscripcion.update({
        where: { id_ins: id },
        data: {
          est_ins: "PENDIENTE",
        },
      });
      console.log("Inscripción actualizada a estado PENDIENTE");

      res.status(200).json({
        msg: "Comprobante reenviado correctamente",
        inscripcion: actualizada,
      });
    } catch (errorSubida) {
      console.error("Error detallado al procesar comprobante:", errorSubida);
      return res.status(500).json({
        msg: "Error al procesar el comprobante de pago",
        error: errorSubida.message,
      });
    }
  } catch (error) {
    console.error("Error general en reenviarComprobante:", error);
    res.status(500).json({
      msg: "Error al reenviar comprobante",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Obtener inscripciones por evento para el administrador
const obtenerInscripcionesPorEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const inscripciones = await prisma.inscripcion.findMany({
      where: { id_eve_ins: id },
      include: {
        cuenta: {
          include: {
            usuario: true,
          },
        },
        evento: true,
        inscripcion_curso: true,
        comprobantes_pago: {
          orderBy: { fec_sub_com_pag: "desc" },
          take: 1,
        },
        cartas_motivacion: {
          orderBy: { fec_sub_car_mot: "desc" },
          take: 1,
        },
        observacion: true,
      },
      orderBy: { fec_ins: "desc" },
    });

    try {
      // Mapear los resultados para tener una estructura más limpia
      const inscripcionesMapeadas = inscripciones.map((inscripcion) => {
        return {
          id_ins: inscripcion.id_ins,
          estado: inscripcion.est_ins,
          asistencia: inscripcion.por_asi_fin_usu,
          nota_final: inscripcion.inscripcion_curso?.not_fin_usu || null,
          fec_ins: inscripcion.fec_ins,
          evento: {
            nom_eve: inscripcion.evento.nom_eve,
          },
          comprobante: inscripcion.comprobantes_pago[0]?.url_com_pag || null,
          carta_motivacion:
            inscripcion.cartas_motivacion[0]?.con_car_mot || null,
          observacion: inscripcion.observacion?.obs_ins || null,
          usuario: {
            nom_usu: inscripcion.cuenta.usuario.nom_usu,
            ape_usu: inscripcion.cuenta.usuario.ape_usu,
            cor_usu: inscripcion.cuenta.cor_usu,
            com_usu: inscripcion.cuenta.usuario.com_usu || null,
          },
        };
      });

      res.status(200).json(inscripcionesMapeadas);
    } catch (mapError) {
      throw mapError;
    }
  } catch (error) {
    res.status(500).json({
      msg: "Error al obtener inscripciones del evento",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const obtenerInscripcionUsuarioEnEvento = async (req, res) => {
  try {
    const { idEvento } = req.params;
    const id_cue = req.usuario.id; // Ahora usamos ID de cuenta

    const inscripcion = await prisma.inscripcion.findFirst({
      where: {
        id_cor_ins: id_cue,
        id_eve_ins: idEvento,
      },
      include: {
        inscripcion_curso: true,
        comprobantes_pago: {
          orderBy: { fec_sub_com_pag: "desc" },
          take: 1,
        },
      },
    });

    if (!inscripcion) {
      return res.status(404).json({ msg: "No estás inscrito en este evento" });
    }

    // Crear una respuesta más organizada
    const respuesta = {
      id_ins: inscripcion.id_ins,
      est_ins: inscripcion.est_ins,
      fec_ins: inscripcion.fec_ins,
      por_asi_fin_usu: inscripcion.por_asi_fin_usu,
      nota_final: inscripcion.inscripcion_curso?.not_fin_usu || null,
      comprobante: inscripcion.comprobantes_pago[0]?.url_com_pag || null,
    };

    res.status(200).json(respuesta);
  } catch (error) {
    res.status(500).json({
      msg: "Error al obtener tu inscripción",
      error: error.message,
    });
  }
};

// ==============================
// Inscripciones propias (usuario autenticado)
// ==============================
const obtenerInscripcionesDelUsuarioActual = async (req, res) => {
  try {
    // Verificar si req.usuario está definido
    if (!req.usuario) {
      return res.status(401).json({
        msg: "Usuario no autenticado",
        error: "No hay información de usuario en la solicitud",
      });
    }

    const id_cue = req.usuario.id; // Ahora usamos ID de cuenta

    // Log antes de la consulta a Prisma
    const inscripciones = await prisma.inscripcion.findMany({
      where: { id_cor_ins: id_cue },
      include: {
        evento: true,
        inscripcion_curso: true,
        comprobantes_pago: {
          orderBy: { fec_sub_com_pag: "desc" },
          take: 1,
        },
        observacion: true, // Incluimos la observación
      },
      orderBy: { fec_ins: "desc" },
    });

    const inscripcionesMapeadas = inscripciones.map((inscripcion) => ({
      id_ins: inscripcion.id_ins,
      est_ins: inscripcion.est_ins,
      fec_ins: inscripcion.fec_ins,
      por_asi_fin_usu: inscripcion.por_asi_fin_usu,
      nota_final: inscripcion.inscripcion_curso?.not_fin_usu || null,
      comprobante: inscripcion.comprobantes_pago[0]?.url_com_pag || null,
      observacion: inscripcion.observacion?.obs_ins || null, // Incluimos la observación en la respuesta
      evento: inscripcion.evento,
    }));

    res.status(200).json(inscripcionesMapeadas);
  } catch (error) {
    res.status(500).json({
      msg: "Error al obtener inscripciones",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// ==============================
// Obtener todas las inscripciones (admin)
// ==============================
const obtenerTodasLasInscripciones = async (req, res) => {
  try {
    const inscripciones = await prisma.inscripcion.findMany({
      include: {
        cuenta: {
          include: {
            usuario: true,
          },
        },
        evento: true,
        inscripcion_curso: true,
        comprobantes_pago: {
          orderBy: { fec_sub_com_pag: "desc" },
          take: 1,
        },
        cartas_motivacion: {
          orderBy: { fec_sub_car_mot: "desc" },
          take: 1,
        },
        observacion: true,
      },
      orderBy: { fec_ins: "desc" },
    });

    try {
      // Mapear los resultados para tener una estructura más limpia
      const inscripcionesMapeadas = inscripciones.map((inscripcion) => {
        return {
          id_ins: inscripcion.id_ins,
          estado: inscripcion.est_ins,
          asistencia: inscripcion.por_asi_fin_usu,
          nota_final: inscripcion.inscripcion_curso?.not_fin_usu || null,
          fec_ins: inscripcion.fec_ins,
          evento: {
            nom_eve: inscripcion.evento.nom_eve,
            tip_eve: inscripcion.evento.tip_eve,
            val_eve: inscripcion.evento.val_eve,
            id_eve: inscripcion.evento.id_eve,
          },
          comprobante: inscripcion.comprobantes_pago[0]?.url_com_pag || null,
          carta_motivacion:
            inscripcion.cartas_motivacion[0]?.con_car_mot || null,
          observacion: inscripcion.observacion?.obs_ins || null,
          usuario: {
            nom_usu: inscripcion.cuenta.usuario.nom_usu,
            ape_usu: inscripcion.cuenta.usuario.ape_usu,
            cor_usu: inscripcion.cuenta.cor_usu,
            com_usu: inscripcion.cuenta.usuario.com_usu || null,
          },
        };
      });

      res.status(200).json(inscripcionesMapeadas);
    } catch (mapError) {
      throw mapError;
    }
  } catch (error) {
    res.status(500).json({
      msg: "Error al obtener todas las inscripciones",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

module.exports = {
  crearInscripcion,
  validarInscripcion,
  obtenerInscripcionesPorUsuario,
  puedeGenerarCertificado,
  reenviarComprobante,
  obtenerInscripcionesPorEvento,
  obtenerInscripcionUsuarioEnEvento,
  manejarErroresDeMulter,
  obtenerInscripcionesDelUsuarioActual,
  obtenerTodasLasInscripciones,
};
