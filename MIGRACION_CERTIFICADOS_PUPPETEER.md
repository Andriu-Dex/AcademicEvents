# 🎨 Migración de Certificados: PDFKit → Puppeteer + HTML

> **Fecha de migración**: 21 de junio de 2025  
> **Estado**: ✅ Completado  
> **Sistema anterior**: PDFKit (manual)  
> **Sistema actual**: Puppeteer + HTML/CSS

---

## 📋 **Resumen de Cambios**

Se migró completamente el sistema de generación de certificados de **PDFKit** (generación manual programática) a **Puppeteer + HTML/CSS** para obtener mayor flexibilidad de diseño, facilidad de mantenimiento y resultados más profesionales.

---

## 🔄 **Archivos Modificados**

### 1. **`backend/src/utils/certificado.utils.js`** - ✅ REEMPLAZADO COMPLETAMENTE

- **Antes**: Generación manual con PDFKit
- **Ahora**: Template HTML + CSS + Puppeteer
- **Backup**: `certificado.utils.txt` (contiene el código original)

### 2. **`backend/src/controllers/certificado.controller.js`** - ✅ ACTUALIZADO

- **Cambio principal**: `generarCertificadoPDF()` ahora es `async`
- **Nuevo**: Función `previsualizarCertificado()` agregada
- **Manejo**: Buffer directo en lugar de streams

### 3. **`backend/src/routes/certificado.routes.js`** - ✅ ACTUALIZADO

- **Nuevo endpoint**: `GET /api/certificados/preview/:id`
- **Importación**: Agregada función `previsualizarCertificado`

---

## 🎯 **Funcionalidades Nuevas**

### **🔍 Previsualización HTML**

Nueva función para ver certificados como HTML antes de generar PDF.

#### **Endpoint de Previsualización:**

```
GET /api/certificados/preview/:inscripcion_id
```

#### **Headers requeridos:**

```bash
Authorization: Bearer tu_token_jwt
```

#### **Respuesta:**

- **Content-Type**: `text/html; charset=utf-8`
- **Contenido**: HTML completo del certificado (se ve exactamente como el PDF final)

---

## 🚀 **Cómo Usar la Previsualización**

### **🌐 Desde el Navegador**

**Crear endpoint temporal SIN autenticación**

```javascript
// En certificado.routes.js - SOLO PARA DESARROLLO
router.get("/certificados/preview-dev/:id", previsualizarCertificado);

// Luego colocar en el navegador:
("http://localhost:3000/api/certificados/preview-dev/123");
//Reempplazar el "123" por un ID real de una inscripción válida
```

### **🔧 Para Desarrollo**

1. **Hacer cambios CSS** en `certificado.utils.js`
2. **Refrescar** `/preview/:id` en navegador
3. **Ver cambios** instantáneamente
4. **Repetir** hasta que esté perfecto
5. **Probar PDF** con `/certificados/:id`

---

## 🛡️ **Seguridad**

### **Endpoint de Previsualización**

- ✅ **Requiere autenticación** (token JWT válido)
- ✅ **Verifica propiedad** (solo puedes ver tus certificados)
- ✅ **Valida requisitos** (asistencia, notas, estado aprobado)
- ✅ **Mismo nivel de seguridad** que el endpoint de descarga

---

## 📊 **Beneficios de la Migración**

| Aspecto                  | PDFKit (Anterior) | Puppeteer + HTML (Actual) |
| ------------------------ | ----------------- | ------------------------- |
| **Facilidad de diseño**  | ⭐⭐              | ⭐⭐⭐⭐⭐                |
| **Flexibilidad visual**  | ⭐⭐⭐            | ⭐⭐⭐⭐⭐                |
| **Mantenimiento**        | ⭐⭐              | ⭐⭐⭐⭐⭐                |
| **Previsualización**     | ❌                | ✅                        |
| **Rendimiento**          | ⭐⭐⭐⭐⭐        | ⭐⭐⭐⭐                  |
| **Profesionalidad**      | ⭐⭐⭐            | ⭐⭐⭐⭐⭐                |
| **Curva de aprendizaje** | ⭐⭐              | ⭐⭐⭐⭐⭐                |

---

## 🗑️ **Limpieza Post-Migración**

### **🔧 Para Desarrollo (Mantener temporalmente)**

```bash
# MANTENER estos archivos mientras desarrollas:
backend/src/utils/certificado.utils.txt  # Backup del código original
```

### **🏭 Para Producción (Eliminar cuando confirmes que funciona)**

#### **Archivos a eliminar:**

```bash
# Backup del sistema anterior (una vez confirmado que el nuevo funciona)
rm backend/src/utils/certificado.utils.txt
```

