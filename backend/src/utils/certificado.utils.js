const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Función para asegurar que exista un directorio
const asegurarDirectorio = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Función para generar código de validación único
const generarCodigoValidacion = () => {
  return uuidv4().substring(0, 8).toUpperCase();
};

// Función para convertir fuente a base64
const convertirFuenteABase64 = (rutaFuente) => {
  try {
    const fontBuffer = fs.readFileSync(rutaFuente);
    return `data:font/truetype;charset=utf-8;base64,${fontBuffer.toString(
      "base64"
    )}`;
  } catch (error) {
    console.warn(`No se pudo cargar la fuente: ${rutaFuente}`, error);
    return null;
  }
};

// Cargar fuentes como base64 al inicio
const cargarFuentesBase64 = () => {
  const basePath = path.resolve(__dirname, "../../assets/fonts");

  return {
    greatVibes: convertirFuenteABase64(
      path.join(basePath, "GreatVibes-Regular.ttf")
    ),
    playfairDisplay: convertirFuenteABase64(
      path.join(basePath, "PlayfairDisplay-Regular.ttf")
    ),
    rocaOne: convertirFuenteABase64(
      path.join(basePath, "roca-one-regular.ttf")
    ),
    roxboroughCF: convertirFuenteABase64(
      path.join(basePath, "roxborough-cf-regular.ttf")
    ),
  };
};

