// src/components/ChatSelector.jsx
import React, { useState } from "react";
import bots from "../data/bots"; // ✅ FIXED: default import
import ChatBot from "../ChatBot";
import AppointmentBot from "./bots/AppointmentBot";
import RealEstateBot from "./bots/RealEstateBot";
import LexBot from "./bots/LexBot";

export default function ChatSelector() {
  const [active, setActive] = useState(bots[0]);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {/* bot buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {bots.map((b) => (
          <button
            key={b.key}
            className={`py-2 px-4 rounded-lg font-semibold transition ${
              b.key === active.key
                ? "bg-red-600 text-white shadow-glow"
                : "bg-offwhite text-red-600 hover:bg-red-50"
            }`}
            onClick={() => setActive(b)}
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* bot router */}
      {active.key === "appointment" && <AppointmentBot />}
      {active.key === "realestate" && <RealEstateBot />} {/* ✅ match .key in bots.js */}
      {active.key === "legal" && <LexBot />}
      {["appointment", "realestate", "legal"].includes(active.key) === false && (
        <ChatBot
          botName={active.name}
          prompt={active.prompt}
          endpoint={active.endpoint}
          apiKey={active.apiKey}
        />
      )}
    </div>
  );
}
