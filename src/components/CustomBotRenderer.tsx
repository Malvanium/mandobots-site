import React, { useEffect, useState, ChangeEvent } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  Timestamp,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  deleteDoc,
} from "firebase/firestore";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import { ChatLogSidebar } from "./ChatLogSidebar";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface BotConfig {
  name: string;
  prompt: string;
  usageLimit: number;
  embedUrl?: string;
}

export const CustomBotRenderer: React.FC<{ botId: string }> = ({ botId }) => {
  const [user] = useAuthState(auth);
  const [config, setConfig] = useState<BotConfig | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<boolean>(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!user) return;

    const loadConfig = async () => {
      try {
        const ref = doc(db, "bots", user.uid, "bots", botId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as BotConfig;
          setConfig(data);
          setMessages([
            {
              role: "assistant",
              content: `Hi! I'm ${data.name}. Ask me anything about your business.`,
            },
          ]);
        }
      } catch (err: any) {
        if (err.code === "permission-denied") {
          setPermissionError(true);
        }
      }
    };

    const checkUsage = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const usageRef = doc(db, "usageLogs", user.uid, botId, today);
        const snap = await getDoc(usageRef);
        if (snap.exists()) {
          const count = snap.data().count || 0;
          if (count >= (config?.usageLimit || 50)) setLimitReached(true);
        }
      } catch (err) {
        console.error("Usage check error:", err);
      }
    };

    loadConfig();
    checkUsage();
  }, [user, botId]);

  const updateUsage = async () => {
    const today = new Date().toISOString().split("T")[0];
    const usageRef = doc(db, "usageLogs", user!.uid, botId, today);
    const snap = await getDoc(usageRef);
    const count = snap.exists() ? snap.data().count || 0 : 0;
    await setDoc(usageRef, { count: count + 1, lastUsed: Timestamp.now() });
    if (count + 1 >= (config?.usageLimit || 50)) setLimitReached(true);
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") {
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = async () => {
          const typedArray = new Uint8Array(reader.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
          let fullText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map((item: any) => item.str);
            fullText += strings.join(" ") + "\n";
          }
          resolve(fullText);
        };
        reader.readAsArrayBuffer(file);
      });
    } else if (ext === "docx") {
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = async () => {
          const result = await mammoth.extractRawText({ arrayBuffer: reader.result as ArrayBuffer });
          resolve(result.value);
        };
        reader.readAsArrayBuffer(file);
      });
    } else if (ext === "txt" || ext === "md") {
      return file.text();
    }
    return Promise.resolve("");
  };

  const saveChatLog = async (messagesToSave: Message[]) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "botLogs", user.uid, "logs"), {
        messages: messagesToSave,
        botId,
        timestamp: Timestamp.now(),
      });
    } catch (err) {
      console.error("❌ Failed to save chat log:", err);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !config || limitReached) return;

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
            { role: "system", content: config.prompt },
            ...newMessages.slice(-6),
          ],
          temperature: 0.7,
          max_tokens: 400,
        }),
      });

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "(No response)";
      const fullMessages: Message[] = [...newMessages, { role: "assistant", content: reply }];
      setMessages(fullMessages);
      await updateUsage();
      await saveChatLog(fullMessages);
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "⚠️ API error." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLog = (logMessages: Message[]) => {
    setMessages(logMessages);
  };

  const startNewChat = () => {
    if (!config) return;
    setMessages([
      {
        role: "assistant",
        content: `Hi! I'm ${config.name}. Ask me anything about your business.`,
      },
    ]);
  };

  const clearChatHistory = async () => {
    if (!user) return;
    try {
      const logsRef = collection(db, "botLogs", user.uid, "logs");
      const q = query(logsRef, where("botId", "==", botId));
      const snapshot = await getDocs(q);
      const deletes = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
      await Promise.all(deletes);
      startNewChat();
    } catch (err) {
      console.error("❌ Failed to clear chat history:", err);
    }
  };

  if (!user) return <p>Please log in to use this bot.</p>;
  if (permissionError) {
    return (
      <p className="text-red-600 font-medium">
        ❌ You don’t have permission to access this bot. Contact the site owner for access.
      </p>
    );
  }
  if (!config) return <p>Loading bot configuration...</p>;
  if (limitReached) {
    return (
      <p className="text-red-600">
        You've hit the 50-message daily limit for this bot.
      </p>
    );
  }

  return (
    <div className="flex flex-col md:flex-row">
      <div className="md:w-1/4 w-full border-b md:border-b-0 md:border-r">
        <ChatLogSidebar botId={botId} onSelect={handleSelectLog} />
      </div>

      <div className="flex-1 p-4">
        <h2 className="text-xl font-bold mb-4">{config.name}</h2>

        <div className="mb-4">
          <button
            onClick={startNewChat}
            className="text-sm text-blue-600 underline"
          >
            Start New Chat
          </button>

          <button
            onClick={clearChatHistory}
            className="ml-4 text-sm text-red-600 underline"
          >
            Clear Chat History
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload company files (PDF, DOCX, TXT, MD):
          </label>
          <input
            type="file"
            accept=".pdf,.docx,.txt,.md"
            multiple
            onChange={(e) => setPendingFiles(Array.from(e.target.files || []))}
            className="block border rounded px-3 py-1 text-sm"
          />
          <button
            onClick={async () => {
              if (!pendingFiles.length || !user || !config) return;

              let updatedPrompt = config.prompt;
              for (const file of pendingFiles) {
                const text = await extractTextFromFile(file);
                updatedPrompt += `\n\nUploaded Content from ${file.name}:\n${text}`;
              }

              const ref = doc(db, "bots", user.uid, "bots", botId);
              await setDoc(ref, { ...config, prompt: updatedPrompt });
              setUploadMsg(`✅ Successfully uploaded and updated prompt from ${pendingFiles.length} file(s)`);
              setTimeout(() => setUploadMsg(null), 4000);
              setConfig({ ...config, prompt: updatedPrompt });
              setPendingFiles([]);
            }}
            className="mt-2 bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-700"
          >
            Upload Files
          </button>
          {uploadMsg && <p className="text-green-600 mt-2 text-sm">{uploadMsg}</p>}
        </div>

        <div className="border p-4 h-[60vh] overflow-y-auto bg-gray-50 rounded mb-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`mb-2 ${m.role === "user" ? "text-right" : "text-left"}`}
            >
              <span
                className={`inline-block px-3 py-2 rounded ${
                  m.role === "assistant" ? "bg-white border" : "bg-blue-100"
                }`}
              >
                {m.content}
              </span>
            </div>
          ))}
          {loading && <p className="italic">Bot is typing…</p>}
        </div>

        <div className="flex">
          <input
            className="flex-1 border px-3 py-2 rounded-l focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask a question..."
          />
          <button
            onClick={handleSend}
            className="bg-primary text-offwhite px-4 py-2 rounded-r hover:bg-neon disabled:opacity-50"
            disabled={loading || limitReached}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