// ============================
// Template HTML del certificado
// ============================
const generarHTMLCertificado = (datos) => {
  const {
    usuario,
    evento,
    asistencia,
    notaFinal,
    tipoCertificado,
    codigoValidacion,
  } = datos;

  // Cargar fuentes base64
  const fuentesBase64 = cargarFuentesBase64();

  // Determinar texto de descripción
  let descripcionTexto = "";
  if (tipoCertificado === "APROBACION") {
    descripcionTexto = `Por haber completado satisfactoriamente el ${evento.tip_eve.toLowerCase()} "${
      evento.nom_eve
    }", con una duración de ${
      evento.dur_hor_eve
    } horas académicas, realizado del ${new Date(
      evento.fec_ini_eve
    ).toLocaleDateString("es-EC")} al ${new Date(
      evento.fec_fin_eve
    ).toLocaleDateString(
      "es-EC"
    )}, obteniendo una calificación de ${notaFinal}/10 puntos y manteniendo un ${asistencia}% de asistencia.`;
  } else {
    descripcionTexto = `Por su valiosa participación en el ${evento.tip_eve.toLowerCase()} "${
      evento.nom_eve
    }", con una duración de ${
      evento.dur_hor_eve
    } horas académicas, realizado del ${new Date(
      evento.fec_ini_eve
    ).toLocaleDateString("es-EC")} al ${new Date(
      evento.fec_fin_eve
    ).toLocaleDateString(
      "es-EC"
    )}, cumpliendo con un ${asistencia}% de asistencia y demostrando compromiso académico.`;
  }
  const fechaEmision = new Date().toLocaleDateString("es-EC", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // 🎨 Configuración visual según tipo de certificado
  const configVisual =
    tipoCertificado === "APROBACION"
      ? {
          imagenFondo: "https://i.imgur.com/kVSFBiy.png",
          colorTexto: "#8a1538", // Color específico para texto de aprobación
          colorTextoSecundario: "#B8860B", // Dorado oscuro
          subtituloTexto: "DE APROBACIÓN",
          colorSubtitulo: "#490d0b", // Color del subtítulo de aprobación
          tamañoSubtitulo: "35px", // Tamaño del subtítulo de aprobación
          tipoCertificado: "aprobacion", // Clase CSS específica
        }
      : {
          imagenFondo: "https://i.imgur.com/oAzWsPe.png",
          colorTexto: "#8a1538", // Azul oscuro para certificado de participación
          colorTextoSecundario: "#B8860B", // Dorado oscuro
          subtituloTexto: "DE PARTICIPACIÓN",
          colorSubtitulo: "#ffffff", // Color blanco del subtítulo de participación
          tamañoSubtitulo: "28px", // Tamaño del subtítulo de participación
          tipoCertificado: "participacion", // Clase CSS específica
        };
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">    <title>Certificado</title>
    <!-- Solo Inter desde Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">    <style>
        /* Fuentes locales en base64 */
        ${
          fuentesBase64.greatVibes
            ? `
        @font-face {
            font-family: 'Great Vibes';
            src: url('${fuentesBase64.greatVibes}') format('truetype');
            font-weight: 400;
            font-style: normal;
            font-display: swap;
        }`
            : ""
        }
        
        ${
          fuentesBase64.playfairDisplay
            ? `
        @font-face {
            font-family: 'Playfair Display';
            src: url('${fuentesBase64.playfairDisplay}') format('truetype');
            font-weight: 400;
            font-style: normal;
            font-display: swap;
        }`
            : ""
        }
        
        ${
          fuentesBase64.rocaOne
            ? `
        @font-face {
            font-family: 'Roca One';
            src: url('${fuentesBase64.rocaOne}') format('truetype');
            font-weight: 400;
            font-style: normal;
            font-display: swap;
        }`
            : ""
        }
        ${
          fuentesBase64.roxboroughCF
            ? `
        @font-face {
            font-family: 'RoxboroughCF';
            src: url('${fuentesBase64.roxboroughCF}') format('truetype');
            font-weight: 400;
            font-style: normal;
            font-display: swap;
        }`
            : ""
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }        body {
            font-family: 'Inter', sans-serif;
            background: #ffffff;
            margin: 0;
            padding: 0;
            position: relative;
            overflow: hidden;
        }        
            
        /* Contenedor principal con fondo de imagen */
        .certificado {
            width: 100vw;
            height: 100vh;
            min-width: 800px;
            min-height: 600px;
            position: relative;
            background-image: url('${configVisual.imagenFondo}');
            background-size: contain;
            background-position: center;
            background-repeat: no-repeat;
            display: flex;
            flex-direction: column;
            // justify-content: center;
            align-items: center;
            padding: 5%;
        }
              
        /* Contenedor del contenido superpuesto */
        .contenido-superpuesto {
            position: relative;
            z-index: 10;
            text-align: center;
            width: 100%;
            max-width: 800px;
        }        
        
        /* ===== ESTILOS ESPECÍFICOS PARA CERTIFICADO DE APROBACIÓN ===== */
        .certificado-aprobacion .subtitulo-certificado {
            font-family: 'Playfair Display', serif;
            font-size: ${configVisual.tamañoSubtitulo};
            font-weight: 400;
            color: ${configVisual.colorSubtitulo};
            text-shadow: 1px 1px 2px rgba(255,255,255,0.3);
            margin-top: 14%;
            letter-spacing: 2px;
        }

        .certificado-aprobacion .nombre-usuario {
            font-family: 'Great Vibes', cursive;
            font-size: 48px;
            color: ${configVisual.colorTexto};
            font-weight: 600;
            text-shadow: 2px 2px 4px rgba(255,255,255,0.8);
            position: relative;
            top: 20px;
            letter-spacing: 2px;
        }

        .certificado-aprobacion .carrera {
            font-family: 'RoxboroughCF', sans-serif;
            font-size: 16px;
            color: ${configVisual.colorTextoSecundario};
            font-weight: 500;
            margin: 2.5% 0 1% ;
            text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
        }

        .certificado-aprobacion .descripcion {
            font-family: 'Roca One', sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: ${configVisual.colorTexto};
            max-width: 700px;
            margin: 0 auto 2%;
            text-align: center;
            font-weight: 400;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.18);
            padding: 0 20px;
        }

        .certificado-aprobacion .fecha-emision {
            font-family: 'RoxboroughCF', sans-serif;
            color: ${configVisual.colorTextoSecundario};
            font-size: 12px;
            font-weight: 500;
            text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
        }        
            
        /* ===== ESTILOS ESPECÍFICOS PARA CERTIFICADO DE PARTICIPACIÓN ===== */
        .certificado-participacion .subtitulo-certificado {
            font-family: 'Playfair Display', serif;
            font-size: ${configVisual.tamañoSubtitulo};
            font-weight: 400;
            color: ${configVisual.colorSubtitulo};
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            margin: 9% 0 0 0;
            letter-spacing: 2px;
        }

        .certificado-participacion .nombre-usuario {
            font-family: 'Great Vibes', cursive;
            font-size: 55px;
            color: ${configVisual.colorTexto};
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(255,255,255,0.8);
            margin: 3% 0 3% 0;
            position: relative;
            top: 20px;
            letter-spacing: 2px;
        }

        .certificado-participacion .carrera {
            font-family: 'RoxboroughCF', sans-serif;
            font-size: 18px;
            color: ${configVisual.colorTextoSecundario};
            font-weight: 500;
            margin-bottom: 1%;
            text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
        }

        .certificado-participacion .descripcion {
            font-family: 'Roca One';
            font-size: 14px;
            line-height: 1.6;
            color: #02316a;
            max-width: 700px;
            margin: 0 auto 1%;
            text-align: center;
            font-weight: 400;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.19);
            padding: 0 20px;
        }

        .certificado-participacion .fecha-emision {
            font-family: 'RoxboroughCF', sans-serif;
            color: ${configVisual.colorTextoSecundario};
            font-size: 15px;
            font-weight: 530;
            margin-top: 20px;
            text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
        }

        /* Código de validación */
        .codigo-validacion {
            position: absolute;
            bottom: 15px;
            right: 30px;
            font-size: 10px;
            color: #666;
            font-family: 'Courier New', monospace;
            z-index: 10;
            text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
        }

        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>    
