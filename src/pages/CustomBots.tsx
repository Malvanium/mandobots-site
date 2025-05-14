import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { CustomBotRenderer } from "../components/CustomBotRenderer";

interface BotMeta {
  id: string;
  name: string;
  embedUrl?: string;
}

export default function CustomBots() {
  const [user] = useAuthState(auth);
  const [bots, setBots] = useState<BotMeta[]>([]);

  useEffect(() => {
    if (!user) {
      console.log("⚠️ User not authenticated yet");
      return;
    }

    console.log("✅ Logged in as UID:", user.uid);

    const loadBots = async () => {
      try {
        const ref = doc(db, "customBots", user.uid); // ✅ Valid document path
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          console.log("📄 Retrieved customBots doc:", data);

          const assignedBots = data?.bots || {};
          const filtered = Object.keys(assignedBots).filter(
            (key) => assignedBots[key] === true
          );

          const formatted: BotMeta[] = filtered.map((id) => ({
            id,
            name: "Business Bot", // You can later expand to support multiple bot metadata
          }));

          setBots(formatted);
        } else {
          console.warn("📭 customBots document does not exist for UID:", user.uid);
          setBots([]);
        }
      } catch (error) {
        console.error("🔥 Firestore read error:", error);
        setBots([]);
      }
    };

    loadBots();
  }, [user]);

  if (!user)
    return <p className="p-6 text-gray-700">Please log in to view your custom bots.</p>;

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-3xl font-bold mb-4">Your Custom Bots</h2>

      {bots.length === 0 ? (
        <p className="text-gray-600">This is where your custom bots will be deployed.</p>
      ) : (
        bots.map((bot) => (
          <div
            key={bot.id}
            className="border border-gray-300 rounded shadow p-4 bg-white"
          >
            <CustomBotRenderer botId={bot.id} />
          </div>
        ))
      )}
    </div>
  );
}
