import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  DocumentData,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatLogSidebarProps {
  botId: string;
  onSelect: (messages: Message[]) => void;
}

export const ChatLogSidebar: React.FC<ChatLogSidebarProps> = ({ botId, onSelect }) => {
  const [user] = useAuthState(auth);
  const [logs, setLogs] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchLogs = async () => {
      try {
        const ref = collection(db, "botLogs", user.uid, "logs");
        const q = query(ref, orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);

        const botLogs = snapshot.docs
          .map((doc) => doc.data())
          .filter((log) => log.botId === botId && Array.isArray(log.messages));

        setLogs(botLogs);
      } catch (err) {
        console.error("❌ Failed to load chat logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user, botId]);

  return (
    <div className="w-64 border-r bg-white p-4 overflow-y-auto">
      <h3 className="text-md font-bold mb-4">Chat Logs</h3>
      {loading && <p className="text-sm italic">Loading...</p>}
      {!loading && logs.length === 0 && (
        <p className="text-sm text-gray-500">No saved conversations.</p>
      )}
      <ul className="space-y-2">
        {logs.map((log, index) => {
          const preview = log.messages?.find((m: Message) => m.role === "user")?.content || "Unnamed";
          const ts = log.timestamp?.toDate?.().toLocaleString?.() || `Chat ${index + 1}`;
          return (
            <li
              key={index}
              onClick={() => onSelect(log.messages)}
              className="cursor-pointer text-sm hover:underline text-blue-700"
              title={ts}
            >
              {preview.slice(0, 60)}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
