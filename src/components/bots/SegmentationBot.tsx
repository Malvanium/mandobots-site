import React, { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SegmentationBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "👋 Hi! I'm your Customer Segmentation Assistant.\n\nUpload a CSV file with customer data and I’ll help you identify real clusters using k-means analysis.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = "https://customer-segmentation-api-mxrk.onrender.com/cluster";

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: `📄 Uploaded file: ${uploaded.name}` },
      { role: "assistant", content: "🧠 Analyzing your data using k-means clustering..." },
    ]);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", uploaded);
    formData.append("n_clusters", "3");

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.error) throw new Error(data.error);

      const readable = Object.entries(data.segments)
        .map(([segment, values]) => {
          const traits = Object.entries(values as Record<string, number>)
            .map(([key, val]) => `${key}: ${val}`)
            .join(", ");
          return `🔹 Segment ${segment} → ${traits}`;
        })
        .join("\n\n");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `✅ Here's what I found in your data:\n\n${readable}\n\nIf you'd like a full report or want to integrate this on your own site, call 512‑545‑9172 or email jacksoncgruber@gmail.com.`,
        },
      ]);
    } catch (err: any) {
      console.error("Clustering failed:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ Hmm… something went wrong while processing the data.\n\n${err.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white text-black">
      <header className="p-4 border-b border-gray-300">
        <h1 className="text-2xl font-bold">Customer Segmentation Assistant</h1>
      </header>

      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        {messages.map((msg, i) => (
          <div key={i} className={`text-${msg.role === "user" ? "right" : "left"}`}>
            <span className="inline-block bg-gray-100 p-2 rounded whitespace-pre-wrap">
              {msg.content}
            </span>
          </div>
        ))}
        {loading && <p className="italic text-sm">🧮 Crunching numbers...</p>}
      </div>

      <footer className="p-4 border-t border-gray-300 flex flex-col space-y-2">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="border border-gray-400 rounded px-3 py-2"
        />
      </footer>
    </div>
  );
};

export default SegmentationBot;
