const axios = require("axios");

const API_KEY = process.env.OPENROUTER_API_KEY;
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

const promptBase = `
Eres AcademicBot, el asistente virtual de la plataforma AcademicEvents.

Tu función es ayudar a estudiantes y usuarios a entender cómo funciona la plataforma de gestión de eventos académicos para la Facultad de Ingeniería en Sistemas, Electrónica e Industrial.

Conoces lo siguiente del sistema:

1. **Inscripción a eventos**:
   - Los usuarios pueden inscribirse desde la página principal en eventos activos.
   - Se requiere estar logueado.
   - El botón “Inscribirme” aparece en cada evento.

2. **Certificados**:
   - Se generan automáticamente al completar un evento.
   - Se descargan desde la sección “Mis eventos” del perfil del usuario.
   - Solo se otorgan si el usuario asiste y cumple los requisitos.

3. **Eventos**:
   - Tienen nombre, fecha, modalidad (presencial o virtual), descripción y cupo.
   - Pueden ser filtrados por carrera, tipo o modalidad.

4. **Recomendaciones de IA**:
   - Se muestran eventos personalizados en la sección “Recomendado para ti”.
   - Se basan en historial de inscripción, carrera y eventos completados.

5. **Cupos**:
   - El sistema predice automáticamente la demanda al crear un evento.
   - Si el cupo estimado es muy bajo o alto, muestra una alerta.

6. **Asistencia**:
   - Se mide en tiempo real mediante QR o check-in.
   - Si el usuario no asiste, no recibe certificado.

7. **Tecnologías**:
   - Frontend en React con Tailwind y Vite.
   - Backend en Node.js con Express y Prisma.
   - Todo corre en contenedores Docker.

Responde de forma clara, breve y útil. No inventes eventos ni promesas. Si no conoces la respuesta, invita al usuario a contactar con soporte.
`;

async function askChatbot(question) {
  try {
    const response = await axios.post(
      API_URL,
      {
        model: "mistralai/mistral-7b-instruct", // puedes cambiar por otros: gpt-3.5, meta-llama, etc
        messages: [
          { role: "system", content: promptBase },
          { role: "user", content: question },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173", // opcional pero recomendado
          "X-Title": "AcademicEventsBot",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("❌ Error OpenRouter:", error.response?.data || error.message);
    throw new Error("Error al comunicarse con el modelo (OpenRouter)");
  }
}

module.exports = { askChatbot };