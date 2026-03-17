const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Dimensiones exactas de las imágenes de fondo para los certificados
// Estas dimensiones mantendrán la consistencia entre la vista previa y el PDF
const DIMENSIONES_CERTIFICADOS = {
  APROBACION: { ancho: 1200, alto: 850 },
  PARTICIPACION: { ancho: 1200, alto: 850 },
};

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
          tamañoSubtitulo: "44px", // Tamaño del subtítulo de aprobación
          tipoCertificado: "aprobacion", // Clase CSS específica
          dimensiones: DIMENSIONES_CERTIFICADOS.APROBACION,
        }
      : {
          imagenFondo: "https://i.imgur.com/oAzWsPe.png",
          colorTexto: "#8a1538", // Azul oscuro para certificado de participación
          colorTextoSecundario: "#B8860B", // Dorado oscuro
          subtituloTexto: "DE PARTICIPACIÓN",
          colorSubtitulo: "#ffffff", // Color blanco del subtítulo de participación
          tamañoSubtitulo: "38px", // Tamaño del subtítulo de participación
          tipoCertificado: "participacion", // Clase CSS específica
          dimensiones: DIMENSIONES_CERTIFICADOS.PARTICIPACION,
        };
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=${
      configVisual.dimensiones.ancho
    }, initial-scale=1.0">
    <title>Certificado</title>
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
        }
        
        html, body {
            width: ${configVisual.dimensiones.ancho}px;
            height: ${configVisual.dimensiones.alto}px;
            overflow: hidden;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            background: #ffffff;
            margin: 0;
            padding: 0;
            position: relative;
        }        
            
        /* Contenedor principal con fondo de imagen */
        .certificado {
            width: ${configVisual.dimensiones.ancho}px;
            height: ${configVisual.dimensiones.alto}px;
            position: relative;
            background-image: url('${configVisual.imagenFondo}');
            background-size: contain;
            background-position: center;
            background-repeat: no-repeat;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 0;
        }
                /* Contenedor del contenido superpuesto */
        .contenido-superpuesto {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            z-index: 10;
            text-align: center;
            width: 100%;
            height: 100%;
        }
          /* ===== ESTILOS ESPECÍFICOS PARA CERTIFICADO DE APROBACIÓN ===== */
        .certificado-aprobacion .subtitulo-certificado {
            font-family: 'Playfair Display', serif;
            font-size: ${configVisual.tamañoSubtitulo};
            font-weight: 400;
            color: ${configVisual.colorSubtitulo};
            text-shadow: 1px 1px 2px rgba(255,255,255,0.3);
            position: absolute;
            top: 250px;
            left: 0;
            right: 0;
            letter-spacing: 2px;
        }

        .certificado-aprobacion .nombre-usuario {
            font-family: 'Great Vibes', cursive;
            font-size: 69px;
            color: ${configVisual.colorTexto};
            font-weight: 600;
            text-shadow: 2px 2px 4px rgba(255,255,255,0.8);
            position: absolute;
            top: 340px;
            left: 0;
            right: 0;
            letter-spacing: 2px;
        }

        .certificado-aprobacion .carrera {
            font-family: 'RoxboroughCF', sans-serif;
            font-size: 22px;
            color: ${configVisual.colorTextoSecundario};
            font-weight: 500;
            text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
            position: absolute;
            top: 430px;
            left: 0;
            right: 0;
        }

        .certificado-aprobacion .descripcion {
            font-family: 'Roca One', sans-serif;
            font-size: 18px;
            line-height: 1.6;
            color: ${configVisual.colorTexto};
            width: 800px;
            margin: 0 auto;
            text-align: center;
            font-weight: 400;
            letter-spacing: 1px;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.18);
            padding: 0 20px;
            position: absolute;
            top: 465px;
            left: 50%;
            transform: translateX(-50%);
        }

        .certificado-aprobacion .fecha-emision {
            font-family: 'RoxboroughCF', sans-serif;
            color: ${configVisual.colorTextoSecundario};
            font-size: 18px;
            font-weight: 500;
            text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
            position: absolute;
            bottom: 250px;
            left: 0;
            right: 0;
        }        
            
        /* ===== ESTILOS ESPECÍFICOS PARA CERTIFICADO DE PARTICIPACIÓN ===== */
        .certificado-participacion .subtitulo-certificado {
            font-family: 'Playfair Display', serif;
            font-size: ${configVisual.tamañoSubtitulo};
            font-weight: 400;
            color: ${configVisual.colorSubtitulo};
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            position: absolute;
            top: 195px;
            left: 0;
            right: 0;
            letter-spacing: 2px;
        }

        .certificado-participacion .nombre-usuario {
            font-family: 'Great Vibes', cursive;
            font-size: 85px;
            color: ${configVisual.colorTexto};
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(255,255,255,0.8);
            position: absolute;
            top: 320px; 
            left: 0;
            right: 0;
            letter-spacing: 2px;
        }

        .certificado-participacion .carrera {
            font-family: 'RoxboroughCF', sans-serif;
            font-size: 24px;
            color: ${configVisual.colorTextoSecundario};
            font-weight: 500;
            text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
            position: absolute;
            top: 440px; 
            left: 0;
            right: 0;
        }

        .certificado-participacion .descripcion {
            font-family: 'Roca One';
            font-size: 20px;
            line-height: 1.6;
            color: #02316a;
            width: 900px;
            margin: 0 auto;
            text-align: center;
            font-weight: 400;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.19);
            padding: 0 20px;
            position: absolute;
            top: 475px;
            left: 50%;
            transform: translateX(-50%);
        }

        .certificado-participacion .fecha-emision {
            font-family: 'RoxboroughCF', sans-serif;
            color: ${configVisual.colorTextoSecundario};
            font-size: 20px;
            font-weight: 530;
            text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
            position: absolute;
            bottom: 240px;
            left: 0;
            right: 0;
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

        /* Para asegurar que la impresión mantenga los colores exactos */
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                width: ${configVisual.dimensiones.ancho}px;
                height: ${configVisual.dimensiones.alto}px;
            }
        }
    </style>
