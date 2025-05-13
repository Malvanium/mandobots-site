import React, { useState } from "react";
import PrivateRoute from "../PrivateRoute";

type Message = { role: "user" | "assistant"; content: string };

const MAX_CREDITS = 10;
const botKey = "appointment";

const getCredits = (): number => {
  const stored = localStorage.getItem(`credits-${botKey}`);
  return stored ? parseInt(stored) : MAX_CREDITS;
};

const burnCredit = () => {
  const remaining = getCredits() - 1;
  localStorage.setItem(`credits-${botKey}`, remaining.toString());
  return remaining;
};

const AppointmentBotContent: React.FC = () => {
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
  const [formData, setFormData] = useState({ name: "", contact: "", time: "" });

  const FORMSPREE_ENDPOINT =
    process.env.REACT_APP_FORMSPREE_ENDPOINT || "https://formspree.io/f/xnndvdar";

  const handleSend = async () => {
    if (!input.trim()) return;

    // 🔒 Rate-limit check
    if (getCredits() <= 0) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ You've used all 10 free messages for this bot.\n\nTo continue, please contact Jackson at **(512) 545‑9172** or **jacksoncgruber@gmail.com** to restore credits or request a custom plan.",
        },
      ]);
      setInput("");
      return;
    }

    burnCredit(); // ✅ Renamed to avoid ESLint hook rule violation

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      if (formStage === "name") {
        setFormData((prev) => ({ ...prev, name: input }));
        setFormStage("contact");
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Got it. What's your phone number or email?" },
        ]);
      } else if (formStage === "contact") {
        setFormData((prev) => ({ ...prev, contact: input }));
        setFormStage("time");
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "And what time works best for you?" },
        ]);
      } else if (formStage === "time") {
        const full = { ...formData, time: input };
        const res = await fetch(FORMSPREE_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: full.name,
            contact: full.contact,
            time: full.time,
            message: `Appointment request from ${full.name} at ${full.time}. Contact: ${full.contact}`,
          }),
        });
        if (!res.ok) throw new Error(`Formspree error ${res.status}`);

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Thanks! Your appointment request has been sent." },
        ]);
        setFormStage("done");
        setFormData({ name: "", contact: "", time: "" });
      } else {
        const lower = input.toLowerCase();
        if (lower.includes("book") || lower.includes("appointment")) {
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
        { role: "assistant", content: "Something went wrong while sending the request." },
      ]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white text-gray-900">
      <header className="p-4 border-b">
        <h1 className="text-2xl font-bold">Appointment Booking Bot</h1>
      </header>

      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={msg.role === "user" ? "text-right" : "text-left"}
          >
            <span
              className={
                msg.role === "assistant"
                  ? "inline-block bg-blue-100 p-2 rounded font-sans leading-relaxed"
                  : "inline-block bg-white p-2 rounded"
              }
            >
              {msg.content}
            </span>
          </div>
        ))}
        {loading && <p className="italic">Bot is typing...</p>}
      </div>

      <footer className="p-4 border-t flex">
        <input
          className="flex-1 border px-3 py-2 rounded-l focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type here..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          Send
        </button>
      </footer>
    </div>
  );
};

// ✅ Wrap with auth gate
const AppointmentBot: React.FC = () => (
  <PrivateRoute>
    <AppointmentBotContent />
  </PrivateRoute>
);

export default AppointmentBot;
