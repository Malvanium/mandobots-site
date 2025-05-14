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
} from "firebase/firestore";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

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

    loadAssignedBots();
  }, [selectedUser]);

  const handleAssign = async (userId: string, bot: Bot) => {
    try {
      // Assign bot config under /bots/{uid}/bots/{botId}
      const botConfigPath = doc(db, "bots", userId, "bots", bot.id);
      await setDoc(botConfigPath, {
        name: bot.name,
        embedUrl: bot.embedUrl,
        createdAt: Timestamp.now(),
      });

      // Grant frontend access under /customBots/{uid}
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
                className={`p-3 border rounded cursor-pointer hover:bg-gray-100 ${selectedUser?.id === u.id ? "bg-gray-200" : ""}`}
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
