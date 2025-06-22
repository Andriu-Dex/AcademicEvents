# Implementación de Descarga de Certificados

## Descripción General

Esta guía describe cómo implementar un sistema completo para la descarga de certificados en PDF en la plataforma de eventos académicos. El sistema permite a los usuarios descargar sus certificados de participación o aprobación después de completar eventos.

## Arquitectura del Sistema

### Frontend (React)

- **Componente**: Vista de certificados del usuario
- **Funcionalidad**: Mostrar certificados disponibles y permitir descarga
- **UI/UX**: Interfaz intuitiva con botones de descarga y estados de carga

### Backend (Node.js + Express + Prisma)

- **Controlador**: Manejo de rutas para certificados
- **Generación PDF**: Creación dinámica de certificados con Puppeteer
- **Validación**: Verificación de permisos y existencia de certificados

## Implementación Paso a Paso

### 1. Frontend - Componente de Certificados

#### Crear el archivo: `frontend/src/views/usuario/MisCertificados.jsx`

```jsx
import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosConfig";
import { Download, Award, Calendar, CheckCircle, Clock } from "lucide-react";
import { toast } from "react-toastify";
import "./styles/MisCertificados.css";

const MisCertificados = () => {
  const [certificados, setCertificados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDownloads, setLoadingDownloads] = useState({});

  // Cargar certificados del usuario
  useEffect(() => {
    const cargarCertificados = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/usuario/mis-certificados");
        setCertificados(res.data);
      } catch (error) {
        console.error("Error al cargar certificados:", error);
        toast.error("Error al cargar los certificados");
      } finally {
        setLoading(false);
      }
    };

    cargarCertificados();
  }, []);

  // Función para descargar un certificado específico
  const descargarCertificado = async (certificado) => {
    const { id_cer, evento, tip_cer } = certificado;

    try {
      setLoadingDownloads((prev) => ({ ...prev, [id_cer]: true }));

      const res = await axiosInstance.get(
        `/usuario/certificado/descargar/${id_cer}`,
        { responseType: "blob" }
      );

      // Crear nombre del archivo
      const tipoTexto =
        tip_cer === "APROBACION" ? "Aprobacion" : "Participacion";
      const nombreArchivo = `Certificado_${tipoTexto}_${evento.nom_eve.replace(
        /\s+/g,
        "_"
      )}.pdf`;

      // Descargar el archivo
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", nombreArchivo);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Certificado descargado exitosamente");
    } catch (error) {
      console.error("Error al descargar certificado:", error);
      toast.error("No se pudo descargar el certificado");
    } finally {
      setLoadingDownloads((prev) => ({ ...prev, [id_cer]: false }));
    }
  };

  // Función para obtener el color del badge según el tipo
  const getBadgeColor = (tipo) => {
    return tipo === "APROBACION" ? "badge-success" : "badge-info";
  };

  return (
    <div className="mis-certificados-container">
      <div className="certificados-header">
        <h2>
          <Award size={24} className="icon-header" />
          Mis Certificados
        </h2>
        <p>Descarga tus certificados de participación y aprobación</p>
      </div>

      {loading ? (
        <div className="loading-container">
          <p>Cargando certificados...</p>
        </div>
      ) : certificados.length > 0 ? (
        <div className="certificados-grid">
          {certificados.map((certificado) => (
            <div key={certificado.id_cer} className="certificado-card">
              <div className="certificado-header">
                <div className="certificado-tipo">
                  <span
                    className={`badge ${getBadgeColor(certificado.tip_cer)}`}
                  >
                    {certificado.tip_cer === "APROBACION"
                      ? "Aprobación"
                      : "Participación"}
                  </span>
                </div>
                <div className="certificado-fecha">
                  <Calendar size={16} />
                  {new Date(certificado.fec_gen_cer).toLocaleDateString(
                    "es-ES"
                  )}
                </div>
              </div>

              <div className="certificado-evento">
                <h3>{certificado.evento.nom_eve}</h3>
                <p className="evento-tipo">{certificado.evento.tip_eve}</p>
                <p className="evento-duracion">
                  {certificado.evento.dur_hor_eve} horas académicas
                </p>
              </div>

              <div className="certificado-codigo">
                <small>Código de validación: {certificado.cod_val_cer}</small>
              </div>

              <div className="certificado-actions">
                <button
                  className="btn-descargar-cert"
                  onClick={() => descargarCertificado(certificado)}
                  disabled={loadingDownloads[certificado.id_cer]}
                >
                  {loadingDownloads[certificado.id_cer] ? (
                    <>
                      <Clock size={16} />
                      Descargando...
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Descargar PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="sin-certificados">
          <div className="sin-certificados-icono">
            <Award size={64} />
          </div>
          <h3>No tienes certificados disponibles</h3>
          <p>
            Completa eventos para obtener certificados de participación o
            aprobación
          </p>
        </div>
      )}
    </div>
  );
};

export default MisCertificados;
```

