import React, { useState } from "react";
import "../styles/AIChatbot.css";
import robotIcon from "../../assets/robot-bot.png";

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput(""); // ✅ Limpiar inmediatamente después de agregar el mensaje del usuario

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const botMessage = { role: "assistant", content: data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
    }
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
            placeholder="Escribe tu pregunta..."
          />
          <button onClick={sendMessage}>Enviar</button>
        </div>
      )}
    </div>
  );
}
