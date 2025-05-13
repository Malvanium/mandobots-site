import React, { useState } from "react";
import PrivateRoute from "../PrivateRoute";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const MAX_CREDITS = 10;
const botKey = "samplefaq";

const getCredits = (): number => {
  const stored = localStorage.getItem(`credits-${botKey}`);
  return stored ? parseInt(stored) : MAX_CREDITS;
};

const burnCredit = () => {
  const remaining = getCredits() - 1;
  localStorage.setItem(`credits-${botKey}`, remaining.toString());
  return remaining;
};

const SampleFaqBotContent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I’m a demo FAQ Bot built to show what your customers would experience on your own site. Ask me about hours, services, pricing, or policies to see how I’d respond!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const generateResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes("hours")) {
      return "Our demo business is open Monday through Friday, 9am to 6pm!";
    }

    if (
      input.includes("price") ||
      input.includes("cost") ||
      input.includes("how much")
    ) {
      return "Great question! Pricing starts at $99/month for basic service packages. This is a placeholder response to show how your actual pricing could be delivered.";
    }

    if (
      input.includes("email") ||
      input.includes("contact") ||
      input.includes("phone")
    ) {
      return "You can reach our fictional business at contact@example.com or (555) 123‑4567. (This would show your real info on a live bot.)";
    }

    if (
      input.includes("return policy") ||
      input.includes("refund") ||
      input.includes("warranty")
    ) {
      return "Our demo policy is: returns are accepted within 30 days of purchase. This could be customized to match your business.";
    }

    if (
      input.includes("hi") ||
      input.includes("hello") ||
      input.includes("how are you") ||
      input.includes("who are you")
    ) {
      return "Hey there! I'm a sample bot from MandoBots. Try asking about hours, pricing, or returns so you can see how a chatbot like this could assist your customers.";
    }

    return `That’s a good question, but I’m just a sample bot trained only on fictional company info.
If you'd like to explore how a bot like this could handle your real FAQs, feel free to call (512) 545‑9172 or email jacksoncgruber@gmail.com. I can also help summarize what you'd want your own bot to answer!`;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    // 🔒 Rate-limit check
    if (getCredits() <= 0) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ You've used all 10 free messages for this demo bot.\n\nTo try this for your business, contact Jackson at **(512) 545‑9172** or **jacksoncgruber@gmail.com**.",
        },
      ]);
      setInput("");
      return;
    }

    burnCredit(); // ✅ Renamed to fix ESLint hook rule

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    setTimeout(() => {
      const reply: Message = {
        role: "assistant",
        content: generateResponse(input),
      };
      setMessages((prev) => [...prev, reply]);
      setLoading(false);
      setInput("");
    }, 500);
  };

  return (
    <div className="h-screen flex flex-col bg-white text-black">
      <header className="p-4 border-b border-gray-300 text-center">
        <h1 className="text-2xl font-bold">Sample FAQ Bot Demo</h1>
        <p className="text-sm text-gray-600">
          Ask me questions about a fictional company’s services, hours, pricing, or policies.
        </p>
      </header>

      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        {messages.map((msg, i) => (
          <div key={i} className={`text-${msg.role === "user" ? "right" : "left"}`}>
            <span
              className={`inline-block p-2 rounded-lg ${
                msg.role === "user"
                  ? "bg-red-100 text-black"
                  : "bg-gray-100 text-black"
              }`}
            >
              {msg.content}
            </span>
          </div>
        ))}
        {loading && <p className="italic text-sm">Typing…</p>}
      </div>

      <footer className="p-4 border-t border-gray-300 flex">
        <input
          className="flex-1 border border-gray-400 px-3 py-2 rounded-l-md"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask about hours, pricing, policies..."
        />
        <button
          className="bg-red-600 text-white px-4 py-2 rounded-r-md"
          onClick={handleSend}
        >
          Send
        </button>
      </footer>
    </div>
  );
};

const SampleFaqBot: React.FC = () => (
  <PrivateRoute>
    <SampleFaqBotContent />
  </PrivateRoute>
);

export default SampleFaqBot;