#### Crear estilos: `frontend/src/views/usuario/styles/MisCertificados.css`

```css
.mis-certificados-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.certificados-header {
  text-align: center;
  margin-bottom: 30px;
}

.certificados-header h2 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #8a1538;
  margin-bottom: 10px;
}

.certificados-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.certificado-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: transform 0.2s, box-shadow 0.2s;
}

.certificado-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.certificado-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.badge-success {
  background-color: #dcfce7;
  color: #166534;
}

.badge-info {
  background-color: #dbeafe;
  color: #1e40af;
}

.certificado-fecha {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #6b7280;
  font-size: 14px;
}

.certificado-evento h3 {
  color: #111827;
  margin-bottom: 8px;
  font-size: 18px;
}

.evento-tipo {
  color: #8a1538;
  font-weight: 500;
  margin-bottom: 4px;
}

.evento-duracion {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 15px;
}

.certificado-codigo {
  background-color: #f9fafb;
  padding: 8px;
  border-radius: 6px;
  margin-bottom: 15px;
}

.certificado-codigo small {
  color: #6b7280;
  font-family: monospace;
}

.btn-descargar-cert {
  width: 100%;
  background: linear-gradient(135deg, #8a1538, #a91d42);
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.btn-descargar-cert:hover:not(:disabled) {
  background: linear-gradient(135deg, #9f1c47, #b91d43);
  transform: translateY(-1px);
}

.btn-descargar-cert:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.sin-certificados {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.sin-certificados-icono {
  margin-bottom: 20px;
}

.loading-container {
  text-align: center;
  padding: 40px;
}
```

### 2. Backend - Controlador de Certificados

#### Agregar rutas en el controlador: `backend/src/controllers/certificado.controller.js`

