const prisma = require("../config/db");
const { estado_inscripcion } = require("../generated/prisma");
const { subirImagenAImgur } = require("../utils/imgur.utils");
const socketService = require("../services/socket.service");
const {
  calcularCuposDisponibles,
  sincronizarCuposDisponibles,
  actualizarEstadoYSincronizarCupos,
} = require("../utils/cupo.utils");

/**
 * Función auxiliar para guardar o actualizar una observación
 * @param {string} idInscripcion - ID de la inscripción
 * @param {string} observacion - Texto de la observación
 * @param {string} idAdmin - ID del administrador que crea la observación
 */
async function guardarObservacion(idInscripcion, observacion, idAdmin) {
  console.log(`Procesando observación para inscripción ${idInscripcion}`);

  // Verificar si ya existe una observación para esta inscripción
  const observacionExistente = await prisma.observacion_inscripcion.findUnique({
    where: { id_ins_per: idInscripcion },
  });

  console.log(
    "¿Existe observación previa?",
    observacionExistente ? "Sí" : "No"
  );

  if (observacionExistente) {
    // Actualizar observación existente
    console.log("Actualizando observación existente");
    await prisma.observacion_inscripcion.update({
      where: { id_ins_per: idInscripcion },
      data: {
        obs_ins: observacion,
        id_adm_cre_obs: idAdmin,
      },
    });
  } else {
    // Crear nueva observación
    console.log("Creando nueva observación");
    await prisma.observacion_inscripcion.create({
      data: {
        id_ins_per: idInscripcion,
        obs_ins: observacion,
        id_adm_cre_obs: idAdmin,
      },
    });
  }

  console.log("✅ Observación guardada correctamente");
}

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

    // Permitir reinscripción solo si la inscripción anterior fue rechazada
    if (yaInscrito && yaInscrito.est_ins !== "RECHAZADA") {
      // Mensaje específico si el usuario ya aprobó el evento
      if (yaInscrito.est_ins === "APROBADO") {
        return res.status(400).json({
          msg: "Ya has aprobado este evento, no puedes inscribirte nuevamente",
        });
      }
      return res.status(400).json({ msg: "Ya estás inscrito en este evento" });
    } // Si la inscripción estaba RECHAZADA, la actualizamos en lugar de crear una nueva
    if (yaInscrito && yaInscrito.est_ins === "RECHAZADA") {
      try {
        console.log(`Actualizando inscripción rechazada: ${yaInscrito.id_ins}`);

        // Usamos nuestra función centralizada para actualizar el estado
        const resultado = await actualizarEstadoYSincronizarCupos(
          yaInscrito.id_ins,
          "PENDIENTE",
          { fec_ins: new Date() } // Actualizar fecha de inscripción
        );

        console.log(
          `✅ Estado actualizado de ${resultado.inscripcion.estadoAnterior} a PENDIENTE`
        );
        console.log(`📊 Cupos disponibles: ${resultado.evento.cuposDespues}`);

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

      // Realizamos todo el proceso en una transacción para garantizar consistencia
      await prisma
        .$transaction(async (tx) => {
          console.log(`🔄 Iniciando transacción para crear inscripción`);

          // 1. Recalcular cupos disponibles antes de crear la inscripción para verificar
          const { disponibles } = await calcularCuposDisponibles(id_eve, tx);
          console.log(
            `📊 Cupos disponibles actuales verificados: ${disponibles}`
          );

          if (disponibles <= 0) {
            throw new Error("No hay cupos disponibles para este evento");
          }

          // 2. Crear la inscripción
          const nuevaInscripcion = await tx.inscripcion.create({
            data: {
              id_cor_ins: id_cue,
              id_eve_ins: id_eve,
              est_ins: "PENDIENTE",
              cup_ocu: false, // Las inscripciones PENDIENTES no ocupan cupo
            },
          });
          console.log(
            `✅ Inscripción creada con ID: ${nuevaInscripcion.id_ins}`
          );

          // 3. Crear la carta de motivación
          await tx.carta_motivacion.create({
            data: {
              id_ins_per: nuevaInscripcion.id_ins,
              con_car_mot: carta_motivacion,
              est_car_mot: "PENDIENTE",
            },
          });
          console.log(`✅ Carta de motivación guardada correctamente`);

          // 4. No es necesario sincronizar cupos aquí ya que el estado es PENDIENTE
          // y solo las inscripciones ACEPTADAS afectan los cupos disponibles

          // Devolvemos la inscripción creada para usarla fuera de la transacción
          return nuevaInscripcion;
        })
        .then(async (nuevaInscripcion) => {
          // Este bloque se ejecuta después de que la transacción se ha completado con éxito

          // Si se proporciona un archivo, lo procesamos después de la transacción principal
          // para no bloquear la creación de la inscripción si hay problemas con la imagen
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

          // Verificamos los cupos después de todo el proceso
          await sincronizarCuposDisponibles(id_eve);

          res.status(201).json(nuevaInscripcion);

          // 🔌 Notificar nueva inscripción por socket
          try {
            socketService.notifyInscriptionChange("created", {
              inscripcion: nuevaInscripcion,
              id_evento: id_eve,
            });
          } catch (socketError) {
            console.error(
              "Error al enviar notificación por socket:",
              socketError
            );
            // No interferir con la operación principal
          }
        });
    } catch (error) {
      console.error(`Error en el bloque de creación de inscripción:`, error);

      if (error.message === "No hay cupos disponibles para este evento") {
        return res.status(400).json({
          msg: error.message,
        });
      }

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
    console.log("============ INICIO VALIDAR INSCRIPCIÓN ============");
    const { id } = req.params;
    const { est_ins, asistencia, nota_final, observacion } = req.body;

    console.log("ID de inscripción:", id);
    console.log("Datos recibidos:", {
      est_ins,
      asistencia,
      nota_final,
      observacion,
    });

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
      console.error("Estado inválido:", est_ins);
      return res.status(400).json({ msg: "Estado inválido: " + est_ins });
    }

    // Obtener la inscripción actual con datos del evento
    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id_ins: id },
      include: {
        evento: {
          include: {
            eventos_curso: true, // Incluir datos del curso si existe
          },
        },
      },
    });

    if (!inscripcion) {
      return res.status(404).json({ msg: "Inscripción no encontrada" });
    }

    const estadoNuevo = est_ins;
    const estadoAnterior = inscripcion.est_ins;
    const idEvento = inscripcion.id_eve_ins;

    // Validación especial: no permitir cambio de APROBADO o REPROBADO a RECHAZADA
    const estadosFinales = [
      "APROBADO",
      "REPROBADO_NOTA",
      "REPROBADO_ASISTENCIA",
      "REPROBADO_TOTAL",
    ];
    if (
      estadosFinales.includes(estadoAnterior) &&
      estadoNuevo === "RECHAZADA"
    ) {
      return res.status(400).json({
        msg: "No se puede cambiar una inscripción finalizada (APROBADO o REPROBADO) a RECHAZADA.",
      });
    }

    // Verificación para REPROBADO/APROBADO
    if (
      estadosFinales.includes(estadoAnterior) &&
      (estadoNuevo === "PENDIENTE" || estadoNuevo === "RECHAZADA")
    ) {
      console.log(
        `ALERTA: Se intenta cambiar de ${estadoAnterior} a ${estadoNuevo}, lo cual podría afectar los cupos`
      );
      // Permitimos la operación pero registramos la alerta
    }

    let asistenciaNum = asistencia !== undefined ? Number(asistencia) : -1;
    // Usar null en lugar de -1 para notas no definidas
    let notaFinalNum = nota_final !== undefined ? Number(nota_final) : null;

    let nuevoEstado = est_ins; // Usamos el estado enviado si no se especifican asistencia ni nota

    // Si no se proporciona asistencia, no se entra en la lógica de validación de asistencia y nota
    if (asistenciaNum !== -1 || notaFinalNum !== null) {
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
      if (inscripcion.evento.tip_eve === "CURSO" && notaFinalNum !== null) {
        const eventoCurso = await prisma.evento_curso.findUnique({
          where: { id_eve_cur: inscripcion.evento.id_eve },
        });

        const notaMinima = eventoCurso.not_min_cur;
        if (isNaN(notaFinalNum) || notaFinalNum < 0 || notaFinalNum > 10) {
          return res.status(400).json({ msg: "Nota inválida (0–10)" });
        }

        if (notaFinalNum < notaMinima) {
          // Si ya se reprobó por asistencia y ahora por nota, es REPROBADO_TOTAL
          if (nuevoEstado === "REPROBADO_ASISTENCIA") {
            nuevoEstado = "REPROBADO_TOTAL";
          } else {
            nuevoEstado = "REPROBADO_NOTA";
          }
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
      console.log(`⚠️ Inscripción finalizando con estado: ${nuevoEstado}`);

      try {
        // Usamos nuestra función centralizada para actualizar el estado
        const resultado = await actualizarEstadoYSincronizarCupos(
          id,
          nuevoEstado,
          { por_asi_fin_usu: asistenciaNum },
          req.usuario.id // Pasar ID del administrador que valida
        );

        console.log(
          `✅ Estado actualizado de ${resultado.inscripcion.estadoAnterior} a ${nuevoEstado}`
        );

        if (resultado.evento.cuposCambiados) {
          console.log(
            `📈 Cupos disponibles actualizados: ${resultado.evento.cuposAntes} → ${resultado.evento.cuposDespues}`
          );
        } else {
          console.log(
            `📊 Cupos disponibles sin cambios: ${resultado.evento.cuposDespues}`
          );
        }

        // Actualizar la nota si es un curso
        if (inscripcion.evento.tip_eve === "CURSO") {
          const inscripcionCurso = await prisma.inscripcion_curso.findUnique({
            where: { id_ins_cur: id },
          });

          if (inscripcionCurso) {
            await prisma.inscripcion_curso.update({
              where: { id_ins_cur: id },
              data: { not_fin_usu: notaFinalNum },
            });
            console.log(`✅ Nota actualizada a: ${notaFinalNum}`);
          } else {
            await prisma.inscripcion_curso.create({
              data: {
                id_ins_cur: id,
                not_fin_usu: notaFinalNum,
              },
            });
            console.log(`✅ Nota registrada: ${notaFinalNum}`);
          }
        }

        // Guardar observación si se proporciona
        if (observacion) {
          await guardarObservacion(id, observacion, req.usuario.id);
        }

        return res.status(200).json({
          msg: `Inscripción finalizada correctamente con estado: ${nuevoEstado}`,
        });
      } catch (error) {
        console.error(`❌ Error al finalizar inscripción:`, error);
        throw error;
      }
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

    // ENFOQUE MEJORADO: UTILIZANDO LA FUNCIÓN CENTRALIZADA DE ACTUALIZACIÓN DE ESTADO
    console.log(`📊 MÉTODO ROBUSTO: Actualización atómica de estado y cupos`);
    console.log(`Cambio de estado: ${estadoAnterior} → ${estadoNuevo}`);
    console.log(`ID Evento: ${idEvento}, ID Inscripción: ${id}`);

    try {
      // Utilizamos la función centralizada que maneja todo en una transacción atómica
      const resultado = await actualizarEstadoYSincronizarCupos(
        id,
        estadoNuevo,
        { por_asi_fin_usu: asistenciaNum }, // Datos adicionales para la actualización
        req.usuario.id // Pasar ID del administrador que valida
      );

      console.log(
        `✅ Actualización de estado y sincronización de cupos completada`
      );
      console.log(
        `📊 Resultado: Estado cambiado de ${resultado.inscripcion.estadoAnterior} a ${resultado.inscripcion.estadoNuevo}`
      );

      if (resultado.evento.cuposCambiados) {
        console.log(
          `📈 Cupos disponibles actualizados de ${resultado.evento.cuposAntes} a ${resultado.evento.cuposDespues}`
        );
      } else {
        console.log(
          `📊 No fue necesario cambiar los cupos disponibles (siguen en ${resultado.evento.cuposDespues})`
        );
      }

      // BLOQUEO AUTOMÁTICO: Si cupos llegan a 0, registrar alerta
      if (resultado.evento.cuposDespues === 0) {
        console.log("🚫 ALERTA: Cupos agotados para este evento");
        // Nota: El bloqueo se maneja en la función crearInscripcion al verificar cup_dis_eve > 0
      }
    } catch (error) {
      console.error(
        "❌ Error en actualización de estado y sincronización de cupos:",
        error
      );
      // Si hay error en la transacción, se hace rollback automáticamente
      throw error; // Propagar el error para que se maneje en el catch global
    }

    // Ahora vamos a eliminar la actualización duplicada que se hacía después de la transacción
    // y solo conservar las actualizaciones de elementos adicionales como observaciones o datos de curso

    // Guardar observación si se proporciona
    if (observacion) {
      try {
        await guardarObservacion(id, observacion, req.usuario.id);
      } catch (error) {
        console.error("Error al procesar observación:", error);
        // Continuar con la operación aunque falle la observación
      }
    }

    // Si es un curso, actualizar la nota final en inscripcion_curso
    if (inscripcion.evento.tip_eve === "CURSO") {
      console.log("Es un curso, actualizando nota final:", notaFinalNum);
      // Buscar si ya existe inscripcion_curso
      const inscripcionCurso = await prisma.inscripcion_curso.findUnique({
        where: { id_ins_cur: id },
      });
      console.log("Inscripción curso existente:", inscripcionCurso);

      if (inscripcionCurso) {
        console.log("Actualizando inscripción curso existente");
        // Actualizar inscripcion_curso existente
        await prisma.inscripcion_curso.update({
          where: { id_ins_cur: id },
          data: {
            not_fin_usu: notaFinalNum,
          },
        });
        console.log("Inscripción curso actualizada correctamente");
      } else {
        console.log("Creando nueva inscripción curso");
        // Crear inscripcion_curso si no existe
        await prisma.inscripcion_curso.create({
          data: {
            id_ins_cur: id,
            not_fin_usu: notaFinalNum,
          },
        });
        console.log("Nueva inscripción curso creada correctamente");
      }
    }

    // Obtener los datos actualizados de la inscripción para devolverlos en la respuesta
    const actualizada = await prisma.inscripcion.findUnique({
      where: { id_ins: id },
    });

    res.status(200).json({
      msg: "Inscripción actualizada correctamente",
      inscripcion: actualizada,
    });

    // 🔌 Notificar cambios por socket
    try {
      // Notificar cambio en inscripción
      socketService.notifyInscriptionChange("updated", {
        id_ins: id,
        estado_anterior: estadoAnterior,
        estado_nuevo: nuevoEstado,
        id_evento: idEvento,
        inscripcion: actualizada,
      });

      // Si hay cambio en cupos, notificar también
      if (
        typeof resultado !== "undefined" &&
        resultado.evento &&
        resultado.evento.cuposCambiados
      ) {
        socketService.notifyCuposChange(
          idEvento,
          resultado.evento.cuposDespues
        );
      }
    } catch (socketError) {
      console.error("Error al enviar notificaciones por socket:", socketError);
      // No interferir con la operación principal
    }

    console.log("============ FIN VALIDAR INSCRIPCIÓN: ÉXITO ============");
  } catch (error) {
    console.error("============ ERROR EN VALIDAR INSCRIPCIÓN ============");
    console.error("Mensaje de error:", error.message);
    console.error("Stack de error:", error.stack);
    res.status(500).json({
      msg: "Error al validar inscripción",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
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
    console.log("========== INICIO REENVIAR COMPROBANTE ==========");
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
    console.log(`Estado actual de la inscripción: ${inscripcion.est_ins}`);
    console.log(`ID del evento: ${inscripcion.id_eve_ins}`);

    // Verificar cupos antes de cualquier operación
    console.log("Verificando cupos iniciales del evento...");
    const cuposIniciales = await prisma.evento.findUnique({
      where: { id_eve: inscripcion.id_eve_ins },
      select: { cup_dis_eve: true, cup_max_eve: true, nom_eve: true },
    });
    console.log(
      `Cupos iniciales para evento '${cuposIniciales.nom_eve}': ${cuposIniciales.cup_dis_eve}/${cuposIniciales.cup_max_eve}`
    );

    // Solo puede reenviar el mismo estudiante
    if (inscripcion.id_cor_ins !== req.usuario.id) {
      return res
        .status(403)
        .json({ msg: "No tienes permiso para modificar esta inscripción" });
    }

    // Verificar si hay cambio de estado que requiere actualización de cupos
    const estadoAnterior = inscripcion.est_ins;
    const estadoNuevo = "PENDIENTE";
    let actualizacionCupo = 0;

    console.log(`Cambio de estado: ${estadoAnterior} → ${estadoNuevo}`);

    // IMPORTANTE: Nunca afectar cupos en el reenvío de comprobante
    // El reenvío es un caso especial que no debe modificar los cupos disponibles
    console.log(
      "‼️ ATENCIÓN: El reenvío de comprobante es un caso especial y no debe modificar cupos"
    );
    actualizacionCupo = 0;

    console.log(
      `‼️ NUNCA se modificarán cupos para reenvío de comprobante en transición ${estadoAnterior} → ${estadoNuevo}`
    );

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

      // Actualizar estado de la inscripción a pendiente y recalcular cupos en una transacción
      console.log(`🔄 Utilizando función robusta para reenvío de comprobante`);

      // Utilizamos la función centralizada que maneja todo en una transacción atómica
      const resultado = await actualizarEstadoYSincronizarCupos(
        id,
        "PENDIENTE" // Siempre cambiamos a PENDIENTE en el reenvío de comprobante
      );

      console.log(
        `✅ Actualización de estado y sincronización de cupos completada`
      );
      console.log(
        `📊 Resultado: Estado cambiado de ${resultado.inscripcion.estadoAnterior} a ${resultado.inscripcion.estadoNuevo}`
      );

      if (resultado.evento.cuposCambiados) {
        console.log(
          `📈 Cupos disponibles actualizados de ${resultado.evento.cuposAntes} a ${resultado.evento.cuposDespues}`
        );
      } else {
        console.log(
          `📊 No fue necesario cambiar los cupos disponibles (siguen en ${resultado.evento.cuposDespues})`
        );
      }

      // Obtener la inscripción actualizada para devolverla en la respuesta
      const actualizada = await prisma.inscripcion.findUnique({
        where: { id_ins: id },
      });
      console.log("Transacción completada correctamente");

      // Verificar cupos finales para confirmar
      try {
        const cuposFinales = await prisma.evento.findUnique({
          where: { id_eve: inscripcion.id_eve_ins },
          select: { cup_dis_eve: true, cup_max_eve: true, nom_eve: true },
        });
        console.log(
          `VERIFICACIÓN FINAL: Cupos para evento '${cuposFinales.nom_eve}': ${cuposFinales.cup_dis_eve}/${cuposFinales.cup_max_eve}`
        );

        // Comparar con cupos iniciales
        const diferencia =
          cuposFinales.cup_dis_eve - cuposIniciales.cup_dis_eve;
        console.log(
          `Diferencia de cupos: ${diferencia} (Deberían ser ${actualizacionCupo})`
        );

        if (diferencia !== actualizacionCupo) {
          console.warn(
            `ADVERTENCIA: La diferencia de cupos (${diferencia}) no coincide con lo esperado (${actualizacionCupo})`
          );
        }
      } catch (error) {
        console.error("Error al verificar cupos finales:", error);
      }

      res.status(200).json({
        msg: "Comprobante reenviado correctamente",
        inscripcion: actualizada,
      });
      console.log("========== FIN REENVIAR COMPROBANTE: ÉXITO ==========");
    } catch (errorSubida) {
      console.error("Error detallado al procesar comprobante:", errorSubida);
      return res.status(500).json({
        msg: "Error al procesar el comprobante de pago",
        error: errorSubida.message,
      });
    }
  } catch (error) {
    console.error("========== ERROR EN REENVIAR COMPROBANTE ==========");
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
        evento: {
          include: {
            eventos_curso: true, // Incluir información del curso si existe
          },
        },
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