<div class="certificado certificado-${configVisual.tipoCertificado}">
        <!-- Contenido superpuesto -->
        <div class="contenido-superpuesto">
            <div class="subtitulo-certificado">${
              configVisual.subtituloTexto
            }</div>
            <div class="nombre-usuario">${usuario.nom_usu} ${
    usuario.ape_usu
  }</div>
            ${
              usuario.carrera
                ? `<div class="carrera">${usuario.carrera.nom_car}</div>`
                : ""
            }
            <div class="descripcion">${descripcionTexto}</div>
            <div class="fecha-emision">Emitido el ${fechaEmision}</div>
        </div>

        <!-- Código de validación -->
        <div class="codigo-validacion">
            Código: ${codigoValidacion}
        </div>
    </div>
</body>
</html>
  `;
};

// ============================
// Generar el certificado PDF con Puppeteer
// ============================
const generarCertificadoPDF = async (datos) => {
  let browser;

  try {
    // Generar HTML del certificado
    const htmlContent = generarHTMLCertificado(datos);

    // Lanzar Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage(); // Configurar viewport más grande para capturar la imagen completa
    await page.setViewport({
      width: 1200,
      height: 850,
    }); // Cargar el HTML
    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
    });

    // Esperar un poco más para que la imagen de fondo cargue completamente
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generar PDF con tamaño automático basado en el contenido
    const pdfBuffer = await page.pdf({
      width: "1200px",
      height: "850px",
      printBackground: true,
      margin: {
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
    });

    return pdfBuffer;
  } catch (error) {
    console.error("Error generando certificado PDF:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// ============================
// Verificar si puede generar certificado
// ============================
const cumpleRequisitosCertificado = (inscripcion, evento, inscripcionCurso) => {
  if (inscripcion.est_ins !== "APROBADO") return false;

  const porcentajeAsistencia = inscripcion.por_asi_fin_usu || 0;
  const porcentajeMinimo = evento.por_min_asi_eve || 80;

  // Verificar asistencia mínima
  if (porcentajeAsistencia < porcentajeMinimo) {
    return false;
  }

  // Si es un curso, verificar nota mínima
  if (evento.tip_eve === "CURSO") {
    // Buscar información del curso
    const notaFinal = inscripcionCurso?.not_fin_usu || 0;
    const notaMinima = evento.eventos_curso?.not_min_cur || 7;

    return notaFinal >= notaMinima;
  }

  // Para otros eventos, solo se requiere asistencia
  return true;
};

// Determinar el tipo de certificado (PARTICIPACION o APROBACION)
const determinarTipoCertificado = (evento) => {
  return evento.tip_eve === "CURSO" ? "APROBACION" : "PARTICIPACION";
};

module.exports = {
  generarCertificadoPDF,
  cumpleRequisitosCertificado,
  determinarTipoCertificado,
  generarCodigoValidacion,
  generarHTMLCertificado, // Exportamos también el HTML por si lo necesitas
};