</head>
<body>    
<div class="certificado certificado-${
    configVisual.tipoCertificado
  }" style="width: ${configVisual.dimensiones.ancho}px; height: ${
    configVisual.dimensiones.alto
  }px;">
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
                ? `<div class="carrera">Carrera: ${usuario.carrera.nom_car}</div>`
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
// Generar el certificado PDF con Puppeteer - CONFIGURACIÓN MEJORADA
// ============================
const generarCertificadoPDF = async (datos) => {
  let browser;

  try {
    // Generar HTML del certificado
    const htmlContent = generarHTMLCertificado(datos);

    // Obtener dimensiones según el tipo de certificado
    const tipoCertificado = determinarTipoCertificado(datos.evento);
    const dimensiones = DIMENSIONES_CERTIFICADOS[tipoCertificado];

    // Configuración robusta para Docker
    const isDocker =
      process.env.NODE_ENV === "production" ||
      process.env.PUPPETEER_EXECUTABLE_PATH;

    const browserConfig = {
      headless: "new", // Usar el nuevo modo headless
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
        "--run-all-compositor-stages-before-draw",
        "--disable-background-timer-throttling",
        "--disable-renderer-backgrounding",
        "--disable-backgrounding-occluded-windows",
        "--disable-ipc-flooding-protection",
      ],
    };

    // Solo agregar executablePath si estamos en Docker
    if (isDocker) {
      browserConfig.executablePath =
        process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium-browser";
    }

    console.log("🔧 Configuración de Puppeteer:", {
      isDocker,
      executablePath: browserConfig.executablePath || "default",
      headless: browserConfig.headless,
    });

    // Lanzar Puppeteer con configuración mejorada
    browser = await puppeteer.launch(browserConfig);

    const page = await browser.newPage();

    // Configurar viewport con las dimensiones exactas de la imagen
    await page.setViewport({
      width: dimensiones.ancho,
      height: dimensiones.alto,
      deviceScaleFactor: 1,
    });

    // Configurar timeouts más largos
    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(30000);

    // Cargar el HTML con configuración mejorada
    await page.setContent(htmlContent, {
      waitUntil: ["networkidle0", "domcontentloaded"],
      timeout: 30000,
    });

    // Esperar a que las fuentes y imágenes carguen
    await page
      .waitForFunction(
        () => {
          return document.fonts.ready;
        },
        { timeout: 10000 }
      )
      .catch(() => {
        console.log("⚠️ Timeout esperando fuentes, continuando...");
      });

    // Esperar un poco más para que la imagen de fondo cargue completamente
    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log("📄 Generando PDF...");

    // Generar PDF con las dimensiones exactas
    const pdfBuffer = await page.pdf({
      width: `${dimensiones.ancho}px`,
      height: `${dimensiones.alto}px`,
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
      timeout: 30000,
    });

    console.log("✅ PDF generado correctamente");
    return pdfBuffer;
  } catch (error) {
    console.error("❌ Error generando certificado PDF:", error);

    // Log adicional para debugging
    if (error.message.includes("Target closed")) {
      console.error(
        "🔍 Error específico: El navegador se cerró inesperadamente"
      );
      console.error(
        "🛠️ Sugerencia: Verificar configuración de Chromium en Docker"
      );
    }

    throw error;
  } finally {
    if (browser) {
      try {
        await browser.close();
        console.log("🔒 Navegador cerrado correctamente");
      } catch (closeError) {
        console.error("⚠️ Error cerrando navegador:", closeError);
      }
    }
  }
};

// ============================
// Verificar si puede generar certificado
// ============================
const cumpleRequisitosCertificado = (inscripcion, evento, inscripcionCurso) => {
  const estadoInscripcion = inscripcion.status || inscripcion.est_ins;
  const estadoAprobado = estadoInscripcion === "APPROVED" || estadoInscripcion === "APROBADO";
  if (!estadoAprobado) return false;

  const porcentajeAsistencia =
    inscripcion.finalAttendancePercent ?? inscripcion.por_asi_fin_usu ?? 0;
  const porcentajeMinimo = evento.minAttendancePercent ?? evento.por_min_asi_eve ?? 80;

  // Verificar asistencia mínima
  if (porcentajeAsistencia < porcentajeMinimo) {
    return false;
  }

  // Si es un curso, verificar nota mínima
  const tipoEvento = evento.type || evento.tip_eve;
  if (tipoEvento === "COURSE" || tipoEvento === "CURSO") {
    // Buscar información del curso
    const notaFinal = inscripcionCurso?.finalGrade ?? inscripcionCurso?.not_fin_usu ?? 0;
    const notaMinima =
      evento.eventCourse?.minPassingGrade ?? evento.eventos_curso?.not_min_cur ?? 7;

    return notaFinal >= notaMinima;
  }

  // Para otros eventos, solo se requiere asistencia
  return true;
};

// Determinar el tipo de certificado (PARTICIPACION o APROBACION)
const determinarTipoCertificado = (evento) => {
  const tipoEvento = evento.type || evento.tip_eve;
  return tipoEvento === "COURSE" || tipoEvento === "CURSO"
    ? "APROBACION"
    : "PARTICIPACION";
};

module.exports = {
  generarCertificadoPDF,
  cumpleRequisitosCertificado,
  determinarTipoCertificado,
  generarCodigoValidacion,
  generarHTMLCertificado, // Exportamos también el HTML por si lo necesitas
};
// Andriu Dex
