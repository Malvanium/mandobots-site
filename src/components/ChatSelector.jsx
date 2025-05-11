// src/components/ChatSelector.jsx
import React, { useState } from "react";
import bots from "../data/bots";
import ChatBot from "../ChatBot";
import AppointmentBot from "./bots/AppointmentBot";
import RealEstateBot from "./bots/RealEstateBot";
import LexBot from "./bots/LexBot";
import SegmentationBot from "./bots/SegmentationBot";

export default function ChatSelector() {
  const [active, setActive] = useState(bots[0]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h2 className="text-2xl font-bold text-center text-red-800">Choose a Bot to Demo</h2>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {bots.map((b) => (
          <div
            key={b.key}
            className={`rounded-lg p-4 border-2 transition cursor-pointer ${
              b.key === active.key
                ? "bg-red-600 text-white shadow-md border-red-700"
                : "bg-offwhite text-red-700 border-red-200 hover:bg-red-50"
            }`}
            onClick={() => setActive(b)}
          >
            <h3 className="text-lg font-bold mb-2">{b.name}</h3>
            <p className="text-sm">
              {(() => {
                switch (b.key) {
                  case "faq":
                    return "Answers questions about MandoBots services and pricing, tailored for site owners.";
                  case "appointment":
                    return "Guides users through appointment booking—great for scheduling clients.";
                  case "realestate":
                    return "Assists home buyers/sellers with listings and questions about real estate.";
                  case "legal":
                    return "Supports internal legal teams with document retrieval and workflows.";
                  case "segment":
                    return "Analyzes uploaded customer data to group users by behavior or demographics.";
                  default:
                    return "Smart assistant built for a specific use case. Try it out!";
                }
              })()}
            </p>
          </div>
        ))}
      </div>

      {/* Dynamic bot rendering */}
      {active.key === "appointment" && <AppointmentBot />}
      {active.key === "realestate" && <RealEstateBot />}
      {active.key === "legal" && <LexBot />}
      {active.key === "segment" && <SegmentationBot />}
      {["appointment", "realestate", "legal", "segment"].includes(active.key) === false && (
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
