const fs = require("fs");

// Leer el archivo
const filePath = "src/controllers/inscripcion.controller.js";
let content = fs.readFileSync(filePath, "utf8");

// Reemplazar id_ins_car_mot por id_ins_per en toda la sección de reinscripción
content = content.replace(
  /const cartaExistente = await prisma\.carta_motivacion\.findFirst\({\s+where: { id_ins_car_mot: yaInscrito\.id_ins },/g,
  "const cartaExistente = await prisma.carta_motivacion.findFirst({\n            where: { id_ins_per: yaInscrito.id_ins },"
);

content = content.replace(
  /id_ins_car_mot: yaInscrito\.id_ins,/g,
  "id_ins_per: yaInscrito.id_ins,"
);

// Guardar los cambios en el archivo
fs.writeFileSync(filePath, content, "utf8");

console.log("✅ Archivo actualizado correctamente");
