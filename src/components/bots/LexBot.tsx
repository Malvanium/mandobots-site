import React, { useState } from "react";
import PrivateRoute from "../PrivateRoute";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `
You are **LexBot**, a trusted internal assistant for a private law firm. Your job is to help legal staff quickly locate case documents, policy templates, legal definitions, court deadlines, and internal procedures.

---
### ⚖️ What You Know
- Folder structure of the firm's knowledge base (describe if available).
- Document naming conventions and how to locate summaries, contracts, filings, and legal memos.
- Common internal FAQs, e.g. how to draft a retainer agreement, file motions, etc.
- Standard workflows (e.g. client intake, court scheduling, deposition prep).
- You are NOT authorized to give legal advice to clients. Only support internal staff.
- Never reveal confidential data or infer beyond the docs you were trained on.

---
### 🎯 Use Strategy
- Always ask what type of resource the user is looking for (template, precedent, deadline, etc.).
- Offer filename or folder path if known.
- If you can’t locate a match, offer to escalate to a human paralegal.

---
### 🚫 Constraints
- Do not speculate or fabricate facts.
- If uncertain, say: “Let me flag this for someone on the legal team.”
- Do not assist with external (client-facing) legal requests.
`;

const MAX_CREDITS = 10;
const botKey = "lex";

const getCredits = (): number => {
  const stored = localStorage.getItem(`credits-${botKey}`);
  return stored ? parseInt(stored) : MAX_CREDITS;
};

const burnCredit = () => {
  const remaining = getCredits() - 1;
  localStorage.setItem(`credits-${botKey}`, remaining.toString());
  return remaining;
};

const LexBotContent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "assistant",
      content:
        "Hello. I’m LexBot, here to support your internal legal workflow. What are you looking for?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    // 🔒 Rate limit check
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

    burnCredit(); // ✅ Renamed to comply with React hook naming rules

    const newMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(process.env.REACT_APP_CHAT_ENDPOINT || "", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: newMessages.slice(-6),
          temperature: 0.5,
          max_tokens: 500,
        }),
      });

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "⚠️ No response.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([
        ...newMessages,
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
      <h2 className="text-2xl font-display mb-3">LexBot (Legal Assistant)</h2>

      <div className="border rounded bg-gray-50 p-4 h-[60vh] overflow-y-auto mb-4">
        {messages
          .filter((m) => m.role !== "system")
          .map((msg, i) => (
            <div
              key={i}
              className={`mb-2 ${msg.role === "user" ? "text-right" : "text-left"}`}
            >
              <span
                className={
                  msg.role === "assistant"
                    ? "inline-block bg-white px-3 py-2 border rounded font-sans leading-relaxed"
                    : "inline-block bg-blue-100 px-3 py-2 border rounded"
                }
              >
                {msg.content}
              </span>
            </div>
          ))}
        {loading && <p className="italic">LexBot is typing…</p>}
      </div>

      <div className="flex">
        <input
          className="flex-1 border px-3 py-2 rounded-l focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="How can I assist you internally?"
        />
        <button
          onClick={handleSend}
          className="bg-primary text-offwhite px-4 py-2 rounded-r hover:bg-neon disabled:opacity-50"
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
};

// ✅ Wrap in login check
const LexBot: React.FC = () => (
  <PrivateRoute>
    <LexBotContent />
  </PrivateRoute>
);

export default LexBot;
