import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
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
  const [logs, setLogs] = useState<{ messages: Message[]; timestamp?: any }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobile, setShowMobile] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchSingleLog = async () => {
      try {
        const ref = doc(db, "botLogs", user.uid, "logs", botId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          if (data.botId === botId && Array.isArray(data.messages)) {
            setLogs([{ messages: data.messages, timestamp: data.updatedAt }]);
          } else {
            setLogs([]);
          }
        } else {
          setLogs([]);
        }
      } catch (err) {
        console.error("❌ Failed to load chat log:", err);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSingleLog();
  }, [user, botId]);

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden p-2 border-b bg-gray-100 flex justify-between items-center">
        <span className="text-sm font-semibold">Chat Logs</span>
        <button
          onClick={() => setShowMobile(!showMobile)}
          className="text-blue-600 text-sm underline"
        >
          {showMobile ? "Hide" : "Show"}
        </button>
      </div>

      {/* Sidebar: Mobile = collapsible | Desktop = always visible */}
      <div
        className={`bg-white p-4 overflow-y-auto border-r md:block ${
          showMobile ? "block" : "hidden"
        } md:w-full w-full md:relative absolute z-10 md:z-0`}
      >
        <h3 className="text-md font-bold mb-4 hidden md:block">Chat Logs</h3>
        {loading && <p className="text-sm italic">Loading...</p>}
        {!loading && logs.length === 0 && (
          <p className="text-sm text-gray-500">No saved conversations.</p>
        )}
        <ul className="space-y-2">
          {logs.map((log, index) => {
            const preview =
              log.messages?.find((m: Message) => m.role === "user")?.content ||
              log.messages?.[0]?.content ||
              "Unnamed";
            const ts =
              log.timestamp?.toDate?.().toLocaleString?.() || `Chat ${index + 1}`;
            return (
              <li
                key={index}
                onClick={() => {
                  setShowMobile(false); // auto-close on mobile
                  onSelect(log.messages);
                }}
                className="cursor-pointer text-sm hover:underline text-blue-700"
                title={ts}
              >
                {preview.slice(0, 60)}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
};