```javascript
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const path = require("path");
const fs = require("fs");
const { generarCertificadoPDF } = require("../utils/certificado.utils");

// Obtener certificados del usuario autenticado
async function getMisCertificados(req, res) {
  try {
    const { id_cue } = req.user;

    const certificados = await prisma.certificado.findMany({
      where: {
        inscripcion: {
          id_cor_ins: id_cue,
        },
      },
      include: {
        inscripcion: {
          include: {
            evento: {
              select: {
                nom_eve: true,
                tip_eve: true,
                dur_hor_eve: true,
                fec_ini_eve: true,
                fec_fin_eve: true,
              },
            },
            cuenta: {
              include: {
                usuario: {
                  select: {
                    nom_usu: true,
                    ape_usu: true,
                    ced_usu: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        fec_gen_cer: "desc",
      },
    });

    // Formatear datos para el frontend
    const certificadosFormateados = certificados.map((cert) => ({
      id_cer: cert.id_cer,
      tip_cer: cert.tip_cer,
      fec_gen_cer: cert.fec_gen_cer,
      cod_val_cer: cert.cod_val_cer,
      evento: cert.inscripcion.evento,
      usuario: cert.inscripcion.cuenta.usuario,
    }));

    res.json(certificadosFormateados);
  } catch (error) {
    console.error("Error al obtener certificados:", error);
    res.status(500).json({
      msg: "Error al obtener certificados",
      error: error.message,
    });
  }
}

// Descargar un certificado específico
async function descargarCertificado(req, res) {
  try {
    const { id_cer } = req.params;
    const { id_cue } = req.user;

    // Verificar que el certificado pertenece al usuario
    const certificado = await prisma.certificado.findFirst({
      where: {
        id_cer,
        inscripcion: {
          id_cor_ins: id_cue,
        },
      },
      include: {
        inscripcion: {
          include: {
            evento: true,
            cuenta: {
              include: {
                usuario: {
                  include: {
                    carrera: {
                      include: {
                        facultad: {
                          include: {
                            universidad: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!certificado) {
      return res.status(404).json({
        msg: "Certificado no encontrado o no autorizado",
      });
    }

    // Preparar datos para la generación del PDF
    const datosCertificado = {
      certificado,
      usuario: certificado.inscripcion.cuenta.usuario,
      evento: certificado.inscripcion.evento,
      carrera: certificado.inscripcion.cuenta.usuario.carrera,
      facultad: certificado.inscripcion.cuenta.usuario.carrera?.facultad,
      universidad:
        certificado.inscripcion.cuenta.usuario.carrera?.facultad?.universidad,
    };

    // Crear directorio temporal si no existe
    const tempDir = path.join(process.cwd(), "uploads", "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Generar nombre del archivo temporal
    const tipoTexto =
      certificado.tip_cer === "APROBACION" ? "Aprobacion" : "Participacion";
    const nombreArchivo = `Certificado_${tipoTexto}_${certificado.inscripcion.evento.nom_eve.replace(
      /\s+/g,
      "_"
    )}.pdf`;
    const filePath = path.join(tempDir, `${Date.now()}_${nombreArchivo}`);

    // Generar el PDF
    await generarCertificadoPDF(datosCertificado, filePath);

    // Leer el PDF como buffer
    const pdfBuffer = fs.readFileSync(filePath);

    // Eliminar el archivo temporal
    fs.unlink(filePath, () => {});

    // Enviar el PDF como respuesta
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${nombreArchivo}"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error al descargar certificado:", error);
    res.status(500).json({
      msg: "Error al generar el certificado",
      error: error.message,
    });
  }
}

module.exports = {
  getMisCertificados,
  descargarCertificado,
};
```

### 3. Utilidad para Generar PDFs de Certificados

#### Crear: `backend/src/utils/certificado.utils.js`

