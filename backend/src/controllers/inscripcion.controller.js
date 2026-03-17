const { prisma } = require("../config/db");
const { estado_inscripcion } = require("@prisma/client");
const { subirImagenAImgur } = require("../utils/imgur.utils");
const socketService = require("../services/socket.service");
const {
  calcularCuposDisponibles,
  sincronizarCuposDisponibles,
  actualizarEstadoYSincronizarCupos,
} = require("../utils/cupo.utils");
const { withTenantWhere } = require("../utils/tenantScope");

const LEGACY_REG_STATUS_TO_DB = {
  PENDIENTE: "PENDING",
  ACEPTADA: "ACCEPTED",
  RECHAZADA: "REJECTED",
  APROBADO: "APPROVED",
  REPROBADO_NOTA: "FAILED_GRADE",
  REPROBADO_ASISTENCIA: "FAILED_ATTENDANCE",
  REPROBADO_TOTAL: "FAILED_TOTAL",
};

const FINAL_REG_STATUS_DB = [
  "APPROVED",
  "FAILED_GRADE",
  "FAILED_ATTENDANCE",
  "FAILED_TOTAL",
];

const normalizeRegistrationStatusToDb = (status) =>
  LEGACY_REG_STATUS_TO_DB[status] || status;

const isCourseEventType = (type) => type === "COURSE" || type === "CURSO";

/**
 * Función auxiliar para guardar o actualizar una observación
 * @param {string} idInscripcion - ID de la inscripción
 * @param {string} observacion - Texto de la observación
 * @param {string} idAdmin - ID del administrador que crea la observación
 * @param {string} tenantId - ID del tenant actual
 */
