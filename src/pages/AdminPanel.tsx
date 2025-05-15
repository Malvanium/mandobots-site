// AdminPanel.tsx
import React, { useEffect, useState, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  Timestamp,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { DndProvider, useDrag } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { getChatSummary } from "../utils/summarize";

interface Bot {
  id: string;
  name: string;
  embedUrl: string;
}

interface User {
  id: string;
  email: string;
  displayName: string;
}

interface Summary {
  id: string;
  summary: string;
  timestamp: Timestamp;
}

const BotCard: React.FC<{ bot: Bot }> = ({ bot }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "BOT",
    item: bot,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const ref = useRef<HTMLDivElement>(null);
  drag(ref);

  return (
    <div
      ref={ref}
      className={`p-3 border rounded bg-white shadow-sm ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <strong>{bot.name}</strong>
      <p className="text-xs text-gray-600">{bot.embedUrl}</p>
    </div>
  );
};

const AdminPanel: React.FC = () => {
  const [user] = useAuthState(auth);
  const [users, setUsers] = useState<User[]>([]);
  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [assignedBots, setAssignedBots] = useState<Bot[]>([]);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!user || user.email !== "jacksoncgruber@gmail.com") return;

    const loadUsers = async () => {
      const ref = collection(db, "users");
      const snap = await getDocs(ref);
      setUsers(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as User)));
    };

    const loadBots = async () => {
      const ref = collection(db, "availableBots");
      const snap = await getDocs(ref);
      setBots(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Bot)));
    };

    loadUsers();
    loadBots();
  }, [user]);

  useEffect(() => {
    const loadAssignedBots = async () => {
      if (!selectedUser) return;
      const ref = collection(db, "bots", selectedUser.id, "bots");
      const snap = await getDocs(ref);
      setAssignedBots(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Bot)));
    };

    const loadSummaries = async () => {
      if (!selectedUser) return;
      const ref = collection(db, "botLogs", selectedUser.id, "logs");
      const q = query(ref, where("summary", "!=", ""));
      const snap = await getDocs(q);
      const result: Summary[] = snap.docs.map((doc) => ({
        id: doc.id,
        summary: doc.data().summary,
        timestamp: doc.data().timestamp,
      }));
      setSummaries(result);
    };

    const loadLogs = async () => {
      if (!selectedUser) return;
      const ref = collection(db, "botLogs", selectedUser.id, "logs");
      const snap = await getDocs(ref);
      setLogs(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    };

    loadAssignedBots();
    loadSummaries();
    loadLogs();
  }, [selectedUser]);

  const handleAssign = async (userId: string, bot: Bot) => {
    try {
      const botConfigPath = doc(db, "bots", userId, "bots", bot.id);
      await setDoc(botConfigPath, {
        name: bot.name,
        embedUrl: bot.embedUrl,
        createdAt: Timestamp.now(),
      });

      const customBotPath = doc(db, "customBots", userId);
      const existing = await getDoc(customBotPath);
      const currentData = existing.exists() ? existing.data() : {};
      const updatedBots = { ...(currentData.bots || {}), [bot.id]: true };

      await setDoc(customBotPath, {
        ...currentData,
        bots: updatedBots,
      });

      setMessage(`✅ Assigned "${bot.name}" to ${userId}`);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("❌ Failed to assign bot:", err);
      setMessage("❌ Failed to assign bot");
    }
  };

  const handleSummarizeLog = async (log: any) => {
    if (!selectedUser) return;
    try {
      const summary = await getChatSummary(log.messages, selectedUser.id, log.botId || "unknownBot");
      const logRef = doc(db, "botLogs", selectedUser.id, "logs", log.id);
      await updateDoc(logRef, {
        summary,
        summarizedAt: Timestamp.now(),
      });
      setMessage("✅ Summary generated and saved.");
    } catch (err) {
      console.error("❌ Failed to summarize:", err);
      setMessage("❌ Failed to summarize chat log.");
    }
  };

  const handleTSXUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedUser) return;

    const text = await file.text();
    const nameMatch = text.match(/const\s+(\w+)\s*[:=]/);
    const embedMatch = text.match(/embedUrl\s*[:=]\s*['"](.+?)['"]/);

    if (!nameMatch || !embedMatch) {
      setMessage("❌ Could not parse bot TSX file.");
      return;
    }

    const name = nameMatch[1];
    const embedUrl = embedMatch[1];
    const newBot: Bot = { id: name.toLowerCase(), name, embedUrl };

    try {
      await setDoc(doc(db, "availableBots", newBot.id), newBot);
      await handleAssign(selectedUser.id, newBot);
      setBots((prev) => [...prev, newBot]);
      setMessage("✅ TSX Bot uploaded and assigned.");
    } catch (err) {
      setMessage("❌ Failed to deploy TSX bot.");
    }
  };

  const testSummarize = async () => {
    try {
      const messages = [
        { role: "user", content: "How do I book an appointment?" },
        { role: "assistant", content: "Click the 'Book Now' button and choose a time." },
      ];
      const summary = await getChatSummary(messages, "demoUser123", "faqBot");
      alert("Test Summary:\n" + summary);
    } catch (err) {
      alert("❌ Failed to generate test summary.");
      console.error(err);
    }
  };

  if (!user) return <p>Please log in.</p>;
  if (user.email !== "jacksoncgruber@gmail.com")
    return <p>Access denied. This page is admin-only.</p>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 grid grid-cols-3 gap-6">
        <div>
          <h2 className="text-xl font-bold mb-3">Users</h2>
          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u.id}
                className={`p-3 border rounded cursor-pointer hover:bg-gray-100 ${
                  selectedUser?.id === u.id ? "bg-gray-200" : ""
                }`}
                onClick={() => setSelectedUser(u)}
              >
                <h4 className="font-semibold">{u.displayName}</h4>
                <p className="text-sm text-gray-600">{u.email}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-3">Selected User</h2>
          {selectedUser ? (
            <div className="p-4 border rounded bg-white space-y-4">
              <div>
                <p><strong>Name:</strong> {selectedUser.displayName}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Assigned Bots:</h3>
                {assignedBots.length > 0 ? (
                  <ul className="space-y-2">
                    {assignedBots.map((bot) => (
                      <li key={bot.id} className="text-sm text-gray-700 border p-2 rounded">
                        ✅ {bot.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No bots assigned yet.</p>
                )}
              </div>

              <div className="mt-4 p-4 border-2 border-dashed border-primary rounded bg-gray-50 text-center">
                <p>Drop bots here to assign to {selectedUser.displayName}</p>
              </div>

              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload .tsx bot file:
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".tsx"
                  onChange={handleTSXUpload}
                  className="block w-full border px-3 py-1 text-sm"
                />
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Summarized Chat Logs</h3>
                {logs.map((log) => (
                  <div key={log.id} className="border p-2 mb-2 rounded bg-gray-100 text-sm">
                    <p className="mb-1 text-gray-700">
                      {log.summary ? (
                        <>
                          <strong>Summary:</strong> {log.summary}
                        </>
                      ) : (
                        <em>No summary yet.</em>
                      )}
                    </p>
                    <button
                      onClick={() => handleSummarizeLog(log)}
                      className="text-blue-600 underline text-xs mt-1"
                    >
                      Generate Summary
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <button
                  onClick={testSummarize}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                >
                  Run Test Summarize
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">No user selected</p>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-3">Available Bots</h2>
          <div className="space-y-3">
            {bots.map((bot) => (
              <BotCard key={bot.id} bot={bot} />
            ))}
          </div>
        </div>

        {message && (
          <div className="fixed bottom-4 left-4 bg-black text-white px-4 py-2 rounded shadow">
            {message}
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default AdminPanel;