```javascript
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

async function generarCertificadoPDF(datos, filePath) {
  console.log("🏆 [CERTIFICADO] Iniciando generación de certificado PDF");
  console.log("🏆 [CERTIFICADO] Datos recibidos:", {
    usuario: datos.usuario?.nom_usu,
    evento: datos.evento?.nom_eve,
    tipo: datos.certificado?.tip_cer,
  });

  // Leer plantilla HTML según el tipo de certificado
  const tipoTemplate =
    datos.certificado.tip_cer === "APROBACION" ? "aprobacion" : "participacion";
  const templatePath = path.join(
    __dirname,
    `../templates/certificado_${tipoTemplate}.html`
  );

  let html = fs.readFileSync(templatePath, "utf8");
  console.log("📄 [CERTIFICADO] Plantilla HTML leída correctamente");

  // Preparar datos para reemplazo
  const fechaEvento = new Date(datos.evento.fec_ini_eve).toLocaleDateString(
    "es-ES",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const fechaCertificado = new Date(
    datos.certificado.fec_gen_cer
  ).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Reemplazar placeholders
  html = html
    .replaceAll(
      "{{nombre_completo}}",
      `${datos.usuario.nom_usu} ${datos.usuario.ape_usu}`
    )
    .replaceAll("{{cedula}}", datos.usuario.ced_usu)
    .replaceAll("{{nombre_evento}}", datos.evento.nom_eve)
    .replaceAll("{{tipo_evento}}", datos.evento.tip_eve)
    .replaceAll("{{duracion_horas}}", datos.evento.dur_hor_eve)
    .replaceAll("{{fecha_evento}}", fechaEvento)
    .replaceAll("{{fecha_certificado}}", fechaCertificado)
    .replaceAll("{{codigo_validacion}}", datos.certificado.cod_val_cer)
    .replaceAll("{{nombre_carrera}}", datos.carrera?.nom_car || "")
    .replaceAll("{{nombre_facultad}}", datos.facultad?.nom_fac || "")
    .replaceAll("{{nombre_universidad}}", datos.universidad?.nom_uni || "");

  // Agregar información específica según el tipo
  if (datos.certificado.tip_cer === "APROBACION") {
    // Para certificados de aprobación, agregar nota si está disponible
    const nota = datos.inscripcion?.inscripcion_curso?.not_fin_usu || "N/A";
    html = html.replaceAll("{{nota_final}}", nota);
  }

  console.log("✅ [CERTIFICADO] Placeholders reemplazados correctamente");

  // Verificar placeholders no reemplazados
  const placeholdersRestantes = html.match(/\{\{[^}]+\}\}/g);
  if (placeholdersRestantes) {
    console.warn(
      "⚠️ [CERTIFICADO] Placeholders no reemplazados:",
      placeholdersRestantes
    );
  }

  // Generar el PDF con Puppeteer
  console.log("🖨️ [CERTIFICADO] Iniciando generación de PDF con Puppeteer...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-web-security"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  await page.pdf({
    path: filePath,
    format: "A4",
    landscape: true, // Los certificados suelen ser horizontales
    printBackground: true,
    margin: { top: 20, bottom: 20, left: 20, right: 20 },
  });

  await browser.close();
  console.log("✅ [CERTIFICADO] PDF generado exitosamente");
}

module.exports = {
  generarCertificadoPDF,
};
```

### 4. Plantillas HTML para Certificados

