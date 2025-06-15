// Importamos la instancia centralizada de Prisma
const prisma = require("../config/db");

// ==============================
// Obtener información MVA (Misión, Visión, Autoridades)
// ==============================
const obtenerMVA = async (req, res) => {
  try {
    // Obtenemos la primera facultad (asumimos que es la principal)
    const facultad = await prisma.facultad.findFirst();

    if (!facultad) {
      return res.status(404).json({ msg: "Facultad no encontrada" });
    }

    // Construimos la información de autoridades
    const autoridades = [
      {
        cargo: "Decano",
        nombre: `${facultad.nom_dec_fac} ${facultad.ape_dec_fac}`,
        imagen: facultad.url_img_dec_fac,
        email: facultad.cor_dec_fac,
      },
      {
        cargo: "Subdecano",
        nombre: `${facultad.nom_sub_dec_fac} ${facultad.ape_sub_dec_fac}`,
        imagen: facultad.url_img_sub_dec_fac,
        email: facultad.cor_sub_dec_fac,
      },
    ];

    // Creamos el objeto de respuesta
    const mvaInfo = {
      mision: facultad.mis_fac,
      vision: facultad.vis_fac,
      autoridades: JSON.stringify(autoridades),
    };

    res.json(mvaInfo);
  } catch (error) {
    console.error("Error al obtener información MVA:", error);
    res
      .status(500)
      .json({ msg: "Error al obtener información MVA", error: error.message });
  }
};

// ==============================
// Obtener datos de la facultad
// ==============================
const obtenerDatosFacultad = async (req, res) => {
  try {
    // Obtenemos la primera facultad (asumimos que es la principal)
    const facultad = await prisma.facultad.findFirst();

    if (!facultad) {
      return res.status(404).json({ msg: "Facultad no encontrada" });
    }

    // Creamos el objeto de respuesta con los datos necesarios
    const datosFacultad = {
      nombre: facultad.nom_fac,
      acronimo: facultad.acr_fac || "FISEI", // Valor por defecto si es null
      logo: facultad.url_log_fac || "https://imgur.com/fch1iy6.png", // Valor por defecto si es null
      descripcion: facultad.des_fac,
    };

    res.json(datosFacultad);
  } catch (error) {
    console.error("Error al obtener datos de la facultad:", error);
    res
      .status(500)
      .json({
        msg: "Error al obtener datos de la facultad",
        error: error.message,
      });
  }
};

// ==============================
// Actualizar información MVA
// ==============================
const actualizarMVA = async (req, res) => {
  try {
    const { mision, vision, autoridades } = req.body;

    // Obtenemos la primera facultad
    const facultad = await prisma.facultad.findFirst();

    if (!facultad) {
      return res.status(404).json({ msg: "Facultad no encontrada" });
    }

    // Actualizamos la misión y visión en la facultad
    const facultadActualizada = await prisma.facultad.update({
      where: { id_fac: facultad.id_fac },
      data: {
        mis_fac: mision,
        vis_fac: vision,
      },
    });

    // Si hay autoridades, las procesamos
    if (autoridades) {
      try {
        const autoridadesData = JSON.parse(autoridades);

        // Procesamos solo las primeras dos autoridades (decano y subdecano)
        // Ya que son las únicas que podemos guardar en el modelo actual
        if (autoridadesData.length > 0) {
          const decano = autoridadesData[0];
          // Actualizamos el decano
          await prisma.facultad.update({
            where: { id_fac: facultad.id_fac },
            data: {
              nom_dec_fac: decano.nombre.split(" ")[0], // Primer nombre
              ape_dec_fac: decano.nombre.split(" ").slice(1).join(" "), // Resto como apellido
              cor_dec_fac: decano.email,
              url_img_dec_fac: decano.imagen,
            },
          });
        }

        if (autoridadesData.length > 1) {
          const subdecano = autoridadesData[1];
          // Actualizamos el subdecano
          await prisma.facultad.update({
            where: { id_fac: facultad.id_fac },
            data: {
              nom_sub_dec_fac: subdecano.nombre.split(" ")[0], // Primer nombre
              ape_sub_dec_fac: subdecano.nombre.split(" ").slice(1).join(" "), // Resto como apellido
              cor_sub_dec_fac: subdecano.email,
              url_img_sub_dec_fac: subdecano.imagen,
            },
          });
        }
      } catch (jsonError) {
        console.error("Error al procesar JSON de autoridades:", jsonError);
        // No interrumpimos la operación si hay error en el formato de autoridades
      }
    }

    // Obtenemos la información actualizada para devolver
    const facultadNueva = await prisma.facultad.findUnique({
      where: { id_fac: facultad.id_fac },
    });

    // Preparamos la respuesta
    const mvaInfo = {
      mision: facultadNueva.mis_fac,
      vision: facultadNueva.vis_fac,
      autoridades: autoridades, // Devolvemos las autoridades como las recibimos
    };

    res.status(200).json(mvaInfo);
  } catch (error) {
    console.error("Error al actualizar información MVA:", error);
    res.status(500).json({
      msg: "Error al actualizar información MVA",
      error: error.message,
    });
  }
};

// ==============================
// Actualizar datos de la facultad
// ==============================
const actualizarDatosFacultad = async (req, res) => {
  try {
    const { nombre, acronimo, logo } = req.body;

    // Obtenemos la primera facultad
    const facultad = await prisma.facultad.findFirst();

    if (!facultad) {
      return res.status(404).json({ msg: "Facultad no encontrada" });
    }

    // Validamos que al menos uno de los campos no esté vacío
    if (!nombre && !acronimo && !logo) {
      return res.status(400).json({
        msg: "Debe proporcionar al menos un dato para actualizar",
      });
    }

    // Creamos un objeto con los datos a actualizar
    const datosActualizar = {};

    if (nombre) datosActualizar.nom_fac = nombre;
    if (acronimo) datosActualizar.acr_fac = acronimo;
    if (logo) datosActualizar.url_log_fac = logo;

    // Actualizamos los datos de la facultad
    const facultadActualizada = await prisma.facultad.update({
      where: { id_fac: facultad.id_fac },
      data: datosActualizar,
    });

    // Preparamos la respuesta
    const datosFacultad = {
      nombre: facultadActualizada.nom_fac,
      acronimo: facultadActualizada.acr_fac || "FISEI", // Valor por defecto si es null
      logo: facultadActualizada.url_log_fac || "https://imgur.com/fch1iy6.png", // Valor por defecto si es null
    };

    res.status(200).json(datosFacultad);
  } catch (error) {
    console.error("Error al actualizar datos de la facultad:", error);
    res.status(500).json({
      msg: "Error al actualizar datos de la facultad",
      error: error.message,
    });
  }
};

// ==============================
// Exportamos las funciones
// ==============================
module.exports = {
  obtenerMVA,
  actualizarMVA,
  obtenerDatosFacultad,
  actualizarDatosFacultad,
};
