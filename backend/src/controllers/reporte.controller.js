const prisma = require("../config/db");
const { get } = require("../routes/reporte.routes");

async function getEventosParaReportes(req, res) {
    try {
        const eve = await prisma.evento.findMany({
            select: {
                id_eve: true,
                nom_eve: true,
                img_por_eve: true,
            },
            orderBy: {
                fec_ini_eve: 'desc'  // En orden descendente por fecha de inicio
            }
        });

        res.json({ eve: eve });
    } catch (error) {
        res.status(500).json({ msg: "Error al obtener los eventos para reportes" });
    }
}

async function getReporteEventoPorId(req, res) {
    const { id_eve } = req.params;

    try {
        // 1. Buscar el evento con sus datos básicos y el creador
        const evento = await prisma.evento.findUnique({
            where: { id_eve },
            select: {
                id_eve: true,
                nom_eve: true,
                dur_hor_eve: true,
                fec_ini_eve: true,
                fec_fin_eve: true,
                img_por_eve: true,
                tip_eve: true,
                cuenta: {
                    select: {
                        usuario: {
                            select: {
                                nom_usu: true,
                                ape_usu: true,
                            }
                        }
                    }
                },
            }
        });

        if (!evento) {
            return res.status(404).json({ msg: "Evento no encontrado" });
        }

        // Preparar select para inscripciones (condicional si es curso)
        let inscripcionSelect = {
            id_ins: true,
            por_asi_fin_usu: true,
            est_ins: true,
            cuenta: {
                select: {
                    usuario: {
                        select: {
                            ced_usu: true,
                            nom_usu: true,
                            ape_usu: true,
                        }
                    }
                }
            },
        };

        if (evento.tip_eve === "CURSO") {
            inscripcionSelect.inscripcion_curso = { select: { not_fin_usu: true } };
        }

        // Buscar las inscripciones
        const inscripciones = await prisma.inscripcion.findMany({
            where: {
                id_eve_ins: id_eve,
                est_ins: {
                    in: ["APROBADO", "REPROBADO_NOTA", "REPROBADO_ASISTENCIA", "REPROBADO_TOTAL"]
                }
            },
            select: inscripcionSelect
        });

        // Formatear detalle
        const det_ins = inscripciones.map((ins) => {
            let detalleBase = {
                ced_usu: ins.cuenta.usuario.ced_usu,
                nom_usu: ins.cuenta.usuario.nom_usu,
                ape_usu: ins.cuenta.usuario.ape_usu,
                por_asi_fin_usu: ins.por_asi_fin_usu,
                est_ins: ins.est_ins,
            };
            if (evento.tip_eve === "CURSO") {
                detalleBase.not_fin_usu = ins.inscripcion_curso?.not_fin_usu ?? null;
            }
            return detalleBase;
        });

        // Armar respuesta
        return res.json({
            cab_eve: {
                id_eve: evento.id_eve,
                nom_eve: evento.nom_eve,
                dur_hor_eve: evento.dur_hor_eve,
                fec_ini_eve: evento.fec_ini_eve,
                fec_fin_eve: evento.fec_fin_eve,
                img_por_eve: evento.img_por_eve,
                tip_eve: evento.tip_eve,
                cre_eve: {
                    nom_usu: evento.cuenta.usuario.nom_usu,
                    ape_usu: evento.cuenta.usuario.ape_usu
                }
            },
            det_ins: det_ins
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al generar el reporte del evento" });
    }
}

module.exports = {
    getEventosParaReportes,
    getReporteEventoPorId,
};