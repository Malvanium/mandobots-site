// src/components/bots/AppointmentBot.tsx
import React, { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AppointmentBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm here to help you book an appointment. Just let me know what you need.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [formStage, setFormStage] = useState<
    "idle" | "name" | "contact" | "time" | "done"
  >("idle");
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    time: "",
  });

  // ← UPDATED: pull real URL from your .env
  const FORMSPREE_ENDPOINT = process.env.REACT_APP_FORM_ENDPOINT!;

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      if (formStage === "name") {
        setFormData((prev) => ({ ...prev, name: input }));
        setFormStage("contact");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Got it. What's your phone number or email?",
          },
        ]);
      } else if (formStage === "contact") {
        setFormData((prev) => ({ ...prev, contact: input }));
        setFormStage("time");
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "And what time works best for you?" },
        ]);
      } else if (formStage === "time") {
        const fullData = { ...formData, time: input };

        // ← posts to your real Formspree endpoint now
        const res = await fetch(FORMSPREE_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: fullData.name,
            contact: fullData.contact,
            time: fullData.time,
            message: `Appointment request from ${fullData.name} at ${fullData.time}. Contact: ${fullData.contact}`,
          }),
        });

        if (!res.ok) throw new Error(`Formspree error ${res.status}`);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Thanks! Your appointment request has been sent.",
          },
        ]);
        setFormStage("done");
        setFormData({ name: "", contact: "", time: "" });
      } else {
        const normalized = input.toLowerCase();
        if (
          normalized.includes("book") ||
          normalized.includes("appointment")
        ) {
          setFormStage("name");
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Great! What's your name?" },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "I'm here to help with appointments. Just say 'book' to begin.",
            },
          ]);
        }
      }
    } catch (err) {
      console.error("Appointment send failed:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong while sending the request.",
        },
      ]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white text-blue-900">
      <header className="p-4 border-b border-blue-400">
        <h1 className="text-2xl font-bold">Appointment Booking Bot</h1>
      </header>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`text-${
                msg.role === "user" ? "right" : "left"
              }`}
            >
              <span className="inline-block bg-blue-100 p-2 rounded">
                {msg.content}
              </span>
            </div>
          ))}
          {loading && <p className="italic text-sm">Bot is typing...</p>}
        </div>
      </div>

      <footer className="p-4 border-t border-blue-400 flex">
        <input
          className="flex-1 border border-blue-300 px-3 py-2 rounded-l-md"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type here..."
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-r-md"
          onClick={handleSend}
        >
          Send
        </button>
      </footer>
    </div>
  );
};

export default AppointmentBot;


