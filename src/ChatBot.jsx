import React, { useState } from "react";

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm Mando's virtual assistant. Ask me anything about his services.",
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
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
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
              content: `
You are the FAQ chatbot for MandoBots.com, a retro‑themed contractor service.  Answer clearly and professionally based on this info:

• Business: MandoBots.com  
• Phone: (512) 867 5309  
• Out of town May 18 – June 3, 2025 (responses may be delayed)  
• Services: Home renovations, kitchen/bathroom remodeling, painting, drywall, roofing, decks, flooring, repairs.  
• Estimates: Free in-person or virtual estimates.  
• Area: Based in [Your City], serves within 25 miles.  
• Licensed & insured.  
• Booking: Call during business hours or use the website form.  
• Hours: Mon–Fri, 8 am–6 pm.  
• Payment: Cash, credit card, Venmo.  
• Timelines: Small jobs = 1–2 days; full remodels = 2–6 weeks.  
• Cancellation: 48‑hour notice required.  
Keep tone friendly, concise, and on‑brand.
              `,
            },
            ...newMessages.slice(-6),
          ],
          temperature: 0.6,
          max_tokens: 300,
        }),
      });

      const data = await res.json();
      const reply =
        data.choices?.[0]?.message?.content || "Something went wrong.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Error contacting OpenAI." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // extract last 5 user questions
  const recentQueries = messages
    .filter((m) => m.role === "user")
    .slice(-5)
    .reverse();

  return (
    <div className="h-screen flex bg-white text-red-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-red-500 bg-red-50 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Recent Queries</h2>
        {recentQueries.length ? (
          recentQueries.map((q, i) => (
            <div
              key={i}
              className="bg-white border border-red-300 rounded p-2 mb-2 text-sm cursor-pointer hover:bg-red-100"
            >
              {q.content.length > 30
                ? q.content.slice(0, 30) + "..."
                : q.content}
            </div>
          ))
        ) : (
          <p className="text-sm italic">No queries yet.</p>
        )}
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-red-500">
          <h1 className="text-2xl font-extrabold">MandoBots.com</h1>
          <span className="text-sm text-red-600">
            Out of town May 18 – June 3, 2025
          </span>
        </header>

        {/* Chat Window */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="border rounded-lg p-4 h-full bg-white shadow">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-2 ${
                  msg.role === "user" ? "text-right" : "text-left"
                }`}
              >
                <span className="inline-block bg-red-100 px-3 py-2 rounded">
                  {msg.content}
                </span>
              </div>
            ))}
            {loading && <p className="italic text-sm">Mando is typing...</p>}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-red-500 flex">
          <input
            className="flex-1 border border-red-300 px-3 py-2 rounded-l-md focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask a question..."
          />
          <button
            className="bg-red-600 text-white px-4 py-2 rounded-r-md hover:bg-red-700"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </main>
    </div>
  );
};

export default ChatBot;
