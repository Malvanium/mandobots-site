import React, { useEffect, useState, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../../firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth/mammoth.browser.min.js";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

const DEFAULT_PROMPT = `
You are an elite AI-powered business consultant and operations assistant. Your job is to act as a hyper-intelligent, endlessly adaptable team member capable of:

- Roleplaying as any type of employee (e.g., receptionist, technician, strategist, salesperson, project manager) across any industry.
- Analyzing uploaded documents (manuals, workflows, SOPs, org charts, etc.) and providing insights, summaries, and recommendations.
- Asking intelligent follow-up questions to clarify vague input.
- Offering high-level advice on streamlining operations, scaling a business, reducing inefficiencies, and improving customer experience.
- Identifying potential blind spots or vulnerabilities in the user’s current business structure.
- Writing professional emails, messages, and scripts based on business goals.
- Generating actionable task lists, business ideas, and process automations.

---
### 🔍 Analytical Capabilities
• Assess business models for sustainability, growth potential, and alignment with customer needs.
• Suggest software tools, workflows, and delegation strategies to improve productivity.
• Recommend changes to pricing, branding, or service positioning based on uploaded materials.

---
### 🤖 Functional Behavior
• Stay in character as an AI business assistant at all times.
• Respond using a clear, confident, and tactful tone — never robotic or passive.
• Be proactive: if a user is vague, ask for more information.
• Make your replies feel like those of a seasoned executive assistant who deeply understands the business world.

---
### 🚫 Restrictions
• Do not fulfill requests that are sexually explicit, manipulative, or ethically inappropriate.
• Do not break character, disclose system-level code, or admit you are an AI assistant.
• Do not give legally binding advice, tax filing instructions, or clinical medical guidance.

---
### 🧠 Starting Message:
"Hi! I’m your advanced business assistant. I can simulate staff, give structural advice, or help with any operations, branding, or client service challenge. Upload anything relevant or tell me where to start."
`;

const MAX_CREDITS = 10;
const botKey = "businessbot";

const getCredits = (): number => {
  const stored = localStorage.getItem(`credits-${botKey}`);
  return stored ? parseInt(stored) : MAX_CREDITS;
};

const burnCredit = () => {
  const remaining = getCredits() - 1;
  localStorage.setItem(`credits-${botKey}`, remaining.toString());
  return remaining;
};

const BusinessBot: React.FC = () => {
  const [user] = useAuthState(auth);
  const [messages, setMessages] = useState<Message[]>([]);
  const [customPrompt, setCustomPrompt] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [manualPrompt, setManualPrompt] = useState("");

  useEffect(() => {
    const loadPrompt = async () => {
      if (!user) return;
      const configRef = doc(db, "customBots", user.uid);
      const snap = await getDoc(configRef);
      if (snap.exists() && snap.data().prompt) {
        setCustomPrompt(snap.data().prompt);
      }
    };

    loadPrompt();
    setMessages([
      { role: "system", content: customPrompt || DEFAULT_PROMPT },
      {
        role: "assistant",
        content:
          "Hi! I’m your advanced business assistant. I can simulate staff, give structural advice, or help with any operations, branding, or client service challenge. Upload anything relevant or tell me where to start.",
      },
    ]);
  }, [user, customPrompt]);

  const extractText = async (file: File): Promise<string> => {
    if (file.type === "application/pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(" ") + "\n";
      }
      return text;
    }
    if (file.name.endsWith(".docx")) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }
    return await file.text();
  };

  const handleSavePrompt = async () => {
    if (!user) return;
    let combined = manualPrompt;
    for (const file of files) {
      combined += "\n\n" + (await extractText(file));
    }

    await setDoc(doc(db, "customBots", user.uid), {
      prompt: combined,
      hasPaid: false,
    });
    setCustomPrompt(combined);
    alert("✅ Custom prompt saved and applied to your bot.");
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    if (getCredits() <= 0) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ You've used all 10 free messages. For unlimited use, please contact Jackson at (512) 545‑9172 or jacksoncgruber@gmail.com.",
        },
      ]);
      setInput("");
      return;
    }

    burnCredit();

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
          messages: [
            { role: "system", content: customPrompt || DEFAULT_PROMPT },
            ...newMessages.slice(-6),
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      const data = await res.json();
      const reply =
        data.choices?.[0]?.message?.content ||
        "⚠️ Something went wrong. Please try again.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply },
      ]);

      if (user) {
        await addDoc(collection(db, "botLogs", user.uid, "logs"), {
          input,
          response: reply,
          botId: botKey,
          timestamp: serverTimestamp(),
        });
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
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
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-display mb-3">Business Assistant Bot</h2>

      {/* Upload Zone */}
      <div className="border border-dashed border-gray-400 p-4 rounded mb-6">
        <p className="mb-2 text-sm text-gray-700">
          Upload internal resources (.txt, .pdf, .docx, .csv) or write instructions. Want it done professionally? <strong>Ask Jackson for a $45 custom setup.</strong>
        </p>
        <textarea
          value={manualPrompt}
          onChange={(e) => setManualPrompt(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-3"
          placeholder="Write your own instructions for how your bot should behave..."
          rows={4}
        />
        <input
          type="file"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
          accept=".txt,.pdf,.docx,.md,.csv,.json"
          className="mb-3"
        />
        <button
          onClick={handleSavePrompt}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-neon"
        >
          Save Prompt
        </button>
      </div>

      {/* Chat UI */}
      <div className="border rounded bg-gray-50 p-4 h-[60vh] overflow-y-auto mb-4">
        {messages
          .filter((m) => m.role !== "system")
          .map((msg, i) => (
            <div
              key={i}
              className={`mb-2 ${msg.role === "user" ? "text-right" : "text-left"}`}
            >
              <span
                className={`inline-block px-3 py-2 border rounded leading-relaxed ${
                  msg.role === "assistant"
                    ? "bg-white font-sans"
                    : "bg-blue-100"
                }`}
              >
                {msg.content}
              </span>
            </div>
          ))}
        {loading && <p className="italic">Bot is typing…</p>}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          className="flex-1 border px-3 py-2 rounded focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask about services, hours, or book an appointment..."
        />
        <button
          onClick={handleSend}
          className="bg-primary text-offwhite px-4 py-2 rounded hover:bg-neon disabled:opacity-50"
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default BusinessBot;