async function guardarObservacion(idInscripcion, observacion, idAdmin, tenantId) {
  // Verificar si ya existe una observación para esta inscripción
  const observacionExistente = await prisma.registrationObservation.findFirst({
    where: withTenantWhere(tenantId, { registrationId: idInscripcion }),
  });

  if (observacionExistente) {
    // Actualizar observación existente

    await prisma.registrationObservation.updateMany({
      where: withTenantWhere(tenantId, { registrationId: idInscripcion }),
      data: {
        observation: observacion,
        createdByAdminId: idAdmin,
      },
    });
  } else {
    // Crear nueva observación

    await prisma.registrationObservation.create({
      data: {
        tenantId,
        registrationId: idInscripcion,
        observation: observacion,
        createdByAdminId: idAdmin,
      },
    });
  }
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
    console.log("🚀 [CREAR_INSCRIPCION] Iniciando proceso de inscripción");
    const { id_eve, carta_motivacion } = req.body;
    const id_cue = req.usuario.id; // Ahora trabajamos con ID de cuenta

    console.log("📝 [CREAR_INSCRIPCION] Datos recibidos:", {
      id_eve,
      id_cue,
      carta_motivacion: carta_motivacion ? "Presente" : "No presente",
      archivo: req.file ? "Presente" : "No presente",
    });

    const archivo = req.file;

    if (!id_cue || !id_eve) {
      console.log("❌ [CREAR_INSCRIPCION] Campos faltantes:", {
        id_cue,
        id_eve,
      });
      return res
        .status(400)
        .json({ msg: "Faltan campos obligatorios: id_cue o id_eve" });
    }

    if (!carta_motivacion) {
      console.log("❌ [CREAR_INSCRIPCION] Carta de motivación faltante");
      return res
        .status(400)
        .json({ msg: "Debe incluir una carta de motivación" });
    }

    // Obtenemos el evento para verificar si tiene costo
    console.log("🔍 [CREAR_INSCRIPCION] Buscando evento:", id_eve);

    const evento = await prisma.event.findFirst({
      where: withTenantWhere(req.tenantId, { id: id_eve }),
    });
    if (!evento) {
      console.log("❌ [CREAR_INSCRIPCION] Evento no encontrado:", id_eve);
      return res.status(404).json({ msg: "Evento no encontrado" });
    }

    console.log("✅ [CREAR_INSCRIPCION] Evento encontrado:", {
      id: evento.id,
      nombre: evento.name,
      valor: evento.price,
      cupos_disponibles: evento.availableSpots,
      cupos_maximos: evento.maxCapacity,
      estado: evento.status,
    });

    // Verificar cupos disponibles
    if (evento.availableSpots <= 0) {
      console.log("❌ [CREAR_INSCRIPCION] Sin cupos disponibles:", {
        cupos_disponibles: evento.availableSpots,
        cupos_maximos: evento.maxCapacity,
      });
      return res.status(400).json({
        msg: "No hay cupos disponibles para este evento",
      });
    }

    // Solo exigimos comprobante para eventos con costo
    if (evento.price > 0 && !archivo) {
      console.log(
        "❌ [CREAR_INSCRIPCION] Comprobante requerido para evento de pago:",
        {
          valor_evento: evento.price,
          archivo_presente: !!archivo,
        }
      );
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
    console.log("🔍 [CREAR_INSCRIPCION] Verificando cuenta:", id_cue);

    const cuenta = await prisma.account.findFirst({
      where: withTenantWhere(req.tenantId, { id: id_cue }),
      include: { user: true },
    });
    if (!cuenta) {
      console.log("❌ [CREAR_INSCRIPCION] Cuenta no encontrada:", id_cue);
      return res.status(404).json({ msg: "Cuenta de usuario no encontrada" });
    }
    console.log(
      `✅ [CREAR_INSCRIPCION] Cuenta encontrada: ${cuenta.email}, usuario: ${cuenta.user.firstName} ${cuenta.user.lastName}`
    );

    // Verificar si el usuario ya está inscrito
    console.log("🔍 [CREAR_INSCRIPCION] Verificando inscripciones previas");

    const yaInscrito = await prisma.registration.findFirst({
      where: withTenantWhere(req.tenantId, { accountId: id_cue, eventId: id_eve }),
    });

    console.log(
      "📋 [CREAR_INSCRIPCION] Resultado verificación inscripción previa:",
      {
        ya_inscrito: !!yaInscrito,
         estado: yaInscrito?.status,
         id_inscripcion: yaInscrito?.id,
      }
    );

    // Permitir reinscripción solo si la inscripción anterior fue rechazada
     if (yaInscrito && yaInscrito.status !== "REJECTED") {
      // Mensaje específico si el usuario ya aprobó el evento
       if (yaInscrito.status === "APPROVED") {
        return res.status(400).json({
          msg: "Ya has aprobado este evento, no puedes inscribirte nuevamente",
        });
      }
      return res.status(400).json({ msg: "Ya estás inscrito en este evento" });
    } // Si la inscripción estaba RECHAZADA, la actualizamos en lugar de crear una nueva
     if (yaInscrito && yaInscrito.status === "REJECTED") {
      try {
        // Usamos nuestra función centralizada para actualizar el estado
        const resultado = await actualizarEstadoYSincronizarCupos(
           yaInscrito.id,
          "PENDING",
           { registeredAt: new Date() } // Actualizar fecha de inscripción
        );

        // Si hay un archivo, lo procesamos
        let urlComprobante = null;
        if (archivo) {
          try {
            // Subir la imagen a Imgur
            urlComprobante = await subirImagenAImgur(archivo);

            // Guardar el comprobante
            await prisma.paymentReceipt.create({
              data: {
                registrationId: yaInscrito.id,
                documentUrl: urlComprobante,
                tenantId: req.tenantId,
              },
            });
          } catch (imgurError) {
            console.error(`Error al subir imagen a Imgur:`, imgurError);
            return res
              .status(500)
              .json({ msg: "Error al procesar el comprobante" });
          }
        } // Si hay carta de motivación, la actualizamos
        if (carta_motivacion) {
          // Verificar si ya existe una carta
          const cartaExistente = await prisma.motivationLetter.findFirst({
            where: withTenantWhere(req.tenantId, {
              registrationId: yaInscrito.id,
            }),
          });
          if (cartaExistente) {
            // Actualizar carta existente
            await prisma.motivationLetter.updateMany({
              where: withTenantWhere(req.tenantId, { id: cartaExistente.id }),
              data: { content: carta_motivacion },
            });
          } else {
            // Crear nueva carta
            await prisma.motivationLetter.create({
              data: {
                registrationId: yaInscrito.id,
                content: carta_motivacion,
                tenantId: req.tenantId,
              },
            });
          }
        }

        // Obtener datos completos del evento para la notificación
        const eventoCompleto = await prisma.event.findFirst({
          where: withTenantWhere(req.tenantId, { id: id_eve }),
          select: {
            id: true,
            name: true,
            maxCapacity: true,
            availableSpots: true,
            startDate: true,
            status: true,
          },
        });

        // Obtener datos completos de la inscripción actualizada
          const inscripcionActualizada = await prisma.registration.findFirst({
            where: withTenantWhere(req.tenantId, { id: yaInscrito.id }),
          include: {
            account: {
              include: {
                user: true,
              },
            },
             event: true,
          },
        });

        console.log(
          "📊 [CREAR_INSCRIPCION] Enviando notificaciones para inscripción actualizada (RECHAZADA -> PENDIENTE)"
        );

        console.log(
          "📋 [CREAR_INSCRIPCION] Datos de la inscripción actualizada:",
          {
             id: inscripcionActualizada.id,
             estado: inscripcionActualizada.status,
             usuario: inscripcionActualizada.account?.user?.firstName,
             evento: inscripcionActualizada.event?.name,
          }
        );

        // Notificación general de cambio de inscripción
        console.log("🔔 [CREAR_INSCRIPCION] Enviando notificación general...");
        socketService.notifyInscriptionChange("updated", {
          inscripcion: inscripcionActualizada,
          evento: eventoCompleto,
        });

        // Notificación específica para validación de inscripciones
        console.log(
          "🔔 [CREAR_INSCRIPCION] Enviando notificación de validación..."
        );
        socketService.notifyInscriptionValidation("new_inscription", {
          id: yaInscrito.id,
          correo: cuenta.email,
          estado: "PENDIENTE",
          evento: eventoCompleto,
          fechaCreacion: new Date(),
          requiresValidation: true,
        });

        // Notificación a administradores
        console.log(
          "🔔 [CREAR_INSCRIPCION] Enviando notificación a administradores..."
        );
        socketService.notifyAdmins(
          `Reinscripción pendiente de validación para "${eventoCompleto.name}"`,
          "info",
          {
            inscriptionId: yaInscrito.id,
            eventId: id_eve,
            actionRequired: true,
            isResubmission: true,
          }
        );

        console.log(
          "✅ [CREAR_INSCRIPCION] Notificaciones enviadas para reinscripción"
        );

        return res.status(200).json({
          msg: "Inscripción actualizada correctamente",
          id: yaInscrito.id,
        });
      } catch (error) {
        throw error;
      }
    }

    try {
      console.log(
        `🏗️ [CREAR_INSCRIPCION] Creando nueva inscripción para el usuario ${id_cue} en evento ${id_eve}`
      );

      // Realizamos todo el proceso en una transacción para garantizar consistencia
      await prisma
        .$transaction(async (tx) => {
          console.log("🔄 [CREAR_INSCRIPCION] Iniciando transacción");

          // 1. Recalcular cupos disponibles antes de crear la inscripción para verificar
          const { disponibles } = await calcularCuposDisponibles(id_eve, tx);
          console.log(
            `📊 [CREAR_INSCRIPCION] Cupos disponibles actuales verificados: ${disponibles}`
          );

          if (disponibles <= 0) {
            console.log(
              "❌ [CREAR_INSCRIPCION] Sin cupos en verificación final"
            );
            throw new Error("No hay cupos disponibles para este evento");
          }

          // 2. Crear la inscripción
          console.log("✨ [CREAR_INSCRIPCION] Creando registro de inscripción");
         const nuevaInscripcion = await tx.registration.create({
            data: {
             accountId: id_cue,
             eventId: id_eve,
             status: "PENDING",
             occupiesSpot: false, // Las inscripciones PENDIENTES no ocupan cupo
             tenantId: req.tenantId,
            },
          });
          console.log("✅ [CREAR_INSCRIPCION] Inscripción creada:", {
           id: nuevaInscripcion.id,
           estado: nuevaInscripcion.status,
           fecha: nuevaInscripcion.registeredAt,
          });

          // 3. Crear la carta de motivación
          console.log("📝 [CREAR_INSCRIPCION] Creando carta de motivación");
          await tx.motivationLetter.create({
            data: {
              registrationId: nuevaInscripcion.id,
              content: carta_motivacion,
              status: "PENDING",
              tenantId: req.tenantId,
            },
          });
          console.log("✅ [CREAR_INSCRIPCION] Carta de motivación creada");

          // 4. No es necesario sincronizar cupos aquí ya que el estado es PENDIENTE
          // y solo las inscripciones ACEPTADAS afectan los cupos disponibles

          console.log(
            "✅ [CREAR_INSCRIPCION] Transacción completada exitosamente"
          );
          // Devolvemos la inscripción creada para usarla fuera de la transacción
          return nuevaInscripcion;
        })
        .then(async (nuevaInscripcion) => {
          // Este bloque se ejecuta después de que la transacción se ha completado con éxito
          console.log("📤 [CREAR_INSCRIPCION] Procesando post-transacción");

          // Si se proporciona un archivo, lo procesamos después de la transacción principal
          // para no bloquear la creación de la inscripción si hay problemas con la imagen
          if (archivo) {
            console.log("📎 [CREAR_INSCRIPCION] Procesando archivo adjunto");
            try {
              // Subir la imagen a Imgur
              const imgurUrl = await subirImagenAImgur(archivo);
              console.log(
                "✅ [CREAR_INSCRIPCION] Imagen subida a Imgur:",
                imgurUrl
              );

              // Crear el comprobante de pago con la URL de Imgur
              await prisma.paymentReceipt.create({
                data: {
                  registrationId: nuevaInscripcion.id,
                  documentUrl: imgurUrl,
                  status: "PENDING",
                  tenantId: req.tenantId,
                },
              });
              console.log("✅ [CREAR_INSCRIPCION] Comprobante de pago creado");
            } catch (imgurError) {
              console.error(
                `❌ [CREAR_INSCRIPCION] Error al subir imagen a Imgur:`,
                imgurError
              );
              // Si falla la subida a Imgur, registramos el error pero continuamos con la inscripción
              await prisma.paymentReceipt.create({
                data: {
                  registrationId: nuevaInscripcion.id,
                  documentUrl: "Error al subir imagen",
                  status: "ERROR",
                  tenantId: req.tenantId,
                },
              });
            }
          }

          // Verificamos los cupos después de todo el proceso
          console.log("🔄 [CREAR_INSCRIPCION] Sincronizando cupos disponibles");
          await sincronizarCuposDisponibles(id_eve);

          console.log(
            "✅ [CREAR_INSCRIPCION] Inscripción creada exitosamente, enviando respuesta"
          );
          res.status(201).json(nuevaInscripcion);

          // 🔌 Notificar nueva inscripción por socket
          console.log(
            "📡 [CREAR_INSCRIPCION] Iniciando notificaciones por socket"
          );
          try {
            // Obtener datos completos del evento para la notificación
            const eventoCompleto = await prisma.event.findFirst({
              where: withTenantWhere(req.tenantId, { id: id_eve }),
              select: {
                id: true,
                name: true,
                maxCapacity: true,
                availableSpots: true,
                startDate: true,
                status: true,
              },
            });

            console.log(
              "📊 [CREAR_INSCRIPCION] Datos del evento para notificación:",
              eventoCompleto
            );

            // Notificación general
            console.log(
              "📢 [CREAR_INSCRIPCION] Enviando notificación general de cambio de inscripción"
            );
            socketService.notifyInscriptionChange("created", {
              inscripcion: nuevaInscripcion,
              evento: eventoCompleto,
            });

            // Notificación específica para validación de inscripciones
            console.log(
              "🔔 [CREAR_INSCRIPCION] Enviando notificación para validación de inscripciones"
            );
            socketService.notifyInscriptionValidation("new_inscription", {
              id: nuevaInscripcion.id,
              correo: cuenta.email,
              estado: nuevaInscripcion.status,
              evento: eventoCompleto,
              fechaCreacion: nuevaInscripcion.registeredAt,
              requiresValidation: nuevaInscripcion.status === "PENDING",
            });

            // Verificar si necesita alerta de capacidad (menos del 20% de cupos)
            const porcentajeDisponible =
              (eventoCompleto.availableSpots / eventoCompleto.maxCapacity) * 100;
            console.log(
              `📈 [CREAR_INSCRIPCION] Porcentaje de cupos disponibles: ${porcentajeDisponible}%`
            );

            if (porcentajeDisponible <= 20 && porcentajeDisponible > 0) {
              console.log(
                "⚠️ [CREAR_INSCRIPCION] Enviando alerta de capacidad"
              );
              socketService.notifyCapacityAlert(eventoCompleto);
            }

            // Notificación a administradores si es inscripción pendiente
            if (nuevaInscripcion.status === "PENDING") {
              console.log(
                "👨‍💼 [CREAR_INSCRIPCION] Enviando notificación a administradores"
              );
              socketService.notifyAdmins(
                `Nueva inscripción pendiente de validación para "${eventoCompleto.name}"`,
                "info",
                {
                  inscriptionId: nuevaInscripcion.id,
                  eventId: id_eve,
                  actionRequired: true,
                }
              );
            }

            console.log(
              "✅ [CREAR_INSCRIPCION] Todas las notificaciones por socket enviadas exitosamente"
            );
          } catch (socketError) {
            console.error(
              "❌ [CREAR_INSCRIPCION] Error al enviar notificación por socket:",
              socketError
            );
            // No interferir con la operación principal
          }
        });
    } catch (error) {
      console.error(
        `❌ [CREAR_INSCRIPCION] Error en el bloque de creación de inscripción:`,
        error
      );

      if (error.message === "No hay cupos disponibles para este evento") {
        console.log(
          "❌ [CREAR_INSCRIPCION] Error de cupos - enviando respuesta 400"
        );
        return res.status(400).json({
          msg: error.message,
        });
      }

      if (
        error.code === "P2002" &&
        error.meta?.target?.includes("id_cor_ins_id_eve_ins")
      ) {
        console.log(
          "❌ [CREAR_INSCRIPCION] Error de duplicación - enviando respuesta 400"
        );
        return res.status(400).json({
          msg: "Ya existe una inscripción para este evento con este usuario",
        });
      }

      // Otro tipo de error desconocido
      console.log("❌ [CREAR_INSCRIPCION] Error desconocido, relanzando");
      throw error;
    }
  } catch (error) {
    console.error(`💥 [CREAR_INSCRIPCION] Error general en crearInscripcion:`, {
      message: error.message,
      code: error.code,
      stack:
        process.env.NODE_ENV === "development"
          ? error.stack
          : "Stack oculto en producción",
    });
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
    console.log("🎯 [VALIDAR] Iniciando validación de inscripción");
    console.log("🔑 [VALIDAR] Usuario en request:", req.usuario);

    const { id } = req.params;
    const estadoEntrada = req.body.status ?? req.body.est_ins;
    const asistenciaEntrada =
      req.body.finalAttendancePercent ??
      req.body.por_asi_fin_usu ??
      req.body.asistencia;
    const notaFinalEntrada = req.body.finalGrade ?? req.body.nota_final;
    const { observacion } = req.body;

    // Declarar resultado al inicio para que esté disponible en todo el scope
    let resultado = null;

    console.log("📋 [VALIDAR] Datos recibidos:", {
      id_inscripcion: id,
      status: estadoEntrada,
      finalAttendancePercent: asistenciaEntrada,
      finalGrade: notaFinalEntrada,
      observacion,
    });

    // Verificar estados permitidos con el enum
    const estadosPermitidos = [
      "PENDING",
      "ACCEPTED",
      "REJECTED",
      "APPROVED",
      "FAILED_GRADE",
      "FAILED_ATTENDANCE",
      "FAILED_TOTAL",
      "PENDIENTE",
      "ACEPTADA",
      "RECHAZADA",
      "APROBADO",
      "REPROBADO_NOTA",
      "REPROBADO_ASISTENCIA",
      "REPROBADO_TOTAL",
    ];

    if (!estadosPermitidos.includes(estadoEntrada)) {
      console.error("Estado inválido:", estadoEntrada);
      return res.status(400).json({ msg: "Estado inválido: " + estadoEntrada });
    }

    // Obtener la inscripción actual con datos del evento
    const inscripcion = await prisma.registration.findFirst({
      where: withTenantWhere(req.tenantId, { id }),
      include: {
        event: {
          include: {
            eventCourse: true, // Incluir datos del curso si existe
          },
        },
      },
    });

    if (!inscripcion) {
      return res.status(404).json({ msg: "Inscripción no encontrada" });
    }

    const estadoNuevo = normalizeRegistrationStatusToDb(estadoEntrada);
    const estadoAnterior = inscripcion.status;
    const idEvento = inscripcion.eventId;

    // Validación especial: no permitir cambio de APROBADO o REPROBADO a RECHAZADA
    const estadosFinales = FINAL_REG_STATUS_DB;
    if (
      estadosFinales.includes(estadoAnterior) &&
      estadoNuevo === "REJECTED"
    ) {
      return res.status(400).json({
        msg: "No se puede cambiar una inscripción finalizada (APROBADO o REPROBADO) a RECHAZADA.",
      });
    }

    // Verificación para REPROBADO/APROBADO
    if (
      estadosFinales.includes(estadoAnterior) &&
      (estadoNuevo === "PENDING" || estadoNuevo === "REJECTED")
    ) {
      console.log(
        `ALERTA: Se intenta cambiar de ${estadoAnterior} a ${estadoNuevo}, lo cual podría afectar los cupos`
      );
      // Permitimos la operación pero registramos la alerta
    }

    let asistenciaNum = asistenciaEntrada !== undefined ? Number(asistenciaEntrada) : -1;
    // Usar null en lugar de -1 para notas no definidas
    let notaFinalNum =
      notaFinalEntrada !== undefined ? Number(notaFinalEntrada) : null;

    let nuevoEstado = estadoNuevo; // Usamos el estado enviado si no se especifican asistencia ni nota

    // Si no se proporciona asistencia, no se entra en la lógica de validación de asistencia y nota
    if (asistenciaNum !== -1 || notaFinalNum !== null) {
      // Inicializar el nuevo estado como APROBADO (cambiará según validaciones)
      nuevoEstado = "APPROVED";

      // Validación de asistencia
      if (asistenciaNum !== -1) {
        const asistenciaMinima = inscripcion.event.minAttendancePercent;
        if (isNaN(asistenciaNum) || asistenciaNum < 0 || asistenciaNum > 100) {
          return res.status(400).json({ msg: "Asistencia inválida (0–100)" });
        }

        // Si la asistencia es baja, reprobar por asistencia independientemente de la nota
        if (asistenciaNum < asistenciaMinima) {
          nuevoEstado = "FAILED_ATTENDANCE";
        }
      }

      // Validación de nota final (solo para eventos tipo CURSO)
      if (isCourseEventType(inscripcion.event.type) && notaFinalNum !== null) {
        const eventoCurso = await prisma.eventCourse.findUnique({
          where: { eventId: inscripcion.event.id },
        });

        // Verificar que el evento_curso existe
        if (!eventoCurso) {
          console.error(
            `❌ No se encontró configuración de curso para el evento ID: ${inscripcion.event.id}`
          );
          console.error(
            `❌ Evento: "${inscripcion.event.name}" es de tipo CURSO pero no tiene registro en eventCourse`
          );
          return res.status(400).json({
            msg: "Error: Este evento de tipo CURSO no tiene configuración de nota mínima. Contacte al administrador.",
            evento: inscripcion.event.name,
            eventoId: inscripcion.event.id,
          });
        }

        const notaMinima = eventoCurso.minPassingGrade;
        if (isNaN(notaFinalNum) || notaFinalNum < 0 || notaFinalNum > 10) {
          return res.status(400).json({ msg: "Nota inválida (0–10)" });
        }

        if (notaFinalNum < notaMinima) {
          // Si ya se reprobó por asistencia y ahora por nota, es REPROBADO_TOTAL
          if (nuevoEstado === "FAILED_ATTENDANCE") {
            nuevoEstado = "FAILED_TOTAL";
          } else {
            nuevoEstado = "FAILED_GRADE";
          }
        }
        // NOTA: Ya no establecemos APROBADO aquí, porque podría sobreescribir REPROBADO_ASISTENCIA
      }
    }

    if (
      nuevoEstado === "APPROVED" ||
      nuevoEstado === "FAILED_GRADE" ||
      nuevoEstado === "FAILED_ATTENDANCE" ||
      nuevoEstado === "FAILED_TOTAL"
    ) {
      try {
        // Preparar datos adicionales solo si se proporcionan valores válidos
        const datosAdicionales = {};
        if (asistenciaNum !== -1) {
          datosAdicionales.finalAttendancePercent = asistenciaNum;
        }

        // Usamos nuestra función centralizada para actualizar el estado
        const resultado = await actualizarEstadoYSincronizarCupos(
          id,
          nuevoEstado,
          datosAdicionales,
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

        // 🔌 Notificar al usuario del cambio a estado final (APROBADO/REPROBADO)
        const inscripcionUsuario = await prisma.registration.findFirst({
          where: withTenantWhere(req.tenantId, { id }),
          select: {
            id: true,
            accountId: true,
            status: true,
            event: {
              select: {
                id: true,
                name: true,
                startDate: true,
                endDate: true,
                type: true,
              },
            },
            observation: {
              select: {
                observation: true,
              },
            },
          },
        });

        if (inscripcionUsuario && inscripcionUsuario.accountId) {
          const datosParaUsuario = {
            id: inscripcionUsuario.id,
            status: nuevoEstado,
            estadoAnterior: resultado.inscripcion.estadoAnterior,
            estadoNuevo: nuevoEstado,
            event: inscripcionUsuario.event,
            observation: inscripcionUsuario.observation?.observation,
            fecha_validacion: new Date(),
          };

          socketService.notifyUserInscriptionChange(
            inscripcionUsuario.accountId,
            datosParaUsuario
          );
        }

        // Actualizar la nota si es un curso
        if (isCourseEventType(inscripcion.event.type)) {
          const inscripcionCurso = await prisma.registrationCourse.findUnique({
            where: { registrationId: id },
          });

          if (inscripcionCurso) {
            await prisma.registrationCourse.update({
              where: { registrationId: id },
              data: { finalGrade: notaFinalNum },
            });
          } else {
            await prisma.registrationCourse.create({
              data: {
                registrationId: id,
                finalGrade: notaFinalNum,
              },
            });
          }
        }

        // Guardar observación si se proporciona
        if (observacion) {
          await guardarObservacion(id, observacion, req.usuario.id, req.tenantId);
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
    if (estadoAnterior === "PENDING" && estadoNuevo === "ACCEPTED") {
      if (inscripcion.event.availableSpots <= 0) {
        return res.status(400).json({
          msg: "No se puede aceptar la inscripción: no hay cupos disponibles para este evento",
        });
      }
    }

    // ENFOQUE MEJORADO: UTILIZANDO LA FUNCIÓN CENTRALIZADA DE ACTUALIZACIÓN DE ESTADO

    try {
      // Preparar datos adicionales solo si se proporcionan valores válidos
      const datosAdicionales = {};
      if (asistenciaNum !== -1) {
        datosAdicionales.finalAttendancePercent = asistenciaNum;
      }

      // Utilizamos la función centralizada que maneja todo en una transacción atómica
      resultado = await actualizarEstadoYSincronizarCupos(
        id,
        estadoNuevo,
        datosAdicionales, // Datos adicionales para la actualización
        req.usuario.id // Pasar ID del administrador que valida
      );

      console.log(
        `✅ Actualización de estado y sincronización de cupos completada`
      );
      console.log(
        `📊 Resultado: Estado cambiado de ${resultado.inscripcion.estadoAnterior} a ${resultado.inscripcion.estadoNuevo}`
      );

      if (resultado.evento.cuposCambiaron) {
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
        await guardarObservacion(id, observacion, req.usuario.id, req.tenantId);
      } catch (error) {
        console.error("Error al procesar observación:", error);
        // Continuar con la operación aunque falle la observación
      }
    }

    // Si es un curso, actualizar la nota final en inscripcion_curso
    if (isCourseEventType(inscripcion.event.type)) {
      // Buscar si ya existe inscripcion_curso
      const inscripcionCurso = await prisma.registrationCourse.findUnique({
        where: { registrationId: id },
      });

      if (inscripcionCurso) {
        // Actualizar inscripcion_curso existente
        await prisma.registrationCourse.update({
          where: { registrationId: id },
          data: {
            finalGrade: notaFinalNum,
          },
        });
      } else {
        // Crear inscripcion_curso si no existe
        await prisma.registrationCourse.create({
          data: {
            registrationId: id,
            finalGrade: notaFinalNum,
          },
        });
      }
    }

    // 🔌 Notificar cambios por socket
    try {
      // Obtener los datos actualizados de la inscripción para devolverlos en la respuesta
      const actualizada = await prisma.registration.findFirst({
        where: withTenantWhere(req.tenantId, { id }),
      });

      // Enviar respuesta al cliente ANTES de las notificaciones
      res.status(200).json({
        msg: "Inscripción actualizada correctamente",
        inscripcion: actualizada,
      });

      // Obtener datos completos del evento
      const eventoCompleto = await prisma.event.findFirst({
        where: withTenantWhere(req.tenantId, { id: idEvento }),
        select: {
          id: true,
          name: true,
          maxCapacity: true,
          availableSpots: true,
          startDate: true,
          status: true,
        },
      });

      // Obtener ID del usuario propietario de la inscripción
      const inscripcionConUsuario = await prisma.registration.findFirst({
        where: withTenantWhere(req.tenantId, { id }),
        select: {
          id: true,
          accountId: true,
        },
      });

      // Notificar específicamente al usuario propietario de la inscripción
      if (inscripcionConUsuario && inscripcionConUsuario.accountId) {
        const inscripcionCompleta = await prisma.registration.findFirst({
          where: withTenantWhere(req.tenantId, { id }),
          include: {
            event: true,
            observation: true,
          },
        });

        // Formatear datos para el usuario
        const datosParaUsuario = {
          id: inscripcionCompleta.id,
          status: nuevoEstado,
          estadoAnterior: estadoAnterior,
          estadoNuevo: nuevoEstado,
          event: inscripcionCompleta.event,
          observation: inscripcionCompleta.observation?.observation,
          fecha_validacion: new Date(),
        };

        // Notificar al usuario propietario
        socketService.notifyUserInscriptionChange(
          inscripcionConUsuario.accountId,
          datosParaUsuario
        );
      }

      // Notificar cambio en inscripción (general)
      socketService.notifyInscriptionChange("updated", {
        id_ins: id,
        estado_anterior: estadoAnterior,
        estado_nuevo: nuevoEstado,
        id_evento: idEvento,
        evento: eventoCompleto,
      });

      // Notificar específicamente a la vista de validación
      socketService.notifyInscriptionValidation("status_changed", {
        id: id,
        estadoAnterior: estadoAnterior,
        estadoNuevo: nuevoEstado,
        correo: inscripcionConUsuario.accountId,
        evento: {
          id: eventoCompleto.id,
          titulo: eventoCompleto.name,
          cupos_totales: eventoCompleto.maxCapacity,
          cupos_disponibles: eventoCompleto.availableSpots,
          fecha_inicio: eventoCompleto.startDate,
          estado: eventoCompleto.status,
        },
        fechaValidacion: new Date(),
        validadoPor: req.usuario?.id || null,
        requiresAction: nuevoEstado === "P", // Si vuelve a pendiente
      });

      // Notificar a administradores sobre el cambio de estado
      const estadoTexto = {
        A: "Aprobada",
        R: "Rechazada",
        P: "Pendiente",
      };

      socketService.notifyAdmins(
        `Inscripción ${estadoTexto[nuevoEstado]} para "${eventoCompleto.name}"`,
        nuevoEstado === "A"
          ? "success"
          : nuevoEstado === "R"
          ? "warning"
          : "info",
        {
          inscriptionId: id,
          eventId: idEvento,
          previousState: estadoAnterior,
          newState: nuevoEstado,
          validatedBy: req.usuario?.id || null,
        }
      );

      // Si hay cambio en cupos, notificar también
      if (
        typeof resultado !== "undefined" &&
        resultado.evento &&
        resultado.evento.cuposCambiaron
      ) {
        socketService.notifyCuposChange(
          idEvento,
          resultado.evento.cuposDespues
        );

        // Verificar alerta de capacidad
        const porcentajeDisponible =
          (resultado.evento.cuposDespues / eventoCompleto.maxCapacity) * 100;
        if (porcentajeDisponible <= 20 && porcentajeDisponible > 0) {
          socketService.notifyCapacityAlert({
             id: eventoCompleto.id,
             titulo: eventoCompleto.name,
             cupos_totales: eventoCompleto.maxCapacity,
            cupos_disponibles: resultado.evento.cuposDespues,
             fecha_inicio: eventoCompleto.startDate,
             estado: eventoCompleto.status,
          });
        }
      }
    } catch (socketError) {
      console.error("Error al enviar notificaciones por socket:", socketError);
      // No interferir con la operación principal
    }
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
    const inscripciones = await prisma.registration.findMany({
      where: withTenantWhere(req.tenantId, { accountId: id }),
      include: {
        account: {
          include: {
            user: true,
          },
        },
        event: {
          include: {
            eventCourse: true,
          },
        },
        registrationCourse: true,
        certificate: true,
        paymentReceipts: {
          orderBy: { uploadedAt: "desc" },
          take: 1,
        },
        motivationLetters: {
          orderBy: { uploadedAt: "desc" },
          take: 1,
        },
        observation: true,
      },
      orderBy: { registeredAt: "desc" },
    }); // Mapear los resultados para tener una estructura más limpia
    const inscripcionesMapeadas = inscripciones.map((inscripcion) => ({
      id: inscripcion.id,
      status: inscripcion.status,
      registeredAt: inscripcion.registeredAt,
      finalAttendancePercent:
        inscripcion.finalAttendancePercent === -1 ? null : inscripcion.finalAttendancePercent,
      finalGrade: inscripcion.registrationCourse?.finalGrade || null,
      paymentReceipt: inscripcion.paymentReceipts[0]?.documentUrl || null,
      motivation: inscripcion.motivationLetters[0]?.content || null,
      observation: inscripcion.observation?.observation || null,
      // Mapear datos del usuario (compatibilidad con frontend)
      usuario: inscripcion.account?.user
        ? {
            nom_usu: inscripcion.account.user.firstName,
            ape_usu: inscripcion.account.user.lastName,
            cor_usu: inscripcion.account.email,
            com_usu: inscripcion.account.user.phone || null,
          }
        : null,
      // Mantener estructura de cuenta para compatibilidad
      cuenta: {
        cor_usu: inscripcion.account?.email,
        usuario: inscripcion.account?.user
          ? {
              nom_usu: inscripcion.account.user.firstName,
              ape_usu: inscripcion.account.user.lastName,
              com_usu: inscripcion.account.user.phone || null,
            }
          : null,
      },
      // Mapear datos del evento
      evento: inscripcion.event
        ? {
            id_eve: inscripcion.event.id,
            nom_eve: inscripcion.event.name,
            tip_eve: inscripcion.event.type,
            val_eve: inscripcion.event.price,
            est_eve: inscripcion.event.status,
            por_min_asi_eve: inscripcion.event.minAttendancePercent,
            eventos_curso: inscripcion.event.eventCourse,
          }
        : null,
      // Mapear datos de certificado si existe
      certificado: inscripcion.certificate,
      // Función onVerCarta para compatibilidad (se define en el frontend)
      onVerCarta: null,
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

    const inscripcion = await prisma.registration.findFirst({
      where: withTenantWhere(req.tenantId, { id }),
      include: {
        event: true,
        registrationCourse: true,
        certificate: true,
      },
    });

    if (!inscripcion) {
      return res.status(404).json({ msg: "Inscripción no encontrada" });
    }

    // Verificar si ya tiene certificado
    if (inscripcion.certificate) {
      return res.status(400).json({
        msg: "Ya existe un certificado para esta inscripción",
        certificado: inscripcion.certificate,
      });
    }

    if (inscripcion.status !== "APPROVED") {
      return res.status(400).json({ msg: "Inscripción no está aprobada" });
    }

    if (isCourseEventType(inscripcion.event.type)) {
      // Buscar la información de nota mínima del curso
      const eventoCurso = await prisma.eventCourse.findUnique({
        where: { eventId: inscripcion.event.id },
      });

      const notaMinima = eventoCurso ? eventoCurso.minPassingGrade : 8;
      const asistenciaMinima = inscripcion.event.minAttendancePercent ?? 80;
      const notaFinal = inscripcion.registrationCourse?.finalGrade || 0;
      const asistencia = inscripcion.finalAttendancePercent || 0;

      if (notaFinal >= notaMinima && asistencia >= asistenciaMinima) {
        return res.status(200).json({ puedeGenerar: true, tipo: "APROBADO" });
      } else {
        return res
          .status(200)
          .json({ puedeGenerar: false, tipo: "NO_APROBADO" });
      }
    } else {
      // Otros tipos de evento: solo asistencia requerida
      if ((inscripcion.finalAttendancePercent ?? 0) >= 80) {
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
    const inscripcion = await prisma.registration.findFirst({
      where: withTenantWhere(req.tenantId, { id }),
      include: { account: true, event: true },
    });

    if (!inscripcion) {
      return res.status(404).json({ msg: "Inscripción no encontrada" });
    }

    console.log(
      `Inscripción encontrada: ${inscripcion.id}, Usuario: ${inscripcion.accountId}, Solicitante: ${req.usuario.id}`
    );

    console.log(`ID del evento: ${inscripcion.eventId}`);

    // Verificar cupos antes de cualquier operación
    console.log("Verificando cupos iniciales del evento...");
    const cuposIniciales = await prisma.event.findFirst({
      where: withTenantWhere(req.tenantId, { id: inscripcion.eventId }),
      select: { availableSpots: true, maxCapacity: true, name: true },
    });
    console.log(
      `Cupos iniciales para evento '${cuposIniciales.name}': ${cuposIniciales.availableSpots}/${cuposIniciales.maxCapacity}`
    );

    // Solo puede reenviar el mismo estudiante
    if (inscripcion.accountId !== req.usuario.id) {
      return res
        .status(403)
        .json({ msg: "No tienes permiso para modificar esta inscripción" });
    }

    // Verificar si hay cambio de estado que requiere actualización de cupos
    const estadoAnterior = inscripcion.status;
    const estadoNuevo = "PENDING";
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
      await prisma.paymentReceipt.create({
        data: {
          registrationId: id,
          documentUrl: imgurUrl,
          status: "PENDING",
          tenantId: req.tenantId,
        },
      });
      console.log("Comprobante registrado en la base de datos");

      // Actualizar estado de la inscripción a pendiente y recalcular cupos en una transacción
      console.log(`🔄 Utilizando función robusta para reenvío de comprobante`);

      // Utilizamos la función centralizada que maneja todo en una transacción atómica
      const resultado = await actualizarEstadoYSincronizarCupos(
        id,
        "PENDING" // Siempre cambiamos a PENDING en el reenvío de comprobante
      );

      console.log(
        `✅ Actualización de estado y sincronización de cupos completada`
      );
      console.log(
        `📊 Resultado: Estado cambiado de ${resultado.inscripcion.estadoAnterior} a ${resultado.inscripcion.estadoNuevo}`
      );

      if (resultado.evento.cuposCambiaron) {
        console.log(
          `📈 Cupos disponibles actualizados de ${resultado.evento.cuposAntes} a ${resultado.evento.cuposDespues}`
        );
      } else {
        console.log(
          `📊 No fue necesario cambiar los cupos disponibles (siguen en ${resultado.evento.cuposDespues})`
        );
      }

      // Obtener la inscripción actualizada para devolverla en la respuesta
      const actualizada = await prisma.registration.findFirst({
        where: withTenantWhere(req.tenantId, { id }),
      });
      console.log("Transacción completada correctamente");

      // Verificar cupos finales para confirmar
      try {
        const cuposFinales = await prisma.event.findFirst({
          where: withTenantWhere(req.tenantId, { id: inscripcion.eventId }),
          select: { availableSpots: true, maxCapacity: true, name: true },
        });
        console.log(
          `VERIFICACIÓN FINAL: Cupos para evento '${cuposFinales.name}': ${cuposFinales.availableSpots}/${cuposFinales.maxCapacity}`
        );

        // Comparar con cupos iniciales
        const diferencia =
          cuposFinales.availableSpots - cuposIniciales.availableSpots;
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

    // Verificación específica del evento
    const eventoRaw = await prisma.event.findFirst({
      where: withTenantWhere(req.tenantId, { id }),
    });

    if (eventoRaw) {
      // Evento encontrado
    } else {
      console.log(`No se encontró el evento con ID: ${id}`);
    }

    // Verificar si existe información de curso
    if (isCourseEventType(eventoRaw?.type)) {
      const eventoCurso = await prisma.eventCourse.findUnique({
        where: { eventId: id },
      });

      if (eventoCurso) {
        console.log(`📊 [DEBUG] Datos del curso encontrados:`);
        console.log(
          `  - minPassingGrade: "${
            eventoCurso.minPassingGrade
          }" (tipo: ${typeof eventoCurso.minPassingGrade})`
        );
      } else {
        console.log(
          `⚠️ [DEBUG] No se encontró información de curso para este evento tipo CURSO`
        );
      }
    }

    const inscripciones = await prisma.registration.findMany({
      where: withTenantWhere(req.tenantId, { eventId: id }),
      include: {
        account: {
          include: {
            user: true,
          },
        },
        event: {
          include: {
            eventCourse: true, // Incluir toda la información del curso
          },
        },
        registrationCourse: true,
        paymentReceipts: {
          orderBy: { uploadedAt: "desc" },
          take: 1,
        },
        motivationLetters: {
          orderBy: { uploadedAt: "desc" },
          take: 1,
        },
        observation: true,
        certificate: true,
      },
      orderBy: { registeredAt: "desc" },
    });

    // Verificar directamente los datos del evento
    console.log(`🔍 Verificando datos del evento directamente desde DB...`);
    const eventoDirecto = await prisma.event.findFirst({
      where: withTenantWhere(req.tenantId, { id }),
      include: {
        eventCourse: true,
      },
    });

    if (eventoDirecto) {
      console.log(`📊 Datos directos del evento "${eventoDirecto.name}":`);
      console.log(`  - minAttendancePercent: ${eventoDirecto.minAttendancePercent}`);
      console.log(`  - type: ${eventoDirecto.type}`);
      console.log(`  - eventCourse:`, eventoDirecto.eventCourse);
    } else {
      console.log(`❌ No se encontró el evento con ID: ${id}`);
    }

    try {
      console.log(`📋 Obteniendo inscripciones para evento ID: ${id}`);
      console.log(
        `📊 Total inscripciones encontradas: ${inscripciones.length}`
      );

      // Log detallado del primer evento para debugging
      if (inscripciones.length > 0) {
        const primeraInscripcion = inscripciones[0];
        console.log(`🔍 Debugging datos del evento desde inscripción:`);
        console.log(
          `  - Event object:`,
          JSON.stringify(primeraInscripcion.event, null, 2)
        );
        console.log(
          `  - minAttendancePercent:`,
          primeraInscripcion.event.minAttendancePercent
        );
        console.log(
          `  - minAttendancePercent (tipo):`,
          typeof primeraInscripcion.event.minAttendancePercent
        );
        console.log(
          `  - minAttendancePercent === null:`,
          primeraInscripcion.event.minAttendancePercent === null
        );
        console.log(
          `  - minAttendancePercent === undefined:`,
          primeraInscripcion.event.minAttendancePercent === undefined
        );
        console.log(
          `  - eventCourse:`,
          primeraInscripcion.event.eventCourse
        );
        console.log(`  - type:`, primeraInscripcion.event.type);

        // 🔧 DEBUGGING ADICIONAL: Verificar todas las propiedades del objeto evento
        console.log(`🔧 [DEBUGGING] Todas las propiedades del objeto event:`);
        Object.keys(primeraInscripcion.event).forEach((key) => {
          console.log(
            `    ${key}: ${
              primeraInscripcion.event[key]
            } (${typeof primeraInscripcion.event[key]})`
          );
        });
      }

      // Mapear los resultados para tener una estructura consistente con el frontend
      const inscripcionesMapeadas = inscripciones.map((inscripcion) => ({
        id: inscripcion.id,
        status: inscripcion.status,
        registeredAt: inscripcion.registeredAt,
        finalAttendancePercent:
          inscripcion.finalAttendancePercent === -1
            ? null
            : inscripcion.finalAttendancePercent,
        finalGrade: inscripcion.registrationCourse?.finalGrade || null,
        paymentReceipt: inscripcion.paymentReceipts[0]?.documentUrl || null,
        motivation: inscripcion.motivationLetters[0]?.content || null,
        observation: inscripcion.observation?.observation || null,
        // Mapear datos del usuario (compatibilidad con frontend)
        usuario: inscripcion.account?.user
          ? {
              nom_usu: inscripcion.account.user.firstName,
              ape_usu: inscripcion.account.user.lastName,
              cor_usu: inscripcion.account.email,
              com_usu: inscripcion.account.user.documentUrl || null,
            }
          : null,
        // Mantener estructura de cuenta para compatibilidad
        cuenta: {
            cor_usu: inscripcion.account?.email,
            usuario: inscripcion.account?.user
            ? {
                nom_usu: inscripcion.account.user.firstName,
                ape_usu: inscripcion.account.user.lastName,
                com_usu: inscripcion.account.user.phone || null,
              }
            : null,
        },
        // Mapear datos del evento
         evento: inscripcion.event
          ? {
              id_eve: inscripcion.event.id,
              nom_eve: inscripcion.event.name,
              tip_eve: inscripcion.event.type,
              val_eve: inscripcion.event.price,
              est_eve: inscripcion.event.status,
              por_min_asi_eve: inscripcion.event.minAttendancePercent,
              eventos_curso: inscripcion.event.eventCourse,
            }
          : null,
        // Mapear datos de certificado si existe
         certificado: inscripcion.certificate,
        // Función onVerCarta para compatibilidad (se define en el frontend)
        onVerCarta: null,
      }));

      console.log(
        `✅ Enviando ${inscripcionesMapeadas.length} inscripciones al frontend`
      );
      if (inscripcionesMapeadas.length > 0) {
        const eventoEjemplo = inscripcionesMapeadas[0].evento;
        console.log(`📊 Ejemplo de datos del evento enviados:`);
        console.log(`  - Nombre: ${eventoEjemplo.nom_eve}`);
        console.log(`  - Tipo: ${eventoEjemplo.tip_eve}`);
        console.log(`  - Asistencia mínima: ${eventoEjemplo.por_min_asi_eve}%`);
        console.log(
          `  - Datos del curso:`,
          eventoEjemplo.eventos_curso
            ? `Nota mín: ${eventoEjemplo.eventos_curso.minPassingGrade}`
            : "No es curso"
        );
      }

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

// ===================================================
// Obtener inscripciones de un evento específico con paginación
// ===================================================

const REG_STATUS_TO_LEGACY = {
  PENDING: "PENDIENTE",
  ACCEPTED: "ACEPTADA",
  REJECTED: "RECHAZADA",
  APPROVED: "APROBADO",
  FAILED_GRADE: "REPROBADO_NOTA",
  FAILED_ATTENDANCE: "REPROBADO_ASISTENCIA",
  FAILED_TOTAL: "REPROBADO_TOTAL",
};

const LEGACY_TO_REG_STATUS = {
  PENDIENTE: "PENDING",
  ACEPTADA: "ACCEPTED",
  RECHAZADA: "REJECTED",
  APROBADO: "APPROVED",
  REPROBADO_NOTA: "FAILED_GRADE",
  REPROBADO_ASISTENCIA: "FAILED_ATTENDANCE",
  REPROBADO_TOTAL: "FAILED_TOTAL",
};

const EVENT_STATUS_TO_LEGACY = {
  ACTIVE: "ACTIVO",
  INACTIVE: "INACTIVO",
  FINISHED: "FINALIZADO",
  CANCELLED: "CANCELADO",
  SUSPENDED: "SUSPENDIDO",
};

const EVENT_TYPE_TO_LEGACY = {
  COURSE: "CURSO",
  CONGRESS: "CONGRESO",
  WEBINAR: "WEBINAR",
  TALK: "CHARLA",
  SOCIALIZATION: "SOCIALIZACION",
};

const REGISTRATION_SORT_FIELD_MAP = {
  fec_ins: "registeredAt",
  registeredAt: "registeredAt",
  est_ins: "status",
  status: "status",
  por_asi_fin_usu: "finalAttendancePercent",
  finalAttendancePercent: "finalAttendancePercent",
};

const normalizeRegistrationStatus = (status) =>
  LEGACY_TO_REG_STATUS[status] || status;

const buildRegistrationWhereCondition = ({
  tenantId,
  eventId,
  search,
  estado,
  fechaInicio,
  fechaFin,
}) => {
  const whereCondition = withTenantWhere(tenantId);

  if (eventId) {
    whereCondition.eventId = eventId;
  }

  if (search) {
    whereCondition.OR = [
      {
        account: {
          user: {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { idNumber: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      },
      {
        account: {
          email: { contains: search, mode: "insensitive" },
        },
      },
      {
        event: {
          name: { contains: search, mode: "insensitive" },
        },
      },
    ];
  }

  if (estado) {
    whereCondition.status = normalizeRegistrationStatus(estado);
  }

  if (fechaInicio || fechaFin) {
    whereCondition.registeredAt = {
      ...(fechaInicio && { gte: new Date(fechaInicio) }),
      ...(fechaFin && { lte: new Date(fechaFin) }),
    };
  }

  return whereCondition;
};

const buildRegistrationOrderBy = (sortBy, sortOrder) => {
  const normalizedSortBy =
    REGISTRATION_SORT_FIELD_MAP[sortBy] || "registeredAt";
  const normalizedSortOrder = sortOrder === "asc" ? "asc" : "desc";
  return { [normalizedSortBy]: normalizedSortOrder };
};

const mapRegistrationToLegacy = (inscripcion) => {
  const user = inscripcion.account?.user;
  const accountEmail = inscripcion.account?.email || null;
  const event = inscripcion.event;

  return {
    id_ins: inscripcion.id,
    est_ins: REG_STATUS_TO_LEGACY[inscripcion.status] || inscripcion.status,
    fec_ins: inscripcion.registeredAt,
    por_asi_fin_usu:
      inscripcion.finalAttendancePercent === -1
        ? null
        : inscripcion.finalAttendancePercent,
    nota_final: inscripcion.registrationCourse?.finalGrade ?? null,
    comprobante: inscripcion.paymentReceipts?.[0]?.documentUrl || null,
    carta_motivacion: inscripcion.motivationLetters?.[0]?.content || null,
    observacion: inscripcion.observation?.observation || null,
    usuario: user
      ? {
          nom_usu: user.firstName,
          ape_usu: user.lastName,
          cor_usu: accountEmail,
          com_usu: user.documentUrl || null,
          ced_usu: user.idNumber,
        }
      : null,
    cuenta: {
      cor_usu: accountEmail,
      usuario: user
        ? {
            nom_usu: user.firstName,
            ape_usu: user.lastName,
            com_usu: user.documentUrl || null,
            ced_usu: user.idNumber,
          }
        : null,
    },
    evento: event
      ? {
          id_eve: event.id,
          nom_eve: event.name,
          tip_eve: EVENT_TYPE_TO_LEGACY[event.type] || event.type,
          val_eve: event.price,
          est_eve: EVENT_STATUS_TO_LEGACY[event.status] || event.status,
          por_min_asi_eve: event.minAttendancePercent,
          eventos_curso: event.eventCourse
            ? {
                not_min_cur: event.eventCourse.minPassingGrade,
              }
            : null,
        }
      : null,
    certificado: inscripcion.certificate || null,
    onVerCarta: null,
  };
};

const obtenerInscripcionesPorEventoPaginadas = async (req, res) => {
  try {
    const { id } = req.params;

    // Extraer parámetros de paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;

    // Extraer filtros
    const {
      search,
      estado,
      fechaInicio,
      fechaFin,
      sortBy = "registeredAt",
      sortOrder = "desc",
    } = req.query;

    const whereCondition = buildRegistrationWhereCondition({
      tenantId: req.tenantId,
      eventId: id,
      search,
      estado,
      fechaInicio,
      fechaFin,
    });

    const orderBy = buildRegistrationOrderBy(sortBy, sortOrder);

    // Ejecutar consultas en paralelo
    const [inscripciones, totalCount] = await Promise.all([
      prisma.registration.findMany({
        where: whereCondition,
        skip: offset,
        take: limit,
        orderBy,
        include: {
          account: {
            include: {
              user: true,
            },
          },
          event: {
            include: {
              eventCourse: true,
            },
          },
          observation: true,
          registrationCourse: true,
          certificate: true,
          paymentReceipts: {
            orderBy: {
              uploadedAt: "desc",
            },
            take: 1,
          },
          motivationLetters: {
            orderBy: {
              uploadedAt: "desc",
            },
            take: 1,
          },
        },
      }),
      prisma.registration.count({
        where: whereCondition,
      }),
    ]);

    // Mapear los resultados para tener una estructura consistente con el frontend
    const inscripcionesMapeadas = inscripciones.map(mapRegistrationToLegacy);

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(totalCount / limit);

    return res.json({
      data: inscripcionesMapeadas,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error en paginación de inscripciones por evento:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      message: error.message,
    });
  }
};

// ===================================================
// Obtener todas las inscripciones con paginación y filtros
// ===================================================
const obtenerInscripcionesPaginadas = async (req, res) => {
  try {
    // Extraer parámetros de paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;

    // Extraer filtros
    const {
      search,
      estado,
      evento,
      fechaInicio,
      fechaFin,
      sortBy = "registeredAt",
      sortOrder = "desc",
    } = req.query;

    const whereCondition = buildRegistrationWhereCondition({
      tenantId: req.tenantId,
      eventId: evento,
      search,
      estado,
      fechaInicio,
      fechaFin,
    });

    const orderBy = buildRegistrationOrderBy(sortBy, sortOrder);

    // Ejecutar consultas en paralelo
    const [inscripciones, totalCount] = await Promise.all([
      prisma.registration.findMany({
        where: whereCondition,
        skip: offset,
        take: limit,
        orderBy,
        include: {
          account: {
            include: {
              user: true,
            },
          },
          event: {
            include: {
              eventCourse: true,
            },
          },
          observation: true,
          registrationCourse: true,
          certificate: true,
          paymentReceipts: {
            orderBy: {
              uploadedAt: "desc",
            },
            take: 1,
          },
          motivationLetters: {
            orderBy: {
              uploadedAt: "desc",
            },
            take: 1,
          },
        },
      }),
      prisma.registration.count({
        where: whereCondition,
      }),
    ]);

    // Mapear los resultados para tener una estructura consistente con el frontend
    const inscripcionesMapeadas = inscripciones.map(mapRegistrationToLegacy);

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(totalCount / limit);

    return res.json({
      data: inscripcionesMapeadas,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error en paginación de inscripciones:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      message: error.message,
    });
  }
};

// ===================================================
// Obtener inscripción específica de un usuario en un evento
// ===================================================
const obtenerInscripcionUsuarioEnEvento = async (req, res) => {
  try {
    const { idEvento } = req.params;
    const id_cue = req.usuario.id; // ID de la cuenta del usuario autenticado

    if (!idEvento) {
      return res.status(400).json({
        msg: "El ID del evento es requerido",
      });
    }

    // Buscar la inscripción del usuario en el evento específico
    const inscripcion = await prisma.registration.findFirst({
      where: {
        tenantId: req.tenantId,
        accountId: id_cue,
        eventId: idEvento,
      },
      include: {
        event: {
          include: {
            eventCourse: true,
          },
        },
        account: {
          include: {
            user: true,
          },
        },
        registrationCourse: true,
        paymentReceipts: {
          orderBy: {
            uploadedAt: "desc",
          },
          take: 1,
        },
        motivationLetters: {
          orderBy: {
            uploadedAt: "desc",
          },
          take: 1,
        },
        observation: true,
        certificate: true,
      },
    });

    if (!inscripcion) {
      return res.status(404).json({
        msg: "No se encontró inscripción para este evento",
        inscrito: false,
      });
    }

    const inscripcionLegacy = mapRegistrationToLegacy(inscripcion);

    return res.json({
      inscripcion: inscripcionLegacy,
      inscrito: true,
      estado: inscripcionLegacy.est_ins,
    });
  } catch (error) {
    console.error("Error al obtener inscripción del usuario:", error);
    return res.status(500).json({
      msg: "Error interno del servidor",
      error: error.message,
    });
  }
};

// ===================================================
// Obtener todas las inscripciones del usuario autenticado
// ===================================================
const obtenerInscripcionesDelUsuarioActual = async (req, res) => {
  try {
    const id_cue = req.usuario.id; // ID de la cuenta del usuario autenticado

    // Buscar todas las inscripciones del usuario
    const inscripciones = await prisma.registration.findMany({
      where: {
        tenantId: req.tenantId,
        accountId: id_cue,
      },
      include: {
        event: {
          include: {
            eventCourse: true,
          },
        },
        account: {
          include: {
            user: true,
          },
        },
        registrationCourse: true,
        paymentReceipts: {
          orderBy: {
            uploadedAt: "desc",
          },
          take: 1,
        },
        motivationLetters: {
          orderBy: {
            uploadedAt: "desc",
          },
          take: 1,
        },
        observation: true,
        certificate: true,
      },
      orderBy: {
        registeredAt: "desc",
      },
    });

    const inscripcionesLegacy = inscripciones.map(mapRegistrationToLegacy);

    return res.json(inscripcionesLegacy);
  } catch (error) {
    console.error("Error al obtener inscripciones del usuario actual:", error);
    return res.status(500).json({
      msg: "Error interno del servidor",
      error: error.message,
    });
  }
};

// ===================================================
// Obtener todas las inscripciones (admin)
// ===================================================
const obtenerTodasLasInscripciones = async (req, res) => {
  try {
    const inscripciones = await prisma.registration.findMany({
      where: withTenantWhere(req.tenantId),
      include: {
        account: {
          include: {
            user: true,
          },
        },
        event: {
          include: {
            eventCourse: true,
          },
        },
        registrationCourse: true,
        paymentReceipts: {
          orderBy: {
            uploadedAt: "desc",
          },
          take: 1,
        },
        motivationLetters: {
          orderBy: {
            uploadedAt: "desc",
          },
          take: 1,
        },
        observation: true,
        certificate: true,
      },
      orderBy: {
        registeredAt: "desc",
      },
    });

    return res.json(inscripciones.map(mapRegistrationToLegacy));
  } catch (error) {
    console.error("Error al obtener todas las inscripciones:", error);
    return res.status(500).json({
      msg: "Error interno del servidor",
      error: error.message,
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
  obtenerInscripcionesPaginadas,
  obtenerInscripcionesPorEventoPaginadas,
};

