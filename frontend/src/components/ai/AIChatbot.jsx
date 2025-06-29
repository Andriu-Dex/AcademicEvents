import React, { useState } from "react";
import "../styles/AIChatbot.css";
import robotIcon from "../../assets/robot-bot.png";
import { useEffect } from "react";

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (open && messages.length === 0) {
      const welcome = {
        role: "assistant",
        content:
          "¡Hola! Soy AcademicBot. ¿En qué puedo ayudarte hoy con los eventos académicos?",
      };
      setMessages([welcome]);
    }
  }, [open, messages.length]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput(""); // limpiar campo de entrada

    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/ai/chatbot",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: input }), // <-- ESTE CAMPO debe llamarse "question"
        }
      );

      const data = await response.json();

      const botMessage = { role: "assistant", content: data.answer }; // <-- RESPUESTA esperada del backend
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Ocurrió un error al procesar tu pregunta.",
        },
      ]);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <div className={`chatbot-container ${open ? "open" : ""}`}>
      <button
        className="chatbot-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Chatbot"
      >
        <img src={robotIcon} alt="Asistente Virtual" className="chatbot-img" />
      </button>

      {open && (
        <div className="chatbot-box">
          <div className="chatbot-actions">
            <button
              className="chatbot-close"
              onClick={() => setOpen(false)}
              title="Cerrar chatbot"
            >
              ❌
            </button>

            <button
              className="chatbot-clear-icon"
              onClick={clearMessages}
              title="Limpiar chat"
            >
              🧹
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`msg ${msg.role}`}>
                {msg.content}
              </div>
            ))}
          </div>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder="Escribe tu pregunta..."
          />
          <button onClick={sendMessage}>Enviar</button>
        </div>
      )}
    </div>
  );
}
