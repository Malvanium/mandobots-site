import React, { useState } from "react";

const FaqBot = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm your FAQ bot. Ask me anything about this fictional renovation service.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
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
          messages: [
            {
              role: "system",
              content: `You are a friendly FAQ assistant for a fictional home renovation company. Your tone is helpful, concise, and professional. Mention fake details such as being out of town from May 18 – June 3.`,
            },
            ...newMessages.slice(-6),
          ],
          temperature: 0.6,
          max_tokens: 300,
        }),
      });

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "Error.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "API error." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">FAQ Bot</h2>
      <div className="border p-4 h-[60vh] overflow-y-auto mb-4 bg-gray-50 rounded">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-2 ${msg.role === "user" ? "text-right" : "text-left"}`}>
            <span className="inline-block bg-white px-3 py-2 border rounded">
              {msg.content}
            </span>
          </div>
        ))}
        {loading && <p className="italic">Typing…</p>}
      </div>
      <div className="flex">
        <input
          className="flex-1 border px-3 py-2 rounded-l"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask a question..."
        />
        <button
          onClick={handleSend}
          className="bg-red-600 text-white px-4 py-2 rounded-r hover:bg-red-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default FaqBot;