#### **Función de previsualización (opcional):**

Si ya no necesitas la previsualización en producción:

1. **En `certificado.controller.js`**:

```javascript
// ELIMINAR esta función completa:
const previsualizarCertificado = async (req, res) => { ... }

// ELIMINAR del module.exports:
module.exports = {
  generarCertificado,
  enviarCertificadoPorCorreo,
  validarCertificado,
  // previsualizarCertificado, // ← ELIMINAR esta línea
};

// ELIMINAR de las importaciones:
const {
  generarCertificadoPDF,
  cumpleRequisitosCertificado,
  determinarTipoCertificado,
  generarCodigoValidacion,
  // generarHTMLCertificado, // ← ELIMINAR esta línea
} = require("../utils/certificado.utils");
```

2. **En `certificado.routes.js`**:

```javascript
// ELIMINAR del import:
const {
  generarCertificado,
  enviarCertificadoPorCorreo,
  validarCertificado,
  // previsualizarCertificado, // ← ELIMINAR esta línea
} = require("../controllers/certificado.controller");

// ELIMINAR esta ruta completa:
// router.get("/certificados/preview/:id", verificarToken, verificarPropietario, previsualizarCertificado);
```

3. **En `certificado.utils.js`**:

```javascript
// ELIMINAR del module.exports:
module.exports = {
  generarCertificadoPDF,
  cumpleRequisitosCertificado,
  determinarTipoCertificado,
  generarCodigoValidacion,
  // generarHTMLCertificado, // ← ELIMINAR esta línea si no se usa
};
```

---

## 🎨 **Características del Nuevo Diseño**

### **Tipografías Profesionales**

- **Great Vibes**: Para nombres (cursiva elegante)
- **Playfair Display**: Para títulos (serif clásica)
- **Inter**: Para textos (sans-serif moderna)

### **Elementos Visuales**

- **Decoraciones geométricas** en esquinas
- **Gradientes sutiles** de fondo
- **Bordes elegantes** con sombras
- **Sello SVG** generado dinámicamente
- **Líneas decorativas** laterales

### **Colores Institucionales**

- **Primario**: `#8a1538` (Rojo institucional)
- **Secundario**: `#e0b747` (Dorado)
- **Texto**: `#2c3e50` (Gris oscuro)
- **Sutiles**: `#7f8c8d` (Gris medio)

---

## � **Fixes Post-Migración**

### **📅 21 de junio de 2025 - Fix Puppeteer waitForTimeout**

**❌ Problema detectado:**

```
Error generando certificado PDF: TypeError: page.waitForTimeout is not a function
```

**✅ Solución aplicada:**

- **Archivo afectado**: `certificado.utils.js` línea 405
- **Cambio**: `page.waitForTimeout(2000)` → `page.waitForDelay(2000)`
- **Causa**: Puppeteer v24.10.0 deprecó `waitForTimeout` en favor de `waitForDelay`
- **Estado**: ✅ Resuelto

---

## �🚨 **Notas Importantes**

### **⚠️ Cambios de API**

- **`generarCertificadoPDF()` ahora es `async`** - Requiere `await`
- **Retorna Buffer** en lugar de stream de PDFKit
- **Misma interfaz pública** - Los endpoints no cambiaron

### **📦 Dependencias**

- **Puppeteer ya está instalado** en `package.json`
- **No requiere instalaciones adicionales**

### **🔄 Compatibilidad**

- **Certificados existentes** siguen funcionando
- **Base de datos** no requiere cambios
- **Frontend** no requiere modificaciones

---

## 🧪 **Testing Recomendado**

### **Antes de eliminar archivos de desarrollo:**

```bash
# 1. Probar generación de PDF
GET /api/certificados/:id

# 2. Probar previsualización HTML
GET /api/certificados/preview/:id

# 3. Probar envío por correo
POST /api/certificados/enviar/:id

# 4. Probar validación
GET /api/certificados/validar/:codigo
```

### **Verificar que funciona correctamente:**

- ✅ PDFs se generan correctamente
- ✅ Diseño se ve profesional
- ✅ Datos se muestran completos
- ✅ Emails se envían sin problemas
- ✅ Validación funciona

---

## 📞 **Soporte**

Si encuentras algún problema con la migración:

1. **Verifica** que Puppeteer esté instalado: `npm list puppeteer`
2. **Revisa** los logs del servidor para errores específicos
3. **Prueba** la previsualización HTML primero antes del PDF
4. **Restaura** desde `certificado.utils.txt` si es necesario

---

**✅ Migración completada exitosamente**  
**🎉 Certificados ahora son más profesionales y fáciles de mantener**
