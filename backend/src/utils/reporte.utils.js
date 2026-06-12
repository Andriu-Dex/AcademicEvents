const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const pick = (...values) => values.find((value) => value !== undefined && value !== null);

const obtenerPuppeteerConfig = () => {
  const isDocker =
    fs.existsSync("/.dockerenv") ||
    Boolean(process.env.PUPPETEER_EXECUTABLE_PATH);

  const config = {
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-web-security"
    ]
  };

  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    config.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  } else if (isDocker) {
    config.executablePath = "/usr/bin/chromium-browser";
  }

  return config;
};

async function generarReporteEventoPDF(datos, filePath) {
  const evento = datos.cab_eve || {};
  const eventoNombre = pick(evento.name, evento.nom_eve, "Sin nombre");
  const eventoTipo = pick(evento.type, evento.tip_eve, "N/A");
  const eventoDuracion = pick(evento.durationHours, evento.dur_hor_eve, "-");
  const eventoFechaInicio = pick(evento.startDate, evento.fec_ini_eve, new Date());
  const eventoFechaFin = pick(evento.endDate, evento.fec_fin_eve, new Date());
  const eventoImagen = pick(evento.coverImageUrl, evento.img_por_eve, "");
  const creadorNombre = pick(
    evento.createdBy?.firstName,
    evento.cre_eve?.nom_usu,
    ""
  );
  const creadorApellido = pick(
    evento.createdBy?.lastName,
    evento.cre_eve?.ape_usu,
    ""
  );

  // 1. Leer plantilla HTML
  const templatePath = path.join(__dirname, "../templates/reporte_evento.html");
  let html = fs.readFileSync(templatePath, "utf8");
  // 2. Armar tabla de inscritos
  let tabla_inscritos = (datos.det_ins || [])
    .map(
      (ins, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td>${pick(ins.idNumber, ins.ced_usu, "-")}</td>
            <td>${pick(ins.firstName, ins.nom_usu, "-")}</td>
            <td>${pick(ins.lastName, ins.ape_usu, "-")}</td>
            <td>${pick(ins.finalAttendancePercent, ins.por_asi_fin_usu, "-")}</td>
            ${
              eventoTipo === "COURSE" || eventoTipo === "CURSO"
                ? `<td>${pick(ins.finalGrade, ins.not_fin_usu, "-")}</td>`
                : ""
            }
            <td>${pick(ins.status, ins.est_ins, "-")}</td>
        </tr>
    `
    )
    .join("");
  // 3. Reemplazar los placeholders - USAR replaceAll() para reemplazar TODAS las ocurrencias
  html = html
    .replaceAll("{{nombre_evento}}", eventoNombre)
    .replaceAll(
      "{{creador}}",
      `${creadorNombre} ${creadorApellido}`
    )
    .replaceAll("{{duracion}}", eventoDuracion)
    .replaceAll(
      "{{fecha_inicio}}",
      new Date(eventoFechaInicio).toLocaleDateString()
    )
    .replaceAll(
      "{{fecha_fin}}",
      new Date(eventoFechaFin).toLocaleDateString()
    )
    .replaceAll("{{img_por_eve}}", eventoImagen)
    .replaceAll("{{tabla_inscritos}}", tabla_inscritos)
    .replaceAll(
      "{{columna_nota}}",
      eventoTipo === "COURSE" || eventoTipo === "CURSO" ? "<th>Nota</th>" : ""
    );

  // 4. Generar el PDF con Puppeteer
  const browser = await puppeteer.launch(obtenerPuppeteerConfig());
  const page = await browser.newPage();
  fs.writeFileSync("debug_reporte.html", html);
  await page.setContent(html, { waitUntil: "networkidle0" });

  await page.pdf({
    path: filePath,
    format: "A4",
    printBackground: true,
    margin: { top: 20, bottom: 20, left: 20, right: 20 },
  });

  await browser.close();
}

async function generarReporteMensualPDF(datos, filePath) {
  // 1. Leer plantilla HTML
  const templatePath = path.join(
    __dirname,
    "../templates/reporte_mensual.html"
  );
  let html = fs.readFileSync(templatePath, "utf8");
  // 2. Armar tabla de eventos
  let tabla_eventos = (datos.eve || [])
    .map(
      (ev, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td>${pick(ev.name, ev.nom_eve, "-")}</td>
            <td>${pick(ev.type, ev.tip_eve, "-")}</td>
            <td>${pick(ev.price, ev.val_eve, "-")}</td>
            <td>${
              pick(ev.endDate, ev.fec_fin_eve)
                ? new Date(pick(ev.endDate, ev.fec_fin_eve)).toLocaleDateString()
                : "-"
            }</td>
            <td>${pick(ev.creatorFirstName, ev.nom_cre, "")} ${pick(
              ev.creatorLastName,
              ev.ape_cre,
              ""
            )}</td>
            <td>${pick(ev.registrationCount, ev.can_ins, 0)}</td>
            <td>${pick(ev.totalRevenue, ev.tot_eve, 0)}</td>
        </tr>
    `
    )
    .join("");
  // 3. Reemplaza los placeholders - USAR replaceAll() para reemplazar TODAS las ocurrencias
  html = html
    .replaceAll("{{anio}}", datos.anio)
    .replaceAll("{{mes}}", datos.nombreMes)
    .replaceAll("{{tabla_eventos}}", tabla_eventos)
    .replaceAll("{{tot_tod_eve}}", datos.tot_tod_eve ?? 0);

  // 4. Genera el PDF con Puppeteer
  const browser = await puppeteer.launch(obtenerPuppeteerConfig());
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  await page.pdf({
    path: filePath,
    format: "A4",
    printBackground: true,
    margin: { top: 20, bottom: 20, left: 20, right: 20 },
  });

  await browser.close();
}

async function generarReporteCarreraPDF(datos, filePath) {
  console.log("🔍 [PDF] Datos recibidos para generar PDF:", {
    carrera: datos.carrera,
    estadisticas: datos.estadisticas,
    eventosPorCarrera: datos.eventosPorCarrera?.length || 0,
  });

  // 1. Leer plantilla HTML para reporte de carrera
  const templatePath = path.join(
    __dirname,
    "../templates/reporte_carrera.html"
  );
  let html = fs.readFileSync(templatePath, "utf8");

  console.log("📄 [PDF] Plantilla HTML leída correctamente");

  // 2. Armar tabla de eventos más populares
  let tabla_eventos = "";
  if (datos.eventosPorCarrera && datos.eventosPorCarrera.length > 0) {
    console.log(
      "📊 [PDF] Generando tabla de eventos, cantidad:",
      datos.eventosPorCarrera.length
    );
    tabla_eventos = datos.eventosPorCarrera
      .map(
        (evento, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td>${pick(evento.name, evento.nom_eve, "Sin nombre")}</td>
            <td>${new Date(pick(evento.startDate, evento.fec_ini_eve)).toLocaleDateString("es-ES")}</td>
            <td>${evento.totalInscritos || 0}</td>
            <td>${evento.totalAsistieron || 0}</td>
            <td>${evento.porcentajeAsistencia || 0}%</td>
        </tr>
    `
      )
      .join("");
  } else {
    tabla_eventos = `
      <tr>
        <td colspan="6" class="no-data">No hay eventos registrados para esta carrera</td>
      </tr>
    `;
  }

  // 3. Armar tabla de comparativa con otras carreras
  let tabla_comparativa = "";
  if (datos.estadisticas?.comparativaCarreras?.length > 0) {
    tabla_comparativa = datos.estadisticas.comparativaCarreras
      .map(
        (carrera, idx) => `
            <tr class="${
              pick(carrera.id, carrera.id_car) === pick(datos.carrera.id, datos.carrera.id_car)
                ? "carrera-actual"
                : ""
            }">
                <td>${idx + 1}</td>
                <td>${pick(carrera.name, carrera.nom_car, "Sin nombre")}</td>
                <td>${carrera.totalEstudiantes || 0}</td>
                <td>${carrera.totalInscripciones || 0}</td>
                <td>${carrera.eventosParticipados || 0}</td>
                <td>${Math.min(carrera.porcentajeParticipacion || 0, 100)}%</td>
            </tr>
        `
      )
      .join("");
  } else {
    tabla_comparativa = `
      <tr>
        <td colspan="6" class="no-data">No hay datos comparativos disponibles</td>
      </tr>
    `;
  }

  // 4. Reemplazar los placeholders - USAR replaceAll() para reemplazar TODAS las ocurrencias
  console.log("🔧 [PDF] Reemplazando placeholders...");
  console.log("🔧 [PDF] nombre_carrera:", pick(datos.carrera.name, datos.carrera.nom_car));
  console.log(
    "🔧 [PDF] nombre_universidad:",
    pick(datos.carrera.facultad?.universidad?.name, datos.carrera.facultad?.universidad?.nom_uni)
  );
  console.log("🔧 [PDF] nombre_facultad:", pick(datos.carrera.facultad?.name, datos.carrera.facultad?.nom_fac));

  html = html
    .replaceAll("{{nombre_carrera}}", pick(datos.carrera.name, datos.carrera.nom_car, "Sin nombre"))
    .replaceAll(
      "{{descripcion_carrera}}",
      pick(datos.carrera.description, datos.carrera.des_car, "Sin descripción")
    )
    .replaceAll(
      "{{total_estudiantes}}",
      datos.estadisticas?.totalEstudiantes || 0
    )
    .replaceAll(
      "{{total_inscripciones}}",
      datos.estadisticas?.totalInscripciones || 0
    )
    .replaceAll(
      "{{eventos_participados}}",
      datos.estadisticas?.eventosParticipados || 0
    )
    .replaceAll(
      "{{porcentaje_participacion}}",
      Math.min(
        Math.round(datos.estadisticas?.porcentajeParticipacion || 0),
        100
      )
    )
    .replaceAll("{{tabla_eventos}}", tabla_eventos)
    .replaceAll("{{tabla_comparativa}}", tabla_comparativa)
    .replaceAll("{{fecha_generacion}}", new Date().toLocaleDateString("es-ES"))
    .replaceAll(
      "{{nombre_universidad}}",
      pick(datos.carrera.facultad?.universidad?.name, datos.carrera.facultad?.universidad?.nom_uni, "Universidad")
    )
    .replaceAll(
      "{{nombre_facultad}}",
      pick(datos.carrera.facultad?.name, datos.carrera.facultad?.nom_fac, "Facultad")
    );

  console.log("✅ [PDF] Placeholders reemplazados correctamente");

  // Verificar que los placeholders han sido reemplazados
  const placeholdersRestantes = html.match(/\{\{[^}]+\}\}/g);
  if (placeholdersRestantes) {
    console.warn(
      "⚠️ [PDF] Placeholders no reemplazados:",
      placeholdersRestantes
    );
  } else {
    console.log(
      "✅ [PDF] Todos los placeholders fueron reemplazados correctamente"
    );
  }

  // 5. Generar el PDF con Puppeteer
  console.log("🖨️ [PDF] Iniciando generación de PDF con Puppeteer...");
  const browser = await puppeteer.launch(obtenerPuppeteerConfig());
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  await page.pdf({
    path: filePath,
    format: "A4",
    printBackground: true,
    margin: { top: 20, bottom: 20, left: 20, right: 20 },
  });

  await browser.close();
}

async function generarReporteInscripcionesPDF(datos, filePath) {
  console.log(
    "📊 [PDF INSCRIPCIONES] Iniciando generación de PDF de inscripciones"
  );

  // 1. Leer plantilla HTML
  const templatePath = path.join(
    __dirname,
    "../templates/reporte_inscripciones.html"
  );
  let html = fs.readFileSync(templatePath, "utf8");

  // 2. Preparar datos para las estadísticas
  const { estadisticas, tendencias, validaciones } = datos;

  // Crear tabla de estadísticas
  const tablaEstadisticas = `
    <tr>
      <td>Total de Inscripciones</td>
      <td class="numero">${estadisticas.total}</td>
      <td class="porcentaje">100%</td>
    </tr>
    <tr>
      <td>Pendientes</td>
      <td class="numero">${estadisticas.pendientes}</td>
      <td class="porcentaje">${
        estadisticas.total > 0
          ? Math.round((estadisticas.pendientes / estadisticas.total) * 100)
          : 0
      }%</td>
    </tr>
    <tr>
      <td>Aceptadas</td>
      <td class="numero">${estadisticas.aceptadas}</td>
      <td class="porcentaje">${
        estadisticas.total > 0
          ? Math.round((estadisticas.aceptadas / estadisticas.total) * 100)
          : 0
      }%</td>
    </tr>
    <tr>
      <td>Aprobadas</td>
      <td class="numero">${estadisticas.aprobadas}</td>
      <td class="porcentaje">${
        estadisticas.total > 0
          ? Math.round((estadisticas.aprobadas / estadisticas.total) * 100)
          : 0
      }%</td>
    </tr>
    <tr>
      <td>Rechazadas</td>
      <td class="numero">${estadisticas.rechazadas}</td>
      <td class="porcentaje">${
        estadisticas.total > 0
          ? Math.round((estadisticas.rechazadas / estadisticas.total) * 100)
          : 0
      }%</td>
    </tr>
    <tr>
      <td>Reprobadas</td>
      <td class="numero">${estadisticas.reprobadas}</td>
      <td class="porcentaje">${
        estadisticas.total > 0
          ? Math.round((estadisticas.reprobadas / estadisticas.total) * 100)
          : 0
      }%</td>
    </tr>
  `;

  // Crear tabla de tendencias
  const tablaTendencias = tendencias
    .map(
      (item) => `
    <tr>
      <td>${item.periodo}</td>
      <td class="numero">${item.total}</td>
      <td class="numero">${item.pendientes || 0}</td>
      <td class="numero">${item.aceptadas || 0}</td>
      <td class="numero">${item.aprobadas || 0}</td>
      <td class="numero">${item.rechazadas || 0}</td>
      <td class="numero">${item.reprobadas || 0}</td>
      <td class="variacion ${
        item.variacion > 0 ? "positiva" : item.variacion < 0 ? "negativa" : ""
      }">
        ${item.variacion > 0 ? "+" : ""}${item.variacion}%
      </td>
    </tr>
  `
    )
    .join("");

  // Crear tabla de validaciones
  const tablaValidaciones = validaciones
    .map(
      (item) => `
    <tr>
      <td>${item.responsable}</td>
      <td class="numero">${item.totalValidadas}</td>
      <td class="numero">${item.aceptadas || 0}</td>
      <td class="numero">${item.aprobadas || 0}</td>
      <td class="numero">${item.rechazadas || 0}</td>
      <td class="numero">${item.reprobadas || 0}</td>
      <td class="numero">${item.tiempoPromedio} hrs</td>
    </tr>
  `
    )
    .join("");

  // 3. Reemplazar placeholders
  html = html
    .replaceAll("{{fecha_inicio}}", datos.fechaInicio)
    .replaceAll("{{fecha_fin}}", datos.fechaFin)
    .replaceAll(
      "{{estado_filtro}}",
      datos.estado === "todos" ? "Todos los estados" : datos.estado
    )
    .replaceAll("{{fecha_generacion}}", datos.fechaGeneracion)
    .replaceAll("{{tabla_estadisticas}}", tablaEstadisticas)
    .replaceAll("{{tabla_tendencias}}", tablaTendencias)
    .replaceAll("{{tabla_validaciones}}", tablaValidaciones)
    .replaceAll("{{total_inscripciones}}", estadisticas.total)
    .replaceAll(
      "{{tiene_tendencias}}",
      tendencias.length > 0 ? "block" : "none"
    )
    .replaceAll(
      "{{tiene_validaciones}}",
      validaciones.length > 0 ? "block" : "none"
    );

  console.log("✅ [PDF INSCRIPCIONES] Placeholders reemplazados correctamente");

  // 4. Generar PDF con Puppeteer
  console.log(
    "🖨️ [PDF INSCRIPCIONES] Iniciando generación de PDF con Puppeteer..."
  );
  const browser = await puppeteer.launch(obtenerPuppeteerConfig());

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  await page.pdf({
    path: filePath,
    format: "A4",
    landscape: true,
    printBackground: true,
    margin: { top: 15, bottom: 15, left: 15, right: 15 },
  });

  await browser.close();
  console.log("✅ [PDF INSCRIPCIONES] PDF generado exitosamente");
}

async function generarReporteAsistenciaPDF(datos, filePath) {
  console.log("📊 [PDF ASISTENCIA] Iniciando generación de PDF de asistencia");

  // 1. Leer plantilla HTML
  const templatePath = path.join(
    __dirname,
    "../templates/reporte_asistencia.html"
  );
  let html = fs.readFileSync(templatePath, "utf8");

  // 2. Preparar datos según el tipo de reporte
  let contenidoHTML = "";
  let titulo = "";

  if (datos.tipoReporte === "evento") {
    // Reporte para un evento específico
    titulo = `Reporte de Asistencia - ${datos.nombreEvento}`;

    const porcentajeAsistenciaFormateado = Math.round(
      datos.porcentajeAsistencia * 100
    );

    contenidoHTML = `
      <div class="evento-info">
        <h2>${datos.nombreEvento}</h2>
        <p class="evento-fecha">Fecha: ${new Date(
          datos.fechaEvento
        ).toLocaleDateString("es-ES")}</p>
        <p class="evento-tipo">Tipo: ${datos.tipoEvento}</p>
      </div>

      <div class="stats-container">
        <div class="stat-card">
          <h3>Total Inscripciones</h3>
          <div class="stat-value">${datos.totalInscritos}</div>
        </div>
        <div class="stat-card">
          <h3>Total Asistencias</h3>
          <div class="stat-value">${datos.totalAsistencias}</div>
        </div>
        <div class="stat-card">
          <h3>No Asistieron</h3>
          <div class="stat-value">${datos.totalNoAsistieron}</div>
        </div>
        <div class="stat-card destacado">
          <h3>% Asistencia</h3>
          <div class="stat-value">${porcentajeAsistenciaFormateado}%</div>
        </div>
      </div>

      <div class="seccion">
        <h3>Detalle de Participantes</h3>
        <table class="tabla-detalles">
          <thead>
            <tr>
              <th>Participante</th>
              <th>% Asistencia</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${datos.detalles
              .map(
                (detalle) => `
              <tr>
                <td>${detalle.usuario}</td>
                <td class="numero">${Math.round(
                  detalle.porcentajeAsistencia
                )}%</td>
                <td class="estado ${detalle.estado.toLowerCase()}">${
                  detalle.estado
                }</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  } else {
    // Reporte comparativo
    titulo = `Reporte Comparativo de Asistencia${
      datos.tipoFiltro !== "todos" ? " - " + datos.tipoFiltro : ""
    }`;

    contenidoHTML = `
      <div class="seccion">
        <h3>Comparativa de Asistencia entre Eventos</h3>
        <table class="tabla-comparativa">
          <thead>
            <tr>
              <th>Evento</th>
              <th>Tipo</th>
              <th>Fecha</th>
              <th>Inscripciones</th>
              <th>Asistencias</th>
              <th>% Asistencia</th>
            </tr>
          </thead>
          <tbody>
            ${datos.comparativa
              .map(
                (evento) => `
              <tr>
                <td class="nombre-evento">${evento.nombreEvento}</td>
                <td>${evento.tipoEvento}</td>
                <td>${new Date(evento.fechaEvento).toLocaleDateString(
                  "es-ES"
                )}</td>
                <td class="numero">${evento.totalInscritos}</td>
                <td class="numero">${evento.totalAsistencias}</td>
                <td class="porcentaje ${
                  evento.porcentajeAsistencia >= 0.8
                    ? "alta"
                    : evento.porcentajeAsistencia >= 0.5
                    ? "media"
                    : "baja"
                }">
                  ${Math.round(evento.porcentajeAsistencia * 100)}%
                </td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>

      <div class="seccion">
        <h3>Análisis de No-Shows por Tipo de Evento</h3>
        <table class="tabla-noshows">
          <thead>
            <tr>
              <th>Tipo de Evento</th>
              <th>Eventos</th>
              <th>Total Inscripciones</th>
              <th>No-Shows</th>
              <th>% No-Shows</th>
            </tr>
          </thead>
          <tbody>
            ${datos.noShowsAnalisis
              .map(
                (tipo) => `
              <tr>
                <td class="tipo-evento">${tipo.tipoEvento}</td>
                <td class="numero">${tipo.cantidadEventos}</td>
                <td class="numero">${tipo.totalInscritos}</td>
                <td class="numero">${tipo.totalNoShows}</td>
                <td class="porcentaje ${
                  tipo.porcentajeNoShows >= 0.3
                    ? "alta"
                    : tipo.porcentajeNoShows >= 0.15
                    ? "media"
                    : "baja"
                }">
                  ${Math.round(tipo.porcentajeNoShows * 100)}%
                </td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  // 3. Reemplazar marcadores en la plantilla
  html = html
    .replaceAll("{{titulo}}", titulo)
    .replaceAll("{{contenido}}", contenidoHTML)
    .replaceAll("{{fecha_generacion}}", datos.fechaGeneracion);

  // 4. Generar PDF con Puppeteer
  const browser = await puppeteer.launch(obtenerPuppeteerConfig());

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  await page.pdf({
    path: filePath,
    format: "A4",
    printBackground: true,
    margin: {
      top: "4mm",
      right: "4mm",
      bottom: "4mm",
      left: "4mm",
    },
  });

  await browser.close();
  console.log("✅ [PDF ASISTENCIA] PDF generado exitosamente");
}

async function generarReporteCertificadosPDF(datos, filePath) {
  console.log(
    "📊 [PDF CERTIFICADOS] Iniciando generación de PDF de certificados"
  );

  // 1. Leer plantilla HTML
  const templatePath = path.join(
    __dirname,
    "../templates/reporte_certificados.html"
  );
  let html = fs.readFileSync(templatePath, "utf8");

  // 2. Preparar datos para las estadísticas
  const { resumen, descargasPorPeriodo, eventosCertificados } = datos;

  // Crear tabla de estadísticas de descarga por período
  let tablaDescargas = "";
  if (descargasPorPeriodo && descargasPorPeriodo.length > 0) {
    tablaDescargas = descargasPorPeriodo
      .map(
        (periodo) => `
        <tr>
          <td>${periodo.periodo}</td>
          <td class="numero">${periodo.certificadosEmitidos}</td>
          <td class="numero">${periodo.certificadosDescargados}</td>
          <td class="porcentaje">${Math.round(
            periodo.porcentajeDescarga * 100
          )}%</td>
          <td>
            <div class="descarga-progress">
              <div class="descarga-progress-bar" style="width: ${Math.round(
                periodo.porcentajeDescarga * 100
              )}%"></div>
            </div>
          </td>
        </tr>
      `
      )
      .join("");
  } else {
    tablaDescargas = `
      <tr>
        <td colspan="5" class="sin-datos">No hay datos de descargas disponibles para este período</td>
      </tr>
    `;
  }

  // Crear tabla de eventos con mayor emisión de certificados
  let tablaEventos = "";
  if (eventosCertificados && eventosCertificados.length > 0) {
    tablaEventos = eventosCertificados
      .map(
        (evento) => `
        <tr>
          <td>${evento.nombreEvento}</td>
          <td>${evento.tipoEvento}</td>
          <td>${new Date(evento.fechaEvento).toLocaleDateString("es-ES")}</td>
          <td class="numero">${evento.certificadosEmitidos}</td>
          <td class="numero">${evento.certificadosDescargados}</td>
          <td class="porcentaje">${Math.round(
            (evento.certificadosDescargados / evento.certificadosEmitidos) *
              100 || 0
          )}%</td>
        </tr>
      `
      )
      .join("");
  } else {
    tablaEventos = `
      <tr>
        <td colspan="6" class="sin-datos">No hay eventos con certificados disponibles para este período</td>
      </tr>
    `;
  }

  // 3. Reemplazar placeholders - USAR replaceAll() para reemplazar TODAS las ocurrencias
  html = html
    .replaceAll("{{fecha_inicio}}", datos.fechaInicio)
    .replaceAll("{{fecha_fin}}", datos.fechaFin)
    .replaceAll("{{total_certificados}}", resumen?.totalCertificados || 0)
    .replaceAll(
      "{{certificados_descargados}}",
      resumen?.certificadosDescargados || 0
    )
    .replaceAll(
      "{{porcentaje_descarga}}",
      Math.round(
        resumen?.totalCertificados > 0
          ? (resumen.certificadosDescargados / resumen.totalCertificados) * 100
          : 0
      )
    )
    .replaceAll(
      "{{eventos_con_certificados}}",
      resumen?.eventosConCertificados || 0
    )
    .replaceAll(
      "{{promedio_certificados_evento}}",
      Math.round(resumen?.promedioCertificadosPorEvento || 0)
    )
    .replaceAll("{{tabla_descargas}}", tablaDescargas)
    .replaceAll("{{tabla_eventos}}", tablaEventos)
    .replaceAll("{{fecha_generacion}}", datos.fechaGeneracion);

  console.log("✅ [PDF CERTIFICADOS] Placeholders reemplazados correctamente");

  // 4. Generar PDF con Puppeteer
  console.log(
    "🖨️ [PDF CERTIFICADOS] Iniciando generación de PDF con Puppeteer..."
  );
  const browser = await puppeteer.launch(obtenerPuppeteerConfig());

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  await page.pdf({
    path: filePath,
    format: "A4",
    landscape: true,
    printBackground: true,
    margin: { top: 15, bottom: 15, left: 15, right: 15 },
  });

  await browser.close();
  console.log("✅ [PDF CERTIFICADOS] PDF generado exitosamente");
}

async function generarReporteIngresosPagosPDF(datos, filePath) {
  console.log(
    "💰 [PDF INGRESOS] Iniciando generación de PDF de ingresos y pagos"
  );

  // 1. Leer plantilla HTML
  const templatePath = path.join(
    __dirname,
    "../templates/reporte_ingresos_pagos.html"
  );
  let html = fs.readFileSync(templatePath, "utf8");

  // 2. Formatear datos
  const {
    metricas,
    ingresosPorTipo,
    eventosRentables,
    tendencias,
    comprobantesRechazados,
    fechaInicio,
    fechaFin,
    tipoEvento,
    estadoPago,
  } = datos;

  // 3. Formatear moneda
  const formatearMoneda = (valor) => {
    return `$${parseFloat(valor || 0).toFixed(2)}`;
  };

  // 4. Formatear porcentaje
  const formatearPorcentaje = (valor) => {
    return `${Math.round(parseFloat(valor || 0) * 100)}%`;
  };

  // 5. Crear tabla de ingresos por tipo
  const tablaIngresosTipo = ingresosPorTipo
    .map(
      (item) => `
    <tr>
      <td>${item.tipoEvento || "Sin especificar"}</td>
      <td class="numero">${item.totalInscripciones || 0}</td>
      <td class="numero">${item.pagosConfirmados || 0}</td>
      <td class="moneda">${formatearMoneda(item.ingresosTotales)}</td>
      <td class="tasa-conversion">${formatearPorcentaje(
        item.tasaConversion
      )}</td>
      <td class="moneda">${formatearMoneda(item.ingresoPromedio)}</td>
    </tr>
  `
    )
    .join("");

  // 6. Crear tabla de eventos rentables
  const tablaEventosRentables = eventosRentables
    .map(
      (item) => `
    <tr>
      <td>${item.nombreEvento || "Sin nombre"}</td>
      <td>${item.tipoEvento || "-"}</td>
      <td class="moneda">${formatearMoneda(item.valorEvento)}</td>
      <td class="numero">${item.totalInscripciones || 0}</td>
      <td class="numero">${item.pagosConfirmados || 0}</td>
      <td class="moneda">${formatearMoneda(item.ingresosTotales)}</td>
      <td class="tasa-conversion">${formatearPorcentaje(
        item.tasaConversion
      )}</td>
    </tr>
  `
    )
    .join("");

  // 7. Crear tabla de tendencias
  const tablaTendencias = tendencias
    .map(
      (item) => `
    <tr>
      <td>${item.periodo || "N/A"}</td>
      <td class="numero">${item.totalInscripciones || 0}</td>
      <td class="numero">${item.pagosConfirmados || 0}</td>
      <td class="moneda">${formatearMoneda(item.ingresosTotales)}</td>
      <td class="tasa-conversion">${formatearPorcentaje(
        item.tasaConversion
      )}</td>
      <td class="moneda">${formatearMoneda(item.ingresoPromedio)}</td>
      <td class="variacion ${
        item.variacionIngresos > 0
          ? "positiva"
          : item.variacionIngresos < 0
          ? "negativa"
          : ""
      }">
        ${item.variacionIngresos > 0 ? "+" : ""}${Math.round(
        item.variacionIngresos || 0
      )}%
      </td>
      <td class="variacion ${
        item.variacionConversion > 0
          ? "positiva"
          : item.variacionConversion < 0
          ? "negativa"
          : ""
      }">
        ${item.variacionConversion > 0 ? "+" : ""}${Math.round(
        item.variacionConversion || 0
      )}%
      </td>
    </tr>
  `
    )
    .join("");

  // 8. Crear tabla de comprobantes rechazados
  const tablaComprobantesRechazados = comprobantesRechazados
    .map(
      (item) => `
    <tr>
      <td>${item.nombreEvento || "Sin nombre"}</td>
      <td class="moneda">${formatearMoneda(item.valorEvento)}</td>
      <td class="numero">${item.comprobantesRechazados || 0}</td>
      <td class="numero">${item.totalInscripciones || 0}</td>
      <td class="porcentaje">${formatearPorcentaje(item.porcentajeRechazo)}</td>
    </tr>
  `
    )
    .join("");

  // 9. Crear texto de filtros aplicados
  const filtrosTexto = [];
  if (tipoEvento && tipoEvento !== "todos") {
    filtrosTexto.push(`Tipo: ${tipoEvento}`);
  }
  if (estadoPago && estadoPago !== "todos") {
    filtrosTexto.push(`Estado: ${estadoPago}`);
  }
  const filtrosAplicados =
    filtrosTexto.length > 0
      ? `Filtros aplicados: ${filtrosTexto.join(", ")}`
      : "Sin filtros específicos aplicados";

  // 10. Reemplazar placeholders
  html = html
    .replaceAll("{{fecha_inicio}}", fechaInicio || "N/A")
    .replaceAll("{{fecha_fin}}", fechaFin || "N/A")
    .replaceAll(
      "{{tipo_evento_filtro}}",
      tipoEvento === "todos" ? "Todos los tipos" : tipoEvento || "Todos"
    )
    .replaceAll(
      "{{estado_pago_filtro}}",
      estadoPago === "todos" ? "Todos los estados" : estadoPago || "Todos"
    )
    .replaceAll("{{filtros_aplicados}}", filtrosAplicados)
    .replaceAll("{{fecha_generacion}}", new Date().toLocaleDateString("es-ES"))
    // Métricas generales
    .replaceAll("{{total_ingresos}}", formatearMoneda(metricas?.totalIngresos))
    .replaceAll("{{total_inscripciones}}", metricas?.totalInscripciones || 0)
    .replaceAll("{{pagos_confirmados}}", metricas?.pagosConfirmados || 0)
    .replaceAll(
      "{{tasa_conversion}}",
      formatearPorcentaje(metricas?.tasaConversion)
    )
    .replaceAll(
      "{{ingreso_promedio}}",
      formatearMoneda(metricas?.ingresoPromedio)
    )
    // Tablas
    .replaceAll(
      "{{tabla_ingresos_tipo}}",
      tablaIngresosTipo ||
        '<tr><td colspan="6" class="sin-datos">No hay datos disponibles</td></tr>'
    )
    .replaceAll(
      "{{tabla_eventos_rentables}}",
      tablaEventosRentables ||
        '<tr><td colspan="7" class="sin-datos">No hay datos disponibles</td></tr>'
    )
    .replaceAll(
      "{{tabla_tendencias}}",
      tablaTendencias ||
        '<tr><td colspan="8" class="sin-datos">No hay datos disponibles</td></tr>'
    )
    .replaceAll(
      "{{tabla_comprobantes_rechazados}}",
      tablaComprobantesRechazados ||
        '<tr><td colspan="5" class="sin-datos">No hay datos disponibles</td></tr>'
    );

  console.log("✅ [PDF INGRESOS] Placeholders reemplazados correctamente");

  // 11. Generar PDF con Puppeteer
  console.log("🖨️ [PDF INGRESOS] Iniciando generación de PDF con Puppeteer...");
  const browser = await puppeteer.launch(obtenerPuppeteerConfig());

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  await page.pdf({
    path: filePath,
    format: "A4",
    landscape: true, // Formato horizontal debido a muchas columnas
    printBackground: true,
    margin: { top: 15, bottom: 15, left: 15, right: 15 },
  });

  await browser.close();
  console.log("✅ [PDF INGRESOS] PDF generado exitosamente");
}

module.exports = {
  generarReporteEventoPDF,
  generarReporteMensualPDF,
  generarReporteCarreraPDF,
  generarReporteInscripcionesPDF,
  generarReporteAsistenciaPDF,
  generarReporteCertificadosPDF,
  generarReporteIngresosPagosPDF,
};