#### Crear: `backend/src/templates/certificado_participacion.html`

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Certificado de Participación</title>
    <style>
      @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500;600&display=swap");

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: "Inter", sans-serif;
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        padding: 40px;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .certificado {
        background: white;
        width: 100%;
        max-width: 1000px;
        padding: 60px;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        border: 8px solid #8a1538;
        position: relative;
        overflow: hidden;
      }

      .certificado::before {
        content: "";
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(
          circle,
          rgba(138, 21, 56, 0.03) 0%,
          transparent 70%
        );
        z-index: 0;
      }

      .contenido {
        position: relative;
        z-index: 1;
        text-align: center;
      }

      .header {
        margin-bottom: 40px;
      }

      .titulo {
        font-family: "Playfair Display", serif;
        font-size: 48px;
        color: #8a1538;
        font-weight: 700;
        margin-bottom: 10px;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
      }

      .subtitulo {
        font-size: 24px;
        color: #64748b;
        font-weight: 300;
      }

      .cuerpo {
        margin: 40px 0;
        line-height: 1.8;
      }

      .texto-principal {
        font-size: 20px;
        color: #334155;
        margin-bottom: 30px;
      }

      .nombre-persona {
        font-family: "Playfair Display", serif;
        font-size: 36px;
        color: #8a1538;
        font-weight: 700;
        margin: 20px 0;
        text-decoration: underline;
        text-decoration-color: #a91d42;
        text-decoration-thickness: 2px;
      }

      .evento-info {
        background: linear-gradient(135deg, #f8fafc, #e2e8f0);
        padding: 30px;
        border-radius: 15px;
        margin: 30px 0;
        border-left: 5px solid #8a1538;
      }

      .evento-titulo {
        font-size: 24px;
        color: #8a1538;
        font-weight: 600;
        margin-bottom: 15px;
      }

      .evento-detalles {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        text-align: left;
      }

      .detalle {
        display: flex;
        flex-direction: column;
      }

      .detalle-label {
        font-size: 14px;
        color: #64748b;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 5px;
      }

      .detalle-valor {
        font-size: 16px;
        color: #334155;
        font-weight: 600;
      }

      .footer {
        margin-top: 50px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 40px;
        align-items: end;
      }

      .fecha-lugar {
        text-align: left;
      }

      .codigo-validacion {
        text-align: right;
      }

      .fecha-texto {
        font-size: 16px;
        color: #64748b;
        margin-bottom: 5px;
      }

      .fecha-valor {
        font-size: 18px;
        color: #334155;
        font-weight: 600;
      }

      .codigo-label {
        font-size: 12px;
        color: #64748b;
        margin-bottom: 5px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .codigo-valor {
        font-family: "Courier New", monospace;
        font-size: 14px;
        color: #8a1538;
        font-weight: bold;
        background: #f1f5f9;
        padding: 8px 12px;
        border-radius: 6px;
        display: inline-block;
      }

      .universidad-info {
        position: absolute;
        bottom: 20px;
        left: 20px;
        right: 20px;
        text-align: center;
        font-size: 12px;
        color: #64748b;
        border-top: 1px solid #e2e8f0;
        padding-top: 15px;
      }
    </style>
  </head>
  <body>
    <div class="certificado">
      <div class="contenido">
        <div class="header">
          <h1 class="titulo">CERTIFICADO</h1>
          <p class="subtitulo">DE PARTICIPACIÓN</p>
        </div>

        <div class="cuerpo">
          <p class="texto-principal">
            Por medio del presente documento se certifica que
          </p>

          <div class="nombre-persona">{{nombre_completo}}</div>

          <p class="texto-principal">
            Con cédula de identidad N° {{cedula}}, participó satisfactoriamente
            en:
          </p>

          <div class="evento-info">
            <h2 class="evento-titulo">{{nombre_evento}}</h2>
            <div class="evento-detalles">
              <div class="detalle">
                <span class="detalle-label">Tipo de Evento</span>
                <span class="detalle-valor">{{tipo_evento}}</span>
              </div>
              <div class="detalle">
                <span class="detalle-label">Duración</span>
                <span class="detalle-valor"
                  >{{duracion_horas}} horas académicas</span
                >
              </div>
              <div class="detalle">
                <span class="detalle-label">Fecha de Realización</span>
                <span class="detalle-valor">{{fecha_evento}}</span>
              </div>
              <div class="detalle">
                <span class="detalle-label">Carrera</span>
                <span class="detalle-valor">{{nombre_carrera}}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="footer">
          <div class="fecha-lugar">
            <p class="fecha-texto">Expedido el:</p>
            <p class="fecha-valor">{{fecha_certificado}}</p>
          </div>
          <div class="codigo-validacion">
            <p class="codigo-label">Código de Validación</p>
            <span class="codigo-valor">{{codigo_validacion}}</span>
          </div>
        </div>
      </div>

      <div class="universidad-info">
        {{nombre_universidad}} - {{nombre_facultad}}<br />
        Este certificado puede ser verificado ingresando el código de validación
        en nuestro sitio web oficial.
      </div>
    </div>
  </body>
</html>
```

#### Crear: `backend/src/templates/certificado_aprobacion.html`

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Certificado de Aprobación</title>
    <style>
      @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500;600&display=swap");

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: "Inter", sans-serif;
        background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        padding: 40px;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .certificado {
        background: white;
        width: 100%;
        max-width: 1000px;
        padding: 60px;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        border: 8px solid #16a34a;
        position: relative;
        overflow: hidden;
      }

      .certificado::before {
        content: "";
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(
          circle,
          rgba(22, 163, 74, 0.03) 0%,
          transparent 70%
        );
        z-index: 0;
      }

      .contenido {
        position: relative;
        z-index: 1;
        text-align: center;
      }

      .header {
        margin-bottom: 40px;
      }

      .titulo {
        font-family: "Playfair Display", serif;
        font-size: 48px;
        color: #16a34a;
        font-weight: 700;
        margin-bottom: 10px;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
      }

      .subtitulo {
        font-size: 24px;
        color: #64748b;
        font-weight: 300;
      }

      .cuerpo {
        margin: 40px 0;
        line-height: 1.8;
      }

      .texto-principal {
        font-size: 20px;
        color: #334155;
        margin-bottom: 30px;
      }

      .nombre-persona {
        font-family: "Playfair Display", serif;
        font-size: 36px;
        color: #16a34a;
        font-weight: 700;
        margin: 20px 0;
        text-decoration: underline;
        text-decoration-color: #22c55e;
        text-decoration-thickness: 2px;
      }

      .evento-info {
        background: linear-gradient(135deg, #f0fdf4, #dcfce7);
        padding: 30px;
        border-radius: 15px;
        margin: 30px 0;
        border-left: 5px solid #16a34a;
      }

      .evento-titulo {
        font-size: 24px;
        color: #16a34a;
        font-weight: 600;
        margin-bottom: 15px;
      }

      .evento-detalles {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 20px;
        text-align: left;
      }

      .detalle {
        display: flex;
        flex-direction: column;
      }

      .detalle-label {
        font-size: 14px;
        color: #64748b;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 5px;
      }

      .detalle-valor {
        font-size: 16px;
        color: #334155;
        font-weight: 600;
      }

      .nota-destacada {
        background: linear-gradient(135deg, #fef3c7, #fde68a);
        border: 2px solid #f59e0b;
        border-radius: 10px;
        padding: 20px;
        margin: 25px 0;
      }

      .nota-texto {
        font-size: 18px;
        color: #92400e;
        font-weight: 600;
      }

      .nota-valor {
        font-size: 32px;
        color: #b45309;
        font-weight: 700;
        margin-top: 5px;
      }

      .footer {
        margin-top: 50px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 40px;
        align-items: end;
      }

      .fecha-lugar {
        text-align: left;
      }

      .codigo-validacion {
        text-align: right;
      }

      .fecha-texto {
        font-size: 16px;
        color: #64748b;
        margin-bottom: 5px;
      }

      .fecha-valor {
        font-size: 18px;
        color: #334155;
        font-weight: 600;
      }

      .codigo-label {
        font-size: 12px;
        color: #64748b;
        margin-bottom: 5px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .codigo-valor {
        font-family: "Courier New", monospace;
        font-size: 14px;
        color: #16a34a;
        font-weight: bold;
        background: #f0fdf4;
        padding: 8px 12px;
        border-radius: 6px;
        display: inline-block;
      }

      .universidad-info {
        position: absolute;
        bottom: 20px;
        left: 20px;
        right: 20px;
        text-align: center;
        font-size: 12px;
        color: #64748b;
        border-top: 1px solid #e2e8f0;
        padding-top: 15px;
      }
    </style>
  </head>
  <body>
    <div class="certificado">
      <div class="contenido">
        <div class="header">
          <h1 class="titulo">CERTIFICADO</h1>
          <p class="subtitulo">DE APROBACIÓN</p>
        </div>

        <div class="cuerpo">
          <p class="texto-principal">
            Por medio del presente documento se certifica que
          </p>

          <div class="nombre-persona">{{nombre_completo}}</div>

          <p class="texto-principal">
            Con cédula de identidad N° {{cedula}}, aprobó satisfactoriamente:
          </p>

          <div class="evento-info">
            <h2 class="evento-titulo">{{nombre_evento}}</h2>
            <div class="evento-detalles">
              <div class="detalle">
                <span class="detalle-label">Tipo de Evento</span>
                <span class="detalle-valor">{{tipo_evento}}</span>
              </div>
              <div class="detalle">
                <span class="detalle-label">Duración</span>
                <span class="detalle-valor"
                  >{{duracion_horas}} horas académicas</span
                >
              </div>
              <div class="detalle">
                <span class="detalle-label">Fecha de Realización</span>
                <span class="detalle-valor">{{fecha_evento}}</span>
              </div>
            </div>
          </div>

          <div class="nota-destacada">
            <div class="nota-texto">Calificación Obtenida:</div>
            <div class="nota-valor">{{nota_final}}/10</div>
          </div>
        </div>

        <div class="footer">
          <div class="fecha-lugar">
            <p class="fecha-texto">Expedido el:</p>
            <p class="fecha-valor">{{fecha_certificado}}</p>
          </div>
          <div class="codigo-validacion">
            <p class="codigo-label">Código de Validación</p>
            <span class="codigo-valor">{{codigo_validacion}}</span>
          </div>
        </div>
      </div>

      <div class="universidad-info">
        {{nombre_universidad}} - {{nombre_facultad}}<br />
        Este certificado puede ser verificado ingresando el código de validación
        en nuestro sitio web oficial.
      </div>
    </div>
  </body>
</html>
```

### 5. Rutas del Backend

#### Agregar rutas en: `backend/src/routes/usuario.routes.js`

```javascript
const express = require("express");
const router = express.Router();
const {
  getMisCertificados,
  descargarCertificado,
} = require("../controllers/certificado.controller");
const authMiddleware = require("../middlewares/authMiddleware");

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Ruta para obtener certificados del usuario
router.get("/mis-certificados", getMisCertificados);

// Ruta para descargar un certificado específico
router.get("/certificado/descargar/:id_cer", descargarCertificado);

module.exports = router;
```

### 6. Configuración de Rutas Principales

#### Actualizar: `backend/src/app.js`

```javascript
// ...existing imports...
const usuarioRoutes = require("./routes/usuario.routes");

// ...existing middleware...

// Rutas
app.use("/api/usuario", usuarioRoutes);
// ...other routes...
```

### 7. Frontend - Configuración de Rutas

#### Actualizar: `frontend/src/routes/AppRouter.jsx`

```jsx
import MisCertificados from "../views/usuario/MisCertificados";

// Dentro del Router, agregar la ruta:
<Route path="/mis-certificados" element={<MisCertificados />} />;
```

## Testing y Validación

### 1. Testing Backend

```javascript
// Ejemplo de test para la descarga de certificados
describe("Certificados Controller", () => {
  test("Debe descargar certificado válido", async () => {
    const req = {
      params: { id_cer: "valid-cert-id" },
      user: { id_cue: "user-id" },
    };
    const res = {
      setHeader: jest.fn(),
      send: jest.fn(),
    };

    await descargarCertificado(req, res);
    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/pdf"
    );
  });
});
```

### 2. Testing Frontend

```jsx
// Ejemplo de test para el componente MisCertificados
import { render, screen } from "@testing-library/react";
import MisCertificados from "./MisCertificados";

test("Renderiza lista de certificados", () => {
  render(<MisCertificados />);
  expect(screen.getByText("Mis Certificados")).toBeInTheDocument();
});
```

## Consideraciones de Seguridad

1. **Autenticación**: Verificar que el usuario esté autenticado
2. **Autorización**: Confirmar que el certificado pertenece al usuario solicitante
3. **Validación de entrada**: Sanitizar parámetros de entrada
4. **Rate limiting**: Implementar límites de descarga para prevenir abuso
5. **Logs de auditoría**: Registrar descargas de certificados

## Optimizaciones Recomendadas

1. **Cache de PDFs**: Cachear certificados generados
2. **Compresión**: Comprimir respuestas HTTP
3. **CDN**: Usar CDN para assets estáticos
4. **Paginación**: Implementar paginación para usuarios con muchos certificados
5. **Búsqueda**: Agregar funcionalidad de búsqueda y filtrado

## Mantenimiento

1. **Monitoreo**: Implementar métricas de uso
2. **Backup**: Respaldar certificados generados
3. **Versionado**: Manejar versiones de plantillas
4. **Actualización**: Proceso para actualizar diseños sin afectar certificados existentes

## Conclusión

Esta implementación proporciona un sistema completo y robusto para la descarga de certificados en PDF. El sistema es escalable, seguro y mantiene una excelente experiencia de usuario tanto en frontend como en backend.
