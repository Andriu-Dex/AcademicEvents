const { askChatbot } = require("../../services/ai/chatbotService.js");

async function handleChatRequest(req, res) {
  const { question } = req.body;

  try {
    const answer = await askChatbot(question);
    res.json({ answer });
  } catch (err) {
    console.error("Error chatbot:", err);
    res.status(500).json({ error: "Ocurrió un error al procesar la pregunta" });
  }
}

module.exports = { handleChatRequest };
