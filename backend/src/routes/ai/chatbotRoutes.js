const express = require("express");
const router = express.Router();
const { handleChatRequest } = require("../../controllers/ai/chatbotController.js");

router.post("/chatbot", handleChatRequest);

module.exports = router;
