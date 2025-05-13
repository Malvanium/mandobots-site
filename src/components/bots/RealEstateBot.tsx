import React, { useState } from "react";
import PrivateRoute from "../PrivateRoute";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT: Message = {
  role: "system",
  content: `You are “Riley,” a friendly, knowledgeable real-estate assistant for Acme Realty.
• Purpose: answer buyer/seller questions about listings, appointments, basic mortgage terms, neighborhood info, and Acme services.
• Hard limits:
  – NO legal, tax, or financial advice beyond definitions; refer users to a licensed professional.
  – If the question is outside scope, politely refuse with: “I’m only set up to chat about real-estate topics for Acme Realty.”
• Answer clearly in ≤ 3 short paragraphs, polite and upbeat.`,
};

const MAX_CREDITS = 10;
const botKey = "realestate";

const getCredits = (): number => {
  const stored = localStorage.getItem(`credits-${botKey}`);
  return stored ? parseInt(stored) : MAX_CREDITS;
};

const burnCredit = () => {
  const remaining = getCredits() - 1;
  localStorage.setItem(`credits-${botKey}`, remaining.toString());
  return remaining;
};

const RealEstateBotContent: React.FC = () => {
  const CHAT_ENDPOINT = process.env.REACT_APP_CHAT_ENDPOINT || "";
  const OPENAI_KEY = process.env.REACT_APP_OPENAI_API_KEY || "";

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I’m Riley. Ask me anything about buying or selling a home.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (getCredits() <= 0) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ You've used all 10 free messages for this demo bot.\n\nTo set up a bot like this for your real estate site, contact Jackson at **(512) 545‑9172** or **jacksoncgruber@gmail.com**.",
        },
      ]);
      setInput("");
      return;
    }

    burnCredit(); // ✅ renamed to comply with ESLint rules

    const newMsgs: Message[] = [...messages, { role: "user", content: input }];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [SYSTEM_PROMPT, ...newMsgs],
          temperature: 0.7,
          max_tokens: 400,
        }),
      });

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "Error.";
      setMessages([...newMsgs, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error("RealEstateBot error:", err);
      setMessages([
        ...newMsgs,
        {
          role: "assistant",
          content: "⚠️ API error. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">Real Estate Bot</h2>
      <div className="border p-4 h-[60vh] overflow-y-auto mb-4 bg-gray-50 rounded">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-2 ${m.role === "user" ? "text-right" : "text-left"}`}
          >
            <span className={m.role === "assistant" ? "font-bold" : ""}>
              {m.content}
            </span>
          </div>
        ))}
        {loading && <p className="italic">Riley is typing…</p>}
      </div>
      <div className="flex">
        <input
          className="flex-grow border rounded-l p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button
          className="bg-primary text-white px-4 rounded-r"
          onClick={handleSend}
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
};

const RealEstateBot: React.FC = () => (
  <PrivateRoute>
    <RealEstateBotContent />
  </PrivateRoute>
);

export default RealEstateBot;
