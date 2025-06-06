const prisma = require("../config/db");
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
    const { id_eve, carta_motivacion } = req.body;
    const id_cue = req.usuario.id; // Ahora trabajamos con ID de cuenta

    const archivo = req.file;

    if (!id_cue || !id_eve) {
      return res
        .status(400)
        .json({ msg: "Faltan campos obligatorios: id_cue o id_eve" });
    }

    if (!carta_motivacion) {
      return res
        .status(400)
        .json({ msg: "Debe incluir una carta de motivación" });
    }    // Obtenemos el evento para verificar si tiene costo
    const evento = await prisma.evento.findUnique({ where: { id_eve } });
    if (!evento) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    }

    // Verificar cupos disponibles
    if (evento.cupo_dis_eve <= 0) {
      return res.status(400).json({ 
        msg: "No hay cupos disponibles para este evento" 
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
    const cuenta = await prisma.cuenta.findUnique({
      where: { id_cue },
      include: { usuario: true },
    });
    if (!cuenta) {
      return res.status(404).json({ msg: "Cuenta de usuario no encontrada" });
    } // Verificar si el usuario ya está inscrito
    const yaInscrito = await prisma.inscripcion.findFirst({
      where: { id_cor_ins: id_cue, id_eve_ins: id_eve },
    });

    // Permitir reinscripción si la inscripción anterior fue rechazada
    if (yaInscrito && yaInscrito.est_ins !== "RECHAZADA") {
      return res.status(400).json({ msg: "Ya estás inscrito en este evento" });
    } // Si la inscripción estaba RECHAZADA, la actualizamos en lugar de crear una nueva
    if (yaInscrito && yaInscrito.est_ins === "RECHAZADA") {
      try {
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
            // Subir la imagen a Imgur
            urlComprobante = await subirImagenAImgur(archivo);

            // Guardar el comprobante
            await prisma.comprobante_pago.create({
              data: {
                id_ins_com_pag: yaInscrito.id_ins,
                url_com_pag: urlComprobante,
              },
            });
          } catch (imgurError) {
            console.error(
              "Error al subir imagen a Imgur para reinscripción:",
              imgurError
            );
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
        console.error("Error al actualizar inscripción rechazada:", error);
        throw error;
      }
    }

    try {
      // Crear la inscripción
      const nuevaInscripcion = await prisma.inscripcion.create({
        data: {
          id_cor_ins: id_cue, // Ahora usamos id_cor_ins en lugar de id_usu_ins
          id_eve_ins: id_eve,
          est_ins: "PENDIENTE", // Usando el nuevo campo est_ins
        },
      });

      // Crear la carta de motivación
      await prisma.carta_motivacion.create({
        data: {
          id_ins_per: nuevaInscripcion.id_ins,
          con_car_mot: carta_motivacion,
          est_car_mot: "PENDIENTE",
        },
      });

      // Si se proporciona un archivo, subirlo a Imgur y guardar la URL
      if (archivo) {
        try {
          // Subir la imagen a Imgur
          const imgurUrl = await subirImagenAImgur(archivo);

          // Crear el comprobante de pago con la URL de Imgur
          await prisma.comprobante_pago.create({
            data: {
              id_ins_per: nuevaInscripcion.id_ins,
              url_com_pag: imgurUrl,
              est_com_pag: "PENDIENTE",
            },
          });
        } catch (imgurError) {
          console.error("Error al subir imagen a Imgur:", imgurError);
          // Si falla la subida a Imgur, registramos el error pero continuamos con la inscripción
          await prisma.comprobante_pago.create({
            data: {
              id_ins_per: nuevaInscripcion.id_ins,
              url_com_pag: "Error al subir imagen",
              est_com_pag: "ERROR",
            },
          });
        }
      }

      res.status(201).json(nuevaInscripcion);
    } catch (error) {
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
    console.error("Error en crearInscripcion:", error);
    res.status(500).json({
      msg: "Error al inscribirse al evento",
      error: error.message,
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

    // Verificar estados permitidos con el nuevo enum
    const estadosPermitidos = [
      "PENDIENTE",
      "ACEPTADA",
      "RECHAZADA",
      "FINALIZADA",
    ];
    if (!estadosPermitidos.includes(est_ins)) {
      return res.status(400).json({ msg: "Estado inválido" });
    }    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id_ins: id },
      include: { evento: true },
    });

    if (!inscripcion) {
      return res.status(404).json({ msg: "Inscripción no encontrada" });
    }

    const estadoAnterior = inscripcion.est_ins;
    const estadoNuevo = est_ins;
    const idEvento = inscripcion.id_eve_ins;

    const asistenciaNum = Number(asistencia);
    const notaFinalNum = Number(nota_final);

    // Si el evento es un CURSO, validar nota y asistencia
    if (inscripcion.evento.tip_eve === "CURSO" && est_ins === "FINALIZADA") {
      if (asistencia === undefined || nota_final === undefined) {
        return res.status(400).json({
          msg: "Para finalizar el curso debes ingresar asistencia y nota final",
        });
      }

      if (isNaN(asistenciaNum) || asistenciaNum < 0 || asistenciaNum > 100) {
        return res.status(400).json({ msg: "Asistencia inválida (0–100)" });
      }

      if (isNaN(notaFinalNum) || notaFinalNum < 0 || notaFinalNum > 10) {
        return res.status(400).json({ msg: "Nota inválida (0–10)" });
      }

      // Obtener la nota mínima del evento curso
      const eventoCurso = await prisma.evento_curso.findUnique({
        where: { id_eve_cur: inscripcion.evento.id_eve },
      });

      const notaMinima = eventoCurso ? eventoCurso.not_min_cur : 8;
      const asistenciaMinima = inscripcion.evento.por_min_asi_eve ?? 80;

      if (notaFinalNum < notaMinima || asistenciaNum < asistenciaMinima) {
        return res.status(400).json({
          msg: `No cumple requisitos para finalizar: nota mínima ${notaMinima}, asistencia mínima ${asistenciaMinima}%`,
        });
      }
    }    // VALIDACIÓN DE CUPOS DISPONIBLES
    // Verificar que hay cupos disponibles antes de aceptar una inscripción
    if (estadoAnterior === "PENDIENTE" && estadoNuevo === "ACEPTADA") {
      if (inscripcion.evento.cupo_dis_eve <= 0) {
        return res.status(400).json({
          msg: "No se puede aceptar la inscripción: no hay cupos disponibles para este evento"
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
    if ((estadoAnterior === "ACEPTADA" || estadoAnterior === "PENDIENTE") && estadoNuevo === "RECHAZADA") {
      actualizacionCupo = 1; // Una inscripción aceptada/pendiente se rechaza: se libera un cupo
    }
    
    if (estadoAnterior === "ACEPTADA" && estadoNuevo === "PENDIENTE") {
      actualizacionCupo = 1; // Una inscripción aceptada vuelve a pendiente: se libera un cupo
    }

    // Actualizar cupos si es necesario
    if (actualizacionCupo !== 0) {
      await prisma.evento.update({
        where: { id_eve: idEvento },
        data: {
          cupo_dis_eve: {
            increment: actualizacionCupo
          }
        }
      });
      
      console.log(`✅ Cupos actualizados para evento ${idEvento}: ${actualizacionCupo > 0 ? 'incrementado' : 'decrementado'} en ${Math.abs(actualizacionCupo)}`);
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

    if (!archivo) {
      return res.status(400).json({ msg: "Debes subir un archivo" });
    }

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

    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id_ins: id },
      include: { cuenta: true, evento: true },
    });

    if (!inscripcion) {
      return res.status(404).json({ msg: "Inscripción no encontrada" });
    } // Solo puede reenviar el mismo estudiante
    if (inscripcion.id_cor_ins !== req.usuario.id) {
      return res
        .status(403)
        .json({ msg: "No tienes permiso para modificar esta inscripción" });
    }

    try {
      // Subir la imagen a Imgur
      const imgurUrl = await subirImagenAImgur(archivo);

      // Crear un nuevo comprobante de pago con la URL de Imgur
      await prisma.comprobante_pago.create({
        data: {
          id_ins_per: id,
          url_com_pag: imgurUrl,
          est_com_pag: "PENDIENTE",
        },
      });

      // Actualizar estado de la inscripción a pendiente
      const actualizada = await prisma.inscripcion.update({
        where: { id_ins: id },
        data: {
          est_ins: "PENDIENTE",
        },
      });

      res.status(200).json({
        msg: "Comprobante reenviado correctamente",
        inscripcion: actualizada,
      });
    } catch (error) {
      console.error("Error al reenviar comprobante:", error);
      res
        .status(500)
        .json({ msg: "Error al reenviar comprobante", error: error.message });
    }
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error al reenviar comprobante", error: error.message });
  }
};

// Obtener inscripciones por evento para el administrador
const obtenerInscripcionesPorEvento = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🔍 Obteniendo inscripciones para evento ID:", id);
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

    console.log(`✅ Inscripciones encontradas: ${inscripciones.length}`);

    try {
      // Mapear los resultados para tener una estructura más limpia
      const inscripcionesMapeadas = inscripciones.map((inscripcion) => {
        console.log("Procesando inscripción:", inscripcion.id_ins);
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

      console.log("✅ Mapeo de inscripciones completado");
      res.status(200).json(inscripcionesMapeadas);
    } catch (mapError) {
      console.error("❌ Error durante el mapeo de inscripciones:", mapError);
      throw mapError;
    }
  } catch (error) {
    console.error("❌ Error al obtener inscripciones del evento:", error);
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
  console.log("📋 Obteniendo inscripciones del usuario actual");

  try {
    // Verificar si req.usuario está definido
    if (!req.usuario) {
      console.log("❌ Error: req.usuario no está definido");
      return res.status(401).json({
        msg: "Usuario no autenticado",
        error: "No hay información de usuario en la solicitud",
      });
    }

    const id_cue = req.usuario.id; // Ahora usamos ID de cuenta
    console.log("👤 ID de cuenta:", id_cue);

    // Log antes de la consulta a Prisma
    console.log("🔍 Buscando inscripciones para la cuenta:", id_cue);
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

    console.log(`✅ Inscripciones encontradas: ${inscripciones.length}`); // Mapear los resultados para tener una estructura más limpia
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
    console.log("❌ Error al obtener inscripciones:", error);
    console.log("Error stack:", error.stack);

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
    console.log("🔍 Obteniendo todas las inscripciones");
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

    console.log(
      `✅ Total de inscripciones encontradas: ${inscripciones.length}`
    );

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

      console.log("✅ Mapeo de inscripciones completado");
      res.status(200).json(inscripcionesMapeadas);
    } catch (mapError) {
      console.error("❌ Error durante el mapeo de inscripciones:", mapError);
      throw mapError;
    }
  } catch (error) {
    console.error("❌ Error al obtener todas las inscripciones:", error);
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
